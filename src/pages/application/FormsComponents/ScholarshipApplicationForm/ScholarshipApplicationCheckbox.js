import React from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TextInput, useTranslations, FormattedMessage,PublishedComponent } from "@openimis/fe-core";
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

const ScholarshipApplicationCheckbox = ({
  modulesManager,
  handleChange,
  selectedScholarshipOption,
  setSelectedScholarshipOption,
  formData,
  applicationForSelf,
}) => {
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const classes = useStyles();

  const handleselectedScholarshipOptionChange = (event) => {
    const value = event.target.value;
    handleChange("scholarshipFor", value, "metadata");
  };

  return (
    <FormControl component="fieldset" className={classes.formSection}>
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
        <FormControlLabel
          value="postGraduate"
          control={<Radio color="primary" />}
          label={<FormattedMessage id="workforce.application.steps.postGraduate" module="workforce" />}
        />
      </RadioGroup>

      {/* Additional Fields for Scholarship Info */}
      <Grid container spacing={2} className={classes.section}>
        {formData?.metadata?.scholarshipFor === "underGraduate" || formData?.metadata?.scholarshipFor === "postGraduate" ? (
          <Grid item xs={6}>
            <TextInput
              label="workforce.application.educationInfo.university"
              value={formData?.metadata?.cgpa || ""}
              onChange={(v) => handleChange("university", v, "metadata")}
              type="text"
              required
              readOnly={false}
            />
          </Grid>
        ) : (
          <Grid item xs={6}>
            <BoardPicker
              value={formData?.metadata?.board || ""}
              label={<FormattedMessage id="workforce.application.educationInfo.board" module="workforce" />}
              required
              onChange={(v) => handleChange("board", v, "metadata")}
              readOnly={false}
            />
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
            label="Passing Year"
            value={formData?.metadata?.passingYear || ""}
            onChange={(v) => handleChange("passingYear", v, "metadata")}
            required
          />
        </Grid>

        <Grid item xs={6}>
          <TextInput
            label="workforce.application.educationInfo.rollNo"
            value={formData?.metadata?.rollNo || ""}
            onChange={(v) => handleChange("rollNo", v, "metadata")}
            type="number"
            required
            readOnly={false}
          />
        </Grid>
        {applicationForSelf === "no" ? (
          <>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="workforce.child.name.en"
                value={formData?.employeeChildrenInfo?.nameEn || ""}
                onChange={(v) => handleChange("nameEn", v, "metadata")}
                required
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="workforce.child.name.bn"
                value={formData?.employeeChildrenInfo?.nameBn || ""}
                onChange={(v) => handleChange("nameBn", v, "metadata")}
                required
                readOnly={false}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label={"workforce.employee.birthdate"}
                value={formData?.employeeChildrenInfo?.birthDate || ""}
                onChange={(v) => handleChange("birthDate", v, "metadata")}
                readOnly={false}
                required
              />
            </Grid>

            <Grid item xs={6} className={classes.item}>
              <TextInput
                label="workforce.application.employee.children.nidOrBirthRegistry"
                value={formData?.employeeChildrenInfo?.nid || ""}
                onChange={(v) => handleChange("nid", v, "metadata")}
                type={"number"}
                readOnly={false}
                required
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={6}>
            <TextInput
              label="workforce.application.educationInfo.regNo"
              value={formData?.metadata?.regNo || ""}
              onChange={(v) => handleChange("regNo", v, "metadata")}
              type="number"
              required
              readOnly={false}
            />
          </Grid>
        )}
        <Grid item xs={6} className={classes.item}>
          <TextInput
            label="workforce.application.employee.children.studyingClass"
            value={formData?.employeeChildrenInfo?.studyingClass || ""}
            onChange={(v) => handleChange("studyingClass", v, "metadata")}
            readOnly={false}
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextInput
            label="workforce.application.educationInfo.cgpa"
            value={formData?.metadata?.cgpa || ""}
            onChange={(v) => handleChange("cgpa", v, "metadata")}
            // type="text"
            required
            readOnly={false}
          />
        </Grid>
      </Grid>
    </FormControl>
  );
};

export default ScholarshipApplicationCheckbox;
