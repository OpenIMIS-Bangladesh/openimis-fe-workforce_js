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
import { useDispatch, useSelector } from 'react-redux';
import { generateBankAdviceTemplate } from '../../utils/bankAdviceContent';
import { safeDecodeId } from '../../utils/utils';
import { createWorkforceCommitteeBankAdviceMap } from '../../actions';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: "90vw",
  },
  dialogContent: {
    padding: theme.spacing(4),
  },
  quillEditor: {
    "& .ql-editor table": {
      pointerEvents: "none",
      userSelect: "none",
    },
    "& .ql-editor table td, & .ql-editor table th": {
      pointerEvents: "none",
    },
  },
}));

const BankAdviceEditModal = ({ open, onClose, paymentData, month, year,committee }) => {
  const classes = useStyles();
  const [editorContent, setEditorContent] = useState("");
  const dispatch = useDispatch();
  

  useEffect(() => {
    if (open) {
      const fullContent = generateBankAdviceTemplate();
      setEditorContent(fullContent);
    }
  }, [open]);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
    // Disable table editing - make tables read-only
    table: false,
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'align'
  ];

  // Custom handler to prevent table modification
  useEffect(() => {
    const editor = document.querySelector('.ql-editor');
    if (editor) {
      editor.addEventListener('keydown', (e) => {
        // Check if cursor is inside a table
        const isInTable = e.target.closest('table') || e.target.closest('td') || e.target.closest('th');
        if (isInTable) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });
      
      // Prevent paste in tables
      editor.addEventListener('paste', (e) => {
        const isInTable = e.target.closest('table') || e.target.closest('td') || e.target.closest('th');
        if (isInTable) {
          e.preventDefault();
          return false;
        }
      });
    }
  }, []);


  const handleSave =async() => {
    console.log(editorContent);
    // TODO: Handle save logic, e.g., dispatch action or update state
    const payload = {
      adviceTemplate:editorContent,
      committeeId:safeDecodeId(committee?.id)
    }
    dispatch(createWorkforceCommitteeBankAdviceMap(payload,"bank advice template created"))
    .then((res)=>onClose())

    // onClose();
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
        <div className={classes.quillEditor}>
          <ReactQuill
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            modules={quillModules}
            style={{ color: '#000' }}
          />
        </div>
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