import React, { useEffect, useState } from "react";
import { Grid, Box, Paper, Typography, Divider, IconButton,FormControlLabel,Checkbox  } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import CustomDetailedLocation from "../../components/application-forms/CustomDetailedLocation";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
  item: theme.paper.item,
  overrideReadOnly: {
    "& .MuiInputBase-root.Mui-disabled": {
      color: "#808080 !important",
    },
    "& .MuiFormLabel-root.Mui-disabled": {
      color: `${theme.palette.text.primary} !important`,
    },
  },
}));

const ApplicantDetailsForm = ({ handleChange, formData, setFormData, nidOrBcn, setNidOrBcn }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
    const [sameAsPresent, setSameAsPresent] = useState(false);
  

  const applicantData = useSelector((state) => state.workforce[`workforceApplicant`] ?? []);
  const isCityLocation = (locationObj) => {
    let current = locationObj;

    while (current) {
      if (current.name && current.name.includes("সিটি কর্পোরেশন")) {
        return true; 
      }else if (current.name?.includes("পৌরসভা")) {
        return true
      }
      current = current.parent;
    }

    return false; // not a city
  };

  useEffect(() => {
      if (sameAsPresent) {
        const presentLocation = formData?.workforceApplicant?.presentLocation || null;
        const presentAddress = formData?.workforceApplicant?.presentAddress || "";
  
        handleChange("permanentLocation", presentLocation);
        handleChange("permanentAddress", presentAddress);
      }
    }, [sameAsPresent, formData?.workforceApplicant?.presentLocation, formData?.workforceApplicant?.presentAddress]);

  console.log("hello bangladesh", formData);
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            {/* <Box textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.labour" module="workforce" />
            </Box> */}
            <Box mb={4} color="red">
              <FormattedMessage id="workforce.application.header.labour.note" module="workforce" />
            </Box>

            {/* <p><b>Personal Info </b></p> */}
            <Typography>
              <b>
                <FormattedMessage id="workforce.applicant.labourHeadingOne" module="workforce" />
              </b>
            </Typography>
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.name.bn"
                  value={formData?.workforceApplicant?.nameBn || ""}
                  onChange={(v) => handleChange("nameBn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.name.en"
                  value={formData?.workforceApplicant?.nameEn || ""}
                  onChange={(v) => handleChange("nameEn", v)}
                  required
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeGenderPicker
                  value={formData?.workforceApplicant?.gender}
                  label={<FormattedMessage id="workforce.employee.gender" module="workforce" />}
                  onChange={(v) => handleChange("gender", v)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.phone"
                  value={formData?.workforceApplicant?.phoneNumber || ""}
                  onChange={(v) => handleChange("phoneNumber", v)}
                  type={"number"}
                  readOnly={false}
                  required
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.citizenship"
                  value={formData?.workforceApplicant?.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.nid_or_birth_certificate"
                  value={formData?.workforceApplicant?.nid || formData?.workforceApplicant?.birthCertificateNo || nidOrBcn?.nid || ""}
                  formatInput={(val) => (val || "").toString().replace(/\D/g, "").slice(0, 17)}
                  inputProps={{ maxLength: 17 }}
                  onChange={(v) => {
                    const numericValue = (v || "").replace(/\D/g, "").slice(0, 17);
                    setNidOrBcn({ ...nidOrBcn, nid: numericValue });
                  }}
                  type="number"
                  required
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.relationWithApplicant"
                  value={formData?.workforceApplicant?.relationWithApplicant || ""}
                  onChange={(v) => handleChange("relationWithApplicant", v)}
                  readOnly={false}
                  required
                />
              </Grid>
            </Grid>
            {/* <p><b>Family Info</b></p> */}
            <Typography>
              <b>
                <FormattedMessage id="workforce.applicant.labourHeadingTwo" module="workforce" />
              </b>
            </Typography>
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.fathers_name.en"
                  value={formData?.workforceApplicant?.fatherNameEn || ""}
                  onChange={(v) => handleChange("fatherNameEn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.fathers_name.bn"
                  value={formData?.workforceApplicant?.fatherNameBn || ""}
                  onChange={(v) => handleChange("fatherNameBn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.mothers_name.en"
                  value={formData?.workforceApplicant?.motherNameEn || ""}
                  onChange={(v) => handleChange("motherNameEn", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.mothers_name.bn"
                  value={formData?.workforceApplicant?.motherNameBn || ""}
                  onChange={(v) => handleChange("motherNameBn", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name.en"
                  value={formData?.workforceApplicant?.spouseNameEn || ""}
                  onChange={(v) => handleChange("spouseNameEn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name.bn"
                  value={formData?.workforceApplicant?.spouseNameBn || ""}
                  onChange={(v) => handleChange("spouseNameBn", v)}
                  readOnly={false}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {/* Present Location */}
              <Grid item xs={12}>
                <b>{formatMessage("workforce.employee.present_location")}</b>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={formData?.workforceApplicant?.presentLocation || null}
                  onChange={(presentLocation) => handleChange("presentLocation", presentLocation)}
                  readOnly={false}
                  required
                  split={true}
                />
              </Grid>

              
              {formData?.workforceApplicant?.presentLocation && (
                <Grid item xs={12}>
                  <CustomDetailedLocation
                    locationType={isCityLocation(formData?.workforceApplicant?.presentLocation) ? "city" : "rural"}
                    onChange={handleChange}
                    addressKey="presentAddress"
                    data={formData?.workforceApplicant?.presentAddress}
                    readOnly={false}
                  />
                </Grid>
              )}

              {/* Permanent Location */}
              <Grid item xs={12}>
                <b>{formatMessage("workforce.employee.permanent_location")}</b>
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
                  value={formData?.workforceApplicant?.permanentLocation || null}
                  onChange={(permanentLocation) => handleChange("permanentLocation", permanentLocation)}
                  readOnly={sameAsPresent}
                  required
                  split={true}
                />
              </Grid>

              {formData?.workforceApplicant?.permanentLocation && (
                <Grid item xs={12}>
                  <CustomDetailedLocation
                    locationType={isCityLocation(formData?.workforceApplicant?.presentLocation) ? "city" : "rural"}
                    onChange={handleChange}
                    addressKey="permanentAddress"
                    data={formData?.workforceApplicant?.permanentAddress}
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

export default ApplicantDetailsForm;
