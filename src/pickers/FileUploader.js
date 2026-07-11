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
import CircularProgress from "@material-ui/core/CircularProgress";
import { safeApplicationId } from "../utils/utils";
import Cropper from "react-cropper";

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
  cropContainer: {
    width: "100%",
    height: 400,
    background: "#333",
  },
}));

const FileUploader = ({ fieldKey, documentId, onFileChange, applicationId, documentType, documentProp, uploadedBy }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  
  // Webcam States
  const [webcamOpen, setWebcamOpen] = useState(false);
  const webcamRef = useRef(null);

  // Cropper States
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [pendingFileMeta, setPendingFileMeta] = useState(null);
  const cropperRef = useRef(null);

  // Load Cropper CSS dynamically to avoid bundler issues
  useEffect(() => {
    const styleId = "cropperjs-styles";
    if (!document.getElementById(styleId)) {
      const link = document.createElement("link");
      link.id = styleId;
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css";
      document.head.appendChild(link);
    }
  }, []);

  const getUploadIdentity = (item = {}) => item?.path || item?.url || item?.name || item?.fieldKey || item?.documentId || "";

  const mergeUploadEntries = (existingItems = [], incomingItem = {}) => {
    const normalizedExisting = Array.isArray(existingItems) ? existingItems : [];
    const normalizedIncoming = incomingItem && typeof incomingItem === "object" ? incomingItem : null;

    if (!normalizedIncoming) {
      return normalizedExisting;
    }

    const incomingIdentity = getUploadIdentity(normalizedIncoming);
    if (!incomingIdentity) {
      return [...normalizedExisting, normalizedIncoming];
    }

    const existingIndex = normalizedExisting.findIndex((item) => getUploadIdentity(item) === incomingIdentity);
    if (existingIndex >= 0) {
      const updated = [...normalizedExisting];
      updated[existingIndex] = { ...updated[existingIndex], ...normalizedIncoming };
      return updated;
    }

    return [...normalizedExisting, normalizedIncoming];
  };

  const updateGlobalUploadState = useCallback(
    (nextItems) => {
      const normalizedItems = Array.isArray(nextItems) ? nextItems : [];
      if (uploadedBy === "dependent") {
        dispatch({ type: "REPLACE_UPLOAD_DEPENDENT_FILE_DATA", payload: normalizedItems });
      } else if (uploadedBy === "bank") {
        dispatch({ type: "REPLACE_UPLOAD_DEPENDENT_BANK_DATA", payload: normalizedItems });
      } else {
        dispatch({ type: "REPLACE_UPLOAD_FILE_DATA", payload: normalizedItems });
      }
    },
    [dispatch, uploadedBy],
  );

  const savedFiles = useSelector((state) => state.workforce.uploadedFilesByField?.[fieldKey] || []);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const filesRef = useRef([]);
  const globalUploadFile = useSelector((state) => state.workforce.uploadFile || []);
  const globalDependentFile = useSelector((state) => state.workforce.uploadDependentFile || []);
  const globalBankFile = useSelector((state) => state.workforce.uploadBankFile || []);

  useEffect(() => {
    const savedFilesString = JSON.stringify(savedFiles || []);
    const currentFilesString = JSON.stringify(filesRef.current || []);

    if (savedFilesString !== currentFilesString) {
      const syncedFiles = Array.isArray(savedFiles) ? savedFiles : [];
      filesRef.current = syncedFiles;
      setFiles(syncedFiles);
    }
  }, [savedFiles, fieldKey]);

  const syncFilesWithState = useCallback(
    (nextFiles) => {
      const normalizedFiles = Array.isArray(nextFiles) ? nextFiles : [];
      const dedupedFiles = normalizedFiles.filter((file, index, array) => {
        const identity = file?.path || file?.url || file?.name;
        return index === array.findIndex((candidate) => (candidate?.path || candidate?.url || candidate?.name) === identity);
      });

      filesRef.current = dedupedFiles;
      setFiles(dedupedFiles);
      dispatch(setUploadedFiles(fieldKey, dedupedFiles));
      return dedupedFiles;
    },
    [dispatch, fieldKey],
  );

  const needsCropping = useCallback(() => {
    if (!documentType) return false;
    const typeStr = documentType.toLowerCase();
    const hasPhotoOrPic = typeStr.includes("photo") || typeStr.includes("picture");
    const hasBodyPart = typeStr.includes("body part");
    return hasPhotoOrPic && !hasBodyPart;
  }, [documentType]);

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

      const fileWithInfo = {
        name: file.name,
        path: responseData.file_path,
        url: responseData.file_url,
        documentId,
        documentPropId: documentProp?.id,
      };

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

      const nextUploadList = mergeUploadEntries(
        uploadedBy === "dependent"
          ? globalDependentFile
          : uploadedBy === "bank"
            ? globalBankFile
            : globalUploadFile,
        { ...createDocumentData, holderType: "applicant" },
      );

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

      updateGlobalUploadState(nextUploadList);
      
      if (applicationId && uploadedBy === "factoryAdmin") {
        console.log("create document data", createDocumentData);
        dispatch(
          createWorkforceDocument(
            { ...createDocumentData, workforceApplicationId: uploadedBy ? applicationId : safeApplicationId(applicationId) },
            `Created workforce document `,
          ),
        );
      }

      if (applicationId && uploadedBy !== "factoryAdmin") {
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
      if (isUploading || acceptedFiles.length === 0) return;

      // Check if cropping is needed first
      if (needsCropping()) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          setImageToCrop(reader.result);
          setPendingFileMeta({ name: file.name, type: file.type || "image/jpeg" });
          setCropDialogOpen(true);
        };
        reader.readAsDataURL(file);
        return; 
      }

      setIsUploading(true);

      try {
        const uploadedResponses = [];

        for (const file of acceptedFiles) {
          const res = await uploadFileToApi(file);
          if (res) uploadedResponses.push(res);
        }

        const mergedFiles = syncFilesWithState([...(filesRef.current || []), ...uploadedResponses]);

        if (onFileChange) {
          onFileChange(fieldKey, {
            files: mergedFiles,
            documentType,
            documentPropId: documentProp?.id,
            documentId,
          });
        }
      } finally {
        setIsUploading(false);
      }
    },
    [isUploading, syncFilesWithState, fieldKey, onFileChange, documentType, documentProp, documentId, needsCropping],
  );

  const handleCropSave = () => {
    const imageElement = cropperRef?.current;
    const cropper = imageElement?.cropper;
    
    if (cropper) {
      setIsUploading(true);
      cropper.getCroppedCanvas().toBlob(async (blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          setIsUploading(false);
          return;
        }
        
        const croppedFile = new File([blob], pendingFileMeta.name, { type: pendingFileMeta.type });
        
        setCropDialogOpen(false);
        setImageToCrop(null);
        
        try {
          const uploadedFile = await uploadFileToApi(croppedFile);
          if (uploadedFile) {
            const mergedFiles = syncFilesWithState([...(filesRef.current || []), uploadedFile]);
            if (onFileChange) {
              onFileChange(fieldKey, {
                files: mergedFiles,
                documentType,
                documentPropId: documentProp?.id,
                documentId,
              });
            }
          }
        } finally {
          setIsUploading(false);
        }
      }, pendingFileMeta.type, 1);
    }
  };

  const removeFile = (fileName) => {
    const fileToRemove = files.find((f) => f?.name === fileName);

    if (fileToRemove) {
      const identifier = fileToRemove?.path || fileToRemove?.url || fileToRemove?.name || fileName;

      const filteredFiles = (filesRef.current || []).filter((f) => f?.name !== fileName);
      syncFilesWithState(filteredFiles);

      let removeType = "WORKFORCE_REMOVE_UPLOAD_FILE";
      if (uploadedBy === "dependent") removeType = "WORKFORCE_REMOVE_DEPENDENT_FILE";
      if (uploadedBy === "bank") removeType = "WORKFORCE_REMOVE_BANK_FILE";

      dispatch({ type: removeType, payload: identifier });

      const currentUploadList = uploadedBy === "dependent"
        ? globalDependentFile
        : uploadedBy === "bank"
          ? globalBankFile
          : globalUploadFile;
      const nextUploadList = (currentUploadList || []).filter((item) => getUploadIdentity(item) !== identifier);
      updateGlobalUploadState(nextUploadList);

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

    // Check if cropping is needed
    if (needsCropping()) {
      setImageToCrop(imageSrc);
      setPendingFileMeta({ name: `capture_${Date.now()}.jpg`, type: "image/jpeg" });
      setCropDialogOpen(true);
      setWebcamOpen(false);
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

      const uploadedFile = await uploadFileToApi(file);
      if (uploadedFile) {
        const mergedFiles = syncFilesWithState([...(filesRef.current || []), uploadedFile]);
        if (onFileChange) {
          onFileChange(fieldKey, {
            files: mergedFiles,
            documentType,
            documentPropId: documentProp?.id,
            documentId,
          });
        }
      }
    } finally {
      setIsUploading(false);
      setWebcamOpen(false);
    }
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
          <Box
            {...(!isUploading ? getRootProps() : {})}
            display="flex"
            alignItems="center"
            style={{
              gap: 8,
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.5 : 1,
              pointerEvents: isUploading ? "none" : "auto",
            }}
          >
            <input {...getInputProps()} disabled={isUploading} />
            {isUploading ? <CircularProgress size={22} /> : <CloudUploadIcon className={classes.uploadIcon} />}
            <FormattedMessage module="workforce" id="workforce.application.steps.upload">
              {(msg) => <Typography variant="body2">{msg}</Typography>}
            </FormattedMessage>
          </Box>

          <Box
            onClick={() => {
              if (isUploading) return;
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                document.getElementById("cameraCaptureInput").click();
              } else {
                setWebcamOpen(true);
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.5 : 1 }}
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

      {/* Cropper Dialog */}
      <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent style={{ padding: 0 }}>
          <Paper style={{ padding: "8px", backgroundColor: "#fff", color: "#005f67" }}>
            <Typography variant="body2" style={{ textAlign: "center" }}>
              <FormattedMessage module="workforce" id="workforce.application.photo.cropmessage"/>
            </Typography>
          </Paper>
          {imageToCrop && (
             <Cropper
               src={imageToCrop}
               className={classes.cropContainer}
               ref={cropperRef}
               aspectRatio={3 / 4} 
               viewMode={1} 
               dragMode="move"
               cropBoxResizable={false}
               cropBoxMovable={false}
               toggleDragModeOnDblclick={false}
               guides={true}
             />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropDialogOpen(false)} variant="outlined" color="error">
            <FormattedMessage module="workforce" id="workforce.confirm.modal.cancel"/>
          </Button>
          <Button onClick={handleCropSave} variant="contained" color="primary" disabled={isUploading}>
            {isUploading ? <CircularProgress size={24} /> : <FormattedMessage module="workforce" id="workforce.application.photo.cropandupload"/>}
          </Button>
        </DialogActions>
      </Dialog>

      {files.length > 0 && (
        <Paper className={classes.fileList}>
          {files.map((file, index) => {
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