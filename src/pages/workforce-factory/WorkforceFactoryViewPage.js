import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
  Box,
  CardActions,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormattedMessage,
  withModulesManager,
  withHistory,
  decodeId,
} from "@openimis/fe-core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import EventIcon from "@material-ui/icons/Event";
import PhoneIcon from "@material-ui/icons/Phone";
import EmailIcon from "@material-ui/icons/Email";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import PersonIcon from "@material-ui/icons/Person";
import GetAppIcon from "@material-ui/icons/GetApp";
import DescriptionIcon from "@material-ui/icons/Description";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import EditIcon from "@material-ui/icons/Edit";
import { fetchWorkforceFactory, updateWorkforceFactory, fetchWorkforceDocument } from "../../actions";
import FileUploader from "../../pickers/FileUploader";
import { MODULE_NAME } from "../../constants";
import { ROUTE_WORKFORCE_FACTORIES_FACTORY } from "../../routes";
import { formatLabel } from "../../utils/utils";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  card: {
    marginBottom: theme.spacing(2),
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: "white",
    padding: theme.spacing(2),
  },
  cardTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  fieldBox: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    background: "#fafafa",
    borderRadius: "4px",
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  fieldValue: {
    color: theme.palette.text.primary,
    fontSize: "1rem",
    marginTop: theme.spacing(0.5),
    wordBreak: "break-word",
  },
  statusChip: {
    marginBottom: theme.spacing(2),
  },
  repCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginTop: theme.spacing(2),
  },
  repCardContent: {
    padding: theme.spacing(2),
  },
  repField: {
    marginBottom: theme.spacing(1.5),
    display: "flex",
    alignItems: "flex-start",
  },
  repIcon: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.3),
  },
  repText: {
    flex: 1,
  },
  repLabel: {
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  repValue: {
    marginTop: theme.spacing(0.3),
    fontSize: "1rem",
  },
  buttonGroup: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  approveButton: {
    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    color: "white",
  },
  backNavButton: {
    marginRight: theme.spacing(1),
  },
  skeleton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
  },
  inlineIcon: {
    verticalAlign: "middle",
    marginRight: theme.spacing(0.5),
  },
  grayText: {
    color: theme.palette.text.disabled,
  },
  documentCard: {
    marginBottom: theme.spacing(2),
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transform: "translateY(-2px)",
    },
  },
  documentIcon: {
    fontSize: "2rem",
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  documentRow: {
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  downloadBtn: {
    textTransform: "none",
    marginLeft: theme.spacing(1),
  },
  documentType: {
    display: "inline-block",
    padding: theme.spacing(0.5, 1),
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    marginRight: theme.spacing(1),
  },
  noDocuments: {
    textAlign: "center",
    padding: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
}));

const WorkforceFactoryViewPage = ({ match, history, modulesManager }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const workforceFactoryUuid = match.params.workforce_factory_uuid;
  const [approveDialog, setApproveDialog] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [fetchingDocuments, setFetchingDocuments] = useState(false);

  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || 'en';

  const { factory, fetching, approving } = useSelector((state) => {
    const factoryData = state.workforce.workforceFactory || {};
    return {
      factory: Array.isArray(factoryData)
        ? factoryData[0]
        : factoryData,
      fetching: state.workforce.fetchingWorkforceFactory,
      approving: state.workforce.submittingMutation,
    };
  });

  useEffect(() => {
    if (workforceFactoryUuid) {
      dispatch(
        fetchWorkforceFactory(modulesManager, [`id: "${workforceFactoryUuid}"`])
      );
    }
  }, [workforceFactoryUuid, dispatch, modulesManager]);

  // Fetch documents for this factory
  useEffect(() => {
    if (factory?.id) {
      setFetchingDocuments(true);
      const factoryId = factory.id;
      dispatch(
        fetchWorkforceDocument(modulesManager, [
          `holderType: "factory"`,
          `workforceFactoryId: "${factoryId}"`,
        ])
      ).then((response) => {
        if (response?.payload?.data?.workforceDocuments?.edges) {
          const docs = response.payload.data.workforceDocuments.edges.map(edge => edge.node);
          setDocuments(docs);
        }
        setFetchingDocuments(false);
      }).catch((error) => {
        console.error("Error fetching documents:", error);
        setFetchingDocuments(false);
      });
    }
  }, [factory?.id, dispatch, modulesManager]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const factoryData = {
        id: factory.id,
        nameEn: factory.nameEn,
        nameBn: factory.nameBn,
        status: "active",
        phoneNumber: factory.phoneNumber,
        email: factory.email,
        address: factory.address,
        associationType: factory.associationType,
        website: factory.website,
        location: factory.location,
        workforceRepresentativeId: factory.workforceRepresentative?.id,
        company: factory.workforceEmployer?.id,
      };

      dispatch(
        updateWorkforceFactory(
          factoryData,
          `Approve Workforce Factory ${factory.nameEn}`
        )
      );
      setApproveDialog(false);
      // Reload the page after approval
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error approving factory:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const formatLocationName = (location) => {
    if (!location) return "N/A";
    if (typeof location === "string") return location;
    const parts = [];
    if (location.name) parts.push(location.name);
    if (location.parent?.name) parts.push(location.parent.name);
    if (location.parent?.parent?.name) parts.push(location.parent.parent.name);
    return parts.join(", ") || "N/A";
  };

  // Translation helper
  const t = (enText, bnText) => {
    return locale === 'fr' ? bnText : enText;
  };

  // Handle document download
  const handleDownloadDocument = (doc) => {
    if (doc?.url) {
      const fullUrl = window.location.origin + doc.url;
      window.open(fullUrl, '_blank');
    }
  };

  // Get document type color
  const getDocumentTypeColor = (documentType) => {
    const colors = {
      'pdf': '#ff6b6b',
      'image': '#4ecdc4',
      'document': '#45b7d1',
      'certificate': '#96ceb4',
      'license': '#ffeaa7',
      'other': '#dfe6e9',
    };
    return colors[documentType?.toLowerCase()] || '#dfe6e9';
  };

  if (fetching) {
    return (
      <div className={classes.root}>
        <div className={classes.skeleton}>
          <CircularProgress size={60} />
        </div>
      </div>
    );
  }

  if (!factory || Object.keys(factory).length === 0) {
    return (
      <div className={classes.root}>
        <div className={classes.skeleton}>
          <Typography variant="h6" color="textSecondary">
            Factory not found
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {/* Header Section */}
      <Box className={classes.header}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.goBack()}
            className={classes.backNavButton}
          >
            {t('Back', 'ফিরে যান')}
          </Button>
          <Typography variant="h4" className={classes.title}>
            {t('Factory Details', 'ফ্যাক্টরি বিবরণ')}
          </Typography>
        </Box>
        <Chip
          label={factory.status?.toUpperCase() || "PENDING"}
          color={getStatusColor(factory.status)}
          variant="outlined"
          className={classes.statusChip}
        />
        {/* Action Buttons */}
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => history.push(`/${ROUTE_WORKFORCE_FACTORIES_FACTORY}/${workforceFactoryUuid}`)}
          style={{ borderColor: '#667eea', color: '#667eea', fontWeight: '600' }}
        >
          {t('Edit Factory', 'ফ্যাক্টরি সম্পাদনা করুন')}
        </Button>
        {factory.status?.toLowerCase() !== "active" && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            onClick={() => setApproveDialog(true)}
            disabled={approving || isApproving}
            className={classes.approveButton}
          >
            {approving ? t('Approving...', 'অনুমোদন করছে...') : t('Approve Factory', 'ফ্যাক্টরি অনুমোদন করুন')}
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {/* Main Info Card */}
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Typography className={classes.cardTitle}>
                  {factory.nameEn}
                </Typography>
              }
              subheader={
                factory.nameBn && (
                  <Typography style={{ color: "rgba(255,255,255,0.8)" }}>
                    {factory.nameBn}
                  </Typography>
                )
              }
            />
            <CardContent>
              <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                  <Box className={classes.fieldBox}>
                    <Typography className={classes.fieldLabel}>
                      {t('Association Type', 'সংস্থার ধরন')}
                    </Typography>
                    <Typography className={classes.fieldValue}>
                      {factory.associationType || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box className={classes.fieldBox}>
                    <Typography className={classes.fieldLabel}>
                      {t('Status', 'অবস্থা')}
                    </Typography>
                    <Typography className={classes.fieldValue}>
                      <Chip
                        size="small"
                        label={factory.status?.toUpperCase() || "N/A"}
                        color={getStatusColor(factory.status)}
                      />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box className={classes.fieldBox}>
                    <Typography className={classes.fieldLabel}>
                      {t('License Type', 'লাইসেন্স ধরন')}
                    </Typography>
                    <Typography className={classes.fieldValue}>
                      {factory.licenseType || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Typography className={classes.cardTitle}>
                  {t('Contact Information', 'যোগাযোগ তথ্য')}
                </Typography>
              }
            />
            <CardContent>
              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  <PhoneIcon className={classes.inlineIcon} fontSize="small" />
                  {t('Phone Number', 'ফোন নম্বর')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.phoneNumber || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  <EmailIcon className={classes.inlineIcon} fontSize="small" />
                  {t('Email', 'ইমেইল')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.email || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Website', 'ওয়েবসাইট')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.website ? (
                    <a href={factory.website} target="_blank" rel="noopener noreferrer">
                      {factory.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Location & Address */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Typography className={classes.cardTitle}>
                  {t('Location & Address', 'অবস্থান এবং ঠিকানা')}
                </Typography>
              }
            />
            <CardContent>
              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  <LocationOnIcon className={classes.inlineIcon} fontSize="small" />
                  {t('Factory Location', 'ফ্যাক্টরি অবস্থান')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {formatLocationName(factory.location)}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Factory Address', 'ফ্যাক্টরি ঠিকানা')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.address || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  <LocationOnIcon className={classes.inlineIcon} fontSize="small" />
                  {t('Office Location', 'অফিস অবস্থান')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {formatLocationName(factory.officeLocation)}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Office Address', 'অফিস ঠিকানা')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.officeAddress || "N/A"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Factory Details */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Typography className={classes.cardTitle}>
                  {t('Factory Information', 'ফ্যাক্টরি তথ্য')}
                </Typography>
              }
            />
            <CardContent>
              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  <EventIcon className={classes.inlineIcon} fontSize="small" />
                  {t('Est. Establishment Date', 'প্রাক্তন প্রতিষ্ঠাতা তারিখ')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.dateOfFactoryEstablishment || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('EIS Incorporation Date', 'EIS ইনকর্পোরেশন তারিখ')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.dateOfEisIncorporation || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Registration Date', 'নিবন্ধন তারিখ')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.registrationDate || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Registration Expiry Date', 'নিবন্ধন মেয়াদ শেষের তারিখ')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.registrationExpiryDate || "N/A"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Details */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Typography className={classes.cardTitle}>
                  {t('Additional Details', 'অতিরিক্ত বিবরণ')}
                </Typography>
              }
            />
            <CardContent>
              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Approx. Number of Employees', 'আনুমানিক কর্মচারী সংখ্যা')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.approximateNumberOfEmployee || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Lima Registration Number', 'লিমা নিবন্ধন নম্বর')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.limaRegistrationNumber || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('License Number', 'লাইসেন্স নম্বর')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.licenseNo || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Business Sector', 'ব্যবসায়িক খাত')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.businessSector || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Membership Number', 'সদস্যপদ নম্বর')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.membershipNo || "N/A"}
                </Typography>
              </Box>

              <Box className={classes.fieldBox}>
                <Typography className={classes.fieldLabel}>
                  {t('Group Name', 'গ্রুপ নাম')}
                </Typography>
                <Typography className={classes.fieldValue}>
                  {factory.groupName || "N/A"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Representative Information */}
        {factory.workforceRepresentative && (
          <Grid item xs={12}>
            <Card className={`${classes.card} ${classes.repCard}`}>
              <CardHeader
                title={
                  <Typography
                    className={classes.cardTitle}
                    style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}
                  >
                    <PersonIcon style={{ marginRight: "8px" }} />
                    {t('Representative Information', 'প্রতিনিধি তথ্য')}
                  </Typography>
                }
              />
              <CardContent className={classes.repCardContent}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('Name (English)', 'নাম (ইংরেজি)')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.nameEn || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('Name (Bangla)', 'নাম (বাংলা)')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.nameBn || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('Position', 'অবস্থান')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.position || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('Phone', 'ফোন')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.phoneNumber || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('Email', 'ইমেইল')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.email || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('NID', 'জাতীয় পরিচয়পত্র')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.nid || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('Birth Date', 'জন্মতারিখ')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.birthDate || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box className={classes.repField}>
                      <Box className={classes.repText}>
                        <Typography className={classes.repLabel}>
                          {t('Passport Number', 'পাসপোর্ট নম্বর')}
                        </Typography>
                        <Typography className={classes.repValue}>
                          {factory.workforceRepresentative.passportNo || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Documents Section */}
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Typography className={classes.cardTitle}>
                  <DescriptionIcon style={{ marginRight: "8px", verticalAlign: "middle" }} />
                  {t('Uploaded Documents', 'আপলোড করা নথি')}
                </Typography>
              }
            />
            <CardContent>
              {fetchingDocuments ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : documents && documents.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {t('Document Type', 'নথির ধরন')}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {t('File Name', 'ফাইলের নাম')}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {t('File Type', 'ফাইলের ধরন')}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {t('Status', 'অবস্থা')}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold", textAlign: "center" }}>
                        {t('Action', 'কর্ম')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc, index) => (
                      <TableRow key={index} className={classes.documentRow}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <DescriptionIcon className={classes.documentIcon} />
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
                          <Typography variant="caption" color="textSecondary">
                            {t('Uploaded', 'আপলোড করা হয়েছে')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatLabel(doc.documentType)|| '--'}
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
                          <Tooltip title={t('Download Document', 'নথি ডাউনলোড করুন')}>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => handleDownloadDocument(doc)}
                              disabled={!doc.url}
                              className={classes.downloadBtn}
                            >
                              {locale === 'fr' ? 'নথিটি দেখুন' : 'See Document'}
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box className={classes.noDocuments}>
                  <DescriptionIcon style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }} />
                  <Typography variant="body2">
                    {t('No documents uploaded for this factory', 'এই ফ্যাক্টরির জন্য কোনো নথি আপলোড করা হয়নি')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('Confirm Approval', 'অনুমোদন নিশ্চিত করুন')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {t('Are you sure you want to approve this factory?', 'আপনি কি এই ফ্যাক্টরি অনুমোদন করতে নিশ্চিত?')}
          </Typography>
          <Typography variant="body1" style={{ fontWeight: "bold" }}>
            {factory.nameEn}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {t('This action will change the factory status to "active".', 'এই পদক্ষেপটি ফ্যাক্টরির অবস্থা "সক্রিয়" এ পরিবর্তন করবে।')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>{t('Cancel', 'বাতিল করুন')}</Button>
          <Button
            onClick={handleApprove}
            color="primary"
            variant="contained"
            disabled={isApproving}
          >
            {isApproving ? t('Approving...', 'অনুমোদন করছে...') : t('Confirm', 'নিশ্চিত করুন')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default withModulesManager(withHistory(WorkforceFactoryViewPage));
