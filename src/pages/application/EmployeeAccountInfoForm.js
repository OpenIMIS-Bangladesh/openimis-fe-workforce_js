import React from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
// import { TextInput } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  FormattedMessage,
  PublishedComponent,
} from "@openimis/fe-core";
import { Save } from "@material-ui/icons";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import BranchPicker from "../../pickers/BranchPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import EmployeeInjuryTypePicker from "../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker from "../../pickers/EmployeeAccidentTypePicker";
import EmployeeDutyStatusPicker from "../../pickers/EmployeeDutyStatusPicker";
import EmployeeInsideOutsideFactoryPicker from "../../pickers/EmployeeInsideOutsideFactoryPicker";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // height: "100vh",
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

const EmployeeAccountInfoForm = ({ handleChange, formData, setFormData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );

  //   const handleChange = (key, value) => {
  //     setFormData((prev) => ({ ...prev, [key]: value }));
  //   };

  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            <Grid container className={classes.tableTitle} spacing={2}>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="workforce.BanksPicker"
                  value={formData?.bank || null}
                  label={
                    <FormattedMessage
                      module="workforce"
                      id="workforce.bank.picker"
                    />
                  }
                  required
                  onChange={(option) => handleChange("bank", option)}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <BranchPicker
                  value={formData?.branch || ""}
                  label={
                    <FormattedMessage
                      id="workforce.branch.picker"
                      module="workforce"
                    />
                  }
                  required
                  bankId={formData?.bank?.id} // Pass selected bank ID
                  onChange={(v) => handleChange("branch", v, "employeeBankInfo")}
                  readOnly={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.account.info.accountHolderName"
                  value={formData?.accountHolderName || ""}
                  onChange={(v) => handleChange("accountHolderName", v, "employeeBankInfo")}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.account.info.routingNumber"
                  value={formData?.routingNumber || ""}
                  onChange={(v) => handleChange("routingNumber", v, "employeeBankInfo")}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.account.info.accountNumber"
                  value={formData?.accountNumber || ""}
                  onChange={(v) => handleChange("accountNumber", v, "employeeBankInfo")}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.account.info.status"
                  value={formData?.status || ""}
                  onChange={(v) => handleChange("status", v, "employeeBankInfo")}
                  required
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={11} className={classes.item} />
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeAccountInfoForm;
