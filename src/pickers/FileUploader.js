import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { makeStyles } from "@material-ui/core/styles";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Close";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Webcam from "react-webcam";
import { useDispatch, useSelector } from "react-redux";
import { formatGQLString, decodeId, FormattedMessage } from "@openimis/fe-core";
import { createWorkforceDocument, removeUploadedFile, setUploadedFiles } from "../actions";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import AddIcon from "@material-ui/icons/Add";
import { safeApplicationId } from "../utils/utils";

const useStyles = makeStyles((theme) => ({
  dropzone: {
    border: "2px dashed #005f67",
    backgroundColor: "#eefbff",
    padding: theme.spacing(0.3),
    textAlign: "center",
    cursor: "pointer",
    borderRadius: 8,
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "#ddf5ff",
    },
  },
  uploadIcon: {
    color: "#005f67",
    fontSize: 25,
  },
  fileList: {
    backgroundColor: "#DBEEF0",
    marginTop: theme.spacing(1),
    padding: theme.spacing(0.2),
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0.2),
    borderBottom: "1px solid #005f67",
    borderRadius: 5,
    backgroundColor: "#DBEEF0",
    marginTop: theme.spacing(0.5),
  },
  fileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "80%",
    fontSize: "0.85rem",
  },
  button: {
    marginTop: 6,
    padding: "2px 6px",
    fontSize: "0.65rem",
  },
  deleteIcon: {
    fontSize: "1rem",
    color: "black",
  },
}));

const FileUploader = ({ fieldKey, documentId, onFileChange, applicationId, documentType, documentProp, uploadedBy }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [webcamOpen, setWebcamOpen] = useState(false);
  const webcamRef = useRef(null);

  // 1. Get initial files from Redux to keep UI in sync
  const savedFiles = useSelector((state) => state.workforce.uploadedFilesByField?.[fieldKey] || []);
  const [files, setFiles] = useState([]);
  const globalUploadFile = useSelector(state => state.workforce.uploadFile || []);
  const globalDependentFile = useSelector(state => state.workforce.uploadDependentFile || []);
  const globalBankFile = useSelector(state => state.workforce.uploadBankFile || []);

  // Sync local state when Redux updates
  useEffect(() => {
    const savedFilesString = JSON.stringify(savedFiles);
    const currentFilesString = JSON.stringify(files);

    if (savedFilesString !== currentFilesString) {
      setFiles(savedFiles || []);
    }
  }, [savedFiles, fieldKey]);

  const uploadFileToApi = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);

    try {
      const response = await fetch("/api/workforce/document/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        console.error(`Upload failed for ${file.name}`);
        return null;
      }

      const responseData = await response.json();

      // Construct standardized file object
      const fileWithInfo = {
        name: file.name,
        path: responseData.file_path,
        url: responseData.file_url,
        documentId,
        documentPropId: documentProp?.id,
      };

      // // 2. Update Redux Field Tracking (UI list)
      // const updatedSavedFiles = [...savedFiles, fileWithInfo];
      // dispatch(setUploadedFiles(fieldKey, updatedSavedFiles));

      const createDocumentData = {
        path: responseData.file_path,
        url: responseData.file_url,
        workforceDocumentTypeId: documentProp?.id ? decodeId(documentProp.id) : "",
        documentType: documentType,
        holder: "57",
        holderType: uploadedBy || "applicant",
        fieldKey: fieldKey,
        documentId,
      };

      // 3. Update Global Validation Arrays (Filtered by NextStep)
      if (uploadedBy === "dependent") {
        dispatch({
          type: "SET_UPLOAD_DEPENDENT_FILE_DATA",
          payload: { ...createDocumentData, holderType: "applicant" },
        });
      } else if (uploadedBy === "bank") {
        dispatch({
          type: "SET_UPLOAD_DEPENDENT_BANK_DATA",
          payload: { ...createDocumentData, holderType: "applicant" },
        });
      } else {
        dispatch({
          type: "SET_UPLOAD_FILE_DATA",
          payload: createDocumentData,
        });
      }
      // 4. Handle Persistent DB Storage if Application ID exists
      if (applicationId && uploadedBy === "factoryAdmin") {
        console.log("create document data", createDocumentData);
        dispatch(
          createWorkforceDocument(
            { ...createDocumentData, workforceApplicationId: uploadedBy ? applicationId : safeApplicationId(applicationId) },
            `Created workforce document `,
          ),
        );
      }

      if (applicationId && uploadedBy != "factoryAdmin") {
        console.log("create document data", createDocumentData);
        dispatch(
          createWorkforceDocument(
            { ...createDocumentData, workforceApplicationId: uploadedBy ? applicationId : safeApplicationId(applicationId) },
            `Created workforce document `,
          ),
        );
      }

      return fileWithInfo;
    } catch (error) {
      console.error(`Upload error:`, error);
      return null;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      // 1. Collect all newly uploaded file data
      const uploadedResponses = [];
      for (const file of acceptedFiles) {
        const res = await uploadFileToApi(file);
        if (res) uploadedResponses.push(res);
      }

      // 2. Combine the previously saved files with the new ones
      const allFiles = uploadedResponses;

      // ✅ ADD THIS ONE EXACT LINE HERE:
      dispatch(setUploadedFiles(fieldKey, allFiles));

      // 3. CRITICAL FIX: Notify the parent component so formData.attachments is updated!
      if (onFileChange) {
        onFileChange(fieldKey, {
          files: allFiles,
          documentType: documentType,
          documentPropId: documentProp?.id,
          documentId,
        });
      }
    },
    // ✅ Make sure 'dispatch' is in this dependency array at the bottom!
    [savedFiles, fieldKey, onFileChange, documentType, documentProp, dispatch] 
  );

  const removeFile = (fileName) => {
    const fileToRemove = files.find((f) => f?.name === fileName);

    if (fileToRemove) {
      const identifier = fileToRemove.path;

      // 1. Update the local UI state array directly
      const filteredFiles = files.filter((f) => f?.name !== fileName);
      setFiles(filteredFiles);

      // 2. OVERWRITE the UI list in Redux using the action you already know works!
      // (This safely replaces the broken removeUploadedFile line)
      dispatch(setUploadedFiles(fieldKey, filteredFiles));

      // 3. Dispatch UNIQUE actions to prevent crashing the other module
      let removeType = "WORKFORCE_REMOVE_UPLOAD_FILE";
      if (uploadedBy === "dependent") removeType = "WORKFORCE_REMOVE_DEPENDENT_FILE";
      if (uploadedBy === "bank") removeType = "WORKFORCE_REMOVE_BANK_FILE";

      dispatch({ type: removeType, payload: identifier });

      // 4. Notify parent component
      if (onFileChange) {
        onFileChange(fieldKey, {
          files: filteredFiles,
          documentType: documentType,
          documentPropId: documentProp?.id,
          documentId,
        });
      }
    }
  };

  const captureAndUpload = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

    await uploadFileToApi(file);
    setWebcamOpen(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
    },
  });

  return (
    <div>
      <Paper className={classes.dropzone}>
        <Box display="flex" alignItems="center" justifyContent="center" style={{ gap: "24px" }}>
          <Box {...getRootProps()} display="flex" alignItems="center" style={{ gap: "8px", cursor: "pointer" }}>
            <input {...getInputProps()} />
            <CloudUploadIcon className={classes.uploadIcon} />
            <FormattedMessage module="workforce" id="workforce.application.steps.upload">
              {(msg) => <Typography variant="body2">{msg}</Typography>}
            </FormattedMessage>
          </Box>

          <Box
            onClick={() => {
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                document.getElementById("cameraCaptureInput").click();
              } else {
                setWebcamOpen(true);
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <PhotoCameraIcon color="action" />
            <FormattedMessage module="workforce" id="workforce.application.steps.capture">
              {(msg) => <Typography variant="body2">{msg}</Typography>}
            </FormattedMessage>
          </Box>

          <input
            id="cameraCaptureInput"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onDrop(Array.from(e.target.files));
              }
            }}
          />
        </Box>
      </Paper>

      <Dialog open={webcamOpen} onClose={() => setWebcamOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: "100%" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebcamOpen(false)} variant="outlined" color="error">
            Cancel
          </Button>
          <Button onClick={captureAndUpload} variant="contained" color="primary">
            Capture & Upload
          </Button>
        </DialogActions>
      </Dialog>

      {files.length > 0 && (
        <Paper className={classes.fileList}>
          {files.map((file, index) => {
            // ✅ ADD THIS SAFETY CHECK: If file is undefined, skip it!
            if (!file) return null; 

            return (
              <Box key={`${file.name}-${index}`} className={classes.fileItem}>
                <Typography
                  variant="body2"
                  className={classes.fileName}
                  onClick={() => {
                    const fileUrl = file.url || (file.file ? URL.createObjectURL(file.file) : null);
                    if (fileUrl) {
                      const link = document.createElement("a");
                      link.href = fileUrl;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  style={{ cursor: "pointer", textDecoration: "underline", color: "#005f67" }}
                >
                  {file.name}
                </Typography>

                <Box display="flex" alignItems="center">
                  <IconButton onClick={() => removeFile(file.name)} size="small">
                    <DeleteIcon color="secondary" className={classes.deleteIcon} />
                  </IconButton>

                  {/* <IconButton size="small" onClick={() => document.getElementById(`additionalFileInput-${fieldKey}-${index}`).click()}>
                    <AddIcon style={{ fontSize: "1.2rem", color: "#005f67" }} />
                  </IconButton> */}

                  <input
                    id={`additionalFileInput-${fieldKey}-${index}`}
                    type="file"
                    // multiple
                    hidden
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        onDrop(Array.from(e.target.files));
                      }
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Paper>
      )}
    </div>
  );
};

export default FileUploader;
