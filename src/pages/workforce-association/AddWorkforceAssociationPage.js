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
  decodeId,
} from "@openimis/fe-core";
import { createWorkforceEmployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";


const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddWorkforceAssociationPage extends Component {
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

  toggleSecondaryCalendar = () => {
    const isSecondaryCalendarEnabled = true;
    const { dispatch } = this.props;
    dispatch({ type: "CORE_CALENDAR_TYPE_TOGGLE", payload: { isSecondaryCalendarEnabled } });
  };
  componentDidMount() {
    // this.toggleSecondaryCalendar()
  }

  save = async () => {
    const { stateEdited } = this.state;
    const { dispatch } = this.props;

    const workforceEmployeeData = {
      // company: stateEdited?.company.id || stateEdited.company.id,
      factory: decodeId(stateEdited?.factory.id) || decodeId(stateEdited.factory.id),
      firstNameBn: stateEdited?.firstNameBn || stateEdited.firstNameBn,
      lastNameBn: stateEdited?.lastNameBn || stateEdited.lastNameBn,
      otherName: stateEdited?.otherName || stateEdited.otherName,
      firstNameEn: stateEdited?.firstNameEn || stateEdited.firstNameEn,
      lastNameEn: stateEdited?.lastNameEn || stateEdited.lastNameEn,
      phoneNumber: stateEdited?.phoneNumber || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      gender: stateEdited?.gender.id || stateEdited.gender.id,
      birthDate: stateEdited?.birthDate || stateEdited.birthDate,
      joinDate: stateEdited?.joinDate || stateEdited.joinDate,
      deathDate: stateEdited?.deathDate || stateEdited.deathDate,
      employeeType: stateEdited?.employeeType || stateEdited.employeeType,
      lifeStatus: stateEdited?.lifeStatus || stateEdited.lifeStatus,
      permanentAddress:
        stateEdited?.permanentAddress || stateEdited.permanentAddress,
      presentAddress: stateEdited?.presentAddress || stateEdited.presentAddress,
      position: stateEdited?.position || stateEdited.position,
      monthlyEarning: stateEdited?.monthlyEarning || stateEdited.monthlyEarning,
      fatherNameBn: stateEdited?.fatherNameBn || stateEdited.fatherNameBn,
      fatherNameEn: stateEdited?.fatherNameEn || stateEdited.fatherNameEn,
      motherNameBn: stateEdited?.motherNameBn || stateEdited.motherNameBn,
      motherNameEn: stateEdited?.motherNameEn || stateEdited.motherNameEn,
      spouseNameBn: stateEdited?.spouseNameBn || stateEdited.spouseNameBn,
      spouseNameEn: stateEdited?.spouseNameEn || stateEdited.spouseNameEn,
      insuranceNumber:
        stateEdited?.insuranceNumber || stateEdited.insuranceNumber,
      birthCertificateNo:
        stateEdited?.birthCertificateNo || stateEdited.birthCertificateNo,
      passportNo: stateEdited?.passportNo || stateEdited.passportNo,
      nid: stateEdited?.nid || stateEdited.nid,
      citizenship: stateEdited?.citizenship || stateEdited.citizenship,
      privacyLaw: stateEdited?.privacyLaw || stateEdited.privacyLaw,
      maritalStatus: stateEdited?.maritalStatus || stateEdited.maritalStatus,
      presentLocation:
        stateEdited?.presentLocation || stateEdited.presentLocation,
      permanentLocation:
        stateEdited?.permanentLocation || stateEdited.permanentLocation,
      workforceEmployee: stateEdited.workforceEmployee,
    };

    console.log({ workforceEmployeeData });

    await dispatch(
      createWorkforceEmployee(
        workforceEmployeeData,
        `Created Workforce Employee ${stateEdited.title}`
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
                      id="Workforce Association"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>  
                  <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.name.en"
                    value={stateEdited.firstNameEn || ""}
                    onChange={(v) => this.updateAttribute("firstNameEn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.name.bn"
                    value={stateEdited.firstNameBn || ""}
                    onChange={(v) => this.updateAttribute("firstNameBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>   
                 <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="workforce.employee.present_address"
                    value={stateEdited.presentAddress || ""}
                    onChange={(v) => this.updateAttribute("presentAddress", v)}
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
              
                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={() => this.save()}
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

export default connect(mapStateToProps)(
  withStyles(styles)(AddWorkforceAssociationPage)
);
