import React, { useState, useEffect } from "react";
import { Grid, Box, Paper, Divider, Checkbox, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import CustomDetailedLocation from "../../components/application-forms/CustomDetailedLocation";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
}));

const EmployeeLocationForm = ({ handleChange, formData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const [sameAsPresent, setSameAsPresent] = useState(false);

  useEffect(() => {
    if (sameAsPresent) {
      const presentLocation = formData?.workforceEmployee?.presentLocation || null;
      const presentAddress = formData?.workforceEmployee?.presentAddress || "";

      handleChange("permanentLocation", presentLocation);
      handleChange("permanentAddress", presentAddress);
    }
  }, [sameAsPresent, formData?.workforceEmployee?.presentLocation, formData?.workforceEmployee?.presentAddress]);

  const isCityLocation = (locationObj) => {
    let current = locationObj;

    while (current) {
      if (current.name && current.name.includes("সিটি কর্পোরেশন")) {
        return true; // it's a city
      }
      current = current.parent;
    }

    return false; // not a city
  };

  const getDeathLabel = ( labelKey) => {
    return formData.applicationType === "financialAssistance" 
      ? `${formatMessage("workforce.dead")} শ্রমিকের  ${formatMessage(labelKey)}`
      : formatMessage(labelKey);
  };

  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            <Box mb={4} textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.location" module="workforce" />
            </Box>

            <Grid container spacing={2}>
              {/* Present Location */}
              <Grid item xs={12}>
                <b>{getDeathLabel("workforce.employee.present_location")}</b>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={formData?.workforceEmployee?.presentLocation || null}
                  onChange={(presentLocation) => handleChange("presentLocation", presentLocation)}
                  readOnly={false}
                  required
                  split={true}
                />
              </Grid>

              {/* <Grid item xs={12}>
                <TextInput
                  label="workforce.employee.present_address"
                  value={formData?.workforceEmployee?.presentAddress || ""}
                  onChange={(v) => handleChange("presentAddress", v)}
                  readOnly={false}
                />
              </Grid> */}
              {formData?.workforceEmployee?.presentLocation && (
              <Grid item xs={12}>
                <CustomDetailedLocation
                  locationType={isCityLocation(formData?.workforceEmployee?.presentLocation) ? "city" : "rural"}
                  onChange={handleChange}
                  addressKey="presentAddress"
                  data={formData}
                  readOnly={false}
                />
              </Grid>
              )}

              

              {/* Permanent Location */}
              <Grid item xs={12}>
                <b>{getDeathLabel("workforce.employee.permanent_location")}</b>
                {/* Checkbox */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox color="primary" checked={sameAsPresent} onChange={(e) => setSameAsPresent(e.target.checked)} />}
                  label={<FormattedMessage id="workforce.employee.sameAsPresent" defaultMessage="Same as present location" />}
                />
              </Grid>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={formData?.workforceEmployee?.permanentLocation || null}
                  onChange={(permanentLocation) => handleChange("permanentLocation", permanentLocation)}
                  readOnly={sameAsPresent}
                  required
                  split={true}
                />
              </Grid>

              {/* <Grid item xs={12}>
                <TextInput
                  label="workforce.employee.permanent_address"
                  value={formData?.workforceEmployee?.permanentAddress || ""}
                  onChange={(v) => handleChange("permanentAddress", v)}
                  readOnly={sameAsPresent}
                />
              </Grid> */}
              {formData?.workforceEmployee?.permanentLocation &&(
              <Grid item xs={12}>
                <CustomDetailedLocation
                  locationType={isCityLocation(formData?.workforceEmployee?.presentLocation) ? "city" : "rural"}
                  onChange={handleChange}
                  addressKey="permanentAddress"
                  data={formData}
                  readOnly={sameAsPresent}
                />
              </Grid>
              )}

              
            </Grid>

            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeLocationForm;
