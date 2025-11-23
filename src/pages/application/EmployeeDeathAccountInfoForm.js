import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormHelperText,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, TextInput, PublishedComponent, useTranslations, useModulesManager, decodeId } from "@openimis/fe-core";
import BranchPicker from "../../pickers/BranchPicker";
import MobileBankingPicker from "../../pickers/MobileBankingPicker";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSelector, useDispatch } from "react-redux";
import { fetchDependent, fetchEmployeeDependent } from "../../actions";
import DistrictBanks from "../../pickers/DistrictBanks";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";
import { isAtLeast18YearsOld, safeDecodeId } from "../../utils/utils";
import ParentDependentPicker from "../../pickers/ParentDependentPicker";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
  },
}));

const EmployeeDeathAccountInfoForm = ({ formdata, accounts, handleChange, addItem, removeItem, expanded, setExpanded, applicationId, errors }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const dependent = useSelector((state) => state.workforce.workforceDependent);

  // Fetch dependents if application exists
  useEffect(() => {
    if (applicationId && applicationId[0]?.id) {
      setLoading(true);
      dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${safeDecodeId(applicationId[0].id)}"`])).then((res) =>
        console.log("from account dependent", res)
      );
      setLoading(false);
    }
  }, [applicationId]);

  if (loading) return <b>Loading...</b>;

  // Autofill account holder names from dependents or employee
  useEffect(() => {
    if (dependent?.length > 0) {
      setExpanded(0);
      dependent?.map((dep, index) => {handleChange(index, "accountHolderName", dep?.nameBn);handleChange(index, "dependentId", dep?.id)});
    } else {
      handleChange(0, "accountHolderName", formdata?.workforceEmployee?.nameBn);
    }
  }, [dependent]);

  // simplified flat update handler
  const handleAccountChange = (index, key, value, nestedKey = null) => {
    console.log(dependent);
    const isDependent = Array.isArray(dependent) && dependent.length > 0;
    const dependentId = isDependent ? dependent?.[index]?.id : null;

    const baseAccount = {
      ...(accounts[index] || {}),
      applicant_type: isDependent ? "dependent" : "applicant",
      ...(isDependent && { id: dependentId }),
    };

    if (nestedKey) {
      handleChange(index, key, {
        ...(baseAccount[key] || {}),
        [nestedKey]: value,
      });
    } else {
      handleChange(index, key, value);
    }

    handleChange(index, "applicant_type", isDependent ? "dependent" : "applicant");

    if (isDependent && dependentId) {
      handleChange(index, "id", dependentId);
    }
  };

  const allowAdd = !applicationId || !applicationId[0]?.id;

  console.log({dependent})

  return (
    <Box mt={1}>
      <Typography mb={4} style={{ textAlign: "center", fontWeight: "bold", fontSize: "small", margin: "15px" }}>
        <FormattedMessage id="workforce.application.steps.account.info" module="workforce" />
      </Typography>

      {(dependent?.length > 0 ? dependent : [{}]).map((dependentValue, index) => {
        const account = accounts[index] || {};
        const accountType = account?.accountType || "bank";

        // 🎯 New field: whose account?
        const accountHolderType = account?.accountHolderType || "self";

        return (
          <Accordion key={index} expanded={expanded === index} onChange={() => setExpanded(expanded === index ? false : index)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                {dependentValue?.nameBn} {dependentValue?.nameBn && "এর"}{" "}
                {<FormattedMessage id="workforce.previewDetails.employeeBankInfo" defaultMessage={`Bank Account ${index + 1}`} />}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {/* ⭐ NEW RADIO GROUP */}
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                      <FormattedMessage id={"workforce.employee.whoseAccount"} />
                    </Typography>

                    <RadioGroup row value={accountHolderType} onChange={(e) => handleAccountChange(index, "accountHolderType", e.target.value)}>
                      <FormControlLabel value="self" control={<Radio color="primary" />} label={<FormattedMessage id={"workforce.employee.account.self"} />} />
                      <FormControlLabel
                        value="select_from_another_dependent"
                        control={<Radio color="primary" />}
                        label={<FormattedMessage id={"workforce.employee.account.dependent"} />}
                      />
                      <FormControlLabel
                        value="other"
                        control={<Radio color="primary" />}
                        label={<FormattedMessage id={"workforce.employee.account.other"} />}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* ⭐ If selecting another dependent */}
                {accountHolderType === "select_from_another_dependent" && (
                  <Grid item xs={12}>
                    <ParentDependentPicker
                      value={account.parentDependentId || ""}
                      onChange={(v) => handleAccountChange(index, "parentDependentId", v)}
                      options={dependent
                        ?.filter((d, i) => i !== index)
                        ?.map((dep) => ({
                          id: dep.id,
                          nameEn: dep.nameEn,
                          nameBn: dep.nameBn,
                        }))}
                    />
                  </Grid>
                )}

                {/* ⭐ If self or other → show existing UI */}
                {accountHolderType !== "select_from_another_dependent" && (
                  <>
                    {/* Account Type Selection */}
                    <Grid item xs={12}>
                      <Paper className={classes.paper} elevation={0}>
                        <FormControl component="fieldset">
                          <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                            <FormattedMessage id="workforce.account.selection.type" defaultMessage="Select Account Type" />
                          </Typography>

                          <RadioGroup row value={accountType} onChange={(e) => handleAccountChange(index, "accountType", e.target.value)}>
                            <FormControlLabel
                              value="bank"
                              control={<Radio color="primary" />}
                              label={<FormattedMessage id="workforce.application.account.bank" />}
                            />
                            <FormControlLabel
                              disabled={true}
                              value="mobile"
                              control={<Radio color="primary" />}
                              label={<FormattedMessage id="workforce.application.account.mobile" />}
                            />
                          </RadioGroup>
                        </FormControl>

                        {/* Bank UI */}
                        {accountType === "bank" && (
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <PublishedComponent
                                pubRef="workforce.BanksPicker"
                                value={account?.bank?.id || null}
                                label={<FormattedMessage id="workforce.bank.picker" />}
                                onChange={(v) => handleAccountChange(index, "bank", v)}
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <DistrictBanks
                                id="districtBank"
                                value={account?.district || null}
                                bankId={account?.bank?.bankCode}
                                label={<FormattedMessage id="workforce.district.branch.picker" />}
                                onChange={(v) => handleAccountChange(index, "district", v)}
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <BranchPicker
                                id="branch"
                                value={account?.branch || ""}
                                bankId={account?.bank?.bankCode}
                                districtName={account?.district?.districtNameBn}
                                label={<FormattedMessage id="workforce.branch.picker" />}
                                onChange={(v) => handleAccountChange(index, "branch", v)}
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <TextInput
                                id="accountHolderName"
                                label="workforce.employee.account.info.accountHolderName"
                                value={account?.accountHolderName || dependent?.[index]?.nameBn || formdata?.workforceEmployee?.nameBn}
                                onChange={(v) => handleAccountChange(index, "accountHolderName", v)}
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <TextInput
                                id="routingNumber"
                                label="workforce.employee.account.info.routingNumber"
                                value={account?.branch?.routingNumber || ""}
                                onChange={(v) => handleAccountChange(index, "routingNumber", v)}
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <TextInput
                                id="accountNumber"
                                label="workforce.employee.account.info.accountNumber"
                                value={account?.accountNumber || ""}
                                onChange={(v) => handleAccountChange(index, "accountNumber", v)}
                                required
                              />
                            </Grid>
                          </Grid>
                        )}

                        {/* ⭐ Extra fields when accountHolderType === other */}
                        {accountHolderType === "other" && (
                          <Grid container spacing={2} style={{ marginTop: 12 }}>
                            <Grid item xs={6}>
                              <TextInput
                                id="relationshipWithAccountHolder"
                                label="workforce.employee.account.info.relationshipWithAccountHolder"
                                value={account.relationshipWithAccountHolder || ""}
                                onChange={(v) => handleAccountChange(index, "relationshipWithAccountHolder", v)}
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <TextInput
                                id="otherAccountHolderNid"
                                label="workforce.employee.account.info.accountHolderNid"
                                value={account.otherAccountHolderNid || ""}
                                onChange={(v) => handleAccountChange(index, "otherAccountHolderNid", v)}
                                required
                              />
                            </Grid>

                            <Grid item xs={6}>
                              {/* <TextInput
                                id="otherAccountHolderDob"
                                label="workforce.employee.account.info.accountHolderDob"
                                value={account.otherAccountHolderDob || ""}
                                onChange={(v) => handleAccountChange(index, "otherAccountHolderDob", v)}
                                required
                              /> */}
                              <PublishedComponent
                                pubRef="workforce.DatePicker"
                                label={"workforce.employee.account.info.accountHolderDob"}
                                value={account.otherAccountHolderDob || ""}
                                onChange={(v) => handleAccountChange(index, "otherAccountHolderDob", v)}
                                readOnly={false}
                                required
                              />
                              {errors.rdmp && <FormHelperText error>{formatMessage(errors?.rdmp)}</FormHelperText>}
                            </Grid>
                          </Grid>
                        )}

                        <Divider style={{ margin: "16px 0" }} />

                        <Button variant="contained" color="secondary" onClick={() => removeItem(index)} disabled={!allowAdd}>
                          <FormattedMessage id="workforce.application.steps.skip" defaultMessage="Remove Account" />
                        </Button>
                      </Paper>
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>

            <EmployeeDetailsForm2
              handleChange={()=>{}}
              formData={formdata}
              selectedApplicationType={formdata.applicationType}
              formStepNo={"employeeBankInfo"}
            />
          </Accordion>
        );
      })}
    </Box>
  );
};

export default EmployeeDeathAccountInfoForm;
