import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Card,
  Button,
  Box,
} from "@material-ui/core";
import {
  TextInput,
  journalize,
  PublishedComponent,
  FormattedMessage,
} from "@openimis/fe-core";
import { updateOrganizationEmployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import PreviewDetails from "../../components/application-forms/PreviewDetails";

const styles = (theme) => ({
  // paper: theme.paper.paper,
  paper: {
    padding: theme.spacing(1),
    width: "100%",
    margin: "0 auto",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: "medium",
    fontWeight: "bold",
  },
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
  overrideReadOnly: {
    "& .Mui-disabled": {
      color: `${theme.palette.text.primary} !important`, // Ensures text remains default color
    },
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
});

class ViewApplicationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.application || {},
      workforceEmployee: props.application.workforceEmployee || {},
      parseAccidentInfo:
        JSON.parse(props.application.employeeAccidentInfo) || {},
      parseBankInfo: JSON.parse(props.application.employeeBankInfo) || {},
      parseDependentInfo:
        JSON.parse(props.application.employeeDependentInfo) || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({ workforceEmployee: this.props.application });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  // // Convert camelCase or snake_case to readable label
  // formatKey = (key) => {
  //   return key
  //     .replace(/_/g, " ")
  //     .replace(/([A-Z])/g, " $1")
  //     .replace(/^./, (str) => str.toUpperCase());
  // };

  // // Render nested objects, arrays, or primitives nicely
  // renderValue = (value) => {
  //   if (Array.isArray(value)) {
  //     return value.length === 0
  //       ? "N/A"
  //       : value.map((v, i) => (
  //           <div key={i} style={{ marginBottom: 4 }}>
  //             {typeof v === "object" ? this.renderNestedObject(v) : v}
  //           </div>
  //         ));
  //   } else if (typeof value === "object" && value !== null) {
  //     // Handle known object shape: { id, uuid, code, name, type, parent }
  //     if ("code" in value && "name" in value) {
  //       return `${value.name} (${value.code})`;
  //     }

  //     return this.renderNestedObject(value);
  //   } else {
  //     return value ?? "N/A";
  //   }
  // };

  // // Nicely print nested object key-values
  // renderNestedObject = (obj) => {
  //   return Object.entries(obj).map(([k, v], i) => (
  //     <div key={i}>
  //       <b>{this.formatKey(k)}:</b> {v || "N/A"}
  //     </div>
  //   ));
  // };

  render() {
    const { classes } = this.props;
    const {
      stateEdited,
      workforceEmployee,
      isSaved,
      parseAccidentInfo,
      parseBankInfo,
      parseDependentInfo,
    } = this.state;
    const isSaveDisabled = false;
    const AccidentInfo = parseAccidentInfo?.parseAccidentInfo;
    const BankInfo = JSON.parse(parseBankInfo);
    const DependentInfo = JSON.parse(parseDependentInfo);

    const formData = {
      ...stateEdited,
      workforceEmployee: workforceEmployee,
      employeeAccidentInfo: AccidentInfo,
      employeeBankInfo: BankInfo,
      employeeDependentInfo: DependentInfo,
    };
    console.log({ stateEdited });
    console.log({ workforceEmployee });
    console.log({ AccidentInfo });
    console.log({ BankInfo });
    console.log({ DependentInfo });

    return (
      <div className={classes.container}>
        <Box p={0} className={classes.paper}>
          {/* <Grid container spacing={1}>

          <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" className={classes.title}>
                    <b>Application Information</b>
                  </Typography>
                  <Divider style={{ margin: "10px 0" }} />
                  <Grid container spacing={2}>
                    {Object.entries(stateEdited)
                    .filter(([key]) => !["id", "employeeAccidentInfo", "workforceEmployee","employeeBankInfo","employeeDependentInfo"].includes(key))
                    .map(([key, value], idx) => (
                      <Grid item xs={6} key={idx}>
                        <Typography>
                          <b>{this.formatKey(key)}:</b>{" "}
                          {this.renderValue(value)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" className={classes.title}>
                    <b>Employee Information</b>
                  </Typography>
                  <Divider style={{ margin: "5px 0 10px" }} />
                  <Grid container spacing={2}>
                    {Object.entries(workforceEmployee)
                    .filter(([key]) => !["id", "uuid", "parent"].includes(key))
                    .map(([key, value], idx) => (
                      <Grid item xs={6} key={idx}>
                        <Typography>
                          <b>{this.formatKey(key)}:</b>{" "}
                          {this.renderValue(value)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>  
          </Grid> */}
          <PreviewDetails formData={formData} />
          <div className={classes.buttonContainer}>
            <Button  variant="outlined">
              <FormattedMessage module="workforce" id="workforce.application.reject" />
            </Button>
            <Button variant="contained" color="primary" >
              <FormattedMessage module="workforce" id="workforce.application.approve" />
              
            </Button>
          </div>
        </Box>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  application: state.workforce.application,
});

export default connect(mapStateToProps)(
  withStyles(styles)(ViewApplicationPage)
);
