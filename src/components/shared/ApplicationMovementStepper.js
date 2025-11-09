import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Stepper, Step, StepLabel, StepContent, Typography, Paper, Box } from "@material-ui/core";
import { FormattedMessage } from "@openimis/fe-core";
import { STATUS_MAP_BN, STATUS_MAP_EN, WORKFORCE_USER_TYPE_MAP_BN, WORKFORCE_USER_TYPE_MAP_EN } from "../../constants";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "transparent",
  },
  stepLabel: {
    fontWeight: 600,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
  },
  infoText: {
    marginTop: theme.spacing(0.5),
    fontSize: "0.9rem",
    color: theme.palette.text.secondary,
  },
  statusText: {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
}));

const ApplicationMovementStepper = ({ data = [], language }) => {
  const classes = useStyles();
  const activeStep = data && data.length > 0 ? data.length - 1 : 0;

  return (
    <Paper elevation={2} className={classes.root}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          <FormattedMessage id="workforce.application.progressMovement" module="workforce" />
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {data?.map((step, index) => {
            const key = Object.keys(WORKFORCE_USER_TYPE_MAP_EN).find((k) => WORKFORCE_USER_TYPE_MAP_EN[k] === step.role);
            return (
              <Step key={step.id || index} completed={index < activeStep}>
                <StepLabel>
                  <Box className={classes.labelRow}>
                    <Typography className={classes.stepLabel}>
                      {language=== "en"?WORKFORCE_USER_TYPE_MAP_EN[key]:WORKFORCE_USER_TYPE_MAP_BN[key]} — {step.name}
                    </Typography>
                    {step.date && <Typography className={classes.dateText}>{step.date}</Typography>}
                  </Box>
                </StepLabel>

                <StepContent>
                  <Typography className={classes.infoText}>
                    {" "}
                    <span className={classes.statusText}>{language === "en" ? STATUS_MAP_EN[step.status] : STATUS_MAP_BN[step.status] || "N/A"}</span>
                  </Typography>

                  {step.note && <Typography className={classes.infoText}>{step.note}</Typography>}

                  {step.revertNote && (
                    <Typography className={classes.infoText}>
                      <FormattedMessage id="workforce.application.revertNote" defaultMessage="Revert Note:" /> {step.revertNote}
                    </Typography>
                  )}
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Paper>
  );
};

export default ApplicationMovementStepper;
