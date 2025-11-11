import React, { useEffect, useState } from "react";
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
  FormHelperText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EmployeeInjuryTypePicker from "../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker from "../../pickers/EmployeeAccidentTypePicker";
import EmployeeDutyStatusPicker from "../../pickers/EmployeeDutyStatusPicker";
import EmployeeInsideOutsideFactoryPicker from "../../pickers/EmployeeInsideOutsideFactoryPicker";
import DiseaseMultiSelectPicker from "../../pickers/DiseaseMultiSelectPicker";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
// import CustomDateTimePicker from "../../pickers/CustomDateTimePicker";
import CustomTimePicker from "../../pickers/CustomTimePicker";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";

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

const EmployeeAccidentInfoForm = ({ handleChange, formData, setFormData, applicationType, errors }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const [aidReasonType, setAidReasonType] = useState(
    formData?.employeeAccidentInfo?.aidReasonType ||
      (formData?.applicationType === "disabilityAssistance" || formData?.organizationType === "eis" ? "accident" : "disease")
  );
  const [selectedDiseases, setSelectedDiseases] = useState(formData?.employeeAccidentInfo?.cronicDiseaseType || []);
  const [isAdmitted, setIsAdmitted] = useState(formData?.employeeAccidentInfo?.admitted || "no");
  const [disAbilityEffect, setDisAbilityEffect] = useState(formData?.employeeAccidentInfo?.disAbilityEffect || "no");
  const [hasRejoined, setHasRejoined] = useState(formData?.employeeAccidentInfo?.hasRejoined || "no");

  useEffect(() => {
    if (!formData?.employeeAccidentInfo?.aidReasonType) {
      handleChange("aidReasonType", aidReasonType);
    }
    if (!formData?.employeeAccidentInfo?.admitted) {
      handleChange("admitted", isAdmitted);
    }
  }, []);

  const handleOptionChange = (event) => {
    const newValue = event.target.value;
    setAidReasonType(newValue);
    handleChange("aidReasonType", newValue);
  };
  const handleHasRejoinedChange = (event) => {
    const value = event.target.value;
    setHasRejoined(value);
    handleChange("hasRejoined", value, "employeeAccidentInfo");
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
  const handleDisabilityEffect = (event) => {
    const value = event.target.value;
    setDisAbilityEffect(value);
    handleChange("disabilityEffect", value);
  };

  return (
    <Box mt={2}>
      <Paper className={classes.paper} elevation={0}>
        <Typography mb={4} style={{ textAlign: "center", fontWeight: "bold", fontSize: "small", margin: "15px" }}>
          <FormattedMessage id="workforce.application.steps.treatment.info" module="workforce" />
        </Typography>
        <Typography variant="h6" gutterBottom>
          {applicationType === "disabilityAssistance" ? (
            <FormattedMessage id="workforce.application.disabilityDetails" />
          ) : (
            <FormattedMessage id="workforce.employee.accident.info.title" />
          )}
        </Typography>

        {(formData?.applicationType !== "disabilityAssistance" || formData?.organizationType === "eis") && (
          <RadioGroup column value={formData?.employeeAccidentInfo?.aidReasonType || aidReasonType || "disease"} onChange={handleOptionChange}>
            <FormControlLabel value="disease" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.employee.aid.reason.info.cronic" />} />
            <FormControlLabel
              value="accident"
              control={<Radio color="primary" />}
              label={<FormattedMessage id="workforce.employee.aid.reason.info.accident" />}
            />
          </RadioGroup>
        )}

        <Divider style={{ margin: "16px 0" }} />

        {aidReasonType === "disease" && (
          <Grid container spacing={1}>
            <Grid item xs={6} className={classes.item}>
              <DiseaseMultiSelectPicker
                id="cronicDiseaseType"
                selectedDiseases={formData?.employeeAccidentInfo?.cronicDiseaseType || []}
                onChange={(value) => handleChange("cronicDiseaseType", value, "employeeAccidentInfo")}
                onOtherDiseaseChange={(value) => handleChange("otherDisease", value, "employeeAccidentInfo")}
                otherDiseaseValue={formData?.employeeAccidentInfo?.otherDisease || ""}
                handleChange={(key, value) => handleChange(key, value, null)}
                required={true}
              />
              {errors?.cronicDiseaseType && <FormHelperText error>{errors?.cronicDiseaseType}</FormHelperText>}
            </Grid>

            {selectedDiseases.includes("অন্যান্য") && (
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label={"workforce.application.accident.otherDieses"}
                  value={formData?.employeeAccidentInfo?.otherDisease || ""}
                  onChange={(v) => handleChange("cronicDiseaseType", v)}
                />
              </Grid>
            )}

            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label={"workforce.application.accident.dateOfDiagnosis"}
                value={formData?.employeeAccidentInfo?.diagnosisDate || ""}
                onChange={(v) => handleChange("diagnosisDate", v)}
                readOnly={false}
                required
              />
              {errors?.rdmp && <FormHelperText error>{errors?.rdmp}</FormHelperText>}
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
                    id="hospitalName"
                    label={"workforce.employee.accident.info.hospitalName"}
                    value={formData?.employeeAccidentInfo?.hospitalName || ""}
                    onChange={(v) => handleChange("hospitalName", v)}
                    required
                    error={!!errors?.hospitalName}
                    helperText={errors?.hospitalName}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.accident.info.admitDate"}
                    value={formData?.employeeAccidentInfo?.admitDate || ""}
                    onChange={(v) => handleChange("admitDate", v)}
                    readOnly={false}
                    required
                  />
                  {errors?.rdmp && <FormHelperText error>{errors?.rdmp}</FormHelperText>}
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.accident.info.releaseDate"}
                    value={formData?.employeeAccidentInfo?.releaseDate || ""}
                    onChange={(v) => handleChange("releaseDate", v)}
                    readOnly={false}
                    required
                  />
                  {errors?.rdmp && <FormHelperText error>{errors?.rdmp}</FormHelperText>}
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
        {aidReasonType === "accident" && (
          <Grid container spacing={2}>
            <Grid item xs={6} className={classes.item}>
              <EmployeeAccidentTypePicker
                id="accidentType"
                value={formData?.employeeAccidentInfo?.accidentType || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.typeOfAccident" module="workforce" />}
                required
                onChange={(v) => handleChange("accidentType", v)}
                readOnly={false}
              />
              {errors?.accidentType && <FormHelperText error>{errors?.accidentType}</FormHelperText>}
            </Grid>
            {formData?.employeeAccidentInfo?.accidentType === "workforce.accident.type.others" && (
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  id="otherAccidentType"
                  label={"workforce.application.accident.otherAccidentType"}
                  value={formData?.employeeAccidentInfo?.otherAccidentType || ""}
                  required
                  onChange={(v) => handleChange("otherAccidentType", v)}
                  error={!!errors?.otherAccidentType}
                  helperText={!!errors?.otherAccidentType}
                />
              </Grid>
            )}
            <Grid item xs={6} className={classes.item}>
              <TextInput
                id="accidentPlace"
                label={"workforce.application.accident.accidentPlace"}
                value={formData?.employeeAccidentInfo?.accidentPlace || ""}
                onChange={(v) => handleChange("accidentPlace", v)}
                required
                error={!!errors?.accidentPlace}
                helperText={errors?.accidentPlace}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label={"workforce.employee.accident.info.dateOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentDate || ""}
                onChange={(v) => handleChange("accidentDate", v)}
                readOnly={false}
                required
              />
              {/* {errors?.rdmp && <FormHelperText error>{errors?.rdmp}</FormHelperText>} */}
              {errors?.accidentDate && (
                <FormHelperText error>
                  <FormattedMessage id={errors?.accidentDate} />
                </FormHelperText>
              )}
              {/* <CustomDateTimePicker isDateTime value={formData?.employeeAccidentInfo?.accidentDate || ""} label="দুর্ঘটনার সময়" onChange={(v) => handleChange("accidentDate", v)} /> */}
            </Grid>
            <Grid item xs={6} className={classes.item}>
              {/* <PublishedComponent
                pubRef="workforce.DatePicker"
                label={"workforce.employee.accident.info.timeOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentTime || ""}
                onChange={(v) => handleChange("accidentTime", v)}
                readOnly={false}
                required
              /> */}
              <CustomTimePicker
                label={"workforce.employee.accident.info.timeOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentTime || ""}
                onChange={(value) => handleChange("accidentTime", value)}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <EmployeeInsideOutsideFactoryPicker
                id="inOutsideFactory"
                value={formData?.employeeAccidentInfo?.inOutsideFactory || ""}
                label={<FormattedMessage id="workforce.employee.accident.info.insideOutsideFactory" module="workforce" />}
                required
                onChange={(v) => handleChange("inOutsideFactory", v)}
                readOnly={false}
              />
              {errors?.inOutsideFactory && <FormHelperText error>{errors?.inOutsideFactory}</FormHelperText>}
            </Grid>
            <Grid item xs={12} className={classes.item}>
              <FormControl component="fieldset">
                <FormLabel>
                  <FormattedMessage
                    id="workforce.employee.accident.info.hasRejoined"
                    defaultMessage="আপনি কি সুস্থ হওয়ার পরে পুনরায় কর্মস্থলে যোগদান করেছেন?"
                    module="workforce"
                  />
                </FormLabel>
                <RadioGroup row value={hasRejoined} onChange={handleHasRejoinedChange}>
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

            {hasRejoined === "yes" && (
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label={"workforce.employee.accident.info.reJoiningDate"}
                  value={formData?.employeeAccidentInfo?.reJoiningDate || ""}
                  onChange={(v) => handleChange("reJoiningDate", v)}
                  readOnly={false}
                />
              </Grid>
            )}

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
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.accident.info.admitDate"}
                    value={formData?.employeeAccidentInfo?.admitDate || ""}
                    onChange={(v) => handleChange("admitDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
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
            {formData?.organizationType === "eis" && (
              <>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.breifInfo"}
                    value={formData?.employeeAccidentInfo?.accidentBriefInfo || ""}
                    onChange={(v) => handleChange("accidentBriefInfo", v)}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.injurySite"}
                    value={formData?.employeeAccidentInfo?.injurySite || ""}
                    onChange={(v) => handleChange("injurySite", v)}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.injuryDescription"}
                    value={formData?.employeeAccidentInfo?.injuryDescription || ""}
                    onChange={(v) => handleChange("injuryDescription", v)}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <FormControl component="fieldset">
                    <FormLabel>
                      <FormattedMessage id="workforce.employee.accident.info.disAbilityEffect" module="workforce" />
                    </FormLabel>
                    <RadioGroup row value={disAbilityEffect} onChange={handleDisabilityEffect}>
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
                {disAbilityEffect === "yes"&&(
                  <>
                  <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.disabilityPerSchedule"}
                    value={formData?.employeeAccidentInfo?.disabilityPerSchedule || ""}
                    onChange={(v) => handleChange("disabilityPerSchedule", v)}
                  />
                </Grid>
                  <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={"workforce.employee.accident.info.presentInjuryBLASchedule1"}
                    value={formData?.employeeAccidentInfo?.presentInjuryBLASchedule1 || ""}
                    onChange={(v) => handleChange("presentInjuryBLASchedule1", v)}
                  />
                </Grid>
                </>
                )}
              </>
            )}
          </Grid>
        )}
      </Paper>
      <EmployeeDetailsForm2
        handleChange={handleChange}
        formData={formData}
        selectedApplicationType={formData.applicationType}
        formStepNo={"employeeAccidentInfo"}
      />
    </Box>
  );
};

export default EmployeeAccidentInfoForm;
