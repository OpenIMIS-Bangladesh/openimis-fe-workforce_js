import React from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TextInput, useTranslations, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import BoardPicker from "../../../../pickers/BoardPicker";
import YearPicker from "../../../../pickers/YearPicker";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: "bold",
  },
  paper: {
    padding: theme.spacing(2),
    width: "100%",
    maxWidth: 650,
    margin: "auto",
  },
  section: {
    marginTop: theme.spacing(3),
  },
  formSection: {
    marginLeft: theme.spacing(2),
  },
}));

const EducationInfoForm = ({ modulesManager, handleChange, formData, applicationForSelf }) => {
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const classes = useStyles();

  const handleSelectedGrantOptionChange = (event) => {
    const value = event.target.value;
    handleChange("educationGrantFor", value);
  };

  return (
    <FormControl component="fieldset" className={classes.formSection}>
      <Typography mb={4} style={{color:"red",textAlign:"center",fontWeight:"bold"}}>
        <FormattedMessage id="workforce.application.header.blwf.education.note" module="workforce" />
      </Typography>
      <Grid container spacing={2} className={classes.section}>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="workforce.child.name.en"
                value={formData?.employeeChildrenInfo?.nameEn || ""}
                onChange={(v) => handleChange("nameEn", v)}
                required
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="workforce.child.name.bn"
                value={formData?.employeeChildrenInfo?.nameBn || ""}
                onChange={(v) => handleChange("nameBn", v)}
                required
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="workforce.application.employee.children.nidOrBirthRegistry"
                value={formData?.employeeChildrenInfo?.nid || ""}
                onChange={(v) => handleChange("nid", v)}
                type={"number"}
                readOnly={false}
                required
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label={"workforce.employee.birthdate"}
                value={formData?.employeeChildrenInfo?.birthDate || ""}
                onChange={(v) => handleChange("birthDate", v)}
                readOnly={false}
                required
              />
            </Grid>
      </Grid>
      {/* <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
        <FormattedMessage id="workforce.application.steps.select" module="workforce" />
      </Typography>

      <RadioGroup value={formData?.employeeChildrenInfo?.educationGrantFor || ""} onChange={handleSelectedGrantOptionChange}>
        <FormControlLabel
          value="underGraduate"
          control={<Radio color="primary" />}
          label={<FormattedMessage id="workforce.application.steps.underGraduate" module="workforce" />}
        />
        <FormControlLabel
          value="postGraduate"
          control={<Radio color="primary" />}
          label={<FormattedMessage id="workforce.application.steps.postGraduate" module="workforce" />}
        />
      </RadioGroup> */}

      {/* Additional Fields for Scholarship Info */}
      <Grid container spacing={2} className={classes.section}>
        <Grid item xs={6}>
          <TextInput
            label="workforce.application.educationInfo.university"
            value={formData?.employeeChildrenInfo?.university || ""}
            onChange={(v) => handleChange("university", v)}
            type="text"
            required
            readOnly={false}
          />
        </Grid>

        <Grid item xs={6}>
          <YearPicker
            label="workforce.application.educationInfo.admissionYear"
            value={formData?.employeeChildrenInfo?.passingYear || ""}
            onChange={(v) => handleChange("admissionYear", v)}
            required
          />
        </Grid>

        <Grid item xs={6}>
          <TextInput
            label="workforce.application.educationInfo.IdNo"
            value={formData?.employeeChildrenInfo?.rollNo || ""}
            onChange={(v) => handleChange("idNo", v)}
            type="number"
            required
            readOnly={false}
          />
        </Grid>
        <Grid item xs={6}>
          <TextInput
            label="workforce.application.educationInfo.regNo"
            value={formData?.employeeChildrenInfo?.regNo || ""}
            onChange={(v) => handleChange("regNo", v)}
            type="number"
            required
            readOnly={false}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <TextInput
            label="workforce.application.employee.children.studyingSemester"
            value={formData?.employeeChildrenInfo?.studyingClass || ""}
            onChange={(v) => handleChange("studyingClass", v)}
            readOnly={false}
            required={
              formData?.employeeChildrenInfo?.educationGrantFor === "underGraduate" || formData?.employeeChildrenInfo?.educationGrantFor === "postGraduate"
                ? true
                : false
            }
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            label="workforce.application.employee.children.studyingSubject"
            value={formData?.employeeChildrenInfo?.studyingClass || ""}
            onChange={(v) => handleChange("studyingClass", v)}
            readOnly={false}
            required={
              formData?.employeeChildrenInfo?.educationGrantFor === "underGraduate" || formData?.employeeChildrenInfo?.educationGrantFor === "postGraduate"
                ? true
                : false
            }
          />
        </Grid>
        <Grid item xs={6}>
          <TextInput
            label="workforce.application.educationInfo.cgpa"
            value={formData?.employeeChildrenInfo?.cgpa || ""}
            onChange={(v) => handleChange("cgpa", v)}
            // type="text"
            required
            readOnly={false}
          />
        </Grid>
      </Grid>
    </FormControl>
  );
};

export default EducationInfoForm;
