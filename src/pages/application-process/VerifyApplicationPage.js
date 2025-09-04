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
  CardHeader,
  Box,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage, decodeId } from "@openimis/fe-core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { bindActionCreators } from "redux";
import { fetchApplication, fetchDocumentType, fetchWorkforceDocument, updateWorkforceDocument } from "../../actions";
import DocumentReviewAccordion from "../../components/application-process/DocumentReviewAccordion";
import FileUploader from "../../pickers/FileUploader";
import { getUserTypeFromRights, tryParse } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import ApplicationViewPage from "../../components/application-forms/ApplicationViewPage";

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
      note: "",
      mockFiles: mockFiles,
      uploadedFiles: [],
      fileStates: mockFiles.map((file) => ({
        ...file,
        note: "",
        status: null,
      })),
    };
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

  async componentDidMount() {
    const { dispatch, modulesManager, applicationUuid } = this.props;
    await this.props.fetchApplication(modulesManager, [`id:"${applicationUuid}"`]);

    const { application } = this.props;
    const applicationType = application?.applicationType;
    const organizationType = application?.organizationType;
    const applicationFor = application?.applicationFor;
    const applicationForType = this.safeParse(application?.metadata);
    const doubleParseApplicationFor = this.safeParse(applicationForType);
    if (applicationType !==("financialAssistance"||"disabilityAssistance") && organizationType && applicationFor !==(""||null)) {
      this.props.fetchDocumentType(modulesManager, [
        `applicationType:"${applicationType}"`,
        `organizationType:"${organizationType}"`,
        `mandatoryForApplicant: false`,
        `applicationFor_Icontains:"${applicationFor}"`,
      ]);
    } else if (applicationType === "disabilityAssistance" && organizationType && applicationFor === (""||null)) {
      console.log({ hello: doubleParseApplicationFor });
      doubleParseApplicationFor.disabilityType === "partial"
        ? this.props.fetchDocumentType(modulesManager, [
            `applicationType:"${applicationType}"`,
            `organizationType:"${organizationType}"`,
            `mandatoryForApplicant: false`,
            `applicationFor_Icontains:"temporary_disability"`,
          ])
        : this.props.fetchDocumentType(modulesManager, [
            `applicationType:"${applicationType}"`,
            `organizationType:"${organizationType}"`,
            `mandatoryForApplicant: false`,
            `applicationFor_Icontains:"temporary_disability"`,
          ]);
    } else if (applicationType === "financialAssistance" && organizationType) {
      console.log({ helloFormFinance: doubleParseApplicationFor });
      doubleParseApplicationFor.deathType === "normalDeath"
        ? this.props.fetchDocumentType(modulesManager, [
            `applicationType:"${applicationType}"`,
            `organizationType:"${organizationType}"`,
            `mandatoryForApplicant: false`,
            `applicationFor_Icontains:"normal_death"`,
          ])
        : this.props.fetchDocumentType(modulesManager, [
            `applicationType:"${applicationType}"`,
            `organizationType:"${organizationType}"`,
            `mandatoryForApplicant: false`,
            `applicationFor_Icontains:"accidental_death"`,
          ]);
    } else {
      this.props.fetchDocumentType(modulesManager, [
        `applicationType:"${applicationType}"`,
        `organizationType:"${organizationType}"`,
        `mandatoryForApplicant: false`,
      ]);
    }
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${applicationUuid}"`]);
  }

  handlePreviewOpen = (file) => {
    this.setState({ preview: file });
  };

  handlePreviewClose = () => {
    this.setState({ preview: null });
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

  safeParse = (data) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.warn("Failed to parse JSON:", data);
        return {};
      }
    }
    return data || {};
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

  render() {
    const { classes, applicationUuid, documents, application, documentType, locale, user_rights } = this.props;
    const { stateEdited, preview, fileStates, comment, applicationType } = this.state;
    const user_type = getUserTypeFromRights(user_rights);
    // console.log({ mah_boob: documentType });
    // console.log({ my_boob: fileStates });
    const bankInfo = this.safeParse(application?.employeeBankInfo);
    const AccidentInfo = this.safeParse(application?.employeeAccidentInfo);
    const dependentInfo = this.safeParse(application?.employeeDependentInfo);
    const childrenInfo = this.safeParse(application?.employeeChildrenInfo);
    const applicantInfo = this.safeParse(application?.applicantInfo);
    const metaInfo = this.safeParse(application?.metadata);

    const formData = {
      ...application,
      workforceEmployee: application?.workforceEmployee,
      employeeAccidentInfo: this.safeParse(AccidentInfo),
      employeeBankInfo: this.safeParse(bankInfo),
      employeeDependentInfo: this.safeParse(dependentInfo),
      employeeChildrenInfo: this.safeParse(childrenInfo),
      applicantInfo: this.safeParse(applicantInfo),
      metadata: this.safeParse(metaInfo),
    };
    console.log(documentType);
    // const filteredDocumentTypes = documentType?.filter((doc) => {
    //   const matchedFile = fileStates?.find((file) => {
    //     return file?.workforceDocumentType?.id === doc?.id  && file?.workforceDocumentType?.mandatoryForApplicant === false;
    //   });
    //   return matchedFile
    // });
    const filteredDocumentTypes = documentType?.filter((doc) => {
      // check if there’s already a file uploaded for this doc
      const isUploaded = fileStates?.some((file) => file?.workforceDocumentType?.id === doc?.id);
      console.log({ isUploaded });

      // return docs that are not uploaded
      return !isUploaded;
    });

    console.log("filteredDocumentTypes", filteredDocumentTypes);
    console.log({ fileStates });
    return (
      <Grid container spacing={3} className={classes.rootGrid}>
        {/* User Summary */}
        <Grid item xs={12} md={12} className={classes.leftGrid}>
          {/* <Card variant="outlined" className={classes.cardSpacing}>
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
          </Card> */}
          {user_type !== WORKFORCE_USER_TYPE.FACTORY_ADMIN && filteredDocumentTypes ? (
            // <Card variant="outlined" mt={2} className={classes.cardSpacing}>
            //   <CardContent>
            //     <Typography variant="h6">
            //       <b>
            //         <FormattedMessage module="workforce" id="workforce.employee.upload.factory.document" />
            //       </b>
            //     </Typography>
            //     <Divider />
            //     {filteredDocumentTypes?.map((document, index) => (
            //           <Box style={{marginTop:"10px"}}>
            //             <Typography>{document.nameBn}</Typography>
            //             <FileUploader fieldKey={document.fieldId} applicationId={applicationUuid} onFileChange={this.handleFileChange} documentType={document.documentType} documentProp={document}  uploadedBy={"factoryAdmin"}/>
            //           </Box>
            //     ))}
            //   </CardContent>
            // </Card>
            <ApplicationViewPage
              application={formData}
              language={locale}
              filteredDocumentTypes={filteredDocumentTypes}
              applicationUuid={applicationUuid}
              onFileChange={this.handleFileChange}
              fileStates={fileStates}
              handleCommentChange={this.handleFileCommentChange}
              handleFileVerify={this.handleFileVerify}
              handleFileReject={this.handleFileReject}
            />
          ) : (
            <ApplicationViewPage application={formData} language={locale} />
          )}
        </Grid>

        {/* Document Viewer */}
        {/* <Grid item xs={12} md={8} className={classes.rightGrid}>
          <Card variant="outlined" className={classes.cardSpacing}>
            <CardContent>
              <Typography variant="h6">
                <FormattedMessage module="workforce" id="workforce.employee.document" />
              </Typography>

              {fileStates?.map((file, index) => (
                <DocumentReviewAccordion
                  key={index}
                  file={file} // ✅ from editable local state
                  index={index}
                  onCommentChange={this.handleFileCommentChange}
                  onVerify={this.handleFileVerify}
                  onReject={this.handleFileReject}
                  locale={locale}
                />
              ))}
            </CardContent>
          </Card>
        </Grid> */}

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
  documentType: state.workforce.documentType,
  user_rights: state.core?.user?.i_user?.rights || {},
  locale: state.core?.user?.i_user?.language,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplication,
      fetchWorkforceDocument,
      fetchDocumentType,
      updateWorkforceDocument,
      journalize,
      coreConfirm,
    },
    dispatch
  );

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VerifyApplicationPage))));
