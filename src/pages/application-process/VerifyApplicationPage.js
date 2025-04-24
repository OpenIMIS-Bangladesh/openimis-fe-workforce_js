import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid, Card, CardContent, Typography, Button, AccordionDetails,
  TextField, Dialog, DialogContent, IconButton, Divider, Accordion, AccordionSummary
} from "@material-ui/core";
import {
  journalize,
  FormattedMessage,
} from "@openimis/fe-core";
import CloseIcon from '@material-ui/icons/Close';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Document, Page } from 'react-pdf';

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(1),
    width: 700,
    margin: "0 auto",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: "medium",
    fontWeight: "bold",
  },
  fullHeight: {
    height: "100%",
  },
  overrideReadOnly: {
    "& .Mui-disabled": {
      color: `${theme.palette.text.primary} !important`,
    },
  },
});

class VerifyApplicationPage extends Component {
  constructor(props) {
    super(props);
    const mockFiles = [
      { type: "image", src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Smart_NID_Card_%28Bangladesh%29.jpg" },
      { type: "pdf", src: "/assets/Fahim_tazwer_cv.pdf" },
    ];

    this.state = {
      stateEdited: props.application?.workforceEmployee || {},
      isSaved: false,
      preview: null,
      comment: "",
      mockFiles: mockFiles,
      fileStates: mockFiles.map((file) => ({ ...file, comment: "", status: null })),
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({ stateEdited: this.props.application });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  handlePreviewOpen = (file) => {
    this.setState({ preview: file });
  };

  handlePreviewClose = () => {
    this.setState({ preview: null });
  };

  handleFileCommentChange = (index, value) => {
    this.setState((prevState) => {
      const updatedFiles = [...prevState.fileStates];
      updatedFiles[index].comment = value;
      return { fileStates: updatedFiles };
    });
  };

  handleFileVerify = (index) => {
    this.setState((prevState) => {
      const updated = [...prevState.fileStates];
      updated[index].status = "verified";
      return { fileStates: updated };
    });
  };

  handleFileReject = (index) => {
    this.setState((prevState) => {
      const updated = [...prevState.fileStates];
      updated[index].status = "rejected";
      return { fileStates: updated };
    });
  };

  handleCommentChange = (e) => {
    this.setState({ comment: e.target.value });
  };

  handleVerify = () => {
    console.log("Application Verified ✅", this.state.comment);
  };

  handleReject = () => {
    console.log("Application Rejected ❌", this.state.comment);
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, preview, fileStates, comment } = this.state;

    return (
      <Grid container spacing={3}>
        {/* User Summary */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6"><b><FormattedMessage module="workforce" id="workforce.employee.details" /></b></Typography>
              <Divider />
              <Typography><b>First Name:</b> {stateEdited.firstNameBn}</Typography>
              <Typography><b>NID:</b> {stateEdited.nid}</Typography>
              <Typography><b>Phone:</b> {stateEdited.phoneNumber}</Typography>
              <Typography><b>Address:</b> {stateEdited.presentAddress}</Typography>
              <Typography><b>Email:</b> {stateEdited.email}</Typography>
              <Typography><b>Birth Cert No:</b> {stateEdited.birthCertificateNo}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Document Viewer */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Documents</Typography>
              {fileStates.map((file, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<i className="material-icons">expand_more</i>}>
                    <Typography>
                      Document #{index + 1} {file.type === "pdf" ? "(PDF)" : "(Image)"} {file.status ? ` - ${file.status}` : ""}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        {file.type === "image" ? (
                          <img
                            src={file.src}
                            alt="preview"
                            style={{ width: "100%", maxHeight: 300, objectFit: "contain" }}
                          />
                        ) : (
                          <Document file={file.src}>
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
                          value={file.comment}
                          onChange={(e) => this.handleFileCommentChange(index, e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} style={{ display: "flex", gap: 8 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => this.handleFileVerify(index)}
                          fullWidth
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => this.handleFileReject(index)}
                          fullWidth
                        >
                          Reject
                        </Button>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          {/* Final Comment Section */}
          {/* <Grid container spacing={2} style={{ marginTop: 12 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Comment"
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={2}
                value={comment}
                onChange={this.handleCommentChange}
              />
            </Grid>
            <Grid item xs={12} sm={4} style={{ display: "flex", gap: 8 }}>
              <Button variant="contained" color="primary" fullWidth onClick={this.handleVerify}>
                Verify
              </Button>
              <Button variant="outlined" color="error" fullWidth onClick={this.handleReject}>
                Reject
              </Button>
            </Grid>
          </Grid> */}
        </Grid>

        {/* Preview Modal */}
        <Dialog
          open={!!preview}
          onClose={this.handlePreviewClose}
          maxWidth="md"
          fullWidth
        >
          <DialogContent style={{ position: "relative" }}>
            <IconButton
              onClick={this.handlePreviewClose}
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
            {preview?.type === "image" ? (
              <img src={preview.src} alt="Full Preview" style={{ width: "100%" }} />
            ) : preview?.type === "pdf" ? (
              <Document file={preview.src}><Page pageNumber={1} /></Document>
            ) : null}
          </DialogContent>
        </Dialog>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  application: state.workforce.application,
});

export default connect(mapStateToProps)(withStyles(styles)(VerifyApplicationPage));
