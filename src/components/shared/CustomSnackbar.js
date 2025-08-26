import React from "react";
import { Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const CustomSnackbar = ({
  open,
  onClose,
  message,
  type = "info",
  duration = 4000,
  position = { vertical: "top", horizontal: "center" },
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={position}
    >
      <Alert onClose={onClose} severity={type}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
