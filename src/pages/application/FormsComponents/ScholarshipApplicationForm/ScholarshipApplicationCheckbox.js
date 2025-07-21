import React from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
  Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextInput,
  useTranslations,
  FormattedMessage,
} from "@openimis/fe-core";
import BoardPicker from "../../../../pickers/BoardPicker";

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
}) => {
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );

  const classes = useStyles();

  const handleselectedScholarshipOptionChange = (event) => {
    const value = event.target.value;
    handleChange("scholarshipFor", value, "metadata");
  };

  return (
    <FormControl component="fieldset" className={classes.formSection}>
      <Typography
        variant="body1"
        className={`${classes.title} ${classes.section}`}
      >
        <FormattedMessage id="workforce.application.steps.select" module="workforce" />
      </Typography>

      <RadioGroup
        value={formData?.metadata?.scholarshipFor || ""}
        onChange={handleselectedScholarshipOptionChange}
      >
        <FormControlLabel
          value="ssc"
          control={<Radio color="primary" />}
          label={
            <FormattedMessage
              id="workforce.application.steps.ssc"
              module="workforce"
            />
          }
        />
        <FormControlLabel
          value="hsc"
          control={<Radio color="primary" />}
          label={
            <FormattedMessage
              id="workforce.application.steps.hsc"
              module="workforce"
            />
          }
        />
        {/* <FormControlLabel
          value="underGraduate"
          control={<Radio color="primary" />}
          label={
            <FormattedMessage
              id="workforce.application.steps.underGraduate"
              module="workforce"
            />
          }
        />
        <FormControlLabel
          value="postGraduate"
          control={<Radio color="primary" />}
          label={
            <FormattedMessage
              id="workforce.application.steps.postGraduate"
              module="workforce"
            />
          }
        /> */}
      </RadioGroup>

      {/* Additional Fields for Scholarship Info */}
      <Grid container spacing={2} className={classes.section}>
        <Grid item xs={6}>
          <TextInput
            label="workforce.application.educationInfo.passingYear"
            value={formData?.metadata?.passingYear || ""}
            onChange={(v) => handleChange("passingYear", v, "metadata")}
            // type="number"
            required
            readOnly={false}
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
        {formData?.metadata?.scholarshipFor === "underGraduate" || formData?.metadata?.scholarshipFor === "postGraduate"? (
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
        ):(
          <Grid item xs={6}>
          <BoardPicker
                    value={formData?.metadata?.board || ""}
                    label={<FormattedMessage id="workforce.application.educationInfo.board" module="workforce"/>}
                    required
                    onChange={(v) =>
                      handleChange("board", v,"metadata")
                    }
                    readOnly={false}
                  />
        </Grid>
        )}
      </Grid>
    </FormControl>
  );
};

export default ScholarshipApplicationCheckbox;
