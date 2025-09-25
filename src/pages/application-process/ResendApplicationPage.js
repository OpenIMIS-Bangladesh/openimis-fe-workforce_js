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
import { updateApplication, fetchApplicationWiseMovementList, fetchWorkforceDocument, updateWorkforceDocument, createApplicationMovement, createWorkforceDocument } from "../../actions";
import { bindActionCreators } from "redux";
import { WORKFORCE_STATUS } from "../../constants";
import DocumentReviewAccordion from "../../components/application-process/DocumentReviewAccordion";
import ConfirmModal from "../../components/application-process/modals/ConfirmModal";
import { safeApplicationId } from "../../utils/utils";
import CustomConfirmModal from "../../components/shared/CustomConfirmModal";

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
    minHeight: "calc(100vh - 64px)",
    overflowY: "auto",
    paddingBottom: theme.spacing(4),
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
      // applicationType: props?.application || {},
      // stateEdited: props.application?.workforceEmployee || {},
      isSaved: false,
      preview: null,
      note: "",
      mockFiles: mockFiles,

      uploadedFiles: [],
      fileStates: mockFiles.map((file) => ({
        ...file,
        note: "",
        status: null,
      })),
      lastRevertMovement:[],
      confirmModalOpen: false,
      confirmModalMessage: "",
      confirmModalCallback: null,
      // fileStates: mockFiles.map((file) => ({
      //   ...file,
      //   comment: "",
      //   status: null,
      // })),
    };
  }

  componentDidMount() {
    const { dispatch, modulesManager, application, applicationUuid } = this.props;
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${applicationUuid}"`]);

    if (applicationUuid) {
      this.fetchApplicationMovement();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({ stateEdited: this.props.application });
    }
    if (prevProps.documents !== this.props.documents) {
      this.setState({ fileStates: this.props.documents || [] });
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
      const result = await updateApplication(updateApplicationData, "update workforce application");
      console.log("GraphQL mutation result:", result);
    } catch (err) {
      console.error("Mutation error:", err);
    }
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

  fetchApplicationMovement = async () => {
    const { modulesManager, applicationUuid } = this.props;

    try {
      const response = await this.props.fetchApplicationWiseMovementList(modulesManager, { applicationId: applicationUuid });

      console.log("response", response);

      const movements = response?.payload?.data?.workforceApplicationMovement?.edges?.map((e) => e.node) || [];

      console.log("movements", movements);
      const clean = (html) => html?.replace(/<\/?[^>]+(>|$)/g, "") || "";

      const lastRevertMovement = [...movements].reverse().find((m) => m.revertNote);

      if (lastRevertMovement) {
        lastRevertMovement.revertNote = clean(lastRevertMovement.revertNote);
      }

      this.setState({
        movements,
        lastRevertMovement, // keep the whole object
        revertNotes: lastRevertMovement ? [lastRevertMovement.revertNote] : [],
      });
    } catch (error) {
      console.error("Failed to load revert notes", error);
    }
  };
  handleForward = async () => {
    const { applicationUuid, updateApplication, lastRevertMovement } = this.props;
    const { lastRevertMovement: stateRevertMovement } = this.state;

    const targetMovement = lastRevertMovement || stateRevertMovement;
    if (!targetMovement?.applicationFrom?.id) {
      console.error("No valid fromId found in lastRevertMovement");
      return;
    }

    const fromId = decodeId(targetMovement.applicationFrom.id);

    const updateApplicationData = {
      id: applicationUuid,
      status: WORKFORCE_STATUS.AMMENDED_APPLICATION,
    };

    try {
      const result = await updateApplication(updateApplicationData, "forward workforce application");
      console.log("Application updated:", result);

      const createApplicationMovementData = {
        applicationId: applicationUuid,
        applicationFromId: this.props.loggedInUserId,
        applicationToId: fromId,
        note: "amended application",
        status: WORKFORCE_STATUS.AMMENDED_APPLICATION,
      };

    await this.props.createApplicationMovement(createApplicationMovementData, "create workforce application movement");
    console.log("New movement inserted:", createApplicationMovementData);
    this.setState(
      {
      confirmModalOpen: true,
      confirmModalMessage: "DONE",
      confirmModalCallback: true,
      }
    )

      this.props.uploadFile.map((file, index) => {
        this.props.createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(this.props.applicationUuid) }, `Created workforce document `);
      });
    } catch (err) {
      console.error("Forward mutation error:", err);
    }
  };
 
  handleConfirmModalClose = (result) => {
    // if (this.state.confirmModalCallback) {
    //   this.state.confirmModalCallback(result === 1);
    // }else{
    //   this.setState({ confirmModalOpen: false });
    // }
    this.setState({ confirmModalOpen: false });
    
  };

  render() {
    const { classes, applicationUuid, documents, locale } = this.props;
    const { stateEdited, preview, fileStates, comment, applicationType, revertNotes, lastRevertMovement } = this.state;
    console.log({ revertNotes: revertNotes });

    return (
      <Grid container spacing={3} className={classes.rootGrid}>
        {/* Document Viewer */}
        <Grid item xs={12} className={classes.rightGrid}>
          {documents?.map((file, index) => (
            <DocumentReviewAccordion
              key={index}
              file={file}
              index={index}
              onFileChange={this.handleFileChange}
              onCommentChange={this.handleFileCommentChange}
              onVerify={this.handleFileVerify}
              onReject={this.handleFileReject}
              locale={locale}
              fromResend={true}
            />
          ))}
        </Grid>

        {lastRevertMovement && (
            <Card variant="outlined" className={classes.cardSpacing} style={{ marginTop: 16, paddingLeft: 24 }}>
              <CardContent>
                <Typography variant="h6">Last Revert Movement</Typography>
                <Typography><b>From:</b> {lastRevertMovement.applicationFrom?.loginName}</Typography>
                <Typography><b>To:</b> {lastRevertMovement.applicationTo?.loginName}</Typography>
                <Typography color="error"><b>Revert Note:</b> {lastRevertMovement.revertNote}</Typography>
              </CardContent>
            </Card>
          )}
        <Grid item xs={12} className={classes.rootGrid} style={{ paddingLeft: 24 }}>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: 16 }}
            onClick={() => this.setState({ confirmModalOpen: true })}
          >
            <FormattedMessage module="workforce" id="workforce.employee.application.forward" defaultMessage="Forward" />
          </Button>
        </Grid>
         <CustomConfirmModal
          open={this.state.confirmModalOpen}
          message={"workforce.application.forward.message"}
          onClose={this.handleConfirmModalClose}
          onConfirm={this.handleForward}
      />
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateApplication,
      fetchApplicationWiseMovementList,
      fetchWorkforceDocument,
      updateWorkforceDocument,
      createApplicationMovement,
    },
    dispatch
  );

const mapStateToProps = (state, props) => ({
  application: state.workforce.application,
  applicationUuid: props?.match?.params?.application_uuid,
  documents: state.workforce.document,
  uploadFile: state.workforce.uploadFile,
  locale: state.core?.user?.i_user?.language,
});

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(ResendApplicationPage)))));
