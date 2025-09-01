import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Paper,
  Breadcrumbs,
  Radio,
  FormControlLabel,
} from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { useSelector, useDispatch } from "react-redux";
import {
  useModulesManager,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import ReactQuill from "react-quill";
import {
  fetchApplication,
  updateApplication,
  createApplicationMovement,
  fetchApplicationWiseMovementList,
} from "../../../actions";
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
    padding: theme.spacing(2),
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

const RevertPathSelector = ({ users, selectedUser, onChange }) => {
  return (
    <Paper elevation={1} style={{ padding: "15px", marginBottom: "20px" }}>
      <Typography
        variant="subtitle1"
        gutterBottom
        style={{ fontWeight: "bold" }}
      >
        আবেদন কাকে ফেরত পাঠাতে চান নির্বাচন করুন:
      </Typography>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {users.map((user) => (
          <FormControlLabel
            key={user.id}
            value={user.id}
            control={
              <Radio
                checked={selectedUser === user.id}
                onChange={() => onChange(user.id)}
                style={{ color: selectedUser === user.id ? "#1976d2" : "black" }}
              />
            }
            label={
              <Typography
                color={selectedUser === user.id ? "primary" : "inherit"}
              >
                {user.name} ({user.role})
              </Typography>
            }
          />
        ))}
      </Breadcrumbs>
    </Paper>
  );
};


const RevertApplicationModal = ({
  open,
  onClose,
  selectedApplication,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const userId = useSelector((state) => state.core?.user?.i_user?.id);

  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [selectedRevertUser, setSelectedRevertUser] = useState(null);
  const [movementsfromId, setMovementsfromId] = useState([]);
  const [applicationFromUsers, setApplicationFromUsers] = useState([]);
  const [movementUsers, setMovementUsers] = useState([]);


  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSubmitting(false);
      setServerResponse(null);
      setSelectedRevertUser(null);
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
  if (open && selectedApplication?.id) {
    const applicationId = decodeId(selectedApplication.id);

    dispatch(
      fetchApplicationWiseMovementList(modulesManager, {
        applicationId,
        orderBy: ["-dateCreated"],
      })
    ).then((res) => {
      const edges = res?.payload?.data?.workforceApplicationMovement?.edges || [];

      const allUsers = edges.flatMap(({ node }) => {
        const users = [];
        if (node.applicationFrom) users.push(node.applicationFrom);
        return users;
      }).filter(Boolean);

      setMovementUsers([
        {
          id: "applicant001",
          name: selectedApplication?.workforceEmployee?.firstNameBn || "আবেদনকারী",
          role: "Applicant",
        },
        { id: "factoryAdmin456", name: "Adnan", role: "Factory Admin" },
        { id: "association", name: "Anwar", role: "Association" },
        ...allUsers.map((user, index) => ({
          id: user.id,
          name: user.loginName,
          role: "Section Admin",
        })),
        // { id: "doctor", name: "Dr. Raju", role: "Doctor" },
        // { id: "approver", name: "Nadim", role: "Selection committee" },
      ]);
    }).catch((err) => console.error(err));
  }
}, [open, selectedApplication, modulesManager, dispatch]);


  const handleRevert = async () => {
    if (!selectedRevertUser) {
      setServerResponse({
        status: "ERROR",
        message: "একজন ব্যবহারকারী নির্বাচন করুন!",
      });
      return;
    }

    setSubmitting(true);

    const updateApplicationData = {
      id: decodeId(selectedApplication.id),
      status: WORKFORCE_STATUS.REVERT,
    };

    const createApplicationMovementData = {
      applicationId: decodeId(selectedApplication.id),
      status: WORKFORCE_STATUS.REVERT,
      note: "আবেদন ফেরত পাঠানো হয়েছে",
      revertNote: editorContent,
      isReverted: true,
      applicationFromId: userId,
      applicationToId: decodeId(selectedRevertUser),
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

    setSubmitting(false);
    setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  };

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
          আবেদন ফেরত পাঠান
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

        <Divider style={{ marginBottom: 15 }} />

        {/* Applicant Info */}
        <Paper className={classes.sectionPaper} elevation={1}>
          <Typography variant="subtitle1" gutterBottom>
            <b>আবেদনকারীর নাম :</b>{" "}
            {selectedApplication?.workforceEmployee?.firstNameBn} <br />
            <b>আবেদনের ধরন :</b> {selectedApplication?.applicationType} <br />
            <b>জাতীয় পরিচয়পত্র :</b>{" "}
            {selectedApplication?.workforceEmployee?.nid} <br />
            <b>ফোন নম্বর :</b>{" "}
            {selectedApplication?.workforceEmployee?.phoneNumber} <br />
          </Typography>
        </Paper>

        {/* Breadcrumb User Selection */}
        <RevertPathSelector
          users={movementUsers}
          selectedUser={selectedRevertUser}
          onChange={setSelectedRevertUser}
        />

        {/* Comment Box */}
        <Typography
          variant="subtitle1"
          gutterBottom
          style={{
            fontWeight: "bold",
            marginTop: 1,
            textAlign: "center",
          }}
        >
          <FormattedMessage
            module="workforce"
            id="workforce.application.reasons.addComment"
          />
        </Typography>
        <Box sx={{ width: "100%", mb: 7 }}>
          <ReactQuill
            value={editorContent}
            onChange={setEditorContent}
            theme="snow"
            style={{ height: "150px" }}
          />
        </Box>

        {/* Action Buttons */}
        <div className={classes.buttonGroup}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            বাতিল করুন
          </Button>
          <Button
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
