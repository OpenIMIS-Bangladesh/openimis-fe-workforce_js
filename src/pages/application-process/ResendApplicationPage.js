import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AccordionDetails,
  TextField,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
} from "@material-ui/core";
import {
  withModulesManager,
  withHistory,
} from "@openimis/fe-core";
import { journalize, FormattedMessage } from "@openimis/fe-core";
import CloseIcon from "@material-ui/icons/Close";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Document, Page } from "react-pdf";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FileUploader from "../../pickers/FileUploader";
import { updateApplication } from "../../actions";

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
  rootGrid: {
    height: "calc(100vh - 64px)", // Adjust if you have AppBar
    overflow: "hidden",
  },
  leftGrid: {
    position: "sticky",
    top: 0,
    height: "100%",
    overflowY: "auto",
    paddingRight: 8,
  },
  rightGrid: {
    height: "100%",
    overflowY: "auto",
    paddingLeft: 8,
  },
  cardSpacing: {
    marginBottom: theme.spacing(2),
  },
});

class ResendApplicationPage extends Component {
  constructor(props) {
    super(props);
    const mockFiles = [
      {
        type: "image",
        src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Smart_NID_Card_%28Bangladesh%29.jpg",
        comment: "Clear image, all info visible.",
        status: "verified",
      },
      {
        type: "pdf",
        src: "/assets/Fahim_tazwer_cv.pdf",
        comment: "Missing signature on last page.",
        status: "rejected",
      },
    ];

    this.state = {
      applicationType: props?.application || {},
      stateEdited: props.application?.workforceEmployee || {},
      isSaved: false,
      preview: null,
      comment: "",
      mockFiles: mockFiles,
      fileStates: mockFiles,
      resendFile: null,
      // fileStates: mockFiles.map((file) => ({
      //   ...file,
      //   comment: "",
      //   status: null,
      // })),
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

  handleOpenResendModal = (fileIndex) => {
    this.setState({ resendFile: fileIndex });
  };

  handleCloseResendModal = () => {
    this.setState({ resendFile: null });
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

  handleResendDoccument = ()=>{
    // const {applicationUuid} = this.props
    // console.log({applicationUuid})
    // const updateApplicationData = {
    //           id: decodeId(selectedApplication.id),
    //           status: WORKFORCE_STATUS.SECOND_FORWARD,
    //         };
    //         dispatch(
    //           updateApplication(
    //             updateApplicationData,
    //             `update workforce application ${selectedApplication.workforceEmployee.firstNameEn}`,
    //           ),
    //         );
  }

  render() {
    const { classes } = this.props;
    const { stateEdited, preview, fileStates, comment, applicationType } =
      this.state;

    // console.log({ applicationUuid });

    return (
      <Grid container spacing={3} className={classes.rootGrid}>
        {/* Document Viewer */}
        <Grid item xs={12} className={classes.rightGrid}>
          <Card variant="outlined" className={classes.cardSpacing}>
            <CardContent>
              <Typography variant="h6">Documents</Typography>
              {fileStates.map((file, index) => (
                <Accordion key={index}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon className="material-icons" />}
                  >
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography>
                          Document #{index + 1}{" "}
                          {file.type === "pdf" ? "(PDF)" : "(Image)"}
                        </Typography>
                      </Grid>
                      <Grid item>
                        {file.status === "verified" && (
                          <Typography
                            style={{ color: "green", fontWeight: "bold" }}
                          >
                            ✅ Verified
                          </Typography>
                        )}
                        {file.status === "rejected" && (
                          <Typography
                            style={{ color: "red", fontWeight: "bold" }}
                          >
                            ❌ Rejected
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {/* Left side: Document */}
                      <Grid item xs={12} md={6}>
                        {file.type === "image" ? (
                          <img
                            src={file.src}
                            alt="preview"
                            style={{
                              width: "100%",
                              maxHeight: 400,
                              objectFit: "contain",
                              borderRadius: 8,
                            }}
                          />
                        ) : (
                          <Document file={file.src}>
                            <Page pageNumber={1} width={300} />
                          </Document>
                        )}
                      </Grid>

                      {/* Right side: Comment + Actions */}
                      <Grid item xs={12} md={6} container spacing={2} direction="column">
                        <Grid item>
                          <TextField
                            label="Comment"
                            fullWidth
                            variant="outlined"
                            size="small"
                            multiline
                            rows={4}
                            value={file.comment}
                            onChange={(e) => this.handleFileCommentChange(index,e.target.value)}
                          />
                        </Grid>

                        <Grid item>
                          <Button
                            variant="outlined"
                            fullWidth
                            color="default"
                            onClick={() => this.handleOpenResendModal(index)}
                          >
                            🔁 Resend Document
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
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
              <img
                src={preview.src}
                alt="Full Preview"
                style={{ width: "100%" }}
              />
            ) : preview?.type === "pdf" ? (
              <Document file={preview.src}>
                <Page pageNumber={1} />
              </Document>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* file upload modal */}
        <Dialog
          open={this.state.resendFile !== null}
          onClose={this.handleCloseResendModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent>
            <IconButton
              onClick={this.handleCloseResendModal}
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>

            {/* FileUploader goes here */}
            <Typography variant="h6" gutterBottom>
              Upload Replacement Document
            </Typography>

            {/* Replace with your actual FileUploader component */}
            
            <FileUploader fieldKey="resend_document" />
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.handleResendDoccument()}
              fullWidth
              style={{marginTop:6}}
            >
              {/* Verify */}
              <FormattedMessage
                module="workforce"
                id="workforce.submit"
              />
            </Button>
          </DialogContent>
        </Dialog>
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateApplication,
    },
    dispatch
  );

const mapStateToProps = (state) => ({
  application: state.workforce.application,
  // applicationUuid: props?.match?.params?.application_uuid,
});

export default withHistory(
  withModulesManager(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withTheme(withStyles(styles)(ResendApplicationPage)))
  ))

