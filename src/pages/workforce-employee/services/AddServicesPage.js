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

import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../../constants";
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
    if (!submittingMutation && prevProps.submittingMutation !== submittingMutation) {
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

    console.log({stateEdited})
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
                      id="Workforce Employee"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.nid"
                    value={stateEdited.nid || ""}
                    onChange={(v) => this.updateAttribute("nid", v)}
                    type={"number"}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.birthdate"}
                    value={stateEdited.birthDate || ""}
                    onChange={(v) => this.updateAttribute("birthDate", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <EmployeeLifeStatusPicker
                    value={stateEdited.lifeStatus || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.lifeStatus"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("lifeStatus", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.deathdate"}
                    value={stateEdited.deathDate || ""}
                    readOnly={
                      stateEdited.lifeStatus === "Deceased" ? false : true
                    }
                    onChange={(v) => this.updateAttribute("deathDate", v)}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <EmployeeGenderPicker
                    value={stateEdited.gender || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.gender"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.updateAttribute("gender", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.first.name.en"
                    value={stateEdited.firstNameEn || ""}
                    onChange={(v) => this.updateAttribute("firstNameEn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.first.name.bn"
                    value={stateEdited.firstNameBn || ""}
                    onChange={(v) => this.updateAttribute("firstNameBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.last.name.en"
                    value={stateEdited.lastNameEn || ""}
                    onChange={(v) => this.updateAttribute("lastNameEn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.last.name.bn"
                    value={stateEdited.lastNameBn || ""}
                    onChange={(v) => this.updateAttribute("lastNameBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.en"
                    value={stateEdited.fatherNameEn || ""}
                    onChange={(v) => this.updateAttribute("fatherNameEn", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.bn"
                    value={stateEdited.fatherNameBn || ""}
                    onChange={(v) => this.updateAttribute("fatherNameBn", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.en"
                    value={stateEdited.motherNameEn || ""}
                    onChange={(v) => this.updateAttribute("motherNameEn", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.bn"
                    value={stateEdited.motherNameBn || ""}
                    onChange={(v) => this.updateAttribute("motherNameBn", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phoneNumber", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.occupation"
                    value={stateEdited.occupation || ""}
                    onChange={(v) => this.updateAttribute("occupation", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.birth_certificate_no"
                    value={stateEdited.birthCertificateNo || ""}
                    onChange={(v) =>
                      this.updateAttribute("birthCertificateNo", v)
                    }
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.marital_status"
                    value={stateEdited.maritalStatus || ""}
                    onChange={(v) => this.updateAttribute("maritalStatus", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.present_address"
                    value={stateEdited.presentAddress || ""}
                    onChange={(v) => this.updateAttribute("presentAddress", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="workforce.employee.permanent_address"
                    value={stateEdited.permanentAddress || ""}
                    onChange={(v) =>
                      this.updateAttribute("permanentAddress", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>Present Location</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.presentLocation || null}
                    onChange={(presentLocation) =>
                      this.updateAttribute("presentLocation", presentLocation)
                    }
                    readOnly={isSaved}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>Permanent Location</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.permanentLocation || null}
                    onChange={(permanentLocation) =>
                      this.updateAttribute(
                        "permanentLocation",
                        permanentLocation
                      )
                    }
                    readOnly={isSaved}
                    required
                    split={true}
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
