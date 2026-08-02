import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Paper, Typography, Divider, IconButton, Card, Button, Box, Modal } from "@material-ui/core";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import PreviewDetails from "../../components/application-forms/PreviewDetails";
import ForwardApplicationAdminModal from "../../components/application-process/modals/ForwardApplicationAdminModal";
import { WORKFORCE_STATUS, WORKFORCE_USER_TYPE } from "../../constants";
import { conditionalEnToBn, getUserTypeFromRights, isBlwfPath, isEisPath, safeDecodeId, safeParse } from "../../utils/utils";
import { createApplicationMovement, fetchApplicationWiseMovementList, fetchWorkforceDocument, updateApplication, updateApplicationSummary } from "../../actions";
import { bindActionCreators } from "redux";
import DocumentReviewAccordion from "../../components/application-process/DocumentReviewAccordion";
import ApplicationViewPage from "../../components/application-forms/ApplicationViewPage";
import PrintIcon from "@material-ui/icons/Print";
import CloseIcon from "@material-ui/icons/Close";
import { ApplicationPrintPreview } from "../../components/shared/ApplicationPrintPreview";
import ForwardApplicationFactoryAdminModal from "../../components/application-process/modals/ForwardApplicationFactoryAdminModal";
import RevertApplicationModal from "../../components/application-process/modals/RevertApplicationModal";
import {
  handleApprovalByEisCommittee,
  handleBulkSelectedByAssociationLogic,
  handleBulkSelectedByCheckerLogic,
} from "../../utils/workforceForwardRevertActions";
import ConfirmModal from "../../components/application-process/modals/ConfirmModal";
import GenereteEisDependentBFTN from "./GenereteEisDependentBFTN";

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(1),
    width: "100%",
    margin: "0 auto",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "scroll",
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
  overrideReadOnly: {
    "& .Mui-disabled": {
      color: `${theme.palette.text.primary} !important`,
    },
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
});

class ViewApplicationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.application || {},
      workforceEmployee: props?.application?.workforceEmployee || {},
      isForwardModalOpen: false,
      forwardModalOpenFA: false,
      revertModalOpen: false,
      selectedApplication: null,
      confirmModalOpen: false,
      confirmModalMessage: "",
      serverResponse: "",
      confirmModalCallback: null,
      movementLogs: null,
      open: false,
      selectedApplication: null,
      eisDependentBFTNModalOpen: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({
        workforceEmployee: this.props.application?.workforceEmployee || {},
        stateEdited: this.props.application || {},
      });
    }

    // FIX: Update the memoized application ONLY if the ID or the object reference changes
    // Use prevProps.application?.id !== this.props.application?.id OR this.props.application !== prevProps.application
    // if (this.props.application !== prevProps.application) {
    //   this.memoizedApplication = this.props.application;
    // }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  // ✅ Safe JSON parser
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

  handleOpenForwardModal = () => {
    this.setState({ isForwardModalOpen: true });
  };

  handleCloseForwardModal = () => {
    this.setState({ isForwardModalOpen: false });
  };

  handlePrint = () => {
    this.setState({ open: true });
  };
  handleReject = (application) => {
    const { selectedApplication } = this.state;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.reject.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          this.setState(
            {
              selectedApplication: {
                ...application,
                isHistory: true,
              },
            },
            async () => {
              const updateApplicationData = {
                id: safeDecodeId(application?.id),
                status: WORKFORCE_STATUS.REJECTED,
              };
              const createApplicationMovementData = {
                applicationId: safeDecodeId(application?.id),
                status: WORKFORCE_STATUS.REJECTED,
                note: "আবেদন বাতিল করা হয়েছে",
                action: "rejected",
              };
              try {
                await this.props.updateApplication(updateApplicationData, "update workforce application");
                await this.props.createApplicationMovement(createApplicationMovementData, "create workforce movement");
                this.setState({
                  serverResponse: {
                    status: "SUCCESS",
                    message: "আবেদন বাতিল করা হয়েছে!",
                  },
                });
                window.location.reload();
              } catch (error) {
                console.error("Approval failed:", error);
                this.setState({
                  serverResponse: {
                    status: "ERROR",
                    message: "আবেদন বাতিল ব্যর্থ হয়েছে!",
                  },
                });
              }
            },
          );
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      },
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
    } else if (user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE || user_type === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE) {
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
        dispatch: this.props.dispatch,
        history: this.props.history,
        setCloseLoader:(l)=>this.setState({loader:l}),
        loader:this.state.loader
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

  componentDidMount() {
    const { dispatch, modulesManager, application } = this.props;
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${application?.id}"`]);
    this.props
      .fetchApplicationWiseMovementList(modulesManager, {
        applicationId: application?.id,
        orderBy: ["-dateCreated"],
      })
      .then((res) => {
        console.log(res);
        const edges = res?.payload?.data?.workforceApplicationMovement?.edges || [];
        const allUsers = edges.flatMap(({ node }) => (node.applicationTo ? [node.applicationTo] : [])).filter(Boolean);
        console.log({ edges });
        console.log({ allUsers });
        const users = [
          {
            id: "applicant001",
            name: application?.workforceEmployee?.firstNameBn || "আবেদনকারী",
            note: "একটি নতুন আবেদন করা হয়েছে",
            status: "new",
            role: "Applicant",
            date: conditionalEnToBn(application?.dateCreated?.split("T")[0], this.props.locale),
          },
          ...allUsers.map((u, index) => ({
            id: u.id,
            name: u.loginName,
            role: u?.userRoles?.[0]?.role?.name || "User",
            note: edges?.[index]?.node?.note,
            status: edges?.[index]?.node?.status,
            revertNote: edges?.[index]?.node?.revertNote,
            date: conditionalEnToBn(edges?.[index]?.node?.dateCreated?.split("T")[0], this.props.locale),
          })),
        ];
        // setMovementLogs(users);
        this.setState({ movementLogs: users });
      })
      .catch((err) => console.error("Movement fetch failed", err));
  }

  render() {
    const { classes, user_rights, documents, application, locale, organizationEmployee, history, edited_id } = this.props;
    const { stateEdited, workforceEmployee, isForwardModalOpen, forwardModalOpenFA } = this.state;
    // const application = this.memoizedApplication

    const user_type = getUserTypeFromRights(user_rights);

    const bankInfo = this.safeParse(stateEdited?.employeeBankInfo);
    const AccidentInfo = this.safeParse(stateEdited?.employeeAccidentInfo);
    const dependentInfo = this.safeParse(stateEdited?.employeeDependentInfo);
    const childrenInfo = this.safeParse(stateEdited?.employeeChildrenInfo);
    const applicantInfo = this.safeParse(stateEdited?.applicantInfo);
    const institutionInfo = this.safeParse(stateEdited?.institutionInfo);
    const deceasedWorkerInfo = this.safeParse(stateEdited?.deceasedWorkerInfo);
    const metaInfo = this.safeParse(stateEdited?.metadata);
    const doctorsEntry = this.safeParse(stateEdited?.doctorsEntry);
    const parsedWorkforceEmployeeDependentApplication = application?.workforceEmployeeDependentApplication;
    const tempBankInfo = application?.employeeBankingInfoApplication?.map((item) => {
      return { ...item, bank: { ...item?.branch?.parent } };
    });

    // ✅ Safely parse nested stringified objects
    const formData = {
      ...stateEdited,
      workforceEmployee: workforceEmployee,
      employeeAccidentInfo: this.safeParse(AccidentInfo),
      employeeBankInfo: this.safeParse(bankInfo),
      employeeDependentInfo: this.safeParse(dependentInfo),
      employeeChildrenInfo: this.safeParse(childrenInfo),
      applicantInfo: this.safeParse(applicantInfo),
      institutionInfo: this.safeParse(institutionInfo),
      doctorsEntry: this.safeParse(doctorsEntry),
      deceasedWorkerInfo: this.safeParse(deceasedWorkerInfo),
      workforceEmployeeDependentApplication: parsedWorkforceEmployeeDependentApplication,
      metadata: this.safeParse(metaInfo),
      employeeBankingInfoApplication: tempBankInfo,
    };

    const uploadByApplicant = documents?.filter((doc) => doc.holderType === "applicant");
    const uploadByFactoryAdmin = documents?.filter((doc) => doc.holderType === "factoryAdmin");
    console.log({ formData });
    console.log({ parsedWorkforceEmployeeDependentApplication });
    console.log({ movementLogs: this.state.movementLogs });
    return (
      <div className={classes.container}>
        <Box p={0} className={classes.paper}>
          <Grid container spacing={2} className={classes.gridRightPad} style={{ marginTop: "16px", padding: 4, display: "flex", justifyContent: "flex-end" }}>
            {(user_type === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE || user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE) && (
              <>
                <Grid item xs={2}>
                  <Button variant="contained" color="primary" fullWidth onClick={() => this.setState({ eisDependentBFTNModalOpen: true })}>
                    <FormattedMessage id="workforce.employee.application.paymentProcess" defaultMessage="Payment Calculation" />
                  </Button>
                </Grid>
                {!safeParse(this.props.application?.eisApprovedByIds)?.includes(this.props.loggedInUserId) && (
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
                )}
                <Grid item xs={2}>
                  <Button variant="contained" color="primary" fullWidth onClick={this.handleRevert}>
                    <FormattedMessage module="workforce" id="workforce.employee.application.revert.further.investigation" />
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button variant="outlined" style={{ backgroundColor: "#D10000", color: "white" }} fullWidth onClick={this.handleReject}>
                    <FormattedMessage module="workforce" id="workforce.application.reject" />
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ApplicationViewPage
                application={formData}
                language={locale}
                fileStates={documents}
                viewedFromFlag={"view"}
                movementLogs={this.state.movementLogs}
              />
            </Grid>
            <Grid item xs={8}></Grid>
            {user_type != WORKFORCE_USER_TYPE.FACTORY_ADMIN ||
            user_type != WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            user_type != WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION ||
            user_type != WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
            user_type != WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION ? (
              <Grid item xs={2}></Grid>
            ) : null}
            <Grid item xs={2} style={{ textAlign: "center" }}>
              <Button variant="contained" color="primary" onClick={this.handlePrint} fullWidth>
                <PrintIcon /> {<FormattedMessage id="workforce.modal.print" module="workforce" />}
              </Button>
            </Grid>
            {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ||
            user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION ||
            user_type === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
            user_type === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION ? (
              <>
                <Grid item xs={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.handleForward()}
                    style={{ paddingLeft: "4px", paddingRight: "4px" }}
                    fullWidth
                  >
                    <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                  </Button>
                </Grid>
                <Grid item xs={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      this.setState({ revertModalOpen: true, selectedApplication: application });
                      console.log("button clicked");
                    }}
                    fullWidth // <-- Add this
                  >
                    <FormattedMessage module="workforce" id="workforce.employee.application.revert" />
                  </Button>
                </Grid>
              </>
            ) : null}
          </Grid>

          {user_type === WORKFORCE_USER_TYPE.ADMIN && (
            <>
              <div className={classes.buttonContainer}>
                <Button variant="outlined" style={{ backgroundColor: "#D10000", color: "white" }}>
                  <FormattedMessage module="workforce" id="workforce.application.reject" />
                </Button>
                <Button variant="contained" color="primary">
                  <FormattedMessage module="workforce" id="workforce.application.approve" />
                </Button>
              </div>

              <ForwardApplicationAdminModal open={isForwardModalOpen} onClose={this.handleCloseForwardModal} application={application} />
            </>
          )}
        </Box>
        <Modal open={this.state.open} className={classes.modal} onClose={() => this.setState({ open: false })}>
          <ApplicationPrintPreview
            open={this.state.open}
            onClose={() => this.setState({ open: false })}
            onOpen={() => this.setState({ open: true })}
            data={formData}
            documents={documents}
            logoLeft={application?.organizationType==="blwf" ? "/front/workforce_assets/blwf.png" : "/front/workforce_assets/centralfund.png"}
            logoLeftUrl="/front/workforce_assets/bdgov.png"
          />
        </Modal>

        {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && (
          <>
            <ForwardApplicationFactoryAdminModal
              open={this.state.forwardModalOpenFA}
              onClose={() => this.setState({ forwardModalOpenFA: false })}
              selectedApplicationIds={[{ id: edited_id }]}
              organizationEmployee={organizationEmployee}
            />
          </>
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
        {user_type !== WORKFORCE_USER_TYPE.APPLICANT && (
          <>
            {this.state.revertModalOpen && (
              <RevertApplicationModal
                open={this.state.revertModalOpen}
                onClose={() => this.setState({ revertModalOpen: false })}
                selectedApplication={this.state.selectedApplication}
              />
            )}
          </>
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
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  application: state.workforce.application,
  user_rights: state.core?.user?.i_user?.rights || {},
  documents: state.workforce.document,
  locale: state.core?.user?.i_user?.language,
  organizationEmployee: state.workforce.organizationEmployee,
  loggedInUserId: state.core?.user?.i_user?.id,
  // applicationUuid: props.match.params.application_uuid,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchWorkforceDocument,
      updateApplication,
      createApplicationMovement,
      fetchApplicationWiseMovementList,
      updateApplicationSummary,
      journalize,
      coreConfirm,
    },
    dispatch,
  );

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ViewApplicationPage))));
