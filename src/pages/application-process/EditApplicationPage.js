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
import { updateOrganizationEmployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import clsx from "clsx";


const styles = (theme) => ({
  paper: theme.paper.paper,
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
});

class EditApplicationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.application.workforceEmployee || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({ stateEdited: this.props.application });
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
    const organizationEmployeeData = {
      nameBn: stateEdited?.titleBn || stateEdited.nameBn,
      nameEn: stateEdited?.title || stateEdited.nameEn,
      phoneNumber: stateEdited?.phone || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      gender: stateEdited?.gender?.id || stateEdited.gender.id,
      birthDate: stateEdited?.birthDate || stateEdited.birthDate,
      birthCertificateNo:
        stateEdited?.birthCertificateNo || stateEdited.birthCertificateNo,
      firstJoiningDate:
        stateEdited?.firstJoiningDate || stateEdited.firstJoiningDate,
      passportNo: stateEdited?.passportNo || stateEdited.passportNo,
      address: stateEdited?.address || stateEdited.address,
      location: stateEdited?.location || stateEdited.location,
      id: stateEdited.id,
    };

    dispatch(
      updateOrganizationEmployee(
        organizationEmployeeData,
        `Update Organization Employee ${organizationEmployeeData.nameEn}`
      )
    );

    this.setState({ isSaved: false });
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
                      id="Workforce Applicant View"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.nid"
                    value={stateEdited.nid || ""}
                    onChange={(v) => this.updateAttribute("nid", v)}
                    type={"number"}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.birthdate"}
                    value={stateEdited.birthDate || ""}
                    onChange={(v) => this.updateAttribute("birthDate", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <CompanyPicker
                    value={stateEdited?.company?.id}
                    label={
                      <FormattedMessage
                        id="workforce.employee.workforce_employer"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("company", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <FactoryPicker
                    value={stateEdited?.factory?.id}
                    label={
                      <FormattedMessage
                        id="workforce.employee.workforce_factory"
                        module="workforce"
                      />
                    }
                    companyId={stateEdited?.company?.id}
                    required
                    onChange={(v) => this.updateAttribute("factory", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
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
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
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
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <EmployeeGenderPicker
                    value={stateEdited.gender || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.gender"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.updateAttribute("gender", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.monthly_earning"
                    value={stateEdited.monthlyEarning || ""}
                    onChange={(v) => this.updateAttribute("monthlyEarning", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.joindate"}
                    value={stateEdited.joinDate || ""}
                    onChange={(v) => this.updateAttribute("joinDate", v)}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.first.name.en"
                    value={stateEdited.firstNameEn || ""}
                    onChange={(v) => this.updateAttribute("firstNameEn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.first.name.bn"
                    value={stateEdited.firstNameBn || ""}
                    onChange={(v) => this.updateAttribute("firstNameBn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.last.name.en"
                    value={stateEdited.lastNameEn || ""}
                    onChange={(v) => this.updateAttribute("lastNameEn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.last.name.bn"
                    value={stateEdited.lastNameBn || ""}
                    onChange={(v) => this.updateAttribute("lastNameBn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.other.name"
                    value={stateEdited.otherName || ""}
                    onChange={(v) => this.updateAttribute("otherName", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.position"
                    value={stateEdited.position || ""}
                    onChange={(v) => this.updateAttribute("position", v)}
                    readOnly={true}
                  />
                </Grid>
                {/*<Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>*/}
                {/*  <TextInput*/}
                {/*    label="workforce.employee.employee_type"*/}
                {/*    value={stateEdited.employeeType || ""}*/}
                {/*    onChange={(v) => this.updateAttribute("employeeType", v)}*/}
                {/*    readOnly={true}*/}
                {/*  />*/}
                {/*</Grid>*/}
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.fathers_name.en"
                    value={stateEdited.fatherNameEn || ""}
                    onChange={(v) => this.updateAttribute("fatherNameEn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.fathers_name.bn"
                    value={stateEdited.fatherNameBn || ""}
                    onChange={(v) => this.updateAttribute("fatherNameBn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.mothers_name.en"
                    value={stateEdited.motherNameEn || ""}
                    onChange={(v) => this.updateAttribute("motherNameEn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.mothers_name.bn"
                    value={stateEdited.motherNameBn || ""}
                    onChange={(v) => this.updateAttribute("motherNameBn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.spouse.name.en"
                    value={stateEdited.spouseNameEn || ""}
                    onChange={(v) => this.updateAttribute("spouseNameEn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.spouse.name.bn"
                    value={stateEdited.spouseNameBn || ""}
                    onChange={(v) => this.updateAttribute("spouseNameBn", v)}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phoneNumber", v)}
                    type={"number"}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.citizenship"
                    value={stateEdited.citizenship || ""}
                    onChange={(v) => this.updateAttribute("citizenship", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.privacyLaw"
                    value={stateEdited.privacyLaw || ""}
                    onChange={(v) => this.updateAttribute("privacyLaw", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.birth_certificate_no"
                    value={stateEdited.birthCertificateNo || ""}
                    onChange={(v) =>
                      this.updateAttribute("birthCertificateNo", v)
                    }
                    type={"number"}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.insurance_number"
                    value={stateEdited.insuranceNumber || ""}
                    onChange={(v) => this.updateAttribute("insuranceNumber", v)}
                    required
                    readOnly={true}
                  />
                </Grid>

                {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.passport_no"
                    value={stateEdited.passportNo || ""}
                    onChange={(v) => this.updateAttribute("passportNo", v)}
                    type={"number"}
                    readOnly={true}
                  />
                </Grid> */}
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.marital_status"
                    value={stateEdited.maritalStatus || ""}
                    onChange={(v) => this.updateAttribute("maritalStatus", v)}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.present_address"
                    value={stateEdited.presentAddress || ""}
                    onChange={(v) => this.updateAttribute("presentAddress", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.permanent_address"
                    value={stateEdited.permanentAddress || ""}
                    onChange={(v) =>
                      this.updateAttribute("permanentAddress", v)
                    }
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <p>Present Location</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.presentLocation || null}
                    onChange={(presentLocation) =>
                      this.updateAttribute("presentLocation", presentLocation)
                    }
                    readOnly={true}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
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
                    readOnly={true}
                    required
                    split={true}
                  />
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
  application: state.workforce.application,
});

export default connect(mapStateToProps)(
  withStyles(styles)(EditApplicationPage)
);
