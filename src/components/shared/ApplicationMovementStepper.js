import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage,useTranslations,useModulesManager } from "@openimis/fe-core";
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  Box,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "transparent",
  },
  stepLabel: {
    fontWeight: 600,
  },
  stepContent: {
    marginLeft: theme.spacing(2),
  },
  noteBox: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
  },
  completedStep: {
    color: theme.palette.primary.main,
  },
}));

const ApplicationMovementStepper = ({ data = [] }) => {
  const classes = useStyles();

  // Automatically set the last index as the active step
  const activeStep = data && data.length > 0 ? data.length - 1 : 0;

  return (
    <Paper elevation={2} className={classes.root}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
            <FormattedMessage id="workforce.application.progressMovement" module="workforce" />
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {data?.map((step, index) => (
            <Step key={step.id} completed={index < activeStep}>
              <StepLabel>
                <Typography className={classes.stepLabel}>
                  {step.role} — {step.name}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box className={classes.noteBox}>
                  <Typography variant="body2" color="textSecondary">
                    {step.note && step.note.trim() !== ""
                      ? step.note
                      : "No notes available."}
                  </Typography>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Paper>
  );
};

export default ApplicationMovementStepper;
