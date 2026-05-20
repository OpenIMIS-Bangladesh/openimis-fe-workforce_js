import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FileUploader from "../../pickers/FileUploader";
import { Button, TextField, Typography, Box, Paper, Grid } from "@material-ui/core";
import { createWebsiteLegalGuideline, createWorkforceDocument, fetchWebsiteLegalGuidelines, updateWebsiteLegalGuideline } from "../../actions";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  pageContainer: {
    width: "90%",
    margin: "auto",
    marginTop: "40px",
    marginBottom: "40px",
  },
}));

const LegalGuidelines = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);

  // Fetch existing legal guideline record on component mount
  useEffect(() => {
    dispatch(fetchWebsiteLegalGuidelines()).then((res) => {
    const record = res?.data?.websiteLegalGuidelines; // Assuming only one record exists
      if (record!= null) {
        setExistingRecord(record);
        setDescription(record.description);
        setUploadedFile({
          url: record.documentUrl,
          path: record.documentPath
        });
      }
    });
  }, [dispatch]);

  // Handle file upload
  const handleFileChange = (fieldKey, fileData) => {
    setUploadedFile(fileData.files[0]);
  };

  // Handle save or update
  const handleSave = async () => {
    if (existingRecord) {
      // Update existing record
      dispatch(updateWebsiteLegalGuideline(
        {
          id: existingRecord.id,
          description,
          documentUrl: uploadedFile?.url,
          documentPath: uploadedFile?.path,
        }, "updateWebsiteLegalGuideline"
      ));
    } else {
      // Create new record
      dispatch(createWebsiteLegalGuideline(
        {
          description,
          documentUrl: uploadedFile?.url,
          documentPath: uploadedFile?.path,
        }, "createWebsiteLegalGuideline"
      ));
    }
  };

  return (
    <Box sx={{ padding: 4 }} className={classes.pageContainer}>
      <Grid container spacing={5} alignItems="center">
        <Grid item md={8}>
          <Typography variant="h4" gutterBottom>
            Legal Guideline Management
          </Typography>
          <Paper sx={{ padding: 3, marginBottom: 4 }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
              disabled={!!existingRecord} // Disable if record exists
              marginBottom={2}
            />
            <FileUploader
              fieldKey="legalGuideline"
              documentType="website-legal-guideline"
              documentProp={{ id: "12345" }}
              onFileChange={handleFileChange}
              dispatch={dispatch}
              uploadedBy="admin"
              documentType="legalGuideline"
            />
            {uploadedFile && (
              // <Box sx={{ marginTop: 2 }}>
              //   <Typography variant="subtitle1">Uploaded Document:</Typography>
              //   <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
              //     Preview Document
              //   </a>
              // </Box>
              <iframe
                  title="DOCX Viewer"
                  src={`${uploadedFile.url}`}
                  width="100%"
                  height="600px"
                  frameBorder="0"
                ></iframe>
            )}
          </Paper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!uploadedFile || !description}
          >
            {existingRecord ? "Update Record" : "Save Record"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LegalGuidelines;