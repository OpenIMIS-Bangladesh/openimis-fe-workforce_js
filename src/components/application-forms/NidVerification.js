import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Card,
  CardContent,
  Box,
} from "@material-ui/core";
import {
    useModulesManager,
    formatMutation,
    decodeId,
    FormattedMessage,
  } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";

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

const NidVerification = ({ formData }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Box p={0} className={classes.paper}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body1" className={classes.title}>
                  <b>Verify Your Nid Card</b>
                </Typography>
                <Divider style={{ margin: "10px 0" }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>
                      <b><FormattedMessage module="workforce" id="workforce.employee.name.en"/>:</b> {formData.workforceEmployee.firstNameEn}<br/>
                      <b><FormattedMessage module="workforce" id="workforce.employee.name.bn"/>:</b> {formData.workforceEmployee.firstNameBn}<br/>
                      <b><FormattedMessage module="workforce" id="workforce.employee.fathers_name.en"/>:</b> {formData.workforceEmployee.fatherNameEn}<br/>
                      <b><FormattedMessage module="workforce" id="workforce.employee.mothers_name.en"/>:</b> {formData.workforceEmployee.motherNameEn}<br/>
                      <b><FormattedMessage module="workforce" id="workforce.employee.birthdate"/>:</b> {formData.workforceEmployee.birthDate}<br/>
                      <b><FormattedMessage module="workforce" id="workforce.employee.nid"/>:</b> {formData.workforceEmployee.nid}<br/>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default NidVerification;
