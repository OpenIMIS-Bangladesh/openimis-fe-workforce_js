import React, { useState } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    useTranslations,
    FormattedMessage
  } from "@openimis/fe-core";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 'bold',
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
  formSection:{
    marginLeft:theme.spacing(2)
  }
}));

const ApplicationReasonForDisability = ({ modulesManager,handleChange,deathType, setDeathType,errors,formData }) => {
  const { formatMessage } = useTranslations(
      "core.RegistrationPage",
      modulesManager,
    );

  const classes = useStyles();

  const handleDeathTypeChange = (event) => {
    const value = event.target.value;
    setDeathType(value);
    handleChange("disabilityType",value)
    // onSelect(selectedApplicationType, value); // Pass both selections
  };

  return (

      <FormControl component="fieldset" className={classes.formSection}>
        {/* New Export-Oriented Company Question */}
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          {<FormattedMessage id="workforce.application.reason.type" module="workforce"/>}
        </Typography>
        <RadioGroup value={formData?.metadata?.disabilityType || deathType} onChange={handleDeathTypeChange}>
          <FormControlLabel value="partial" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.disability.partial" module="workforce"/>} />
          <FormControlLabel value="permanent" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.disability.permanent" module="workforce"/>} />
        </RadioGroup>

        
      </FormControl>
  );
};

export default ApplicationReasonForDisability;
