import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { FormattedMessage } from "@openimis/fe-core";
import { Document, Page, pdfjs } from "react-pdf";

// Set up PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const getFileType = (url = "") => {
  const lowerUrl = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif)$/i.test(lowerUrl)) return "image";
  if (lowerUrl.endsWith(".pdf")) return "pdf";
  if (lowerUrl.endsWith(".docx")) return "docx";
  return "unsupported";
};

const DocumentReviewAccordion = ({
  file,
  index,
  onCommentChange,
  onVerify,
  onReject,
}) => {
  const type = getFileType(file?.url);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon className="material-icons" />}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography>
              {file?.documentType}{" "}
              {type === "pdf"
                ? "(PDF)"
                : type === "image"
                ? "(Image)"
                : type === "docx"
                ? "(DOCX)"
                : "(Unsupported)"}
            </Typography>
          </Grid>
          <Grid item>
            {file.status === "verified" && (
              <Typography style={{ color: "green", fontWeight: "bold" }}>
                ✅ Verified
              </Typography>
            )}
            {file.status === "rejected" && (
              <Typography style={{ color: "red", fontWeight: "bold" }}>
                ❌ Rejected
              </Typography>
            )}
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {type === "image" && (
              <img
                src={file.url}
                alt="preview"
                style={{ width: "100%", maxHeight: 300, objectFit: "contain" }}
              />
            )}

            {type === "pdf" && (
              <Document file={file.url}>
                <Page pageNumber={1} width={600} />
              </Document>
            )}

            {type === "docx" && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.open(file.url, "_blank")}
              >
                Open DOCX in New Tab
              </Button>
            )}

            {type === "unsupported" && (
              <Typography color="error">Unsupported file type</Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Comment"
              fullWidth
              variant="outlined"
              size="small"
              multiline
              rows={2}
              value={file.comment || ""}
              onChange={(e) => onCommentChange(index, e.target.value)}
            />
          </Grid>

          <Grid item xs={12} style={{ display: "flex", gap: 8 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onVerify(index)}
              fullWidth
            >
              <FormattedMessage module="workforce" id="workforce.application.verify" />
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => onReject(index)}
              fullWidth
            >
              <FormattedMessage module="workforce" id="workforce.application.reject" />
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default DocumentReviewAccordion;
