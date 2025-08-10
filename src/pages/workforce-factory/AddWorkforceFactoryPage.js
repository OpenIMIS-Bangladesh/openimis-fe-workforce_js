import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Paper, Typography, Divider, IconButton, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { Save } from "@material-ui/icons";
import {
  createRepresentative,
  fetchRepresentativeByClientMutationId,
  createWorkforceFactory,
  fetchFactoryByClientMutationId,
  createWorkforceDocument,
  fetchInfoIdByClientMutationId,
} from "../../actions";
import { TextInput, journalize, PublishedComponent, FormattedMessage, formatMutation } from "@openimis/fe-core";

import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import WorkforceForm from "../../components/form/WorkforceForm";
import { formatRepresentativeGQL } from "../../utils/format_gql";
import CompanyPicker from "../../pickers/CompanyPicker";
import FileUploader from "../../pickers/FileUploader";
import { getInfoId } from "../../utils/utils";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddWorkforceFactoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
      isSaved: false,
      isSameRepresentative: true,
    };
  }

  componentDidUpdate(prevProps) {
    const { submittingMutation, mutation, dispatch } = this.props;
    if (!submittingMutation && prevProps.submittingMutation !== submittingMutation) {
      dispatch(journalize(mutation));
    }

    console.log("ff", this.props)

    if (
      prevProps.factoryId !== this.props.factoryId &&
      this.props.factoryId // ensure not null
    ) {
      const factoryId = this.props.factoryId;
      console.log("fff", factoryId)
      this.props.dispatch(createWorkforceDocument({ ...this.props.uploadFile, factoryId }, `Created workforce document`));
    }
  }

  save = async () => {
    const { stateEdited } = this.state;
    const { dispatch, mutation, uploadFile } = this.props;

    let representativeId = EMPTY_STRING;

    const handleFactoryAndDocument = async (workforceFactoryData) => {
      try {
        const res = await dispatch(
          createWorkforceFactory(
            workforceFactoryData,
            `Created Workforce Factory ${workforceFactoryData.nameEn}`
          )
        );

        const clientMutationId = res?.meta?.clientMutationId;

        if (!clientMutationId) {
          console.warn("No clientMutationId returned from createWorkforceFactory");
          return;
        }

        const fetchRes = await dispatch(
          fetchInfoIdByClientMutationId(
            this.props.modulesManger,
            "workforceEmployerFactories",
            clientMutationId,
            "WORKFORCE_INFO_ID_BY_CLIENT_MUTATION_ID_RESP"
          )
        );

        let factoryId = getInfoId(fetchRes, "workforceEmployerFactories");

        if (!factoryId && this.props.factoryId) {
          factoryId = this.props.factoryId;
        }

        if (factoryId) {
          await dispatch(
            createWorkforceDocument(
              { ...this.props.uploadFile, factoryId },
              `Created workforce document`
            )
          );
        } else {
          console.warn("Factory ID not found after fetch, document not created.");
        }
      } catch (error) {
        console.error("Error in handleFactoryAndDocument:", error);
      }
    };

    if (!this.state.isSameRepresentative) {
      const representativeData = {
        type: "organization",
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
      const representativeClientMutationId = representativeMutation.clientMutationId;

      await dispatch(createRepresentative(representativeMutation, `Created Representative ${representativeData.nameEn}`));
      await dispatch(fetchRepresentativeByClientMutationId(this.props.modulesManger, representativeClientMutationId));
      representativeId = this.props.representativeId[0]?.id || EMPTY_STRING;
    }

    const workforceFactoryData = {
      company: stateEdited?.company.id || stateEdited.company.id,
      nameBn: stateEdited.titleBn,
      nameEn: stateEdited.title,
      phoneNumber: stateEdited.phone,
      email: stateEdited.email,
      website: stateEdited.website,
      address: stateEdited.address,
      associationType: stateEdited.associationType,
      location: stateEdited.location,
      status: WORKFORCE_STATUS.DRAFT,
      isSameCompanyRepresentative: this.state.isSameRepresentative ? "1" : "0",
      workforceRepresentativeId: representativeId,
      workforceFactory: stateEdited.workforceFactory,
    };

    await handleFactoryAndDocument(workforceFactoryData);
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
    const { classes, mutation } = this.props;
    const { stateEdited, isSaved, isSameRepresentative } = this.state;
    const isSaveDisabled = false;

    return (
      <div className={classes.page}>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id="Workforce Factory" values={{ label: EMPTY_STRING }} />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <CompanyPicker
                    value={stateEdited?.company?.id}
                    label={<FormattedMessage id="workforce.employee.workforce_employer" module="workforce" />}
                    onChange={(v) => this.updateAttribute("company", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={isSameRepresentative}
                        disabled={false}
                        onChange={(e) => {
                          this.setState({ isSameRepresentative: !isSameRepresentative });
                        }}
                      />
                    }
                    label={<FormattedMessage id="workforce.representative.sameAsRepresentative" module="workforce" />}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.name.en"
                    value={stateEdited.title || ""}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.name.bn"
                    value={stateEdited.titleBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    readOnly={isSaved}
                    required
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.phone"
                    value={stateEdited.phone || ""}
                    onChange={(v) => this.updateAttribute("phone", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>

               <Grid item xs={6} className={classes.item}>
                  <Typography>
                    Upload Association Membership Certificate <span>*</span>
                  </Typography>

                  <FileUploader
                    fieldKey="associationCertificate"
                    onFileChange={(v) => this.updateAttribute("associationCertificate", v)}
                    documentType="ASSOCIATION_MEMBERSHIP_CERTIFICATE"
                  />
                 <input
                    key={stateEdited?.associationCertificate ? 'hasFile' : 'noFile'}
                    type="file"
                    style={{ display: 'none' }}
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Please upload the certificate")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.website"
                    value={stateEdited.website || ""}
                    onChange={(v) => this.updateAttribute("website", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.address"
                    value={stateEdited.address || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <FormControl fullWidth>
                    <InputLabel required id="association-type-label">Association Type</InputLabel>
                    <Select
                      labelId="association-type-label"
                      value={stateEdited.associationType || ""}
                      onChange={(e) => this.updateAttribute("associationType", e.target.value)}
                      label="Association Type"
                      readOnly={isSaved}
                      disabled={isSaved}
                    
                    >
                      <MenuItem value="BGMEA">BGMEA</MenuItem>
                      <MenuItem value="BKMEA">BKMEA</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.location || null}
                    onChange={(location) => this.updateAttribute("location", location)}
                    readOnly={isSaved}
                    required
                    split={true}
                  />
                </Grid>

                <>
                  {!isSameRepresentative && (
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
                            required: false,
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
                  )}
                </>
                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton variant="contained" component="label" color="primary" onClick={this.save} disabled={isSaveDisabled || isSaved}>
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
  factoryId: state.workforce.fetchedWorkforceFactoryId,
  uploadFile: state.workforce.uploadFile,
});

export default connect(mapStateToProps)(withStyles(styles)(AddWorkforceFactoryPage));
