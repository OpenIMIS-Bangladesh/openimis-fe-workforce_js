import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Paper,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  MenuItem,
} from "@material-ui/core";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
  PublishedComponent
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchApplication,
  eisPaymentProcess
} from "../../../actions";
import { getUserTypeFromRights } from "../../../utils/utils";

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700,
    maxHeight: "90vh",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    overflowY: "auto",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    minWidth: 0,
    padding: theme.spacing(0.5, 1),
    fontSize: "1.2rem",
  },
  sectionPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(2),
  },
  responseMessage: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
}));

const ForwardEisPaymentProcessModal = ({
  open,
  onClose,
  selectedApplication,
  selectedApplicationIds,
  userRights
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [formData, setFormData] = useState(null);
  const data = useSelector((state) => state.workforce[`application`] ?? []);
  const userType = getUserTypeFromRights(userRights);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSubmitting(false);
      setServerResponse(null);
      setFormData(null);
    }
    if (selectedApplication) {
      return dispatch(
        fetchApplication(modulesManager, [
          `id: "${decodeId(selectedApplication?.id)}"`,
        ])
      );
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  };

  const handleForward = async () => {
    if (!formData?.year || !formData?.month) {
    setServerResponse({
      status: "ERROR",
      message: "সকল আবশ্যিক ফিল্ড পূরণ করুন।",
    });
    return;
  }

  for (const encodedId of selectedApplicationIds) {
        const eisPaymentData = {
        workforceApplicationId: decodeId(encodedId?.id),
        year: formData?.year,
        month: formData?.month,
     };
   
   await dispatch(
     eisPaymentProcess(eisPaymentData, "Create Payment Process")
   );
  }

  setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
};


useEffect(() => {
  if (serverResponse?.status === "SUCCESS") {
      setTimeout(() => {
        // window.location.reload();
      }, 2000);
    }
  }, [serverResponse]);

  return (
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer} onSubmit={handleSubmit}>
        {/* Close button */}
        <Button onClick={onClose} className={classes.closeButton}>
          ✕
        </Button>

        {/* Title */}
        <Typography
          variant="h5"
          gutterBottom
          style={{ fontWeight: "bold", marginTop: 3, textAlign: "center" }}
        >
          <FormattedMessage module="workforce" id="workforce.employee.application.paymentProcess" />       
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          style={{ fontWeight: 600, marginTop: 3, textAlign: "center" }}
        >
        </Typography>

        {/* Response message */}
        {serverResponse?.status && (
          <Typography
            className={classes.responseMessage}
            style={{
              color: serverResponse.status === "SUCCESS" ? "green" : "red",
            }}
          >
            {serverResponse.status === "SUCCESS" ? "✅" : "⚠️"}{" "}
            {serverResponse.message}
          </Typography>
        )}

        <Divider style={{ marginBottom: 24 }} />

        {/* Form Fields */}
        <Paper className={classes.sectionPaper} elevation={1}>
          <Grid container spacing={3} style={{ marginTop: 3 }}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                style={{
                  fontWeight: "bold",
                  marginTop: 3,
                  textAlign: "center",
                }}
              >
                <FormattedMessage
                  module="workforce"
                  id="workforce.application.providePaymentInfo"
                />
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="বছর"
                variant="outlined"
                value={formData?.year || ""}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                required
              >
                {[...Array(21)].map((_, index) => {
                  const year = 2020 + index;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            {/* Month Field */}
           <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="মাস"
              variant="outlined"
              value={formData?.month || ""}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
              required
            >
              {[
                "জানুয়ারি",
                "ফেব্রুয়ারি",
                "ফেব্রুয়ারি",
                "মার্চ",
                "এপ্রিল",
                "মে",
                "জুন",
                "জুলাই",
                "আগস্ট",
                "সেপ্টেম্বর",
                "অক্টোবর",
                "নভেম্বর",
                "ডিসেম্বর",
              ].map((month, index) => (
                <MenuItem key={index} value={index + 1}>
                  {month}
                </MenuItem>
              ))}
            </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <div className={classes.buttonGroup}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            <FormattedMessage module="workforce" id="core.LanguageQuickPicker.dialog.cancel" />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            onClick={handleForward}
          >
            <FormattedMessage module="workforce" id="workforce.submit" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardEisPaymentProcessModal;
