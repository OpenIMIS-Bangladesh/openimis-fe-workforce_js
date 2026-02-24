import React, { useMemo, useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Card,
  CardContent,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@material-ui/core";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage, decodeId, TextInput } from "@openimis/fe-core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import FileUploader from "../../pickers/FileUploader";
import DocumentReviewAccordion from "../application-process/DocumentReviewAccordion";
import { banglaLabels, ORGANIZATION_TYPE_NAME_BN, ORGANIZATION_TYPE_NAME_EN, STATUS_MAP_BN, STATUS_MAP_EN, WORKFORCE_USER_TYPE } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { conditionalEnToBn, enToBn, fixBrokenUnicode, getUserType, safeDecodeId } from "../../utils/utils";
import { updateApplication } from "../../actions";
import DoctorsEntries from "./Atoms/DoctorsEntries";
import EisFactoryAdminModal from "./EisFactoryAdminModal";
import ApplicationMovementStepper from "../shared/ApplicationMovementStepper";
import CompensationFormModal from "./CompensationFormModal";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  sidebar: {
    padding: theme.spacing(2),
    background: "#f5f5f5",
    borderRadius: 8,
  },
  accordion: {
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    textTransform: "capitalize",
  },
  titleColor: {
    background: "#EEFBFF",
  },
  itemRow: {
    marginBottom: theme.spacing(0.5),
  },
  label: {
    fontWeight: "bold",
    color: "#555",
    marginRight: 6,
  },
  value: {
    color: "#222",
    wordBreak: "break-word",
  },
  nestedCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    background: "#fafafa",
    borderRadius: 8,
  },
  bulkActionContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    background: "#e3f2fd",
    borderRadius: 8,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  verificationBox: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    borderTop: "1px dashed #ccc",
    backgroundColor: "#fffdf0", // Light yellow tint to distinguish verification area
  },
}));

// ... [hiddenKeys, formatKey, tryParse, isEmpty functions remain unchanged] ...
const hiddenKeys = [
  "id",
  "uuid",
  "__typename",
  "applicationId",
  "parent",
  "code",
  "type",
  "employeeFactory",
  "associationType",
  "applicationFor",
  "employeeDependentInfo",
  "employeeBankInfo",
  "educations",
  "applicationForSelf",
  "insuranceNumber",
  "grantMoney",
  "relatedUser",
  "doctorsDiagnosis",
  "doctorsFlag",
  "doctorsRecommendedDonation",
  "lastBaseSalary",
  "doctorsFlagNote",
  "eisApprovedAmount",
  "eisCalculatedAmount",
  "eisPaymentType",
  "eisInitialMonthlyAmount",
  "eisMonthlyAmount",
  "initialReplacementRate",
  "eisApplicationSummary",
  "cfApplicationSummary",
  "blwfApplicationSummary",
  "pvFactor",
  "dependentId",
  "attachments",
  "dateCreated",
  "doctorsEntry",
  "wCode",
  "applicantInfoVerification",
  "applicantInfoVerificationRemarks",
  "deceasedWorkerInfoVerification",
  "deceasedWorkerInfoVerificationRemarks",
  "doctorsEntryVerification",
  "doctorsEntryVerificationRemarks",
  "employeeAccidentInfoVerification",
  "employeeAccidentInfoVerificationRemarks",
  "employeeBankInfoVerification",
  "employeeBankInfoVerificationRemarks",
  "employeeChildrenInfoVerification",
  "employeeChildrenInfoVerificationRemarks",
  "employeeDependentInfoVerification",
  "employeeDependentInfoVerificationRemarks",
  "institutionInfoVerification",
  "institutionInfoVerificationRemarks",
  "metadataVerification",
  "metadataVerificationRemarks",
  "workforceEmployeeVerification",
  "workforceEmployeeVerificationRemarks",
  "metadata",
  "workforceFactoryId",
];

const formatKey = (key, language) => {
  const cleanKey = key.split(".").pop();
  if (["fr", "bangla", "bd"].includes(language) && banglaLabels[cleanKey]) {
    return banglaLabels[cleanKey];
  }
  return cleanKey
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const tryParse = (value) => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    } catch {
      return value;
    }
  }
  return value;
};

const isEmpty = (value) => {
  if (value == null) return true;
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    return value.every((item) => item == null || (typeof item === "object" && Object.keys(item).length === 0));
  }
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};
const formatAddress = (locationData, addressData) => {
  // TryParse handles both JSON strings and objects
  const address = fixBrokenUnicode(tryParse(addressData)) || {};
  const location = fixBrokenUnicode(tryParse(locationData)) || {};

  const postOffice = fixBrokenUnicode(address?.postOffice?.nameBn || address?.postOffice?.nameEn || "—");
  const village = [fixBrokenUnicode(address.houseName), fixBrokenUnicode(address.paraMahalla), fixBrokenUnicode(address.villageRoad)].filter(Boolean).join(", ");

  // Navigate location parents for Thana/District
  const thana = location?.parent?.name || location?.name; // Fallback if structure varies
  const district = location?.parent?.parent?.name || location?.parent?.name;

  return {
    village,
    postOffice,
    thana,
    district,
  };
};

/**
 * Recursive renderer for objects & arrays in Grid format
 */
const renderDetails = (
  data,
  classes,
  parentKey = "",
  language,
  fileStates,
  handleCommentChange,
  handleFileVerify,
  handleFileReject,
  eligibilityMap,
  handleEligibilityChange,
  user_type,
  remarksMap, // <--- NEW ARGUMENT
  handleRemarksChange,
) => {
  if (!data) return null;

  // --- UPDATED: Merge Logic to support formatAddress ---
  const mergeAddressAndLocation = (obj) => {
    const parsedObj = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, tryParse(v)]));
    const newObj = { ...parsedObj };
    if (parsedObj.presentAddress || parsedObj.presentLocation) {
      newObj.presentAddressAndLocation = { locationData: parsedObj.presentLocation, addressData: parsedObj.presentAddress };
      delete newObj.presentAddress;
      delete newObj.presentLocation;
    }
    if (parsedObj.permanentAddress || parsedObj.permanentLocation) {
      newObj.permanentAddressAndLocation = { locationData: parsedObj.permanentLocation, addressData: parsedObj.permanentAddress };
      delete newObj.permanentAddress;
      delete newObj.permanentLocation;
    }
    return newObj;
  };
  const mergedData =
    typeof data === "object" && !Array.isArray(data)
      ? mergeAddressAndLocation(data)
      : Array.isArray(data)
        ? data.map((item) => (typeof item === "object" ? mergeAddressAndLocation(item) : tryParse(item)))
        : tryParse(data);

  // const mergedData =
  //   typeof data === "object" && !Array.isArray(data)
  //     ? mergeAddressAndLocation(data)
  //     : Array.isArray(data)
  //     ? data.map((item) => (typeof item === "object" ? mergeAddressAndLocation(item) : tryParse(item)))
  //     : tryParse(data);

  // Handle arrays of objects
  if (Array.isArray(mergedData)) {
    return mergedData.map((item, idx) => {
      if (typeof item !== "object" || !item) return null;

      const scalars = Object.entries(item).filter(
        ([key, value]) => typeof value !== "object" && ![...hiddenKeys].includes(key) && value !== null && value !== undefined && value !== "",
      );
      const objects = Object.entries(item).filter(
        ([key, value]) => typeof value === "object" && value && ![...hiddenKeys, "attachments", "employeeBankingDependents"].includes(key),
      );

      let matchingFiles = [];
      if (parentKey === "workforceEmployeeDependentApplication" && item?.id && fileStates) {
        matchingFiles = fileStates.map((f, i) => ({ ...f, _originalIndex: i })).filter((f) => f?.workforceDependent?.id === item.id);
      }
      if (parentKey === "employeeBankingInfoApplication" && item?.id && fileStates) {
        matchingFiles = fileStates.map((f, i) => ({ ...f, _originalIndex: i })).filter((f) => f?.workforceEmployeeBankingInfo?.id === item.id);
      }

      const isAllowedUser = [WORKFORCE_USER_TYPE.EIS_COORDINATOR, WORKFORCE_USER_TYPE.EIS_OFFICER].includes(user_type);

      return (
        <Card key={idx} className={classes.nestedCard}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold", fontSize: "large" }}>
              {formatKey(parentKey, language)} {enToBn(idx + 1)}
            </Typography>
            <Divider style={{ marginBottom: 12 }} />

            <Grid container spacing={2}>
              {scalars.map(([key, value]) => (
                <Grid item xs={6} key={key} className={classes.itemRow}>
                  <Typography variant="body1" className={classes.value}>
                    <span className={classes.label} style={{ fontWeight: "bold" }}>
                      {formatKey(key, language)}:
                    </span>{" "}
                    <FormattedMessage id={value} module={"workforce"} />
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {objects.map(([key, value]) => (
              <Box key={key} mt={2}>
                <Typography
                  variant="subtitle1"
                  className={classes.label}
                  style={{
                    fontWeight: "bold",
                    fontSize: "large",
                    background: "#EEFBFF",
                    padding: 3,
                  }}
                >
                  {key === "presentAddressAndLocation"
                    ? language === "en"
                      ? "Present Address & Location"
                      : "বর্তমান ঠিকানা"
                    : key === "permanentAddressAndLocation"
                      ? language === "en"
                        ? "Permanent Address & Location"
                        : "স্থায়ী ঠিকানা"
                      : formatKey(key, language)}
                </Typography>

                {/* --- RECURSIVE CALL --- */}
                {renderDetails(
                  value,
                  classes,
                  key,
                  language,
                  fileStates,
                  handleCommentChange,
                  handleFileVerify,
                  handleFileReject,
                  eligibilityMap,
                  handleEligibilityChange,
                  user_type,
                  remarksMap,
                  handleRemarksChange,
                )}
              </Box>
            ))}

            {/* ... [Dependent File Logic and Save Buttons remain here] ... */}
            {matchingFiles.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6" style={{ marginTop: 3, marginBottom: 5 }}>
                  <FormattedMessage module="workforce" id="workforce.employee.document" />
                </Typography>
                {matchingFiles.map((file) => (
                  <DocumentReviewAccordion
                    key={file._originalIndex}
                    file={file}
                    index={file._originalIndex}
                    onCommentChange={handleCommentChange}
                    onVerify={handleFileVerify}
                    onReject={handleFileReject}
                    locale={language}
                  />
                ))}
              </Box>
            )}

            {parentKey === "workforceEmployeeDependentApplication" && isAllowedUser && (
              <Box mt={3} p={2} style={{ background: "#f0f7ff", borderRadius: 8, border: "1px solid #d1e3f0" }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Radio Buttons (Left Side) */}
                  <Grid item xs={12} md={6}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333", marginBottom: 8 }}>
                        {language === "en" ? "Is beneficiary eligible?" : "উপকারভোগী কি যোগ্য?"}
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-label="eligibility"
                        name={`eligibility-${item.id}`}
                        value={
                          eligibilityMap?.[item.id] !== undefined
                            ? eligibilityMap[item.id]
                            : item?.isEligible === true
                              ? "yes"
                              : item?.isEligible === false
                                ? "no"
                                : ""
                        }
                        onChange={(e) => handleEligibilityChange(item.id, e.target.value)}
                      >
                        <FormControlLabel value="yes" control={<Radio color="primary" />} label={language === "en" ? "Yes" : "হ্যাঁ"} />
                        <FormControlLabel value="no" control={<Radio color="primary" />} label={language === "en" ? "No" : "না"} />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  {/* NEW: Remarks Field (Right Side) */}
                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={language === "en" ? "Remarks" : "মন্তব্য"}
                      placeholder={language === "en" ? "Enter remarks here..." : "এখানে মন্তব্য লিখুন..."}
                      value={remarksMap?.[item.id] !== undefined ? remarksMap[item.id] : item?.remarks || ""}
                      onChange={(value) => handleRemarksChange(item.id, value)}
                      fullWidth
                      multiline
                      required={eligibilityMap[item.id]}
                      error={eligibilityMap[item.id]}
                      helperText={
                        eligibilityMap[item?.id] &&
                        (!remarksMap[item?.id] || remarksMap[item?.id].trim() === "")
                                ? language === "en"
                                  ? "Remarks required"
                                  : "মন্তব্য আবশ্যক"
                                : ""
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      );
    });
  }

  // Handle object data
  if (typeof mergedData === "object" && mergedData !== null) {
    if (parentKey === "presentAddressAndLocation" || parentKey === "permanentAddressAndLocation") {
      const { village, postOffice, thana, district } = formatAddress(mergedData.locationData, mergedData.addressData);
      return (
        <Grid container spacing={2}>
          <Grid item xs={6} className={classes.itemRow}>
            <Typography variant="body1" className={classes.value}>
              <span className={classes.label}>{language === "en" ? "Village/Road/House" : "গ্রাম/রাস্তা/বাড়ি"}:</span> {village || "—"}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.itemRow}>
            <Typography variant="body1" className={classes.value}>
              <span className={classes.label}>{language === "en" ? "Post Office" : "পোস্ট অফিস"}:</span> {postOffice || "—"}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.itemRow}>
            <Typography variant="body1" className={classes.value}>
              <span className={classes.label}>{language === "en" ? "Thana" : "থানা"}:</span> {thana || "—"}
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.itemRow}>
            <Typography variant="body1" className={classes.value}>
              <span className={classes.label}>{language === "en" ? "District" : "জেলা"}:</span> {district || "—"}
            </Typography>
          </Grid>
        </Grid>
      );
    }
    const scalars = Object.entries(mergedData).filter(
      ([key, value]) => typeof value !== "object" && !hiddenKeys.includes(key) && value !== null && value !== undefined && value !== "",
    );
    const objects = Object.entries(mergedData).filter(([key, value]) => {
      const parsed = tryParse(value);
      return typeof parsed === "object" && parsed && !hiddenKeys.includes(key);
    });

    return (
      <Grid container spacing={2}>
        {scalars.map(([key, value]) => (
          <Grid item xs={6} key={key} className={classes.itemRow}>
            <Typography variant="body1" className={classes.value}>
              <span className={classes.label} style={{ fontWeight: "bold" }}>
                {formatKey(key, language)}:
              </span>{" "}
              <FormattedMessage id={value} module={"workforce"} />
            </Typography>
          </Grid>
        ))}
        {objects.map(([key, value]) => {
          const parsedValue = tryParse(value);
          return (
            <Grid item xs={12} key={key}>
              <Typography variant="subtitle1" className={classes.label} style={{ fontWeight: "bold", fontSize: "large", background: "#EEFBFF", padding: 3 }}>
                {formatKey(key, language)}
              </Typography>
              {renderDetails(
                parsedValue,
                classes,
                key,
                language,
                fileStates,
                handleCommentChange,
                handleFileVerify,
                handleFileReject,
                eligibilityMap,
                handleEligibilityChange,
                user_type,
                remarksMap,
                handleRemarksChange,
              )}
            </Grid>
          );
        })}
      </Grid>
    );
  }

  return null;
};

const PREFERRED_SECTION_ORDER = [
  "workforceEmployee",
  "deceasedWorkerInfo",
  "applicantInfo",
  "workforceEmployeeDependentApplication",
  // "employeeBankInfo",
  "employeeBankingInfoApplication",
];

// 2. Define keys to ignore (these were previously inside your map function)
const IGNORED_KEYS = ["applicationType", "organizationType", "trackingNumber", "status", "grantAmount", "submittedBy", "dateCreated", "employeeDependentInfo"];

const VERIFICATION_FIELD_MAP = {
  applicantInfo: {
    statusKey: "applicantInfoVerification",
    remarksKey: "applicantInfoVerificationRemarks",
  },
  deceasedWorkerInfo: {
    statusKey: "deceasedWorkerInfoVerification",
    remarksKey: "deceasedWorkerInfoVerificationRemarks",
  },
  doctorsEntry: {
    statusKey: "doctorsEntryVerification",
    remarksKey: "doctorsEntryVerificationRemarks",
  },
  employeeAccidentInfo: {
    statusKey: "employeeAccidentInfoVerification",
    remarksKey: "employeeAccidentInfoVerificationRemarks",
  },
  employeeBankingInfoApplication: {
    statusKey: "employeeBankInfoVerification",
    remarksKey: "employeeBankInfoVerificationRemarks",
  },
  workforceEmployeeDependentApplication: {
    statusKey: "employeeDependentInfoVerification",
    remarksKey: "employeeDependentInfoVerificationRemarks",
  },
  employeeChildrenInfo: {
    statusKey: "employeeChildrenInfoVerification",
    remarksKey: "employeeChildrenInfoVerificationRemarks",
  },
  institutionInfo: {
    statusKey: "institutionInfoVerification",
    remarksKey: "institutionInfoVerificationRemarks",
  },
  metadata: {
    statusKey: "metadataVerification",
    remarksKey: "metadataVerificationRemarks",
  },
  workforceEmployee: {
    statusKey: "workforceEmployeeVerification",
    remarksKey: "workforceEmployeeVerificationRemarks",
  },
};

const ApplicationViewPage = ({
  application,
  filteredDocumentTypes,
  applicationUuid,
  onFileChange,
  fileStates,
  handleCommentChange,
  handleFileVerify,
  handleFileReject,
  viewedFromFlag,
  movementLogs,
}) => {
  const classes = useStyles();
  const language = useSelector((state) => state.core?.user?.i_user?.language);
  const user_type = getUserType();
  const dispatch = useDispatch();
  const [lastSalaryAmount, setLastSalaryAmount] = useState("");
  const [openAccidentInfoModal, setOpenAccidentInfoModal] = useState(false);
  const [openCompensationInfoModal, setOpenCompensationInfoModal] = useState(false);
  const [openSalaryButton, setOpenSalaryButton] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Eligibility State ---
  const [eligibilityMap, setEligibilityMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [verificationState, setVerificationState] = useState({});

  useEffect(() => {
    if (application) {
      const initialState = {};
      Object.keys(VERIFICATION_FIELD_MAP).forEach((sectionKey) => {
        const config = VERIFICATION_FIELD_MAP[sectionKey];
        if (application[config.statusKey] || application[config.remarksKey]) {
          initialState[sectionKey] = {
            status: application[config.statusKey],
            remarks: application[config.remarksKey] || "",
          };
        }
      });
      setVerificationState(initialState);
    }
  }, [application]);

  const handleVerificationChange = (sectionKey, field, value) => {
    setVerificationState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const saveVerification = (sectionKey) => {
    setLoading(true);
    const config = VERIFICATION_FIELD_MAP[sectionKey];
    if (!config) return;

    const currentData = verificationState[sectionKey] || {};

    const payload = {
      id: application.id,
      [config.statusKey]: currentData.status,
      [config.remarksKey]: currentData.remarks,
    };

    console.log("hello from verification update", payload);

    dispatch(updateApplication(payload, `Update verification for ${sectionKey}`)).then(() => setLoading(false));
    // Optional: reload or show toast
    // .then(() => window.location.reload());
  };

  // 1. Update Local Map
  const handleEligibilityChange = (id, value) => {
    setEligibilityMap((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleRemarksChange = (id, value) => {
    setRemarksMap((prev) => ({ ...prev, [id]: value }));
  };

  // 2. Bulk Save Function
  const handleSaveAllDependents = () => {
    setLoading(true);
    const currentDependents = application?.workforceEmployeeDependentApplication || [];

    const formattedDependentsList = currentDependents.map((dep) => {
      // --- Existing Eligibility Logic ---
      let updatedIsEligible = dep.isEligible;
      if (eligibilityMap.hasOwnProperty(dep.id)) {
        updatedIsEligible = eligibilityMap[dep.id] === "yes";
      }

      // --- NEW: Remarks Logic ---
      let updatedRemarks = dep.remarks; // Default to existing DB value
      if (remarksMap.hasOwnProperty(dep.id)) {
        updatedRemarks = remarksMap[dep.id]; // Override if user typed something
      }

      // --- Existing Attachment Logic ---
      let parsedAttachments = dep.attachments;
      if (typeof dep.attachments === "string") {
        try {
          parsedAttachments = JSON.parse(dep.attachments);
        } catch (error) {
          console.warn("Error parsing attachments for dependent", dep.id, error);
          parsedAttachments = [];
        }
      }

      return {
        ...dep,
        isEligible: updatedIsEligible,
        remarks: updatedRemarks, // <--- Add this field to the payload
        isDisabled: dep.disabilityStatus,
        relationType: dep.relationWithWorker,
        attachments: parsedAttachments,
      };
    });

    const payload = {
      id: application.id,
      employeeDependentInfo: JSON.stringify(formattedDependentsList).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
    };
    console.log("update application payload", payload);
    dispatch(updateApplication(payload, "update workforce dependent info")).then(() => {
      setLoading(false);
      window.location.reload();
    });
  };

  const hasUnsavedChanges = Object.keys(eligibilityMap).length > 0 || Object.keys(remarksMap).length > 0;

  const handleLastSalaryAmount = (amount) => {
    setOpenSalaryButton(true);
    const updateApplicationData = {
      id: application?.id,
      lastBaseSalary: amount,
    };
    dispatch(updateApplication(updateApplicationData, "update workforce application")).then(() => {
      setOpenSalaryButton(false);
      window.location.reload();
    });
  };

  // Sidebar summary fields
  const sidebarFields = useMemo(
    () => ({
      ApplicantName:
        language === "en"
          ? (application?.workforceEmployee?.firstNameEn || application?.workforceEmployee?.nameEn) +
            " " +
            (application?.workforceEmployee?.lastNameEn != null ? application?.workforceEmployee?.lastNameEn : "")
          : (application?.workforceEmployee?.firstNameBn || application?.workforceEmployee?.nameBn) +
            " " +
            (application?.workforceEmployee?.lastNameBn != null ? application?.workforceEmployee?.lastNameBn : ""),
      ApplicantFactoryName: language === "en" ? application?.employeeFactory?.nameEn : application?.employeeFactory?.nameBn,
      ...((user_type === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
        user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
        user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION ||
        user_type === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION) && {
        FactoryMembershipNo: application?.employeeFactory?.membershipNo || "—",
        FactoryRegistrationDate: application?.employeeFactory?.registrationDate
          ? conditionalEnToBn(application.employeeFactory.registrationDate.split("T")[0], language)
          : "—",
        FactoryRegistrationExpiryDate: application?.employeeFactory?.registrationExpiryDate
          ? conditionalEnToBn(application.employeeFactory.registrationExpiryDate.split("T")[0], language)
          : "—",
      }),
      ...(application?.applicationType !=="financialAssistance" && {
        ApplicantDesignation: application?.workforceEmployee?.position,
      }),
      
      ...(user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && {
        lastGrossSalary: application?.lastBaseSalary || "—",
      }),
      ApplicationType:
        (language === "en" ? application?.grantMoney?.applicationTypeNameEn : application?.grantMoney?.applicationTypeNameBn) || application?.applicationType,
      OrganizationType: language === "en" ? ORGANIZATION_TYPE_NAME_EN[application?.organizationType] : ORGANIZATION_TYPE_NAME_BN[application?.organizationType],
      TrackingNumber: application.trackingNumber,
      Status: language === "en" ? STATUS_MAP_EN[application.status] : STATUS_MAP_BN[application?.status],
      SubmittedBy: application.submittedBy === "applicant" ? (language === "en" ? "Applicant" : "আবেদনকারী") : application.submittedBy,
      CreatedDate: conditionalEnToBn(application?.dateCreated?.split("T")[0] || "—", language),
      ApplicationFor:
        application?.applicationFor == "self" ? (language === "en" ? "Self" : "নিজের জন্য") : language === "en" ? "Dependent" : "নির্ভরশীলের জন্য",
    }),
    [application],
  );

  const mapFormStepNo = (fileStepNo, sectionKey, application) => {
    const isDeathCase = ["financialAssistance", "deadlyGrant"].includes(application?.applicationType);
    if (isDeathCase && fileStepNo === "workforceEmployee") {
      return "deceasedWorkerInfo";
    }
    return fileStepNo;
  };
  const isNotEmpty = (value) => !isEmpty(value);

  // Check if user is allowed to save dependents
  const isAllowedUser = [WORKFORCE_USER_TYPE.EIS_COORDINATOR, WORKFORCE_USER_TYPE.EIS_OFFICER].includes(user_type);
  // const hasUnsavedChanges = Object.keys(eligibilityMap).length > 0;

  const sortedKeys = useMemo(() => {
    if (!application) return [];
    const appKeys = Object.keys(application);
    const ordered = PREFERRED_SECTION_ORDER.filter((key) => appKeys.includes(key));
    const allIgnored = [
      ...IGNORED_KEYS,
      ...hiddenKeys.filter((item) =>
        !application?.status && (item === "employeeBankInfo" || item === "employeeDependentInfo" || item === "metadata") ? false : true,
      ),
    ];

    const others = appKeys.filter((key) => !PREFERRED_SECTION_ORDER.includes(key) && !allIgnored.includes(key));
    return [...ordered, ...others];
  }, [application]);

  const RESTRICTED_VERIFICATION_ROLES = [
    WORKFORCE_USER_TYPE.APPLICANT,
    WORKFORCE_USER_TYPE.EIS_ADVISOR,
    WORKFORCE_USER_TYPE.EIS_COMMITTEE,
    WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE,
  ];

  console.log({ view: application });
  console.log({ verificationState });

  return (
    <>
      <Grid container spacing={3} className={classes.root}>
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* ... [Sidebar content remains unchanged] ... */}
          <Paper className={classes.sidebar}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "bold" }}>
              <FormattedMessage module="workforce" id="workforce.application.info" />
            </Typography>
            <Divider />
            <Box mt={2}>
              {Object.entries(sidebarFields).map(([label, value]) => (
                <Typography variant="body1" className={classes.value}>
                  <span className={classes.label} style={{ fontWeight: "bold" }}>
                    {formatKey(label, language)}:
                  </span>{" "}
                  {value || "—"}
                </Typography>
              ))}
            </Box>
          </Paper>
          {viewedFromFlag === "view" && <ApplicationMovementStepper data={movementLogs} language={language} />}
          {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && filteredDocumentTypes && filteredDocumentTypes?.length > 0 && (
            <Typography variant="h6" style={{ marginTop: 6 }}>
              <b>
                <FormattedMessage module="workforce" id="workforce.employee.upload.factory.document" />
              </b>
            </Typography>
          )}
          {/* ... [Rest of Sidebar logic for salary, accident info etc] ... */}
          {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && viewedFromFlag === "verify" && (
            <Grid container spacing={2} style={{ marginTop: "10px" }}>
              <Grid item xs={9}>
                <TextInput
                  label={"workforce.application.lastBaseSalary.byFactoryAdmin"}
                  value={lastSalaryAmount || application?.lastBaseSalary || ""}
                  onChange={(e) => setLastSalaryAmount(e)}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  variant="contained"
                  color="primary"
                  // disabled={application?.lastBaseSalary !== null ? true : openSalaryButton ? true : false}
                  onClick={() => handleLastSalaryAmount(lastSalaryAmount)}
                >
                  {openSalaryButton ? (
                    <FormattedMessage id="core.table.resultsLoading" module="workforce" />
                  ) : (
                    <FormattedMessage id="workforce.submit" module="workforce" />
                  )}
                </Button>
              </Grid>
              {application?.organizationType === "eis" && (
                <>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setOpenAccidentInfoModal(true)}
                      fullwidth
                      disabled={isNotEmpty(application?.employeeAccidentInfo)}
                    >
                      {<FormattedMessage id="workforce.eis.factory.admin.accidentInfo.button" module="workforce" />}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          )}
          {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && viewedFromFlag === "verify" && (
            <>
              {filteredDocumentTypes?.map((document, index) => (
                <Box style={{ marginTop: "10px" }}>
                  <Typography>{document.nameBn}</Typography>
                  <FileUploader
                    fieldKey={document.fieldId}
                    applicationId={application?.id}
                    onFileChange={onFileChange}
                    documentType={document.documentType}
                    documentProp={document}
                    uploadedBy={"factoryAdmin"}
                  />
                </Box>
              ))}
            </>
          )}
          {(user_type === WORKFORCE_USER_TYPE.EIS_OFFICER || user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN) && application?.organizationType === "eis" && (
            <Grid container spacing={2} style={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={() => setOpenCompensationInfoModal(true)} fullwidth>
                  {<FormattedMessage id="workforce.other.compensationInfo" module="workforce" />}
                </Button>
              </Grid>
            </Grid>
          )}
          {(user_type === WORKFORCE_USER_TYPE.DOCTOR ||
            user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR ||
            user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR ||
            user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR) &&
            viewedFromFlag === "verify" && <DoctorsEntries application={application} />}
        </Grid>

        {/* Details Section */}
        <Grid item xs={12} md={8}>
          {sortedKeys.map((key) => {
            const value = application[key];

            if (key === "workforceEmployee" && ["financialAssistance", "deadlyGrant"].includes(application?.applicationType)) {
              return null;
            }

            const parsedValue = tryParse(value);
            if (!parsedValue || isEmpty(parsedValue)) return null;

            const currentVerificationStatus = verificationState[key]?.status;

            return (
              <Accordion key={key} className={classes.accordion} style={{ background: `${"#B7D4D8"}` }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%" justifyContent="space-between" pr={2}>
                    {/* The Title */}
                    <Typography className={classes.sectionTitle}>{formatKey(key, language)}</Typography>

                    {/* 3. The Status Badge (Only show if a status exists) */}
                    {currentVerificationStatus && (
                      <Box
                        style={{
                          backgroundColor: currentVerificationStatus === "correct" ? "#4caf50" : "#f44336", // Green for Correct, Red for Incorrect
                          color: "#fff",
                          padding: "2px 10px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          marginLeft: "10px",
                        }}
                      >
                        {currentVerificationStatus === "correct" ? (language === "en" ? "Correct" : "সঠিক") : language === "en" ? "Incorrect" : "ভুল"}
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block", background: `${"white"}` }}>
                  {/* Recursively Render Content */}
                  {renderDetails(
                    value,
                    classes,
                    key,
                    language,
                    fileStates,
                    handleCommentChange,
                    handleFileVerify,
                    handleFileReject,
                    eligibilityMap,
                    handleEligibilityChange,
                    user_type,
                    remarksMap,
                    handleRemarksChange,
                  )}

                  {/* ----- NEW: BULK SAVE BUTTON FOR DEPENDENTS ----- */}
                  {key === "workforceEmployeeDependentApplication" && isAllowedUser && (
                    <Box className={classes.bulkActionContainer}>
                      <Typography variant="body2" style={{ marginRight: 15, color: "#666" }}>
                        {language === "en"
                          ? "Select eligibility for dependents above, then click save."
                          : "উপরের নির্ভরশীলদের জন্য যোগ্যতা নির্বাচন করুন, তারপর সংরক্ষণ করুন এ ক্লিক করুন।"}
                      </Typography>
                      <Button variant="contained" color="primary" onClick={handleSaveAllDependents} disabled={!hasUnsavedChanges || loading}>
                        {loading ? <FormattedMessage id="core.table.resultsLoading" /> : <FormattedMessage id="workforce.dependent.eligibility.btn" />}
                      </Button>
                    </Box>
                  )}
                  {/* ----------------------------------------------- */}

                  {/* Document Review logic */}
                  {fileStates && (
                    <>
                      <Typography variant="h6" style={{ marginTop: 3 }}>
                        <FormattedMessage module="workforce" id="workforce.employee.document" />
                      </Typography>
                      {fileStates
                        ?.filter((item, originalIdx) => {
                          item._originalIndex = originalIdx;
                          return mapFormStepNo(item?.workforceDocumentType?.formStepNo, key, application) === key;
                        })
                        .map((file) => (
                          <DocumentReviewAccordion
                            key={file._originalIndex}
                            file={file}
                            index={file._originalIndex}
                            onCommentChange={handleCommentChange}
                            onVerify={handleFileVerify}
                            onReject={handleFileReject}
                            locale={language}
                          />
                        ))}
                    </>
                  )}

                  {viewedFromFlag === "verify" && VERIFICATION_FIELD_MAP[key] && !RESTRICTED_VERIFICATION_ROLES.includes(user_type) && (
                    <Box className={classes.verificationBox}>
                      <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: 8 }}>
                        {language === "en" ? "Section Verification" : "সেকশন যাচাইকরণ"}
                      </Typography>

                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <FormControl component="fieldset">
                            <RadioGroup
                              row
                              name={`verify-${key}`}
                              value={verificationState[key]?.status || ""}
                              onChange={(e) => handleVerificationChange(key, "status", e.target.value)}
                            >
                              <FormControlLabel value="correct" control={<Radio color="primary" />} label={language === "en" ? "Correct" : "সঠিক"} />
                              <FormControlLabel value="incorrect" control={<Radio color="primary" />} label={language === "en" ? "Incorrect" : "ভুল"} />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          {/* <TextInput
                            label={language === "en" ? "Remarks" : "মন্তব্য"}
                            placeholder={language === "en" ? "Enter verification remarks" : "যাচাইকরণ মন্তব্য লিখুন"}
                            value={verificationState[key]?.remarks || ""}
                            onChange={(e) => handleVerificationChange(key, "remarks", typeof e === "string" ? e : e.target.value)}
                            fullWidth
                            multiline
                          /> */}
                          <TextInput
                            label={language === "en" ? "Remarks" : "মন্তব্য"}
                            placeholder={language === "en" ? "Enter verification remarks" : "যাচাইকরণ মন্তব্য লিখুন"}
                            value={verificationState[key]?.remarks || ""}
                            onChange={(e) => handleVerificationChange(key, "remarks", typeof e === "string" ? e : e.target.value)}
                            fullWidth
                            multiline
                            // --- ADD THESE LINES ---
                            required={verificationState[key]?.status === "incorrect"}
                            error={
                              verificationState[key]?.status === "incorrect" &&
                              (!verificationState[key]?.remarks || verificationState[key]?.remarks.trim() === "")
                            }
                            helperText={
                              verificationState[key]?.status === "incorrect" &&
                              (!verificationState[key]?.remarks || verificationState[key]?.remarks.trim() === "")
                                ? language === "en"
                                  ? "Remarks required"
                                  : "মন্তব্য আবশ্যক"
                                : ""
                            }
                            // -----------------------
                          />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                          <Button variant="contained" color="primary" fullWidth onClick={() => saveVerification(key)} disabled={loading ||(verificationState[key]?.status === "incorrect"&& !verificationState[key]?.remarks)}>
                            {loading ? <FormattedMessage id="core.table.resultsLoading" /> : <FormattedMessage id="workforce.update.btn" />}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}

          {/* Other Documents Section */}
          {fileStates && (
            <>
              <Typography variant="h6" style={{ marginTop: 3 }}>
                <FormattedMessage module="workforce" id="workforce.employee.other.document" />
              </Typography>
              {fileStates
                ?.filter((item, originalIdx) => {
                  item._originalIndex = originalIdx;
                  return item?.workforceDocumentType?.formStepNo === "workforceDocument";
                })
                .map((file) => (
                  <DocumentReviewAccordion
                    key={file._originalIndex}
                    file={file}
                    index={file._originalIndex}
                    onCommentChange={handleCommentChange}
                    onVerify={handleFileVerify}
                    onReject={handleFileReject}
                    locale={language}
                  />
                ))}
            </>
          )}
        </Grid>
      </Grid>
      {openAccidentInfoModal && <EisFactoryAdminModal open={openAccidentInfoModal} onClose={() => setOpenAccidentInfoModal(false)} application={application} />}
      <CompensationFormModal
        open={openCompensationInfoModal}
        application={application}
        onClose={() => setOpenCompensationInfoModal(false)}
        entryType="factory"
      />
    </>
  );
};

export default ApplicationViewPage;
