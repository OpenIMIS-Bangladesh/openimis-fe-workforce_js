import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Typography, TextField, Button, Modal, Box } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { FormattedMessage } from "@openimis/fe-core";
import { Document, Page, pdfjs } from "react-pdf";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_DOCUMENT_MAP_BN, WORKFORCE_DOCUMENT_MAP_EN, WORKFORCE_USER_TYPE } from "../../constants";
import FileUploader from "../../pickers/FileUploader";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const getFileType = (url = "") => {
  const lowerUrl = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif)$/i.test(lowerUrl)) return "image";
  if (lowerUrl.endsWith(".pdf")) return "pdf";
  if (lowerUrl.endsWith(".docx")) return "docx";
  return "unsupported";
};

const DocumentReviewAccordion = ({ file, index, documentId, onCommentChange, onVerify, onReject, locale, onFileChange, fromResend = false }) => {
  const type = getFileType(file?.url);
  const user_type = getUserType();
  const [numPages, setNumPages] = useState(null);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [tempComment, setTempComment] = useState("");
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);

  // const [expanded, setExpanded] = useState(null);

  const handlePDFLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon className="material-icons" />}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography>
                {locale === "en" ? file?.workforceDocumentType?.nameEn : file?.workforceDocumentType?.nameBn}{" "}
                {type === "pdf" ? "(PDF)" : type === "image" ? "(Image)" : type === "docx" ? "(DOCX)" : "(Unsupported)"}
              </Typography>
            </Grid>
            <Grid item>
              <Typography style={{ color: file?.status?.includes("verified") ? "green" : file?.status?.includes("rejected") ? "red" : "black", fontWeight: "bold" }}>{locale ==="fr"?WORKFORCE_DOCUMENT_MAP_BN[file?.status]:WORKFORCE_DOCUMENT_MAP_EN[file?.status]}</Typography>
              
            </Grid>
          </Grid>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {type === "image" && <img src={file.url} alt="preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain" }} />}
              {type === "pdf" && <iframe title="PDF Viewer" src={file.url} width="100%" height="600px" style={{ border: "1px solid #ccc", borderRadius: 4 }} />}

              {type === "docx" && (
                <iframe
                  title="DOCX Viewer"
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                  width="100%"
                  height="500px"
                  frameBorder="0"
                ></iframe>
              )}

              {type === "unsupported" && <Typography color="error">Unsupported file type</Typography>}
            </Grid>

            {/* <Grid item xs={fromResend ? 6 : 12}>
              <TextField
                label="Comment"
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={2}
                value={file.note || ""}
                onChange={(e) => onCommentChange(index, e.target.value)}
              />
            </Grid> */}
            {fromResend && file.status === "rejected" && (
              <Grid item xs={6}>
                <Typography>{locale === "en" ? file?.workforceDocumentType.nameEn : file?.workforceDocumentType.nameBn}</Typography>
                <FileUploader
                  fieldKey={`resend_${documentId || index}`}
                  documentId={documentId}
                  onFileChange={onFileChange}
                  documentType={file.documentType}
                  documentProp={file}
                  // uploadedBy={"factoryAdmin"}
                />
              </Grid>
            )}

            {!([
              WORKFORCE_USER_TYPE.APPLICANT,
              WORKFORCE_USER_TYPE.EIS_ADVISOR,
              WORKFORCE_USER_TYPE.EIS_COMMITTEE,
              WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE,
            ].includes(user_type)) && (
              <Grid item xs={12} style={{ display: "flex", gap: 8 }}>
                <Button variant="contained" color="primary" onClick={() => onVerify(index)} fullWidth>
                  <FormattedMessage module="workforce" id="workforce.application.recommended" />
                </Button>
                {/* <Button variant="outlined" color="error" onClick={() => onReject(index)} fullWidth> */}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setSelectedFileIndex(index);
                    setOpenRejectModal(true);
                  }}
                  fullWidth
                >
                  <FormattedMessage module="workforce" id="workforce.application.reject" />
                </Button>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Modal open={openRejectModal} onClose={() => setOpenRejectModal(false)}>
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            width: 400,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            position: "relative",
          }}
        >
          {/* 🔹 Close Icon at top-right */}
          <Button
            onClick={() => setOpenRejectModal(false)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              minWidth: "auto",
              padding: 4,
              color: "#666",
            }}
          >
            <span className="material-icons">close</span>
          </Button>

          <Typography variant="h6" gutterBottom>
            <FormattedMessage module="workforce" id="workforce.application.rejectReason" defaultMessage="Provide Rejection Comment" />
          </Typography>

          <TextField
            label="Comment"
            fullWidth
            variant="outlined"
            size="small"
            multiline
            rows={3}
            value={tempComment}
            onChange={(e) => setTempComment(e.target.value)}
          />

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                onCommentChange(selectedFileIndex, tempComment);
                onReject(selectedFileIndex);
                setTempComment("");
                setOpenRejectModal(false);
              }}
            >
              <FormattedMessage module="workforce" id="workforce.application.reject" />
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default DocumentReviewAccordion;
