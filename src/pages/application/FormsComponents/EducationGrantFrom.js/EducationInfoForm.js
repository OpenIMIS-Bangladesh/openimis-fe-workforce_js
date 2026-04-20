import React from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper, Grid,FormHelperText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TextInput, useTranslations, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import BoardPicker from "../../../../pickers/BoardPicker";
import YearPicker from "../../../../pickers/YearPicker";
import EmployeeDetailsForm2 from "../../EmployeeDetailsForm2";

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

const EducationInfoForm = ({ modulesManager, handleChange, formData, applicationForSelf, errors }) => {
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const classes = useStyles();

  const handleSelectedGrantOptionChange = (event) => {
    const value = event.target.value;
    handleChange("educationGrantFor", value);
  };

  return (
    <>
    <FormControl component="fieldset" className={classes.formSection}>
      <Typography mb={4} style={{ color: "red", textAlign: "center", fontWeight: "bold", fontSize: "small", margin: "15px" }}>
        <FormattedMessage id="workforce.application.header.blwf.education.note" module="workforce" />
      </Typography>
      <Grid container spacing={2} className={classes.section}>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            id="nameEn"
            label="workforce.child.name.en"
            value={formData?.employeeChildrenInfo?.nameEn || ""}
            onChange={(v) => handleChange("nameEn", v)}
            required
            readOnly={false}
            error={!!errors.nameEn}
            helperText={errors.nameEn}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            id="nameBn"
            label="workforce.child.name.bn"
            value={formData?.employeeChildrenInfo?.nameBn || ""}
            onChange={(v) => handleChange("nameBn", v)}
            required
            readOnly={false}
            error={!!errors.nameBn}
            helperText={errors.nameBn}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            id={"nid"}
            label="workforce.application.employee.children.nidOrBirthRegistry"
            value={formData?.employeeChildrenInfo?.nid || ""}
            onChange={(v) => handleChange("nid", v)}
            type={"number"}
            readOnly={false}
            required
            error={!!errors.nid}
            helperText={errors.nid}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <PublishedComponent
            pubRef="workforce.DatePicker"
            label={"workforce.employee.birthdate"}
            value={formData?.employeeChildrenInfo?.birthDate || ""}
            onChange={(v) => handleChange("birthDate", v)}
            readOnly={false}
            // required
          />
        </Grid>
      </Grid>
     

      {/* Additional Fields for Scholarship Info */}
      <Grid container spacing={2} className={classes.section}>
        <Grid item xs={6}>
          <TextInput
            id="university"
            label="workforce.application.educationInfo.university"
            value={formData?.employeeChildrenInfo?.university || ""}
            onChange={(v) => handleChange("university", v)}
            type="text"
            required
            error={!!errors.university}
            helperText={errors.university}
            readOnly={false}
          />
        </Grid>

        <Grid item xs={6}>
          <YearPicker
            id="admissionYear"
            label="workforce.application.educationInfo.admissionYear"
            value={formData?.employeeChildrenInfo?.admissionYear || ""}
            onChange={(v) => handleChange("admissionYear", v)}
            required
          />
          {errors.admissionYear && <FormHelperText error>{errors.admissionYear}</FormHelperText>}
        </Grid>

        <Grid item xs={6}>
          <TextInput
            id="idNo"
            label="workforce.application.educationInfo.IdNo"
            value={formData?.employeeChildrenInfo?.idNo || ""}
            onChange={(v) => handleChange("idNo", v)}
            type="number"
            required
            error={!!errors.idNo}
            helperText={errors.idNo}
            readOnly={false}
          />
        </Grid>
        <Grid item xs={6}>
          <TextInput
            id="regNo"
            label="workforce.application.educationInfo.regNo"
            value={formData?.employeeChildrenInfo?.regNo || ""}
            onChange={(v) => handleChange("regNo", v)}
            type="number"
            required
            error={!!errors.regNo}
            helperText={errors.regNo}
            readOnly={false}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <TextInput
            id="studyingClass"
            label="workforce.application.employee.children.studyingSemester"
            value={formData?.employeeChildrenInfo?.studyingClass || ""}
            onChange={(v) => handleChange("studyingClass", v)}
            readOnly={false}
            required={
              formData?.employeeChildrenInfo?.educationGrantFor === "underGraduate" || formData?.employeeChildrenInfo?.educationGrantFor === "postGraduate"
                ? true
                : false
            }
            error={!!errors.studyingClass}
            helperText={errors.studyingClass}
          />
        </Grid>

        <Grid item xs={6}>
          <TextInput
            id="cgpa"
            label="workforce.application.educationInfo.cgpa"
            value={formData?.employeeChildrenInfo?.cgpa || ""}
            onChange={(v) => handleChange("cgpa", v)}
            // type="text"
            required
            error={!!errors.cgpa}
            helperText={errors.cgpa}
            readOnly={false}
          />
        </Grid>
      </Grid>
    </FormControl>
      <EmployeeDetailsForm2 handleChange={handleChange} formData={formData} selectedApplicationType={formData.applicationType}  formStepNo={"educations"} errors={errors}/>

    </>
  );
};

export default EducationInfoForm;
