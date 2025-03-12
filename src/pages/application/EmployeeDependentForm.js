import React, { useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Button,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextInput,
  PublishedComponent,
  FormattedMessage,
  useTranslations,
  useModulesManager,
} from "@openimis/fe-core";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: "3px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
}));

const EmployeeDependentForm = ({
  dependents,
  handleDependentChange,
  addDependent,
  removeDependent,
}) => {
  const classes = useStyles();
  const [dependents, setDependents] = useState([{}]);
  const [expanded, setExpanded] = useState(0);
  const modulesManager = useModulesManager();

  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );

  const handleChange = (index, key, value) => {
    const updatedDependents = [...dependents];
    updatedDependents[index][key] = value;
    setDependents(updatedDependents);
  };

  const addDependent = () => {
    setDependents([...dependents, {}]);
    setExpanded(dependents.length); // Expand the newly added dependent
  };

  const removeDependent = (index) => {
    if (dependents.length > 1) {
      const updatedDependents = dependents.filter((_, i) => i !== index);
      setDependents(updatedDependents);
      setExpanded(index === 0 ? 0 : index - 1); // Keep previous one expanded
    }
  };

  const isFirstDependentValid =
    dependents[0]?.nid && dependents[0]?.firstNameEn;

  return (
    <Box mt={1}>
      {dependents.map((formData, index) => (
        <Accordion
          key={index}
          expanded={expanded === index}
          onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {formData.firstNameEn ? formData.firstNameEn : `Dependent ${index + 1}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper className={classes.paper}>
              <Grid container className={classes.item} spacing={2}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.nid"
                    value={formData.nid || ""}
                    onChange={(v) => handleChange(index, "nid", v)}
                    type={"number"}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.birthdate"}
                    value={formData.birthDate || ""}
                    onChange={(v) => handleChange(index, "birthDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <EmployeeLifeStatusPicker
                    value={formData.lifeStatus || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.lifeStatus"
                        module="workforce"
                      />
                    }
                    required
                    onChange={(v) => handleChange(index, "lifeStatus", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.deathdate"}
                    value={formData.deathDate || ""}
                    readOnly={formData.lifeStatus === "Deceased" ? false : true}
                    onChange={(v) => handleChange(index, "deathDate", v)}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <EmployeeGenderPicker
                    value={formData.gender || ""}
                    label={
                      <FormattedMessage
                        id="workforce.employee.gender"
                        module="workforce"
                      />
                    }
                    onChange={(v) => handleChange(index, "gender", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.first.name.en"
                    value={formData.firstNameEn || ""}
                    onChange={(v) => handleChange(index, "firstNameEn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.first.name.bn"
                    value={formData.firstNameBn || ""}
                    onChange={(v) => handleChange(index, "firstNameBn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.last.name.en"
                    value={formData.lastNameEn || ""}
                    onChange={(v) => handleChange(index, "lastNameEn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.last.name.bn"
                    value={formData.lastNameBn || ""}
                    onChange={(v) => handleChange(index, "lastNameBn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.en"
                    value={formData.fatherNameEn || ""}
                    onChange={(v) => handleChange(index, "fatherNameEn", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.bn"
                    value={formData.fatherNameBn || ""}
                    onChange={(v) => handleChange(index, "fatherNameBn", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.en"
                    value={formData.motherNameEn || ""}
                    onChange={(v) => handleChange(index, "motherNameEn", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.bn"
                    value={formData.motherNameBn || ""}
                    onChange={(v) => handleChange(index, "motherNameBn", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.phone"
                    value={formData.phoneNumber || ""}
                    onChange={(v) => handleChange(index, "phoneNumber", v)}
                    type={"number"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.email"
                    value={formData.email || ""}
                    onChange={(v) => handleChange(index, "email", v)}
                    type={"email"}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.occupation"
                    value={formData.occupation || ""}
                    onChange={(v) => handleChange(index, "occupation", v)}
                    type={"email"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.birth_certificate_no"
                    value={formData.birthCertificateNo || ""}
                    onChange={(v) =>
                      handleChange(index, "birthCertificateNo", v)
                    }
                    type={"number"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.marital_status"
                    value={formData.maritalStatus || ""}
                    onChange={(v) => handleChange(index, "maritalStatus", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.present_address"
                    value={formData.presentAddress || ""}
                    onChange={(v) => handleChange(index, "presentAddress", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.permanent_address"
                    value={formData.permanentAddress || ""}
                    onChange={(v) => handleChange(index, "permanentAddress", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>{formatMessage("workforce.employee.present_location")}</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={formData.presentLocation || null}
                    onChange={(presentLocation) =>
                      handleChange(index, "presentLocation", presentLocation)
                    }
                    readOnly={false}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>
                    {formatMessage("workforce.employee.permanent_location")}
                  </p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={formData.permanentLocation || null}
                    onChange={(permanentLocation) =>
                      handleChange(
                        index,
                        "permanentLocation",
                        permanentLocation
                      )
                    }
                    readOnly={false}
                    required
                    split={true}
                  />
                </Grid>

                {/* <Grid item xs={11} className={classes.item} /> */}
                <Divider style={{ margin: "16px 0" }} />
                <Grid item xs={12} className={classes.buttonContainer}>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor:
                        dependents.length === 1 ? "#B0B0B0" : "#d32f2f",
                      color: "white",
                    }}
                    onClick={() => removeDependent(index)}
                    disabled={dependents.length === 1}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={addDependent}
        disabled={!isFirstDependentValid}
      >
        Add Dependent
      </Button>
    </Box>
  );
};

export default EmployeeDependentForm;
