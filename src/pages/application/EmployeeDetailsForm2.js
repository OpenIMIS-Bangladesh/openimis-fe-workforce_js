import React, { useEffect, useState } from "react";
import { Grid, Box, Paper, Typography, Divider, IconButton } from "@material-ui/core";
// import { TextInput } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FileUploader from "../../pickers/FileUploader";
import { fetchDocumentType } from "../../actions";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // height: "100vh",
  },
  paper: {
    padding: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
  flex: {
    display: "flex",
    flexWrap: "wrap",
  },
}));

const EmployeeDetailsForm2 = ({
  handleChange,
  errors,
  formData,
  setFormData,
  selectedApplicationType,
  applicationId,
  formStepNo,
  isDisabled,
  dependentIndex,
  accountIndex,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const dispatch = useDispatch();

  useEffect(() => {
    if (formData.applicationType && formData.organizationType) {
      if (formData?.applicationForSelf === "yes" && formData?.organizationType === "cf") {
        return dispatch(
          fetchDocumentType(modulesManager, [
            `orderBy: ["documentTypeNo"]`,
            `applicationFor: "self"`,
            `applicationType:"${selectedApplicationType}"`,
            `organizationType:"${formData?.organizationType}"`,
            `formStepNo:"${formStepNo}"`,
          ]),
        );
      } else if (formData?.applicationType === "disabilityAssistance") {
        if (formData?.metadata.disabilityType === "permanent") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationFor: "permanent_disability"`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData?.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationFor: "temporary_disability"`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData?.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
      } else if (formData?.applicationType === "financialAssistance") {
        if (formData?.metadata?.deathType === "normalDeath") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationFor: "normal_death"`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData?.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationFor: "accidental_death"`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData?.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
      } else if (formData?.applicationType === "deadlyGrant") {
        if (formData?.metadata.deathType === "normalDeath" && formData?.institutionInfo?.workerType === "formal") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["normal_death","normal_death_institutional","normal_death_institutional_on_work"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData?.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else if (formData?.metadata.deathType === "normalDeath" && formData?.institutionInfo.workerType === "informal") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["normal_death","normal_death_non_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationFor: "accidental_death"`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData?.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
        // return dispatch(
        //   fetchDocumentType(modulesManager, [
        //     `orderBy: ["documentTypeNo"]`,
        //     `applicationForIn: ["normal_death","normal_death_institutional","normal_death_institutional_on_work"]`,
        //     `applicationType:"${selectedApplicationType}"`,
        //     `organizationType:"${formData.organizationType}"`,
        //     `formStepNo:"${formStepNo}"`,
        //   ])
        // );
      } else if (formData?.applicationType === "medicalDonation" && formData?.applicationForSelf === "yes" && formData?.organizationType === "blwf") {
        if (formData?.institutionInfo?.workerType === "formal") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              'applicationForIn: ["self","self_institutional"]',
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["self","self_non_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
      } else if (formData.applicationType === "medicalDonation" && formData.applicationForSelf === "no" && formData.organizationType === "blwf") {
        if (formData?.institutionInfo?.workerType === "formal") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["dependent","dependent_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["dependent","dependent_non_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
      } else if (formData.applicationType === "maternityGrant" && formData.organizationType === "blwf" && formData.applicationForSelf === "yes") {
        if (formData?.institutionInfo?.workerType === "formal") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["self","self_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["self","self_non_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
      } else if (formData.applicationType === "maternityGrant" && formData.organizationType === "blwf" && formData.applicationForSelf === "no") {
        if (formData?.institutionInfo?.workerType === "formal") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["dependent","dependent_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["dependent","dependent_non_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
      } else if (formData.applicationType === "educationGrant" && formData.organizationType === "blwf") {
        if (formData?.institutionInfo?.workerType === "formal") {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["dependent","dependent_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        } else {
          return dispatch(
            fetchDocumentType(modulesManager, [
              `orderBy: ["documentTypeNo"]`,
              `applicationForIn: ["dependent","dependent_non_institutional"]`,
              `applicationType:"${selectedApplicationType}"`,
              `organizationType:"${formData.organizationType}"`,
              `formStepNo:"${formStepNo}"`,
            ]),
          );
        }
      } else {
        return dispatch(
          fetchDocumentType(modulesManager, [
            `orderBy: ["documentTypeNo"]`,
            `applicationFor: "dependent"`,
            `applicationType:"${selectedApplicationType}"`,
            `organizationType:"${formData.organizationType}"`,
            `formStepNo:"${formStepNo}"`,
          ]),
        );
      }
    }
  }, [selectedApplicationType, formData?.organizationType, formStepNo, formData?.institutionInfo?.workerType, formData?.metadata?.disabilityType, isDisabled]);

  const isLoading = useSelector((state) => state.workforce[`fetchingDocumentType`]);
  const data = useSelector((state) => state.workforce[`documentType`] ?? []);
  const error = useSelector((state) => state.workforce["errorDocumentType"]);
  const uploadedFilesByField = useSelector((state) => state.workforce.uploadedFilesByField || {});

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (fieldKey, files) => {
    setUploadedFiles((prevFiles) => {
      const existingIndex = prevFiles.findIndex((item) => item.fieldKey === fieldKey);
      if (existingIndex !== -1) {
        const updatedFiles = [...prevFiles];
        updatedFiles[existingIndex] = { fieldKey, files };
        return updatedFiles;
      } else {
        return [...prevFiles, { fieldKey, files }];
      }
    });

    // Optionally also update `formData` if needed
    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        uploadedDocs: {
          ...(prev.uploadedDocs || {}),
          [fieldKey]: files,
        },
      }));
    }
  };

  const getUniqueFieldKey = (baseKey) => {
    if (dependentIndex !== undefined) return `dependent_${dependentIndex}_${baseKey}`;
    if (accountIndex !== undefined) return `account_${accountIndex}_${baseKey}`;
    return baseKey;
  };

  console.log({ fahim: dependentIndex });
  console.log({ fahimA: handleChange });
  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            <Box mb={4} textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.document" module="workforce" />
            </Box>
            <Grid container className={classes.item} spacing={2}>
              {data.map((document, index) => {
                console.log({ isDisabled });
                const hasError = errors?.documents?.some((err) => err.documentType === document.documentType);
                if (document?.documentType === "disability_certificate" && (isDisabled === "no" || isDisabled === undefined)) {
                  return null;
                }
                const fieldKey = document.fieldId;
                let uniqueFieldKey = fieldKey;

                if (dependentIndex !== undefined) {
                  uniqueFieldKey = `dependent_${dependentIndex}_${fieldKey}`;
                } else if (accountIndex !== undefined) {
                  uniqueFieldKey = `account_${accountIndex}_${fieldKey}`;
                }

                const hasFiles = (uploadedFilesByField[uniqueFieldKey]?.length || 0) > 0;
                // const hasFiles = (uploadedFilesByField[fieldKey]?.length || 0) > 0;
                return (
                  <Grid container spacing={2} alignItems="center" style={{ marginBottom: "12px", border: "1px solid #006273" }} key={document.fieldId}>
                    <Grid item xs={5}>
                      <Typography style={{ color: hasError ? "red" : "inherit" }}>
                        {index + 1}. {document.nameBn} {document?.mandatoryForApplicant && <sup style={{ color: "red" }}>*</sup>}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {formData?.applicationType === "deadlyGrant" || formData?.applicationType === "financialAssistance" ? (
                        <FileUploader
                          fieldKey={uniqueFieldKey}
                          onFileChange={handleChange}
                          applicationId={applicationId}
                          documentType={document.documentType}
                          documentProp={document}
                          uploadedBy={formStepNo === "employeeDependentInfo" ? "dependent" : formStepNo === "employeeBankInfo" ? "bank" : "applicant"}
                        />
                      ) : (
                        <FileUploader
                          fieldKey={uniqueFieldKey}
                          onFileChange={handleChange.length > 0 ? handleChange : handleFileChange}
                          applicationId={applicationId}
                          documentType={document.documentType}
                          documentProp={document}
                          uploadedBy={formStepNo === "employeeDependentInfo" ? "dependent" : "applicant"}
                        />
                      )}
                    </Grid>
                    {/* {uploadedFiles.find((item) => item.fieldKey === document.fieldId && item.files.length > 0) && (
                      <Grid item xs={1}>
                        <CheckCircleIcon style={{ color: "green" }} />
                      </Grid>
                    )} */}
                    {hasFiles && (
                      <Grid item xs={1}>
                        <CheckCircleIcon style={{ color: "green" }} />
                      </Grid>
                    )}
                  </Grid>
                );
              })}
            </Grid>
            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetailsForm2;
