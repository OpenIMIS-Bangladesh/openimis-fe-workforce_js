import React, { useState, useEffect, useMemo } from "react";
import { Grid, Box, Paper, Divider, Checkbox, FormControlLabel, FormHelperText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import CustomDetailedLocation from "../../components/application-forms/CustomDetailedLocation";
import { useSelector, useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
}));

const EmployeeLocationForm = ({ handleChange, formData, errors, applicationId }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const locale = useSelector((state)=>state.core?.user?.i_user?.language)

  const [sameAsPresent, setSameAsPresent] = useState(false);

  // ================= VISIBILITY LOGIC =================
  const showPresentAddress = useMemo(() => {
    const appType = formData?.applicationType;
    const orgType = formData?.organizationType;

    // 1. Identify Restricted Scenarios
    // Condition: Application is (financialAssistance OR deadlyGrant) AND Organization is (cf OR blwf)
    // Note: Checking both 'deadlyGrant' and 'DeadlyGrant' to be safe with casing
    const isRestrictedApp = ["financialAssistance", "deadlyGrant", "DeadlyGrant"].includes(appType);
    const isRestrictedOrg = ["cf", "blwf"].includes(orgType);

    if (isRestrictedApp && isRestrictedOrg) {
      return false; // HIDE Present Address
    }

    // 2. Default: SHOW Present Address (includes 'eis' and all other application types)
    return true;
  }, [formData?.applicationType, formData?.organizationType]);

  // Permanent address should be shown for everyone as per "rest of the applications... will be shown"
  const showPermanentAddress = true; 
  // ====================================================

  useMemo(() => {
    if (sameAsPresent && showPresentAddress) {
      const presentLocation = formData?.workforceEmployee?.presentLocation || null;
      const presentAddress = formData?.workforceEmployee?.presentAddress || "";
      
      handleChange("permanentLocation", presentLocation);
      
      try {
        const parsedAddress = JSON.parse(presentAddress);
        handleChange("permanentAddress", JSON.stringify(parsedAddress));
      } catch (err) {
        handleChange("permanentAddress", presentAddress);
      }
    }
  }, [sameAsPresent, showPresentAddress, formData?.workforceEmployee?.presentLocation, formData?.workforceEmployee?.presentAddress]);

  const isCityLocation = (locationObj) => {
    let current = locationObj;
    while (current) {
      if (current.name && current.name.includes("সিটি কর্পোরেশন")) {
        return true;
      } else if (current.name?.includes("পৌরসভা")) {
        return true;
      }
      current = current.parent;
    }
    return false;
  };

  const getDeathLabel = (labelKey) => {
    return formData.applicationType === "financialAssistance"
      ? `${formatMessage("workforce.dead")} ${formatMessage("workforce.worker.label")}  ${formatMessage(labelKey)}`
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
              {/* ================= PRESENT LOCATION SECTION ================= */}
              {showPresentAddress && (
                <>
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
                    {errors?.detailedLocation && <FormHelperText error>{errors?.detailedLocation}</FormHelperText>}
                  </Grid>

                  {formData?.workforceEmployee?.presentLocation && (
                    <Grid item xs={12}>
                      <CustomDetailedLocation
                        id="presentLocationCustomDetailedLocation"
                        locationType={isCityLocation(formData?.workforceEmployee?.presentLocation) ? "city" : "rural"}
                        onChange={handleChange}
                        addressKey="presentAddress"
                        data={formData?.workforceEmployee?.presentAddress}
                        readOnly={false}
                        locationData={formData?.workforceEmployee?.presentLocation}
                        errors={errors}
                      />
                    </Grid>
                  )}
                </>
              )}

              {/* ================= PERMANENT LOCATION SECTION ================= */}
              {showPermanentAddress && (
                <>
                  <Grid item xs={12}>
                    <Divider style={{ margin: "25px 0px" }} />
                  </Grid>

                  <Grid item xs={12}>
                    <b>{getDeathLabel("workforce.employee.permanent_location")}</b>
                    
                    {/* "Same as Present" Checkbox - Only show if Present Address is actually visible */}
                    {showPresentAddress && (
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              color="primary" 
                              checked={sameAsPresent} 
                              onChange={(e) => setSameAsPresent(e.target.checked)} 
                            />
                          }
                          label={<FormattedMessage id="workforce.employee.sameAsPresent" defaultMessage="Same as present location" />}
                        />
                      </Grid>
                    )}

                    <PublishedComponent
                      pubRef="location.DetailedLocation"
                      withNull={true}
                      value={formData?.workforceEmployee?.permanentLocation || null}
                      onChange={(permanentLocation) => handleChange("permanentLocation", permanentLocation)}
                      readOnly={sameAsPresent}
                      required
                      split={true}
                    />
                    {errors?.detailedLocation && <FormHelperText error>{errors?.detailedLocation}</FormHelperText>}
                  </Grid>

                  {formData?.workforceEmployee?.permanentLocation && (
                    <Grid item xs={12}>
                      <CustomDetailedLocation
                        id="permanentLocationCustomDetailedLocation"
                        locationType={isCityLocation(formData?.workforceEmployee?.permanentLocation) ? "city" : "rural"}
                        onChange={handleChange}
                        addressKey="permanentAddress"
                        data={formData?.workforceEmployee?.permanentAddress}
                        readOnly={sameAsPresent}
                        locationData={formData?.workforceEmployee?.permanentLocation}
                      />
                    </Grid>
                  )}
                </>
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