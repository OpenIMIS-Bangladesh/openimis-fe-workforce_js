import React, { useState } from "react";
import { Grid, Box, Paper, Typography, Divider, IconButton, FormHelperText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import CountryPicker from "../../pickers/CountryPicker";
// import CustomDateTimePicker from "../../pickers/CustomDatePicker";

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
      color: "#808080 !important", // Text value color (gray)
    },
    "& .MuiFormLabel-root.Mui-disabled": {
      color: `${theme.palette.text.primary} !important`, // Label color (black or customize as needed)
    },
  },
}));

const EmployeeDetailsForm = ({ handleChange, formData, setFormData, nidOrBcn, setNidOrBcn, errors }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const reduxState = useSelector((state) => state);
  const getDeathLabel = (labelKey) => {
    return formData.applicationType === "financialAssistance" ? `${formatMessage("workforce.dead")} ${formatMessage(labelKey)}` : formatMessage(labelKey);
  };

  const locale = reduxState?.core?.user?.i_user?.language

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            {/* <Box textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.labour" module="workforce" />
            </Box> */}
            <Typography style={{ color: "red", textAlign: "center", fontWeight: "bold", fontSize: "small", marginBottom: "20px" }}>
              <FormattedMessage id="workforce.application.header.labour.note" module="workforce" />
            </Typography>

            {/* <p><b>Personal Info </b></p> */}
            <Typography>
              <b>{getDeathLabel("workforce.application.labourHeadingOne")}</b>
            </Typography>
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="nameBn"
                  label="workforce.employee.name.bn"
                  value={formData?.workforceEmployee?.nameBn || ""}
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
                  value={formData?.workforceEmployee?.nameEn || ""}
                  onChange={(v) => handleChange("nameEn", v)}
                  required
                  readOnly={false}
                  error={!!errors.nameEn}
                  helperText={errors.nameEn}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label={"workforce.employee.birthdate"}
                  value={formData?.workforceEmployee?.birthDate || ""}
                  onChange={(v) => handleChange("birthDate", v)}
                  readOnly={false}
                  required
                />
                {errors.rdmp && <FormHelperText error>{errors.rdmp}</FormHelperText>}
              </Grid>
              

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeGenderPicker
                  value={formData?.workforceEmployee?.gender}
                  label={<FormattedMessage id="workforce.employee.gender" module="workforce" />}
                  onChange={(v) => handleChange("gender", v)}
                  readOnly={false}
                />
              </Grid>
              {formData.applicationType !== "financialAssistance" && (
                <>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      id="phoneNumber"
                      label="workforce.employee.phone"
                      value={formData?.workforceEmployee?.phoneNumber || ""}
                      onChange={(v) => handleChange("phoneNumber", v)}
                      type={"number"}
                      required
                      readOnly={false}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.employee.email"
                      value={formData?.workforceEmployee?.email || ""}
                      onChange={(v) => handleChange("email", v)}
                      type={"email"}
                      readOnly={false}
                    />
                  </Grid>
                </>
              )}
              {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.citizenship"
                  value={formData?.workforceEmployee?.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={false}
                />
              </Grid> */}
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <CountryPicker
                  id="citizenship"
                  label={formatMessage("workforce.employee.citizenship")}
                  value={formData?.workforceEmployee?.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={false}
                  required
                  language={locale === "fr" ? "bn" : "en"}
                />
                {errors.citizenship && <FormHelperText error>{errors.citizenship}</FormHelperText>}
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeMaritalStatusPicker
                  id="maritalStatus"
                  value={formData?.workforceEmployee?.maritalStatus || ""}
                  label={<FormattedMessage id="workforce.employee.marital_status" module="workforce" />}
                  required
                  onChange={(v) => handleChange("maritalStatus", v)}
                  readOnly={false}
                />
                {errors.maritalStatus && <FormHelperText error>{errors.maritalStatus}</FormHelperText>}
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  id="nid"
                  label="workforce.employee.nid_or_birth_certificate"
                  value={formData?.workforceEmployee?.nid || formData?.workforceEmployee?.birthCertificateNo || nidOrBcn?.nid || ""}
                  formatInput={(val) => (val || "").toString().replace(/\D/g, "").slice(0, 17)}
                  inputProps={{ maxLength: 17 }}
                  onChange={(v) => {
                    const numericValue = (v || "").replace(/\D/g, "").slice(0, 17);
                    setNidOrBcn({ ...nidOrBcn, nid: numericValue });
                  }}
                  type="number"
                  required
                  readOnly={false}
                  error={!!errors.nid}
                  helperText={errors.nid}
                />
              </Grid>

              {/* <Grid item xs={6} className={classes.item}>
                <CompanyPicker
                  value={formData?.workforceEmployee?.company?.id}
                  label={<FormattedMessage id="workforce.employee.workforce_employer" module="workforce" />}
                  onChange={(v) => {
                    // handleChange("company", v);
                    handleChange("company", v);
                  }}
                  readOnly={false}
                />
              </Grid> */}

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.designation"
                  value={formData?.workforceEmployee?.position || ""}
                  onChange={(v) => handleChange("position", v)}
                  readOnly={false}
                />
              </Grid>
              {/* {formData?.organizationType === "cf" && (
                <Grid item xs={6} className={classes.item}>
                  <FactoryPicker
                    id="factory"
                    required={true}
                    value={formData?.workforceEmployee?.factory?.id}
                    label={<FormattedMessage id="workforce.employee.workforce_factory" module="workforce" />}
                    companyId={formData?.workforceEmployee?.company?.id}
                    onChange={(v) => {
                      // handleChange("factory", v, "employeeDesignation");
                      handleChange("factory", v);
                    }}
                    readOnly={false}
                  />
                  {errors.factory && <FormHelperText error>{errors.factory}</FormHelperText>}
                </Grid>
              )} */}
              {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeLifeStatusPicker
                  value={formData?.workforceEmployee?.lifeStatus || ""}
                  label={
                    <FormattedMessage
                      id="workforce.employee.lifeStatus"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) => handleChange("lifeStatus", v)}
                  readOnly={true}
                />
              </Grid> */}
              {formData.applicationType === ("deadlyGrant" || "financialAssistance") ? (
                <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.employee.deathdate"}
                    value={formData?.workforceEmployee?.deathDate || ""}
                    readOnly={false}
                    onChange={(v) => handleChange("deathDate", v)}
                  // readOnly={true}
                  />
                </Grid>
              ) : null}
            </Grid>

            <Divider style={{ margin: "25px 0px" }} />
            {/* <p><b>Family Info</b></p> */}
            <Typography style={{ marginTop: 4 }}>
              <b>{getDeathLabel("workforce.application.labourHeadingTwo")}</b>
            </Typography>
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="fatherNameEn"
                  label="workforce.employee.fathers_name.en"
                  value={formData?.workforceEmployee?.fatherNameEn || ""}
                  onChange={(v) => handleChange("fatherNameEn", v)}
                  readOnly={false}
                  required
                  error={!!errors.fatherNameEn}
                  helperText={errors.fatherNameEn}
                />
              </Grid> */}
              <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="fatherNameBn"
                  label="workforce.employee.fathers_name"
                  value={formData?.workforceEmployee?.fatherNameBn || ""}
                  onChange={(v) => handleChange("fatherNameBn", v)}
                  readOnly={false}
                  required
                  error={!!errors.fatherNameBn}
                  helperText={errors.fatherNameBn}
                />
              </Grid>
              {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="motherNameEn"
                  label="workforce.employee.mothers_name.en"
                  value={formData?.workforceEmployee?.motherNameEn || ""}
                  onChange={(v) => handleChange("motherNameEn", v)}
                  readOnly={false}
                  required
                  error={!!errors.motherNameEn}
                  helperText={errors.motherNameEn}
                />
              </Grid> */}
              <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  id="motherNameBn"
                  label="workforce.employee.mothers_name"
                  value={formData?.workforceEmployee?.motherNameBn || ""}
                  onChange={(v) => handleChange("motherNameBn", v)}
                  readOnly={false}
                  required
                  error={!!errors.motherNameBn}
                  helperText={errors.motherNameBn}
                />
              </Grid>
              {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name.en"
                  value={formData?.workforceEmployee?.spouseNameEn || ""}
                  onChange={(v) => handleChange("spouseNameEn", v)}
                  readOnly={false}
                />
              </Grid> */}
              <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name"
                  value={formData?.workforceEmployee?.spouseNameBn || ""}
                  onChange={(v) => handleChange("spouseNameBn", v)}
                  readOnly={false}
                />
              </Grid>
            </Grid>

            {formData.applicationType === "maternityGrant" && formData.applicationForSelf === "no" && (
              <>
                <Typography style={{ marginTop: 16 }}>
                  <b>
                    <FormattedMessage id="workforce.application.labourDetails.spouse" module="workforce" />
                  </b>
                </Typography>
                <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
                  <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      id="spouseEn"
                      label="workforce.spouse.name"
                      value={formData?.metadata?.spouseEn || ""}
                      onChange={(v) => setFormData("spouseEn", v, "metadata")}
                      required
                      readOnly={false}
                      error={!!errors.spouseEn}
                      helperText={errors.spouseEn}
                    />
                  </Grid>
                  {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      id="spouseBn"
                      label="workforce.child.name.bn"
                      value={formData?.metadata?.spouseBn || ""}
                      onChange={(v) => setFormData("spouseBn", v, "metadata")}
                      required
                      readOnly={false}
                      error={!!errors.spouseBn}
                      helperText={errors.spouseBn}
                    />
                  </Grid> */}
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.employee.fathers_name"
                      value={formData?.metadata?.fatherNameEn || ""}
                      onChange={(v) => setFormData("spouseFatherNameEn", v, "metadata")}
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.employee.mothers_name"
                      value={formData?.metadata?.motherNameEn || ""}
                      onChange={(v) => setFormData("spouseMotherNameEn", v, "metadata")}
                      readOnly={false}
                    // required

                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      id="spouseNid"
                      label="workforce.application.employee.children.nidOrBirthRegistry"
                      value={formData?.metadata?.spouseNid || ""}
                      onChange={(v) => setFormData("spouseNid", v, "metadata")}
                      type={"number"}
                      readOnly={false}
                      required
                      error={!!errors.spouseNid}
                      helperText={errors.spouseNid}
                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <PublishedComponent
                      pubRef="workforce.DatePicker"
                      label={"workforce.employee.birthdate"}
                      value={formData?.metadata?.spouseBirthDate || ""}
                      onChange={(v) => setFormData("spouseBirthDate", v, "metadata")}
                      readOnly={false}
                      required
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetailsForm;
