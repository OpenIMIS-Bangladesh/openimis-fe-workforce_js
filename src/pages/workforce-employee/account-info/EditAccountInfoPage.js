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
import { updateAccoutInfo } from "../../../actions";
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
      stateEdited: props.employeeAccount || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.employeeAccount !== this.props.employeeAccount) {
      this.setState({ stateEdited: this.props.employeeAccount });
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

    const accountInfoData = {
      bank: stateEdited?.bank || stateEdited.bank,
      accountHolderName: stateEdited?.accountHolderName || stateEdited.accountHolderName,
      routingNumber: stateEdited?.routingNumber || stateEdited.routingNumber,
      accountNumber: stateEdited?.accountNumber || stateEdited.accountNumber,
      status: stateEdited?.status || stateEdited.status,
      id: stateEdited.id,
    };

    dispatch(
      updateAccoutInfo(
        accountInfoData,
        `Update Account Info ${accountInfoData.nameEn}`
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
                      id="Account Info"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
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
  employeeAccount: state.workforce.employeeAccount,
});

export default connect(mapStateToProps)(
  withStyles(styles)(EditAccidentInfoPage)
);
