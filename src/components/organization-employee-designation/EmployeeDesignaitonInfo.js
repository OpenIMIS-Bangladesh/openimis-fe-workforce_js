import React from "react";
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
} from "@openimis/fe-core";
import OrganizationUnitPicker from "../../pickers/OrganizationUnitPicker";

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

const EmployeeDesignationInfo = ({ userData, tableData }) => {
  const classes = useStyles();

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
                        <TableCell>Organization</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell>Release Date</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row?.designation?.organization?.nameBn}</TableCell>
                          <TableCell>{row?.designation?.unit?.nameBn}</TableCell>
                          <TableCell>{row?.designation?.nameBn}</TableCell>
                          <TableCell>
                            <PublishedComponent
                              pubRef="core.DatePicker"
                              label={"Release Date"}
                              readOnly={false}
                              required={false}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton className={classes.deleteButton}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
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

// export default EmployeeDesignationInfo;
export default withModulesManager(withTheme(EmployeeDesignationInfo));
