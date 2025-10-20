import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Grid, Box, Paper, Button, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, FormattedMessage, useModuleManager, historyPush, useHistory } from "@openimis/fe-core";
import { getUserType, getUserTypeFromRights } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import WorkforceEmployeePicker from "../../pickers/WorkforceEmployeePicker";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 800,
  },
  paper: {
    padding: theme.spacing(2),
    width: "100%", // Ensures it doesn't overflow
    maxWidth: 650, // Restrict max width
    margin: "auto", // Centers the Paper component
  },
  section: {
    marginTop: theme.spacing(3),
  },
}));

const EisApplicationTypeSelector = ({ modulesManager, onSelect, selectedApplicationType, parsedApplicationData }) => {
  const [isExportOriented, setIsExportOriented] = useState("");
  const url_flag = process.env.TZ
  const classes = useStyles();
  const dispatch = useDispatch();
  const selectedEmployee = useSelector((state) => state.selectedEmployee);
  
  const history = useHistory();
  const handleEmployeeChange = (employee) => {
    dispatch({
      type: "SET_SELECTED_EMPLOYEE",
      payload: employee,
    });
    console.log("Selected employee:", employee);
  };
  // const modulesManager = useModuleManager()
  const user_type = getUserType();

  useEffect(() => {
    if (parsedApplicationData) {
      const orgType = parsedApplicationData?.organizationType;
      const appType = parsedApplicationData?.applicationType;
      const exportStatus = orgType === "cf" ? "yes" : "no";
      setIsExportOriented(exportStatus);
      // onSelect(appType, exportStatus); // preselect both in parent
    }
  }, [parsedApplicationData]);

  const handleApplicationTypeChange = (event) => {
    const value = event.target.value;
    // setSelectedApplicationType(value);
    console.log("from eis",value)
    onSelect(value);
    // onSelect(selectedApplicationType, "eis");
  };

  const handleExportOrientedChange = (event) => {
    const value = event.target.value;
    setIsExportOriented(value);
    onSelect(selectedApplicationType, value);
  };

  console.log({ selectedEmployee });

  return (
    <Paper className={classes.paper} elevation={0}>
      {user_type != WORKFORCE_USER_TYPE.APPLICANT && (
        <Box>
          <Typography style={{ textAlign: "center", color: "red", fontWeight: "bold", marginBottom: 8 }}>
            <FormattedMessage id="workforce.application.header.employeeSelector.note" module="workforce" />
          </Typography>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={8}>
              <WorkforceEmployeePicker
                modulesManager={modulesManager}
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
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  historyPush(modulesManager, history, "workforce.route.employees.employee");
                }}
              >
                <FormattedMessage module="workforce" id="workforce.application.add.employee" />
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      <FormControl component="fieldset">
        {/* Application Type Selection */}

        <Typography variant="h6" className={classes.title}>
          {<FormattedMessage id="workforce.application.type.title" module="workforce" />}
        </Typography>
        <RadioGroup value={selectedApplicationType} onChange={handleApplicationTypeChange}>
          
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
