import React, { useEffect, useState } from "react";
import { Grid, Box, Paper, Typography, Divider, IconButton, FormControlLabel, Checkbox, FormHelperText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import CustomDetailedLocation from "../../components/application-forms/CustomDetailedLocation";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";
import RelationWithWorkerPicker from "../../pickers/RelationWithWorkerPicker";
import CountryPicker from "../../pickers/CountryPicker";

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

const ApplicantDetailsForm = ({ handleChange, formData, setFormData, nidOrBcn, setNidOrBcn, errors }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const [sameAsPresent, setSameAsPresent] = useState(false);

  const applicantData = useSelector((state) => state.workforce[`workforceApplicant`] ?? []);
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language
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
                  id="nameBn"
                  label="workforce.employee.name.bn"
                  value={formData?.workforceApplicant?.nameBn || ""}
                  onChange={(v) => handleChange("nameBn", v)}
                  required
                  readOnly={false}
                  error={!!errors.nameBn}
                  helperText={errors.nameBn}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="nameEn"
                  label="workforce.employee.name.en"
                  value={formData?.workforceApplicant?.nameEn || ""}
                  onChange={(v) => handleChange("nameEn", v)}
                  required
                  readOnly={false}
                  error={!!errors.nameEn}
                  helperText={errors.nameEn}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeGenderPicker
                  value={
                    typeof formData?.workforceApplicant?.gender === "object" ? formData?.workforceApplicant?.gender?.name : formData?.workforceApplicant?.gender
                  }
                  label={<FormattedMessage id="workforce.employee.gender" module="workforce" />}
                  onChange={(v) => handleChange("gender", v)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="phoneNumber"
                  label="workforce.employee.phone"
                  value={formData?.workforceApplicant?.phoneNumber || ""}
                  onChange={(v) => handleChange("phoneNumber", v)}
                  type={"text"}
                  required
                  readOnly={false}
                  inputProps={{ inputMode: "numeric", pattern: "[0-9০-৯]*" }}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                />
                {errors.phoneNumber && <FormHelperText error><FormattedMessage id={errors.phoneNumber} /></FormHelperText>}
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                {/* <TextInput
                  label="workforce.employee.citizenship"
                  value={formData?.workforceApplicant?.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={false}
                /> */}
                <CountryPicker
                  id="citizenship"
                  label={formatMessage("workforce.employee.citizenship")}
                  value={formData?.workforceApplicant?.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={false}
                  // required
                  language={locale === "fr" ? "bn" : "en"}
                />
                {errors.citizenship && <FormHelperText error>{errors.citizenship}</FormHelperText>}
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label={"workforce.employee.birthdate"}
                  value={formData?.workforceApplicant?.birthDate || ""}
                  onChange={(v) => handleChange("birthDate", v)}
                  readOnly={false}
                  required
                />
                {errors.rdmp && <FormHelperText error><FormattedMessage id={errors.rdmp} /></FormHelperText>}
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  id="nid"
                  label="workforce.employee.nid_or_birth_certificate"
                  value={formData?.workforceApplicant?.nid || formData?.workforceApplicant?.birthCertificateNo  || ""}
                  formatInput={(val) => (val || "").toString().replace(/\D/g, "").slice(0, 17)}
                  inputProps={{ maxLength: 17 }}
                  onChange={(v) => {
                    const numericValue = (v || "").replace(/\D/g, "").slice(0, 17);
                    setNidOrBcn({ ...nidOrBcn, nid: numericValue });
                    handleChange("nid", v)
                  }}
                  type="number"
                  required
                  readOnly={false}
                  error={!!errors.nid}
                  helperText={errors.nid}
                />
                {errors.nid && <FormHelperText error><FormattedMessage id={errors.nid} /></FormHelperText>}
              </Grid>

              <Grid item xs={6} className={classes.item}>
                {/* <TextInput
                id="relationWithApplicant"
                  label="workforce.employee.relationWithApplicant"
                  value={formData?.workforceApplicant?.relationWithApplicant || ""}
                  onChange={(v) => handleChange("relationWithApplicant", v)}
                  readOnly={false}
                  required
                  error={!!errors.relationWithApplicant}
            helperText={errors.relationWithApplicant}
                /> */}
                <RelationWithWorkerPicker
                  id="relationWithApplicant"
                  applicantInfo="factory_admin"
                  value={formData?.workforceApplicant?.relationWithApplicant || ""}
                  label={formatMessage("workforce.employee.relationWithApplicant")}
                  required
                  onChange={(v) => handleChange("relationWithApplicant", v)}
                  readOnly={false}
                />
                {errors.relationWithApplicant && <FormHelperText error>{errors.relationWithApplicant}</FormHelperText>}
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
                  id="fatherNameEn"
                  label="workforce.employee.fathers_name.en"
                  value={formData?.workforceApplicant?.fatherNameEn || ""}
                  onChange={(v) => handleChange("fatherNameEn", v)}
                  readOnly={false}
                  required
                  error={!!errors.fatherNameEn}
                  helperText={errors.fatherNameEn}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="fatherNmaeBn"
                  label="workforce.employee.fathers_name.bn"
                  value={formData?.workforceApplicant?.fatherNameBn || ""}
                  onChange={(v) => handleChange("fatherNameBn", v)}
                  readOnly={false}
                  required
                  error={!!errors.fatherNameBn}
                  helperText={errors.fatherNameBn}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="motherNameEn"
                  label="workforce.employee.mothers_name.en"
                  value={formData?.workforceApplicant?.motherNameEn || ""}
                  onChange={(v) => handleChange("motherNameEn", v)}
                  readOnly={false}
                  required
                  error={!!errors.motherNameEn}
                  helperText={errors.motherNameEn}
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
                {errors?.detailedLocation && <FormHelperText error>{errors?.detailedLocation}</FormHelperText>}
              </Grid>

              {formData?.workforceApplicant?.presentLocation && (
                <Grid item xs={12}>
                  <CustomDetailedLocation
                    locationType={isCityLocation(formData?.workforceApplicant?.presentLocation) ? "city" : "rural"}
                    onChange={handleChange}
                    addressKey="presentAddress"
                    data={formData?.workforceApplicant?.presentAddress}
                    readOnly={false}
                    locationData={formData?.workforceApplicant?.presentLocation}
                    errors={errors}
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
                {errors?.detailedLocation && <FormHelperText error>{errors?.detailedLocation}</FormHelperText>}
              </Grid>

              {formData?.workforceApplicant?.permanentLocation && (
                <Grid item xs={12}>
                  <CustomDetailedLocation
                    locationType={isCityLocation(formData?.workforceApplicant?.permanentLocation) ? "city" : "rural"}
                    onChange={handleChange}
                    addressKey="permanentAddress"
                    data={formData?.workforceApplicant?.permanentAddress}
                    readOnly={sameAsPresent}
                    locationData={formData?.workforceApplicant?.permanentLocation}
                    errors={errors}
                  />
                </Grid>
              )}
            </Grid>
            <Divider />
          </Paper>
        </Grid>
      </Grid>
      <EmployeeDetailsForm2 errors={errors} handleChange={() => {}} formData={formData} selectedApplicationType={formData?.applicationType} formStepNo={"applicantInfo"} />
    </Box>
  );
};

export default ApplicantDetailsForm;
