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
}));

const EmployeeDetailsForm = ({ handleChange, formData, setFormData }) => {
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
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
          <Box textAlign="center" fontWeight="bold">
            <FormattedMessage id="workforce.application.header.labour" module="workforce" />
          </Box>
          <Box mb={4}>
            <FormattedMessage id="workforce.application.header.labour.note" module="workforce" />
          </Box>
              <Grid container className={classes.item} spacing={2}>
              {/* <Grid item xs={6} className={classes.item}>*/}
              {/*  <PublishedComponent*/}
              {/*    pubRef="workforceOrganization.OrganizationPicker"*/}
              {/*    value={formData?.workforceEmployee.organization || null}*/}
              {/*    label={<FormattedMessage module="workforce" id="workforce.organization.picker" />}*/}
              {/*    onChange={(v) => handleChange("organizationId", v)}*/}
              {/*    required*/}
              {/*    readOnly={false}*/}
              {/*  />*/}
              {/*</Grid>*/}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.name.bn"
                  value={formData?.workforceEmployee.nameBn || ""}
                  onChange={(v) => handleChange("nameBn", v)}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.name.en"
                  value={formData?.workforceEmployee.nameEn || ""}
                  onChange={(v) => handleChange("nameEn", v)}
                  required
                  readOnly={false}
                />
              </Grid>           
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.fathers_name.en"
                  value={formData?.workforceEmployee.fatherNameEn || ""}
                  onChange={(v) => handleChange("fatherNameEn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.fathers_name.bn"
                  value={formData?.workforceEmployee.fatherNameBn || ""}
                  onChange={(v) => handleChange("fatherNameBn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.mothers_name.en"
                  value={formData?.workforceEmployee.motherNameEn || ""}
                  onChange={(v) => handleChange("motherNameEn", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.mothers_name.bn"
                  value={formData?.workforceEmployee.motherNameBn || ""}
                  onChange={(v) => handleChange("motherNameBn", v)}
                  readOnly={false}
                  required
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.spouse.name.en"
                  value={formData?.workforceEmployee.spouseNameEn || ""}
                  onChange={(v) => handleChange("spouseNameEn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.spouse.name.bn"
                  value={formData?.workforceEmployee.spouseNameBn || ""}
                  onChange={(v) => handleChange("spouseNameBn", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.birthdate"}
                  value={formData?.workforceEmployee.birthDate || ""}
                  onChange={(v) => handleChange("birthDate", v)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <EmployeeGenderPicker
                  value={formData?.workforceEmployee?.gender}
                  label={
                    <FormattedMessage
                      id="workforce.employee.gender"
                      module="workforce"
                    />
                  }
                  onChange={(v) => handleChange("gender", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.phone"
                  value={formData?.workforceEmployee.phoneNumber || ""}
                  onChange={(v) => handleChange("phoneNumber", v)}
                  type={"number"}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.email"
                  value={formData?.workforceEmployee.email || ""}
                  onChange={(v) => handleChange("email", v)}
                  type={"email"}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.citizenship"
                  value={formData?.workforceEmployee.citizenship || ""}
                  onChange={(v) => handleChange("citizenship", v)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <EmployeeMaritalStatusPicker
                  value={formData?.workforceEmployee.maritalStatus || ""}
                  label={
                    <FormattedMessage
                      id="workforce.employee.marital_status"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) => handleChange("maritalStatus", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.position"
                  value={formData?.workforceEmployee.position || ""}
                  onChange={(v) => handleChange("position", v)}
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
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
                  readOnly={false}
                />
              </Grid>
             
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.deathdate"}
                  value={formData?.workforceEmployee.deathDate || ""}
                  readOnly={formData?.workforceEmployee.lifeStatus === "Deceased" ? false : true}
                  onChange={(v) => handleChange("deathDate", v)}
                  // readOnly={false}
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
