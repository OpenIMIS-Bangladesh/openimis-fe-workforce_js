import React, { useEffect, useState } from "react";
import { Grid, Box, Paper, Button, Typography, Divider, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { TextInput, PublishedComponent, FormattedMessage, useTranslations, useModulesManager } from "@openimis/fe-core";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import RelationWithWorkerPicker from "../../pickers/RelationWithWorkerPicker";
import FileUploader from "../../pickers/FileUploader";
import CustomDetailedLocation from "../../components/application-forms/CustomDetailedLocation";

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
  applicationType,
  dependents,
  handleChange,
  addItem,
  removeItem,
  expanded,
  setExpanded,
  formData,
  // handleChange,
}) => {
  // Normalize dependents to always be an array
  // const normalizedDependents = Array.isArray(dependents) ? dependents : dependents ? [dependents] : [{}];

  const classes = useStyles();
  // const [expanded, setExpanded] = useState(0);
  const modulesManager = useModulesManager();

  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const isFirstDependentValid = normalizedDependents?.[0]?.nid && normalizedDependents?.[0]?.nameEn;

  const getRelationAwareLabel = (formData, labelKey) => {
    return applicationType === "financialAssistance" && formData?.relationType
      ? `${formatMessage(formData.relationType)}র ${formatMessage(labelKey)}`
      : formatMessage(labelKey);
  };
  const [sameAsPresent, setSameAsPresent] = useState([]);

  // Sync permanent fields when checkbox is checked
 const normalizedDependents = Array.isArray(dependents)
    ? dependents
    : dependents
    ? [dependents]
    : [];

  // Initialize sameAsPresent for each dependent (or single entry)
  useEffect(() => {
    if (Array.isArray(normalizedDependents)) {
      setSameAsPresent((prev) =>
        normalizedDependents.map((_, index) => prev?.[index] || false)
      );
    }
  }, [dependents]);

  const handleCheckboxChange = (index, e) => {
    const isChecked = e.target.checked;

    setSameAsPresent((prev) => {
      const updated = [...(prev || [])];
      updated[index] = isChecked;
      return updated;
    });

    if (isChecked) {
      const presentLocation = formData?.presentLocation || null;
      const presentAddress = formData?.presentAddress || "";

      handleChange(`permanentLocation[${index}]`, presentLocation);
      handleChange(`permanentAddress[${index}]`, presentAddress);
    } else {
      handleChange(`permanentLocation[${index}]`, null);
      handleChange(`permanentAddress[${index}]`, "");
    }
  };

  const isCityLocation = (locationObj) => {
    let current = locationObj;

    while (current) {
      if (current.name && current.name.includes("সিটি কর্পোরেশন")) {
        return true; // it's a city
      }
      current = current.parent;
    }

    return false; // not a city
  };

  return (
    <Box mt={1}>
      {normalizedDependents?.map((formData, index) => (
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
                <Typography>{formData.nameEn || ""}</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Paper className={classes.paper} elevation={0}>
              <Grid container className={classes.item} spacing={2}>
                {applicationType === "financialAssistance" && (
                  <Grid item xs={12}>
                    <RelationWithWorkerPicker
                      value={formData?.relationType || ""}
                      required
                      onChange={(v) => handleChange(index, "relationType", v)}
                      readOnly={false}
                    />
                  </Grid>
                )}
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={getRelationAwareLabel(formData, "workforce.employee.name.bn")}
                    value={formData.nameBn || ""}
                    onChange={(v) => handleChange(index, "nameBn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={getRelationAwareLabel(formData, "workforce.employee.name.en")}
                    value={formData.nameEn || ""}
                    onChange={(v) => handleChange(index, "nameEn", v)}
                    required
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={getRelationAwareLabel(formData, "workforce.employee.fathers_name")}
                    value={formData.fatherNameEn || ""}
                    onChange={(v) => handleChange(index, "fatherNameEn", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={getRelationAwareLabel(formData, "workforce.employee.mothers_name")}
                    value={formData.motherNameEn || ""}
                    onChange={(v) => handleChange(index, "motherNameEn", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={getRelationAwareLabel(formData, "workforce.employee.birthdate")}
                    value={formData.birthDate || ""}
                    onChange={(v) => handleChange(index, "birthDate", v)}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={getRelationAwareLabel(formData, "workforce.application.employee.children.nidOrBirthRegistry")}
                    value={formData.nid || ""}
                    onChange={(v) => handleChange(index, "nid", v)}
                    type={"number"}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={getRelationAwareLabel(formData, "workforce.employee.phone")}
                    value={formData.phoneNumber || ""}
                    onChange={(v) => handleChange(index, "phoneNumber", v)}
                    type={"number"}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label={getRelationAwareLabel(formData, "workforce.employee.percentage_of_cf_grant")}
                    value={formData.maritalStatus || ""}
                    onChange={(v) => handleChange(index, "maritalStatus", v)}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={12}>
                  <b>{formatMessage("workforce.employee.present_location")}</b>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={formData.presentLocation || null}
                    onChange={(v) => handleChange(index, "presentLocation", v)}
                    readOnly={false}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomDetailedLocation
                    locationType={isCityLocation(formData?.presentLocation) ? "city" : "rural"}
                    onChange={handleChange}
                    addressKey="presentAddress"
                    data={formData}
                    readOnly={false}
                  />
                </Grid>

                {/* ✅ Permanent Location (conditional readOnly) */}
                <Grid item xs={12}>
                  <b>{formatMessage("workforce.employee.permanent_location")}</b>
                  {/* ✅ Same as Present Location Checkbox */}
                  {normalizedDependents.map((_, index) => (
        <Grid item xs={12} key={index}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={sameAsPresent?.[index] || false}
                onChange={(e) => handleCheckboxChange(index, e)}
              />
            }
            label={formatMessage("workforce.employee.sameAsPresent")}
          />
        </Grid>
      ))}

                  <Grid item xs={12}>
                    <PublishedComponent
                      pubRef="location.DetailedLocation"
                      withNull={true}
                      value={formData.permanentLocation || null}
                      onChange={(v) => handleChange(index, "permanentLocation", v)}
                      readOnly={!!sameAsPresent[index]}
                      required
                      split={true}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <CustomDetailedLocation
                    locationType={isCityLocation(formData?.permanentAddress) ? "city" : "rural"}
                    onChange={handleChange}
                    addressKey="permanentAddress"
                    data={formData}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography>{formatMessage("workforce.uploadFile.dependent.photo")}</Typography>
                  <FileUploader
                    fieldKey={"dependentPhoto"}
                    onFileChange={(field, value) => handleChange(index, field, value)}
                    documentType={"dependent photo"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography>{formatMessage("workforce.uploadFile.dependent.nid_or_birthCcertificate")}</Typography>
                  <FileUploader fieldKey={"dependentNid"} onFileChange={(field, value) => handleChange(index, field, value)} documentType={"dependent nid"} />
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
