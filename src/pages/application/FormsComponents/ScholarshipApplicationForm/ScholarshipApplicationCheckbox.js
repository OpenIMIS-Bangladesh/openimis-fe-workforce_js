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

const ScholarshipApplicationCheckbox = ({ modulesManager,onSelect }) => {
  const [selectedScholarshipOption, setselectedScholarshipOption] = useState("");
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
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          {<FormattedMessage id="নির্বাচন করুন"/>}
        </Typography>
        <RadioGroup value={isExportOriented} onChange={handleExportOrientedChange}>
          <FormControlLabel value="sscEquvalent" control={<Radio color="primary" />} label="এস.এস.সি. বা সমমান" />
          <FormControlLabel value="hscEquvalent" control={<Radio color="primary" />} label="এইচ.এস.সি. বা সমমান" />
        </RadioGroup> 
      </FormControl>
    </Paper>
  );
};

export default ScholarshipApplicationCheckbox;
