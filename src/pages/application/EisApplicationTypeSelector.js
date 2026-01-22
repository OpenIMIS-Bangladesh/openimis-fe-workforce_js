import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Grid, Box, Paper, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, FormattedMessage, useModuleManager, historyPush, useHistory } from "@openimis/fe-core";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import WorkforceEmployeePicker from "../../pickers/WorkforceEmployeePicker";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 800,
  },
  paper: {
    padding: theme.spacing(2),
    width: "100%",
    maxWidth: 650,
    margin: "auto",
  },
  section: {
    marginTop: theme.spacing(3),
  },
}));

const EisApplicationTypeSelector = ({ workforceFactoryId,modulesManager, onSelect, selectedApplicationType, parsedApplicationData }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  const [localApplicationType, setLocalApplicationType] = useState("");
  const [isExportOriented, setIsExportOriented] = useState("");
  const selectedEmployee = useSelector((state) => state.selectedEmployee);
  const user_type = getUserType();

  useEffect(() => {
    if (parsedApplicationData) {
      const orgType = parsedApplicationData?.organizationType;
      const appType = parsedApplicationData?.applicationType;

      setLocalApplicationType(appType || ""); // ✅ set locally
      const exportStatus = orgType === "cf" ? "yes" : "no";
      setIsExportOriented(exportStatus);
    }
  }, [parsedApplicationData]);

  const handleApplicationTypeChange = (event) => {
    const value = event.target.value;
    setLocalApplicationType(value);
    onSelect(value);
  };

  const handleEmployeeChange = (employee) => {
    dispatch({
      type: "SET_SELECTED_EMPLOYEE",
      payload: employee,
    });
  };

  return (
    <Paper className={classes.paper} elevation={0}>
      {user_type !== WORKFORCE_USER_TYPE.APPLICANT && (
        <Box>
          <Typography
            style={{
              textAlign: "center",
              color: "red",
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            <FormattedMessage id="workforce.application.header.employeeSelector.note" module="workforce" />
          </Typography>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={8}>
              <WorkforceEmployeePicker
                modulesManager={modulesManager}
                workforceFactoryId={workforceFactoryId?.id}
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                required={true}
                readOnly={false}
                withLabel={true}
                withPlaceholder={true}
                label={<FormattedMessage module="workforce" id="workforce.application.employee.selector" />}
                placeholder="Type to search employee"
              />
            </Grid>
            <Grid item xs={4}>
              <Button variant="contained" color="primary" onClick={() => historyPush(modulesManager, history, "workforce.route.employees.employee")}>
                <FormattedMessage module="workforce" id="workforce.application.add.employee" />
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <FormControl component="fieldset" className={classes.section}>
        <Typography variant="h6" className={classes.title}>
          <FormattedMessage id="workforce.application.type.title" module="workforce" />
        </Typography>

        {/* ✅ Controlled value bound to local state */}
        <RadioGroup value={localApplicationType} onChange={handleApplicationTypeChange}>
          <FormControlLabel
            value="financialAssistance"
            control={<Radio color="primary" />}
            label={<FormattedMessage id="workforce.application.type.eis.deadly.grant" module="workforce" />}
          />
          <FormControlLabel
            value="disabilityAssistance"
            control={<Radio color="primary" />}
            label={<FormattedMessage id="workforce.application.type.eis.medical.disability" module="workforce" />}
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};

export default EisApplicationTypeSelector;
