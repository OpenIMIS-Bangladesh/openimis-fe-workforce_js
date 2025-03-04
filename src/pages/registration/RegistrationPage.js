import React, { useState } from "react";
// import { useHistory } from "../helpers/history";
import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, LinearProgress, Divider, Typography } from "@material-ui/core";
// import TextInput from "../components/inputs/TextInput";
// import { useTranslations } from "../helpers/i18n";
// import { useModulesManager } from "../helpers/modules";
import { useTranslations, useModulesManager,TextInput,useHistory } from "@openimis/fe-core";

// import Helmet from "../helpers/Helmet";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: theme.paper.paper,
}));

const RegistrationPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const [formData, setFormData] = useState({ NID: "", mobile: "", name: "" });
  const [isSubmitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState({ status: "", message: null });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Simulate API call for registration
      setTimeout(() => {
        setServerResponse({ status: "SUCCESS", message: "Registration successful!" });
        setSubmitting(false);
      }, 2000);
    } catch (error) {
      setServerResponse({ status: "ERROR", message: "Registration failed. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress className="bootstrap" />
        </Box>
      )}
      <div className={classes.container}>
        {/* <Helmet title={formatMessage("pageTitle")} /> */}
        <Paper className={classes.paper} elevation={2}>
          <form onSubmit={onSubmit}>
            <Box p={6} width={380}>
              <Grid container spacing={2} direction="column" alignItems="stretch">
                <Grid item container direction="row" alignItems="center">
                  <Button
                    onClick={() => history.push("/")}
                    startIcon={<ArrowBackIcon />}
                    color="primary"
                    variant="text"
                  >
                    Back
                  </Button>
                </Grid>
                <Grid item>
                  <TextInput
                    required
                    readOnly={isSubmitting}
                    label={formatMessage("registration.nid")}
                    fullWidth
                    value={formData.NID}
                    onChange={(NID) => setFormData({ ...formData, NID })}
                  />
                </Grid>
                <Grid item>
                  <TextInput
                    required
                    readOnly={isSubmitting}
                    label={formatMessage("registration.mobile")}
                    fullWidth
                    value={formData.mobile}
                    onChange={(mobile) => setFormData({ ...formData, mobile })}
                  />
                </Grid>
                <Grid item>
                  <TextInput
                    required
                    readOnly={isSubmitting}
                    label={formatMessage("registration.name")}
                    fullWidth
                    value={formData.name}
                    onChange={(name) => setFormData({ ...formData, name })}
                  />
                </Grid>
                {serverResponse?.message && (
                  <Grid item>
                    <Box color={serverResponse.status === "ERROR" ? "error.main" : "success.main"}>
                      {serverResponse.message}
                    </Box>
                  </Grid>
                )}
                <Grid item>
                  <Button
                    fullWidth
                    type="submit"
                    disabled={isSubmitting || !(formData.NID && formData.mobile && formData.name)}
                    color="primary"
                    variant="contained"
                  >
                    Register
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </form>
        </Paper>
      </div>
    </>
  );
};

export default RegistrationPage;
