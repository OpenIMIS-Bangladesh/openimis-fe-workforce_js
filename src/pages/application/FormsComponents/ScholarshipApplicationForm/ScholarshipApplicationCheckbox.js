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
    handleChange("scholarshipFor", value);
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
                value={formData?.employeeChildrenInfo?.nameEn || ""}
                onChange={(v) => handleChange("nameEn", v)}
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
              id="nid"
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
          </>
        )}
      </Grid>
      <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
        <FormattedMessage id="workforce.application.steps.select" module="workforce" />
      </Typography>

      <RadioGroup value={formData?.employeeChildrenInfo?.scholarshipFor || ""} onChange={handleselectedScholarshipOptionChange}>
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
        {formData?.employeeChildrenInfo?.scholarshipFor === "underGraduate" || formData?.employeeChildrenInfo?.scholarshipFor === "postGraduate" ? (
          <Grid item xs={6}>
            <TextInput
            id="university"
              label="workforce.application.educationInfo.university"
              value={formData?.employeeChildrenInfo?.university || ""}
              onChange={(v) => handleChange("university", v)}
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
              value={formData?.employeeChildrenInfo?.board || ""}
              label={<FormattedMessage id="workforce.application.educationInfo.board" module="workforce" />}
              required
              onChange={(v) => handleChange("board", v)}
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
              formData?.employeeChildrenInfo?.scholarshipFor === "underGraduate"
                ? formatMessage("workforce.application.educationInfo.admissionYear")
                : formatMessage("workforce.application.educationInfo.passingYear")
            }
            value={formData?.employeeChildrenInfo?.passingYear || ""}
            onChange={(v) => handleChange("passingYear", v)}
            required
          />
          {errors.passingYear && <FormHelperText error>{errors.passingYear}</FormHelperText>}
        </Grid>

        {formData?.employeeChildrenInfo?.scholarshipFor === "underGraduate" ? (
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
              value={formData?.employeeChildrenInfo?.rollNo || ""}
              onChange={(v) => handleChange("rollNo", v)}
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
            value={formData?.employeeChildrenInfo?.regNo || ""}
            onChange={(v) => handleChange("regNo", v)}
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
            label={formData?.employeeChildrenInfo?.scholarshipFor === "underGraduate"?formatMessage("workforce.application.employee.children.studyingSemester"):formatMessage("workforce.application.employee.children.studyingClass")}
            value={formData?.employeeChildrenInfo?.studyingClass || ""}
            onChange={(v) => handleChange("studyingClass", v)}
            readOnly={false}
            required={formData?.employeeChildrenInfo?.scholarshipFor === "underGraduate" || formData?.employeeChildrenInfo?.scholarshipFor === "postGraduate" ? true : false}
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
            readOnly={false}
            error={!!errors.cgpa}
            helperText={errors.cgpa}
          />
        </Grid>
      </Grid>
    </FormControl>
      <EmployeeDetailsForm2 handleChange={()=>{}} formData={formData} selectedApplicationType={formData.applicationType} errors={errors} formStepNo={"educations"} />

  </>
  );
};

export default ScholarshipApplicationCheckbox;
