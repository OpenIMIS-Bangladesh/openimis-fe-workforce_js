import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  FormControlLabel,
  Checkbox,
  FormControl,InputLabel,Select,MenuItem,
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  Snackbar,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  CircularProgress,
  Tooltip,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Save, Close } from "@material-ui/icons";
import GetAppIcon from "@material-ui/icons/GetApp";
import DescriptionIcon from "@material-ui/icons/Description";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import BusinessIcon from "@material-ui/icons/Business";
import PhoneIcon from "@material-ui/icons/Phone";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import EventIcon from "@material-ui/icons/Event";
import PersonIcon from "@material-ui/icons/Person";
import InfoIcon from "@material-ui/icons/Info";
import {
  createRepresentative,
  fetchRepresentativeByClientMutationId,
  createWorkforceFactory,
  updateRepresentative,
  updateWorkforceFactory,
  fetchWorkforceDocument,
  fetchWorkforceAllAssociationSummary,
} from "../../actions";
import {
  TextInput,
  journalize,
  PublishedComponent,
  FormattedMessage,
  formatMutation,
  decodeId,
  withModulesManager,
} from "@openimis/fe-core";

import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import WorkforceForm from "../../components/form/WorkforceForm";
import { formatRepresentativeGQL } from "../../utils/format_gql";
import CompanyPicker from "../../pickers/CompanyPicker";
import FileUploader from "../../pickers/FileUploader";
import { getAssociationNameByUserType, getUserTypeFromRights } from "../../utils/utils";

const styles = (theme) => ({
  paper: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
    padding: theme.spacing(3),
  },
  tableTitle: {
    backgroundColor: "#006273",
    color: "white",
    padding: theme.spacing(3),
    borderRadius: "12px",
    marginBottom: theme.spacing(3),
    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
  },
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
  sectionCard: {
    marginBottom: theme.spacing(3),
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.8)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      transform: "translateY(-2px)",
    },
  },
  sectionHeader: {
    backgroundColor: "#006273",
    color: "white",
    padding: theme.spacing(2.5),
    borderRadius: "16px 16px 0 0",
    display: "flex",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: theme.spacing(1.5),
    fontSize: "1.4rem",
  },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: "1.15rem",
    display: "flex",
    alignItems: "center",
  },
  buttonGroup: {
    display: "flex",
    gap: theme.spacing(1.5),
    justifyContent: "flex-end",
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    borderTop: "1px solid #e9ecef",
  },
  saveButton: {
    backgroundColor: "#11998e",
    color: "white",
    fontWeight: "600",
    padding: "10px 28px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(17, 153, 142, 0.4)",
      transform: "translateY(-2px)",
    },
  },
  closeButton: {
    fontWeight: "600",
    padding: "10px 28px",
    borderRadius: "8px",
    border: "2px solid #667eea",
    color: "#667eea",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(102, 126, 234, 0.1)",
      transform: "translateY(-2px)",
    },
  },
  gridField: {
    marginBottom: theme.spacing(2),
  },
  cardContent: {
    padding: theme.spacing(3),
    "&:last-child": {
      paddingBottom: theme.spacing(3),
    },
  },
  divider: {
    margin: theme.spacing(3, 0),
    backgroundColor: "rgba(0,0,0,0.08)",
  },
});

class EditWorkforceFactoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.workforceFactory || {},
      isSaved: false,
      isSameRepresentative: true,
      showSuccessMessage: false,
      documents: [],
      fetchingDocuments: false,
      associations: [],
      fetchingAssociations: false,
    };
  }

  componentDidMount() {
    // Fetch associations when component mounts
    this.fetchAssociations();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.workforceFactory !== this.props.workforceFactory) {
      this.setState({ stateEdited: this.props.workforceFactory });
      // Fetch documents when factory loads
      if (this.props.workforceFactory?.id) {
        this.fetchDocuments(this.props.workforceFactory.id);
      }
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
      if (this.props.mutation?.status === 200 || this.props.mutation?.status === 201) {
        this.setState({ showSuccessMessage: true });
      }
    }
  }

  fetchAssociations = () => {
    const { dispatch, modulesManager } = this.props;
    this.setState({ fetchingAssociations: true });
    
    dispatch(fetchWorkforceAllAssociationSummary([]))
      .then((response) => {
        if (response?.payload?.data?.workforceAllAssociations?.edges) {
          const associations = response.payload.data.workforceAllAssociations.edges.map(edge => edge.node);
          this.setState({ associations, fetchingAssociations: false });
        } else {
          this.setState({ fetchingAssociations: false });
        }
      })
      .catch((error) => {
        console.error("Error fetching associations:", error);
        this.setState({ fetchingAssociations: false });
      });
  };

  fetchDocuments = (factoryId) => {
    const { dispatch, modulesManager } = this.props;
    this.setState({ fetchingDocuments: true });
    
    dispatch(
      fetchWorkforceDocument(modulesManager, [
        `holderType: "factory"`,
        `workforceFactoryId: "${factoryId}"`,
      ])
    ).then((response) => {
      if (response?.payload?.data?.workforceDocuments?.edges) {
        const docs = response.payload.data.workforceDocuments.edges.map(edge => edge.node);
        this.setState({ documents: docs, fetchingDocuments: false });
      } else {
        this.setState({ fetchingDocuments: false });
      }
    }).catch((error) => {
      console.error("Error fetching documents:", error);
      this.setState({ fetchingDocuments: false });
    });
  };

  handleDownloadDocument = (doc) => {
    if (doc?.url) {
      const fileUrl = window.location.origin + doc.url;
      window.open(fileUrl, '_blank');
    }
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

  updateNestedAttribute = (parentKey, childKey, value) => {
    this.setState((prevState) => ({
      stateEdited: {
        ...prevState.stateEdited,
        [parentKey]: {
          ...prevState.stateEdited[parentKey],
          [childKey]: value,
        },
      },
      isSaved: false,
    }));
  };

  save = async () => {
    const { stateEdited } = this.state;
    const { dispatch } = this.props;

    // Update representative if needed
    if (stateEdited.workforceRepresentative?.id) {
      const representativeData = {
        type: "organization",
        nameBn: stateEdited?.repNameBn || stateEdited?.workforceRepresentative?.nameBn,
        nameEn: stateEdited?.repName || stateEdited?.workforceRepresentative?.nameEn,
        location: stateEdited?.repLocation || stateEdited?.workforceRepresentative?.location,
        address: stateEdited?.repAddress || stateEdited?.workforceRepresentative?.address,
        phoneNumber: stateEdited?.repPhone || stateEdited?.workforceRepresentative?.phoneNumber,
        email: stateEdited?.repEmail || stateEdited?.workforceRepresentative?.email,
        nid: stateEdited?.nid || stateEdited?.workforceRepresentative?.nid,
        passportNo: stateEdited?.passport || stateEdited?.workforceRepresentative?.passportNo,
        birthDate: stateEdited?.birthDate || stateEdited?.workforceRepresentative?.birthDate,
        position: stateEdited?.position || stateEdited?.workforceRepresentative?.position,
        id: decodeId(stateEdited.workforceRepresentative.id),
      };

      dispatch(
        updateRepresentative(
          representativeData,
          `Update Representative ${representativeData.nameEn}`
        )
      );
    }

    // Update factory
    const workforceFactoryData = {
      id: decodeId(stateEdited.id),
      nameBn: stateEdited?.nameBn || stateEdited?.titleBn,
      nameEn: stateEdited?.nameEn || stateEdited?.title,
      phoneNumber: stateEdited?.phoneNumber,
      email: stateEdited?.email,
      address: stateEdited?.address,
      officeAddress: stateEdited?.officeAddress,
      associationType: stateEdited?.associationType,
      website: stateEdited?.website,
      location: stateEdited?.location,
      officeLocation: stateEdited?.officeLocation,
      licenseType: stateEdited?.licenseType,
      dateOfFactoryEstablishment: stateEdited?.dateOfFactoryEstablishment,
      dateOfEisIncorporation: stateEdited?.dateOfEisIncorporation,
      registrationDate: stateEdited?.registrationDate,
      registrationExpiryDate: stateEdited?.registrationExpiryDate,
      approximateNumberOfEmployee: stateEdited?.approximateNumberOfEmployee,
      limaRegistrationNumber: stateEdited?.limaRegistrationNumber,
      licenseNo: stateEdited?.licenseNo,
      businessSector: stateEdited?.businessSector,
      membershipNo: stateEdited?.membershipNo,
      groupName: stateEdited?.groupName,
      workforceRepresentativeId: stateEdited.workforceRepresentative?.id,
      company: stateEdited.workforceEmployer?.id,
    };

    dispatch(
      updateWorkforceFactory(
        workforceFactoryData,
        `Update Workforce Factory ${workforceFactoryData.nameEn}`
      )
    );
  };

  render() {
    const { classes, theme } = this.props;
    const { stateEdited, isSaved, showSuccessMessage, associations } = this.state;
    const isSaveDisabled = false;

    let disableAssociationSelect = getAssociationNameByUserType(this.props.userType) === "" ? false : true;

    return (
      <div className={classes.paper}>
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={5000}
          onClose={() => this.setState({ showSuccessMessage: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity="success">
            <FormattedMessage id="workforce.factory.updateSuccessful" defaultMessage="Factory updated successfully" />
          </Alert>
        </Snackbar>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box className={classes.tableTitle}>
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <BusinessIcon style={{ fontSize: "2.5rem", marginRight: "16px", color: "white" }} />
                    <Box>
                      <Typography variant="h4" style={{ color: "white", fontWeight: "700" }}>
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="workforce.factory.edit.title"
                          defaultMessage="Edit Factory"
                        />
                      </Typography>
                      <Typography variant="caption" style={{ color: "rgba(255,255,255,0.8)" }}>
                        {stateEdited.nameEn && `${stateEdited.nameEn}`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12}>
              {/* BASIC INFORMATION SECTION */}
              <Card className={classes.sectionCard}>
                <CardHeader
                  className={classes.sectionHeader}
                  title={
                    <Typography className={classes.sectionTitle}>
                      <BusinessIcon className={classes.sectionIcon} />
                      <FormattedMessage id="workforce.factory.basicInfo" defaultMessage="Basic Information" />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.name.en"
                        value={stateEdited.nameEn || stateEdited.title || ""}
                        onChange={(v) => this.updateAttribute("nameEn", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.name.bn"
                        value={stateEdited.nameBn || stateEdited.titleBn || ""}
                        onChange={(v) => this.updateAttribute("nameBn", v)}
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <FormControl fullWidth>
                        <InputLabel id="association-type-label">Association Type</InputLabel>
                        <Select
                          labelId="association-type-label"
                          value={stateEdited.associationType || ""}
                          onChange={(e) => this.updateAttribute("associationType", e.target.value)}
                          label="Association Type"
                          disabled={isSaved || disableAssociationSelect}
                          required
                        >
                          {associations.map((assoc) => (
                            <MenuItem key={assoc.id} value={assoc.shortNameEn}>
                              {assoc.shortNameEn}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.licenseType"
                        value={stateEdited.licenseType || ""}
                        onChange={(v) => this.updateAttribute("licenseType", v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* CONTACT INFORMATION SECTION */}
              <Card className={classes.sectionCard}>
                <CardHeader
                  className={classes.sectionHeader}
                  title={
                    <Typography className={classes.sectionTitle}>
                      <PhoneIcon className={classes.sectionIcon} />
                      <FormattedMessage id="workforce.factory.contactInfo" defaultMessage="Contact Information" />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.phone"
                        value={stateEdited.phoneNumber || ""}
                        onChange={(v) => this.updateAttribute("phoneNumber", v)}
                        type="number"
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.email"
                        value={stateEdited.email || ""}
                        onChange={(v) => this.updateAttribute("email", v)}
                        type="email"
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.website"
                        value={stateEdited.website || ""}
                        onChange={(v) => this.updateAttribute("website", v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* LOCATION INFORMATION SECTION */}
              <Card className={classes.sectionCard}>
                <CardHeader
                  className={classes.sectionHeader}
                  title={
                    <Typography className={classes.sectionTitle}>
                      <LocationOnIcon className={classes.sectionIcon} />
                      <FormattedMessage id="workforce.factory.locationInfo" defaultMessage="Location Information" />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} className={classes.gridField}>
                      <Typography variant="subtitle2" style={{ marginBottom: "8px", fontWeight: "bold" }}>
                        <FormattedMessage id="workforce.factory.location" defaultMessage="Factory Location" />
                      </Typography>
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

                    <Grid item xs={12} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.address"
                        value={stateEdited.address || ""}
                        onChange={(v) => this.updateAttribute("address", v)}
                        readOnly={isSaved}
                        multiline
                        rows={2}
                      />
                    </Grid>

                    <Grid item xs={12} className={classes.gridField}>
                      <Typography variant="subtitle2" style={{ marginBottom: "8px", fontWeight: "bold" }}>
                        <FormattedMessage id="workforce.factory.officeLocation" defaultMessage="Office Location" />
                      </Typography>
                      <PublishedComponent
                        pubRef="location.DetailedLocation"
                        withNull={true}
                        value={stateEdited.officeLocation || null}
                        onChange={(location) => this.updateAttribute("officeLocation", location)}
                        readOnly={isSaved}
                        split={true}
                      />
                    </Grid>

                    <Grid item xs={12} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.officeAddress"
                        value={stateEdited.officeAddress || ""}
                        onChange={(v) => this.updateAttribute("officeAddress", v)}
                        readOnly={isSaved}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* REGISTRATION & DATES SECTION */}
              <Card className={classes.sectionCard}>
                <CardHeader
                  className={classes.sectionHeader}
                  title={
                    <Typography className={classes.sectionTitle}>
                      <EventIcon className={classes.sectionIcon} />
                      <FormattedMessage id="workforce.factory.registrationInfo" defaultMessage="Registration Information" />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.dateOfEstablishment"
                        value={stateEdited.dateOfFactoryEstablishment || ""}
                        onChange={(v) => this.updateAttribute("dateOfFactoryEstablishment", v)}
                        type="date"
                        readOnly={isSaved}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.eisIncorporationDate"
                        value={stateEdited.dateOfEisIncorporation || ""}
                        onChange={(v) => this.updateAttribute("dateOfEisIncorporation", v)}
                        type="date"
                        readOnly={isSaved}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.registrationDate"
                        value={stateEdited.registrationDate || ""}
                        onChange={(v) => this.updateAttribute("registrationDate", v)}
                        type="date"
                        readOnly={isSaved}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.registrationExpiryDate"
                        value={stateEdited.registrationExpiryDate || ""}
                        onChange={(v) => this.updateAttribute("registrationExpiryDate", v)}
                        type="date"
                        readOnly={isSaved}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.limaRegistrationNumber"
                        value={stateEdited.limaRegistrationNumber || ""}
                        onChange={(v) => this.updateAttribute("limaRegistrationNumber", v)}
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.licenseNumber"
                        value={stateEdited.licenseNo || ""}
                        onChange={(v) => this.updateAttribute("licenseNo", v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* ADDITIONAL DETAILS SECTION */}
              <Card className={classes.sectionCard}>
                <CardHeader
                  className={classes.sectionHeader}
                  title={
                    <Typography className={classes.sectionTitle}>
                      <InfoIcon className={classes.sectionIcon} />
                      <FormattedMessage id="workforce.factory.additionalDetails" defaultMessage="Additional Details" />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.numberOfEmployees"
                        value={stateEdited.approximateNumberOfEmployee || ""}
                        onChange={(v) => this.updateAttribute("approximateNumberOfEmployee", v)}
                        type="number"
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.businessSector"
                        value={stateEdited.businessSector || ""}
                        onChange={(v) => this.updateAttribute("businessSector", v)}
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.membershipNumber"
                        value={stateEdited.membershipNo || ""}
                        onChange={(v) => this.updateAttribute("membershipNo", v)}
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} className={classes.gridField}>
                      <TextInput
                        label="workforce.factory.groupName"
                        value={stateEdited.groupName || ""}
                        onChange={(v) => this.updateAttribute("groupName", v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* REPRESENTATIVE INFORMATION SECTION */}
              {stateEdited.workforceRepresentative && (
                <Card className={classes.sectionCard}>
                  <CardHeader
                    className={classes.sectionHeader}
                    title={
                      <Typography className={classes.sectionTitle}>
                        <PersonIcon className={classes.sectionIcon} />
                        <FormattedMessage id="workforce.factory.representativeInfo" defaultMessage="Representative Information" />
                      </Typography>
                    }
                  />
                  <CardContent className={classes.cardContent}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.name.en"
                          value={stateEdited.workforceRepresentative?.nameEn || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "nameEn", v)}
                          readOnly={isSaved}
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.name.bn"
                          value={stateEdited.workforceRepresentative?.nameBn || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "nameBn", v)}
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.position"
                          value={stateEdited.workforceRepresentative?.position || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "position", v)}
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.phone"
                          value={stateEdited.workforceRepresentative?.phoneNumber || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "phoneNumber", v)}
                          type="number"
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.email"
                          value={stateEdited.workforceRepresentative?.email || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "email", v)}
                          type="email"
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.nid"
                          value={stateEdited.workforceRepresentative?.nid || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "nid", v)}
                          type="number"
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.birthDate"
                          value={stateEdited.workforceRepresentative?.birthDate || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "birthDate", v)}
                          type="date"
                          readOnly={isSaved}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} className={classes.gridField}>
                        <TextInput
                          label="workforce.representative.passport"
                          value={stateEdited.workforceRepresentative?.passportNo || ""}
                          onChange={(v) => this.updateNestedAttribute("workforceRepresentative", "passportNo", v)}
                          readOnly={isSaved}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* DOCUMENTS SECTION */}
              <Card className={classes.sectionCard}>
                <CardHeader
                  className={classes.sectionHeader}
                  title={
                    <Typography className={classes.sectionTitle}>
                      <DescriptionIcon className={classes.sectionIcon} />
                      <FormattedMessage id="workforce.factory.uploadedDocuments" defaultMessage="Uploaded Documents" />
                    </Typography>
                  }
                />
                <CardContent className={classes.cardContent}>
                  {this.state.fetchingDocuments ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                      <CircularProgress />
                    </Box>
                  ) : this.state.documents && this.state.documents.length > 0 ? (
                    <Box style={{ marginBottom: "24px" }}>
                      <Typography variant="subtitle2" style={{ marginBottom: "16px", fontWeight: "bold" }}>
                        <FormattedMessage id="workforce.factory.currentDocuments" defaultMessage="Current Documents" />
                      </Typography>
                      <Table>
                        <TableHead>
                          <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell style={{ fontWeight: "bold" }}>
                              <FormattedMessage id="workforce.factory.documentType" defaultMessage="Document Type" />
                            </TableCell>
                            <TableCell style={{ fontWeight: "bold" }}>
                              <FormattedMessage id="workforce.factory.documentFile" defaultMessage="File Name" />
                            </TableCell>
                            <TableCell style={{ fontWeight: "bold" }}>
                              <FormattedMessage id="workforce.factory.documentStatus" defaultMessage="Status" />
                            </TableCell>
                            <TableCell style={{ fontWeight: "bold", textAlign: "center" }}>
                              <FormattedMessage id="workforce.factory.documentAction" defaultMessage="Action" />
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.documents.map((doc, index) => (
                            <TableRow key={index} style={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <DescriptionIcon style={{ marginRight: "8px", color: this.props.theme.palette.primary.main }} />
                                  <Box>
                                    <Typography variant="body2" style={{ fontWeight: "bold" }}>
                                      {doc.workforceDocumentType?.nameEn || 'Document'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {doc.workforceDocumentType?.nameBn}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {doc.path?.split('/').pop() || 'Document'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={doc.status?.toUpperCase() || 'PENDING'}
                                  color={
                                    doc.status?.toLowerCase() === 'approved'
                                      ? 'primary'
                                      : doc.status?.toLowerCase() === 'rejected'
                                      ? 'secondary'
                                      : 'default'
                                  }
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Download Document">
                                  <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => this.handleDownloadDocument(doc)}
                                    disabled={!doc.url}
                                    startIcon={<GetAppIcon />}
                                  >
                                    <FormattedMessage id="workforce.factory.viewDocument" defaultMessage="View" />
                                  </Button>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  ) : null}

                  {/* Document Upload Section */}
                  {/* <Divider style={{ margin: "16px 0" }} />
                  <Box style={{ marginTop: "16px" }}>
                    <Typography variant="h6" style={{ marginBottom: "12px", fontWeight: "bold" }}>
                      <CloudUploadIcon style={{ verticalAlign: "middle", marginRight: "8px" }} />
                      <FormattedMessage id="workforce.factory.uploadDocuments" defaultMessage="Upload Factory Documents" />
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: "16px" }}>
                      <FormattedMessage 
                        id="workforce.factory.uploadDocumentsHelp" 
                        defaultMessage="Upload new documents for this factory. Choose the document type before uploading."
                      />
                    </Typography>
                    <Box style={{ padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                      <FileUploader
                        fieldKey={`factory-document-${this.state.stateEdited.id}`}
                        onFileChange={() => {
                          // Refresh documents list after upload
                          if (this.state.stateEdited.id) {
                            this.fetchDocuments(this.state.stateEdited.id);
                          }
                        }}
                        documentHolderType="factory"
                        documentHolderId={this.state.stateEdited.id}
                      />
                    </Box>
                  </Box> */}
                </CardContent>
              </Card>

              <Divider className={classes.divider} />

              {/* ACTION BUTTONS */}
              <Box className={classes.buttonGroup}>
                <Button
                  onClick={() => window.history.back()}
                  variant="outlined"
                  className={classes.closeButton}
                  startIcon={<Close />}
                >
                  <FormattedMessage id="workforce.modal.close" />
                </Button>
                <Button
                  onClick={this.save}
                  variant="contained"
                  className={classes.saveButton}
                  startIcon={<Save />}
                  disabled={isSaveDisabled || isSaved}
                >
                  <FormattedMessage id="core.save" />
                </Button>
              </Box>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  workforceFactory: state.workforce.workforceFactory,
  userType: getUserTypeFromRights(state.core.user.i_user.rights),
});

export default connect(mapStateToProps)(
  withModulesManager(withStyles(styles)(EditWorkforceFactoryPage))
);
