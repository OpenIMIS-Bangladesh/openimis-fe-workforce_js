import React, { useState } from "react";
import { Grid, Box, Paper, Button, Typography, Divider, Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { TextInput, PublishedComponent, FormattedMessage, useTranslations, useModulesManager } from "@openimis/fe-core";
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

const EmployeeDependentForm = ({ applicationType, dependents, handleDependentChange, addDependent, removeDependent, expanded, setExpanded }) => {
  // Normalize dependents to always be an array
  const normalizedDependents = Array.isArray(dependents) ? dependents : dependents ? [dependents] : [{}];

  const classes = useStyles();
  // const [expanded, setExpanded] = useState(0);
  const modulesManager = useModulesManager();

  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const isFirstDependentValid = normalizedDependents?.[0]?.nid && normalizedDependents?.[0]?.nameEn;

  console.log({ dependents });

  return (
    <Box mt={1}>
      {normalizedDependents?.map((formData, index) => (
        <Accordion key={index} expanded={expanded === index} onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                <FormattedMessage id="workforce.application.header.dependent" module="workforce" />
              </Typography>
              <Typography>{formData.nameEn ? formData.nameEn : ""}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Paper className={classes.paper} elevation={0}>
              <Grid container className={classes.item} spacing={2}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.name.bn"
                    value={formData.nameBn || ""}
                    onChange={(v) => handleDependentChange(index, "nameBn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.name.en"
                    value={formData.nameEn || ""}
                    onChange={(v) => handleDependentChange(index, "nameEn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>

                {/* <Grid item xs={6} className={classes.item}>
                  <EmployeeLifeStatusPicker
                    value={formData.lifeStatus || ""}
                    label={<FormattedMessage id="workforce.employee.lifeStatus" module="workforce"/>}
                    required
                    onChange={(v) =>
                      handleDependentChange(index, "lifeStatus", v)
                    }
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.deathdate"}
                    value={formData.deathDate || ""}
                    readOnly={formData.lifeStatus === "Deceased" ? false : true}
                    onChange={(v) =>
                      handleDependentChange(index, "deathDate", v)
                    }
                  />
                </Grid> */}

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.en"
                    value={formData.fatherNameEn || ""}
                    onChange={(v) => handleDependentChange(index, "fatherNameEn", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.bn"
                    value={formData.fatherNameBn || ""}
                    onChange={(v) => handleDependentChange(index, "fatherNameBn", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.en"
                    value={formData.motherNameEn || ""}
                    onChange={(v) => handleDependentChange(index, "motherNameEn", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.bn"
                    value={formData.motherNameBn || ""}
                    onChange={(v) => handleDependentChange(index, "motherNameBn", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.nid"
                    value={formData.nid || ""}
                    onChange={(v) => handleDependentChange(index, "nid", v)}
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
                    onChange={(v) => handleDependentChange(index, "birthDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <EmployeeGenderPicker
                    value={formData.gender || ""}
                    label={<FormattedMessage id="workforce.employee.gender" module="workforce" />}
                    onChange={(v) => handleDependentChange(index, "gender", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.phone"
                    value={formData.phoneNumber || ""}
                    onChange={(v) => handleDependentChange(index, "phoneNumber", v)}
                    type={"number"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.email"
                    value={formData.email || ""}
                    onChange={(v) => handleDependentChange(index, "email", v)}
                    type={"email"}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.occupation"
                    value={formData.occupation || ""}
                    onChange={(v) => handleDependentChange(index, "occupation", v)}
                    type={"email"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.birth_certificate_no"
                    value={formData.birthCertificateNo || ""}
                    onChange={(v) => handleDependentChange(index, "birthCertificateNo", v)}
                    type={"number"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.marital_status"
                    value={formData.maritalStatus || ""}
                    onChange={(v) => handleDependentChange(index, "maritalStatus", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>{formatMessage("workforce.employee.present_location")}</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={formData.presentLocation || null}
                    onChange={(presentLocation) => handleDependentChange(index, "presentLocation", presentLocation)}
                    readOnly={false}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.present_location"
                    value={formData.presentAddress || ""}
                    onChange={(v) => handleDependentChange(index, "presentAddress", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>{formatMessage("workforce.employee.permanent_location")}</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={formData.permanentLocation || null}
                    onChange={(permanentLocation) => handleDependentChange(index, "permanentLocation", permanentLocation)}
                    readOnly={false}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.permanent_location"
                    value={formData.permanentAddress || ""}
                    onChange={(v) => handleDependentChange(index, "permanentAddress", v)}
                    readOnly={false}
                  />
                </Grid>

                {/* <Grid item xs={11} className={classes.item} /> */}
                <Divider style={{ margin: "16px 0" }} />
                {applicationType === "financialAssistance" && (
                <Grid item xs={12} className={classes.buttonContainer}>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: applicationType !== "financialAssistance" || dependents.length === 1 ? "#B0B0B0" : "#d32f2f",
                      color: "white",
                    }}
                    onClick={() => removeDependent(index)}
                    disabled={applicationType !== "financialAssistance" || dependents.length === 1}
                  >
                    <FormattedMessage module="workforce" id="workforce.application.steps.skip" />
                  </Button>
                </Grid>
                )}
              </Grid>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
      {applicationType === "financialAssistance" && (
        <Button variant="contained" color="primary" onClick={addDependent} disabled={!isFirstDependentValid}>
          <FormattedMessage module="workforce" id="workforce.application.steps.dependentAdd" />
        </Button>
      )}
    </Box>
  );
};

export default EmployeeDependentForm;
