import React, { useState } from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  Button,
  Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EmployeeAccidentInfoForm from "../../pages/application/EmployeeAccidentInfoForm";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
    width: "100%",
    maxWidth: (props) => props.maxWidth || 700,
    maxHeight: "90vh", // 👈 Limit modal height
    display: "flex",
    flexDirection: "column",
    outline: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  content: {
    flex: 1, // 👈 Fill remaining space
    overflowY: "auto", // 👈 Enable vertical scroll
    paddingRight: theme.spacing(1), // spacing for scrollbar
    marginBottom: theme.spacing(2),
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

const EisFactoryAdminModal = ({
  open,
  onClose,
  title,
  application,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  maxWidth,
  showActions = true,
}) => {
  const classes = useStyles({ maxWidth });
  const [formData, setFormData] = useState(application);

  const handleChange = (key, value, parent = null) => {
    setFormData((prev) => {
      if (parent) {
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [key]: value,
          },
        };
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={classes.modal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={open}>
        <Box className={classes.paper}>
          {/* Header */}
          <div className={classes.header}>
            <Typography variant="h6">{title}</Typography>
            <Button onClick={onClose} size="small" color="secondary">
              ✕
            </Button>
          </div>
          <Divider />

          {/* Scrollable Content */}
          <Box className={classes.content}>
            <EmployeeAccidentInfoForm
              handleChange={(key, value) =>
                handleChange(key, value, "employeeAccidentInfo")
              }
              formData={formData}
              setFormData={setFormData}
              applicationType={"disabilityAssistance"}
            //   errors={errors}
            />
          </Box>

          {/* Footer / Actions */}
          {showActions && (
            <div className={classes.actions}>
              <Button onClick={onClose} variant="outlined">
                {cancelText}
              </Button>
              {onConfirm && (
                <Button
                  onClick={() => onConfirm(formData)}
                  color="primary"
                  variant="contained"
                >
                  {confirmText}
                </Button>
              )}
            </div>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default EisFactoryAdminModal;
