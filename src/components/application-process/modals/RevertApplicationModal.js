import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Breadcrumbs,
  Radio,
  FormControlLabel,
  CircularProgress,
} from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, decodeId, FormattedMessage, useHistory } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import ReactQuill from "react-quill";
import {
  fetchApplication,
  updateApplication,
  createApplicationMovement,
  fetchApplicationWiseMovementList,
} from "../../../actions";
import { WORKFORCE_STATUS } from "../../../constants";
import { safeDecodeId } from "../../../utils/utils";

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
    minHeight: '100px', // Give it a min-height to avoid layout shifts
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonGroup: { marginTop: theme.spacing(3), display: "flex", justifyContent: "flex-end", gap: theme.spacing(2) },
  responseMessage: { marginBottom: theme.spacing(2), fontWeight: 600 },
}));

// No changes to RevertPathSelector needed
const RevertPathSelector = ({ users, selectedUser, onChange }) => (
  <Paper elevation={1} style={{ padding: "15px", marginBottom: "20px" }}>
    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold" }}>
      আবেদন কাকে ফেরত পাঠাতে চান নির্বাচন করুন:
    </Typography>
    {users.length > 0 ? (
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        {users.map((user) => (
          <FormControlLabel
            key={user.id}
            value={user.id}
            control={<Radio checked={selectedUser === user.id} onChange={() => onChange(user.id)} style={{ color: selectedUser === user.id ? "#1976d2" : "black" }} />}
            label={<Typography color={selectedUser === user.id ? "primary" : "inherit"}>{user.name} ({user.role})</Typography>}
          />
        ))}
      </Breadcrumbs>
    ) : (
      <Typography variant="body2" color="textSecondary">No revert path available.</Typography>
    )}
  </Paper>
);

const RevertApplicationModal = ({ open, onClose, selectedApplication }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const userId = useSelector((state) => state.core?.user?.i_user?.id);

  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [selectedRevertUser, setSelectedRevertUser] = useState(null);
  const [movementUsers, setMovementUsers] = useState([]);
  const [isLoadingPath, setIsLoadingPath] = useState(false); // State to track loading

  const hasFetchedRef = useRef(false);

  const appIdDecoded = useMemo(() => selectedApplication?.id ? safeDecodeId(selectedApplication.id) : null, [selectedApplication?.id]);
  const applicantName = useMemo(() => selectedApplication?.workforceEmployee?.firstNameBn || "আবেদনকারী", [selectedApplication?.workforceEmployee?.firstNameBn]);
  const history = useHistory()

  useEffect(() => {
    if (!open) {
      hasFetchedRef.current = false;
      setMovementUsers([]);
      setSelectedRevertUser(null);
      setEditorContent("");
      setServerResponse(null);
      setSubmitting(false);
      setIsLoadingPath(false);
      return;
    }

    if (open && appIdDecoded && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setIsLoadingPath(true); // Start loading

      dispatch(fetchApplicationWiseMovementList(modulesManager, { applicationId: appIdDecoded, orderBy: ["-dateCreated"] }))
        .then((res) => {
          const edges = res?.payload?.data?.workforceApplicationMovement?.edges || [];
          const allUsers = edges.flatMap(({ node }) => (node.applicationTo ? [node.applicationTo] : [])).filter(Boolean);
          console.log("reverted",res)
          
          const users = [
            {
              id: "applicant001",
              name: applicantName,
              role: "Applicant",
            },
            ...allUsers.map((u) => ({
              id: u.id,
              name: u.loginName,
              role: u?.userRoles?.[0]?.role?.name || "User",
            })),
          ];
          setMovementUsers(users);
        })
        .catch((err) => {
          console.error("fetchApplicationWiseMovementList failed", err);
          setServerResponse({ status: "ERROR", message: "Failed to load user path." });
        })
        .finally(() => {
            setIsLoadingPath(false);
        });
    }
  }, [open, appIdDecoded, applicantName, dispatch, modulesManager]);


  const handleRevert = async () => {
    if (!selectedRevertUser) {
      setServerResponse({ status: "ERROR", message: "একজন ব্যবহারকারী নির্বাচন করুন!" });
      return;
    }

    setSubmitting(true);
    
    if (!appIdDecoded) {
      setServerResponse({ status: "ERROR", message: "Application ID is missing." });
      setSubmitting(false);
      return;
    }

    const updateApplicationData = { id: appIdDecoded, status: WORKFORCE_STATUS.REVERT };
        
    const createApplicationMovementData = {     
      applicationId: appIdDecoded,
      status: WORKFORCE_STATUS.REVERT,
      note: "আবেদন ফেরত পাঠানো হয়েছে",
      revertNote: editorContent,
      isReverted: true,
      applicationFromId: userId,
      applicationToId: decodeId(selectedApplication?.workforceEmployee?.relatedUser?.id),
    };

    try {
      await dispatch(updateApplication(updateApplicationData, `update workforce application`));
      await dispatch(createApplicationMovement(createApplicationMovementData, `create workforce movement`));
      setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
      setTimeout(() => {
        onClose();
        history.push("/home");
      }, 1000);
    } catch (err) {
      console.error(err);
      setServerResponse({ status: "ERROR", message: "সাবমিশন ব্যর্থ হয়েছে" });
    } finally {
      setSubmitting(false);
    }
  };
  
  console.log("RevertModal rendering with:", { selectedApplication, movementUsers });

  return (
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer}>
        <Button onClick={onClose} className={classes.closeButton}>✕</Button>
        <Typography variant="h5" gutterBottom style={{ fontWeight: "bold", marginTop: 3, textAlign: "center" }}>
          আবেদন ফেরত পাঠান
        </Typography>

        {serverResponse?.status && (
          <Typography className={classes.responseMessage} style={{ color: serverResponse.status === "SUCCESS" ? "green" : "red" }}>
            {serverResponse.status === "SUCCESS" ? "✅" : "⚠️"} {serverResponse.message}
          </Typography>
        )}

        <Divider style={{ marginBottom: 15 }} />

        <Paper className={classes.sectionPaper} elevation={1}>
          {selectedApplication ? (
            <Typography variant="subtitle1" gutterBottom style={{width: '100%'}}>
              <b>আবেদনকারীর নাম :</b> {selectedApplication?.workforceEmployee?.firstNameBn || 'N/A'} <br />
              <b>আবেদনের ধরন :</b> {selectedApplication?.applicationType || 'N/A'} <br />
              <b>জাতীয় পরিচয়পত্র :</b> {selectedApplication?.workforceEmployee?.nid || 'N/A'} <br />
              <b>ফোন নম্বর :</b> {selectedApplication?.workforceEmployee?.phoneNumber || 'N/A'} <br />
            </Typography>
          ) : (
            <CircularProgress size={24} />
          )}
        </Paper>

        {isLoadingPath ? (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        ) : (
            <RevertPathSelector users={movementUsers} selectedUser={selectedRevertUser} onChange={setSelectedRevertUser} />
        )}
        
        <Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold", marginTop: 1, textAlign: "center" }}>
          <FormattedMessage module="workforce" id="workforce.application.revert.reasons.addComment" />
        </Typography>

        <Box sx={{ width: "100%", mb: 7 }}>
          <ReactQuill value={editorContent} onChange={setEditorContent} theme="snow" style={{ height: "150px" }} />
        </Box>

        <div className={classes.buttonGroup}>
          <Button onClick={onClose} variant="outlined" color="secondary">বাতিল করুন</Button>
          <Button variant="contained" color="primary" disabled={submitting || !selectedApplication || isLoadingPath} onClick={handleRevert}>
            {submitting ? "ফেরত পাঠানো হচ্ছে..." : "ফেরত পাঠান"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RevertApplicationModal;