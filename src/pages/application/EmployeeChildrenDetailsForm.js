import React from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  FormattedMessage,
  PublishedComponent,
} from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";

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
}));

const EmployeeChildrenDetailsForm = ({ handleChange, formData, setFormData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager,
  );

  const employeeData = useSelector(
    (state) => state.workforce[`workforceEmployee`] ?? []
  )

  //   const handleChange = (key, value) => {
  //     setFormData((prev) => ({ ...prev, [key]: value }));
  //   };

  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.item} spacing={2}>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.first.name.en"
                  // value={formData.firstNameEn || ""}
                  onChange={(v) => handleChange("firstNameEn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.first.name.bn"
                  // value={formData.firstNameBn || ""}
                  onChange={(v) => handleChange("firstNameBn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.last.name.en"
                  // value={formData.lastNameEn || ""}
                  onChange={(v) => handleChange("lastNameEn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.last.name.bn"
                  // value={formData.lastNameBn || ""}
                  onChange={(v) => handleChange("lastNameBn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.other.name"
                  // value={formData.otherName || ""}
                  onChange={(v) => handleChange("otherName", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.birthdate"}
                  // value={formData.birthDate || ""}
                  onChange={(v) => handleChange("birthDate", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.educationInstituteName"
                  // value={formData.educationInstituteName || ""}
                  onChange={(v) => handleChange("educationInstituteName", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.studyingClass"
                  // value={formData.studyingClass || ""}
                  onChange={(v) => handleChange("studyingClass", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.result"
                  // value={formData.result || ""}
                  onChange={(v) => handleChange("result", v)}
                  readOnly={false}
                  required
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.phone"
                  // value={formData.phoneNumber || ""}
                  onChange={(v) => handleChange("phoneNumber", v)}
                  type={"number"}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.nidOrBirthRegistry"
                  // value={formData.nid || ""}
                  onChange={(v) => handleChange("nid", v)}
                  type={"number"}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.bankNameOrAcNo"
                  // value={formData.bankNameOrAcNo || ""}
                  onChange={(v) => handleChange("bankNameOrAcNo", v)}
                  type={"number"}
                  readOnly={false}
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

export default EmployeeChildrenDetailsForm;
