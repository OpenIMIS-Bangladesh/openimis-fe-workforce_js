import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
import { Save } from "@material-ui/icons";
import {
  TextInput,
  journalize,
  PublishedComponent,
  FormattedMessage,
} from "@openimis/fe-core";

import {
  EMPTY_STRING,
  MODULE_NAME,
  WORKFORCE_STATUS,
} from "../../../constants";
import { withStyles } from "@material-ui/core/styles";
import { createEmployeeDependent } from "../../../actions";
import EmployeeGenderPicker from "../../../pickers/EmployeeGenderPicker";
import CompanyPicker from "../../../pickers/CompanyPicker";
import FactoryPicker from "../../../pickers/FactoryPicker";
import EmployeeLifeStatusPicker from "../../../pickers/EmployeeLifeStatusPicker";
import EmployeeMaritalStatusPicker from "../../../pickers/EmployeeMaritalStatusPicker";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddServicesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { submittingMutation, mutation, dispatch } = this.props;
    if (
      !submittingMutation &&
      prevProps.submittingMutation !== submittingMutation
    ) {
      dispatch(journalize(mutation));
    }
  }

  save = () => {
    const { grievanceConfig, dispatch } = this.props;
    const { stateEdited } = this.state;

    const employeeDependentData = {
      firstNameBn: stateEdited?.firstNameBn || stateEdited.firstNameBn,
      lastNameBn: stateEdited?.lastNameBn || stateEdited.lastNameBn,
      firstNameEn: stateEdited?.firstNameEn || stateEdited.firstNameEn,
      lastNameEn: stateEdited?.lastNameEn || stateEdited.lastNameEn,
      phoneNumber: stateEdited?.phoneNumber || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      gender: stateEdited?.gender?.id || stateEdited.gender.id,
      birthDate: stateEdited?.birthDate || stateEdited.birthDate,
      deathDate: stateEdited?.deathDate || stateEdited.deathDate,
      lifeStatus: stateEdited?.lifeStatus || stateEdited.lifeStatus,
      permanentAddress:
        stateEdited?.permanentAddress || stateEdited.permanentAddress,
      presentAddress: stateEdited?.presentAddress || stateEdited.presentAddress,
      monthlyEarning: stateEdited?.monthlyEarning || stateEdited.monthlyEarning,
      fatherNameBn: stateEdited?.fatherNameBn || stateEdited.fatherNameBn,
      fatherNameEn: stateEdited?.fatherNameEn || stateEdited.fatherNameEn,
      motherNameBn: stateEdited?.motherNameBn || stateEdited.motherNameBn,
      motherNameEn: stateEdited?.motherNameEn || stateEdited.motherNameEn,
      insuranceNumber:
        stateEdited?.insuranceNumber || stateEdited.insuranceNumber,
      birthCertificateNo:
        stateEdited?.birthCertificateNo || stateEdited.birthCertificateNo,
      nid: stateEdited?.nid || stateEdited.nid,
      maritalStatus: stateEdited?.maritalStatus || stateEdited.maritalStatus,
      occupation: stateEdited?.occupation || stateEdited.occupation,
      presentLocation:
        stateEdited?.presentLocation || stateEdited.presentLocation,
      permanentLocation:
        stateEdited?.permanentLocation || stateEdited.permanentLocation,
      relationType: "dependent",
      relationWithWorker: "Wife",
      id: stateEdited.id,
    };

    dispatch(
      updateEmployeeDependent(
        employeeDependentData,
        `Update Workforce Employee ${employeeDependentData.nameEn}`
      )
    );

    this.setState({ isSaved: true });
  };

  updateAttribute = (key, value) => {
    this.setState((prevState) => ({
      stateEdited: {
        ...prevState.stateEdited,
        [key]: value,
      },
      isSaved: false,
    }));
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;
    const isSaveDisabled = false;

    console.log({ stateEdited });
    return (
      <div className={classes.page}>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage
                      module={MODULE_NAME}
                      id="Employee Service"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  {/* <TextInput
                    label="workforce.employee.services.employee.id"
                    value={stateEdited.employeeId || ""}
                    onChange={(v) => this.updateAttribute("employeeId", v)}
                    type={"number"}
                    required
                    readOnly={isSaved}
                  /> */}
                  <FactoryPicker
                    value={stateEdited?.factory?.id}
                    label={
                      <FormattedMessage
                        id="workforce.employee.workforce_factory"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("factory", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <CompanyPicker
                    value={stateEdited?.company?.id}
                    label={
                      <FormattedMessage
                        id="workforce.employee.services.company.name"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("company", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.services.employee.name"
                    value={stateEdited.employeeName || ""}
                    onChange={(v) => this.updateAttribute("employeeName", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.position"
                    value={stateEdited.position || ""}
                    onChange={(v) => this.updateAttribute("position", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.services.join.date"}
                    value={stateEdited.joinDate || ""}
                    onChange={(v) => this.updateAttribute("joinDate", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.services.resignation.date"}
                    value={stateEdited.resignationDate || ""}
                    onChange={(v) => this.updateAttribute("resignationDate", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.services.monthly.salary"
                    value={stateEdited.salary || ""}
                    onChange={(v) => this.updateAttribute("salary", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.services.resignation.reason"
                    value={stateEdited.resignationReason || ""}
                    onChange={(v) =>
                      this.updateAttribute("resignationReason", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={this.save}
                    disabled={isSaveDisabled || isSaved}
                  >
                    <Save />
                  </IconButton>
                </Grid>
              </Grid>
              <Divider />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
});

export default connect(mapStateToProps)(withStyles(styles)(AddServicesPage));
