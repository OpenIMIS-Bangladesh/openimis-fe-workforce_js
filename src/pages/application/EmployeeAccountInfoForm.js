import React, { useState } from "react";
import { Grid, Box, Paper, Typography, Divider, FormControl, FormControlLabel, Radio, RadioGroup, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import BranchPicker from "../../pickers/BranchPicker";
import MobileBankingPicker from "../../pickers/MobileBankingPicker";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
}));

const mobileBankingOptions = ["Bkash", "Nagad", "Rocket"];

const EmployeeAccountInfoForm = ({ handleChange, formData, setFormData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const accountType = formData?.employeeBankInfo?.accountType || "bank"; // 'bank' or 'mobile'

  const handleAccountTypeChange = (event) => {
    const value = event.target.value;
    handleChange("accountType", value, "employeeBankInfo");

    // Optionally reset fields on switch
    if (value === "bank") {
      handleChange("mobileBankingService", "", "employeeBankInfo");
    }
  };

  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            <Box mb={2}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                  <FormattedMessage id="workforce.account.selection.type" defaultMessage="Select Account Type" />
                </Typography>
                <RadioGroup row value={accountType} onChange={handleAccountTypeChange}>
                  <FormControlLabel value="bank" control={<Radio color="primary" />} label="Banking" />
                  <FormControlLabel value="mobile" control={<Radio color="primary" />} label="Mobile Banking" />
                </RadioGroup>
              </FormControl>
            </Box>

            {accountType === "mobile" && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6} className={classes.item}>
                    <MobileBankingPicker
                      value={formData?.employeeAccountInfoForm?.bankingOptions || ""}
                      label={<FormattedMessage id="Mobile Banking Options" module="workforce" />}
                      required
                      onChange={(v) => handleChange("bankingOptions", v, "employeeAccountInfoForm")}
                      readOnly={false}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.accountHolderName"
                      value={formData?.employeeBankInfo?.accountHolderName || ""}
                      onChange={(v) => handleChange("accountHolderName", v, "employeeBankInfo")}
                      required
                      readOnly={false}
                    />
                  </Grid>

                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.mobileNumber"
                      value={formData?.employeeBankInfo?.accountNumber || ""}
                      onChange={(v) => handleChange("accountNumber", v, "employeeBankInfo")}
                      required
                      readOnly={false}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {accountType === "bank" && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="workforce.BanksPicker"
                      value={formData?.employeeBankInfo?.bank?.id || null}
                      label={<FormattedMessage id="workforce.bank.picker" module="workforce" />}
                      required
                      onChange={(option) => handleChange("bank", option, "employeeBankInfo")}
                      readOnly={false}
                    />
                  </Grid>

                  <Grid item xs={6} className={classes.item}>
                    {/* <BranchPicker
                      value={formData?.employeeBankInfo?.branch?.id || ""}
                      label={<FormattedMessage id="workforce.branch.picker" module="workforce" />}
                      required
                      bankId={formData?.employeeBankInfo?.bank?.id}
                      onChange={(v) => handleChange("branch", v, "employeeBankInfo")}
                      readOnly={false}
                    /> */}
                    <TextInput
                      label={"workforce.branch.picker"}
                      value={formData?.employeeBankInfo?.branch || ""}
                      onChange={(v) => handleChange("branch", v, "employeeBankInfo")}
                      required
                      readOnly={false}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.accountHolderName"
                      value={formData?.employeeBankInfo?.accountHolderName || ""}
                      onChange={(v) => handleChange("accountHolderName", v, "employeeBankInfo")}
                      required
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.routingNumber"
                      value={formData?.employeeBankInfo?.routingNumber || ""}
                      onChange={(v) => handleChange("routingNumber", v, "employeeBankInfo")}
                      required
                      readOnly={false}
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      label="workforce.employee.account.info.accountNumber"
                      value={formData?.employeeBankInfo?.accountNumber || ""}
                      onChange={(v) => handleChange("accountNumber", v, "employeeBankInfo")}
                      required
                      readOnly={false}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeAccountInfoForm;
