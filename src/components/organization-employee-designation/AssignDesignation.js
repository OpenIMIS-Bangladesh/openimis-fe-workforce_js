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

const AssignDesignation = ({ userData, tableData }) => {
  const classes = useStyles();
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
    </Paper>
  );
};

// export default AssignDesignation;
export default withModulesManager(withTheme(AssignDesignation));
