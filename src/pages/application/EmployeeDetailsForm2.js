import React from "react";
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
import { Save } from "@material-ui/icons";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import FileUploader from "../../pickers/FileUploader";

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

const EmployeeDetailsForm2 = ({handleChange, formData, setFormData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );

//   const handleChange = (key, value) => {
//     setFormData((prev) => ({ ...prev, [key]: value }));
//   };
console.log({formData})
  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.item} spacing={2}>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.nid"
                  value={formData.nid || ""}
                  onChange={(v) => handleChange( "nid", v )}
                  type={"number"}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.birth_certificate_no"
                  value={formData.birthCertificateNo || ""}
                  onChange={(v) => handleChange( "birthCertificateNo", v )}
                  type={"number"}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <Typography>Upload NID </Typography>
                <FileUploader fieldKey="uploadedNidFile" onFileChange={handleChange}/>
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <Typography>Upload Birth Certificate </Typography>
                <FileUploader fieldKey="uploadedBirthCertificateFile" onFileChange={handleChange}/>
              </Grid>
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
                  onChange={(v) => handleChange( "company", v )}
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
                  onChange={(v) => handleChange( "factory", v )}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.monthly_earning"
                  value={formData.monthlyEarning || ""}
                  onChange={(v) => handleChange( "monthlyEarning", v )}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.joindate"}
                  value={formData.joinDate || ""}
                  onChange={(v) => handleChange( "joinDate", v )}
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
