import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@material-ui/core';
import { FormattedMessage } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { generateBankAdviceContent } from '../../utils/bankAdviceContent';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: "90vw",
  },
  dialogContent: {
    padding: theme.spacing(4),
  },
}));

const BankAdviceEditModal = ({ open, onClose, paymentData, month, year }) => {
  const classes = useStyles();
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    if (open) {
      const fullContent = generateBankAdviceContent(paymentData || [], month, year);
      setEditorContent(fullContent);
    }
  }, [open, paymentData, month, year]);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  const handleSave = () => {
    console.log(editorContent);
    // TODO: Handle save logic, e.g., dispatch action or update state
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle>
        <Typography variant="h6">
          <FormattedMessage id="Edit Bank Advice Template" />
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={setEditorContent}
          modules={quillModules}
          style={{ color: '#000' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          <FormattedMessage id="workforce.modal.close" />
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          <FormattedMessage id="workforce.modal.save" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankAdviceEditModal;