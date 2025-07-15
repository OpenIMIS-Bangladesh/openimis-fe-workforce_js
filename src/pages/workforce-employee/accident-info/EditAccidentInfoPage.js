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
import { updateAccidentInfo } from "../../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class EditAccidentInfoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.employeeAccident || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.employeeAccident !== this.props.employeeAccident) {
      this.setState({ stateEdited: this.props.employeeAccident });
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

    const accidentInfoData = {
      accidentDate: stateEdited?.accidentDate || stateEdited.accidentDate,
      accidentPlace: stateEdited?.accidentPlace || stateEdited.accidentPlace,
      injuryType: stateEdited?.injuryType || stateEdited.injuryType,
      accidentTime: stateEdited?.accidentTime || stateEdited.accidentTime,
      accidentType: stateEdited?.accidentType || stateEdited.accidentType,
      dutyStatus: stateEdited?.dutyStatus || stateEdited.dutyStatus,
      description: stateEdited?.description || stateEdited.description,
      inOutsideFactory:
        stateEdited?.inOutsideFactory || stateEdited.inOutsideFactory,
      reJoiningDate: stateEdited?.reJoiningDate || stateEdited.reJoiningDate,
      id: stateEdited.id,
    };

    dispatch(
      updateAccidentInfo(
        accidentInfoData,
        `Update Accident Info ${accidentInfoData.nameEn}`
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
                      id="Accident Info"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <EmployeeInjuryTypePicker
                    value={stateEdited.lifeStatus || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.accident.info.injuryType"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("injuryType", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.accident.info.dateOfAccident"}
                    value={stateEdited.accidentDate || ""}
                    onChange={(v) => this.updateAttribute("accidentDate", v)}
                    readOnly={isSaved}
                  />
                </Grid>
               <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.accident.info.timeOfAccident"}
                    value={stateEdited.accidentTime || ""}
                    onChange={(v) => this.updateAttribute("accidentTime", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <EmployeeAccidentTypePicker
                    value={stateEdited.accidentType || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.accident.info.typeOfAccident"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("accidentType", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <EmployeeDutyStatusPicker
                    value={stateEdited.dutyStatus || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.accident.info.dutyStatus"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("dutyStatus", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <EmployeeInsideOutsideFactoryPicker
                    value={stateEdited.inOutsideFactory || ""}
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
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.accident.info.reJoiningDate"}
                    value={stateEdited.reJoiningDate || ""}
                    onChange={(v) => this.updateAttribute("reJoiningDate", v)}
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
  employeeAccident: state.workforce.employeeAccident,
});

export default connect(mapStateToProps)(
  withStyles(styles)(EditAccidentInfoPage)
);
