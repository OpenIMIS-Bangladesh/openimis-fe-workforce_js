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

const WorkerExtraInfo = ({ handleChange, formData }) => {
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
      <FormControl component="fieldset" readOnly={false}>
        {/* প্রাতিষ্ঠানিক / অপ্রাতিষ্ঠানিক নির্বাচন */}
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          {formatMessage("workforce.applicant.workInfo.title")}
        </Typography>
        <RadioGroup value={workerType} onChange={handleWorkerTypeChange}>
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
        {workerType === "formal" && (
          <Grid container spacing={2} className={classes.section}>
            <Grid item xs={6}>
              <TextInput
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.formal.institution_name")}
                value={formData.instituteName || ""}
                onChange={(e) => handleChange("instituteName", e)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextInput
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.formal.institution_address")}
                value={formData.instituteAddress || ""}
                onChange={(e) => handleChange("instituteAddress", e)}
              />
            </Grid>
          </Grid>
        )}

        {/* অপ্রাতিষ্ঠানিক ফিল্ড */}
        {workerType === "informal" && (
          <Grid container spacing={2} className={classes.section}>
            <Grid item xs={6}>
              <TextInput
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.informal.current_occupation")}
                value={formData.aboutWork || ""}
                onChange={(e) => handleChange("aboutWork", e)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextInput
                readOnly={false}
                label={formatMessage("workforce.applicant.workInfo.informal.workplace")}
                value={formData.workingPlace || ""}
                onChange={(e) => handleChange("workingPlace", e)}
              />
            </Grid>
          </Grid>
        )}
      </FormControl>
  );
};

export default WorkerExtraInfo;
