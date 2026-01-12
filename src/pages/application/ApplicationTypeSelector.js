import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Grid, Box, Paper, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, FormattedMessage, historyPush, useHistory } from "@openimis/fe-core";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import WorkforceEmployeePicker from "../../pickers/WorkforceEmployeePicker";
import FactoryPicker from "../../pickers/FactoryPicker";

const useStyles = makeStyles((theme) => ({
  title: { fontWeight: 800 },
  paper: {
    padding: theme.spacing(2),
    width: "100%",
    maxWidth: 650,
    margin: "auto",
  },
  section: { marginTop: theme.spacing(3) },
}));

const ApplicationTypeSelector = ({
  workforceFactoryId,
  modulesManager,
  onSelect,
  selectedApplicationType,
  parsedApplicationData,
  selectedFactory,
  setSelectedFactory,
}) => {
  const [isExportOriented, setIsExportOriented] = useState("no");
  const classes = useStyles();
  const dispatch = useDispatch();
  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);
  const selectedEmployee = useSelector((state) => state.selectedEmployee);
  const history = useHistory();
  const user_type = getUserType();

  const handleEmployeeChange = (employee) => {
    dispatch({ type: "SET_SELECTED_EMPLOYEE", payload: employee });
  };

  // 1. Logic to AUTOMATICALLY set Yes/No based on factory selection
  useEffect(() => {
    // Check if selectedFactory exists and has an ID directly
    // note: we check selectedFactory.id, NOT selectedFactory.factory.id
    if (selectedFactory && selectedFactory.id) {
      setIsExportOriented("yes");
      // Ensure the parent gets the updated status immediately
      if(selectedApplicationType) {
         onSelect(selectedApplicationType, "yes");
      }
    } else {
      setIsExportOriented("no");
      if(selectedApplicationType) {
         onSelect(selectedApplicationType, "no");
      }
    }
  }, [selectedFactory]);

  // 2. Initial load logic (for edit mode)
  useEffect(() => {
    if (parsedApplicationData) {
      const orgType = parsedApplicationData?.organizationType;
      const exportStatus = orgType === "cf" ? "yes" : "no";
      setIsExportOriented(exportStatus);
    }
  }, [parsedApplicationData]);

  const handleApplicationTypeChange = (event) => {
    const value = event.target.value;
    onSelect(value, isExportOriented);
  };

  return (
    <Paper className={classes.paper} elevation={0}>
      {user_type !== WORKFORCE_USER_TYPE.APPLICANT && (
        <Box>
          <Typography style={{ textAlign: "center", color: "red", fontWeight: "bold", marginBottom: 8 }}>
            <FormattedMessage id="workforce.application.header.employeeSelector.note" module="workforce" />
          </Typography>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={8}>
              <WorkforceEmployeePicker
                modulesManager={modulesManager}
                workforceFactoryId={workforceFactoryId}
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
                onClick={() => historyPush(modulesManager, history, "workforce.route.employees.employee")}
              >
                <FormattedMessage module="workforce" id="workforce.application.add.employee" />
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box mt={3}>
        <FactoryPicker
          id="application-type-factory"
          // FIX: Pass the ID directly from the object (fallback to nested only if necessary)
          value={selectedFactory?.id || selectedFactory?.factory?.id}
          label={<FormattedMessage id="workforce.employee.workforce_factory" module="workforce" />}
          required
          companyId={employeeData?.company?.id}
          onChange={(v) => {
            // v is the whole factory object
            setSelectedFactory(v); 
          }}
          readOnly={false}
        />
      </Box>

      <FormControl component="fieldset" className={classes.section}>
        {/* We use the state 'isExportOriented' which is now automatically driven by the FactoryPicker */}
        
        {isExportOriented === "yes" ? (
          <>
            <Typography variant="h6" className={classes.title}>
              {<FormattedMessage id="workforce.application.type.title" module="workforce" />}
            </Typography>
            <RadioGroup value={selectedApplicationType} onChange={handleApplicationTypeChange}>
              <FormControlLabel value="medicalAssistance" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.medical.donation" module="workforce" />} />
              <FormControlLabel value="scholarship" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.education.grant" module="workforce" />} />
              <FormControlLabel value="financialAssistance" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.deadly.grant" module="workforce" />} />
              <FormControlLabel value="maternityGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.maternal.grant" module="workforce" />} />
              <FormControlLabel value="disabilityAssistance" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.medical.disability" module="workforce" />} />
            </RadioGroup>
          </>
        ) : (
          <>
            <Typography variant="h6" className={classes.title}>
              {<FormattedMessage id="workforce.application.type.title" module="workforce" />}
            </Typography>
            <RadioGroup value={selectedApplicationType} onChange={handleApplicationTypeChange}>
              <FormControlLabel value="medicalDonation" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.medical.donation" module="workforce" />} />
              <FormControlLabel value="educationGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.education.grant" module="workforce" />} />
              <FormControlLabel value="deadlyGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.deadly.grant" module="workforce" />} />
              <FormControlLabel value="maternityGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.maternal.grant" module="workforce" />} />
            </RadioGroup>
          </>
        )}
      </FormControl>
    </Paper>
  );
};

export default ApplicationTypeSelector;