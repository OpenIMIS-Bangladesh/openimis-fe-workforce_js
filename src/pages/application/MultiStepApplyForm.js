import React, { useState } from "react";
import { useModulesManager, formatMutation, decodeId,FormattedMessage } from "@openimis/fe-core";
import { Paper, Button,IconButton,Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ApplicationTypeSelector from "./ApplicationTypeSelector";
import MedicalAssistanceForm from "./applicationForms/MedicalAssistanceForm";
import MedicalDonationForm from "./applicationForms/MedicalDonationForm";
import DisabilityForm from "./applicationForms/DisabilityForm";
import EducationGrantForm from "./applicationForms/EducationGrantForm";
import FinancialAssistanceForm from "./applicationForms/FinancialAssistanceForm";
import ScholarshipApplicationForm from "./applicationForms/ScholarshipApplicationForm";

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
  backButtonContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  backText: {
    marginLeft: theme.spacing(1),
    fontWeight: "bold",
  },
}));

const MultiStepApplyForm = ({ modulesManager }) => {
  const classes = useStyles();
  const [selectedApplicationType, setSelectedApplicationType] = useState(null);
  const [organizationType, setOrganizationType] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSelection = (applicationType, exportStatus) => {
    setSelectedApplicationType(applicationType);
    if (exportStatus === "yes") {
      setOrganizationType("Central Fund");
    } else if (exportStatus === "no") {
      setOrganizationType("BLWF");
    }
  };

  const handleBack = () => {
    setShowForm(false);
  };

  console.log({ organizationType });
  console.log({ selectedApplicationType });

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        {!showForm ? (
          <>
            <ApplicationTypeSelector
              modulesManager={modulesManager}
              onSelect={handleSelection}
            />
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowForm(true)}
                disabled={!selectedApplicationType || !organizationType} // Ensures both are selected
              >
                <FormattedMessage module="workforce" id="workforce.next" />
              </Button>
            </div>
          </>
        ) : selectedApplicationType === "medicalDonation" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <MedicalDonationForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) : selectedApplicationType === "medicalAssistance" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <MedicalAssistanceForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) : selectedApplicationType === "disabilityAssistance" ? (
          <>
           <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <DisabilityForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) : selectedApplicationType === "educationGrant" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <EducationGrantForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) :selectedApplicationType === "financialAssistance"? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <FinancialAssistanceForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) :selectedApplicationType === "scholarship"? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <ScholarshipApplicationForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) : (
          <div>Please select an application type</div>
        )}
      </Paper>
    </div>
  );
};

export default MultiStepApplyForm;
