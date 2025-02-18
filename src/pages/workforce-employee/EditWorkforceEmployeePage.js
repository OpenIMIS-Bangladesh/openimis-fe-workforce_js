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
  formatMutation,
} from "@openimis/fe-core";
import { updateWorkforceEmployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class EditWorkforceEmployeePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.workforceEmployee || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.workforceEmployee !== this.props.workforceEmployee) {
      this.setState({ stateEdited: this.props.workforceEmployee });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  updateAttribute = (key, value) => {
    this.setState((prevState) => ({
      stateEdited: {
        ...prevState.stateEdited,
        [key]: value,
      },
      isSaved: false,
    }));
  };

  save = () => {
    const { grievanceConfig, dispatch } = this.props;
    const { stateEdited } = this.state;

    const workforceEmployeeData = {
      firstNameBn: stateEdited?.firstNameBn || stateEdited.firstNameBn,
      lastNameBn: stateEdited?.lastNameBn || stateEdited.lastNameBn,
      otherName: stateEdited?.otherName || stateEdited.otherName,
      firstNameEn: stateEdited?.firstNameEn || stateEdited.firstNameEn,
      lastNameEn: stateEdited?.lastNameEn || stateEdited.lastNameEn,
      phoneNumber: stateEdited?.phoneNumber || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      gender: stateEdited?.gender?.id || stateEdited.gender.id,
      birthDate: stateEdited?.birthDate || stateEdited.birthDate,
      website: stateEdited?.website || stateEdited.website,
      employeeType: stateEdited?.employeeType || stateEdited.employeeType,
      permanentAddress:
        stateEdited?.permanentAddress || stateEdited.permanentAddress,
      presentAddress: stateEdited?.presentAddress || stateEdited.presentAddress,
      position: stateEdited?.position || stateEdited.position,
      monthlyEarning: stateEdited?.monthlyEarning || stateEdited.monthlyEarning,
      referenceSalary:
        stateEdited?.referenceSalary || stateEdited.referenceSalary,
      fatherNameBn: stateEdited?.fatherNameBn || stateEdited.fatherNameBn,
      fatherNameEn: stateEdited?.fatherNameEn || stateEdited.fatherNameEn,
      motherNameBn: stateEdited?.motherNameBn || stateEdited.motherNameBn,
      motherNameEn: stateEdited?.motherNameEn || stateEdited.motherNameEn,
      spouseNameBn: stateEdited?.spouseNameBn || stateEdited.spouseNameBn,
      spouseNameEn: stateEdited?.spouseNameEn || stateEdited.spouseNameEn,
      insuranceNumber: stateEdited?.insuranceNumber || stateEdited.insuranceNumber,
      birthCertificateNo: stateEdited?.birthCertificateNo || stateEdited.birthCertificateNo,
      passportNo: stateEdited?.passportNo || stateEdited.passportNo,
      nid: stateEdited?.nid || stateEdited.nid,
      citizenship: stateEdited?.citizenship || stateEdited.citizenship,
      privacyLaw: stateEdited?.privacyLaw || stateEdited.privacyLaw,
      maritalStatus: stateEdited?.maritalStatus || stateEdited.maritalStatus,
      presentLocation:
        stateEdited?.presentLocation || stateEdited.presentLocation,
      permanentLocation:
        stateEdited?.permanentLocation || stateEdited.permanentLocation,
      id: stateEdited.id,
    };

    dispatch(
      updateWorkforceEmployee(
        workforceEmployeeData,
        `Update Workforce Employee ${workforceEmployeeData.nameEn}`
      )
    );
    this.setState({ isSaved: true });
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;
    const isSaveDisabled = false;

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
                  <EmployeeGenderPicker
                    value={stateEdited.gender || ""}
                    label={<FormattedMessage id="workforce.employee.gender" module="workforce" />}
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
                    label="workforce.employee.other.name"
                    value={stateEdited.otherName || ""}
                    onChange={(v) => this.updateAttribute("otherName", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.position"
                    value={stateEdited.position || ""}
                    onChange={(v) => this.updateAttribute("position", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                {/*<Grid item xs={6} className={classes.item}>*/}
                {/*  <TextInput*/}
                {/*    label="workforce.employee.employee_type"*/}
                {/*    value={stateEdited.employeeType || ""}*/}
                {/*    onChange={(v) => this.updateAttribute("employeeType", v)}*/}
                {/*    readOnly={isSaved}*/}
                {/*  />*/}
                {/*</Grid>*/}
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
                    label="workforce.employee.spouse.name.en"
                    value={stateEdited.spouseNameEn || ""}
                    onChange={(v) => this.updateAttribute("spouseNameEn", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.spouse.name.bn"
                    value={stateEdited.spouseNameBn || ""}
                    onChange={(v) => this.updateAttribute("spouseNameBn", v)}
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
                    label="workforce.employee.citizenship"
                    value={stateEdited.citizenship || ""}
                    onChange={(v) => this.updateAttribute("citizenship", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.privacyLaw"
                    value={stateEdited.privacyLaw || ""}
                    onChange={(v) => this.updateAttribute("privacyLaw", v)}
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
                    label="workforce.employee.insurance_number"
                    value={stateEdited.insuranceNumber || ""}
                    onChange={(v) =>
                      this.updateAttribute("insuranceNumber", v)
                    }
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.passport_no"
                    value={stateEdited.passportNo || ""}
                    onChange={(v) => this.updateAttribute("passportNo", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.monthly_earning"
                    value={stateEdited.monthlyEarning || ""}
                    onChange={(v) => this.updateAttribute("monthlyEarning", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.reference_salary"
                    value={stateEdited.referenceSalary || ""}
                    onChange={(v) => this.updateAttribute("referenceSalary", v)}
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
                <Grid item xs={6} className={classes.item}>
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
  workforceEmployee: state.workforce.workforceEmployee,
});

export default connect(mapStateToProps)(
  withStyles(styles)(EditWorkforceEmployeePage)
);
