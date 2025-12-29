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
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import EmployeePicker from "../../../pickers/EmployeePicker";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchApplication,
  updateApplication,
  createApplicationMovement,
  fetchWorkforceUserRoleWiseUser,
  updateApplicationSummary,
} from "../../../actions";
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

const ForwardApplicationEisCoordinatorToCommitteeModal = ({
  open,
  onClose,
  selectedApplication,
  selectedApplicationIds,
  onSubmitForward,
  userRights,
  summaryId,
  roleIds,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [officeType, setOfficeType] = useState("");
  const [formData, setFormData] = useState({
    roleIds: [],
    userIds: [],
  });
  const userType = getUserTypeFromRights(userRights);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

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
      return dispatch(
        fetchApplication(modulesManager, [
          `id: "${decodeId(selectedApplication?.id)}"`,
        ])
      );
    }
  }, [open]);

  const ROLE_OPTIONS = [
    { id: "49", name: "EIS Committee" },
  ];

  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSubmitting(false);
      setServerResponse(null);
      setFormData({
        roleIds: [],
        userIds: [],
      });
    }

    if (selectedApplication) {
      dispatch(
        fetchApplication(modulesManager, [
          `id: "${decodeId(selectedApplication?.id)}"`,
        ])
      );
    }
  }, [open, selectedApplication, dispatch, modulesManager]);

  useEffect(() => {
    if (open) {
      setFormData({
        roleIds: [],
        userIds: [],
      });
    }
  }, [open]);

  useEffect(() => {
    if (!Array.isArray(formData.roleIds)) return;
    if (formData.roleIds.length === 0) return;

    dispatch(
      fetchWorkforceUserRoleWiseUser(modulesManager, {
        roleIds: formData.roleIds,
        orderBy: "id",
      })
    );
  }, [formData.roleIds, dispatch, modulesManager]);

  const data = useSelector((state) => state.workforce[`application`] ?? []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      comment: editorContent,
      destinationOffice: formData,
    };
  };
  console.log("commitsummaryId", summaryId);

  const handleForward = async () => {
    const numericRoleIds = roleIds.map((id) => Number(id));

    try {
      if (!formData?.userIds || formData.userIds.length === 0) {
        setServerResponse({
          status: "ERROR",
          message: "অফিসার নির্বাচন করুন!",
        });
        return;
      }

      // Determine status + action from roleIds
      let forwardStatus = "";
      let forwardAction = "";

      if (numericRoleIds.includes(47)) {
        forwardStatus = WORKFORCE_STATUS.FORWARD_FOR_VERIFICATION;
        forwardAction = "forward_for_verification";
      } else if (numericRoleIds.includes(49)) {
        forwardStatus = WORKFORCE_STATUS.FORWARD_TO_COMIITTEE;
        forwardAction = "forward_to_committee";
      } else {
        setServerResponse({
          status: "ERROR",
          message: "সঠিক রোল আইডি পাওয়া যায়নি!",
        });
        return;
      }

      for (const encodedId of selectedApplicationIds) {
        const updateApplicationData = {
          id: decodeId(encodedId?.id),
          status: forwardStatus,
        };

        await dispatch(
          updateApplication(
            updateApplicationData,
            `update workforce application`
          )
        );

        for (const userId of formData.userIds) {
          const createApplicationMovementData = {
            applicationId: decodeId(encodedId?.id),
            applicationFromId: loggedInUserId,
            applicationToId: userId,
            status: forwardStatus,
            action: forwardAction,
          };
  
          await dispatch(
            createApplicationMovement(
              createApplicationMovementData,
              "create workforce movement"
            )
          );
  
          // summary update for committee
          if (summaryId && numericRoleIds.includes(49)) {
            const updateApplicationSummaryData = {
              id: decodeId(summaryId),
              status: WORKFORCE_STATUS.FORWARD_TO_COMIITEE,
            };
  
            await dispatch(
              updateApplicationSummary(updateApplicationSummaryData, "update summary")
            );
          }
        }
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
          কর্মবন্টন
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          style={{ fontWeight: 600, marginTop: 3, textAlign: "center" }}
        ></Typography>

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
            {/* Committee Select */}
            <Grid item xs={12} style={{ marginBottom: 16 }}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                  কমিটি নির্বাচন করুন
                </Typography>

                <Select
                  multiple
                  value={formData.roleIds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roleIds: e.target.value,
                      userIds: [],
                    })
                  }
                  renderValue={(selected) =>
                    ROLE_OPTIONS.filter((r) => selected.includes(r.id))
                      .map((r) => r.name)
                      .join(", ")
                  }
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: "#fff",
                        color: "#000",
                      },
                    },
                  }}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Checkbox
                        checked={formData.roleIds.includes(role.id)}
                        style={{ color: "#000" }}
                      />
                      <Typography>{role.name}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Member Select */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                style={{ fontWeight: "bold" }}
              >
                কমিটির মেম্বার নির্বাচন করুন
              </Typography>

              <FormControl fullWidth>
                <Select
                  multiple
                  value={formData.userIds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userIds: e.target.value,
                    })
                  }
                  renderValue={(selected) =>
                    officers
                      .filter((o) => selected.includes(o.userId))
                      .map((o) => o.otherNames)
                      .join(", ")
                  }
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: "#fff",
                        color: "#000",
                      },
                    },
                  }}
                >
                  {officers.map((officer) => (
                    <MenuItem key={officer.id} value={officer.userId}>
                      <Checkbox
                        checked={formData.userIds.includes(officer.userId)}
                        style={{ color: "#000" }}
                      />
                      <Typography>{officer.otherNames}</Typography>
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

export default ForwardApplicationEisCoordinatorToCommitteeModal;
