import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { makeStyles } from "@material-ui/core/styles";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Close";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";

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
    color:'black'
  },
}));

const FileUploader = () => {
  const classes = useStyles();
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  }, [files]);

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: "*",
  });

  return (
    <div>
      <Paper {...getRootProps()} className={classes.dropzone}>
        <input {...getInputProps()} />
        <CloudUploadIcon className={classes.uploadIcon} />
        <Typography variant="body2">Drag & Drop or Click to Upload</Typography>
        <Button variant="contained" color="primary" className={classes.button}>
          Select Files
        </Button>
      </Paper>

      {/* Show uploaded files */}
      {files.length > 0 && (
        <Paper className={classes.fileList}>
          {files.map((file) => (
            <Box key={file.name} className={classes.fileItem}>
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
