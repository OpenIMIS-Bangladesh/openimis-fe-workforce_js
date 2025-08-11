import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Typography, TextField, Button } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { FormattedMessage } from "@openimis/fe-core";
import { Document, Page, pdfjs } from "react-pdf";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const getFileType = (url = "") => {
  const lowerUrl = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif)$/i.test(lowerUrl)) return "image";
  if (lowerUrl.endsWith(".pdf")) return "pdf";
  if (lowerUrl.endsWith(".docx")) return "docx";
  return "unsupported";
};

const DocumentReviewAccordion = ({ file, index, onCommentChange, onVerify, onReject, locale }) => {
  const type = getFileType(file?.url);
  const user_type = getUserType();
  const [numPages, setNumPages] = useState(null);

  const handlePDFLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  console.log("done",file);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon className="material-icons" />}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography>
              {locale ==="en"?file?.workforceDocumentType?.nameEn :file?.workforceDocumentType?.nameBn} {type === "pdf" ? "(PDF)" : type === "image" ? "(Image)" : type === "docx" ? "(DOCX)" : "(Unsupported)"}
            </Typography>
          </Grid>
          <Grid item>
            {file.status === "verified" && <Typography style={{ color: "green", fontWeight: "bold" }}>✅ Verified</Typography>}
            {file.status === "rejected" && <Typography style={{ color: "red", fontWeight: "bold" }}>❌ Rejected</Typography>}
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {type === "image" && <img src={file.url} alt="preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain" }} />}

            {type === "pdf" && (
              <div
                style={{
                  height: "500px",
                  overflow: "auto",
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <Document file={file.url} onLoadSuccess={handlePDFLoadSuccess}>
                  {Array.from(new Array(numPages), (_, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} width={550} />
                  ))}
                </Document>
              </div>
            )}
            {/* {type === "pdf" && (
              <iframe title="PDF Viewer" src={file.url} width="100%" height="500px" frameBorder="0" style={{ border: "1px solid #ccc" }}></iframe>
            )} */}

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

          <Grid item xs={12}>
            <TextField
              label="Comment"
              fullWidth
              variant="outlined"
              size="small"
              multiline
              rows={2}
              value={file.note  || ""}
              onChange={(e) => onCommentChange(index, e.target.value)}
            />
          </Grid>

          {user_type != WORKFORCE_USER_TYPE.APPLICANT && (
            <Grid item xs={12} style={{ display: "flex", gap: 8 }}>
              <Button variant="contained" color="primary" onClick={() => onVerify(index)} fullWidth>
                <FormattedMessage module="workforce" id="workforce.application.verify" />
              </Button>
              <Button variant="outlined" color="error" onClick={() => onReject(index)} fullWidth>
                <FormattedMessage module="workforce" id="workforce.application.reject" />
              </Button>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default DocumentReviewAccordion;
