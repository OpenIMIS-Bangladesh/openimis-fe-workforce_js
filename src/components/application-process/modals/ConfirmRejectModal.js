import React from "react";
import { FormattedMessage } from "@openimis/fe-core";
import { Modal, Box, Typography, Button, TextField } from "@material-ui/core";

const ConfirmRejectModal = ({ open, onClose, addComment }) => {
  const [comment, setComment] = React.useState("");

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setComment(value);

    if (addComment) {
      addComment(value);
    }
  };

  const handleClose = (flag) => {
    if (flag === 0) {
      setComment("");
      onClose(0);
      return;
    }

    onClose(1);
  };

  return (
    <Modal open={open} onClose={() => handleClose(0)}>
      <Box
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 450,
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
          padding: 24,
          outline: "none",
        }}
      >
        <Typography variant="h6" gutterBottom>
          <FormattedMessage id="workforce.reject.reason" module="workforce" />
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={comment}
          onChange={handleCommentChange}
          placeholder={<FormattedMessage id="workforce.reject.reason.placeholder" module="workforce" />}
        />

        <Box mt={3} display="flex" justifyContent="space-around">
          <Button variant="outlined" color="secondary" onClick={() => handleClose(0)}>
            <FormattedMessage id="workforce.confirm.modal.cancel" module="workforce" />
          </Button>

          <Button variant="contained" color="primary" onClick={() => handleClose(1)} disabled={!comment.trim()}>
            <FormattedMessage id="workforce.confirm.modal.ok" module="workforce" />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmRejectModal;
