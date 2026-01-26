import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  FormControlLabel,
  Checkbox,
  FormHelperText,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { TextInput, PublishedComponent, FormattedMessage, useTranslations, useModulesManager } from "@openimis/fe-core";
import RelationWithWorkerPicker from "../../pickers/RelationWithWorkerPicker";
import FileUploader from "../../pickers/FileUploader";
import CustomDependentLocation from "../../components/application-forms/CustomDependentLocation";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import { getRelationForApi } from "../../utils/utils";

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

const EmployeeDependentForm = ({ applicationType, dependents, handleChange, addItem, removeItem, expanded, setExpanded, formdata, errors }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const locale = useSelector((state) => state.core?.user?.i_user?.language);

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
    [dependents, handleChange],
  );

  const getRelationAwareLabel = useCallback(
    (dependent, labelKey) => {
      return applicationType === "financialAssistance" && dependent?.relationType
        ? `${formatMessage(dependent.relationType)}${formatMessage("worforce.dependent.suffix")} ${formatMessage(labelKey)}`
        : formatMessage(labelKey);
    },
    [applicationType, formatMessage],
  );

  const handleAttachmentChange = useCallback(
    (index, fieldKey, value) => {
      const currentAttachments = typeof dependents?.[index]?.attachments ==="string"? JSON.parse(dependents?.[index]?.attachments):dependents?.[index]?.attachments || [];

      const updatedAttachments = currentAttachments?.some((att) => att.fieldKey === fieldKey)
        ? currentAttachments.map((att) =>
            att.fieldKey === fieldKey
              ? {
                  ...att,
                  fieldKey,
                  files: value.files, // [{ file, uploadInfo }]
                  documentType: value.documentType,
                  documentPropId: value.documentPropId,
                }
              : att,
          )
        : [
            ...currentAttachments,
            {
              fieldKey,
              files: value.files, // [{ file, uploadInfo }]
              documentType: value.documentType,
              documentPropId: value.documentPropId,
            },
          ];

      handleChange(index, "attachments", updatedAttachments);
    },
    [dependents, handleChange],
  );

  const onPickerChange = (v, index) => {
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

    if (v === formdata?.workforceApplicant?.relationWithApplicant) {
      handleChange(index, "birthDate", formdata?.workforceApplicant?.birthDate);
      handleChange(index, "phoneNumber", formdata?.workforceApplicant?.phoneNumber);
      handleChange(index, "nameEn", formdata?.workforceApplicant?.nameEn);
      handleChange(index, "nameBn", formdata?.workforceApplicant?.nameBn);
      handleChange(index, "fatherNameEn", formdata?.workforceApplicant?.fatherNameEn);
      handleChange(index, "fatherNameBn", formdata?.workforceApplicant?.fatherNameBn);
      handleChange(index, "motherNameEn", formdata?.workforceApplicant?.motherNameEn);
      handleChange(index, "motherNameBn", formdata?.workforceApplicant?.motherNameBn);
      handleChange(index, "nid", formdata?.workforceApplicant?.nid);
      handleChange(index, "presentLocation", formdata?.workforceApplicant?.presentLocation);
      handleChange(index, "permanentLocation", formdata?.workforceApplicant?.permanentLocation);
      handleChange(index, "presentAddress", formdata?.workforceApplicant?.presentAddress);
      handleChange(index, "permanentAddress", formdata?.workforceApplicant?.permanentAddress);
    } else if (["workforce.relation.son", "workforce.relation.daughter"].includes(v) && employee) {
      handleChange(index, "fatherNameEn", employee.nameEn);
      handleChange(index, "fatherNameBn", employee.nameBn);
      handleChange(index, "presentLocation", employee.presentLocation);
      handleChange(index, "permanentLocation", employee.permanentLocation);
      handleChange(index, "presentAddress", employee.presentAddress);
      handleChange(index, "permanentAddress", employee.permanentAddress);
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
  };

  const isFirstDependentValid = useMemo(() => normalizedDependents?.[0]?.nid && normalizedDependents?.[0]?.nameEn, [normalizedDependents]);

  return (
    <Box mt={1}>
      {normalizedDependents?.map((dependent, index) => {
        const isFatherSelected = normalizedDependents.find((d) => d.relationType === "workforce.relation.father");
        const previousRelation = index > 0 && isFatherSelected != null ? "workforce.relation.father" : null;
        const workerBirthDate = formdata?.workforceEmployee?.birthDate || formdata?.deceasedWorkerInfo?.birthDate;
        const isEligible =dependent?.isEligible?dependent?.isEligible: getRelationForApi(normalizedDependents[index], workerBirthDate);
        console.log("Single Beneficiary", dependent);
        console.log({ isEligible });
        const hasData = (dependent?.relationType || dependent?.relationWithWorker) && (dependent?.birthDate || dependent?.nid);
        return (
          <Accordion key={index} expanded={expanded === index} onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={0} alignItems="center" justifyContent="space-between">
                <Grid item xs={8} sm={9}>
                  <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                    {applicationType === "financialAssistance" && formdata?.organizationType !== "eis" ? (
                      <FormattedMessage id="workforce.previewDetails.dependent" module="workforce" />
                    ) : formdata.organizationType === "eis" ? (
                      <FormattedMessage id="workforce.previewDetails.eis.dependent" module="workforce" />
                    ) : (
                      <FormattedMessage id="workforce.application.subHeader.dependent" module="workforce" />
                    )}
                  </Typography>
                  <Typography>{dependent.nameEn || ""}</Typography>
                </Grid>

                <Grid item xs={4} sm={3} style={{ textAlign: "right", paddingRight: "8px" }}>
                  {/* Only show the badge if there is enough data to make a decision, or remove 'hasData' to always show it */}
                  {hasData && (
                    <Typography
                      variant="caption"
                      style={{
                        fontWeight: "bold",
                        // 2. Use the calculated variable here
                        color: isEligible ? "#2e7d32" : "#d32f2f", // Darker Green : Red
                        border: `1px solid ${isEligible ? "#2e7d32" : "#d32f2f"}`,
                        backgroundColor: isEligible ? "rgba(46, 125, 50, 0.04)" : "rgba(211, 47, 47, 0.04)", // Light background for better UI
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "inline-block", // Ensures padding works correctly
                      }}
                    >
                      {/* 3. Use the calculated variable for text */}
                      {isEligible ? <FormattedMessage id="workforce.dependent.eis.eligible" /> : <FormattedMessage id="workforce.dependent.eis.inEligible" />}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Paper className={classes.paper} elevation={0}>
                <Grid container spacing={2}>
                  {/* {applicationType === "financialAssistance" && ( */}
                  <Grid item xs={12}>
                    <RelationWithWorkerPicker
                      id="relationType"
                      value={dependent?.relationType || dependent?.relationWithWorker || ""}
                      required
                      onChange={(v) => onPickerChange(v, index)}
                      readOnly={false}
                      excludeRelation={previousRelation}
                    />
                    {errors.relationType && <FormHelperText error>{errors.relationType}</FormHelperText>}
                  </Grid>
                  {/* )} */}
                  <Grid item xs={6}>
                    <TextInput
                      id="nameBn"
                      label={getRelationAwareLabel(dependent, "workforce.employee.name.bn")}
                      value={dependent.nameBn || ""}
                      onChange={(v) => handleChange(index, "nameBn", v)}
                      required
                      error={!!errors.nameBn}
                      helperText={errors.nameBn}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextInput
                      id="nameEn"
                      label={getRelationAwareLabel(dependent, "workforce.employee.name.en")}
                      value={dependent.nameEn || ""}
                      onChange={(v) => handleChange(index, "nameEn", v)}
                      required
                      error={!!errors.nameEn}
                      helperText={errors.nameEn}
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
                      required
                      onChange={(v) => handleChange(index, "birthDate", v)}
                    />
                    {errors.rdmp && (
                      <FormHelperText error>
                        <FormattedMessage id={errors.rdmp} />
                      </FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <TextInput
                      id="nid"
                      label={getRelationAwareLabel(dependent, "workforce.application.employee.children.nidOrBirthRegistry")}
                      value={dependent.nid || ""}
                      onChange={(v) => handleChange(index, "nid", v)}
                      type="number"
                      required
                      error={!!errors.nid}
                      helperText={errors.nid}
                    />
                    {errors.nid && (
                      <FormHelperText error>
                        <FormattedMessage id={errors.nid} />
                      </FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <TextInput
                      label={getRelationAwareLabel(dependent, "workforce.employee.phone")}
                      value={dependent.phoneNumber || ""}
                      onChange={(v) => handleChange(index, "phoneNumber", v)}
                      type="number"
                    />
                    {dependent?.phoneNumber?.length != 11 && (
                      <FormHelperText error>
                        <FormattedMessage id="core.error.phoneNumberLength" />
                      </FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <EmployeeMaritalStatusPicker
                      id="maritalStatus"
                      value={dependent?.maritalStatus || ""}
                      label={<FormattedMessage id="workforce.employee.marital_status" module="workforce" />}
                      required
                      onChange={(v) => handleChange(index, "maritalStatus", v)}
                      readOnly={false}
                    />
                    {errors.maritalStatus && <FormHelperText error>{errors.maritalStatus}</FormHelperText>}
                  </Grid>

                  {formdata?.organizationType === "cf" && formdata?.applicationType === "financialAssistance" && (
                    <Grid item xs={6}>
                      <TextInput
                        label={
                          formdata?.organizationType === "eis"
                            ? formatMessage("workforce.employee.eis.percentage_of_cf_grant")
                            : formatMessage("workforce.employee.percentage_of_cf_grant")
                        }
                        value={dependent.percentage_of_grant || ""}
                        onChange={(v) => handleChange(index, "percentage_of_grant", v)}
                      />
                    </Grid>
                  )}

                  {formdata?.organizationType === "eis" &&
                    (dependent?.relationType === "workforce.relation.son" || dependent?.relationType === "workforce.relation.daughter") && (
                      <>
                        <Grid item xs={6} className={classes.item}>
                          <FormControl component="fieldset">
                            <FormLabel>
                              <FormattedMessage id="workforce.dependent.isDisabled" defaultMessage="Is the dependent disabled?" module="workforce" />
                            </FormLabel>

                            <RadioGroup
                              row
                              value={dependent?.isDisabled || "no"}
                              onChange={(e) => handleChange(index, "isDisabled", e.target.value)}
                              defaultValue={"no"}
                            >
                              <FormControlLabel
                                value="yes"
                                control={<Radio color="primary" />}
                                label={<FormattedMessage id="workforce.application.permission.yes" module="workforce" />}
                              />
                              <FormControlLabel
                                value="no"
                                control={<Radio color="primary" />}
                                label={<FormattedMessage id="workforce.application.permission.no" module="workforce" />}
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        {dependent?.isDisabled === "yes" && (
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              id="disabilityType"
                              label={formatMessage("workforce.dependent.disabilityType") || "Describe disability"}
                              value={dependent.disabilityType || ""}
                              onChange={(v) => handleChange(index, "disabilityType", v)}
                              required
                              error={!!errors?.disabilityType}
                              helperText={errors?.disabilityType}
                            />
                          </Grid>
                        )}
                      </>
                    )}

                  <Grid item xs={12}>
                    <b>{formatMessage("workforce.employee.present_location")}</b>
                    <PublishedComponent
                      pubRef="location.DetailedLocation"
                      withNull
                      value={dependents?.[index]?.presentLocation || null}
                      onChange={(v) => handleChange(index, "presentLocation", v)}
                      required
                      split
                    />
                    {errors?.detailedLocation && <FormHelperText error>{errors?.detailedLocation}</FormHelperText>}
                  </Grid>

                  <Grid item xs={12}>
                    <CustomDependentLocation
                      location={dependents?.[index]?.presentLocation}
                      onChange={(key, value) => handleChange(index, key, value)}
                      addressKey="presentAddress"
                      data={dependents?.[index]?.presentAddress}
                      locationData={dependents?.[index]?.presentLocation}
                      errors={errors}
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
                    {errors?.detailedLocation && <FormHelperText error>{errors?.detailedLocation}</FormHelperText>}
                  </Grid>

                  <Grid item xs={12}>
                    <CustomDependentLocation
                      location={dependents?.[index]?.permanentLocation}
                      onChange={(key, value) => handleChange(index, key, value)}
                      addressKey="permanentAddress"
                      data={dependents?.[index]?.permanentAddress}
                      readOnly={!!sameAsPresent[index]}
                      locationData={dependents?.[index]?.permanentLocation}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <EmployeeDetailsForm2
                      handleChange={(fieldKey, value) => handleAttachmentChange(index, fieldKey, value)}
                      formData={formdata}
                      selectedApplicationType={applicationType}
                      isDisabled={dependent?.isDisabled}
                      formStepNo={"employeeDependentInfo"}
                      dependentIndex={index}
                    />
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
        );
      })}

      {applicationType === "financialAssistance" && (
        <Button variant="contained" color="primary" onClick={addItem} disabled={!isFirstDependentValid}>
          <FormattedMessage module="workforce" id="workforce.application.steps.dependentAdd" />
        </Button>
      )}
    </Box>
  );
};

export default EmployeeDependentForm;
