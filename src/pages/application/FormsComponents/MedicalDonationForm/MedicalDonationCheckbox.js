import React, { useState } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    useTranslations,
    FormattedMessage
  } from "@openimis/fe-core";

const useStyles = makeStyles((theme) => ({     
  title: {
    fontWeight: "bold",
  },
  paper: {
    padding: theme.spacing(2),
    width: "100%", // Ensures it doesn't overflow
    maxWidth: 650, // Restrict max width
    margin: "auto", // Centers the Paper component
  },
  section: {
    marginTop: theme.spacing(3),
  },
}));

const MedicalDonationCheckbox = ({ modulesManager,onSelect }) => {
  const [selectedDonationOption, setselectedDonationOption] = useState("");
  const [isExportOriented, setIsExportOriented] = useState("");
  const { formatMessage } = useTranslations(
      "core.RegistrationPage",
      modulesManager,
    );

  const classes = useStyles();

  const handleExportOrientedChange = (event) => {
    const value = event.target.value;
    setIsExportOriented(value);
  };

  return (
      <FormControl component="fieldset">
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          <FormattedMessage module="workforce" id="workforce.application.steps.reasonsforSeekingFinancialAssistance" />
        </Typography>
        <RadioGroup value={isExportOriented} onChange={handleExportOrientedChange}>
          <FormControlLabel
            value="physicalMentalDisability"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                module="workforce"
                id="workforce.application.reasons.physicalMentalDisability"
              />
            }
          />
          <FormControlLabel
            value="accidentalDeath"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                module="workforce"
                id="workforce.application.reasons.accidentalDeath"
              />
            }
          />
          <FormControlLabel
            value="curativeTreatment"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                module="workforce"
                id="workforce.application.reasons.curativeTreatment"
              />
            }
          />
          <FormControlLabel
            value="deathbodyRefinement"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                module="workforce"
                id="workforce.application.reasons.deathbodyRefinement"
              />
            }
          />
          <FormControlLabel
            value="maternalWelfare"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                module="workforce"
                id="workforce.application.reasons.maternalWelfare"
              />
            }
          />
        </RadioGroup>
      </FormControl>
  );
};

export default MedicalDonationCheckbox;
