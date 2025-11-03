import React, { Component } from "react";
import { connect, useDispatch } from "react-redux";
import { Grid, Paper, Typography, Divider, IconButton, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { Save } from "@material-ui/icons";
import {
  createRepresentative,
  fetchRepresentativeByClientMutationId,
  createWorkforceFactory,
  fetchFactoryByClientMutationId,
  createWorkforceDocument,
  fetchInfoIdByClientMutationId,
  fetchUserDistrictsUnauthorized,
  fetchFactoryPublicInfoIdByClientMutationId,
} from "../../actions";
import { TextInput, journalize, PublishedComponent, FormattedMessage, formatMutation } from "@openimis/fe-core";

import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import WorkforceForm from "../../components/form/WorkforceForm";
import { formatRepresentativeGQL } from "../../utils/format_gql";
import CompanyPicker from "../../pickers/CompanyPicker";
import FileUploader from "../../pickers/FileUploader";
import { getInfoId, getUserTypeFromRights } from "../../utils/utils";
import { bindActionCreators } from "redux";

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
  }
  componentDidMount() {
      const currentPath = window.location.pathname;
      if (currentPath.includes("workforce/factories/factory")) {
      }
      this.props.fetchUserDistrictsUnauthorized();
  }

  save = async () => {
    const { stateEdited } = this.state;
    const handleFactoryAndDocument = async (workforceFactoryData) => {
    try {
      const res = await this.props.createWorkforceFactory(
        workforceFactoryData,
        `Created Workforce Factory ${workforceFactoryData.nameEn}`
      );

      const clientMutationId = res?.meta?.clientMutationId;
      if (!clientMutationId) {
        console.warn("No clientMutationId returned from createWorkforceFactory");
        return;
      }

      // fetch factory ID
      const fetchRes = await this.props.fetchFactoryPublicInfoIdByClientMutationId(
        clientMutationId,
        "WORKFORCE_INFO_ID_BY_CLIENT_MUTATION_ID_RESP"
      );

      console.log(fetchRes);
      let factoryId = getInfoId(fetchRes, "workforceEmployerFactories");
      if (!factoryId && this.props.factoryId) {
        factoryId = this.props.factoryId;
      }

      console.log("Factory created with ID:", factoryId);

      const { uploadFile } = this.props;
      if (factoryId && uploadFile) {
        await this.props.createWorkforceDocument(
          {
            ...uploadFile,
            factoryId,
            holderType: "factory",
            documentType: "factory_membership_certificate",
          },
          `Created workforce document`
        );
      } else {
        console.warn("Cannot create document yet — missing:", {
          factoryId,
          uploadFile,
        });
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

      await this.props.createRepresentative(representativeMutation, `Created Representative ${representativeData.nameEn}`);
      await this.props.fetchRepresentativeByClientMutationId(this.props.modulesManger, representativeClientMutationId);
      representativeId = this.props.representativeId[0]?.id || EMPTY_STRING;
    }

    const workforceFactoryData = {
      company: stateEdited?.company?.id ?? "",
      nameBn: stateEdited.titleBn,
      nameEn: stateEdited.title,
      phoneNumber: stateEdited.phone,
      email: stateEdited.email,
      website: stateEdited.website,
      address: stateEdited.address,
      associationType: stateEdited.associationType,
      location: stateEdited.location,
      status: WORKFORCE_STATUS.DRAFT,
      holderType: "factory",
      // isSameCompanyRepresentative: this.state.isSameRepresentative ? "1" : "0",
      isSameCompanyRepresentative: "0",
      // workforceRepresentativeId: representativeId,
      workforceFactory: stateEdited.workforceFactory,
    };

    await handleFactoryAndDocument(workforceFactoryData);
    this.setState({ isSaved: true });
    window.location.href('/workforce/factories');
  };

  updateAttribute = (key, value) => {
    this.setState(
      (prevState) => ({
        stateEdited: {
          ...prevState.stateEdited,
          [key]: value,
        },
        isSaved: false,
      }),
    );
  };



  render() {
    const { classes, mutation } = this.props;
    const { stateEdited, isSaved, isSameRepresentative } = this.state;
    const isSaveDisabled = false;
    let disableAssociationSelect= false;
    if(this.props.userType && this.props.userType.includes("association")){
      disableAssociationSelect= true;
    }
    let associationValue= "";
    if(this.props.userType && this.props.userType.includes("association")){
      associationValue= this.props.userType.split("_")[0].toUpperCase();
    }

    return (
      <div className={classes.page}>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id="ফ্যাক্টরী রেজিস্ট্রেশন" values={{ label: EMPTY_STRING }} />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                {/* <Grid item xs={6} className={classes.item}>
                  <CompanyPicker
                    value={stateEdited?.company?.id}
                    label={<FormattedMessage id="workforce.employee.workforce_employer" module="workforce" />}
                    onChange={(v) => this.updateAttribute("company", v)}
                    readOnly={isSaved}
                  />
                </Grid> */}
                {/* <Grid item xs={6} className={classes.item}>
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
                </Grid> */}
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
                    <FormattedMessage id="workforce.factory.uploadMembershipCertificate" module="workforce" /> <span>*</span>
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
                    <InputLabel required id="association-type-label"><FormattedMessage id="workforce.factory.associationType" module="workforce" /></InputLabel>
                    <Select
                      labelId="association-type-label"
                      value={associationValue!=""? associationValue : stateEdited.associationType? stateEdited.associationType : ""}
                      onChange={(e) => this.updateAttribute("associationType", e.target.value)}
                      label="Association Type"
                      readOnly={disableAssociationSelect}
                      disabled={isSaved}
                    
                    >
                      <MenuItem value="BGMEA">BGMEA</MenuItem>
                      <MenuItem value="BKMEA">BKMEA</MenuItem>
                      <MenuItem value="LFMEAB">LFMEAB</MenuItem>
                      <MenuItem value="BEPZA">BEPZA</MenuItem>
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
                  {/* {!isSameRepresentative && ( */}
                    <Grid item xs={12} className={classes.item}>
                      <WorkforceForm
                        title="workforce.representative.title"
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
                  {/* )} */}
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
  userType: getUserTypeFromRights(state.core.user.i_user.rights),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUserDistrictsUnauthorized,
      createWorkforceFactory,
      createRepresentative,
      fetchRepresentativeByClientMutationId,
      fetchFactoryByClientMutationId,
      createWorkforceDocument,
      fetchInfoIdByClientMutationId,
      fetchFactoryPublicInfoIdByClientMutationId,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AddWorkforceFactoryPage));
