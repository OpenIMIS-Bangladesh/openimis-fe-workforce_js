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
  withModulesManager
} from "@openimis/fe-core";
import OrganizationUnitPicker from "../../pickers/OrganizationUnitPicker";

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  root: {
    ...theme.paper.paper,
    padding: theme.spacing(0),
  },
  userCard: {
    ...theme.paper.paper,
    padding: theme.spacing(1),
    textAlign: "left",
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
    console.log({classes})
  return (
    <Grid container spacing={0} className={classes.root}>
      {/* Employee Info Section */}
      {userData && (
        <Grid item xs={4}>
          <Paper className={classes.userCard}>
            <Typography className={classes.tableHeader}>Employee Info</Typography>
            <br />
            <Typography>Name: {userData.name}</Typography>
            <Typography>Email: {userData.email}</Typography>
            <Typography>Phone: {userData.phone}</Typography>
            <Typography>NID: {userData.userId}</Typography>
          </Paper>
        </Grid>
      )}

      {/* Table Section */}
      {tableData && tableData.length > 0 && (
        <Grid item xs={8}>
          <Paper className={classes.paper}>
            <TableContainer>
              <Table size={'small'}>
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
                      <TableCell>{row.division}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>{row.position}</TableCell>
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
      )}

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
              required
              readOnly={false}
            />
          </Grid>
          <Grid item xs={4}>
            <OrganizationUnitPicker
              readOnly={false}
              label={
                <FormattedMessage
                  module="workforce"
                  id="workforce.organization.unit.picker"
                />
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

// export default EmployeeDesignationInfo;
export default withModulesManager(
  withTheme(EmployeeDesignationInfo)
);