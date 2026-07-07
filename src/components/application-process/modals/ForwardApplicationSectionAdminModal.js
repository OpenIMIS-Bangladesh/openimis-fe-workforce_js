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
  MenuItem,
} from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import EmployeePicker from "../../../pickers/EmployeePicker";
import { useSelector, useDispatch } from "react-redux";
import { fetchApplication, updateApplication, createApplicationMovement, fetchWorkforceUserRoleWiseUser } from "../../../actions";
import { WORKFORCE_STATUS } from "../../../constants";
import { getUserType, getUserTypeFromRights, isBlwfPath, isEisPath, safeDecodeId } from "../../../utils/utils";

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

const ForwardApplicationSectionAdminModal = ({ open, onClose, selectedApplication, selectedApplicationIds, onSubmitForward, userRights }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [officeType, setOfficeType] = useState("");
  const [formData, setFormData] = useState(null);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const rights = useSelector((state) => state.core?.user?.i_user?.rights);
  const userType = getUserType();

  const officers = useSelector((state) => state.workforce.roleWiseUsers || []);
  console.log("jjjjjjjjj", officers);
  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSubmitting(false);
      setServerResponse(null);
      setFormData(null);
    }
    if (selectedApplication) {
      return dispatch(fetchApplication(modulesManager, [`id: "${decodeId(selectedApplication?.id)}"`]));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setFormData({});

      let roleIds = [];
      if (userType === "section_admin") {
        roleIds = ["17", "37"];
      } else if (userType === "section_admin_two") {
        roleIds = ["36", "39"];
      } else if (userType === "blwf_section_admin") {
        roleIds = ["42", "43"];
      }

      if (roleIds.length > 0) {
        return dispatch(
          fetchWorkforceUserRoleWiseUser(modulesManager, {
            roleIds: roleIds || [],
            orderBy: "id",
          })
        );
      }
    }
  }, [open, userType]);

  const data = useSelector((state) => state.workforce[`application`] ?? []);

  const handleForward = async () => {
    try {
      if (!formData?.userId) {
        setServerResponse({ status: "ERROR", message: "অফিসার নির্বাচন করুন!" });
        return;
      }

      for (const encodedId of selectedApplicationIds) {
        const updateApplicationData = {
          id: safeDecodeId(encodedId?.id),
          status: WORKFORCE_STATUS.FORWARD_FOR_VERIFICATION,
        };

        await dispatch(updateApplication(updateApplicationData, `update workforce application`));
        const createApplicationMovementData = {
          applicationId: safeDecodeId(encodedId?.id),
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
        <Typography variant="h5" gutterBottom style={{ fontWeight: "bold", marginTop: 3, textAlign: "center" }}>
          কর্মবন্টন
        </Typography>

        <Typography variant="body1" color="textSecondary" gutterBottom style={{ fontWeight: 600, marginTop: 3, textAlign: "center" }}>
        {selectedApplication &&
          `${
            selectedApplication?.workforceEmployee?.firstNameBn || "আবেদনকারী"
          } এর আবেদন ফেরত পাঠাতে চান?`}
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
              {!isEisPath()? "ডাটা এন্ট্রি অপারেটর নির্বাচন করুন":"অফিসার নির্বাচন করুন"}
            </Typography>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <Select value={formData?.userId || ""} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} displayEmpty>
                  <MenuItem value="">
                    <em>{!isEisPath()? "ডাটা এন্ট্রি অপারেটর নির্বাচন করুন":"অফিসার নির্বাচন করুন"}</em>
                  </MenuItem>
                  {officers.map((officer) => (
                    <MenuItem key={officer.id} value={officer.userId}>
                      {officer.otherNames}
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

export default ForwardApplicationSectionAdminModal;
