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
import { number } from "prop-types";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import CompanyPicker from "../../pickers/CompanyPicker";
import OfficePicker from "../../pickers/OfficePicker";
import FactoryPicker from "../../pickers/FactoryPicker";

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
      nameBn: stateEdited?.titleBn || stateEdited.nameBn,
      nameEn: stateEdited?.title || stateEdited.nameEn,
      phoneNumber: stateEdited?.phone || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      gender: stateEdited?.gender || stateEdited.gender,
      company: stateEdited?.company.id || stateEdited.company.id,
      office: stateEdited?.office.id || stateEdited.office.id,
      factory: stateEdited?.factory.id || stateEdited.factory.id,
      birthDate: stateEdited?.birthDate || stateEdited.birthDate,
      website: stateEdited?.website || stateEdited.website,
      permanentAddress:
        stateEdited?.permanentAddress || stateEdited.permanentAddress,
      presentAddress:
        stateEdited?.presentAddress || stateEdited?.presentAddress,
      position: stateEdited?.position || stateEdited?.position,
      monthlyEarning:
        stateEdited?.monthlyEarning || stateEdited?.monthlyEarning,
      referenceSalary:
        stateEdited?.referenceSalary || stateEdited?.referenceSalary,
      fathersName: stateEdited?.fathersName || stateEdited?.fathersName,
      mothersName: stateEdited?.mothersName || stateEdited?.mothersName,
      maritalStatus: stateEdited?.maritalStatus || stateEdited?.maritalStatus,
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
                  <CompanyPicker
                    value={stateEdited?.company?.id}
                    label={
                      <FormattedMessage
                        id="workforce.employee.workforce_employer"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.updateAttribute("company", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <OfficePicker
                    value={stateEdited?.office?.id}
                    label={
                      <FormattedMessage
                        id="workforce.employee.workforce_office"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.updateAttribute("office", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <FactoryPicker
                    value={stateEdited?.factory?.id}
                    label={
                      <FormattedMessage
                        id="workforce.employee.workforce_factory"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.updateAttribute("factory", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <EmployeeGenderPicker
                    value={stateEdited?.gender?.id}
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
                  <TextInput
                    label="workforce.employee.name.en"
                    value={stateEdited.title || ""}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.name.bn"
                    value={stateEdited.titleBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
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
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.employee_type"
                    value={stateEdited.employeeType || ""}
                    onChange={(v) => this.updateAttribute("employeeType", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name"
                    value={stateEdited.fathersName || ""}
                    onChange={(v) => this.updateAttribute("fathersName", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name"
                    value={stateEdited.mothersName || ""}
                    onChange={(v) => this.updateAttribute("mothersName", v)}
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
                <Grid item xs={6} className={classes.item}>
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
                <Grid item xs={6} className={classes.item}>
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
