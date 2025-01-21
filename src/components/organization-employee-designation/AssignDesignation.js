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
import { YoutubeSearchedFor as ResetFilterIcon, Search as DefaultSearchIcon } from "@material-ui/icons";
import AddBoxIcon from '@material-ui/icons/AddBox';
import { withTheme, withStyles, makeStyles } from "@material-ui/core/styles";
import {
  PublishedComponent,
  FormattedMessage,
  withModulesManager,
  useModulesManager,
  decodeId
} from "@openimis/fe-core";
import OrganizationUnitPicker from "../../pickers/OrganizationUnitPicker";
import { WORKFORCE_STATUS } from "../../constants";
import { fetchWorkforceUnitsWithEmployeeDesignation } from "../../actions";
import { useSelector,useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  root: {
    ...theme.paper.paper,
    padding: theme.spacing(0),
    justifyContent: "space-around",
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
    fontSize: "18px",
    fontWeight: "bold",
  },
  deleteButton: {
    color: theme.palette.success.main,
  },
}));

const AssignDesignation = ({ userData, stateEdited, updateAttribute,tableData }) => {
  const classes = useStyles();
    const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const [unitDesignation,setUnitDesignation] = useState()


  const handleAssign = async(v) =>{
    const prms = [];
    prms.push(`organization_Id: "${decodeId(v.id)}"`);
    prms.push(`orderBy:["unit_level", "unit_designations__designation_level"]`);

    await dispatch(fetchWorkforceUnitsWithEmployeeDesignation(modulesManager,prms))
    console.log({v})
  }
  const unitWiseDesignations = useSelector((state) => state.workforce[`unitWiseDesignationData`])

  


  console.log({unitWiseDesignations})
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
                onChange={(v) => handleAssign(v)}
                required
                readOnly={false}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <TableContainer>
                  <Table size={"small"}>
                    <TableHead className={classes.tableHeader}>
                      <TableRow>
                        <TableCell>Organization</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell>Release Date</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map(
                        (row, index) =>
                          row?.status === WORKFORCE_STATUS.INACTIVE && (
                            <TableRow key={index}>
                              <TableCell>
                                {row?.designation?.organization?.nameBn}
                              </TableCell>
                              <TableCell>
                                {row?.designation?.unit?.nameBn}
                              </TableCell>
                              <TableCell>{row?.designation?.nameBn}</TableCell>
                              <TableCell>
                                <PublishedComponent
                                  pubRef="core.DatePicker"
                                  label={"Release Date"}
                                  onChange={(v) => setReleaseDate(v)}
                                  readOnly={false}
                                  required={false}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  className={classes.deleteButton}
                                  onClick={() => handleRelease(row)}
                                >
                                  <AddBoxIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

// export default AssignDesignation;
export default withModulesManager(withTheme(AssignDesignation));
