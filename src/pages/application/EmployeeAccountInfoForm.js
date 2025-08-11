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
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, TextInput, PublishedComponent, useTranslations, useModulesManager, decodeId } from "@openimis/fe-core";
import BranchPicker from "../../pickers/BranchPicker";
import MobileBankingPicker from "../../pickers/MobileBankingPicker";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useSelector, useDispatch } from "react-redux";
import { fetchDependent, fetchEmployeeDependent } from "../../actions";

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

const EmployeeAccountInfoForm = ({ formdata, accounts, handleChange, addItem, removeItem, expanded, setExpanded, applicationId }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const [loading, setLoading] = useState(false);
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const dispatch = useDispatch();

  const [showAccounts, setShowAccounts] = useState([{}]); // Local array to control visible accounts

  const dependent = useSelector((state) => state.workforce.workforceDependent);

  useEffect(() => {
    console.log('abc',applicationId)
    if (applicationId && applicationId[0]?.id) {
      setLoading(true);
      dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${decodeId(applicationId[0].id)}"`]));
      setLoading(false);
    }
  }, [applicationId]);
  if (loading) return <b>Loading ...</b>;

  useEffect(() => {
    if (dependent?.length > 0) {
      setExpanded(0);
    }
  }, [dependent]);

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
  console.log({ applicationId });
  console.log({ dependent });
  return (
    <Box mt={1}>
      <Typography mb={4} style={{textAlign:"center",fontWeight:"bold",fontSize:"small",margin:"15px"}}>
                      <FormattedMessage id="workforce.application.steps.account.info" module="workforce" />
      </Typography>
      {(dependent?.length > 0 ? dependent : [{}]).map((dependentValue, index) => {
        const account = accounts[index] || {};
        const accountType = account?.accountType || "bank";

        return (
          <Accordion key={index} expanded={expanded === index} onChange={() => setExpanded(expanded === index ? false : index)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
                {dependentValue?.nameBn} {dependentValue?.nameBn && "এর"}  {<FormattedMessage id="workforce.previewDetails.employeeBankInfo" defaultMessage={`Bank Account ${index + 1}`} />}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
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
                          value="mobile"
                          control={<Radio color="primary" />}
                          label={<FormattedMessage id="workforce.application.account.mobile" />}
                        />
                      </RadioGroup>
                    </FormControl>

                    {accountType === "mobile" && (
                      <Grid container spacing={2}>
                        <Grid item xs={6} className={classes.item}>
                          <MobileBankingPicker
                            value={account?.bankingOptions || ""}
                            label={<FormattedMessage id="workforce.application.account.mobile.operator" />}
                            onChange={(v) => handleAccountChange(index, "bankingOptions", v)}
                            required
                            readOnly={false}
                          />
                        </Grid>
                        <Grid item xs={6} className={classes.item}>
                          <TextInput
                            label="workforce.employee.account.info.mobileNumber"
                            value={account?.accountNumber || ""}
                            onChange={(v) => handleAccountChange(index, "accountNumber", v)}
                            required
                            readOnly={false}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {accountType === "bank" && (
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={6} className={classes.item}>
                            <PublishedComponent
                              pubRef="workforce.BanksPicker"
                              value={account?.bank?.id || null}
                              label={<FormattedMessage id="workforce.bank.picker" />}
                              onChange={(v) => handleAccountChange(index, "bank", v)}
                              required
                              readOnly={false}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <BranchPicker
                              value={account?.branch?.id || ""}
                              label={<FormattedMessage id="workforce.branch.picker" />}
                              bankId={account?.bank?.bankCode}
                              onChange={(v) => handleAccountChange(index, "branch", v)}
                              required
                              readOnly={false}
                            />
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="workforce.employee.account.info.accountHolderName"
                              value={account?.accountHolderName || dependent?.[index]?.nameBn || ""}
                              onChange={(v) => handleAccountChange(index, "accountHolderName", v)}
                              required
                              readOnly={false}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="workforce.employee.account.info.routingNumber"
                              value={account?.branch?.routingNumber || ""}
                              onChange={(v) => handleAccountChange(index, "routingNumber", v)}
                              readOnly={true}
                              required
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="workforce.employee.account.info.accountNumber"
                              value={account?.accountNumber || ""}
                              onChange={(v) => handleAccountChange(index, "accountNumber", v)}
                              required
                              readOnly={false}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}

                    <Divider style={{ margin: "16px 0" }} />
                    <Box className={classes.buttonContainer}>
                      <Button variant="contained" color="secondary" onClick={() => removeItem(index)} disabled={showAccounts.length === 1 || !allowAdd}>
                        <FormattedMessage id="workforce.application.steps.skip" defaultMessage="Remove Account" />
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
      {/* {allowAdd && (
        <Button variant="contained" color="primary" onClick={addItem}>
          <FormattedMessage id="workforce.account.add" defaultMessage="Add Account" />
        </Button>
      )} */}
    </Box>
  );
};

export default EmployeeAccountInfoForm;
