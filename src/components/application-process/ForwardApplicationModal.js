import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
} from "@material-ui/core";
import ReactQuill from "react-quill";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../pickers/FileUploader";
import { updateApplication } from "../../actions";

const ForwardApplicationModal = ({
  open,
  onClose,
  selectedApplication,
  officeData = {},
  onSubmitForward,
}) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");
  const [selectedSuboffice, setSelectedSuboffice] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [document, setDocument] = useState({ nameBn: "সাবমিশনের ডকুমেন্ট", fieldId: "supporting_doc" });

  // Reset modal state on close
  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSelectedOffice("");
      setSelectedSuboffice("");
      setSelectedUser("");
      setSubmitting(false);
      setServerResponse(null);
    }
  }, [open]);

  const handleOfficeChange = (e) => {
    const office = e.target.value;
    setSelectedOffice(office);
    setSelectedSuboffice("");
    setSelectedUser("");
  };

  const handleSubofficeChange = (e) => {
    const suboffice = e.target.value;
    setSelectedSuboffice(suboffice);
    const user = officeData[selectedOffice]?.suboffices?.[suboffice] || "ইউজার খুঁজে পাওয়া যায়নি";
    setSelectedUser(user);
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    // setSubmitting(true);
    // const payload = {
    //   comment: editorContent,
    //   office: selectedOffice,
    //   suboffice: selectedSuboffice,
    //   user: selectedUser,
    // };

    // try {
    //   const response = await onSubmitForward(payload); // expects a promise
    //   setServerResponse(response);
    // } catch (error) {
    //   setServerResponse({ status: "ERROR", message: "সাবমিশনে ব্যর্থ হয়েছে।" });
    // } finally {
    //   setSubmitting(false);
    // }
    const updateApplicationData = {
          id: decodeId(selectedApplication.id),
          status: WORKFORCE_STATUS.SECOND_FORWARD,
        };
        dispatch(
          updateApplication(
            updateApplicationData,
            `update workforce application ${selectedApplication.workforceEmployee.firstNameEn}`,
          ),
        );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="forward-modal-title"
      aria-describedby="forward-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 850,
          height: 700,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: "auto",
        }}
      >
        <Box style={{ position: "absolute", top: 8, right: 8 }}>
          <Button size="large" onClick={onClose}>✕</Button>
        </Box>

        <Typography id="forward-modal-title" variant="h6" component="h2">
          ফরওয়ার্ড অ্যাপ্লিকেশন
        </Typography>

        <Typography id="forward-modal-description" sx={{ mt: 2 }}>
          {selectedApplication
            ? `${selectedApplication.workforceEmployee?.firstNameBn || "আবেদনকারী"} এর আবেদন ফরওয়ার্ড করতে চান?`
            : "একটি আবেদন বেছে নিন।"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {serverResponse?.status === "SUCCESS" && (
            <Typography sx={{ mb: 2, color: "green", fontWeight: "bold" }}>
              ✅ {serverResponse.message}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <FormattedMessage module="workforce" id="workforce.application.reasons.addComment" />
            <Box sx={{ width: "100%", mb: 7 }}>
              <ReactQuill
                value={editorContent}
                onChange={setEditorContent}
                theme="snow"
                style={{ height: "150px" }}
              />
            </Box>

            <FormattedMessage module="workforce" id="workforce.application.reasons.selectedOfficer" />
            <Box sx={{ mb: 7 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="office-select-label">অফিস নির্বাচন করুন</InputLabel>
                <Select
                  labelId="office-select-label"
                  value={selectedOffice}
                  onChange={handleOfficeChange}
                  required
                >
                  {Object.keys(officeData).map((office) => (
                    <MenuItem key={office} value={office}>{office}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedOffice && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="suboffice-select-label">সাবঅফিস নির্বাচন করুন</InputLabel>
                  <Select
                    labelId="suboffice-select-label"
                    value={selectedSuboffice}
                    onChange={handleSubofficeChange}
                    required
                  >
                    {Object.keys(officeData[selectedOffice]?.suboffices || {}).map((suboffice) => (
                      <MenuItem key={suboffice} value={suboffice}>{suboffice}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedSuboffice && selectedUser && (
                <>
                  <Typography sx={{ mt: 2 }}>{selectedSuboffice} এর জন্য ইউজার:</Typography>
                  <Typography sx={{ fontWeight: "bold", color: "green" }}>{selectedUser}</Typography>
                </>
              )}
            </Box>

            <Grid item xs={12} sx={{ mt: 7, borderBottom: "1px solid #ccc", pb: 1 }}>
              <Typography fontWeight="bold">ইতঃপূর্বের সংযুক্তিসমূহ</Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 7 }}>
              <Typography>ফাইল যুক্ত করুন... {document.nameBn}</Typography>
              <FileUploader fieldKey={document.fieldId} />
            </Grid>
          </Box>

          <Box style={{ marginTop:2, display: "flex", gap: 2 ,justifyContent:'space-between'}}>
            <Button onClick={onClose} variant="outlined" color="error">বন্ধ করুন</Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? "ফরওয়ার্ড করা হচ্ছে..." : "ফরওয়ার্ড করুন"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ForwardApplicationModal;
