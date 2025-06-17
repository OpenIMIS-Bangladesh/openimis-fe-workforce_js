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
import { withTheme, withStyles, makeStyles } from "@material-ui/core/styles";
import {
  PublishedComponent,
  FormattedMessage,
  withModulesManager,
  decodeId
} from "@openimis/fe-core";
import OrganizationUnitPicker from "../../pickers/OrganizationUnitPicker";
import { useDispatch } from "react-redux";
import { updateWorkforceEmployeeAssignDesignation, updateWorkforceOrganizationEmployeeDesignation } from "../../actions";
import { WORKFORCE_STATUS } from "../../constants";

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
    color: theme.palette.error.main,
  },
}));

const WorkforceEmployeeDesignaitonInfo = ({
  userData,
  workforceEmployeeDesignation,
  onReleaseDateChange, 
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [releaseDate, setReleaseDate] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [releaseReason, setReleaseReason] = useState()

  useEffect(() => {
    // Assign data only when workforceEmployeeDesignation changes
    if (workforceEmployeeDesignation) {
      setTableData(workforceEmployeeDesignation);
    }
  }, [workforceEmployeeDesignation]);

  const handleRelease = (row) => {
    const updateReleaseDate = {
      id:decodeId(row.id),
      resignatioDate: releaseDate,
      workforceEmployeeId: workforceEmployeeDesignation?.id,
      workforceCompany:row?.workforceCompany?.id,
      resignatioReason:releaseReason,
      status: "inactive",
    };
    dispatch(updateWorkforceEmployeeAssignDesignation(updateReleaseDate, `updated Organization Employee designation`));

    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === row.id ? { ...item, status: "inactive" } : item
      )
    );

    onReleaseDateChange(releaseDate);
  };

  console.log({ releaseDate });
  return (
    <Paper className={classes.paper}>
      <Grid container spacing={0} className={classes.root}>
        {/* Employee Info Section */}
        {userData && userData.name && (
          <>
            <Grid item xs={4}>
              <Paper className={classes.userCard}>
                <Typography className={classes.tableHeader}>
                  Employee Info
                </Typography>
                <Paper className={classes.userCard2}>
                  <Typography>Name: {userData.name}</Typography>
                  <Typography>Email: {userData.email}</Typography>
                  <Typography>Phone: {userData.phone}</Typography>
                  <Typography>NID: {userData.nid}</Typography>
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={8}>
              <Paper className={classes.paper}>
                <TableContainer>
                  <Table size={"small"}>
                    <TableHead className={classes.tableHeader}>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell>Factory</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell>Release Date</TableCell>
                        <TableCell>Release Reason</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((row, index) => (
                        row?.status === WORKFORCE_STATUS.ACTIVE && (
                          <TableRow key={index}>
                          <TableCell>
                            {row?.workforceCompany?.nameBn}
                          </TableCell>
                          <TableCell>
                            {row?.workforceFactory?.nameBn}
                          </TableCell>
                          <TableCell>{row?.position}</TableCell>
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
                            <TextInput
                                key={unit?.id}
                                label="Assign Designation"
                                value={position[unit?.id] || ""}
                                onChange={(v)=>setReleaseReason(v)}
                                required
                                readOnly={false}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              className={classes.deleteButton}
                              onClick={() => handleRelease(row)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};

// export default WorkforceEmployeeDesignaitonInfo;
export default withModulesManager(withTheme(WorkforceEmployeeDesignaitonInfo));
