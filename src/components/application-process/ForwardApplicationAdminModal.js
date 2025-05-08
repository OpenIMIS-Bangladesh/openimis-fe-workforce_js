import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage } from "@openimis/fe-core";
import DistrictOfficePicker from "../../pickers/DistrictOfficePicker";
import DivisionOfficePicker from "../../pickers/DivisionOfficePicker";

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

const ForwardApplicationAdminModal = ({
  open,
  onClose,
  selectedApplication,
  onSubmitForward,
}) => {
  const classes = useStyles();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSubmitting(false);
      setServerResponse(null);
      setFormData(null);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      comment: editorContent,
      destinationOffice: formData,
    };

    try {
      const response = await onSubmitForward(payload);
      setServerResponse(response);
    } catch {
      setServerResponse({ status: "ERROR", message: "সাবমিশনে ব্যর্থ হয়েছে।" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer} onSubmit={handleSubmit}>
        {/* Close button */}
        <Button onClick={onClose} className={classes.closeButton}>
          ✕
        </Button>

        {/* Title */}
        <Typography variant="h5" gutterBottom>
          বিভাগীয় বা জেলা অফিসে পাঠান
        </Typography>

        <Typography variant="body1" color="textSecondary" gutterBottom>
          {selectedApplication
            ? `${selectedApplication.workforceEmployee?.firstNameBn || "আবেদনকারী"} এর আবেদন ফরওয়ার্ড করতে চান?`
            : "একটি আবেদন বেছে নিন।"}
        </Typography>

        {/* Response message */}
        {serverResponse?.status && (
          <Typography
            className={classes.responseMessage}
            style={{
              color: serverResponse.status === "SUCCESS" ? "green" : "red",
            }}
          >
            {serverResponse.status === "SUCCESS" ? "✅" : "⚠️"} {serverResponse.message}
          </Typography>
        )}

        <Divider style={{ marginBottom: 24 }} />

        {/* Form Fields */}
        <Paper className={classes.sectionPaper} elevation={1}>
          <Typography variant="subtitle1" gutterBottom>
            অফিস নির্বাচন
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DistrictOfficePicker
                value={formData?.id}
                label={
                  <FormattedMessage
                    id="workforce.employee.district_office"
                    module="workforce"
                  />
                }
                required
                onChange={(v) => setFormData(v)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DivisionOfficePicker
                value={formData?.id}
                label={
                  <FormattedMessage
                    id="workforce.employee.division_office"
                    module="workforce"
                  />
                }
                required
                onChange={(v) => setFormData(v)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <div className={classes.buttonGroup}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            বাতিল করুন
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "ফরওয়ার্ড করা হচ্ছে..." : "ফরওয়ার্ড করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardApplicationAdminModal;
