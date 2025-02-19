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
  updateOrganization,
  updateRepresentative,
  updateWorkforceOrganization,
} from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
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

class EditWorkforceOrganizationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.organization || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.organization !== this.props.organization) {
      this.setState({ stateEdited: this.props.organization });
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

    const representativeData = {
      nameBn:
        stateEdited?.repNameBn || stateEdited?.workforceRepresentative?.nameBn,
      nameEn:
        stateEdited?.repName || stateEdited?.workforceRepresentative?.nameEn,
      location:
        stateEdited?.repLocation ||
        stateEdited?.workforceRepresentative?.location,
      address:
        stateEdited?.repAddress ||
        stateEdited?.workforceRepresentative?.address,
      phoneNumber:
        stateEdited?.repPhone ||
        stateEdited?.workforceRepresentative?.phoneNumber,
      email:
        stateEdited?.repEmail || stateEdited?.workforceRepresentative?.email,
      nid: stateEdited?.nid || stateEdited?.workforceRepresentative?.nid,
      passportNo:
        stateEdited?.passport ||
        stateEdited?.workforceRepresentative?.passportNo,
      birthDate:
        stateEdited?.birthDate ||
        stateEdited?.workforceRepresentative?.birthDate,
      position:
        stateEdited?.position || stateEdited?.workforceRepresentative?.position,
      id: decodeId(stateEdited.workforceRepresentative.id),
    };

    const organizationData = {
      type:stateEdited.type,
      nameBn: stateEdited?.titleBn || stateEdited.nameBn,
      nameEn: stateEdited?.title || stateEdited.nameEn,
      location: stateEdited?.location || stateEdited.location,
      address: stateEdited?.address || stateEdited.address,
      phoneNumber: stateEdited?.phone || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      website: stateEdited?.website || stateEdited.website,
      workforceRepresentativeId: stateEdited.workforceRepresentative.id,
      parent:stateEdited?.parent.id,
      id: stateEdited.id,
    };

    dispatch(
      updateRepresentative(
        representativeData,
        `Update Representative ${representativeData.nameEn}`,
      ),
    );

    dispatch(
      updateWorkforceOrganization(
        organizationData,
        `Update Organization ${organizationData.nameEn}`,
      ),
    );

    console.log({ organizationData });
    console.log({ representativeData });
    this.setState({ isSaved: true });
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;

    // const isSaveDisabled = !(
    //   // stateEdited.title &&
    //   // stateEdited.address &&
    //   // stateEdited.phone &&
    //   // stateEdited.email &&
    //   // stateEdited.website &&
    //   stateEdited.parent
    //   // stateEdited.location
    // );
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
                      id="Organization"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.name.en"
                    value={stateEdited.nameEn}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.name.bn"
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforceOrganization.OrganizationPicker"
                    value={stateEdited.parent|| null}
                    onChange={(option) =>
                      this.updateAttribute("parent", option)
                    }
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phone", v)}
                    required
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.website"
                    value={stateEdited.website || ""}
                    onChange={(v) => this.updateAttribute("website", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={12} className={classes.item}>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.location}
                    onChange={(location) =>
                      this.updateAttribute("location", location)
                    }
                    readOnly={isSaved}
                    required
                    split={true}
                    filterLabels={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.address"
                    value={stateEdited.address || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <OrganizationTypePicker
                    value={stateEdited?.type}
                    label={
                      <FormattedMessage
                        id="workforce.organization.type.picker"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.updateAttribute("type", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={12} className={classes.item}>
                  <WorkforceForm
                    title={"Workforce Representative Info"}
                    stateEdited={stateEdited}
                    isSaved={isSaved}
                    updateAttribute={this.updateAttribute}
                    fields={[
                      {
                        key: "repName",
                        label: "workforce.representative.name.en",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.nameEn,
                      },
                      {
                        key: "repNameBn",
                        label: "workforce.representative.name.bn",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.nameBn,
                      },
                      {
                        key: "position",
                        label: "workforce.representative.position",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.position,
                      },
                      {
                        key: "repPhone",
                        label: "workforce.representative.phone",
                        type: "number",
                        required: true,
                        value: stateEdited.workforceRepresentative.phoneNumber,
                      },
                      {
                        key: "repEmail",
                        label: "workforce.representative.email",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.email,
                      },
                      {
                        key: "nid",
                        label: "workforce.representative.nid",
                        type: "number",
                        required: true,
                        value: stateEdited.workforceRepresentative.nid,
                      },
                      {
                        key: "birthDate",
                        label: "workforce.representative.birthDate",
                        type: "date",
                        required: false,
                        value: stateEdited.workforceRepresentative.birthDate,
                      },
                      {
                        key: "passport",
                        label: "workforce.representative.passport",
                        type: "text",
                        required: false,
                        value: stateEdited.workforceRepresentative.passportNo,
                      },
                      {
                        key: "repLocation",
                        label: "workforce.representative.location",
                        type: "location",
                        required: true,
                        value: stateEdited.workforceRepresentative.location,
                      },
                      {
                        key: "repAddress",
                        label: "workforce.representative.address",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.address,
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
  // submittingMutation: state.grievanceSocialProtection.submittingMutation,
  // mutation: state.grievanceSocialProtection.mutation,
  // grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
  organization: state.workforce.organization,
});

export default connect(mapStateToProps)(
  withTheme(withStyles(styles)(EditWorkforceOrganizationPage)),
);
