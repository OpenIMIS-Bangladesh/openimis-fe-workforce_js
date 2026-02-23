import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from "@material-ui/core";
import { updateApplicationSummary } from "../../../actions";
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, formatMutation, decodeId, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
// import { RESCHEDULE_MEETING_MUTATION } from "../../graphql/mutations";

const RescheduleMeetingDialog = ({ open, onClose, summaryId, onSuccess }) => {
  const [newDate, setNewDate] = useState("");
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  console.log({ fromReschedule: summaryId });
  // TODO: Uncomment and configure your actual mutation
  /*
  const [rescheduleMeeting, { loading }] = useMutation(RESCHEDULE_MEETING_MUTATION, {
    onCompleted: () => {
      onSuccess(); // Refresh data in parent or show success message
      handleClose();
    },
    onError: (error) => {
      console.error("Error rescheduling meeting:", error);
    }
  });
  */

  // Mock loading state if mutation is commented out
  const loading = false;

  const handleClose = () => {
    setNewDate(""); // Reset state on close
    onClose();
  };

  const handleSubmit = async () => {
    if (!newDate) return;

    console.log(`Submitting mutation for ID: ${summaryId} with new date: ${newDate}`);
    const updateApplicationSummaryData = {
      id: decodeId(summaryId),
      meetingDate: newDate,
    };

    await dispatch(updateApplicationSummary(updateApplicationSummaryData, "update summary"));
    if (onSuccess) onSuccess();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reschedule Meeting</DialogTitle>
      <DialogContent>
        {/* <TextField
          autoFocus
          margin="dense"
          id="meetingDate"
          label="New Meeting Date"
          type="date"
          fullWidth
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          InputLabelProps={{
            shrink: true, // Forces the label to stay above the date picker
          }}
        /> */}
        <PublishedComponent
          pubRef="workforce.DatePicker"
          label={"workforce.employee.application.meetingDate"}
          value={newDate || ""}
          onChange={(e) => setNewDate(e)}
          readOnly={false}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={!newDate || loading}>
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleMeetingDialog;
