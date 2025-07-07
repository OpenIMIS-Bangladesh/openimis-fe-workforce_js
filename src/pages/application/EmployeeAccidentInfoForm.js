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
  FormControl,
  FormLabel,
  Checkbox,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormGroup,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EmployeeInjuryTypePicker from "../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker from "../../pickers/EmployeeAccidentTypePicker";
import EmployeeDutyStatusPicker from "../../pickers/EmployeeDutyStatusPicker";
import EmployeeInsideOutsideFactoryPicker from "../../pickers/EmployeeInsideOutsideFactoryPicker";
import DiseaseMultiSelectPicker from "../../pickers/DiseaseMultiSelectPicker";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";

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

const diseaseOptions = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Kidney Disease",
  "Cancer",
  "Tuberculosis",
  "Arthritis",
  "Stroke",
  "Others", // Allow manual input if selected
];

const EmployeeAccidentInfoForm = ({ handleChange, formData, setFormData }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const [selectedOption, setSelectedOption] = useState(formData?.employeeAccidentInfo?.accidentType || "accident");
  const [selectedDiseases, setSelectedDiseases] = useState(formData?.employeeAccidentInfo?.cronicDiseaseType || []);
  const [isAdmitted, setIsAdmitted] = useState(formData?.employeeAccidentInfo?.admitted || "no");

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

  const handleDiseaseChange = (event) => {
    const value = event.target.value;
    setSelectedDiseases(value);
    handleChange("cronicDiseaseType", value);
  };

  const handleAdmittedChange = (event) => {
    const value = event.target.value;
    setIsAdmitted(value);
    handleChange("admitted", value);
  };

  return (
    <Box mt={2}>
      <Paper className={classes.paper} elevation={0}>
        <Typography variant="h6" gutterBottom>
          <FormattedMessage id="workforce.employee.accident.info.title" />
        </Typography>

        <RadioGroup column value={formData?.employeeAccidentInfo?.accidentType || ""} onChange={handleOptionChange}>
          <FormControlLabel value="disease" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.employee.aid.reason.info.cronic" />} />
          <FormControlLabel
            value="accident"
            control={<Radio color="primary" />}
            label={<FormattedMessage id="workforce.employee.aid.reason.info.accident" />}
          />
        </RadioGroup>

        <Divider style={{ margin: "16px 0" }} />

        {selectedOption === "disease" && (
          <Grid container spacing={1}>
            <Grid item xs={6} className={classes.item}>
              {/* <FormControl fullWidth>
                <InputLabel>Disease Name(s)</InputLabel>
                <Select multiple value={selectedDiseases} onChange={handleDiseaseChange} renderValue={(selected) => selected.join(", ")}>
                  {diseaseOptions.map((disease) => (
                    <MenuItem key={disease} value={disease}>
                      <Checkbox checked={selectedDiseases.indexOf(disease) > -1} color="primary" />
                      <Typography>{disease}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
              <DiseaseMultiSelectPicker
                value={formData?.employeeAccidentInfo?.cronicDiseaseType || []}
                selectedDiseases={selectedDiseases}
                onChange={handleDiseaseChange}
                // otherDiseaseValue={formData?.employeeAccidentInfo?.otherDisease || ""}
                // onOtherDiseaseChange={(v) => handleChange("otherDisease", v)}
              />
              {/* <DiseaseMultiSelectPicker
                modulesManager={modulesManager}
                value={formData?.employeeAccidentInfo?.cronicDiseaseType || []}
                otherValue={formData?.employeeAccidentInfo?.otherDisease || ""}
                onChange={(selected) => handleChange("diseaseType", selected)}
                onOtherChange={(value) => handleChange("otherDisease", value)}
                readOnly={false}
              /> */}
            </Grid>

            {selectedDiseases.includes("Others") && (
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="Specify Other Disease"
                  value={formData?.employeeAccidentInfo?.otherDisease || ""}
                  onChange={(v) => handleChange("otherDisease", v)}
                />
              </Grid>
            )}

            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                label="Diagnosis Date"
                value={formData?.employeeAccidentInfo?.diagnosisDate || ""}
                onChange={(v) => handleChange("diagnosisDate", v)}
                readOnly={false}
              />
            </Grid>

            <Grid item xs={6} className={classes.item}>
              <TextInput label="Doctor's Name" value={formData?.employeeAccidentInfo?.doctorName || ""} onChange={(v) => handleChange("doctorName", v)} />
            </Grid>

            <Grid item xs={12} className={classes.item}>
              <FormControl component="fieldset">
                <FormLabel>Was Admitted to Hospital?</FormLabel>
                <RadioGroup row value={isAdmitted} onChange={handleAdmittedChange}>
                  <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {isAdmitted === "yes" && (
              <>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="Hospital Name (optional)"
                    value={formData?.employeeAccidentInfo?.hospitalName || ""}
                    onChange={(v) => handleChange("hospitalName", v)}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="Admit Date"
                    value={formData?.employeeAccidentInfo?.admitDate || ""}
                    onChange={(v) => handleChange("admitDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="Release Date"
                    value={formData?.employeeAccidentInfo?.releaseDate || ""}
                    onChange={(v) => handleChange("releaseDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="Hospital Doctor’s Name (optional)"
                    value={formData?.employeeAccidentInfo?.hospitalDoctorName || ""}
                    onChange={(v) => handleChange("hospitalDoctorName", v)}
                  />
                </Grid>
              </>
            )}
          </Grid>
        )}

        {/* Keep your accident section as is */}
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
