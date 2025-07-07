import React, { useState } from "react";
import { Grid, Box, Paper, Typography, Divider, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";

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

  const employeeData = useSelector((state) => state.workforce[`workforceEmployee`] ?? []);

  console.log("hello bangladesh", formData);
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            <Box textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.labour" module="workforce" />
            </Box>
            <Box mb={4} color="red">
              <FormattedMessage id="workforce.application.header.labour.note" module="workforce" />
            </Box>
              
                {/* <p><b>Personal Info </b></p> */}
                <Typography><b> ব্যক্তিগত তথ্য</b></Typography> 
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.name.bn"
                  value={formData?.workforceEmployee.nameBn || ""}
                  onChange={(v) => handleChange("nameBn", v)}
                  required
                  readOnly={formData?.workforceEmployee.nameBn ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.name.en"
                  value={formData?.workforceEmployee.nameEn || ""}
                  onChange={(v) => handleChange("nameEn", v)}
                  required
                  readOnly={formData?.workforceEmployee.nameEn ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.birthdate"}
                  value={formData?.workforceEmployee.birthDate || ""}
                  onChange={(v) => handleChange("birthDate", v)}
                  readOnly={formData?.workforceEmployee.birthDate ? true : false}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeGenderPicker
                  value={formData?.workforceEmployee?.gender}
                  label={<FormattedMessage id="workforce.employee.gender" module="workforce" />}
                  onChange={(v) => handleChange("gender", v)}
                  readOnly={formData?.workforceEmployee?.gender ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.phone"
                  value={formData?.workforceEmployee.phoneNumber || ""}
                  onChange={(v) => handleChange("phoneNumber", v)}
                  type={"number"}
                  readOnly={formData?.workforceEmployee.phoneNumber ? true : false}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.email"
                  value={formData?.workforceEmployee.email || ""}
                  onChange={(v) => handleChange("email", v)}
                  type={"email"}
                  readOnly={formData?.workforceEmployee.email ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.citizenship"
                  value={formData?.workforceEmployee.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={formData?.workforceEmployee.citizenship ? true : false}
                />
              </Grid>

              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeMaritalStatusPicker
                  value={formData?.workforceEmployee.maritalStatus || ""}
                  label={<FormattedMessage id="workforce.employee.marital_status" module="workforce" />}
                  required
                  onChange={(v) => handleChange("maritalStatus", v)}
                  readOnly={formData?.workforceEmployee.maritalStatus ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.position"
                  value={formData?.workforceEmployee.position || ""}
                  onChange={(v) => handleChange("position", v)}
                  readOnly={formData?.workforceEmployee.position ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.nid_or_birth_certificate"
                  value={formData?.workforceEmployee?.nid || formData?.workforceEmployee?.birthCertificateNo || nidOrBcn.nid}
                  formatInput={(val) => (val || "").toString().replace(/\D/g, "").slice(0, 17)}
                  inputProps={{ maxLength: 17 }}
                  onChange={(v) => {
                    const numericValue = (v || "").replace(/\D/g, "").slice(0, 17);
                    setNidOrBcn({ ...nidOrBcn, nid: numericValue });
                  }}
                  type="number"
                  required
                  readOnly={formData?.workforceEmployee?.nid || formData?.workforceEmployee?.birthCertificateNo || nidOrBcn.nid ? true : false}
                />
              </Grid>
              {/* <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <EmployeeLifeStatusPicker
                  value={formData?.workforceEmployee.lifeStatus || ""}
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
                    pubRef="core.DatePicker"
                    label={"workforce.employee.deathdate"}
                    value={formData?.workforceEmployee.deathDate || ""}
                    readOnly={formData?.workforceEmployee.lifeStatus === "Deceased" ? false : true}
                    onChange={(v) => handleChange("deathDate", v)}
                    // readOnly={true}
                  />
                </Grid>
              ) : null}

            </Grid>
                {/* <p><b>Family Info</b></p> */}
                <Typography><b>পারিবারিক তথ্য</b></Typography> 
            <Grid container className={clsx(classes.item, classes.overrideReadOnly)} spacing={2}>
              
               <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.fathers_name.en"
                  value={formData?.workforceEmployee.fatherNameEn || ""}
                  onChange={(v) => handleChange("fatherNameEn", v)}
                  readOnly={formData?.workforceEmployee.fatherNameEn ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.fathers_name.bn"
                  value={formData?.workforceEmployee.fatherNameBn || ""}
                  onChange={(v) => handleChange("fatherNameBn", v)}
                  readOnly={formData?.workforceEmployee.fatherNameBn ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.mothers_name.en"
                  value={formData?.workforceEmployee.motherNameEn || ""}
                  onChange={(v) => handleChange("motherNameEn", v)}
                  readOnly={formData?.workforceEmployee.motherNameEn ? true : false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.mothers_name.bn"
                  value={formData?.workforceEmployee.motherNameBn || ""}
                  onChange={(v) => handleChange("motherNameBn", v)}
                  readOnly={formData?.workforceEmployee.motherNameBn ? true : false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name.en"
                  value={formData?.workforceEmployee.spouseNameEn || ""}
                  onChange={(v) => handleChange("spouseNameEn", v)}
                  readOnly={formData?.workforceEmployee.spouseNameEn ? true : false}
                />
              </Grid>
              <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
                <TextInput
                  label="workforce.employee.spouse.name.bn"
                  value={formData?.workforceEmployee.spouseNameBn || ""}
                  onChange={(v) => handleChange("spouseNameBn", v)}
                  readOnly={formData?.workforceEmployee.spouseNameBn ? true : false}
                />
              </Grid>
            </Grid>
            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetailsForm;
