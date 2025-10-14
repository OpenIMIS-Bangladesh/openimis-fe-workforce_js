import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Paper, Typography, Divider, IconButton, Card, Button, Box, Modal } from "@material-ui/core";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import PreviewDetails from "../../components/application-forms/PreviewDetails";
import ForwardApplicationAdminModal from "../../components/application-process/modals/ForwardApplicationAdminModal";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights } from "../../utils/utils";
import { fetchWorkforceDocument } from "../../actions";
import { bindActionCreators } from "redux";
import DocumentReviewAccordion from "../../components/application-process/DocumentReviewAccordion";
import ApplicationViewPage from "../../components/application-forms/ApplicationViewPage";
import PrintIcon from "@material-ui/icons/Print";
import CloseIcon from "@material-ui/icons/Close";
import { ApplicationPrintPreview } from "../../components/shared/ApplicationPrintPreview";
import ForwardApplicationFactoryAdminModal from "../../components/application-process/modals/ForwardApplicationFactoryAdminModal";
import RevertApplicationModal from "../../components/application-process/modals/RevertApplicationModal";

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
    // Open the modal
    this.setState({ open: true });
  };

  componentDidMount() {
    const { dispatch, modulesManager, application } = this.props;
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${application?.id}"`]);
  }

  render() {
    const { classes, user_rights, application, documents, locale, organizationEmployee, history, edited_id } = this.props;
    const { stateEdited, workforceEmployee, isForwardModalOpen, forwardModalOpenFA } = this.state;
    console.log("application uuid", edited_id);

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
    console.log({ uploadByFactoryAdmin });
    return (
      <div className={classes.container}>
        <Box p={0} className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ApplicationViewPage application={formData} language={locale} fileStates={documents} />
            </Grid>
            <Grid item xs={1}>
              <Button variant="contained" color="primary" onClick={this.handlePrint}>
                <PrintIcon />
              </Button>
            </Grid>
            {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? (
              <>
                <Grid item xs={1}>
                  <Button variant="contained" color="primary" onClick={() => this.setState({ forwardModalOpenFA: true })} style={{paddingLeft:"3px",paddingRight:"3px"}}>
                    <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                  </Button>
                </Grid>
                <Grid item xs={1}>
                  <Button variant="contained" color="primary" onClick={() => this.setState({ revertModalOpen: true })}>
                    <FormattedMessage module="workforce" id="workforce.employee.application.revert" />
                  </Button>
                </Grid>
              </>
            ) : null}
            {/* <Grid item xs={1}>
              <Button variant="contained" color="primary" onClick={this.handlePrint}>
                <PrintIcon />
              </Button>
            </Grid> */}
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
                {/* Optional Forward Button */}
                {/* <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.handleOpenForwardModal}
                >
                  <FormattedMessage
                    module="workforce"
                    id="workforce.employee.application.forwardTo"
                  />
                </Button> */}
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
              // onSubmitForward={this.handleForwardSubmit}
              organizationEmployee={organizationEmployee}
            />
            <RevertApplicationModal
              open={this.state.revertModalOpen}
              onClose={() => this.setState({ revertModalOpen: false })}
              // revertByChecker={revertByChecker}
              selectedApplication={application}
              // onSubmitRevert={this.handleRevertSubmit}
            />
          </>
        )}
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
  // applicationUuid: props.match.params.application_uuid,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchWorkforceDocument,
      journalize,
      coreConfirm,
    },
    dispatch
  );

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ViewApplicationPage))));
