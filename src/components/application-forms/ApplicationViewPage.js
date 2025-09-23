import React, { useMemo, useState } from "react";
import { Grid, Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Divider, Card, CardContent, Box } from "@material-ui/core";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage, decodeId } from "@openimis/fe-core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import FileUploader from "../../pickers/FileUploader";
import DocumentReviewAccordion from "../application-process/DocumentReviewAccordion";
import { banglaLabels, WORKFORCE_USER_TYPE } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { getUserType } from "../../utils/utils";

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
const hiddenKeys = ["id", "uuid", "__typename", "applicationId", "parent","code","type","employeeFactory","associationType","applicationFor","workforceEmployeeDependentApplication","applicationForSelf"];

/**
 * Convert key into a user-friendly label
 */
const formatKey = (key,language) =>{
  const cleanKey = key.split(".").pop();
    if (["fr", "bangla", "bd"].includes(language) && banglaLabels[cleanKey]) {
      return banglaLabels[cleanKey];
    }
  return  cleanKey
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
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
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Recursive renderer for objects & arrays in Grid format
 */
const renderDetails = (data, classes, parentKey = "",language) => {
  if (!data) return null;

  // Handle arrays of objects
  if (Array.isArray(data)) {
    return data.map((item, idx) => {
      if (typeof item !== "object" || !item) return null;

      const scalars = Object.entries(item).filter(
        ([key, value]) => typeof value !== "object" && !hiddenKeys.includes(key) && value !== null && value !== undefined && value !== ""
      );
      const objects = Object.entries(item).filter(([key, value]) => typeof value === "object" && value && !hiddenKeys.includes(key));

      return (
        <Card key={idx} className={classes.nestedCard}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold", fontSize: "large" }}>
              {formatKey(parentKey,language)} {idx + 1}
            </Typography>
            <Divider style={{ marginBottom: 12 }} />

            <Grid container spacing={2}>
              {scalars.map(([key, value]) => (
                <Grid item xs={6} key={key} className={classes.itemRow}>
                  <Typography variant="body1" className={classes.value}>
                    <span className={classes.label} style={{fontWeight:"bold"}}>{formatKey(key,language)}:</span> {value}
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
                  {formatKey(key,language)}
                </Typography>
                {renderDetails(value, classes, key,language)}
              </Box>
            ))}
          </CardContent>
        </Card>
      );
    });
  }

  // Handle objects (top-level case)
  if (typeof data === "object") {
    const scalars = Object.entries(data).filter(
      ([key, value]) =>
        typeof value !== "object" &&
        !hiddenKeys.includes(key) &&
        value !== null &&
        value !== undefined &&
        value !== "" &&
        key !== "presentAddress" &&
        key !== "permanentAddress"
    );

    const objects = Object.entries(data).filter(([key, value]) => {
      const parsedValue = tryParse(value);
      return typeof parsedValue === "object" && parsedValue && !hiddenKeys.includes(key);
    });

    return (
      <Grid container spacing={2}>
        {/* ✅ Scalars on top */}
        {scalars.map(([key, value]) => (
          <Grid item xs={6} key={key} className={classes.itemRow}>
            <Typography variant="body1" className={classes.value}>
              <span className={classes.label} style={{fontWeight:"bold"}}>{formatKey(key,language)}:</span> {value}
            </Typography>
          </Grid>
        ))}

        {/* ✅ Objects after */}
        {objects.map(([key, value]) => {
          const parsedValue = tryParse(value);
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
                {formatKey(key,language)}
              </Typography>
              {renderDetails(parsedValue, classes, key,language)}
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
}) => {
  const classes = useStyles();
  const language = useSelector(state=>state.core?.user?.i_user?.language)
  console.log({ view: application });
  const user_type = getUserType()
  // Sidebar summary fields
  const sidebarFields = useMemo(
    () => ({
      "ApplicationType": application.applicationType,
      "OrganizationType": application.organizationType,
      "TrackingNumber": application.trackingNumber,
      "Status": application.status,
      "SubmittedBy": application.submittedBy,
      "GrantAmount": application.grantAmount,
      "CreatedDate": application?.dateCreated?.split("T")[0] || "—",
      "ApplicationFor":application?.applicationFor
    }),
    [application]
  );
  return (
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
                  {formatKey(label,language)}:
                </span>{" "}
                {value || "—"}
              </Typography>
            ))}
          </Box>
        </Paper>
        {(user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && filteredDocumentTypes && filteredDocumentTypes?.length>0) && (
          <Typography variant="h6" style={{ marginTop: 6 }}>
            <b>
              <FormattedMessage module="workforce" id="workforce.employee.upload.factory.document" />
            </b>
          </Typography>
        )}
        {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && (filteredDocumentTypes?.map((document, index) => (
          <Box style={{ marginTop: "10px" }}>
            <Typography>{document.nameBn}</Typography>
            <FileUploader
              fieldKey={document.fieldId}
              applicationId={applicationUuid}
              onFileChange={onFileChange}
              documentType={document.documentType}
              documentProp={document}
              uploadedBy={"factoryAdmin"}
            />
          </Box>
        )))}
      </Grid>

      {/* Details Section */}
      <Grid item xs={12} md={8}>
        {Object.entries(application).map(([key, value]) => {
          // skip sidebar & hidden fields
          if (["applicationType", "organizationType", "trackingNumber", "status", "grantAmount", "submittedBy", "dateCreated", ...hiddenKeys].includes(key))
            return null;

          const parsedValue = tryParse(value);
          if (!parsedValue || isEmpty(parsedValue)) return null;

          console.log({ fileStates });
          ///expanded={expanded === key} onChange={() => setExpanded(expanded === key ? null : key)}
          return (
            <Accordion key={key} className={classes.accordion} style={{ background: `${"#B7D4D8"}` }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.sectionTitle}>{formatKey(key,language)}</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ display: "block", background: `${"white"}` }}>
                {renderDetails(parsedValue, classes, key,language)}
                {fileStates && (
                  <>
                    <Typography variant="h6" style={{ marginTop: 3 }}>
                      <FormattedMessage module="workforce" id="workforce.employee.document" />
                    </Typography>
                    {fileStates
                      ?.filter((item, originalIdx) => {
                        item._originalIndex = originalIdx; // attach index temporarily
                        return item?.workforceDocumentType?.formStepNo === key;
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
  );
};

export default ApplicationViewPage;
