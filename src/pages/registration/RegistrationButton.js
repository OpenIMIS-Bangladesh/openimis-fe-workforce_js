import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, LinearProgress, Typography } from "@material-ui/core";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage } from "@openimis/fe-core";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: "auto",
    display: "inline-block",
    // flexWrap:"wrap",
    alignItems: "center",
  },
  title: {
    fontSize: "small",
    // fontWeight:500,
    display: "inline",
  },
  inlineButton: {
    fontSize: "0.875rem",
    fontWeight: "bold",
    padding: theme.spacing(0.5),
    // minWidth: "unset",
    textTransform: "none",
    marginLeft: theme.spacing(1),
    backgroundColor: "#B2D0D5",
    display: "inline", // crucial to stay inline
  },
  paper: theme.paper.paper,
  footerContainer: {
    marginTop: theme.spacing(4), // Fixes the "theme not defined" error
    textAlign: "center",
  },
  logoBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center", // Keeps logos vertically centered
    marginTop: theme.spacing(2),
    flexWrap: "wrap", // Allows wrapping if the screen is too narrow
    gap: "10px",
  },
  footerLogo: {
    height: "50px", // Increased from 35px for better visibility
    width: "auto", // Maintains aspect ratio
    maxWidth: "100px", // Prevents any single logo from taking over
    objectFit: "contain",
  },
}));

const RegistrationButton = () => {
  const [lang, setLang] = useState("bn");
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationButton", modulesManager);

  const redirectToRegistrationPage = (e) => {
    e.preventDefault();
    history.push("/registration");
  };

  return (
    <>
      <Box className={classes.container}>
        <Typography varient="p" className={classes.title}>
          <FormattedMessage module="workforce" id={lang === "bn" ? "workforce.registration.desclaimer" : "New here? Register today!"} />
        </Typography>
        <Button className={classes.inlineButton} onClick={redirectToRegistrationPage}>
          <FormattedMessage module="workforce" id={lang === "bn" ? "workforce.register.button" : "Register"} />
        </Button>
      </Box>
      <Grid item className={classes.footerContainer}>
        <Typography variant="body2" style={{ color: "grey", fontWeight: "bold", marginBottom: 12 }}>
          {lang === "bn" ? "সহযোগিতায়" : "Powered by"}
        </Typography>

        <Box className={classes.logoBox}>
          <img
            src={window.location.origin + "/front/workforce_assets/German_Cooperation-removebg-preview.png"}
            alt="German Cooperation"
            className={classes.footerLogo}
          />
          <img
            src={window.location.origin + "/front/workforce_assets/giz-uganda-logo-png_seeklogo-571721-removebg-preview.png"}
            alt="GIZ"
            className={classes.footerLogo}
          />
          <img src={window.location.origin + "/front/workforce_assets/europeanUnion-removebg-preview.png"} alt="EU" className={classes.footerLogo} />
          <img src={window.location.origin + "/front/workforce_assets/OpenIMIS-removebg-preview.png"} alt="openIMIS" className={classes.footerLogo} />
        </Box>
      </Grid>
    </>
  );
};

export default RegistrationButton;
