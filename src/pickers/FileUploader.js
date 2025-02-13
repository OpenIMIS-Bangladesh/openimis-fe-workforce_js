import React, { useState } from "react";
import { Button, Typography, LinearProgress, Paper } from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
    border: "2px dashed #3f51b5",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  input: {
    display: "none",
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  fileList: {
    marginTop: theme.spacing(2),
    textAlign: "left",
  },
}));

const FileUploader = ({ onUpload }) => {
  const classes = useStyles();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles(newFiles);
    setUploadProgress(0);
    if (onUpload) {
      onUpload(newFiles);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const newFiles = Array.from(event.dataTransfer.files);
    setFiles(newFiles);
    setUploadProgress(0);
    if (onUpload) {
      onUpload(newFiles);
    }
  };

  return (
    <div>
      <Paper
        className={classes.root}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <CloudUploadIcon color="primary" fontSize="large" />
        <Typography variant="h6" gutterBottom>
          Drag & Drop files here or click to upload
        </Typography>
        <input
          accept="image/*,application/pdf"
          className={classes.input}
          id="file-upload"
          multiple
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            color="primary"
            component="span"
            className={classes.uploadButton}
          >
            Select Files
          </Button>
        </label>
      </Paper>
      {files.length > 0 && (
        <div className={classes.fileList}>
          {files.map((file, index) => (
            <Typography key={index} variant="body1">
              {file.name}
            </Typography>
          ))}
          <LinearProgress variant="determinate" value={uploadProgress} />
        </div>
      )}
    </div>
  );
};

export default FileUploader;
