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
import CompanyPicker from "../../pickers/CompanyPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import EmployeeInjuryTypePicker from "../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker from "../../pickers/EmployeeAccidentTypePicker";
import EmployeeDutyStatusPicker from "../../pickers/EmployeeDutyStatusPicker";
import BanksPicker from "../../pickers/BanksPicker";
import BranchPicker from "../../pickers/BranchPicker";
import EmployeeInsideOutsideFactoryPicker from "../../pickers/EmployeeInsideOutsideFactoryPicker";
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

class ViewApplicationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.application.workforceEmployee || {},
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
    const {
      stateEdited,
      isSaved,
      parseAccidentInfo,
      parseBankInfo,
      parseDependentInfo,
    } = this.state;
    const isSaveDisabled = false;

    const AccidentInfo = JSON.parse(parseAccidentInfo);
    const BankInfo = JSON.parse(parseBankInfo);
    const DependentInfo = JSON.parse(parseDependentInfo);

    console.log({ stateEdited });
    console.log({ AccidentInfo });
    console.log({ BankInfo });
    console.log({ DependentInfo });

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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.nid"
                    value={stateEdited.nid || ""}
                    onChange={(v) => this.updateAttribute("nid", v)}
                    type={"number"}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.birthdate"}
                    value={stateEdited.birthDate || ""}
                    onChange={(v) => this.updateAttribute("birthDate", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.monthly_earning"
                    value={stateEdited.monthlyEarning || ""}
                    onChange={(v) => this.updateAttribute("monthlyEarning", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.joindate"}
                    value={stateEdited.joinDate || ""}
                    onChange={(v) => this.updateAttribute("joinDate", v)}
                    readOnly={true}
                  />
                </Grid>

                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.first.name.en"
                    value={stateEdited.firstNameEn || ""}
                    onChange={(v) => this.updateAttribute("firstNameEn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.first.name.bn"
                    value={stateEdited.firstNameBn || ""}
                    onChange={(v) => this.updateAttribute("firstNameBn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.last.name.en"
                    value={stateEdited.lastNameEn || ""}
                    onChange={(v) => this.updateAttribute("lastNameEn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.last.name.bn"
                    value={stateEdited.lastNameBn || ""}
                    onChange={(v) => this.updateAttribute("lastNameBn", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.other.name"
                    value={stateEdited.otherName || ""}
                    onChange={(v) => this.updateAttribute("otherName", v)}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.fathers_name.en"
                    value={stateEdited.fatherNameEn || ""}
                    onChange={(v) => this.updateAttribute("fatherNameEn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.fathers_name.bn"
                    value={stateEdited.fatherNameBn || ""}
                    onChange={(v) => this.updateAttribute("fatherNameBn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.mothers_name.en"
                    value={stateEdited.motherNameEn || ""}
                    onChange={(v) => this.updateAttribute("motherNameEn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.mothers_name.bn"
                    value={stateEdited.motherNameBn || ""}
                    onChange={(v) => this.updateAttribute("motherNameBn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.spouse.name.en"
                    value={stateEdited.spouseNameEn || ""}
                    onChange={(v) => this.updateAttribute("spouseNameEn", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.spouse.name.bn"
                    value={stateEdited.spouseNameBn || ""}
                    onChange={(v) => this.updateAttribute("spouseNameBn", v)}
                    readOnly={true}
                  />
                </Grid>

                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phoneNumber", v)}
                    type={"number"}
                    readOnly={true}
                  />
                </Grid>

                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={true}
                  />
                </Grid>

                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.citizenship"
                    value={stateEdited.citizenship || ""}
                    onChange={(v) => this.updateAttribute("citizenship", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.privacyLaw"
                    value={stateEdited.privacyLaw || ""}
                    onChange={(v) => this.updateAttribute("privacyLaw", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.marital_status"
                    value={stateEdited.maritalStatus || ""}
                    onChange={(v) => this.updateAttribute("maritalStatus", v)}
                    readOnly={true}
                  />
                </Grid>

                <Grid
                  item
                  xs={6}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.present_address"
                    value={stateEdited.presentAddress || ""}
                    onChange={(v) => this.updateAttribute("presentAddress", v)}
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.permanent_address"
                    value={stateEdited.permanentAddress || ""}
                    onChange={(v) =>
                      this.updateAttribute("permanentAddress", v)
                    }
                    readOnly={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
                <Grid
                  item
                  xs={12}
                  className={clsx(classes.item, classes.overrideReadOnly)}
                >
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
              {AccidentInfo && (
                <Paper className={classes.paper}>
                  <Grid container className={classes.tableTitle}>
                    <Grid item xs={12} className={classes.tableTitle}>
                      <Typography>
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="Workforce Accident info"
                          values={{ label: EMPTY_STRING }}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider />
                  <Grid container className={classes.item}>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <EmployeeInjuryTypePicker
                        value={AccidentInfo.injuryType || ""}
                        label={
                          <FormattedMessage
                            id="workforce.employee.accident.info.injuryType"
                            module="workforce"
                          />
                        }
                        required
                        onChange={(v) => this.updateAttribute("injuryType", v)}
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <PublishedComponent
                        pubRef="core.DatePicker"
                        label={
                          "workforce.employee.accident.info.dateOfAccident"
                        }
                        value={AccidentInfo.accidentDate || ""}
                        onChange={(v) =>
                          this.updateAttribute("accidentDate", v)
                        }
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <PublishedComponent
                        pubRef="core.DatePicker"
                        label={
                          "workforce.employee.accident.info.timeOfAccident"
                        }
                        value={AccidentInfo.accidentTime || ""}
                        onChange={(v) =>
                          this.updateAttribute("accidentTime", v)
                        }
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <EmployeeAccidentTypePicker
                        value={AccidentInfo.accidentType || ""}
                        label={
                          <FormattedMessage
                            id="workforce.employee.accident.info.typeOfAccident"
                            module="workforce"
                          />
                        }
                        required
                        onChange={(v) =>
                          this.updateAttribute("accidentType", v)
                        }
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <EmployeeDutyStatusPicker
                        value={AccidentInfo.dutyStatus || ""}
                        label={
                          <FormattedMessage
                            id="workforce.employee.accident.info.dutyStatus"
                            module="workforce"
                          />
                        }
                        required
                        onChange={(v) => this.updateAttribute("dutyStatus", v)}
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <EmployeeInsideOutsideFactoryPicker
                        value={AccidentInfo.inOutsideFactory || ""}
                        label={
                          <FormattedMessage
                            id="workforce.employee.accident.info.insideOutsideFactory"
                            module="workforce"
                          />
                        }
                        required
                        onChange={(v) =>
                          this.updateAttribute("inOutsideFactory", v)
                        }
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <PublishedComponent
                        pubRef="core.DatePicker"
                        label={"workforce.employee.accident.info.reJoiningDate"}
                        value={AccidentInfo.reJoiningDate || ""}
                        onChange={(v) =>
                          this.updateAttribute("reJoiningDate", v)
                        }
                        readOnly={true}
                      />
                    </Grid>
                  </Grid>
                  <Divider />
                </Paper>
              )}

              {BankInfo && (
                <Paper className={classes.paper}>
                  <Grid container className={classes.tableTitle}>
                    <Grid item xs={12} className={classes.tableTitle}>
                      <Typography>
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="Workforce Account info"
                          values={{ label: EMPTY_STRING }}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider />
                  <Grid container className={classes.item}>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <BanksPicker
                        value={BankInfo.bank || ""}
                        label={
                          <FormattedMessage
                            id="workforce.employee.account.info.bankName"
                            module="workforce"
                          />
                        }
                        required
                        onChange={(v) => this.updateAttribute("bank", v)}
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <BranchPicker
                        value={stateEdited.branch || ""}
                        label={
                          <FormattedMessage
                            id="workforce.employee.account.info.branchName"
                            module="workforce"
                          />
                        }
                        required
                        onChange={(v) => this.updateAttribute("bank", v)}
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.accountHolderName"
                        value={BankInfo.accountHolderName || ""}
                        onChange={(v) =>
                          this.updateAttribute("accountHolderName", v)
                        }
                        required
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.routingNumber"
                        value={BankInfo.routingNumber || ""}
                        onChange={(v) =>
                          this.updateAttribute("routingNumber", v)
                        }
                        required
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.accountNumber"
                        value={BankInfo.accountNumber || ""}
                        onChange={(v) =>
                          this.updateAttribute("accountNumber", v)
                        }
                        required
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.status"
                        value={BankInfo.status || ""}
                        onChange={(v) => this.updateAttribute("status", v)}
                        required
                        readOnly={true}
                      />
                    </Grid>
                  </Grid>
                  <Divider />
                </Paper>
              )}

              {DependentInfo.length > 0 &&
                DependentInfo.map((item) => (
                  <Paper className={classes.paper}>
                    <Grid container className={classes.tableTitle}>
                      <Grid item xs={12} className={classes.tableTitle}>
                        <Typography>
                          <FormattedMessage
                            module={MODULE_NAME}
                            id="Workforce Dependent info"
                            values={{ label: EMPTY_STRING }}
                          />
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                    <Grid container className={classes.item}>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.nid"
                          value={item.nid || ""}
                          onChange={(v) => this.updateAttribute("nid", v)}
                          type={"number"}
                          required
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <PublishedComponent
                          pubRef="core.DatePicker"
                          label={"workforce.employee.birthdate"}
                          value={item.birthDate || ""}
                          onChange={(v) => this.updateAttribute("birthDate", v)}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <EmployeeLifeStatusPicker
                          value={item.lifeStatus || ""}
                          label={
                            <FormattedMessage
                              id="workforce.employee.lifeStatus"
                              module="workforce"
                            />
                          }
                          required
                          onChange={(v) =>
                            this.updateAttribute("lifeStatus", v)
                          }
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <PublishedComponent
                          pubRef="core.DatePicker"
                          label={"workforce.employee.deathdate"}
                          value={item.deathDate || ""}
                          readOnly={
                            stateEdited.lifeStatus === "Deceased" ? false : true
                          }
                          onChange={(v) => this.updateAttribute("deathDate", v)}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <EmployeeGenderPicker
                          value={item.gender || ""}
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

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.first.name.en"
                          value={item.firstNameEn || ""}
                          onChange={(v) =>
                            this.updateAttribute("firstNameEn", v)
                          }
                          required
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.first.name.bn"
                          value={item.firstNameBn || ""}
                          onChange={(v) =>
                            this.updateAttribute("firstNameBn", v)
                          }
                          required
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.last.name.en"
                          value={item.lastNameEn || ""}
                          onChange={(v) =>
                            this.updateAttribute("lastNameEn", v)
                          }
                          required
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.last.name.bn"
                          value={item.lastNameBn || ""}
                          onChange={(v) =>
                            this.updateAttribute("lastNameBn", v)
                          }
                          required
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.fathers_name.en"
                          value={item.fatherNameEn || ""}
                          onChange={(v) =>
                            this.updateAttribute("fatherNameEn", v)
                          }
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.fathers_name.bn"
                          value={item.fatherNameBn || ""}
                          onChange={(v) =>
                            this.updateAttribute("fatherNameBn", v)
                          }
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.mothers_name.en"
                          value={item.motherNameEn || ""}
                          onChange={(v) =>
                            this.updateAttribute("motherNameEn", v)
                          }
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.mothers_name.bn"
                          value={item.motherNameBn || ""}
                          onChange={(v) =>
                            this.updateAttribute("motherNameBn", v)
                          }
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.phone"
                          value={item.phoneNumber || ""}
                          onChange={(v) =>
                            this.updateAttribute("phoneNumber", v)
                          }
                          type={"number"}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.email"
                          value={item.email || ""}
                          onChange={(v) => this.updateAttribute("email", v)}
                          type={"email"}
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.occupation"
                          value={item.occupation || ""}
                          onChange={(v) =>
                            this.updateAttribute("occupation", v)
                          }
                          type={"email"}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.birth_certificate_no"
                          value={item.birthCertificateNo || ""}
                          onChange={(v) =>
                            this.updateAttribute("birthCertificateNo", v)
                          }
                          type={"number"}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.marital_status"
                          value={item.maritalStatus || ""}
                          onChange={(v) =>
                            this.updateAttribute("maritalStatus", v)
                          }
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.present_address"
                          value={item.presentAddress || ""}
                          onChange={(v) =>
                            this.updateAttribute("presentAddress", v)
                          }
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.item}>
                        <TextInput
                          label="workforce.employee.permanent_address"
                          value={item.permanentAddress || ""}
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
                          value={item.presentLocation || null}
                          onChange={(presentLocation) =>
                            this.updateAttribute(
                              "presentLocation",
                              presentLocation
                            )
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
                          value={item.permanentLocation || null}
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
                ))}
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
  withStyles(styles)(ViewApplicationPage)
);
