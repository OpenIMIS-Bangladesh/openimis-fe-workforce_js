import React, { useState } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    useTranslations,
    FormattedMessage
  } from "@openimis/fe-core";

const useStyles = makeStyles((theme) => ({     
  title: {
    fontWeight: 800,
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
    <Paper className={classes.paper} elevation={3}>
      <FormControl component="fieldset">
        <Typography variant="h6" className={`${classes.title} ${classes.section}`}>
          {<FormattedMessage id="আর্থিক সহায়তা চাওয়ার কারণ"/>}
        </Typography>
        <RadioGroup value={isExportOriented} onChange={handleExportOrientedChange}>
          <FormControlLabel value="physicalMentalDisability" control={<Radio color="primary" />} label="দুর্ঘটনাজনিত কারণে দৈহিক ও মানসিকভাবে স্থায়ী অক্ষমতা (সর্বশেষ সময়সীমা বিগত ১০৫ দিনের মধ্যে হতে হবে);" />
          <FormControlLabel value="accidentalDeath" control={<Radio color="primary" />} label="দুর্ঘটনাজনিত কারণে মৃত্যু (সর্বশেষ সময়সীমা বিগত ১০৫ দিনের মধ্যে হতে হবে);" />
          <FormControlLabel value="curativeTreatment" control={<Radio color="primary" />} label="দুরারোগ্য চিকিৎসা;" />
          <FormControlLabel value="deathbodyRefinement" control={<Radio color="primary" />} label="মৃতদেহ পরিবহন ও সৎকার;" />
          <FormControlLabel value="maternalWelfare" control={<Radio color="primary" />} label="অপ্রাতিষ্ঠানিক খাতে কর্মরত মহিলা শ্রমিকের মাতৃত্ব কল্যাণ;" />
        </RadioGroup> 
      </FormControl>
    </Paper>
  );
};

export default MedicalDonationCheckbox;
