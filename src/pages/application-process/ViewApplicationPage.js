import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Paper, Typography, Divider, IconButton, Card, Button, Box, Modal } from "@material-ui/core";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import PreviewDetails from "../../components/application-forms/PreviewDetails";
import ForwardApplicationAdminModal from "../../components/application-process/modals/ForwardApplicationAdminModal";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights } from "../../utils/utils";
import { createApplicationMovement, fetchWorkforceDocument, updateApplication } from "../../actions";
import { bindActionCreators } from "redux";
import DocumentReviewAccordion from "../../components/application-process/DocumentReviewAccordion";
import ApplicationViewPage from "../../components/application-forms/ApplicationViewPage";
import PrintIcon from "@material-ui/icons/Print";
import CloseIcon from "@material-ui/icons/Close";
import { ApplicationPrintPreview } from "../../components/shared/ApplicationPrintPreview";
import ForwardApplicationFactoryAdminModal from "../../components/application-process/modals/ForwardApplicationFactoryAdminModal";
import RevertApplicationModal from "../../components/application-process/modals/RevertApplicationModal";
import { handleBulkSelectedByAssociationLogic } from "../../utils/workforceForwardRevertActions";
import ConfirmModal from "../../components/application-process/modals/ConfirmModal";

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
      open: false,
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

  handleForward = () => {
    const { user_rights, application, loggedInUserId } = this.props;
    const user_type = getUserTypeFromRights(user_rights);

    user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
      ? this.setState({ forwardModalOpenFA: true })
      : handleBulkSelectedByAssociationLogic({
          selectedApplicationIds: [{ id: application?.id }],
          loggedInUserId,
          updateApplication: this.props.updateApplication,
          createApplicationMovement: this.props.createApplicationMovement,
          setServerResponse: (res) => this.setState({ serverResponse: res }),
          setConfirmModalOpen: (val) => this.setState({ confirmModalOpen: val }),
          setConfirmModalMessage: (msg) => this.setState({ confirmModalMessage: msg }),
          setConfirmModalCallback: (cb) => this.setState({ confirmModalCallback: cb }),
        });
  };

  componentDidMount() {
    const { dispatch, modulesManager, application } = this.props;
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${application?.id}"`]);
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
    const metaInfo = this.safeParse(stateEdited?.metadata);

    // ✅ Safely parse nested stringified objects
    const formData = {
      ...stateEdited,
      workforceEmployee: workforceEmployee,
      employeeAccidentInfo: this.safeParse(AccidentInfo),
      employeeBankInfo: this.safeParse(bankInfo),
      employeeDependentInfo: this.safeParse(dependentInfo),
      employeeChildrenInfo: this.safeParse(childrenInfo),
      applicantInfo: this.safeParse(applicantInfo),
      metadata: this.safeParse(metaInfo),
    };

    const uploadByApplicant = documents?.filter((doc) => doc.holderType === "applicant");
    const uploadByFactoryAdmin = documents?.filter((doc) => doc.holderType === "factoryAdmin");
    console.log({ documents });
    console.log({ uploadByApplicant });
    console.log({ forRevert: application });
    return (
      <div className={classes.container}>
        <Box p={0} className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ApplicationViewPage application={formData} language={locale} fileStates={documents} viewedFromFlag={"view"} />
            </Grid>
            <Grid item xs={2} style={{ textAlign: "center" }}>
              <Button variant="contained" color="primary" onClick={this.handlePrint} fullWidth>
                <PrintIcon /> {" "} {<FormattedMessage id="workforce.modal.print" module="workforce" />}
              </Button>
            </Grid>
            {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ||
            user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION ? (
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

           
            <Grid item xs={8}></Grid>
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
            logoLeft="/front/workforce_assets/centralfund.png"
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
      journalize,
      coreConfirm,
    },
    dispatch
  );

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ViewApplicationPage))));
