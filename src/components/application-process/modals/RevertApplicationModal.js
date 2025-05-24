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
import { fetchApplication, updateApplication, createApplicationMovement } from "../../../actions";
import { WORKFORCE_STATUS } from "../../../constants";
import ReactQuill from "react-quill";

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

const RevertApplicationModal = ({
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

  const handleRevert = async () => {

      const updateApplicationData = {
        id: decodeId(selectedApplication.id),
        status: WORKFORCE_STATUS.REVERT,
      };
      const createApplicationMovementData = {
        id: decodeId(selectedApplication.id),
        status: WORKFORCE_STATUS.REVERT,
        note: "আবেদন ফেরত পাঠানো হয়েছে",
        action: "revert",

      };
   await dispatch(
        updateApplication(
          updateApplicationData,
          `update workforce application`
        )
      );
   await dispatch(
        createApplicationMovement(
          createApplicationMovementData,
          `create workforce movement`
        )
      );
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
          আবেদন ফেরত পাঠান
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          style={{ fontWeight: 600, marginTop: 3, textAlign: "center" }}
        >
          {selectedApplication
            ? `${
                selectedApplication.workforceEmployee?.firstNameBn ||
                "আবেদনকারী"
              } এর আবেদন ফেরত পাঠাতে চান?`
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
            {serverResponse.status === "SUCCESS" ? "✅" : "⚠️"}{" "}
            {serverResponse.message}
          </Typography>
        )}

        <Divider style={{ marginBottom: 24 }} />

        {/* Form Fields */}
        <Paper className={classes.sectionPaper} elevation={1}>      
            <Grid container spacing={3} style={{marginTop:3}}>
              <Typography
                variant="subtitle1"
                gutterBottom
                style={{
                  fontWeight: "bold",
                  marginTop: 3,
                  textAlign: "center",
                }}
              >
                অফিসার নির্বাচন করুন
              </Typography>
              <Grid item xs={12} sm={12}>
                <EmployeePicker
                  value={formData?.id}
                  officeType={officeType}
                  label={
                    <FormattedMessage
                      id="workforce.officer.selector.picker"
                      module="workforce"
                    />
                  }
                  modulesManager={modulesManager}
                  required
                  onChange={(v) => setFormData(v)}
                />
              </Grid>
               <FormattedMessage module="workforce" id="workforce.application.reasons.addComment" />
                  <Box sx={{ width: "100%", mb: 7 }}>
                    <ReactQuill
                      value={editorContent}
                      onChange={setEditorContent}
                      theme="snow"
                      style={{ height: "150px" }}
                    />
                  </Box>
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
            onClick={handleRevert}
          >
            {submitting ? "ফেরত পাঠানো হচ্ছে..." : "ফেরত পাঠান"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RevertApplicationModal;
