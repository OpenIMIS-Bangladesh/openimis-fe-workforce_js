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

const ForwardApplicationSectionAdminModal = ({
  open,
  onClose,
  selectedApplication,
  onSubmitForward,
  organizationEmployee
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [officeType, setOfficeType] = useState("");
  const [formData, setFormData] = useState(null);
  const officers = useSelector(
    (state) => state.workforce.ADMIN_WORKFORCE_ROLE_WISE_USER || []
  );
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
   return dispatch(
      fetchWorkforceUserRoleWiseUser(modulesManager, {
        roleIds: ["32", "36"],
        orderBy: "id",
      })
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
  const isAssociation = formData?.sendToAssociation;

  const updateApplicationData = {
    id: decodeId(selectedApplication.id),
    status: isAssociation
      ? WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION
      : WORKFORCE_STATUS.NEW,
  };

  const createApplicationMovementData = {
    applicationId: decodeId(selectedApplication.id),
    status: isAssociation
      ? WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION
      : WORKFORCE_STATUS.NEW,
    note: isAssociation
      ? "সুপারিশসহ অ্যাসোসিয়েশনে পাঠানো হয়েছে"
      : "আবেদনের প্রমাণপত্র যাচাই করা হয়েছে",
  };

  await dispatch(
    updateApplication(updateApplicationData, `update workforce application`)
  );

  await dispatch(
    createApplicationMovement(
      createApplicationMovementData,
      `create workforce movement`
    )
  );

  setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
};

useEffect(() => {
  if (serverResponse?.status === "SUCCESS") {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [serverResponse]);

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
          নিজ অফিসে পাঠান
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
              অফিসার নির্বাচন করুন
            </Typography>
              <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
               <Select
                  value={formData?.officerId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, officerId: e.target.value })
                  }
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>অফিসার নির্বাচন করুন</em>
                  </MenuItem>
                  {officers.map((officer) => (
                    <MenuItem key={officer.id} value={officer.userId}>
                      {officer.otherNames} {officer.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default ForwardApplicationSectionAdminModal;
