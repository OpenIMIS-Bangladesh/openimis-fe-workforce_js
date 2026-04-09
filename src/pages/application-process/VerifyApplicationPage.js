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
import {
  createApplicationMovement,
  createWorkforceDocumentMap,
  fetchApplication,
  fetchDocumentType,
  fetchRoles,
  fetchWorkforceDocument,
  updateApplication,
  updateApplicationSummary,
  updateWorkforceDocument,
} from "../../actions";
import DocumentReviewAccordion from "../../components/application-process/DocumentReviewAccordion";
import FileUploader from "../../pickers/FileUploader";
import { getUserTypeFromRights, safeDecodeId, safeParse, tryParse } from "../../utils/utils";
import { WORKFORCE_DOCUMENT_STATUS, WORKFORCE_USER_TYPE } from "../../constants";
import ApplicationViewPage from "../../components/application-forms/ApplicationViewPage";
import {
  handleBulkSelectedByAssociationLogic,
  handleBulkSelectedByCheckerLogic,
  handleApprovalByDoctor,
  handleApprovalByEisCommittee,
} from "../../utils/workforceForwardRevertActions";
import ConfirmModal from "../../components/application-process/modals/ConfirmModal";
import RevertApplicationModal from "../../components/application-process/modals/RevertApplicationModal";
import ForwardApplicationFactoryAdminModal from "../../components/application-process/modals/ForwardApplicationFactoryAdminModal";
import ForwardApplicationSectionAdminModal from "../../components/application-process/modals/ForwardApplicationSectionAdminModal";
import AddDependentModal from "../../components/shared/modals/AddDependentModal";
import GenereteEisDependentBFTN from "./GenereteEisDependentBFTN";
import { useSelector, useDispatch } from "react-redux";

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
    height: "auto",
    overflow: "visible",
  },
  leftGrid: {
    overflowY: "visible",
    height: "auto",
  },

  rightGrid: {
    height: "100%",
    overflowY: "auto",
    paddingLeft: 8,
  },
  cardSpacing: {
    marginBottom: theme.spacing(2),
  },

  gridRightPad: {
    paddingRight: "30px !important",
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
      addDependentModalOpen: false,
      forwardModalOpenFA: false,
      forwardModalOpenSA: false,
      revertModalOpen: false,
      confirmModalOpen: false,
      confirmModalMessage: "",
      confirmModalCallback: null,
      serverResponse: "",
      selectedApplication: null,
      eisDependentBFTNModalOpen: false,
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
    const { dispatch, modulesManager, applicationUuid, loggedInUserId } = this.props;
    await this.props.fetchApplication(modulesManager, [`id:"${applicationUuid}"`]);

    const { application } = this.props;
    const applicationType = application?.applicationType;
    const organizationType = application?.organizationType;
    const applicationFor = application?.applicationFor;
    const applicationForType = this.safeParse(application?.metadata);
    const doubleParseApplicationFor = this.safeParse(applicationForType);
    if (applicationType !== ("financialAssistance" || "disabilityAssistance") && organizationType && applicationFor !== ("" || null)) {
      this.props.fetchDocumentType(modulesManager, [
        `applicationType:"${applicationType}"`,
        `organizationType:"${organizationType}"`,
        `mandatoryForApplicant: false`,
        `applicationFor_Icontains:"${applicationFor}"`,
      ]);
    } else if (applicationType === "disabilityAssistance" && organizationType && applicationFor === ("" || null)) {
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
    this?.props?.fetchRoles(loggedInUserId);
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
    const { user_rights, application, loggedInUserId, user, roles } = this.props;
    const user_type = getUserTypeFromRights(user_rights);
    const file = this.state.fileStates[index];
    const today = new Date().toLocaleDateString('en-CA');
    const payload = {
      ...file,
      id: safeDecodeId(file.id),
      status:
        user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
          ? WORKFORCE_DOCUMENT_STATUS.FACTORY_ADMIN_VERIFIED
          : user_type === WORKFORCE_USER_TYPE.ASSOCIATION
            ? WORKFORCE_DOCUMENT_STATUS.ASSOCIATION_VERIFIED
            : user_type === WORKFORCE_USER_TYPE.EIS_OFFICER
              ? WORKFORCE_DOCUMENT_STATUS.EIS_OFFICER_VERIFIED
              : "",
      note: file.note,
      verifierId: loggedInUserId,
      verificationDate: today,
    };

    this.props.updateWorkforceDocument(payload, `update workforce document`).then(() => {
      const payload = {
        ...file,
        id: safeDecodeId(file.id),
        workforceApplicationId: safeDecodeId(application?.id),
        workforceDocumentId: safeDecodeId(file?.id),
        status:
          user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
            ? WORKFORCE_DOCUMENT_STATUS.FACTORY_ADMIN_VERIFIED
            : user_type === WORKFORCE_USER_TYPE.ASSOCIATION
              ? WORKFORCE_DOCUMENT_STATUS.ASSOCIATION_VERIFIED
              : user_type === WORKFORCE_USER_TYPE.EIS_OFFICER
                ? WORKFORCE_DOCUMENT_STATUS.EIS_OFFICER_VERIFIED
                : "",
        note: file.note,
        verifiedById: loggedInUserId,
        verifiedByRoleId: roles[0]?.roleId,
        verificationDate: today,
      };
      this.props.createWorkforceDocumentMap(payload,`create document map data`)
    });

    // optionally update UI optimistically
    this.setState((prevState) => {
      const updated = [...prevState.fileStates];
      updated[index].status = user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
          ? WORKFORCE_DOCUMENT_STATUS.FACTORY_ADMIN_REJECTED
          : user_type === WORKFORCE_USER_TYPE.ASSOCIATION
            ? WORKFORCE_DOCUMENT_STATUS.ASSOCIATION_REJECTED
            : user_type === WORKFORCE_USER_TYPE.EIS_OFFICER
              ? WORKFORCE_DOCUMENT_STATUS.EIS_OFFICER_REJECTED
              : "";
      return { fileStates: updated };
    });
  };

  handleFileReject = (index) => {
    const { user_rights, application, loggedInUserId, user, roles } = this.props;
    const user_type = getUserTypeFromRights(user_rights);
    const file = this.state.fileStates[index];
    const today = new Date().toLocaleDateString('en-CA');

    const payload = {
      ...file,
      id: safeDecodeId(file.id),
      status:
        user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
          ? WORKFORCE_DOCUMENT_STATUS.FACTORY_ADMIN_REJECTED
          : user_type === WORKFORCE_USER_TYPE.ASSOCIATION
            ? WORKFORCE_DOCUMENT_STATUS.ASSOCIATION_REJECTED
            : user_type === WORKFORCE_USER_TYPE.EIS_OFFICER
              ? WORKFORCE_DOCUMENT_STATUS.EIS_OFFICER_REJECTED
              : "",
      note: file.note,
      verifierId: loggedInUserId,
      verificationDate: today,
    };

    this.props.updateWorkforceDocument(payload, `update workforce document`).then(() => {
      const payload = {
        ...file,
        id: safeDecodeId(file.id),
        workforceApplicationId: safeDecodeId(application?.id),
        workforceDocumentId: safeDecodeId(file?.id),
        status:
          user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
            ? WORKFORCE_DOCUMENT_STATUS.FACTORY_ADMIN_REJECTED
            : user_type === WORKFORCE_USER_TYPE.ASSOCIATION
              ? WORKFORCE_DOCUMENT_STATUS.ASSOCIATION_REJECTED
              : user_type === WORKFORCE_USER_TYPE.EIS_OFFICER
                ? WORKFORCE_DOCUMENT_STATUS.EIS_OFFICER_REJECTED
                : "",
        note: file.note,
        verifiedById: loggedInUserId,
        verifiedByRoleId: roles[0]?.roleId,
        verificationDate: today,
      };
      this.props.createWorkforceDocumentMap(payload,`create document map data`)
    });

    this.setState((prevState) => {
      const updated = [...prevState.fileStates];
      updated[index].status = user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
          ? WORKFORCE_DOCUMENT_STATUS.FACTORY_ADMIN_REJECTED
          : user_type === WORKFORCE_USER_TYPE.ASSOCIATION
            ? WORKFORCE_DOCUMENT_STATUS.ASSOCIATION_REJECTED
            : user_type === WORKFORCE_USER_TYPE.EIS_OFFICER
              ? WORKFORCE_DOCUMENT_STATUS.EIS_OFFICER_REJECTED
              : "";
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

  handleForward = () => {
    const { user_rights, application, loggedInUserId } = this.props;
    const user_type = getUserTypeFromRights(user_rights);

    if (user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
      this.setState({ forwardModalOpenFA: true });
    } else if (user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
      this.setState({ forwardModalOpenSA: true });
    } else if (
      user_type === WORKFORCE_USER_TYPE.CHECKER ||
      user_type === WORKFORCE_USER_TYPE.CHECKER_TWO ||
      user_type === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR ||
      user_type === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR ||
      user_type === WORKFORCE_USER_TYPE.BLWF_CHECKER ||
      user_type === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE ||
      user_type === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR ||
      user_type === WORKFORCE_USER_TYPE.EIS_OFFICER
    ) {
      handleBulkSelectedByCheckerLogic({
        selectedApplicationIds: [{ id: application?.id }],
        loggedInUserId: this.props.loggedInUserId,
        userRights: this.props.user_rights,
        fetchWorkforceDocument: this.props.fetchWorkforceDocument,
        updateApplication: this.props.updateApplication,
        createApplicationMovement: this.props.createApplicationMovement,
        modulesManager: this.props.modulesManager,
        setServerResponse: (res) => this.setState({ serverResponse: res }),
        setConfirmModalOpen: (val) => this.setState({ confirmModalOpen: val }),
        setConfirmModalMessage: (msg) => this.setState({ confirmModalMessage: msg }),
        setConfirmModalCallback: (cb) => this.setState({ confirmModalCallback: cb }),
        history: this.props.history,
        dispatch: this.props.dispatch,
      });
    } else if (user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) {
      handleApprovalByDoctor({
        selectedApplicationIds: [{ id: application?.id }],
        loggedInUserId: this.props.loggedInUserId,
        userRights: this.props.user_rights,
        fetchWorkforceDocument: this.props.fetchWorkforceDocument,
        updateApplication: this.props.updateApplication,
        createApplicationMovement: this.props.createApplicationMovement,
        modulesManager: this.props.modulesManager,
        setServerResponse: (res) => this.setState({ serverResponse: res }),
        setConfirmModalOpen: (val) => this.setState({ confirmModalOpen: val }),
        setConfirmModalMessage: (msg) => this.setState({ confirmModalMessage: msg }),
        setConfirmModalCallback: (cb) => this.setState({ confirmModalCallback: cb }),
        history: this.props.history,
      });
    } else if (user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE || user_type === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE) {
      const summaryApplicationRes = this.props.dispatch(
        fetchApplication(this.props.modulesManager, [
          `eisApplicationSummaryId: "${safeDecodeId(summaryId)}"`,
          `statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_COMIITEE}"]`,
        ]),
      );
      const summaryApplicationsLength = Number(summaryApplicationRes?.payload?.data?.workforceApplication?.totalCount ?? 0);
      handleApprovalByEisCommittee({
        selectedApplicationIds: [{ id: application?.id }],
        loggedInUserId: this.props.loggedInUserId,
        userRights: this.props.user_rights,
        modulesManager: this.props.modulesManager,
        fetchWorkforceDocument: this.props.fetchWorkforceDocument,
        updateApplication: this.props.updateApplication,
        createApplicationMovement: this.props.createApplicationMovement,
        updateApplicationSummary: this.props.updateApplicationSummary,
        setServerResponse: (res) => this.setState({ serverResponse: res }),
        setConfirmModalOpen: (val) => this.setState({ confirmModalOpen: val }),
        setConfirmModalMessage: (msg) => this.setState({ confirmModalMessage: msg }),
        setConfirmModalCallback: (cb) => this.setState({ confirmModalCallback: cb }),
        summaryId: application?.eisApplicationSummary?.id,
        eisApprovalIds: application?.eisApprovalIds,
        eisApprovedByIds: application?.eisApprovedByIds,
        history: this.props.history,
      });
    } else {
      handleBulkSelectedByAssociationLogic({
        selectedApplicationIds: [{ id: application?.id }],
        loggedInUserId,
        updateApplication: this.props.updateApplication,
        createApplicationMovement: this.props.createApplicationMovement,
        setServerResponse: (res) => this.setState({ serverResponse: res }),
        setConfirmModalOpen: (val) => this.setState({ confirmModalOpen: val }),
        setConfirmModalMessage: (msg) => this.setState({ confirmModalMessage: msg }),
        setConfirmModalCallback: (cb) => this.setState({ confirmModalCallback: cb }),
      });
    }
  };

  handleRevert = () => {
    this.setState({ revertModalOpen: true, selectedApplication: this.props.application });
  };

  render() {
    const { classes, applicationUuid, documents, application, documentType, locale, user_rights, user, roles } = this.props;
    const { stateEdited, preview, fileStates, comment, applicationType } = this.state;
    const user_type = getUserTypeFromRights(user_rights);
    const bankInfo = this.safeParse(application?.employeeBankInfo);
    const AccidentInfo = this.safeParse(application?.employeeAccidentInfo);
    const dependentInfo = this.safeParse(application?.employeeDependentInfo);
    const childrenInfo = this.safeParse(application?.employeeChildrenInfo);
    const applicantInfo = this.safeParse(application?.applicantInfo);
    const institutionInfo = this.safeParse(stateEdited?.institutionInfo);
    const deceasedWorkerInfo = this.safeParse(stateEdited?.deceasedWorkerInfo);
    const doctorsEntryInfo = this.safeParse(stateEdited?.doctorsEntry);
    const metaInfo = this.safeParse(application?.metadata);
    const parsedWorkforceEmployeeDependentApplication = application?.workforceEmployeeDependentApplication;
    const tempBankInfo = application?.employeeBankingInfoApplication?.map((item) => {
      return { ...item, bank: { ...item?.branch?.parent } };
    });

    console.log("verify application", application);
    const formData = {
      ...application,
      workforceEmployee: application?.workforceEmployee,
      employeeAccidentInfo: this.safeParse(AccidentInfo),
      employeeBankInfo: this.safeParse(bankInfo),
      employeeDependentInfo: this.safeParse(dependentInfo),
      employeeChildrenInfo: this.safeParse(childrenInfo),
      applicantInfo: this.safeParse(applicantInfo),
      institutionInfo: this.safeParse(institutionInfo),
      deceasedWorkerInfo: this.safeParse(deceasedWorkerInfo),
      doctorsEntry: this.safeParse(doctorsEntryInfo),
      metadata: this.safeParse(metaInfo),
      otherInfo: this.safeParse(metaInfo),
      workforceEmployeeDependentApplication: parsedWorkforceEmployeeDependentApplication,
      employeeBankingInfoApplication: tempBankInfo,
    };

    const filteredDocumentTypes = documentType?.filter((doc) => {
      // check if there’s already a file uploaded for this doc
      const isUploaded = fileStates?.some((file) => file?.workforceDocumentType?.id === doc?.id);
      console.log({ isUploaded });

      // return docs that are not uploaded
      return !isUploaded;
    });

    console.log({ roles });
    return (
      <>
        {(user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ||
          user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
          user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION ||
          user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN ||
          user_type === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ||
          user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR ||
          user_type === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE ||
          user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE ||
          user_type === WORKFORCE_USER_TYPE.EIS_ADVISOR ||
          user_type === WORKFORCE_USER_TYPE.CHECKER ||
          user_type === WORKFORCE_USER_TYPE.CHECKER_TWO ||
          user_type === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR ||
          user_type === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR ||
          user_type === WORKFORCE_USER_TYPE.BLWF_CHECKER ||
          user_type === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE ||
          user_type === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR ||
          user_type === WORKFORCE_USER_TYPE.EIS_OFFICER ||
          user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) && (
          <Grid container spacing={2} className={classes.gridRightPad} style={{ marginTop: "16px", padding: 4, display: "flex", justifyContent: "flex-end" }}>
            {/* <Grid item xs={6}></Grid> */}
            {user_type === WORKFORCE_USER_TYPE.EIS_OFFICER && application?.applicationType === "financialAssistance" && (
              <Grid item xs={2}>
                <Button variant="contained" color="primary" fullWidth onClick={() => this.setState({ addDependentModalOpen: true })}>
                  <FormattedMessage id="workforce.application.steps.dependentAdd" defaultMessage="Add Dependent" />
                </Button>
              </Grid>
            )}
            {(user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR ||
              user_type === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE ||
              user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE ||
              user_type === WORKFORCE_USER_TYPE.EIS_ADVISOR) && (
              <Grid item xs={2}>
                <Button variant="contained" color="primary" fullWidth onClick={() => this.setState({ eisDependentBFTNModalOpen: true })}>
                  <FormattedMessage id="workforce.employee.application.paymentProcess" defaultMessage="Payment Calculation" />
                </Button>
              </Grid>
            )}
            {user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE || user_type === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE ? (
              !safeParse(this.props.application?.eisApprovedByIds)?.includes(this.props.loggedInUserId) && (
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={this.props.application?.isHistory}
                    onClick={() => {
                      this.handleForward();
                    }}
                  >
                    <FormattedMessage module="workforce" id="workforce.employee.application.eis_committee.recommended" />
                  </Button>
                </Grid>
              )
            ) : (
              <Grid item xs={2}>
                <Button variant="contained" color="primary" fullWidth onClick={this.handleForward}>
                  <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                </Button>
              </Grid>
            )}
            <Grid item xs={2}>
              <Button variant="contained" color="primary" fullWidth onClick={this.handleRevert}>
                <FormattedMessage module="workforce" id="workforce.employee.application.revert" />
              </Button>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3} className={classes.rootGrid}>
          {/* User Summary */}
          <Grid item xs={12} md={12} className={classes.leftGrid}>
            {user_type !== WORKFORCE_USER_TYPE.APPLICANT && filteredDocumentTypes ? (
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
                viewedFromFlag={"verify"}
              />
            ) : (
              <ApplicationViewPage application={formData} language={locale} fileStates={fileStates} viewedFromFlag={"verify"} />
            )}
          </Grid>
        </Grid>

        {this.state.addDependentModalOpen && (
          <AddDependentModal open={this.state.addDependentModalOpen} onClose={() => this.setState({ addDependentModalOpen: false })} application={formData} />
        )}
        {this.state.eisDependentBFTNModalOpen && (
          <GenereteEisDependentBFTN
            open={this.state.eisDependentBFTNModalOpen}
            onClose={() => this.setState({ eisDependentBFTNModalOpen: false })}
            status="approved_by_committee"
            userRights={this.props.user_rights}
            selectedApplicationIds={[{ id: this.props.application?.id }]}
          />
        )}

        {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && (
          <ForwardApplicationFactoryAdminModal
            open={this.state.forwardModalOpenFA}
            onClose={() => this.setState({ forwardModalOpenFA: false })}
            selectedApplicationIds={[{ id: this.props.application?.id }]}
            organizationEmployee={this.props.organizationEmployee}
            roles = {roles}
          />
        )}

        {(user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN ||
          user_type === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ||
          user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR) && (
          <ForwardApplicationSectionAdminModal
            open={this.state.forwardModalOpenSA}
            onClose={() => this.setState({ forwardModalOpenSA: false })}
            selectedApplicationIds={[{ id: this.props.application?.id }]}
            // onSubmitForward={th  is.handleForwardSubmit}
            userRights={user_rights}
          />
        )}

        {user_type !== WORKFORCE_USER_TYPE.APPLICANT && (
          <RevertApplicationModal
            open={this.state.revertModalOpen}
            onClose={() => this.setState({ revertModalOpen: false })}
            selectedApplication={this.state.selectedApplication}
          />
        )}

        <ConfirmModal
          open={this.state.confirmModalOpen}
          message={this.state.confirmModalMessage}
          onClose={(result) => {
            if (this.state.confirmModalCallback) {
              this.state.confirmModalCallback(result === 1);
            } else {
              this.setState({ confirmModalOpen: false });
            }
          }}
        />
      </>
    );
  }
}

const mapStateToProps = (state, props) => ({
  application: state.workforce.application,
  applicationUuid: props.match.params.application_uuid,
  documents: state.workforce.document,
  documentType: state.workforce.documentType,
  user_rights: state.core?.user?.i_user?.rights,
  locale: state.core?.user?.i_user?.language,
  loggedInUserId: state.core?.user?.i_user?.id,
  user: state.profile.user,
  roles: state?.workforce?.roles,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      fetchApplication,
      fetchWorkforceDocument,
      fetchDocumentType,
      updateWorkforceDocument,
      journalize,
      coreConfirm,
      updateApplication,
      createApplicationMovement,
      updateApplicationSummary,
      createApplicationMovement,
      createWorkforceDocumentMap,
      fetchRoles,
    },
    dispatch,
  ),
  dispatch,
});

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VerifyApplicationPage))));
