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
} from "@openimis/fe-core";
import {
  createBank,
} from "../../actions";
import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import {  withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddWorkforceBankPage extends Component {
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
    const { grievanceConfig, dispatch } = this.props;

    if (!stateEdited.bank) {
      const bankData = {
        nameEn: stateEdited.nameEn,
        nameBn: stateEdited.nameBn,
        headquarterAddress: stateEdited.address,
        locationId: stateEdited.location,
        status: WORKFORCE_STATUS.ACTIVE,
      };

      await dispatch(
        createBank(
          bankData,
          `Created Bank ${bankData.nameEn}`
        )
      );

    }else{
      const bankBranchData = {
        nameEn:stateEdited.nameEn,
        nameBn:stateEdited.nameBn,
        parentId:stateEdited?.bank?.id,
        routingNumber:stateEdited.routingNumber,
        contactNumber:stateEdited.contactNumber,
        address:stateEdited.address,
        locationId: stateEdited.location,
        status:WORKFORCE_STATUS.ACTIVE
      }

      await dispatch(
        createBank(
          bankBranchData,
          `Created Branch ${bankBranchData.nameEn}`
        )
      );
    }



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

  handleFileUpload = (uploadedFiles) => {
    this.setState({ uploadedFiles });
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved, uploadedFiles } = this.state;
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
                    value={stateEdited.bank || null}
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
                    value={stateEdited.name || ""}
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
                    value={stateEdited.name || ""}
                    onChange={(v) => this.updateAttribute("nameBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                {stateEdited.bank && (
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.banks.routingNumber"
                      value={stateEdited.name || ""}
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
                      value={stateEdited.name || ""}
                      onChange={(v) => this.updateAttribute("contactNumber", v)}
                      required
                      readOnly={isSaved}
                    />
                  </Grid>
                )}

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.banks.address"
                    value={stateEdited.address || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
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
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  representativeId: state.workforce.fetchedRepresentativeByClientMutationId,
});

export default connect(mapStateToProps)(
  withStyles(styles)(AddWorkforceBankPage)
);
