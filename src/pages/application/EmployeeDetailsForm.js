import React, { useState } from "react";
import { Grid, Box, Paper, Typography, Divider, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
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

const EmployeeDetailsForm = ({ handleChange, formData, setFormData, nidOrBcn, setNidOrBcn }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const getDeathLabel = (labelKey) => {
    return formData.applicationType === "financialAssistance" ? `${formatMessage("workforce.dead")} ${formatMessage(labelKey)}` : formatMessage(labelKey);
  };

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
              <b>{getDeathLabel("workforce.application.labourHeadingOne")}</b>
            </Typography>
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.name.bn"
                  value={formData?.workforceEmployee?.nameBn || ""}
                  onChange={(v) => handleChange("nameBn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.name.en"
                  value={formData?.workforceEmployee?.nameEn || ""}
                  onChange={(v) => handleChange("nameEn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label={"workforce.employee.birthdate"}
                  value={formData?.workforceEmployee?.birthDate || ""}
                  onChange={(v) => handleChange("birthDate", v)}
                  readOnly={false}
                />
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
                      label="workforce.employee.phone"
                      value={formData?.workforceEmployee?.phoneNumber || ""}
                      onChange={(v) => handleChange("phoneNumber", v)}
                      type={"number"}
                      readOnly={false}
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
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.citizenship"
                  value={formData?.workforceEmployee?.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeMaritalStatusPicker
                  value={formData?.workforceEmployee?.maritalStatus || ""}
                  label={<FormattedMessage id="workforce.employee.marital_status" module="workforce" />}
                  required
                  onChange={(v) => handleChange("maritalStatus", v)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
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
              {formData?.organizationType === "cf" && (
                <Grid item xs={6} className={classes.item}>
                  <FactoryPicker
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
                </Grid>
              )}
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
            {/* <p><b>Family Info</b></p> */}
            <Typography>
              <b>{getDeathLabel("workforce.application.labourHeadingTwo")}</b>
            </Typography>
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.fathers_name.en"
                  value={formData?.workforceEmployee?.fatherNameEn || ""}
                  onChange={(v) => handleChange("fatherNameEn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.fathers_name.bn"
                  value={formData?.workforceEmployee?.fatherNameBn || ""}
                  onChange={(v) => handleChange("fatherNameBn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.mothers_name.en"
                  value={formData?.workforceEmployee?.motherNameEn || ""}
                  onChange={(v) => handleChange("motherNameEn", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.mothers_name.bn"
                  value={formData?.workforceEmployee?.motherNameBn || ""}
                  onChange={(v) => handleChange("motherNameBn", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name.en"
                  value={formData?.workforceEmployee?.spouseNameEn || ""}
                  onChange={(v) => handleChange("spouseNameEn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name.bn"
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
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.child.name.en"
                      value={formData?.metadata?.spouseEn || ""}
                      onChange={(v) => setFormData("spouseEn", v, "metadata")}
                      required
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.child.name.bn"
                      value={formData?.metadata?.spouseBn || ""}
                      onChange={(v) => setFormData("spouseBn", v, "metadata")}
                      required
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.employee.fathers_name.en"
                      value={formData?.metadata?.fatherNameEn || ""}
                      onChange={(v) => setFormData("spouseFatherNameEn", v, "metadata")}
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.employee.mothers_name.en"
                      value={formData?.metadata?.motherNameEn || ""}
                      onChange={(v) => setFormData("spouseMotherNameEn", v, "metadata")}
                      readOnly={false}
                      required
                    />
                  </Grid>
                  <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                    <TextInput
                      label="workforce.application.employee.children.nidOrBirthRegistry"
                      value={formData?.metadata?.spouseNid || ""}
                      onChange={(v) => setFormData("spouseNid", v, "metadata")}
                      type={"number"}
                      readOnly={false}
                      required
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
