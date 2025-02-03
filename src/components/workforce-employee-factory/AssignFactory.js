import React, { useState } from "react";
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
import { fetchWorkforceUnitsWithEmployeeDesignation, updateWorkforceOrganizationEmployeeAssignDesignation } from "../../actions";
import { useSelector, useDispatch } from "react-redux";

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
    height: "20px", // Allow rows to shrink
    maxHeight: "20px", // Allow rows to shrink
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
  deleteButton: {
    color: theme.palette.success.main,
  },
}));

const AssignFactory = ({
  userData,
  stateEdited,
  updateAttribute,
  tableData,
}) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const [assignDate, setAssignDate] = useState();

  const employeeDesignationData = useSelector(
    (state) => state.workforce[`employeeDesignationData`]
  );

  const fetchUnitWiseDesignations = async (v) => {
    const prms = [];
    prms.push(`organization_Id: "${decodeId(v.id)}"`);
    prms.push(`orderBy:["unit_level", "unit_designations__designation_level"]`);

    await dispatch(
      fetchWorkforceUnitsWithEmployeeDesignation(modulesManager, prms)
    );
    console.log({ v });
  };
  const unitWiseDesignations = useSelector(
    (state) => state.workforce[`unitWiseDesignationData`]
  );

  const handleAssign = (row) => {
    const assignData = {
      designationId: decodeId(row.id),
      employeeId: employeeDesignationData.id,
      joiningDate: assignDate,
      status: WORKFORCE_STATUS.ACTIVE,
    };
    dispatch(
      updateWorkforceOrganizationEmployeeAssignDesignation(
        assignData,
        `updated Organization Employee designation ${row.nameEn}`
      )
    );
  };

  console.log({ unitWiseDesignations });
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
            {unitWiseDesignations?.map((unit) => (
              <Grid item xs={12} key={unit.id}>
                {/* <Paper className={classes.paper}> */}
                <TableContainer>
                  <Table size={"small"}>
                    <TableHead className={classes.tableHeader}>
                      <TableRow>
                        <TableCell colSpan={4}>
                          <b>{unit.nameBn}</b>
                        </TableCell>
                        {/* <TableCell>Unit</TableCell>
                          <TableCell>Designation</TableCell>
                          <TableCell>Release Date</TableCell>
                          <TableCell></TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unit?.unitDesignations.map((row, index) => (
                        <TableRow key={index} className={classes.tableRow}>
                          {/* Name in English */}
                          <TableCell
                            className={classes.tableCell}
                            style={{ width: "50%" }}
                          >
                            {row?.nameEn}
                          </TableCell>
                          {/* Release Date Picker */}
                          <TableCell
                            className={classes.tableCell}
                            style={{ width: "30%" }}
                          >
                            <PublishedComponent
                              pubRef="core.DatePicker"
                              label={"Assign Date"}
                              onChange={(v) => setAssignDate(v)}
                              readOnly={false}
                              required={false}
                            />
                          </TableCell>
                          {/* Action Button */}
                          <TableCell
                            className={classes.tableCell}
                            style={{ width: "20%" }}
                          >
                            <IconButton
                              className={classes.deleteButton}
                              onClick={() => handleAssign(row)}
                            >
                              <AddBoxIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
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

// export default AssignFactory;
export default withModulesManager(withTheme(AssignFactory));
