import React from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  FormattedMessage,
  TextInput,
  PublishedComponent,
} from "@openimis/fe-core";
import EmployeeAccidentTypePicker from "../../../../pickers/EmployeeAccidentTypePicker";
import DeathReasonPicker from "../../../../pickers/DeathReasonPicker";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
}));

const ApplicationReason = ({ handleChange, formData }) => {
  const classes = useStyles();
  const { formatMessage } = useTranslations("core.RegistrationPage");

  const deathType = formData?.metadata?.deathType || "";

  const handleApplicationReason = (event) => {
    const value = event.target.value;
    handleChange("deathType", value, "metadata");

    // Reset conditionally visible fields
    if (value === "normalDeath") {
      handleChange("injuryType", "", "metadata");
      handleChange("deathReason", "", "metadata");
    } else if (value === "accidentalDeath") {
      handleChange("deathCause", "", "metadata");
      handleChange("deathReason", "", "metadata");
    } else {
      handleChange("injuryType", "", "metadata");
      handleChange("deathCause", "", "metadata");
    }
  };

  return (
    <Box mt={1}>
      <Paper className={classes.paper} elevation={0}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <Typography
                variant="subtitle1"
                style={{ fontWeight: "bold", textAlign: "center" }}
              >
                <FormattedMessage id="workforce.application.reason.type" module="workforce" />
              </Typography>
              <RadioGroup row value={deathType} onChange={handleApplicationReason}>
                <FormControlLabel
                  value="normalDeath"
                  control={<Radio color="primary" />}
                  label={
                    <FormattedMessage
                      id="workforce.financial.assistance.normalDeath"
                      module="workforce"
                    />
                  }
                />
                <FormControlLabel
                  value="accidentalDeath"
                  control={<Radio color="primary" />}
                  label={
                    <FormattedMessage
                      id="workforce.financial.assistance.accidentalDeath"
                      module="workforce"
                    />
                  }
                />
                
              </RadioGroup>
            </FormControl>
          </Grid>
          {/* normalDeath: Show reason dropdown */}
          {deathType === "normalDeath" && (
            <Grid item xs={6}>
              <DeathReasonPicker
                selectedReason={formData?.metadata?.deathReason || ""}
                handleChange={(key, value) => handleChange(key, value, "metadata")}
                onOtherDiseaseChange={(value) => handleChange("otherReason", value, "metadata")}
                otherDiseaseValue={formData?.metadata?.otherReason || ""}
              />
            </Grid>
          )}
          {/* accidentalDeath: injury type */}
          {deathType === "accidentalDeath" && (
            <Grid item xs={6}>
              <EmployeeAccidentTypePicker
                value={formData?.employeeAccidentInfo?.accidentType || ""}
                label={
                  <FormattedMessage
                    id="workforce.employee.accident.info.typeOfAccident"
                    module="workforce"
                  />
                }
                required
                onChange={(v) => handleChange("accidentReason", v, "metadata")}
                readOnly={false}
              />
            </Grid>
          )}


          {/* Death Date (shared for normal/accidental) */}
          {(deathType === "normalDeath" || deathType === "accidentalDeath") && (
            <Grid item xs={6}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label={"workforce.employee.date"}
                value={formData?.metadata?.deathDate || ""}
                onChange={(v) => handleChange("deathDate", v, "metadata")}
                readOnly={false}
                required
              />
            </Grid>
          )}

          

          
          {/* other: manual input */}
          {deathType === "other" && (
            <Grid item xs={6}>
              <TextInput
                label="workforce.financial.assistance.deathReason"
                value={formData?.metadata?.deathReason || ""}
                onChange={(v) => handleChange("deathReason", v, "metadata")}
                required
              />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ApplicationReason;
