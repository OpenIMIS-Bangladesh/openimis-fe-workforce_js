import React, { useState } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    useTranslations,
    FormattedMessage,
    useModulesManager
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

const MedicalDonationCheckbox = ({ handleChange,formData,errors }) => {
  const modulesManager = useModulesManager()
  const [selectedDonationOption, setselectedDonationOption] = useState("");
  const [donationReason, setDonationReason] = useState("");
  const { formatMessage } = useTranslations(
      "core.RegistrationPage",
      modulesManager,
    );

  const classes = useStyles();

  const handleDonationReason = (event) => {
    const value = event.target.value;
    setDonationReason(value);
    handleChange("donationReason",value)
  };

  return (
    <>
      <Typography mb={4} style={{textAlign:"center",fontWeight:"bold",fontSize:"small",margin:"15px"}}>
            <FormattedMessage id="workforce.application.steps.select" module="workforce" />
      </Typography>
      <FormControl component="fieldset">
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          <FormattedMessage module="workforce" id="workforce.application.steps.reasonsforSeekingFinancialAssistance" />
        </Typography>
        <RadioGroup value={donationReason|| formData?.metadata?.donationReason} onChange={handleDonationReason}>
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
          {/* <FormControlLabel
            value="accidentalDeath"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                module="workforce"
                id="workforce.application.reasons.accidentalDeath"
              />
            }
          /> */}
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
          {/* <FormControlLabel
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
          /> */}
        </RadioGroup>
      </FormControl>
    </>
  );
};

export default MedicalDonationCheckbox;
