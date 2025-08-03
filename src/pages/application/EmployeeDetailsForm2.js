import React, { useEffect, useState } from "react";
import { Grid, Box, Paper, Typography, Divider, IconButton } from "@material-ui/core";
// import { TextInput } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
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

const EmployeeDetailsForm2 = ({ handleChange, formData, setFormData, selectedApplicationType, applicationId }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const dispatch = useDispatch();

  useEffect(() => {
    if (formData?.applicationForSelf === "yes") {
      return dispatch(
        fetchDocumentType(modulesManager, [
          `orderBy: ["documentTypeNo"]`,
          `applicationFor: "self"`,
          `applicationType:"${selectedApplicationType}"`,
          `organizationType:"${formData.organizationType}"`,
        ])
      );
    } else if (formData.applicationType === "disabilityAssistance") {
      if (formData.metadata.disabilityType === "permanent") {
        return dispatch(
          fetchDocumentType(modulesManager, [
            `orderBy: ["documentTypeNo"]`,
            `applicationFor: "permanent_disability"`,
            `applicationType:"${selectedApplicationType}"`,
            `organizationType:"${formData.organizationType}"`,
          ])
        );
      } else {
        return dispatch(
          fetchDocumentType(modulesManager, [
            `orderBy: ["documentTypeNo"]`,
            `applicationFor: "temporary_disability"`,
            `applicationType:"${selectedApplicationType}"`,
            `organizationType:"${formData.organizationType}"`,
          ])
        );
      }
    } else if (formData.applicationType === "financialAssistance") {
      if (formData.metadata.deathType === "normalDeath") {
        return dispatch(
          fetchDocumentType(modulesManager, [
            `orderBy: ["documentTypeNo"]`,
            `applicationFor: "normal_death"`,
            `applicationType:"${selectedApplicationType}"`,
            `organizationType:"${formData.organizationType}"`,
          ])
        );
      } else {
        return dispatch(fetchDocumentType(modulesManager, [`applicationType:"${selectedApplicationType}"`, `organizationType:"${formData.organizationType}"`]));
      }
    } else {
      return dispatch(
        fetchDocumentType(modulesManager, [
          `orderBy: ["documentTypeNo"]`,
          `applicationFor: "dependent"`,
          `applicationType:"${selectedApplicationType}"`,
          `organizationType:"${formData.organizationType}"`,
        ])
      );
    }
  }, []);

  const isLoading = useSelector((state) => state.workforce[`fetchingDocumentType`]);
  const data = useSelector((state) => state.workforce[`documentType`] ?? []);
  const error = useSelector((state) => state.workforce["errorDocumentType"]);

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

  console.log({ fahim: data });
  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            <Box mb={4} textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.document" module="workforce" />
            </Box>
            <Grid container className={classes.item} spacing={2}>
              {data.map((document, index) => (
                <Grid container spacing={2} alignItems="center" style={{ marginBottom: "12px", border: "1px solid #006273" }} key={document.fieldId}>
                  <Grid item xs={5}>
                    <Typography>
                      {index + 1}. {document.nameBn}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} >
                    <FileUploader
                      fieldKey={document.fieldId}
                      onFileChange={handleFileChange}
                      applicationId={applicationId}
                      documentType={document.documentType}
                    />
                    
                  </Grid>
                  {uploadedFiles.find((item) => item.fieldKey === document.fieldId && item.files.length > 0) && (
                    <Grid item xs={1}>
                      <CheckCircleIcon style={{ color: "green" }} />
                      </Grid>
                    )}
                </Grid>
              ))}
            </Grid>
            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetailsForm2;
