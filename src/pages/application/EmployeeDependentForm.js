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
import { getRelationForApi, isBlwfPath, isCfPath, isVerify, normalizeNumberInput } from "../../utils/utils";

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
        ? `${formatMessage(dependent.relationType+".suffix")} ${formatMessage(labelKey)}`
        : formatMessage(labelKey);
    },
    [applicationType, formatMessage],
  );

  const handleAttachmentChange = useCallback(
    (index, fieldKey, value) => {
      const normalizeAttachments = (attachments) => {
        if (!attachments) return [];
        if (typeof attachments === "string") {
          try {
            const parsed = JSON.parse(attachments);
            return Array.isArray(parsed) ? parsed : [];
          } catch (error) {
            return [];
          }
        }
        return Array.isArray(attachments) ? attachments : [];
      };

      handleChange(index, "attachments", (currentAttachments) => {
        const normalizedAttachments = normalizeAttachments(currentAttachments);

        if (!value?.files?.length) {
          return normalizedAttachments.filter((att) => att.fieldKey !== fieldKey);
        }

        return normalizedAttachments.some((att) => att.fieldKey === fieldKey)
          ? normalizedAttachments.map((att) =>
              att.fieldKey === fieldKey
                ? {
                    ...att,
                    fieldKey,
                    files: value.files,
                    documentType: value.documentType,
                    documentPropId: value.documentPropId,
                  }
                : att,
            )
          : [
              ...normalizedAttachments,
              {
                fieldKey,
                files: value.files,
                documentType: value.documentType,
                documentPropId: value.documentPropId,
              },
            ];
      });
    },
    [handleChange],
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
        const isVerified = isVerify()
        const workerBirthDate =isVerified?formdata?.deceasedWorkerInfo?.birthDate: formdata?.workforceEmployee?.birthDate;
        // const isEligible =dependent?.isEligible?dependent?.isEligible: getRelationForApi(normalizedDependents[index], workerBirthDate);
        const isEligible =getRelationForApi(normalizedDependents[index], workerBirthDate);
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
                    ) :isBlwfPath()? (
                      <FormattedMessage id="workforce.application.subHeader.dependent.blwf" module="workforce" />
                    ): (
                      <FormattedMessage id="workforce.application.subHeader.dependent" module="workforce" />
                    )}
                  </Typography>
                  <Typography>{dependent.nameEn || ""}</Typography>
                </Grid>

                <Grid item xs={4} sm={3} style={{ textAlign: "right", paddingRight: "8px" }}>
                  {hasData && !isEligible && (
                    <Typography
                      variant="caption"
                      style={{
                        fontWeight: "bold",
                        color: isEligible ? "#2e7d32" : "#d32f2f", 
                        border: `1px solid ${isEligible ? "#2e7d32" : "#d32f2f"}`,
                        backgroundColor: isEligible ? "rgba(46, 125, 50, 0.04)" : "rgba(211, 47, 47, 0.04)", 
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "inline-block", 
                      }}
                    >
                      {!isEligible && <FormattedMessage id="workforce.dependent.eis.inEligible" />}
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
                      formatInput={(val) => (val || "").toString().replace(/\D/g, "").slice(0, 17)}
                      type="text"
                      inputProps={{ inputMode: "numeric", pattern: "[0-9০-৯]*" }}
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
                        id="percentage_of_grant"
                        label={
                          formdata?.organizationType === "eis"
                            ? formatMessage("workforce.employee.eis.percentage_of_cf_grant")
                            : formatMessage("workforce.employee.percentage_of_cf_grant")
                        }
                        value={dependent?.percentageOfCfGrant||dependent?.percentage_of_grant || ""}
                        onChange={(v) => handleChange(index, "percentage_of_grant", normalizeNumberInput(v))}
                        required
                        error={!!errors.percentage_of_grant}
                        helperText={errors.percentage_of_grant}
                      />
                    </Grid>
                  )}

                  {formdata?.organizationType === "eis" &&
                    ((dependent?.relationType||dependent?.relationWithWorker) === "workforce.relation.son" || (dependent?.relationType||dependent?.relationWithWorker) === "workforce.relation.daughter") && (
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
                      errors={errors}
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
          {
            isCfPath() || isBlwfPath() ? (
              <FormattedMessage id="workforce.application.steps.warishAdd" defaultMessage="Add Nominee" />
            ) : (
              <FormattedMessage id="workforce.application.steps.dependentAdd" defaultMessage="Add New Dependent" />
            )
          }
        </Button>
      )}
    </Box>
  );
};

export default EmployeeDependentForm;
