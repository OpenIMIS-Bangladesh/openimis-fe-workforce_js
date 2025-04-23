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

const ScholarshipApplicationCheckbox = ({ modulesManager,onSelect,selectedScholarshipOption, setSelectedScholarshipOption }) => {
  const { formatMessage } = useTranslations(
      "core.RegistrationPage",
      modulesManager,
    );

  const classes = useStyles();

  const handleselectedScholarshipOptionChange = (event) => {
    const value = event.target.value;
    setSelectedScholarshipOption(value);
    // onSelect(selectedApplicationType, value); // Pass both selections
  };

  return (

      <FormControl component="fieldset" className={classes.formSection}>
        {/* New Export-Oriented Company Question */}
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          {<FormattedMessage id="workforce.application.steps.select" module="workforce"/>}
        </Typography>
        <RadioGroup value={selectedScholarshipOption} onChange={handleselectedScholarshipOptionChange}>
          <FormControlLabel value="ssc" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.steps.ssc" module="workforce"/>} />
          <FormControlLabel value="hsc" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.steps.hsc" module="workforce"/>} />
        </RadioGroup>

        
      </FormControl>
  );
};

export default ScholarshipApplicationCheckbox;


