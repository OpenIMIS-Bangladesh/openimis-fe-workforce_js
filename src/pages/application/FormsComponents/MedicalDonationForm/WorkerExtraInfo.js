import React, { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
  Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  FormattedMessage,
  useModulesManager,
  TextInput
} from "@openimis/fe-core";
import EmployeeDetailsForm2 from "../../EmployeeDetailsForm2";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: "bold",
  },
  paper: {
    padding: theme.spacing(2),
    width: "100%",
    maxWidth: 650,
    margin: "auto",
  },
  section: {
    marginTop: theme.spacing(3),
  },
}));

const WorkerExtraInfo = ({ handleChange, formData,errors }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const classes = useStyles();
  const [workerType, setWorkerType] = useState("");

  const handleWorkerTypeChange = (event) => {
    const value = event.target.value;
    setWorkerType(value);
    handleChange("workerType", value);
  };

  return (
    <>
    <Typography mb={4} style={{textAlign:"center",fontWeight:"bold",fontSize:"small",margin:"15px"}}>
                          <FormattedMessage id="workforce.application.steps.worker.extraInfo" module="workforce" />
      </Typography>
      <FormControl component="fieldset" readOnly={false}>
        {/* প্রাতিষ্ঠানিক / অপ্রাতিষ্ঠানিক নির্বাচন */}
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          {formatMessage("workforce.applicant.workInfo.title")}
        </Typography>
        <RadioGroup value={formData?.institutionInfo?.workerType} onChange={handleWorkerTypeChange}>
          <FormControlLabel
            value="formal"
            control={<Radio color="primary" />}
            label={formatMessage("workforce.applicant.workInfo.formal")}
          />
          <FormControlLabel
            value="informal"
            control={<Radio color="primary" />}
            label={formatMessage("workforce.applicant.workInfo.informal")}
          />
        </RadioGroup>

        {/* প্রাতিষ্ঠানিক ফিল্ড */}
        {formData?.institutionInfo?.workerType === "formal" && (
          <Grid container spacing={2} className={classes.section}>
            <Grid item xs={6}>
              <TextInput
                id="instituteName"
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.formal.institution_name")}
                value={formData.instituteName || ""}
                required
                onChange={(e) => handleChange("instituteName", e)}
                error={!!errors.instituteName}
                helperText={errors.instituteName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextInput
              id="instituteAddress"
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.formal.institution_address")}
                value={formData.instituteAddress || ""}
                required
                onChange={(e) => handleChange("instituteAddress", e)}
                error={!!errors.instituteAddress}
            helperText={errors.instituteAddress}
              />
            </Grid>
          </Grid>
        )}

        {/* অপ্রাতিষ্ঠানিক ফিল্ড */}
        {formData?.institutionInfo?.workerType === "informal" && (
          <Grid container spacing={2} className={classes.section}>
            <Grid item xs={6}>
              <TextInput
                id="aboutWork"
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.informal.current_occupation")}
                value={formData.aboutWork || ""}
                required
                onChange={(e) => handleChange("aboutWork", e)}
                error={!!errors.aboutWork}
                helperText={errors.aboutWork}
              />
            </Grid>
            <Grid item xs={6}>
              <TextInput
              id="workingPlace"
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.informal.workplace")}
                value={formData.workingPlace || ""}
                required
                onChange={(e) => handleChange("workingPlace", e)}
                error={!!errors.workingPlace}
            helperText={errors.workingPlace}
              />
            </Grid>
          </Grid>
        )}
        <EmployeeDetailsForm2 handleChange={()=>{}} formData={formData} selectedApplicationType={formData?.applicationType}  formStepNo={"institutionInfo"} />
      </FormControl>
    </>
  );
};

export default WorkerExtraInfo;
