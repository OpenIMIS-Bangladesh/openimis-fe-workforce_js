import React, { useMemo, useState } from "react";
import { Grid, Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Divider, Card, CardContent, Box, Button } from "@material-ui/core";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage, decodeId, TextInput } from "@openimis/fe-core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import FileUploader from "../../pickers/FileUploader";
import DocumentReviewAccordion from "../application-process/DocumentReviewAccordion";
import { banglaLabels, ORGANIZATION_TYPE_NAME_BN, ORGANIZATION_TYPE_NAME_EN, STATUS_MAP_BN, STATUS_MAP_EN, WORKFORCE_USER_TYPE } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { conditionalEnToBn, enToBn, getUserType } from "../../utils/utils";
import { updateApplication } from "../../actions";
import DoctorsEntries from "./Atoms/DoctorsEntries";
import EisFactoryAdminModal from "./EisFactoryAdminModal";
import ApplicationMovementStepper from "../shared/ApplicationMovementStepper";

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
    // marginTop:3
  },
  label: {
    fontWeight: 450,
    color: "#333",
    marginRight: 6,
  },
}));

/**
 * Keys to hide from rendering
 */
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
  // "workforceEmployeeDependentApplication",
  "employeeBankingInfoApplication",
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
  "pvFactor",
  "dependentId",
  "attachments",
  "dateCreated",
  "doctorsEntry",
  "wCode",
];

/**
 * Convert key into a user-friendly label
 */
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
/**
 * Try parsing JSON safely
 */
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
  // if (Array.isArray(value)) return value.length === 0;
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    return value.every((item) => item == null || (typeof item === "object" && Object.keys(item).length === 0));
  }
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Recursive renderer for objects & arrays in Grid format
 */
const renderDetails = (data, classes, parentKey = "", language, fileStates, handleCommentChange, handleFileVerify, handleFileReject) => {
  if (!data) return null;

  // ✅ Safe JSON parser
  const tryParse = (value) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return typeof parsed === "object" ? parsed : value;
      } catch {
        return value;
      }
    }
    return value;
  };

  // ✅ Merge present/permanent address + location
  const mergeAddressAndLocation = (obj) => {
    const parsedObj = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, tryParse(v)]));
    const newObj = { ...parsedObj };

    if (parsedObj.presentAddress || parsedObj.presentLocation) {
      newObj.presentAddressAndLocation = {
        ...(parsedObj.presentAddress || {}),
        ...(parsedObj.presentLocation || {}),
      };
      delete newObj.presentAddress;
      delete newObj.presentLocation;
    }

    if (parsedObj.permanentAddress || parsedObj.permanentLocation) {
      newObj.permanentAddressAndLocation = {
        ...(parsedObj.permanentAddress || {}),
        ...(parsedObj.permanentLocation || {}),
      };
      delete newObj.permanentAddress;
      delete newObj.permanentLocation;
    }

    return newObj;
  };

  // ✅ Merge + parse data
  const mergedData =
    typeof data === "object" && !Array.isArray(data)
      ? mergeAddressAndLocation(data)
      : Array.isArray(data)
      ? data.map((item) => (typeof item === "object" ? mergeAddressAndLocation(item) : tryParse(item)))
      : tryParse(data);

  // ✅ Handle arrays of objects
  if (Array.isArray(mergedData)) {
    return mergedData.map((item, idx) => {
      if (typeof item !== "object" || !item) return null;

      const scalars = Object.entries(item).filter(
        ([key, value]) => typeof value !== "object" && ![...hiddenKeys].includes(key) && value !== null && value !== undefined && value !== ""
      );
      const objects = Object.entries(item).filter(([key, value]) => typeof value === "object" && value && ![...hiddenKeys, "attachments"].includes(key));

      let matchingFiles = [];
      if (parentKey === "workforceEmployeeDependentApplication" && item?.id && fileStates) {
        matchingFiles = fileStates
          .map((f, i) => ({ ...f, _originalIndex: i })) // Preserve original index
          .filter((f) => f?.workforceDependent?.id === item.id);
      }

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
                {renderDetails(value, classes, key, language)}
              </Box>
            ))}

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
          </CardContent>
        </Card>
      );
    });
  }

  // ✅ Handle object data
  if (typeof mergedData === "object" && mergedData !== null) {
    const scalars = Object.entries(mergedData).filter(
      ([key, value]) => typeof value !== "object" && !hiddenKeys.includes(key) && value !== null && value !== undefined && value !== ""
    );
    const objects = Object.entries(mergedData).filter(([key, value]) => {
      const parsed = tryParse(value);
      return typeof parsed === "object" && parsed && !hiddenKeys.includes(key);
    });

    return (
      <Grid container spacing={2}>
        {/* ✅ Scalars on top */}
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

        {/* ✅ Nested objects */}
        {objects.map(([key, value]) => {
          const parsedValue = tryParse(value);
          const sectionTitle =
            key === "presentAddressAndLocation"
              ? language === "en"
                ? "Present Address & Location"
                : "বর্তমান ঠিকানা"
              : key === "permanentAddressAndLocation"
              ? language === "en"
                ? "Permanent Address & Location"
                : "স্থায়ী ঠিকানা"
              : formatKey(key, language);

          return (
            <Grid item xs={12} key={key}>
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
                {sectionTitle}
              </Typography>
              {renderDetails(parsedValue, classes, key, language)}
            </Grid>
          );
        })}
      </Grid>
    );
  }

  return null;
};

const ApplicationViewPage = ({
  application,
  // language,
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
  console.log({ view: application });
  const user_type = getUserType();
  const dispatch = useDispatch();
  const [lastSalaryAmount, setLastSalaryAmount] = useState("");
  const [openAccidentInfoModal, setOpenAccidentInfoModal] = useState(false);

  const handleLastSalaryAmount = (amount) => {
    const updateApplicationData = {
      id: application?.id,
      lastBaseSalary: amount,
    };
    console.log({ grantAmount: updateApplicationData });
    dispatch(updateApplication(updateApplicationData, "update workforce application"));
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
      ApplicantDesignation: application?.workforceEmployee?.position,
      ApplicationType:
        (language === "en" ? application?.grantMoney?.applicationTypeNameEn : application?.grantMoney?.applicationTypeNameBn) || application?.applicationType,
      OrganizationType: language === "en" ? ORGANIZATION_TYPE_NAME_EN[application?.organizationType] : ORGANIZATION_TYPE_NAME_BN[application?.organizationType],
      TrackingNumber: application.trackingNumber,
      Status: language === "en" ? STATUS_MAP_EN[application.status] : STATUS_MAP_BN[application?.status],
      SubmittedBy: application.submittedBy === "applicant" ? (language === "en" ? "Applicant" : "আবেদনকারী") : application.submittedBy,
      // GrantAmount: '৳ '+(language==='en'?Number(application?.grantAmount).toLocaleString('en-US'):Number(application?.grantAmount).toLocaleString('bn-BD')),
      CreatedDate: conditionalEnToBn(application?.dateCreated?.split("T")[0] || "—", language),
      ApplicationFor:
        application?.applicationFor == "self" ? (language === "en" ? "Self" : "নিজের জন্য") : language === "en" ? "Dependent" : "নির্ভরশীলের জন্য",
    }),
    [application]
  );

  const mapFormStepNo = (fileStepNo, sectionKey, application) => {
    const isDeathCase = ["financialAssistance", "deadlyGrant"].includes(application?.applicationType);

    if (isDeathCase && fileStepNo === "workforceEmployee") {
      return "deceasedWorkerInfo"; // remap only for death applications
    }

    return fileStepNo;
  };
  const isNotEmpty = (value) => !isEmpty(value);

  return (
    <>
      <Grid container spacing={3} className={classes.root}>
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
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
          {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && viewedFromFlag === "verify" && (
            <>
              <Grid container spacing={2} style={{ marginTop: "10px" }}>
                <Grid item xs={9}>
                  <TextInput
                    label={"workforce.application.lastBaseSalary.byFactoryAdmin"}
                    value={lastSalaryAmount || ""}
                    onChange={(e) => setLastSalaryAmount(e)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={application?.lastBaseSalary !== null ? true : false}
                    onClick={() => handleLastSalaryAmount(lastSalaryAmount)}
                  >
                    {<FormattedMessage id="workforce.submit" module="workforce" />}
                  </Button>
                </Grid>
                {application?.organizationType === "eis" && (
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
                )}
              </Grid>
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
          {(user_type === WORKFORCE_USER_TYPE.DOCTOR || user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR || user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) &&
            viewedFromFlag === "verify" && <DoctorsEntries application={application} />}
        </Grid>

        {/* Details Section */}
        <Grid item xs={12} md={8}>
          {Object.entries(application).map(([key, value]) => {
            // skip sidebar & hidden fields
            if (["applicationType", "organizationType", "trackingNumber", "status", "grantAmount", "submittedBy", "dateCreated", ...hiddenKeys].includes(key))
              return null;

            if (key === "workforceEmployee" && ["financialAssistance", "deadlyGrant"].includes(application?.applicationType)) {
              return null;
            }

            const parsedValue = tryParse(value);
            if (!parsedValue || isEmpty(parsedValue)) return null;

            ///expanded={expanded === key} onChange={() => setExpanded(expanded === key ? null : key)}
            return (
              <Accordion key={key} className={classes.accordion} style={{ background: `${"#B7D4D8"}` }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography className={classes.sectionTitle}>{formatKey(key, language)}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: "block", background: `${"white"}` }}>
                  {renderDetails(value, classes, key, language, fileStates, handleCommentChange, handleFileVerify, handleFileReject)}
                  {fileStates && (
                    <>
                      <Typography variant="h6" style={{ marginTop: 3 }}>
                        <FormattedMessage module="workforce" id="workforce.employee.document" />
                      </Typography>
                      {fileStates
                        ?.filter((item, originalIdx) => {
                          item._originalIndex = originalIdx; // attach index temporarily
                          return mapFormStepNo(item?.workforceDocumentType?.formStepNo, key, application) === key;
                        })
                        .map((file) => (
                          <DocumentReviewAccordion
                            key={file._originalIndex}
                            file={file} // ✅ from editable local state
                            index={file._originalIndex}
                            onCommentChange={handleCommentChange}
                            onVerify={handleFileVerify}
                            onReject={handleFileReject}
                            locale={language}
                          />
                        ))}
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
          {fileStates && (
            <>
              <Typography variant="h6" style={{ marginTop: 3 }}>
                <FormattedMessage module="workforce" id="workforce.employee.other.document" />
              </Typography>
              {fileStates
                ?.filter((item, originalIdx) => {
                  item._originalIndex = originalIdx; // attach index temporarily
                  return item?.workforceDocumentType?.formStepNo === "workforceDocument";
                })
                .map((file) => (
                  <DocumentReviewAccordion
                    key={file._originalIndex}
                    file={file} // ✅ from editable local state
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
    </>
  );
};

export default ApplicationViewPage;
