// components/DocumentReviewAccordion.js

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
import { Document, Page } from "react-pdf";

const DocumentReviewAccordion = ({
  file,
  index,
  onCommentChange,
  onVerify,
  onReject,
}) => {
  const isPDF = file?.url?.toLowerCase().endsWith(".pdf");
  const type = isPDF ? "pdf" : "image";

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon className="material-icons" />}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography>
              {file?.documentType} {type === "pdf" ? "(PDF)" : "(Image)"}
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
            {type === "image" ? (
              <img
                src={file.url}
                alt="preview"
                style={{ width: "100%", maxHeight: 300, objectFit: "contain" }}
              />
            ) : (
              <Document file={file.url}>
                <Page pageNumber={1} />
              </Document>
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
              color="error"
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
