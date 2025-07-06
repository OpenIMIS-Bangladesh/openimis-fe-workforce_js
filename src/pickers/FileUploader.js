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
import { useDispatch } from 'react-redux'
import {
  formatGQLString, decodeId,
} from "@openimis/fe-core";
import { createWorkforceDocument } from "../actions";

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
  const [files, setFiles] = useState([]);
  const dispatch = useDispatch()

  // const jwtToken = localStorage.getItem("token"); // Replace with how you store token

  const uploadFileToApi = async (file) => {
    const formData = new FormData();
    formData.append("file", file);         // actual file content
    formData.append("name", file.name); // optional field if backend expects this

    const jwtToken = localStorage.getItem("token"); // Adjust this as needed

    try {
      const response = await fetch("/api/workforce/document/upload", {
        method: "POST",
        credentials: 'include',
        // headers: {
        //   'Content-Type': 'application/json',
        //   // DO NOT set "Content-Type" manually for FormData, browser handles it correctly
        // },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Upload failed for ${file.name}:`, errorData);
      } else {
        const responseData = await response.json();
        console.log(`Upload successful for ${file.name}:`, responseData);
        const createDocumentData = {
          path: responseData.file_path,
          url: responseData.file_url,
          workforceApplicationId: decodeId(applicationId),
          documentType: documentType,
          holder: "57",
          holderType: "user"
        }
        dispatch(
          createWorkforceDocument(
            createDocumentData,
            `Created workforce document `
          )
        );

      }
    } catch (error) {
      console.error(`Upload error for ${file.name}:`, error);
    }
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
      <Paper {...getRootProps()} className={classes.dropzone}>
        <input {...getInputProps()} />
        <CloudUploadIcon className={classes.uploadIcon} />
        <Typography variant="body2">Drag & Drop or Click to Upload</Typography>
        <Button variant="contained" color="primary" className={classes.button}>
          Select Files
        </Button>
      </Paper>

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
