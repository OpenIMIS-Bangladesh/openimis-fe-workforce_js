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
import CloseIcon from "@material-ui/icons/Close";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Document, Page } from "react-pdf";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage } from "@openimis/fe-core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { bindActionCreators } from "redux";
import { fetchApplication, fetchWorkforceDocument } from "../../actions";

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

class VerifyApplicationPage extends Component {
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
      comment: "",
      mockFiles: mockFiles,
      fileStates: mockFiles,
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

  componentDidMount() {
    const { dispatch, modulesManager, applicationUuid } = this.props;
    this.props.fetchApplication(modulesManager,[`id:"${applicationUuid}"`])
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${applicationUuid}"`]);
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
    const { classes, applicationUuid, documents,application } = this.props;
    const { stateEdited, preview, fileStates, comment, applicationType } = this.state;

    console.log({ mah_boob: application });

    return (
      <Grid container spacing={3} className={classes.rootGrid}>
        {/* User Summary */}
        <Grid item xs={12} md={4} className={classes.leftGrid}>
          <Card variant="outlined" className={classes.cardSpacing}>
            <CardContent>
              <Typography variant="h6">
                <b>
                  <FormattedMessage module="workforce" id="workforce.employee.application.details" />
                </b>
              </Typography>
              <Divider />
              <Typography>
                <b>Application Type:</b> {application?.applicationType}
              </Typography>
              <Typography>
                <b>Organization Type:</b> {application?.organizationType}
              </Typography>
              <Typography>
                <b>Applied By:</b> {application?.workforceEmployee?.firstNameEn}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" mt={2} className={classes.cardSpacing}>
            <CardContent>
              <Typography variant="h6">
                <b>
                  <FormattedMessage module="workforce" id="workforce.employee.details" />
                </b>
              </Typography>
              <Divider />
              <Typography>
                <b>First Name:</b> {application?.workforceEmployee?.firstNameBn}
              </Typography>
              <Typography>
                <b>NID:</b> {application?.workforceEmployee?.nid}
              </Typography>
              <Typography>
                <b>Phone:</b> {application?.workforceEmployee?.phoneNumber}
              </Typography>
              <Typography>
                <b>Address:</b> {application?.workforceEmployee?.presentAddress}
              </Typography>
              <Typography>
                <b>Email:</b> {application?.workforceEmployee?.email}
              </Typography>
              <Typography>
                <b>Birth Cert No:</b> {application?.workforceEmployee?.birthCertificateNo}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Document Viewer */}
        <Grid item xs={12} md={8} className={classes.rightGrid}>
          <Card variant="outlined" className={classes.cardSpacing}>
            <CardContent>
              <Typography variant="h6">Documents</Typography>
              {documents?.map((file, index) => {
                const isPDF = file.url?.toLowerCase().endsWith(".pdf");
                const type = isPDF ? "pdf" : "image";

                return (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon className="material-icons" />}>
                      <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                          <Typography>
                            {/* Document #{index + 1} {type === "pdf" ? "(PDF)" : "(Image)"} */}
                            {file.documentType } {type === "pdf" ? "(PDF)" : "(Image)"}
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
                          {type === "image" ? (
                            <img
                              src={file.url}
                              alt="preview"
                              style={{
                                width: "100%",
                                maxHeight: 300,
                                objectFit: "contain",
                              }}
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
                            onChange={(e) => this.handleFileCommentChange(index, e.target.value)}
                          />
                        </Grid>

                        <Grid item xs={12} style={{ display: "flex", gap: 8 }}>
                          <Button variant="contained" color="primary" onClick={() => this.handleFileVerify(index)} fullWidth>
                            <FormattedMessage module="workforce" id="workforce.application.verify" />
                          </Button>
                          <Button variant="outlined" color="error" onClick={() => this.handleFileReject(index)} fullWidth>
                            <FormattedMessage module="workforce" id="workforce.application.reject" />
                          </Button>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Modal */}
        <Dialog open={!!preview} onClose={this.handlePreviewClose} maxWidth="md" fullWidth>
          <DialogContent style={{ position: "relative" }}>
            <IconButton onClick={this.handlePreviewClose} style={{ position: "absolute", top: 8, right: 8 }}>
              <CloseIcon />
            </IconButton>
            {preview?.type === "image" ? (
              <img src={preview.src} alt="Full Preview" style={{ width: "100%" }} />
            ) : preview?.type === "pdf" ? (
              <Document file={preview.src}>
                <Page pageNumber={1} />
              </Document>
            ) : null}
          </DialogContent>
        </Dialog>
      </Grid>
    );
  }
}

const mapStateToProps = (state, props) => ({
  application: state.workforce.application,
  applicationUuid: props.match.params.application_uuid,
  documents: state.workforce.document,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplication,
      fetchWorkforceDocument,
      journalize,
      coreConfirm,
    },
    dispatch
  );

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VerifyApplicationPage))));
