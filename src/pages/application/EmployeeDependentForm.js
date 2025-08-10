import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Grid, Box, Paper, Button, Typography, Divider, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { TextInput, PublishedComponent, FormattedMessage, useTranslations, useModulesManager } from "@openimis/fe-core";
import RelationWithWorkerPicker from "../../pickers/RelationWithWorkerPicker";
import FileUploader from "../../pickers/FileUploader";
import CustomDependentLocation from "../../components/application-forms/CustomDependentLocation";

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

const EmployeeDependentForm = ({ applicationType, dependents, handleChange, addItem, removeItem, expanded, setExpanded, formdata }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const normalizedDependents = useMemo(() => (Array.isArray(dependents) ? dependents : dependents ? [dependents] : []), [dependents]);

  const [sameAsPresent, setSameAsPresent] = useState([]);

  useEffect(() => {
    if (Array.isArray(normalizedDependents)) {
      setSameAsPresent((prev) => normalizedDependents.map((_, index) => prev?.[index] || false));
    }
  }, [normalizedDependents]);

  const handleCheckboxChange = useCallback(
    (index, e) => {
      const isChecked = e.target.checked;

      setSameAsPresent((prev) => {
        const updated = [...(prev || [])];
        updated[index] = isChecked;
        return updated;
      });

      const presentLocation = dependents?.[index]?.presentLocation || null;
      const presentAddress = dependents?.[index]?.presentAddress || "";

      handleChange(index, "permanentLocation", isChecked ? presentLocation : null);
      handleChange(index, "permanentAddress", isChecked ? presentAddress : "");
    },
    [dependents, handleChange]
  );

  const getRelationAwareLabel = useCallback(
    (dependent, labelKey) => {
      return applicationType === "financialAssistance" && dependent?.relationType
        ? `${formatMessage(dependent.relationType)}র ${formatMessage(labelKey)}`
        : formatMessage(labelKey);
    },
    [applicationType, formatMessage]
  );

  const onPickerChange=(v,index) => {
  handleChange(index, "relationType", v);
  
  const employee = formdata?.workforceEmployee;

  handleChange(index, "fatherNameEn", "");
  handleChange(index, "fatherNameBn", "");
  handleChange(index, "motherNameEn", "");
  handleChange(index, "motherNameBn", "");
  handleChange(index, "nameEn", "");
  handleChange(index, "nameBn", "");
  handleChange(index, "presentLocation", null);
  handleChange(index, "permanentLocation", null);
  handleChange(index, "presentAddress", "");
  handleChange(index, "permanentAddress", "");

  if (["workforce.relation.son", "workforce.relation.daughter"].includes(v) && employee) {
    handleChange(index, "fatherNameEn", employee.nameEn);
    handleChange(index, "fatherNameBn", employee.nameBn);
    handleChange(index, "presentLocation", employee.presentLocation);
    handleChange(index, "permanentLocation", employee.presentLocation);
    handleChange(index, "presentAddress", employee.presentAddress);
    handleChange(index, "permanentAddress", employee.presentAddress);

  } else if (["workforce.relation.father"].includes(v) && employee) {
    handleChange(index, "nameEn", employee.fatherNameEn);
    handleChange(index, "nameBn", employee.fatherNameBn);
    handleChange(index, "presentLocation", employee.presentLocation);
    handleChange(index, "permanentLocation", employee.presentLocation);
    handleChange(index, "presentAddress", employee.presentAddress);
    handleChange(index, "permanentAddress", employee.presentAddress);

  } else if (["workforce.relation.mother"].includes(v) && employee) {
    handleChange(index, "nameEn", employee.motherNameEn);
    handleChange(index, "nameBn", employee.motherNameBn);
    handleChange(index, "presentLocation", employee.presentLocation);
    handleChange(index, "permanentLocation", employee.presentLocation);
    handleChange(index, "presentAddress", employee.presentAddress);
    handleChange(index, "permanentAddress", employee.presentAddress);
  }
}


  const isFirstDependentValid = useMemo(() => normalizedDependents?.[0]?.nid && normalizedDependents?.[0]?.nameEn, [normalizedDependents]);

  return (
    <Box mt={1}>
      {normalizedDependents?.map((dependent, index) => (
        <Accordion key={index} expanded={expanded === index} onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={0} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                  {applicationType === "financialAssistance" ? (
                    <FormattedMessage id="workforce.previewDetails.dependent" module="workforce" />
                  ) : (
                    <FormattedMessage id="workforce.application.header.dependent" module="workforce" />
                  )}
                </Typography>
                <Typography>{dependent.nameEn || ""}</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Paper className={classes.paper} elevation={0}>
              <Grid container spacing={2}>
                {applicationType === "financialAssistance" && (
                  <Grid item xs={12}>
                    <RelationWithWorkerPicker
                      value={dependent?.relationType || ""}
                      required
                      onChange={(v) => onPickerChange(v,index)}
                      readOnly={false}
                    />
                  </Grid>
                )}
                <Grid item xs={6}>
                  <TextInput
                    label={getRelationAwareLabel(dependent, "workforce.employee.name.bn")}
                    value={dependent.nameBn || ""}
                    onChange={(v) => handleChange(index, "nameBn", v)}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextInput
                    label={getRelationAwareLabel(dependent, "workforce.employee.name.en")}
                    value={dependent.nameEn || ""}
                    onChange={(v) => handleChange(index, "nameEn", v)}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextInput
                    label={getRelationAwareLabel(dependent, "workforce.employee.fathers_name")}
                    value={dependent.fatherNameEn || ""}
                    onChange={(v) => handleChange(index, "fatherNameEn", v)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextInput
                    label={getRelationAwareLabel(dependent, "workforce.employee.mothers_name")}
                    value={dependent.motherNameEn || ""}
                    onChange={(v) => handleChange(index, "motherNameEn", v)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={getRelationAwareLabel(dependent, "workforce.employee.birthdate")}
                    value={dependent.birthDate || ""}
                    onChange={(v) => handleChange(index, "birthDate", v)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextInput
                    label={getRelationAwareLabel(dependent, "workforce.application.employee.children.nidOrBirthRegistry")}
                    value={dependent.nid || ""}
                    onChange={(v) => handleChange(index, "nid", v)}
                    type="number"
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextInput
                    label={getRelationAwareLabel(dependent, "workforce.employee.phone")}
                    value={dependent.phoneNumber || ""}
                    onChange={(v) => handleChange(index, "phoneNumber", v)}
                    type="number"
                  />
                </Grid>

                {formdata?.organizationType === "cf" && (
                  <Grid item xs={6}>
                    <TextInput
                      label={formatMessage("workforce.employee.percentage_of_cf_grant")}
                      value={dependent.maritalStatus || ""}
                      onChange={(v) => handleChange(index, "maritalStatus", v)}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <b>{formatMessage("workforce.employee.present_location")}</b>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull
                    value={dependent.presentLocation || null}
                    onChange={(v) => handleChange(index, "presentLocation", v)}
                    required
                    split
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomDependentLocation
                    location={dependent?.presentLocation}
                    onChange={(key, value) => handleChange(index, key, value)}
                    addressKey="presentAddress"
                    data={dependent?.presentAddress}
                  />
                </Grid>

                <Grid item xs={12}>
                  <b>{formatMessage("workforce.employee.permanent_location")}</b>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox color="primary" checked={sameAsPresent?.[index] || false} onChange={(e) => handleCheckboxChange(index, e)} />}
                      label={formatMessage("workforce.employee.sameAsPresent")}
                    />
                  </Grid>

                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull
                    value={dependents?.[index]?.permanentLocation || null}
                    onChange={(v) => handleChange(index, "permanentLocation", v)}
                    readOnly={!!sameAsPresent[index]}
                    required
                    split
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomDependentLocation
                    location={dependents?.[index]?.permanentLocation}
                    onChange={(key, value) => handleChange(index, key, value)}
                    addressKey="permanentAddress"
                    data={dependent?.permanentAddress}
                    readOnly={!!sameAsPresent[index]}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography>{formatMessage("workforce.uploadFile.dependent.photo")}</Typography>
                  <FileUploader fieldKey="dependentPhoto" onFileChange={(field, value) => handleChange(index, field, value)} documentType="dependent photo" />
                </Grid>

                <Grid item xs={6}>
                  <Typography>{formatMessage("workforce.uploadFile.dependent.nid_or_birthCcertificate")}</Typography>
                  <FileUploader fieldKey="dependentNid" onFileChange={(field, value) => handleChange(index, field, value)} documentType="dependent nid" />
                </Grid>

                {applicationType === "financialAssistance" && (
                  <Grid item xs={12} className={classes.buttonContainer}>
                    <Button
                      variant="contained"
                      style={{
                        backgroundColor: applicationType !== "financialAssistance" || dependents.length === 1 ? "#B0B0B0" : "#d32f2f",
                        color: "white",
                      }}
                      onClick={() => removeItem(index)}
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
        <Button variant="contained" color="primary" onClick={addItem} disabled={!isFirstDependentValid}>
          <FormattedMessage module="workforce" id="workforce.application.steps.dependentAdd" />
        </Button>
      )}
    </Box>
  );
};

export default EmployeeDependentForm;
