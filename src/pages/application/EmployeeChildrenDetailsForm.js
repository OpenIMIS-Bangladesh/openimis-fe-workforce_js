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

  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
             <Box mb={4} textAlign="center" fontWeight="bold">
               <FormattedMessage id="workforce.application.header.child" module="workforce" />
              </Box>
            <Grid container className={classes.item} spacing={2}>
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
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.birthdate"}
                  value={formData?.employeeChildrenInfo?.birthDate || ""}
                  onChange={(v) => handleChange("birthDate", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.educationInstituteName"
                  value={formData?.employeeChildrenInfo?.educationInstituteName || ""}
                  onChange={(v) => handleChange("educationInstituteName", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.studyingClass"
                  value={formData?.employeeChildrenInfo?.studyingClass || ""}
                  onChange={(v) => handleChange("studyingClass", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.result"
                  value={formData?.employeeChildrenInfo?.result || ""}
                  onChange={(v) => handleChange("result", v)}
                  readOnly={false}
                  
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.application.employee.children.nidOrBirthRegistry"
                  value={formData?.employeeChildrenInfo?.nid || ""}
                  onChange={(v) => handleChange("nid", v)}
                  type={"number"}
                  readOnly={false}
                  required
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
