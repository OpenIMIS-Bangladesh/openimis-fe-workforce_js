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
  decodeId,
  encodeId,
  formatMutation,
} from "@openimis/fe-core";
import {
  fetchRepresentativeByClientMutationId,
  updateBank,
  updateOrganization,
  updateRepresentative,
  updateWorkforceOrganization,
} from "../../actions";
import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import WorkforceForm from "../../components/form/WorkforceForm";
import { formatRepresentativeGQL } from "../../utils/format_gql";
import OrganizationTypePicker from "../../pickers/OrganizationTypePicker";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class EditWorkforceBankPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.bank || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.bank !== this.props.bank) {
      this.setState({ stateEdited: this.props.bank });
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

  save = async () => {
    const { stateEdited } = this.state;
    const { grievanceConfig, dispatch } = this.props;

    if (!stateEdited.bank && !stateEdited?.parent) {
      const bankData = {
        id:stateEdited.id,
        nameEn: stateEdited.nameEn,
        nameBn: stateEdited.nameBn,
        address: stateEdited.headquarterAddress,
        locationId: stateEdited.location,
        status: WORKFORCE_STATUS.ACTIVE,
      };
      console.log({bankData})

      await dispatch(updateBank(bankData, `update Bank ${bankData.nameEn}`));
    } else {
      const bankBranchData = {
        id:stateEdited.id,
        nameEn: stateEdited.nameEn,
        nameBn: stateEdited.nameBn,
        parentId: stateEdited.parent?.id ||stateEdited?.bank?.id,
        routingNumber: stateEdited.routingNumber,
        contactNumber: stateEdited.contactNumber,
        address:stateEdited?.headquarterAddress,
        locationId: stateEdited.location,
        status: WORKFORCE_STATUS.ACTIVE,
      };

      console.log({bankBranchData})

      await dispatch(
        updateBank(bankBranchData, `update Branch ${bankBranchData.nameEn}`)
      );
    }
    this.setState({ isSaved: true });
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
                      id="Banks"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.BanksPicker"
                    value={stateEdited.parent.id || stateEdited.bank.id || null}
                    label={
                      <FormattedMessage
                        module="workforce"
                        id="workforce.bank.picker"
                      />
                    }
                    onChange={(option) => this.updateAttribute("bank", option)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={
                      stateEdited.bank
                        ? "workforce.banks.branch.nameEn"
                        : "workforce.banks.nameEn"
                    }
                    value={stateEdited.nameEn || ""}
                    onChange={(v) => this.updateAttribute("nameEn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={
                      stateEdited.bank
                        ? "workforce.banks.branch.nameBn"
                        : "workforce.banks.nameBn"
                    }
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("nameBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                {stateEdited.bank && (
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.banks.routingNumber"
                      value={stateEdited.routingNumber || ""}
                      onChange={(v) => this.updateAttribute("routingNumber", v)}
                      required
                      readOnly={isSaved}
                    />
                  </Grid>
                )}

                {stateEdited.bank && (
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.banks.contactNumber"
                      value={stateEdited.contactNumber || ""}
                      onChange={(v) => this.updateAttribute("contactNumber", v)}
                      required
                      readOnly={isSaved}
                    />
                  </Grid>
                )}

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.banks.address"
                    value={
                      stateEdited?.headquarterAddress ||
                      
                      ""
                    }
                    onChange={(v) => this.updateAttribute("headquarterAddress", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={12} className={classes.item}>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.location || null}
                    onChange={(location) =>
                      this.updateAttribute("location", location)
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
  // submittingMutation: state.grievanceSocialProtection.submittingMutation,
  // mutation: state.grievanceSocialProtection.mutation,
  // grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
  bank: state.workforce.bank,
});

export default connect(mapStateToProps)(
  withTheme(withStyles(styles)(EditWorkforceBankPage))
);
