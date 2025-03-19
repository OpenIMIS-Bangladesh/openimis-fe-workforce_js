import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Box, Grid, Paper, LinearProgress } from "@material-ui/core";
import { useTranslations, useModulesManager, TextInput, useHistory } from "@openimis/fe-core";

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

const RegistrationButton = () => {
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
      <Button onClick={redirectToRegistrationPage}>{formatMessage("Register")}</Button>
    </>
  );
};

export default RegistrationButton;
