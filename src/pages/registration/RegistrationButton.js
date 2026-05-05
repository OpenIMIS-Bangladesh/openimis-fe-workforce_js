import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, LinearProgress,Typography } from "@material-ui/core";
import { useTranslations, useModulesManager, TextInput, useHistory,FormattedMessage } from "@openimis/fe-core";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: "auto",
    display: "inline-block",
    // flexWrap:"wrap",
    alignItems:"center",
  },
  title:{
    fontSize:'small',
    // fontWeight:500,
    display:'inline'
  },
  inlineButton: {
    fontSize: "0.875rem",
    fontWeight: "bold",
    padding: theme.spacing(0.5),
    // minWidth: "unset",
    textTransform: "none",
    marginLeft: theme.spacing(1),
    backgroundColor:"#B2D0D5",
    display: "inline", // crucial to stay inline
  },
  paper: theme.paper.paper,
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
      <Typography varient="p" className={classes.title}><FormattedMessage module="workforce" id={lang === "bn" ? "workforce.registration.desclaimer" : "New here? Register today!"} /></Typography>
      <Button className={classes.inlineButton}  onClick={redirectToRegistrationPage}><FormattedMessage module="workforce" id={lang === "bn" ? "workforce.register.button" : "Register"} /></Button>
    </Box>
    <Grid item style={{ marginTop: 2 }}>
          <Typography variant="body2" align="center" style={{ color: "grey", fontWeight: "bold" }}>
            {lang === "bn" ? "সহযোগিতায়" : "Powered by"}
          </Typography>
          <Box style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
            <img
              src={window.location.origin + "/front/workforce_assets/German_Cooperation-removebg-preview.png"}
              alt="German Cooperation Logo"
              style={{ width: "85px" }}
            />
            <img
              src={window.location.origin + "/front/workforce_assets/giz-uganda-logo-png_seeklogo-571721-removebg-preview.png"}
              alt="GIZ Logo"
              style={{ width: "85px" }}
            />
            <img src={window.location.origin + "/front/workforce_assets/europeanUnion-removebg-preview.png"} alt="Eu Logo" style={{ width: "85px" }} />
            <img src={window.location.origin + "/front/workforce_assets/OpenIMIS-removebg-preview.png"} alt="openIMIS Logo" style={{ width: "85px" }} />
          </Box>
        </Grid>
    </>
  );
};

export default RegistrationButton;
