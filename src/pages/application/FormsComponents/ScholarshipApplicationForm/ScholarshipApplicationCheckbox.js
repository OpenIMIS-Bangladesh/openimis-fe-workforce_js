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

const ScholarshipApplicationCheckbox = ({
  modulesManager,
  handleChange,
  selectedScholarshipOption,
  setSelectedScholarshipOption,
  formData,
  applicationForSelf,
  errors
}) => {
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const classes = useStyles();

  const handleselectedScholarshipOptionChange = (event) => {
    const value = event.target.value;
    handleChange("scholarshipFor", value, "metadata");
  };

  return (<>
    <FormControl component="fieldset" className={classes.formSection}>
      <Grid container spacing={2} className={classes.section}>
        {applicationForSelf === "no" && (
          <>
            <Grid item xs={6} className={classes.item}>
              <TextInput
              id="nameEn"
                label="workforce.child.name.en"
                value={formData?.metadata?.nameEn || ""}
                onChange={(v) => handleChange("nameEn", v, "metadata")}
                required
                error={!!errors.nameEn}
            helperText={errors.nameEn}
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <TextInput
              id="nameBn"
                label="workforce.child.name.bn"
                value={formData?.metadata?.nameBn || ""}
                onChange={(v) => handleChange("nameBn", v, "metadata")}
                required
                readOnly={false}
                error={!!errors.nameBn}
            helperText={errors.nameBn}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <TextInput
              id="nid"
                label="workforce.application.employee.children.nidOrBirthRegistry"
                value={formData?.metadata?.nid || ""}
                onChange={(v) => handleChange("nid", v, "metadata")}
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
                value={formData?.metadata?.birthDate || ""}
                onChange={(v) => handleChange("birthDate", v, "metadata")}
                readOnly={false}
                // required
              />
            </Grid>
          </>
        )}
      </Grid>
      <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
        <FormattedMessage id="workforce.application.steps.select" module="workforce" />
      </Typography>

      <RadioGroup value={formData?.metadata?.scholarshipFor || ""} onChange={handleselectedScholarshipOptionChange}>
        <FormControlLabel
          value="ssc"
          control={<Radio color="primary" />}
          label={<FormattedMessage id="workforce.application.steps.ssc" module="workforce" />}
        />
        <FormControlLabel
          value="hsc"
          control={<Radio color="primary" />}
          label={<FormattedMessage id="workforce.application.steps.hsc" module="workforce" />}
        />
        <FormControlLabel
          value="underGraduate"
          control={<Radio color="primary" />}
          label={<FormattedMessage id="workforce.application.steps.underGraduate" module="workforce" />}
        />
        {/* <FormControlLabel
          value="postGraduate"
          control={<Radio color="primary" />}
          label={<FormattedMessage id="workforce.application.steps.postGraduate" module="workforce" />}
        /> */}
      </RadioGroup>

      {/* Additional Fields for Scholarship Info */}
      <Grid container spacing={2} className={classes.section}>
        {formData?.metadata?.scholarshipFor === "underGraduate" || formData?.metadata?.scholarshipFor === "postGraduate" ? (
          <Grid item xs={6}>
            <TextInput
            id="university"
              label="workforce.application.educationInfo.university"
              value={formData?.metadata?.university || ""}
              onChange={(v) => handleChange("university", v, "metadata")}
              type="text"
              required
              readOnly={false}
              error={!!errors.university}
            helperText={errors.university}
            />
          </Grid>
        ) : (
          <Grid item xs={6}>
            <BoardPicker
            id="board"
              value={formData?.metadata?.board || ""}
              label={<FormattedMessage id="workforce.application.educationInfo.board" module="workforce" />}
              required
              onChange={(v) => handleChange("board", v, "metadata")}
              readOnly={false}
              
            />
            {errors.board && <FormHelperText error>{errors.board}</FormHelperText>}
          </Grid>
        )}
        <Grid item xs={6}>
          {/* <TextInput
            label="workforce.application.educationInfo.passingYear"
            value={formData?.metadata?.passingYear || ""}
            onChange={(v) => handleChange("passingYear", v, "metadata")}
            // type="number"
            required
            readOnly={false}
          /> */}
          <YearPicker
          id="passingYear"
            label={
              formData?.metadata?.scholarshipFor === "underGraduate"
                ? formatMessage("workforce.application.educationInfo.admissionYear")
                : formatMessage("workforce.application.educationInfo.passingYear")
            }
            value={formData?.metadata?.passingYear || ""}
            onChange={(v) => handleChange("passingYear", v, "metadata")}
            required
          />
          {errors.passingYear && <FormHelperText error>{errors.passingYear}</FormHelperText>}
        </Grid>

        {formData?.metadata?.scholarshipFor === "underGraduate" ? (
          <Grid item xs={6}>
            <TextInput
            id="idNo"
              label="workforce.application.educationInfo.IdNo"
              value={formData?.employeeChildrenInfo?.idNo || ""}
              onChange={(v) => handleChange("idNo", v)}
              type="number"
              required
              readOnly={false}
              error={!!errors.idNo}
            helperText={errors.idNo}
            />
          </Grid>
        ) : (
          <Grid item xs={6}>
            <TextInput
            id={"rollNo"}
              label="workforce.application.educationInfo.rollNo"
              value={formData?.metadata?.rollNo || ""}
              onChange={(v) => handleChange("rollNo", v, "metadata")}
              type="number"
              required
              readOnly={false}
              error={!!errors.rollNo}
            helperText={errors.rollNo}
            />
          </Grid>
        )}
        <Grid item xs={6}>
          <TextInput
          id="regNo"
            label="workforce.application.educationInfo.regNo"
            value={formData?.metadata?.regNo || ""}
            onChange={(v) => handleChange("regNo", v, "metadata")}
            type="number"
            required
            readOnly={false}
            error={!!errors.regNo}
            helperText={errors.regNo}
          />
        </Grid>

        <Grid item xs={6} className={classes.item}>
          <TextInput
            id="studyingClass"
            label={formData?.metadata?.scholarshipFor === "underGraduate"?formatMessage("workforce.application.employee.children.studyingSemester"):formatMessage("workforce.application.employee.children.studyingClass")}
            value={formData?.metadata?.studyingClass || ""}
            onChange={(v) => handleChange("studyingClass", v, "metadata")}
            readOnly={false}
            required={formData?.metadata?.scholarshipFor === "underGraduate" || formData?.metadata?.scholarshipFor === "postGraduate" ? true : false}
            error={!!errors.studyingClass}
            helperText={errors.studyingClass}
          />
        </Grid>
        <Grid item xs={6}>
          <TextInput
          id="cgpa"
            label="workforce.application.educationInfo.cgpa"
            value={formData?.metadata?.cgpa || ""}
            onChange={(v) => handleChange("cgpa", v, "metadata")}
            // type="text"
            required
            readOnly={false}
            error={!!errors.cgpa}
            helperText={errors.cgpa}
          />
        </Grid>
      </Grid>
    </FormControl>
      <EmployeeDetailsForm2 handleChange={handleChange} formData={formData} selectedApplicationType={formData.applicationType}  formStepNo={"educations"} />

  </>
  );
};

export default ScholarshipApplicationCheckbox;
