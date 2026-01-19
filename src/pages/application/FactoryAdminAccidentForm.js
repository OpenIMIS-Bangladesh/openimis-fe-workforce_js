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
  FormHelperText,
  Button, IconButton
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete"; 
import AddIcon from "@material-ui/icons/Add";
// Existing Custom Pickers/Components
import EmployeeAccidentTypePicker from "../../pickers/EmployeeAccidentTypePicker"; // Used for S.L 07 (Workplace Specific Type)
import EmployeeDutyStatusPicker from "../../pickers/EmployeeDutyStatusPicker"; // Used for S.L 10, 16
import EmployeeInsideOutsideFactoryPicker from "../../pickers/EmployeeInsideOutsideFactoryPicker"; // Used for S.L 08
import DiseaseMultiSelectPicker from "../../pickers/DiseaseMultiSelectPicker"; // Used for Disease logic
import { useTranslations, useModulesManager, TextInput, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import CustomTimePicker from "../../pickers/CustomTimePicker"; // Used for Time fields
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
    marginTop: theme.spacing(2), // Keep a little margin for visual separation if dividers are used
  },
}));

// DOCX Requirement S.L 01 - Main Accident Type Selection
const DOCX_ACCIDENT_TYPES = {
  WORKPLACE: "workforce.accident.mainType.workplace",
  ON_DUTY_RTA: "workforce.accident.mainType.onDutyRTA",
  COMMUTING: "workforce.accident.mainType.commuting",
};

const FactoryAdminAccidentForm = ({ handleChange, formData, setFormData, applicationType, errors }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  // PRESERVED ORIGINAL STATES
  const [aidReasonType, setAidReasonType] = useState(
    formData?.employeeAccidentInfo?.aidReasonType ||
      (formData?.applicationType === "disabilityAssistance" || formData?.organizationType === "eis" ? "accident" : "disease")
  );
  const [selectedDiseases, setSelectedDiseases] = useState(formData?.employeeAccidentInfo?.cronicDiseaseType || []);
  const [isAdmitted, setIsAdmitted] = useState(formData?.employeeAccidentInfo?.admitted || "no");
  const [disAbilityEffect, setDisAbilityEffect] = useState(formData?.employeeAccidentInfo?.disAbilityEffect || "no");
  const [hasRejoined, setHasRejoined] = useState(formData?.employeeAccidentInfo?.hasRejoined || "no");
  
  // NEW STATES BASED ON DOCX REQUIREMENTS
  const [selectedDocxAccidentType, setSelectedDocxAccidentType] = useState(
    formData?.employeeAccidentInfo?.accidentMainType || DOCX_ACCIDENT_TYPES.WORKPLACE
  );
  const [officialOrderIssued, setOfficialOrderIssued] = useState(formData?.employeeAccidentInfo?.officialOrderIssued || "no");
  const [officialComplaint, setOfficialComplaint] = useState(formData?.employeeAccidentInfo?.officialComplaint || "no");
  const [otherInjured, setOtherInjured] = useState(formData?.employeeAccidentInfo?.otherInjured || "no");
  const [hospitalList, setHospitalList] = useState(
    formData?.employeeAccidentInfo?.hospitalList?.length > 0
      ? formData.employeeAccidentInfo.hospitalList
      : [{
          hospitalName: formData?.employeeAccidentInfo?.hospitalName || "",
          admitDate: formData?.employeeAccidentInfo?.admitDate || null,
          admitTime: formData?.employeeAccidentInfo?.admitTime || null,
          hospitalAddress: formData?.employeeAccidentInfo?.hospitalAddress || "",
          releaseDate: formData?.employeeAccidentInfo?.releaseDate || null,
          hospitalDoctorName: formData?.employeeAccidentInfo?.hospitalDoctorName || "",
        }]
  );

  // Handler to add a new empty hospital form
  const handleAddHospital = () => {
    const newList = [...hospitalList, {
      hospitalName: "",
      admitDate: null,
      admitTime: null,
      hospitalAddress: "",
      releaseDate: null,
      hospitalDoctorName: ""
    }];
    setHospitalList(newList);
    handleChange("hospitalList", newList); // Updates parent formData with the array
  };

  // Handler to remove a hospital form by index
  const handleRemoveHospital = (index) => {
    const newList = [...hospitalList];
    newList.splice(index, 1);
    setHospitalList(newList);
    handleChange("hospitalList", newList);
  };

  // Handler to update specific fields within a specific hospital entry
  const handleHospitalFieldChange = (index, fieldName, value) => {
    const newList = [...hospitalList];
    newList[index] = { ...newList[index], [fieldName]: value };
    setHospitalList(newList);
    handleChange("hospitalList", newList);
  };

  useEffect(() => {
    if (!formData?.employeeAccidentInfo?.aidReasonType) {
      handleChange("aidReasonType", aidReasonType);
    }
    if (!formData?.employeeAccidentInfo?.admitted) {
      handleChange("admitted", isAdmitted);
    }
    if (!formData?.employeeAccidentInfo?.accidentMainType) {
        handleChange("accidentMainType", selectedDocxAccidentType );
    }
  }, []);

  // --- HANDLERS (PRESERVED) ---
  const handleOptionChange = (event) => {
    const newValue = event.target.value;
    setAidReasonType(newValue);
    // Assuming original handleChange for top-level fields
    handleChange("aidReasonType", newValue); 
  };
  const handleHasRejoinedChange = (event) => {
    const value = event.target.value;
    setHasRejoined(value);
    handleChange("hasRejoined", value );
  };
  const handleAdmittedChange = (event) => {
    const value = event.target.value;
    setIsAdmitted(value);
    handleChange("admitted", value );
  };
  // ... other preserved handlers (handleDiseaseChange, handleDisabilityEffect) ...
  // Need to ensure handleDiseaseChange updates cronicDiseaseType on employeeAccidentInfo
  const handleDiseaseChange = (event) => {
    const value = event.target.value;
    setSelectedDiseases(value);
    handleChange("cronicDiseaseType", value );
  };

  // --- HANDLERS (NEW DOCX) ---
  const handleDocxAccidentTypeChange = (event) => {
    const value = event.target.value;
    setSelectedDocxAccidentType(value);
    handleChange("accidentMainType", value );
  };
  const handleOfficialOrderChange = (event) => {
    const value = event.target.value;
    setOfficialOrderIssued(value);
    handleChange("officialOrderIssued", value );
  };
  const handleOfficialComplaintChange = (event) => {
    const value = event.target.value;
    setOfficialComplaint(value);
    handleChange("officialComplaint", value );
  };
  const handleOtherInjuredChange = (event) => {
    const value = event.target.value;
    setOtherInjured(value);
    handleChange("otherInjured", value );
  };

  const isOutsideDutyHours = () => {
    const startVal = formData?.employeeAccidentInfo?.dailyDutyStart;
    const endVal = formData?.employeeAccidentInfo?.dailyDutyEnd;
    const accidentVal = formData?.employeeAccidentInfo?.accidentTime;

    // Helper: Convert "09:05 PM", "21:05", or Date Objects to Total Minutes
    const getMinutes = (input) => {
      if (!input) return null;

      // 1. Handle String with AM/PM (Your specific format: "09:05 PM")
      if (typeof input === "string" && input.match(/PM|AM/i)) {
        const match = input.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let [_, hours, minutes, modifier] = match;
          hours = parseInt(hours, 10);
          minutes = parseInt(minutes, 10);

          // Convert to 24-hour format
          if (hours === 12 && modifier.toUpperCase() === "AM") {
            hours = 0; // 12 AM is 00:00
          } else if (hours !== 12 && modifier.toUpperCase() === "PM") {
            hours += 12; // 1 PM to 11 PM -> add 12
          }
          return hours * 60 + minutes;
        }
      }

      // 2. Handle String without AM/PM (24-hour format: "21:05")
      if (typeof input === "string" && input.includes(":")) {
        const [h, m] = input.split(":").map((v) => parseInt(v, 10));
        if (!isNaN(h) && !isNaN(m)) {
          return h * 60 + m;
        }
      }

      // 3. Handle Date Objects (If the picker returns a Date object directly)
      if (input instanceof Date || (typeof input === "object" && input.toDate)) {
        const d = input.toDate ? input.toDate() : input;
        return d.getHours() * 60 + d.getMinutes();
      }

      return null;
    };

    const startMins = getMinutes(startVal);
    const endMins = getMinutes(endVal);
    const accidentMins = getMinutes(accidentVal);

    // If calculation failed for any reason (missing data), hide the field
    if (startMins === null || endMins === null || accidentMins === null) {
      return false;
    }

    // LOGIC: Compare minutes
    if (startMins <= endMins) {
      // SCENARIO A: Standard Shift (e.g., 09:00 AM to 06:00 PM) -> (540 to 1080)
      // Outside if BEFORE start OR AFTER end
      return accidentMins < startMins || accidentMins > endMins;
    } else {
      // SCENARIO B: Night Shift crossing midnight (e.g., 10:00 PM to 06:00 AM)
      // Outside is the day time gap
      return accidentMins > endMins && accidentMins < startMins;
    }
  };
  console.log(formData)
  // --- RENDERING STARTS HERE ---
  return (
    <Box mt={2}>
      <Paper className={classes.paper} elevation={0}>
        {/* <Typography mb={4} style={{ textAlign: "center", fontWeight: "bold", fontSize: "small", margin: "15px" }}>
          <FormattedMessage id="workforce.application.steps.treatment.info" module="workforce" />
        </Typography>
        <Typography variant="h6" gutterBottom>
          {applicationType === "disabilityAssistance" ? (
            <FormattedMessage id="workforce.application.disabilityDetails" />
          ) : (
            <FormattedMessage id="workforce.employee.accident.info.title" />
          )}
        </Typography> */}

        {/* PRESERVED: AID REASON TYPE RADIO GROUP */}
        {(formData?.applicationType !== "disabilityAssistance" || formData?.organizationType === "eis") && (
          <RadioGroup column value={formData?.employeeAccidentInfo?.aidReasonType || aidReasonType || "disease"} onChange={handleOptionChange}>
            {/* <FormControlLabel value="disease" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.employee.aid.reason.info.cronic" />} /> */}
            <FormControlLabel
              value="accident"
              control={<Radio color="primary" />}
              label={<FormattedMessage id="workforce.employee.aid.reason.info.accident" />}
            />
          </RadioGroup>
        )}

        <Divider style={{ margin: "16px 0" }} />

        {/* MODIFIED: ACCIDENT SECTION BASED ON DOCX */}
        {aidReasonType === "accident" && (
          <Grid container spacing={2}>
            {/* 1. Type of Accident (S.L 01) - Main Category (Full Width Radio) */}
            <Grid item xs={12} className={classes.item}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel>
                    <FormattedMessage id="workforce.accident.mainType.label" defaultMessage="Type of Accident (Main Category - S.L 01)" />
                </FormLabel>
                <RadioGroup row value={selectedDocxAccidentType} onChange={handleDocxAccidentTypeChange}>
                  {Object.values(DOCX_ACCIDENT_TYPES).map((type) => (
                    <FormControlLabel
                      key={type}
                      value={type}
                      control={<Radio color="primary" />}
                      label={<FormattedMessage id={type}/>}
                    />
                  ))}
                </RadioGroup>
                {errors?.accidentMainType && <FormHelperText error>{errors?.accidentMainType}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Daily Duty Schedule (S.L 02, 03) */}
            <Grid item xs={6} className={classes.item}>
              <CustomTimePicker
                label={"workforce.accident.dailyDutyStart.label"}
                value={formData?.employeeAccidentInfo?.dailyDutyStart || ""}
                onChange={(value) => handleChange("dailyDutyStart", value )}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <CustomTimePicker
                label={"workforce.accident.dailyDutyEnd.label"}
                value={formData?.employeeAccidentInfo?.dailyDutyEnd || ""}
                onChange={(value) => handleChange("dailyDutyEnd", value )}
              />
            </Grid>

            {/* Date and Time of Accident (S.L 04, 05) */}
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label={"workforce.employee.accident.info.dateOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentDate || ""}
                onChange={(v) => handleChange("accidentDate", v )}
                required
              />
              {errors?.accidentDate && <FormHelperText error><FormattedMessage id={errors?.accidentDate} /></FormHelperText>}
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <CustomTimePicker
                label={"workforce.employee.accident.info.timeOfAccident"}
                value={formData?.employeeAccidentInfo?.accidentTime || ""}
                onChange={(value) => handleChange("accidentTime", value )}
                required
              />
            </Grid>

            {/* Explanation for Accident Occurring Outside Official Duty Hours (S.L 06) - Full width text input */}
            { isOutsideDutyHours() && (
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label={"workforce.accident.outsideDutyExplanation.label"}
                  value={formData?.employeeAccidentInfo?.outsideDutyExplanation || ""}
                  onChange={(v) => handleChange("outsideDutyExplanation", v )}
                  multiline
                  rows={2}
                />
              </Grid>
            )}

            {/* --- Applicable for Workplace Accident (S.L 07-10) --- */}
            {selectedDocxAccidentType === DOCX_ACCIDENT_TYPES.WORKPLACE && (
              <>
                {/* Type of Accident (Workplace Specific - S.L 07) - Using existing picker */}
                <Grid item xs={6} className={classes.item}>
                  <EmployeeAccidentTypePicker
                    id="accidentSpecificType"
                    value={formData?.employeeAccidentInfo?.accidentSpecificType || ""}
                    label={<FormattedMessage id="workforce.accident.specificType.label" defaultMessage="Type of Accident" />}
                    required
                    onChange={(v) => handleChange("accidentSpecificType", v )}
                    readOnly={false}
                  />
                  {errors?.accidentSpecificType && <FormHelperText error>{errors?.accidentSpecificType}</FormHelperText>}
                </Grid>
                {/* Other Accident Type (Conditional on Picker selection) */}
                {formData?.employeeAccidentInfo?.accidentSpecificType === "workforce.accident.type.others" && (
                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="otherAccidentType"
                            label={"workforce.application.accident.otherAccidentType"}
                            value={formData?.employeeAccidentInfo?.otherAccidentType || ""}
                            required
                            onChange={(v) => handleChange("otherAccidentType", v )}
                        />
                    </Grid>
                )}

                {/* Place of Accident (S.L 08) - Using existing picker */}
                <Grid item xs={6} className={classes.item}>
                  <EmployeeInsideOutsideFactoryPicker
                    id="inOutsideFactory"
                    value={formData?.employeeAccidentInfo?.inOutsideFactory || ""}
                    label={<FormattedMessage id="workforce.employee.accident.info.insideOutsideFactory" defaultMessage="Place of Accident" />}
                    required
                    onChange={(v) => handleChange("inOutsideFactory", v )}
                  />
                  {errors?.inOutsideFactory && <FormHelperText error>{errors?.inOutsideFactory}</FormHelperText>}
                </Grid>

                {/* Description of Duty Status (S.L 10) - Using existing picker */}
                 <Grid item xs={6} className={classes.item}>
                    <EmployeeDutyStatusPicker
                      id="dutyStatusWorkplace"
                      value={formData?.employeeAccidentInfo?.dutyStatusWorkplace || ""}
                      label={"workforce.employee.accident.info.dutyStatus"}
                      onChange={(v) => handleChange("dutyStatusWorkplace", v )}
                      required
                    />
                  </Grid>

                {/* Specify the Place of Accident (S.L 09) - If Out of Factory is selected - xs=12 if needed for a longer text, but keeping xs=6 for consistency */}
                {(formData?.employeeAccidentInfo?.inOutsideFactory === "কর্মস্থল থেকে বাসায় যাওয়ার পথে"||
                  formData?.employeeAccidentInfo?.inOutsideFactory === "বাসা থেকে কর্মস্থলে যাওয়ার পথে" ||
                  formData?.employeeAccidentInfo?.inOutsideFactory === "অন্যস্থানে" 
                ) && (
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label={"workforce.accident.outOfFactoryPlace.label"}
                      value={formData?.employeeAccidentInfo?.outOfFactoryPlace || ""}
                      onChange={(v) => handleChange("outOfFactoryPlace", v )}
                      required
                    />
                  </Grid>
                )}
              </>
            )}

            {/* --- Applicable for Commuting/On Duty RTA (S.L 11-15) --- */}
            {(selectedDocxAccidentType === DOCX_ACCIDENT_TYPES.COMMUTING || selectedDocxAccidentType === DOCX_ACCIDENT_TYPES.ON_DUTY_RTA) && (
              <>
                {/* Approximate Starting Time of Journey (S.L 11) */}
                <Grid item xs={6} className={classes.item}>
                  <CustomTimePicker
                    label={"workforce.accident.journeyStartTime.label"}
                    value={formData?.employeeAccidentInfo?.journeyStartTime || ""}
                    onChange={(value) => handleChange("journeyStartTime", value )}
                  />
                </Grid>
                
                {/* Starting Point of Journey (S.L 12) */}
                <Grid item xs={6} className={classes.item}>
                    <TextInput
                        label="workforce.accident.journeyStartPoint.label"
                        value={formData?.employeeAccidentInfo?.journeyStartPoint || ""}
                        onChange={(v) => handleChange("journeyStartPoint", v )}
                        required
                    />
                </Grid>
                
                {/* Destination of journey (S.L 13) */}
                <Grid item xs={6} className={classes.item}>
                    <TextInput
                        label="workforce.accident.journeyDestination.label"
                        value={formData?.employeeAccidentInfo?.journeyDestination || ""}
                        onChange={(v) => handleChange("journeyDestination", v )}
                        required
                    />
                </Grid>

                {/* Mode of Travelling (S.L 14) */}
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.accident.modeOfTravel.label"
                    value={formData?.employeeAccidentInfo?.modeOfTravel || ""}
                    onChange={(v) => handleChange("modeOfTravel", v )}
                    required
                  />
                </Grid>

                {/* Description of the Road use by the worker (S.L 15) - Full width text input */}
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="workforce.accident.roadDescription.label"
                    value={formData?.employeeAccidentInfo?.roadDescription || ""}
                    onChange={(v) => handleChange("roadDescription", v )}
                    multiline
                    rows={2}
                  />
                </Grid>
              </>
            )}

            {/* --- Applicable for On Duty RTA (S.L 16-21) --- */}
            {selectedDocxAccidentType === DOCX_ACCIDENT_TYPES.ON_DUTY_RTA && (
              <>
                {/* Description of Duty Status (S.L 16) */}
                <Grid item xs={6} className={classes.item}>
                  <EmployeeDutyStatusPicker
                    id="dutyStatusRTA"
                    value={formData?.employeeAccidentInfo?.dutyStatusRTA || ""}
                    label="workforce.employee.accident.info.dutyStatus"
                    onChange={(v) => handleChange("dutyStatusRTA", v )}
                    required
                  />
                </Grid>
                {/* Purpose of Travelling (S.L 17) */}
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.accident.travelPurpose.label"
                    value={formData?.employeeAccidentInfo?.travelPurpose || ""}
                    onChange={(v) => handleChange("travelPurpose", v )}
                    required
                  />
                </Grid>
                
                {/* Is the Employee Regularly Travel for this purpose (S.L 19) */}
                <Grid item xs={6} className={classes.item}>
                  <FormControl component="fieldset">
                    <FormLabel>{<FormattedMessage id="workforce.accident.regularTravel.label"/>}</FormLabel>
                    <RadioGroup
                      row
                      value={formData?.employeeAccidentInfo?.regularTravel || "no"}
                      onChange={(e) => handleChange("regularTravel", e.target.value )}
                    >
                      <FormControlLabel value="yes" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.yes"/>} />
                      <FormControlLabel value="no" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.no"/>} />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                {/* Any Official Order was Issued (S.L 20) */}
                <Grid item xs={6} className={classes.item}>
                  <FormControl component="fieldset">
                    <FormLabel>{<FormattedMessage id="workforce.accident.officialOrderIssued.label"/>}</FormLabel>
                    <RadioGroup row value={officialOrderIssued} onChange={handleOfficialOrderChange}>
                      <FormControlLabel value="yes" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.yes"/>} />
                      <FormControlLabel value="no" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.no"/>} />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* What work was the worker engaged in (S.L 18) - Full width text input */}
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="workforce.accident.workEngagedIn.label"
                    value={formData?.employeeAccidentInfo?.workEngagedIn || ""}
                    onChange={(v) => handleChange("workEngagedIn", v )}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                {/* Upload the Official Order copy (S.L 21) - Full width text input */}
                
              </>
            )}

            <Divider style={{ margin: "16px 0" }} />

            {/* --- Applicable For All: General Accident & Complaint Details (S.L 20-25) --- */}
            
            <Grid item xs={12} className={classes.item}>
              {/* Details of Accident (S.L 20/23) - Full width text input */}
              <TextInput
                label="workforce.accident.detailsOfAccident.label"
                value={formData?.employeeAccidentInfo?.detailsOfAccident || ""}
                onChange={(v) => handleChange("detailsOfAccident", v )}
                required
                multiline
                rows={3}
                error={!!errors?.detailsOfAccident}
                helperText={errors?.detailsOfAccident}
              />
            </Grid>
            
            {/* If anyone else was injured (S.L 21) - Full width radio group */}
            <Grid item xs={12} className={classes.item}>
              <FormControl component="fieldset">
                <FormLabel>{<FormattedMessage id="workforce.accident.otherInjured.label" />}</FormLabel>
                <RadioGroup row value={otherInjured} onChange={handleOtherInjuredChange}>
                  <FormControlLabel value="yes" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.yes"/>} />
                  <FormControlLabel value="no" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.no"/>} />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Details of the affected worker (S.L 22) - If yes selected */}
            {otherInjured === "yes" && (
              <Grid item xs={12} className={classes.item}>
                {/* Adding a small descriptive label for the section */}
                <Typography variant="subtitle2" gutterBottom>{<FormattedMessage id="workforce.accident.otherInjuredName.label"/>}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}><TextInput label="workforce.employee.name" value={formData?.employeeAccidentInfo?.otherInjuredName || ""} onChange={(v) => handleChange("otherInjuredName", v )} /></Grid>
                    <Grid item xs={6}><TextInput label="workforce.employee.designation" value={formData?.employeeAccidentInfo?.otherInjuredDesignation || ""} onChange={(v) => handleChange("otherInjuredDesignation", v )} /></Grid>
                    <Grid item xs={6}><TextInput label="workforce.employee.phone" value={formData?.employeeAccidentInfo?.otherInjuredPhone || ""} onChange={(v) => handleChange("otherInjuredPhone", v )} /></Grid>
                    <Grid item xs={6}><TextInput label="workforce.accident.otherInjuredType.label"value={formData?.employeeAccidentInfo?.otherInjuredType || ""} onChange={(v) => handleChange("otherInjuredType", v )} /></Grid>
                    <Grid item xs={6} className={classes.item}>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel>{<FormattedMessage id="workforce.accident.otherInjuredBenefit.label"/>}</FormLabel>
                            <RadioGroup
                                row
                                value={formData?.employeeAccidentInfo?.otherInjuredBenefit || "no"}
                                onChange={(e) => handleChange("otherInjuredBenefit", e.target.value, "employeeAccidentInfo")}
                            >
                                <FormControlLabel value="yes" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.permission.yes"/>} />
                                <FormControlLabel value="no" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.permission.no"/>} />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    
                    {/* FIX: Tracking Number Conditional Text Input */}
                    {formData?.employeeAccidentInfo?.otherInjuredBenefit === "yes" && (
                        <Grid item xs={6} className={classes.item}>
                            <TextInput 
                                label="workforce.accident.otherInjuredTracking.label"
                                value={formData?.employeeAccidentInfo?.otherInjuredTracking || ""} 
                                onChange={(v) => handleChange("otherInjuredTracking", v, "employeeAccidentInfo")} 
                            />
                        </Grid>
                    )}
                   
                </Grid>
              </Grid>
            )}

            {/* Any official Complaint (GD/FIR/Postmortem) (S.L 24) */}
            <Grid item xs={6} className={classes.item}>
              <FormControl component="fieldset">
                <FormLabel>{<FormattedMessage id="workforce.accident.officialComplaint.label"/>}</FormLabel>
                <RadioGroup row value={officialComplaint} onChange={handleOfficialComplaintChange}>
                  <FormControlLabel value="yes" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.yes"/>} />
                  <FormControlLabel value="no" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.no"/>} />
                </RadioGroup>
              </FormControl>
            </Grid>
            {/* Upload the Complaint Copy (S.L 25) */}
            

            <Divider style={{ margin: "16px 0" }} />

            {/* --- Applicable For All: Treatment Details (S.L 24-27) --- */}

            {/* Hospitalized check (S.L 24-27 logic) - Full width radio group */}
            <Grid item xs={12} className={classes.item}>
              <FormControl component="fieldset">
                <FormLabel>{<FormattedMessage id="workforce.accident.hospitalized.label"/>}</FormLabel>
                <RadioGroup row value={isAdmitted} onChange={handleAdmittedChange}>
                  <FormControlLabel value="yes" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.yes"/>} />
                  <FormControlLabel value="no" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.no"/>} />
                </RadioGroup>
              </FormControl>
            </Grid>

            {isAdmitted === "yes" && (
              <Grid item xs={12}>
                {hospitalList.map((hospital, index) => (
                  <Box 
                    key={index} 
                    mb={2} 
                    p={2} 
                    border={1} 
                    borderColor="grey.300" 
                    borderRadius={4}
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                           {/* Translate "Hospital Information" or use static text */}
                           <FormattedMessage id="workforce.accident.hospitalInfo.title" defaultMessage="Hospital Information" /> #{index + 1}
                        </Typography>
                        
                        {/* Only show delete button if there is more than 1 entry */}
                        {hospitalList.length > 1 && (
                          <IconButton size="small" onClick={() => handleRemoveHospital(index)} style={{color:"red"}}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Grid>

                      <Grid item xs={6}>
                        <TextInput
                          label="workforce.accident.hospitalName.label"
                          value={hospital.hospitalName || ""}
                          onChange={(v) => handleHospitalFieldChange(index, "hospitalName", v)}
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <PublishedComponent
                          pubRef="workforce.DatePicker"
                          label="workforce.accident.admitDate.label"
                          value={hospital.admitDate || ""}
                          onChange={(v) => handleHospitalFieldChange(index, "admitDate", v)}
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <CustomTimePicker
                          label="workforce.accident.admitTime.label"
                          value={hospital.admitTime || ""}
                          onChange={(v) => handleHospitalFieldChange(index, "admitTime", v)}
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <TextInput
                          label="workforce.accident.hospitalAddress.label"
                          value={hospital.hospitalAddress || ""}
                          onChange={(v) => handleHospitalFieldChange(index, "hospitalAddress", v)}
                          multiline
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <PublishedComponent
                          pubRef="workforce.DatePicker"
                          label="workforce.employee.accident.info.releaseDate"
                          value={hospital.releaseDate || ""}
                          onChange={(v) => handleHospitalFieldChange(index, "releaseDate", v)}
                          readOnly={false}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <TextInput
                          label="workforce.accident.hospitalDoctorName.label"
                          value={hospital.hospitalDoctorName || ""}
                          onChange={(v) => handleHospitalFieldChange(index, "hospitalDoctorName", v)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                {/* ADD BUTTON */}
                <Box mt={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddHospital}
                  >
                    <FormattedMessage id="workforce.accident.addHospital.btn" defaultMessage="Add Another Hospital" />
                  </Button>
                </Box>
              </Grid>
            )}

            {/* --- Applicable for Death Case (S.L 28-30) --- */}
            {formData?.applicationType === "financialAssistance" && (
                <>
                <Divider style={{ margin: "16px 0" }} />
                <Grid item xs={6} className={classes.item}>
                    <TextInput
                    label="workforce.accident.placeOfDeath.label"
                    value={formData?.employeeAccidentInfo?.placeOfDeath || ""}
                    onChange={(v) => handleChange("placeOfDeath", v )}
                    />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label="workforce.accident.dateOfDeath.label"
                    value={formData?.employeeAccidentInfo?.dateOfDeath || ""}
                    onChange={(v) => handleChange("dateOfDeath", v )}
                    />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                    <CustomTimePicker
                    label="workforce.accident.timeOfDeath.label"
                    value={formData?.employeeAccidentInfo?.timeOfDeath || ""}
                    onChange={(value) => handleChange("timeOfDeath", value )}
                    />
                </Grid>
                </>
            )}

            {/* --- Applicable for Disability Case (S.L 31-32) --- */}
            {applicationType === "disabilityAssistance" && (
                <>
                <Divider style={{ margin: "16px 0" }} />
                <Grid item xs={6} className={classes.item}>
                    <FormControl component="fieldset">
                    <FormLabel>{<FormattedMessage id="workforce.employee.accident.info.hasRejoined"/>}</FormLabel>
                    <RadioGroup row value={hasRejoined} onChange={handleHasRejoinedChange}>
                        <FormControlLabel value="yes" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.yes"/>} />
                        <FormControlLabel value="no" control={<Radio color="primary" />}  label={<FormattedMessage id="workforce.application.permission.no"/>} />
                    </RadioGroup>
                    </FormControl>
                </Grid>
                {hasRejoined === "yes" && (
                    <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                        pubRef="workforce.DatePicker"
                        label="workforce.employee.accident.info.reJoiningDate"
                        value={formData?.employeeAccidentInfo?.dateOfRejoining || ""}
                        onChange={(v) => handleChange("dateOfRejoining", v )}
                    />
                    </Grid>
                )}
                </>
            )}
          </Grid>
        )}
      </Paper>

      {formData?.applicationType === "disabilityAssistance"&&(
      <EmployeeDetailsForm2
        handleChange={()=>{}}
        formData={formData}
        selectedApplicationType={formData.applicationType}
        formStepNo={"employeeAccidentInfo"}
      />
      ) }
    </Box>
  );
};

export default FactoryAdminAccidentForm;