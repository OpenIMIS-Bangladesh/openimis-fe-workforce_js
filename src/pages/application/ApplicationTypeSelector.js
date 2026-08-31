import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Grid, Box, Paper, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, FormattedMessage, historyPush, useHistory } from "@openimis/fe-core";
import { getUserType, isBlwfPath, safeDecodeId } from "../../utils/utils";
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
  const [localApplicationType, setLocalApplicationType] = useState("");
  const history = useHistory();
  const user_type = getUserType();

  const handleEmployeeChange = (employee) => {
    dispatch({ type: "SET_SELECTED_EMPLOYEE", payload: employee });
  };

  // 1. Logic to AUTOMATICALLY set Yes/No based on factory selection
  useEffect(() => {
    const exportStatus = selectedFactory?.id || selectedFactory?.factory?.id ? "yes" : "no";
    setIsExportOriented(exportStatus);
    if (selectedApplicationType) {
      onSelect(selectedApplicationType, exportStatus);
    }
  }, [selectedFactory, selectedApplicationType, onSelect]);

  // 2. Initial load logic (for edit mode)
  useEffect(() => {
  if (!parsedApplicationData) return;

  const applicationType = parsedApplicationData.applicationType || "";
  const exportStatus =
    parsedApplicationData.organizationType === "cf" ? "yes" : "no";

  setLocalApplicationType(applicationType);
  setIsExportOriented(exportStatus);

  onSelect(applicationType, exportStatus);

  dispatch({
    type: "SET_SELECTED_EMPLOYEE",
    payload: parsedApplicationData.workforceEmployee,
  });
  }, [parsedApplicationData, onSelect, dispatch]);

  const handleApplicationTypeChange = (event) => {
    const value = event.target.value;
    setLocalApplicationType(value);
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
                value={selectedEmployee?.id || parsedApplicationData?.workforceEmployee?.id}
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

      {!isBlwfPath() &&(<Box mt={3}>
        <FactoryPicker
          id="application-type-factory"
          // FIX: Pass the ID directly from the object (fallback to nested only if necessary)
          value={safeDecodeId(selectedFactory?.id) || safeDecodeId(selectedFactory?.factory?.id) || safeDecodeId(workforceFactoryId)}
          label={<FormattedMessage id="workforce.employee.workforce_factory" module="workforce" />}
          required
          companyId={employeeData?.company?.id}
          onChange={(v) => {
            // v is the whole factory object
            setSelectedFactory(v); 
          }}
          readOnly={false}
        />
      </Box>)}

      <FormControl component="fieldset" className={classes.section}>
        {/* We use the state 'isExportOriented' which is now automatically driven by the FactoryPicker */}
        
        {!isBlwfPath()|| isExportOriented === "yes" ? (
          <>
            <Typography variant="h6" className={classes.title}>
              {<FormattedMessage id="workforce.application.type.title" module="workforce" />}
            </Typography>
            <RadioGroup value={localApplicationType} onChange={handleApplicationTypeChange}>
              <FormControlLabel value="medicalAssistance" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.medical.donation" module="workforce" />} />
              <FormControlLabel value="maternityGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.maternal.grant" module="workforce" />} />
              <FormControlLabel value="scholarship" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.education.grant" module="workforce" />} />
              <FormControlLabel value="disabilityAssistance" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.medical.disability" module="workforce" />} />
              <FormControlLabel value="financialAssistance" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.deadly.grant" module="workforce" />} />
            </RadioGroup>
          </>
        ) : (
          <>
            <Typography variant="h6" className={classes.title}>
              {<FormattedMessage id="workforce.application.type.title" module="workforce" />}
            </Typography>
            <RadioGroup value={localApplicationType} onChange={handleApplicationTypeChange}>
              <FormControlLabel value="medicalDonation" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.medical.donation" module="workforce" />} />
              <FormControlLabel value="maternityGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.maternal.grant" module="workforce" />} />
              <FormControlLabel value="educationGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.education.grant" module="workforce" />} />
              <FormControlLabel value="deadlyGrant" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.type.deadly.grant" module="workforce" />} />
            </RadioGroup>
          </>
        )}
      </FormControl>
    </Paper>
  );
};

export default ApplicationTypeSelector;