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
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Button,
  IconButton,
  FormHelperText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Add, Delete } from "@material-ui/icons";
import { useTranslations, useModulesManager, TextInput, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";

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
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
  },
  doctorCard: {
    border: "1px solid #ddd",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 8,
  },
  removeBtn: {
    color: theme.palette.error.main,
  },
}));



const EisDoctorEntries = ({ handleChange, formData, setFormData, applicationType, errors }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const user_type = getUserType();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  
  const [hasLimitations, setHasLimitations] = useState(formData?.employeeAccidentInfo?.hasLimitations || "no");


  const handleLimitationsChange = (event) => {
    const value = event.target.value;
    setHasLimitations(value);
    handleChange("hasLimitations", value);
  };


  return (
    <Box mt={2}>
      <Paper className={classes.paper} elevation={0}>
        {/* <Typography mb={4} style={{ textAlign: "center", fontWeight: "bold", fontSize: "small", margin: "15px" }}>
          <FormattedMessage id="workforce.application.steps.treatment.info" module="workforce" />
        </Typography>

        <Divider style={{ margin: "16px 0" }} /> */}

        {/* Doctor Creation Section */}

        {/* Assessment Details */}
        <Typography variant="h6" className={classes.sectionTitle}>
          <FormattedMessage id="workforce.disability.assessmentDetails" defaultMessage="Assessment Details" />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="workforce.DatePicker"
              label="workforce.disability.dateOfAssessment"
              value={formData?.employeeAccidentInfo?.dateOfAssessment||formData?.doctorsEntry?.dateOfAssessment || ""}
              onChange={(v) => handleChange("dateOfAssessment", v)}
              required
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TextInput
              label="workforce.disability.nameOfAssessmentMeeting"
              value={formData?.employeeAccidentInfo?.nameOfAssessmentMeeting||formData?.doctorsEntry?.nameOfAssessmentMeeting || ""}
              onChange={(v) => handleChange("nameOfAssessmentMeeting", v)}
              required
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TextInput
              multiline
              rows={4}
              label="workforce.disability.briefInjuryDescription"
              value={formData?.employeeAccidentInfo?.briefInjuryDescription||formData?.doctorsEntry?.briefInjuryDescription || ""}
              onChange={(v) => handleChange("briefInjuryDescription", v)}
              required
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TextInput
              multiline
              rows={4}
              label="workforce.disability.briefTreatmentDescription"
              value={formData?.employeeAccidentInfo?.briefTreatmentDescription||formData?.doctorsEntry?.briefTreatmentDescription || ""}
              onChange={(v) => handleChange("briefTreatmentDescription", v)}
              required
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              <FormattedMessage id="workforce.disability.physicalExamination" defaultMessage="Physical Examination Findings" />
            </Typography>
          </Grid>
         
          <Grid item xs={6} className={classes.item}>
            <TextInput
              label="workforce.disability.injurySiteLocation"
              value={formData?.employeeAccidentInfo?.injurySiteLocation|| formData?.doctorsEntry?.injurySiteLocation|| ""}
              onChange={(v) => handleChange("injurySiteLocation", v)}
              required
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TextInput
              //   multiline
              //   rows={4}
              label="workforce.disability.injuryDetailsDescription"
              value={formData?.employeeAccidentInfo?.injuryDetailsDescription||formData?.doctorsEntry?.injuryDetailsDescription || ""}
              onChange={(v) => handleChange("injuryDetailsDescription", v)}
              required
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              <FormattedMessage
                id="workforce.disability.observationCurrentCondition"
                defaultMessage="Observation After Evaluating the Current Condition of Employee"
              />
            </Typography>
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <FormControl component="fieldset">
              <FormLabel>
                <FormattedMessage
                  id="workforce.disability.limitationsOccupationDailyLiving"
                  defaultMessage="Limitations in Occupation and Activities of Daily Living"
                />
              </FormLabel>
              <RadioGroup row value={hasLimitations||formData?.doctorsEntry?.hasLimitations} onChange={handleLimitationsChange}>
                <FormControlLabel value="yes" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.permission.yes" />} />
                <FormControlLabel value="no" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.permission.no" />} />
              </RadioGroup>
            </FormControl>
          </Grid>
          {/* <Grid item xs={6} className={classes.item}>
            <TextInput
              label="workforce.disability.lossOfEarningPercent"
              value={formData?.employeeAccidentInfo?.lossOfEarningPercent || ""}
              onChange={(v) => handleChange("lossOfEarningPercent", v)}
              type="number"
              required
            />
          </Grid> */}
          <Grid item xs={6} className={classes.item}>
            <TextInput
              label={"workforce.employee.accident.info.disabilityPerSchedule"}
              value={formData?.employeeAccidentInfo?.disabilityPerSchedule||formData?.doctorsEntry?.disabilityPerSchedule || ""}
              onChange={(v) => handleChange("disabilityPerSchedule", v)}
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <TextInput
              label={"workforce.employee.accident.info.presentInjuryBLASchedule1"}
              value={formData?.employeeAccidentInfo?.presentInjuryBLASchedule1||formData?.doctorsEntry?.presentInjuryBLASchedule1 || ""}
              onChange={(v) => handleChange("presentInjuryBLASchedule1", v)}
              readOnly={user_type ===WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
        </Grid>
      </Paper>
      {/* <EmployeeDetailsForm2
        handleChange={handleChange}
        formData={formData}
        selectedApplicationType={formData.applicationType}
        formStepNo={"employeeAccidentInfo"}
      /> */}
    </Box>
  );
};

export default EisDoctorEntries;
