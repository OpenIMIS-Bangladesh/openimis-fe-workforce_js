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
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import EmployeeInjuryTypePicker  from "../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker  from "../../pickers/EmployeeAccidentTypePicker";
import EmployeeDutyStatusPicker   from "../../pickers/EmployeeDutyStatusPicker";
import EmployeeInsideOutsideFactoryPicker    from "../../pickers/EmployeeInsideOutsideFactoryPicker";

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

const EmployeeAccidentInfoForm = ({ handleChange, formData, setFormData }) => {
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
          <Paper className={classes.paper}>
            <Grid container className={classes.tableTitle} spacing={2}>
              <Grid item xs={6} className={classes.item}>
                <EmployeeInjuryTypePicker
                  value={ formData.lifeStatus || ""}
                  label={
                    <FormattedMessage
                      id="workforce.employee.accident.info.injuryType"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) =>  handleChange("injuryType", v)}
                  readOnly={ false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.accident.info.dateOfAccident"}
                  value={ formData.accidentDate || ""}
                  onChange={(v) =>  handleChange("accidentDate", v)}
                  readOnly={ false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.accident.info.timeOfAccident"}
                  value={ formData.accidentTime || ""}
                  onChange={(v) =>  handleChange("accidentTime", v)}
                  readOnly={ false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <EmployeeAccidentTypePicker
                  value={ formData.accidentType || ""}
                  label={
                    <FormattedMessage
                      id="workforce.employee.accident.info.typeOfAccident"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) =>  handleChange("accidentType", v)}
                  readOnly={ false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <EmployeeDutyStatusPicker
                  value={ formData.dutyStatus || ""}
                  label={
                    <FormattedMessage
                      id="workforce.employee.accident.info.dutyStatus"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) =>  handleChange("dutyStatus", v)}
                  readOnly={ false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <EmployeeInsideOutsideFactoryPicker
                  value={ formData.inOutsideFactory || ""}
                  label={
                    <FormattedMessage
                      id="workforce.employee.accident.info.insideOutsideFactory"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) =>  handleChange("inOutsideFactory", v)}
                  readOnly={ false}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.employee.accident.info.reJoiningDate"}
                  value={ formData.reJoiningDate || ""}
                  onChange={(v) =>  handleChange("reJoiningDate", v)}
                  readOnly={ false}
                />
              </Grid>
              <Grid item xs={11} className={classes.item} />
              {/* <Grid item xs={1} className={classes.item}>
                <IconButton
                  variant="contained"
                  component="label"
                  color="primary"
                  onClick={this.save}
                  disabled={ falseisabled ||  false}
                >
                  <Save />
                </IconButton>
              </Grid> */}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeAccidentInfoForm;
