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
  Checkbox, 
  Select,
  MenuItem
} from "@material-ui/core";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import EmployeePicker from "../../../pickers/EmployeePicker";
import { useSelector, useDispatch } from "react-redux";
import { fetchApplication, updateApplication, createApplicationMovement,fetchWorkforceUserRoleWiseUser } from "../../../actions";
import { WORKFORCE_STATUS } from "../../../constants";
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

const ForwardApplicationSummarySectionAdminModal = ({
  open,
  onClose,
  selectedApplication,
  selectedApplicationIds,
  onSubmitForward,
  userRights
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [officeType, setOfficeType] = useState("");
  const [formData, setFormData] = useState(null);
  const userType = getUserTypeFromRights(userRights);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  const officers = useSelector(
  (state) =>
    state.workforce.roleWiseUsers || []
);
console.log("jjjjjjjjj",officers)
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

useEffect(() => {
  if (open) {
    setFormData({});
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

  };

const handleForward = async () => {
  try {
    if (!formData?.userId) {
      setServerResponse({ status: "ERROR", message: "অফিসার নির্বাচন করুন!" });
      return;
    }

    for (const encodedId of selectedApplicationIds) {
      const updateApplicationData = {
        id: decodeId(encodedId?.id),
        status: WORKFORCE_STATUS.FORWARD_FOR_VERIFICATION,
      };

 await dispatch(
      updateApplication(updateApplicationData, `update workforce application`)
    );
      const createApplicationMovementData = {
        applicationId: decodeId(encodedId?.id),
        applicationFromId: loggedInUserId,
        applicationToId: formData.userId,
        status: WORKFORCE_STATUS.FORWARD_FOR_VERIFICATION, 
        action: "forward_for_verification",
      };

      await dispatch(createApplicationMovement(createApplicationMovementData, "create workforce movement"));
    }

    setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  } catch (error) {
    console.error("Forwarding error:", error);
    setServerResponse({ status: "ERROR", message: "সাবমিশন ব্যর্থ হয়েছে!" });
  }
};

useEffect(() => {
  if (serverResponse?.status === "SUCCESS") {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [serverResponse]);


  console.log({ newwwwwwwww: selectedApplicationIds });

  return (
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer}>
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
          নথি আপলোড
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          style={{ fontWeight: 600, marginTop: 3, textAlign: "center" }}
        >
          {selectedApplication
            ? `${selectedApplication.workforceEmployee?.firstNameBn ||
            "আবেদনকারী"
            } এর আবেদন ফরওয়ার্ড করতে চান?`
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
          <Grid container spacing={3} style={{ marginTop: 3 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              style={{
                fontWeight: "bold",
                marginTop: 3,
                textAlign: "center",
              }}
            >
              বোর্ড অনুমোদনপত্র এবং ব্যাংক কপি আপলোড করুন
            </Typography>
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
            onClick={async (e) => {
            e.preventDefault();   
            await handleForward(); 
            }}
          >
            {submitting ? "ফরওয়ার্ড করা হচ্ছে..." : "ফরওয়ার্ড করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardApplicationSummarySectionAdminModal;
