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
  TextField
} from "@material-ui/core";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import DistrictOfficePicker from "../../../pickers/DistrictOfficePicker";
import EmployeePicker from "../../../pickers/EmployeePicker";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchApplication,
  updateApplication,
  createApplicationMovement,
  createApplicationSummary
} from "../../../actions";
import { WORKFORCE_STATUS } from "../../../constants";
import ForwardAdminPanel from "./ForwardAdminPanel";
import ForwardApplicationModal from "./ForwardApplicationModal";

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

const ForwardApplicationSummaryModal = ({
  open,
  onClose,
  selectedApplication,
  onSubmitForward,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [officeType, setOfficeType] = useState("");
  const [formData, setFormData] = useState(null);
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

  const data = useSelector((state) => state.workforce[`application`] ?? []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      comment: editorContent,
      destinationOffice: formData,
    };

    // try {
    //   const response = await onSubmitForward(payload);
    //   setServerResponse(response);
    // } catch {
    //   setServerResponse({ status: "ERROR", message: "সাবমিশনে ব্যর্থ হয়েছে!" });
    // } finally {
    //   setSubmitting(false);
    // }
  };

  const handleForward = async () => {
    const createApplicationSummaryData = {
      status: WORKFORCE_STATUS.FORWARD_TO_COMIITEE,
      meetingName: formData?.meetingName,
      meetingDate: formData?.meetingDate
    };
    // const createApplicationMovementData = {
    //   applicationId: decodeId(selectedApplication.id),
    //   status: WORKFORCE_STATUS.DG_APPROVED,
    //   note: "আবেদন ডিজির কাছে প্রেরণ করা হয়েছে",
    //   action: "send_for_dg_approve",
    // };
    await dispatch(
      createApplicationSummary(createApplicationSummaryData, `create workforce application summary`)
    );
    // await dispatch(
    //   createApplicationMovement(
    //     createApplicationMovementData,
    //     `create workforce movement`
    //   )
    // );
    setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  };

  console.log({ aha: selectedApplication });

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
          বিবেচ্য আবেদন সমূহ অ্যাসোসিয়েশন অফিসে পাঠান
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          style={{ fontWeight: 600, marginTop: 3, textAlign: "center" }}
        >
          {/* {selectedApplication
            ? `${
                selectedApplication.workforceEmployee?.firstNameBn ||
                "আবেদনকারী"
              } এর আবেদন ফরওয়ার্ড করতে চান?`
            : "একটি আবেদন বেছে নিন।"} */}
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
                মিটিং এর তথ্য দিন
              </Typography>
            </Grid>

            {/* Meeting Name Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="মিটিং এর নাম"
                variant="outlined"
                value={formData?.meetingName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, meetingName: e.target.value })
                }
                required
              />
            </Grid>

            {/* Meeting Date Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="মিটিং এর তারিখ"
                variant="outlined"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={formData?.meetingDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, meetingDate: e.target.value })
                }
                required
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
            onClick={handleForward}
          >
            {submitting ? "ফরওয়ার্ড করা হচ্ছে..." : "ফরওয়ার্ড করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardApplicationSummaryModal;
