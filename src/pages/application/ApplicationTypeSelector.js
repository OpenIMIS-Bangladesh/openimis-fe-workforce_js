import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, FormattedMessage } from "@openimis/fe-core";

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

const ApplicationTypeSelector = ({ modulesManager, onSelect,selectedApplicationType,parsedApplicationData }) => {
  const [isExportOriented, setIsExportOriented] = useState("");
  const classes = useStyles();

  useEffect(() => {
    if (parsedApplicationData) {
      const orgType = parsedApplicationData?.organizationType;
      const appType = parsedApplicationData?.applicationType;
      const exportStatus = orgType === "cf" ? "yes" : "no";
      setIsExportOriented(exportStatus);
      // onSelect(appType, exportStatus); // preselect both in parent
    }
  }, [parsedApplicationData]);

  const handleApplicationTypeChange = (event) => {
    const value = event.target.value;
    // setSelectedApplicationType(value);
    onSelect(value, isExportOriented); 
    
  };

  const handleExportOrientedChange = (event) => {
    const value = event.target.value;
    setIsExportOriented(value);
    onSelect(selectedApplicationType, value); 
  };

  return (
    <Paper className={classes.paper} elevation={0}>

      <FormControl component="fieldset">
        {/* New Export-Oriented Company Question */}
        <Typography variant="h6" className={`${classes.title} ${classes.section}`}>
          {<FormattedMessage id="workforce.application.company.type" module="workforce"/>}
        </Typography>
        <RadioGroup value={isExportOriented} onChange={handleExportOrientedChange}>
          <FormControlLabel
            value="yes"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage id="workforce.application.permission.yes" module="workforce"/>
            }
          />
          <FormControlLabel
            value="no"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage id="workforce.application.permission.no" module="workforce"/>
            }
          />
        </RadioGroup>

        {/* Application Type Selection */}
        {isExportOriented === "yes" ? (
          <>
            <Typography variant="h6" className={classes.title}>
              {<FormattedMessage id="workforce.application.type.title" module="workforce"/>}
            </Typography>
            <RadioGroup value={selectedApplicationType} onChange={handleApplicationTypeChange}>
              <FormControlLabel
                value="medicalAssistance"
                control={<Radio color="primary" />}
                label={ <FormattedMessage id="workforce.application.type.medical.assistance" module="workforce"/>}
              />
              <FormControlLabel
                value="financialAssistance"
                control={<Radio color="primary" />}
                label={<FormattedMessage id="workforce.application.type.financial.assistance" module="workforce"/>}
              />
              <FormControlLabel
                value="disabilityAssistance"
                control={<Radio color="primary" />}
                label={<FormattedMessage id="workforce.application.type.medical.disability" module="workforce"/>}
              />
              <FormControlLabel
                value="scholarship"
                control={<Radio color="primary" />}
                label={<FormattedMessage id="workforce.application.type.scholarship" module="workforce"/>}
              />
              
            </RadioGroup>
          </>
        ) : isExportOriented === "no" ? (
          <>
            <Typography variant="h6" className={classes.title}>
              {<FormattedMessage id="workforce.application.type.title" module="workforce"/>}
            </Typography>
            <RadioGroup
              value={selectedApplicationType}
              onChange={handleApplicationTypeChange}
            >
              <FormControlLabel
                value="medicalDonation"
                control={<Radio color="primary" />}
                label={<FormattedMessage id="workforce.application.type.medical.donation" module="workforce" />}
              />
              <FormControlLabel
                value="educationGrant"
                control={<Radio color="primary" />}
                label={<FormattedMessage id="workforce.application.type.education.grant" module="workforce"/>}
              />
              <FormControlLabel
                value="deadlyGrant"
                control={<Radio color="primary" />}
                label={<FormattedMessage id="workforce.application.type.deadly.grant" module="workforce"/>}
              />
              <FormControlLabel
                value="maternalGrant"
                control={<Radio color="primary" />}
                label={<FormattedMessage id="workforce.application.type.maternal.grant" module="workforce"/>}
              />
            </RadioGroup>
          </>
        ) : null}
      </FormControl>
    </Paper>
  );
};

export default ApplicationTypeSelector;
