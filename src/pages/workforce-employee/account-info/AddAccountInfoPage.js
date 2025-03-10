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
import { createAccountInfo } from "../../../actions";
import {
  EMPTY_STRING,
  MODULE_NAME,
  WORKFORCE_STATUS,
} from "../../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import EmployeeInjuryTypePicker from "../../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker from "../../../pickers/EmployeeAccidentTypePicker";
import EmployeeDutyStatusPicker from "../../../pickers/EmployeeDutyStatusPicker";
import EmployeeInsideOutsideFactoryPicker from "../../../pickers/EmployeeInsideOutsideFactoryPicker";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddAccidentInfoPage extends Component {
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

  save = async () => {
    const { stateEdited } = this.state;
    const { dispatch } = this.props;

    const accountInfoData = {
      bank: stateEdited?.bank || stateEdited.bank,
      accountHolderName: stateEdited?.accountHolderName || stateEdited.accountHolderName,
      routingNumber: stateEdited?.routingNumber || stateEdited.routingNumber,
      accountNumber: stateEdited?.accountNumber || stateEdited.accountNumber,
      status: stateEdited?.status || stateEdited.status,
      workforceEmployee: stateEdited.workforceEmployee,
    };

    await dispatch(
      createAccountInfo(
        accountInfoData,
        `Created Account Info ${stateEdited.title}`
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
                      id="Account Info"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <BanksPicker
                    value={stateEdited.bank || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.account.info.bankName"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("bank", v)}
                    readOnly={isSaved}
                  />
                </Grid>             
                <Grid item xs={6} className={classes.item}>
                  <BanksPicker
                    value={stateEdited.bank || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.account.info.branchName"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => this.updateAttribute("bank", v)}
                    readOnly={isSaved}
                  />
                </Grid>  
                 <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.accountHolderName"
                      value={stateEdited.accountHolderName || ""}
                      onChange={(v) => this.updateAttribute("accountHolderName", v)}
                      required
                      readOnly={isSaved}
                    />
                 </Grid>           
                 <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.routingNumber"
                      value={stateEdited.routingNumber || ""}
                      onChange={(v) => this.updateAttribute("routingNumber", v)}
                      required
                      readOnly={isSaved}
                    />
                 </Grid>           
                 <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.accountNumber"
                      value={stateEdited.accountNumber || ""}
                      onChange={(v) => this.updateAttribute("accountNumber", v)}
                      required
                      readOnly={isSaved}
                    />
                 </Grid>           
                 <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.status"
                      value={stateEdited.status || ""}
                      onChange={(v) => this.updateAttribute("status", v)}
                      required
                      readOnly={isSaved}
                    />
                 </Grid>           
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
  withStyles(styles)(AddAccidentInfoPage)
);
