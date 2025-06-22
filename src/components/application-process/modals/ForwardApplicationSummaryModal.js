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
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import DistrictOfficePicker from "../../../pickers/DistrictOfficePicker";
import EmployeePicker from "../../../pickers/EmployeePicker";
import { useSelector, useDispatch } from "react-redux";
import {
  createApplicationSummary,
  updateApplication,
  fetchApplication,
  fetchApplicationPackage,
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
  selectedApplicationIds,
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
  const data = useSelector((state) => state.workforce[`application`] ?? []);
  const createdSummaryId = useSelector(
    (state) => state.workforce?.mutation?.id
  );
  console.log({ createdSummaryId });
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
      name: formData?.meetingName,
      meetingDate: formData?.meetingDate,
      year: formData?.year,
      month: formData?.month,
      applicationData: JSON.stringify(selectedApplicationIds),
    };

    await dispatch(
      createApplicationSummary(
        createApplicationSummaryData,
        "create workforce application summary"
      )
    );

    // if (!createdSummaryId) {
    //   setServerResponse({ status: "ERROR", message: "সারাংশ তৈরি ব্যর্থ হয়েছে!" });
    //   return;
    // }

    for (const encodedId of selectedApplicationIds) {
      const updateApplicationData = {
        id: decodeId(encodedId),
        applicationSummaryId: createdSummaryId,
        status: WORKFORCE_STATUS.FORWARD_TO_COMIITEE,
      };

      await dispatch(
        updateApplication(updateApplicationData, "update workforce application")
      );
    }
    setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  };


    const handleSave = async () => {
      const createApplicationSummaryData = {
      status: WORKFORCE_STATUS.MEETING_CREATED,
      name: formData?.meetingName,
      meetingDate: formData?.meetingDate,
      year: formData?.year,
      month: formData?.month,
      applicationData: JSON.stringify(selectedApplicationIds),
    };

    await dispatch(
      createApplicationSummary(
        createApplicationSummaryData,
        "create workforce application summary"
      )
    );
    }


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
          <FormattedMessage module="workforce" id="workforce.employee.application.forwardToAssociation" />       
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
            <FormattedMessage module="workforce" id="workforce.employee.application.provideMeetingInfo" />
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
                  <MenuItem key={index} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
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
            <FormattedMessage module="workforce" id="core.LanguageQuickPicker.dialog.cancel" />
          </Button>

          <Button
            variant="outlined"
            color="default"
            onClick={handleSave} // You must define this function
            disabled={submitting}
          >
            <FormattedMessage module="workforce" id="workforce.save" />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            onClick={handleForward}
          >
          <FormattedMessage module="workforce" id="workforce.employee.application.forwardTo" />  
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardApplicationSummaryModal;
