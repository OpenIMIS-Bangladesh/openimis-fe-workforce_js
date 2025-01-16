import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Box,
  Button,
  TextField,
} from "@material-ui/core";
import { withTheme, withStyles, makeStyles } from "@material-ui/core/styles";
import {
  withModulesManager,
  Contributions,
  ControlledField,
  TextInput,
  PublishedComponent,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { YoutubeSearchedFor as ResetFilterIcon, Search as DefaultSearchIcon } from "@material-ui/icons";
import { fetchEmployeeDesignation } from "../../actions";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: {
    ...theme.table.title,
    padding: theme.spacing(0.5,1), // Reduced vertical padding
  },
  headerButton:{
    ...theme.table.title,
    padding: theme.spacing(0), 
    textAlign:'right'
  },
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
  largeButton: {
    fontSize: "1rem", // Larger font size for buttons
    // padding: theme.spacing(1.5), // Larger padding for buttons
  },
}));

const EmployeeDesignationSearcher = ({ filters, onChangeFilters }) => {
  const classes = useStyles();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const handleSearch = () => {
    // Replace this with the actual query logic
    console.log("Searching with:", { email, userId });
    const params = [{email:"mahmud@tappware.com"}, {designations_Status:"active"}]
    fetchEmployeeDesignation()
    // Example: Call a GraphQL query or API endpoint
  };

  const handleReset = () => {
    setEmail("");
    setUserId("");
    console.log("Filters reset");
  };

  return (
    <div className={classes.page}>
      <Grid container className={classes.form}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.tableTitle} alignItems="center">
              <Grid item xs={9}>
                <Typography variant="h5" fontWeight="bold">
                  Employee Designation
                </Typography>
              </Grid>
              <Grid item xs={2} className={classes.headerButton}>
                <Button
                  size="large"
                  className={classes.largeButton}
                  onClick={handleReset}
                  startIcon={<ResetFilterIcon />}
                >
                  Reset Filters
                </Button>
              </Grid>
              <Grid item xs={1} className={classes.tableTitle}>
                <Button
                  size="large"
                  className={classes.largeButton}
                  onClick={handleSearch}
                  startIcon={<DefaultSearchIcon />}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
            <Divider />

            <Grid container spacing={2} className={classes.item}>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="Email"
                  value={email || ""}
                  onChange={(value) => setEmail(value)}
                  required={true}
                  readOnly={false}
                  type="email"
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="User ID"
                  value={userId}
                  onChange={(value) => setUserId(value)}
                  required={true}
                  readOnly={false}
                  type="number"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

// export default EmployeeDesignationSearcher
export default withModulesManager(
  withTheme(withStyles(styles)(EmployeeDesignationSearcher))
);
