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
  fetchRepresentativeByClientMutationId,
} from "../../actions";

import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withStyles } from "@material-ui/core/styles";
import { createWorkforceCompany } from "../../actions";
import WorkforceForm from "../../components/form/WorkforceForm";
import { formatRepresentativeGQL } from "../../utils/format_gql";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddWorkforceCompanyPage extends Component {
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

    const representativeData = {
      type: "company",
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
      `Created Representative ${representativeData.nameEn}`,
    );
    const representativeClientMutationId =
      representativeMutation.clientMutationId;

    await dispatch(
      createRepresentative(
        representativeMutation,
        `Created Representative ${representativeData.nameEn}`,
      ),
    );

    await dispatch(
      fetchRepresentativeByClientMutationId(
        this.props.modulesManger,
        representativeClientMutationId,
      ),
    );

    const representativeId = this.props.representativeId[0].id;

    const workforceCompanyData = {
      nameBn: stateEdited.titleBn,
      nameEn: stateEdited.title,
      phoneNumber: stateEdited.phone,
      email: stateEdited.email,
      website: stateEdited.website,
      address: stateEdited.address,
      location: stateEdited.location,
      establishmentDate: stateEdited.establishmentDate,
      associationName: stateEdited.associationName,
      associationMembershipNumber: stateEdited.associationMembershipNumber,
      licenceType: stateEdited.licenceType,
      licenceNumber: stateEdited.licenceNumber,
      foundationDate: stateEdited.foundationDate,
      businessSector: stateEdited.businessSector,
      establishmentName: stateEdited.establishmentName,
      status: WORKFORCE_STATUS.ACTIVE,
      workforceRepresentativeId: representativeId,
      workforceCompany: stateEdited.workforceCompany,
    };

    await dispatch(
      createWorkforceCompany(
        workforceCompanyData,
        `Created Workforce Company ${workforceCompanyData.nameEn}`,
      ),
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
                      id="Workforce Company"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.name.en"
                    value={stateEdited.title || ""}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.name.bn"
                    value={stateEdited.titleBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phoneNumber", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.website"
                    value={stateEdited.website || ""}
                    onChange={(v) => this.updateAttribute("website", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.licence_type"
                    value={stateEdited.licenceType || ""}
                    onChange={(v) => this.updateAttribute("licenceType", v)}
                    readOnly={isSaved}
                    required
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.licence_number"
                    value={stateEdited.licenceNumber || ""}
                    onChange={(v) => this.updateAttribute("licenceNumber", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.business_sector"
                    value={stateEdited.businessSector || ""}
                    onChange={(v) => this.updateAttribute("businessSector", v)}
                    readOnly={isSaved}
                    required
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.company.foundation_date"}
                    value={stateEdited.foundationDate || ""}
                    onChange={(v) => this.updateAttribute("foundationDate", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.association_name"
                    value={stateEdited.associationName || ""}
                    onChange={(v) => this.updateAttribute("associationName", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.association_membership_number"
                    value={stateEdited.associationMembershipNumber || ""}
                    onChange={(v) =>
                      this.updateAttribute("associationMembershipNumber", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.establishment_Name"
                    value={stateEdited.establishmentName || ""}
                    onChange={(v) =>
                      this.updateAttribute("establishmentName", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.company.establishment_date"}
                    value={stateEdited.establishmentDate || ""}
                    onChange={(v) =>
                      this.updateAttribute("establishmentDate", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.address"
                    value={stateEdited.address || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
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

                <Grid item xs={12} className={classes.item}>
                  <WorkforceForm
                    title="Workforce Representative Info"
                    stateEdited={stateEdited}
                    isSaved={isSaved}
                    updateAttribute={this.updateAttribute}
                    fields={[
                      {
                        key: "repName",
                        label: "workforce.representative.name.en",
                        type: "text",
                        required: true,
                      },
                      {
                        key: "repNameBn",
                        label: "workforce.representative.name.bn",
                        type: "text",
                        required: true,
                      },
                      {
                        key: "position",
                        label: "workforce.representative.position",
                        type: "text",
                        required: true,
                      },
                      {
                        key: "repPhone",
                        label: "workforce.representative.phone",
                        type: "number",
                        required: true,
                      },
                      {
                        key: "repEmail",
                        label: "workforce.representative.email",
                        type: "email",
                        required: true,
                      },
                      {
                        key: "nid",
                        label: "workforce.representative.nid",
                        type: "number",
                        required: true,
                      },
                      {
                        key: "passport",
                        label: "workforce.representative.passport",
                        type: "text",
                        required: false,
                      },
                      {
                        key: "birthDate",
                        label: "workforce.representative.birthDate",
                        type: "date",
                        required: true,
                      },
                      {
                        key: "repLocation",
                        label: "workforce.representative.location",
                        type: "location",
                        required: true,
                      },
                      {
                        key: "repAddress",
                        label: "workforce.representative.address",
                        type: "text",
                        required: true,
                      },
                    ]}
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
  representativeId: state.workforce.fetchedRepresentativeByClientMutationId,
  mutation: state.workforce.mutation,
});

export default connect(mapStateToProps)(
  withStyles(styles)(AddWorkforceCompanyPage),
);
