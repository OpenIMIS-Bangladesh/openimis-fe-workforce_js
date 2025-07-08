import React, { useState, useCallback, useRef } from "react";
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
import { useDispatch } from "react-redux";
import { formatGQLString, decodeId, FormattedMessage } from "@openimis/fe-core";
import { createWorkforceDocument } from "../actions";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";

const useStyles = makeStyles((theme) => ({
  dropzone: {
    border: "2px dashed #005f67",
    backgroundColor: "#eefbff",
    padding: theme.spacing(1),
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

const FileUploader = ({ fieldKey, onFileChange, applicationId, documentType }) => {
  const classes = useStyles();
  const [webcamOpen, setWebcamOpen] = useState(false);
  const webcamRef = useRef(null);
  const [files, setFiles] = useState([]);
  const dispatch = useDispatch();

  // const jwtToken = localStorage.getItem("token"); // Replace with how you store token

  const uploadFileToApi = async (file) => {
    const formData = new FormData();
    formData.append("file", file); // actual file content
    formData.append("name", file.name); // optional field if backend expects this

    const jwtToken = localStorage.getItem("token"); // Adjust this as needed

    // try {
    //   const response = await fetch("/api/workforce/document/upload", {
    //     method: "POST",
    //     credentials: "include",
    //     // headers: {
    //     //   'Content-Type': 'application/json',
    //     //   // DO NOT set "Content-Type" manually for FormData, browser handles it correctly
    //     // },
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     console.error(`Upload failed for ${file.name}:`, errorData);
    //   } else {
    //     const responseData = await response.json();
    //     console.log(`Upload successful for ${file.name}:`, responseData);
    //     const createDocumentData = {
    //       path: responseData.file_path,
    //       url: responseData.file_url,
    //       workforceApplicationId: decodeId(applicationId),
    //       documentType: documentType,
    //       holder: "57",
    //       holderType: "user",
    //     };
    //     dispatch(createWorkforceDocument(createDocumentData, `Created workforce document `));
    //   }
    // } catch (error) {
    //   console.error(`Upload error for ${file.name}:`, error);
    // }
  };

  const captureAndUpload = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    // Convert base64 to a file
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

    setFiles([...files, file]);
    onFileChange(fieldKey, [...files, file]);
    await uploadFileToApi(file);
    setWebcamOpen(false);
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      onFileChange(fieldKey, newFiles);

      // Upload each file one-by-one
      for (const file of acceptedFiles) {
        await uploadFileToApi(file);
      }
    },
    [files, fieldKey, onFileChange]
  );

  const removeFile = (fileName) => {
    const updatedFiles = files.filter((file) => file.name !== fileName);
    setFiles(updatedFiles);
    onFileChange(fieldKey, updatedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
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
    
    {/* Upload Option - only this part gets getRootProps */}
    <Box {...getRootProps()} display="flex" alignItems="center" style={{ gap: "8px", cursor: "pointer" }}>
      <input {...getInputProps()} />
      <CloudUploadIcon className={classes.uploadIcon} />
      <FormattedMessage module="workforce" id="workforce.application.steps.upload">
        {(msg) => <Typography variant="body2">{msg}</Typography>}
      </FormattedMessage>
    </Box>

    {/* Camera Option */}
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

    {/* Mobile capture input (only one!) */}
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
          {files.map((file, index) => (
            <Box key={`${file.name}-${index}`} className={classes.fileItem}>
              <Typography variant="body2" className={classes.fileName}>
                {file.name}
              </Typography>
              <IconButton onClick={() => removeFile(file.name)} size="small">
                <DeleteIcon color="secondary" className={classes.deleteIcon} />
              </IconButton>
            </Box>
          ))}
        </Paper>
      )}
    </div>
  );
};

export default FileUploader;
