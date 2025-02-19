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
import {
  createRepresentative,
  createWorkforceOrganization,
  fetchRepresentativeByClientMutationId,
} from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import WorkforceForm from "../../components/form/WorkforceForm";
import { formatRepresentativeGQL } from "../../utils/format_gql";
import OrganizationTypePicker from "../../pickers/OrganizationTypePicker";
import FileUploader from "../../pickers/FileUploader";

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

    const representativeData = {
      nameBn: stateEdited.repNameBn,
      nameEn: stateEdited.repName,
      location: stateEdited.repLocation,
      address: stateEdited.repAddress,
      phoneNumber: stateEdited.repPhone,
      email: stateEdited.repEmail,
      nid: stateEdited.nid,
      passportNo: stateEdited.passport,
      birthDate: stateEdited.birthDate,
      position: stateEdited.position,
    };

    const representativeMutation = await formatMutation(
      "createWorkforceRepresentative",
      formatRepresentativeGQL(representativeData),
      `Created Representative ${representativeData.nameEn}`
    );
    const representativeClientMutationId =
      representativeMutation.clientMutationId;

    await dispatch(
      createRepresentative(
        representativeMutation,
        `Created Representative ${representativeData.nameEn}`
      )
    );

    await dispatch(
      fetchRepresentativeByClientMutationId(
        this.props.modulesManger,
        representativeClientMutationId
      )
    );

    const representativeId = this.props.representativeId[0].id;

    const organizationData = {
      type: stateEdited.type,
      nameBn: stateEdited.titleBn,
      nameEn: stateEdited.title,
      location: stateEdited.location,
      address: stateEdited.address,
      phoneNumber: stateEdited.phone,
      email: stateEdited.email,
      website: stateEdited.website,
      // workforceRepresentativeId:this.state.workforce.fetchedRepresentativeByClientMutationId,
      workforceRepresentativeId: representativeId,
    };
    console.log({ organizationData });

    await dispatch(
      createWorkforceOrganization(
        organizationData,
        `Created Organization ${organizationData.nameEn}`
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

  handleFileUpload = (uploadedFiles) => {
    this.setState({ uploadedFiles });
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved, uploadedFiles } = this.state;
    const isSaveDisabled = false;

    console.log({ uploadedFiles });
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
                    pubRef="workforceOrganization.BanksPicker"
                    value={stateEdited.Bank || null}
                    label={
                      <FormattedMessage
                        module="workforce"
                        id="workforce.bank.picker"
                      />
                    }
                    onChange={(option) =>
                      this.updateAttribute("bank", option)
                    }
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.banks.name"
                    value={stateEdited.name || ""}
                    onChange={(v) => this.updateAttribute("name", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

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
