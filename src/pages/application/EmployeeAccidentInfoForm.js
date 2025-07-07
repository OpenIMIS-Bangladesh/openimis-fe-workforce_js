import React, { useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  FormattedMessage,
  PublishedComponent,
} from "@openimis/fe-core";
import EmployeeInjuryTypePicker from "../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker from "../../pickers/EmployeeAccidentTypePicker";
import EmployeeDutyStatusPicker from "../../pickers/EmployeeDutyStatusPicker";
import EmployeeInsideOutsideFactoryPicker from "../../pickers/EmployeeInsideOutsideFactoryPicker";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 800,
  },
}));

const EmployeeAccidentInfoForm = ({ handleChange, formData, setFormData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const [selectedOption, setSelectedOption] = useState(formData?.employeeAccidentInfo?.accidentType ||"accident");

  const handleOptionChange = (event) => {
  const newValue = event.target.value;
  setSelectedOption(newValue);
  setFormData((prev) => ({
    ...prev,
    employeeAccidentInfo: {
      ...prev.employeeAccidentInfo,
      accidentType: newValue,
    },
  }));
};

  return (
    <Box mt={2}>
      <Paper className={classes.paper} elevation={0}>
        <Typography variant="h6" gutterBottom>
          <FormattedMessage id="workforce.employee.accident.info.title"  />
        </Typography>

        <RadioGroup column value={selectedOption} onChange={handleOptionChange}>
          <FormControlLabel value="cronic" control={<Radio color="primary"/>} label={<FormattedMessage id="workforce.employee.aid.reason.info.cronic"  />} />
          <FormControlLabel value="maternity" control={<Radio color="primary"/>} label={<FormattedMessage id="workforce.employee.aid.reason.info.maternity"  />} />
          <FormControlLabel value="accident" control={<Radio color="primary"/>} label={<FormattedMessage id="workforce.employee.aid.reason.info.accident"  />} />
        </RadioGroup>

        <Divider style={{ margin: "16px 0" }} />

        {selectedOption === "cronic" && (
          <Grid container spacing={2}>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="Terminal Disease Type"
                value={formData?.employeeAccidentInfo?.cronicDiseaseType || ""}
                onChange={(v) => handleChange("cronicDiseaseType", v)}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="Doctor's prescription"
                value={formData?.employeeAccidentInfo?.cronicPrescription || ""}
                onChange={(v) => handleChange("cronicPrescription", v)}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              
              <PublishedComponent
                pubRef="core.DatePicker"
                label={"রোগ নিরুপনের তারিখ"}
                value={formData?.employeeAccidentInfo?.diagnosisDate || ""}
                onChange={(v) => handleChange("diagnosisDate", v)}
                readOnly={false}
              />
            </Grid>
          </Grid>
        )}

        {selectedOption === "maternity" && (
          <Grid container spacing={2}>
            <Grid item xs={6} className={classes.item}>
              {/* <TextInput
                label="Expected Delivery Date"
                value={formData.expectedDelivery || ""}
                onChange={(v) => handleChange("expectedDelivery", v)}
                type="date"
              /> */}
              <PublishedComponent
                pubRef="core.DatePicker"
                label={"Diagnosis Date"}
                value={formData?.employeeAccidentInfo?.diagnosisDate || ""}
                onChange={(v) => handleChange("diagnosisDate", v)}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="Medical Prescription"
                value={formData?.employeeAccidentInfo?.maternityPrescription || ""}
                onChange={(v) => handleChange("maternityPrescription", v)}
              />
            </Grid>
          </Grid>
        )}

        {selectedOption === "accident" && (
          <Grid container spacing={2}>
            <Grid item xs={6} className={classes.item}>
              <EmployeeInjuryTypePicker
                value={formData?.employeeAccidentInfo?.injuryType || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.injuryType" module="workforce" />}
                required
                onChange={(v) => handleChange("injuryType", v)}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                label={"workforce.employee.accident.info.dateOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentDate || ""}
                onChange={(v) => handleChange("accidentDate", v)}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <EmployeeAccidentTypePicker
                value={formData?.employeeAccidentInfo?.accidentType || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.typeOfAccident" module="workforce" />}
                required
                onChange={(v) => handleChange("accidentType", v)}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <EmployeeDutyStatusPicker
                value={formData?.employeeAccidentInfo?.dutyStatus || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.dutyStatus" module="workforce" />}
                required
                onChange={(v) => handleChange("dutyStatus", v)}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <EmployeeInsideOutsideFactoryPicker
                value={formData?.employeeAccidentInfo?.inOutsideFactory || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.insideOutsideFactory" module="workforce" />}
                required
                onChange={(v) => handleChange("inOutsideFactory", v)}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                label={"workforce.employee.accident.info.reJoiningDate"}
                value={formData?.employeeAccidentInfo?.reJoiningDate || ""}
                onChange={(v) => handleChange("reJoiningDate", v)}
                readOnly={false}
              />
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeAccidentInfoForm;
