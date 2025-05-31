import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
// import { TextInput } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  FormattedMessage,
  PublishedComponent,
} from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
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
}));

const EmployeeDetailsForm2 = ({ handleChange, formData, setFormData ,selectedApplicationType}) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );
  const dispatch = useDispatch();

  useEffect(() => {
    return dispatch(fetchDocumentType(modulesManager, [`applicationType:"${selectedApplicationType}"`]));
  }, []);

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingDocumentType`]
  );
  const data = useSelector(
    (state) => state.workforce[`documentType`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorDocumentType"]
  );

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (fieldKey, files) => {
    setUploadedFiles((prevFiles) => {
      // Check if fieldKey already exists
      const existingIndex = prevFiles.findIndex(
        (item) => item.fieldKey === fieldKey
      );

      if (existingIndex !== -1) {
        // Update existing entry
        const updatedFiles = [...prevFiles];
        updatedFiles[existingIndex] = { fieldKey, files };
        return updatedFiles;
      } else {
        // Add new entry
        return [...prevFiles, { fieldKey, files }];
      }
    });
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
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.nid"
                  value={formData?.workforceEmployee.nid || ""}
                  onChange={(v) =>
                    handleChange("nid", v, "employeeDesignation")
                  }
                  type={"number"}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.birth_certificate_no"
                  value={formData?.workforceEmployee.birthCertificateNo || ""}
                  onChange={(v) =>
                    handleChange("birthCertificateNo", v, "employeeDesignation")
                  }
                  type={"number"}
                  readOnly={false}
                />
              </Grid>
              {data.map((document,index)=>(
              <Grid item xs={6} className={classes.item}>
                <Typography>আপলোড {document.nameBn} </Typography>
                <FileUploader
                  fieldKey={document.fieldId}
                  onFileChange={handleChange}
                />
              </Grid>
              ))}
              {/* <Grid item xs={6} className={classes.item}>
                <Typography>Upload Birth Certificate </Typography>
                <FileUploader
                  fieldKey="uploadedBirthCertificateFile"
                  onFileChange={handleChange}
                />
              </Grid> */}
              <Grid item xs={6} className={classes.item}>
                <CompanyPicker
                  value={formData?.company?.id}
                  label={
                    <FormattedMessage
                      id="workforce.employee.workforce_employer"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) => {
                    handleChange("company", v, "employeeDesignation");
                    handleChange("company", v);
                  }}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <FactoryPicker
                  value={formData?.factory?.id}
                  label={
                    <FormattedMessage
                      id="workforce.employee.workforce_factory"
                      module="workforce"
                    />
                  }
                  required
                  companyId={formData?.company?.id}
                  onChange={(v) => {
                    handleChange("factory", v, "employeeDesignation");
                    handleChange("factory", v);
                  }}
                  readOnly={false}
                />
              </Grid>

              {selectedApplicationType === ("financialAssistance" || "disabilityAssistance") && (
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.monthly_earning"
                  value={formData?.workforceEmployee.monthlyEarning || ""}
                  onChange={(v) =>
                    handleChange("monthlyEarning", v, "employeeDesignation")
                  }
                  readOnly={false}
                />
              </Grid>
              )}

              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.joindate"}
                  value={formData?.workforceEmployee.joinDate || ""}
                  onChange={(v) =>
                    handleChange("joinDate", v, "employeeDesignation")
                  }
                  readOnly={false}
                />
              </Grid>
            </Grid>
            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetailsForm2;
