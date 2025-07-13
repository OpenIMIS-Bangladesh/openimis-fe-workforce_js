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

const EmployeeAccidentInfoForm = ({ handleChange, formData, setFormData, applicationType }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const [selectedOption, setSelectedOption] = useState(formData?.employeeAccidentInfo?.accidentType || "disease");
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
    handleChange("diseaseType", value);
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

        <RadioGroup column value={formData?.employeeAccidentInfo?.accidentType || "disease"} onChange={handleOptionChange}>
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
              <DiseaseMultiSelectPicker
                selectedDiseases={formData?.employeeAccidentInfo?.cronicDiseaseType || []}
                onChange={(value) => handleChange("cronicDiseaseType", value, "employeeAccidentInfo")}
                onOtherDiseaseChange={(value) => handleChange("otherDisease", value, "employeeAccidentInfo")}
                otherDiseaseValue={formData?.employeeAccidentInfo?.otherDisease || ""}
                handleChange={handleChange}
              />
            </Grid>

            {selectedDiseases.includes("অন্যান্য") && (
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label={"workforce.application.accident.otherDieses"}
                  value={formData?.employeeAccidentInfo?.otherDisease || ""}
                  onChange={(v) => handleChange("otherDisease", v)}
                />
              </Grid>
            )}

            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                label={"workforce.application.accident.dateOfDiagnosis"}
                value={formData?.employeeAccidentInfo?.diagnosisDate || ""}
                onChange={(v) => handleChange("diagnosisDate", v)}
                readOnly={false}
              />
            </Grid>

            <Grid item xs={6} className={classes.item}>
              <TextInput
                label={"workforce.employee.accident.info.doctorName"}
                value={formData?.employeeAccidentInfo?.doctorName || ""}
                onChange={(v) => handleChange("doctorName", v)}
              />
            </Grid>

            <Grid item xs={12} className={classes.item}>
              <FormControl component="fieldset">
                <FormLabel>
                  <FormattedMessage id="workforce.application.accident.hospitalized" defaultMessage="হাসপাতালে ভর্তি হয়েছিলেন?" module="workforce" />
                </FormLabel>
                <RadioGroup row value={isAdmitted} onChange={handleAdmittedChange}>
                  <FormControlLabel
                    value="yes"
                    control={<Radio color="primary" />}
                    label={<FormattedMessage id="workforce.application.permission.yes" module="workforce" />}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio color="primary" />}
                    label={<FormattedMessage id="workforce.application.permission.no" module="workforce" />}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {isAdmitted === "yes" && (
              <>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.hospitalName"}
                    value={formData?.employeeAccidentInfo?.hospitalName || ""}
                    onChange={(v) => handleChange("hospitalName", v)}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.accident.info.admitDate"}
                    value={formData?.employeeAccidentInfo?.admitDate || ""}
                    onChange={(v) => handleChange("admitDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.accident.info.releaseDate"}
                    value={formData?.employeeAccidentInfo?.releaseDate || ""}
                    onChange={(v) => handleChange("releaseDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.doctorName"}
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
            {/* <Grid item xs={6} className={classes.item}>
              <EmployeeInjuryTypePicker
                value={formData?.employeeAccidentInfo?.injuryType || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.injuryType" module="workforce" />}
                onChange={(v) => handleChange("injuryType", v)}
                readOnly={false}
                applicationType={applicationType}
              />
            </Grid> */}
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
              <TextInput
                label={"workforce.application.accident.accidentPlace"}
                value={formData?.employeeAccidentInfo?.accidentPlace || ""}
                onChange={(v) => handleChange("accidentPlace", v)}
                required
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                label={"workforce.employee.accident.info.dateOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentDate || ""}
                onChange={(v) => handleChange("accidentDate", v)}
                readOnly={false}
                required
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                label={"workforce.employee.accident.info.timeOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentTime || ""}
                onChange={(v) => handleChange("accidentTime", v)}
                readOnly={false}
                required
              />
            </Grid>

            {/* <Grid item xs={6} className={classes.item}>
              <EmployeeDutyStatusPicker
                value={formData?.employeeAccidentInfo?.dutyStatus || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.dutyStatus" module="workforce" />}
                required
                onChange={(v) => handleChange("dutyStatus", v)}
                readOnly={false}
              />
            </Grid> */}
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
            <Grid item xs={12} className={classes.item}>
              <FormControl component="fieldset">
                <FormLabel>
                  <FormattedMessage id="workforce.application.accident.hospitalized" defaultMessage="হাসপাতালে ভর্তি হয়েছিলেন?" module="workforce" />
                </FormLabel>
                <RadioGroup row value={isAdmitted} onChange={handleAdmittedChange}>
                  <FormControlLabel
                    value="yes"
                    control={<Radio color="primary" />}
                    label={<FormattedMessage id="workforce.application.permission.yes" module="workforce" />}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio color="primary" />}
                    label={<FormattedMessage id="workforce.application.permission.no" module="workforce" />}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {isAdmitted === "yes" && (
              <>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.hospitalName"}
                    value={formData?.employeeAccidentInfo?.hospitalName || ""}
                    onChange={(v) => handleChange("hospitalName", v)}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.accident.info.admitDate"}
                    value={formData?.employeeAccidentInfo?.admitDate || ""}
                    onChange={(v) => handleChange("admitDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.accident.info.releaseDate"}
                    value={formData?.employeeAccidentInfo?.releaseDate || ""}
                    onChange={(v) => handleChange("releaseDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.doctorName"}
                    value={formData?.employeeAccidentInfo?.hospitalDoctorName || ""}
                    onChange={(v) => handleChange("hospitalDoctorName", v)}
                  />
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeAccidentInfoForm;
