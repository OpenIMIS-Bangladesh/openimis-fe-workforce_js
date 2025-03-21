import React, { useState } from "react";
import { Paper, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ApplicationTypeSelector from "./ApplicationTypeSelector";
import MedicalAssistanceForm from "./applicationForms/MedicalAssistanceForm";
import DisabilityForm from "./applicationForms/DisabilityForm";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(2),
    width: 700,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
}));

const MultiStepApplyForm = ({ modulesManager }) => {
  const classes = useStyles();
  const [selectedApplicationType, setSelectedApplicationType] = useState(null);
  const [isExportOriented, setIsExportOriented] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSelection = (applicationType, exportStatus) => {
    setSelectedApplicationType(applicationType);
    setIsExportOriented(exportStatus);
  };

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        {!showForm ? (
          <>
            <ApplicationTypeSelector modulesManager={modulesManager} onSelect={handleSelection} />
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowForm(true)}
                disabled={!selectedApplicationType || !isExportOriented} // Ensures both are selected
              >
                Next
              </Button>
            </div>
          </>
        ) : selectedApplicationType === "medicalAssistance" ? (
          <MedicalAssistanceForm modulesManager={modulesManager} isExportOriented={isExportOriented} />
        ) : selectedApplicationType === "disabilityAssistance" ? (
          <DisabilityForm modulesManager={modulesManager} isExportOriented={isExportOriented} />
        ) : (
          <div>Please select an application type</div>
        )}
      </Paper>
    </div>
  );
};

export default MultiStepApplyForm;
