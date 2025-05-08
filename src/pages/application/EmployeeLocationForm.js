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

const EmployeeLocationForm = ({ handleChange,formData, setFormData }) => {
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
  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
             <Box mb={4} textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.location" module="workforce" />
            </Box>
            <Grid container className={classes.item} spacing={2}>
            <Grid item xs={12} className={classes.item}>
                <p>{formatMessage("workforce.employee.present_location")}</p>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={formData?.workforceEmployee.presentLocation || null}
                  onChange={(presentLocation) =>
                    handleChange( "presentLocation", presentLocation )
                  }
                  readOnly={false}
                  required
                  split={true}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.employee.present_address"
                  value={formData?.workforceEmployee.presentAddress || ""}
                  onChange={(v) => handleChange( "presentAddress", v )}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <p>{formatMessage("workforce.employee.permanent_location")}</p>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={formData?.workforceEmployee.permanentLocation || null}
                  onChange={(permanentLocation) =>
                    handleChange(
                      "permanentLocation", permanentLocation
                    )
                  }
                  readOnly={false}
                  required
                  split={true}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.employee.permanent_address"
                  value={formData?.workforceEmployee.permanentAddress || ""}
                  onChange={(v) => handleChange( "permanentAddress", v )}
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

export default EmployeeLocationForm;
