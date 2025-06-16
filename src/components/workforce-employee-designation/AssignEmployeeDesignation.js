import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  YoutubeSearchedFor as ResetFilterIcon,
  Search as DefaultSearchIcon,
} from "@material-ui/icons";
import AddBoxIcon from "@material-ui/icons/AddBox";
import { withTheme, withStyles, makeStyles } from "@material-ui/core/styles";
import {
  PublishedComponent,
  FormattedMessage,
  withModulesManager,
  useModulesManager,
  decodeId,
} from "@openimis/fe-core";
import OrganizationUnitPicker from "../../pickers/OrganizationUnitPicker";
import { WORKFORCE_STATUS } from "../../constants";
import {
  fetchWorkforceEmployeeDesignation,
  fetchWorkforceUnitsWithEmployeeDesignation,
  updateWorkforceOrganizationEmployeeAssignDesignation,
} from "../../actions";
import { useSelector, useDispatch } from "react-redux";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  root: {
    ...theme.paper.paper,
    padding: theme.spacing(0),
    justifyContent: "space-around",
  },
  table: {
    borderCollapse: "collapse", // Ensure the borders look seamless
  },
  tableRow: {
    "&:hover": {
      backgroundColor: theme.palette.action.hover, // Optional: Highlight on hover
    },
    height: "40px",
    maxHeight: "20px",
    minHeight: 0,
  },
  tableCell: {
    border: "1px solid #bab5b5", // Light border for each cell
    padding: "0px 10px", // Remove all padding for maximum compactness
    lineHeight: 0.5, // Reduce line height
    fontSize: "0.8rem", // Optional: Adjust font size for better compactness
  },
  userCard: {
    ...theme.paper.paper,
    padding: theme.spacing(0),
  },
  userCard2: {
    ...theme.paper.paper,
    padding: theme.spacing(1),
    textAlign: "left",
    margin: "0px",
  },
  tableContainer: {
    padding: theme.spacing(1),
  },
  tableHeader: {
    ...theme.table.title,
    padding: theme.spacing(0.5, 1),
    fontSize: "16px", // Reduce header font size slightly
    fontWeight: "bold",
  },
  assignButton: {
    color: theme.palette.success.main,
  },
}));

const AssignEmployeeDesignation = ({
  userData,
  stateEdited,
  updateAttribute,
  tableData,
  handleSearch,
  unitWiseDesignations,
  fetchUnitWiseDesignations,
}) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const [assignDate, setAssignDate] = useState();
  const [disabledAssignButton, setDisabledAssignButton] = useState(false); // Track button disabled state
  const [formData, setFormData] = useState({
    company: null,
    factory: null,
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (key === "factory" && value?.id) {
      fetchWorkforceEmployeeDesignations(value.id);
    }
  };

  const fetchWorkforceEmployeeDesignations = async (factory) => {
    if (!factory?.id) return;
    const prms = [];
    prms.push(`workforceFactoryId: "${decodeId(factory.id)}"`);

    await dispatch(fetchWorkforceEmployeeDesignation(modulesManager, prms));
  };

  const employeeDesignationData = useSelector(
    (state) => state.workforce[`workforceEmployeeDesignation`]
  );

  useEffect(() => {
    if (formData?.factory?.id) {
      const fetchData = async () => {
        await fetchWorkforceEmployeeDesignations(formData.factory);
      };
      fetchData();
    }
  }, [formData.factory]);
  // const fetchUnitWiseDesignations = async (v) => {
  //   const prms = [];
  //   prms.push(`organization_Id: "${decodeId(v.id)}"`);
  //   prms.push(`orderBy:["unit_level", "unit_designations__designation_level"]`);

  //   await dispatch(
  //     fetchWorkforceUnitsWithEmployeeDesignation(modulesManager, prms),
  //   );
  // };
  // const unitWiseDesignations = useSelector(
  //   (state) => state.workforce[`unitWiseDesignationData`],
  // );

  const handleAssign = async (row) => {
    setDisabledAssignButton(true);

    const assignData = {
      designationId: decodeId(row.id),
      employeeId: employeeDesignationData.id,
      joiningDate: assignDate,
      status: WORKFORCE_STATUS.ACTIVE,
    };
    await dispatch(
      updateWorkforceOrganizationEmployeeAssignDesignation(
        assignData,
        `updated Organization Employee designation ${row.nameEn}`
      )
    );

    handleSearch();
  };

  console.log({ employeeDesignationData });
  console.log({ formData });

  return (
    <Paper className={classes.paper}>
      <Grid container spacing={0} className={classes.root}>
        {/* Assign Section */}
        <Grid item xs={12}>
          <Grid container className={classes.userCard} spacing={2}>
            <Grid item xs={12}>
              <Typography className={classes.tableHeader}>Assign</Typography>
            </Grid>
            <Grid item xs={4}>
              <CompanyPicker
                value={formData?.company?.id}
                label={
                  <FormattedMessage
                    id="workforce.employee.workforce_employer"
                    module="workforce"
                  />
                }
                required
                onChange={(v) => {
                  // handleChange("company", v, "employeeDesignation");
                  // fetchWorkforceEmployeeDesignation(v);
                  handleChange("company", v);
                }}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={4}>
              <FactoryPicker
                value={formData?.factory?.id}
                label={
                  <FormattedMessage
                    id="workforce.employee.workforce_factory"
                    module="workforce"
                  />
                }
                required
                companyId={formData?.company?.id}
                onChange={(v) => {
                  // handleChange("factory", v, "employeeDesignation");
                  handleChange("factory", v);
                }}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={4}>
              <PublishedComponent
                pubRef="workforceOrganization.OrganizationPicker"
                label={
                  <FormattedMessage
                    module="workforce"
                    id="workforce.organization.picker"
                  />
                }
                value={stateEdited.organization || null}
                onChange={(v) => fetchUnitWiseDesignations(v)}
                required
                readOnly={false}
              />
            </Grid>
            {employeeDesignationData?.map((unit) => (
              <Grid item xs={12} key={unit.id}>
                {/* <Paper className={classes.paper}> */}
                <TableContainer>
                  <Table size={"small"}>
                    <TableHead className={classes.tableHeader}>
                      <TableRow>
                        <TableCell colSpan={4}>
                          <b>{unit?.nameBn} Factory designation </b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow className={classes.tableRow}>
                        <TableCell className={classes.tableCell} style={{ width: "50%" }}>
                          {unit?.workforceEmployee?.email}
                        </TableCell>
                        <TableCell className={classes.tableCell} style={{ width: "30%" }}>
                          <PublishedComponent
                            pubRef="core.DatePicker"
                            label={"Assign Date"}
                            onChange={(v) => setAssignDate(v)}
                            readOnly={disabledAssignButton ? true : false}
                            required={false}
                          />
                        </TableCell>

                        <TableCell className={classes.tableCell} style={{ width: "20%" }}>
                          <IconButton
                            disabled={disabledAssignButton}
                            className={classes.assignButton}
                            onClick={() =>
                              handleAssign(unit?.workforceEmployee)
                            }
                          >
                            <AddBoxIcon />
                          </IconButton>
                        </TableCell>

                        {/* {unit?.workforceEmployee?.activeEmployeeDesignation && unit?.workforceEmployee?.activeEmployeeDesignation.length > 0 ? (
                            <TableCell
                              className={classes.tableCell}
                              colSpan={2}
                              style={{ textAlign: "center" }}
                            >
                              {unit?.workforceEmployee?.activeEmployeeDesignation[0]?.employee.nameEn} {unit?.workforceEmployee?.activeEmployeeDesignation[0]?.employee.email}
                            </TableCell>
                          ) : (
                            
                          )} */}
                      </TableRow>
                      {/* {unit?.unitDesignations.map((row, index) => (
                        <TableRow key={index} className={classes.tableRow}>
                          <TableCell className={classes.tableCell} style={{ width: "50%" }}>
                            {row?.nameEn}
                          </TableCell>

                          {row?.activeEmployeeDesignation && row?.activeEmployeeDesignation.length > 0 ? (
                            <TableCell
                              className={classes.tableCell}
                              colSpan={2}
                              style={{ textAlign: "center" }}
                            >
                              {row?.activeEmployeeDesignation[0]?.employee.nameEn} {row?.activeEmployeeDesignation[0]?.employee.email}
                            </TableCell>
                          ) : (
                            <>
                              <TableCell className={classes.tableCell} style={{ width: "30%" }}>
                                <PublishedComponent
                                  pubRef="core.DatePicker"
                                  label={"Assign Date"}
                                  onChange={(v) => setAssignDate(v)}
                                  readOnly={disabledAssignButton?true:false}
                                  required={false}
                                />
                              </TableCell>

                              <TableCell className={classes.tableCell} style={{ width: "20%" }}>
                                <IconButton
                                  disabled={disabledAssignButton}
                                  className={classes.assignButton}
                                  onClick={() => handleAssign(row)}
                                >
                                  <AddBoxIcon />
                                </IconButton>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))} */}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* </Paper> */}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

// export default AssignDesignation;
export default withModulesManager(withTheme(AssignEmployeeDesignation));
