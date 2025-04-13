import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
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
import CompanyPicker from "../../pickers/CompanyPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
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
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.nid"
                    value={stateEdited.nid || ""}
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
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.monthly_earning"
                    value={stateEdited.monthlyEarning || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.joindate"}
                    value={stateEdited.joinDate || ""}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.first.name.en"
                    value={stateEdited.firstNameEn || ""}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.first.name.bn"
                    value={stateEdited.firstNameBn || ""}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.last.name.en"
                    value={stateEdited.lastNameEn || ""}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.last.name.bn"
                    value={stateEdited.lastNameBn || ""}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.other.name"
                    value={stateEdited.otherName || ""}
                    required
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.position"
                    value={stateEdited.position || ""}
                    readOnly={true}
                  />
                </Grid>
                {/*<Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>*/}
                {/*  <TextInput*/}
                {/*    label="workforce.employee.employee_type"*/}
                {/*    value={stateEdited.employeeType || ""}*/}
                {/*    readOnly={true}*/}
                {/*  />*/}
                {/*</Grid>*/}
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.fathers_name.en"
                    value={stateEdited.fatherNameEn || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.fathers_name.bn"
                    value={stateEdited.fatherNameBn || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.mothers_name.en"
                    value={stateEdited.motherNameEn || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.mothers_name.bn"
                    value={stateEdited.motherNameBn || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.spouse.name.en"
                    value={stateEdited.spouseNameEn || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.spouse.name.bn"
                    value={stateEdited.spouseNameBn || ""}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.phone"
                    value={stateEdited.phoneNumber || ""}
                    type={"number"}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.email"
                    value={stateEdited.email || ""}
                    type={"email"}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.citizenship"
                    value={stateEdited.citizenship || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.privacyLaw"
                    value={stateEdited.privacyLaw || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.birth_certificate_no"
                    value={stateEdited.birthCertificateNo || ""}
                    type={"number"}
                    readOnly={true}
                  />
                </Grid>
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.insurance_number"
                    value={stateEdited.insuranceNumber || ""}
                    required
                    readOnly={true}
                  />
                </Grid>

                {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.passport_no"
                    value={stateEdited.passportNo || ""}
                    type={"number"}
                    readOnly={true}
                  />
                </Grid> */}
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.marital_status"
                    value={stateEdited.maritalStatus || ""}
                    readOnly={true}
                  />
                </Grid>

                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <TextInput
                    label="workforce.employee.present_address"
                    value={stateEdited.presentAddress || ""}
                    readOnly={true}
                  />
                </Grid>
                <Grid item
                  xs={12} className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <TextInput
                    label="workforce.employee.permanent_address"
                    value={stateEdited.permanentAddress || ""}
                    
                    readOnly={true}
                  />
                </Grid>
                <Grid item
                  xs={12} className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <p>Present Location</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.presentLocation || null}
                    readOnly={true}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item
                  xs={12} className={clsx(classes.item, classes.overrideReadOnly)}
                >
                  <p>Permanent Location</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.permanentLocation || null}
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
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <PublishedComponent
                        pubRef="core.DatePicker"
                        label={"workforce.employee.accident.info.reJoiningDate"}
                        value={AccidentInfo.reJoiningDate || ""}
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
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.accountHolderName"
                        value={BankInfo.accountHolderName || ""}
                        required
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.routingNumber"
                        value={BankInfo.routingNumber || ""}
                        required
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.accountNumber"
                        value={BankInfo.accountNumber || ""}
                        required
                        readOnly={true}
                      />
                    </Grid>
                    <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                      <TextInput
                        label="workforce.employee.account.info.status"
                        value={BankInfo.status || ""}
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
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.first.name.en"
                          value={item.firstNameEn || ""}
                          required
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.first.name.bn"
                          value={item.firstNameBn || ""}
                          required
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.last.name.en"
                          value={item.lastNameEn || ""}
                          required
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.last.name.bn"
                          value={item.lastNameBn || ""}
                          required
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.fathers_name.en"
                          value={item.fatherNameEn || ""}
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.fathers_name.bn"
                          value={item.fatherNameBn || ""}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.mothers_name.en"
                          value={item.motherNameEn || ""}
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.mothers_name.bn"
                          value={item.motherNameBn || ""}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.phone"
                          value={item.phoneNumber || ""}
                          type={"number"}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.email"
                          value={item.email || ""}
                          type={"email"}
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.occupation"
                          value={item.occupation || ""}
                          type={"email"}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.birth_certificate_no"
                          value={item.birthCertificateNo || ""}
                          type={"number"}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.marital_status"
                          value={item.maritalStatus || ""}
                          readOnly={true}
                        />
                      </Grid>

                      <Grid item xs={6}  className={clsx(classes.item, classes.overrideReadOnly)}>
                        <TextInput
                          label="workforce.employee.present_address"
                          value={item.presentAddress || ""}
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={12} className={classes.item}>
                        <TextInput
                          label="workforce.employee.permanent_address"
                          value={item.permanentAddress || ""}
                          
                          readOnly={true}
                        />
                      </Grid>
                      <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
                        <p>Present Location</p>
                        <PublishedComponent
                          pubRef="location.DetailedLocation"
                          withNull={true}
                          value={item.presentLocation || null}
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
