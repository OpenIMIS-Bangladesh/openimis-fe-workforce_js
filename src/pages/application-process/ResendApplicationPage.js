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
import { withModulesManager, withHistory, decodeId } from "@openimis/fe-core";
import { journalize, FormattedMessage } from "@openimis/fe-core";
import CloseIcon from "@material-ui/icons/Close";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Document, Page } from "react-pdf";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FileUploader from "../../pickers/FileUploader";
import { updateApplication,fetchApplicationMovementsSummary, fetchWorkforceDocument, updateWorkforceDocument } from "../../actions";
import { bindActionCreators } from "redux";
import { WORKFORCE_STATUS } from "../../constants";
import DocumentReviewAccordion from "../../components/application-process/DocumentReviewAccordion";

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
      revertNotes: [],

      // fileStates: mockFiles.map((file) => ({
      //   ...file,
      //   comment: "",
      //   status: null,
      // })),
    };
  }

  componentDidMount() {
    const { dispatch, modulesManager, application } = this.props;
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${application?.id}"`]);

  // if (this.props.applicationUuid) {
  //   this.fetchApplicationMovement();
  //  this.props.fetchApplicationMovementsSummary(this.props.modulesManager, [`applicationId: "${this.props.applicationUuid}"`])
  // }
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
      console.log(index, value);
      this.setState((prevState) => {
        if (!prevState.fileStates || !prevState.fileStates[index]) {
          return {};
        }
        const updatedFiles = [...prevState.fileStates];
        updatedFiles[index] = { ...updatedFiles[index], note: value };
        return { fileStates: updatedFiles };
      });
    };
  
    handleCommentChange = (e) => {
      this.setState({ note: e.target.value });
    };
  
    handleFileVerify = (index) => {
      const file = this.state.fileStates[index];
      const payload = {
        ...file,
        id: decodeId(file.id),
        status: "verified",
        note: file.note,
      };
  
      this.props.updateWorkforceDocument(payload, `update workforce document`);
  
      // optionally update UI optimistically
      this.setState((prevState) => {
        const updated = [...prevState.fileStates];
        updated[index].status = "verified";
        return { fileStates: updated };
      });
    };
  
    handleFileReject = (index) => {
      const file = this.state.fileStates[index];
      const payload = {
        ...file,
        id: decodeId(file.id),
        status: "rejected",
        note: file.note,
      };
  
      this.props.updateWorkforceDocument(payload, `update workforce document`); // 👈 dispatch here
  
      this.setState((prevState) => {
        const updated = [...prevState.fileStates];
        updated[index].status = "rejected";
        return { fileStates: updated };
      });
    };
  

  handleCommentChange = (e) => {
    this.setState({ comment: e.target.value });
  };

  handleFileChange = (fieldKey, files) => {
    this.setState((prevState) => {
      const existingIndex = prevState.uploadedFiles.findIndex((item) => item.fieldKey === fieldKey);

      let updatedFiles = [...prevState.uploadedFiles];
      if (existingIndex !== -1) {
        updatedFiles[existingIndex] = { fieldKey, files };
      } else {
        updatedFiles.push({ fieldKey, files });
      }

      return { uploadedFiles: updatedFiles };
    });
  };

handleResendDocument = async () => {
  const { applicationUuid, updateApplication } = this.props;

  console.log("UUID:", applicationUuid);

  const updateApplicationData = {
    id: applicationUuid,
    status: WORKFORCE_STATUS.NEW,
  };

  try {
    const result = await updateApplication(
      updateApplicationData,
      "update workforce application"
    );
    console.log("GraphQL mutation result:", result);
  } catch (err) {
    console.error("Mutation error:", err);
  }
};

fetchApplicationMovement = async () => {
  const { modulesManager, applicationUuid } = this.props;
  const filters = [`applicationId: "${applicationUuid}"`];

  try {
    const response = await fetchApplicationMovementsSummary(modulesManager, filters);
    const movements = response?.data?.workforceApplicationMovement?.items || [];

    const revertNotes = movements
      .filter(m => m.revertNote)
      .map(m => m.revertNote);

    this.setState({ revertNotes });
  } catch (error) {
    console.error("Failed to load revert notes", error);
  }
};


  render() {
    const { classes, applicationUuid,documents } = this.props;
    const { stateEdited, preview, fileStates, comment, applicationType,revertNotes } = this.state;
    console.log({ "revertNotes":revertNotes });

    return (
      <Grid container spacing={3} className={classes.rootGrid}>
        {/* Document Viewer */}
        <Grid item xs={12} className={classes.rightGrid}>
          
          {documents?.map((file, index) => (
                <DocumentReviewAccordion
                  key={index}
                  file={file}
                  index={index}
                  onCommentChange={this.handleFileCommentChange}
                  onVerify={this.handleFileVerify}
                  onReject={this.handleFileReject}
                  locale={locale}
                />
              ))}
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
              onClick={ this.handleResendDocument }
              fullWidth
              style={{ marginTop: 6 }}
            >
              {/* Verify */}
              <FormattedMessage module="workforce" id="workforce.submit" />
            </Button>
          </DialogContent>
        </Dialog>
      {/* {revertNotes?.length > 0 && (
        <Card variant="outlined" className={classes.cardSpacing}>
          <CardContent>
            <Typography variant="h6">Revert Notes</Typography>
            {revertNotes.map((note, idx) => (
              <Typography key={idx} style={{ marginTop: 8 }}>
                • {note}
              </Typography>
            ))}
          </CardContent>
        </Card>
      )} */}
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateApplication,
      fetchApplicationMovementsSummary,
      fetchWorkforceDocument,
      updateWorkforceDocument
    },
    dispatch
  );

const mapStateToProps = (state, props) => ({
  application: state.workforce.application,
  applicationUuid: props?.match?.params?.application_uuid,
  documents: state.workforce.document,
});

export default withHistory(
  withModulesManager(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withTheme(withStyles(styles)(ResendApplicationPage)))
  )
);
