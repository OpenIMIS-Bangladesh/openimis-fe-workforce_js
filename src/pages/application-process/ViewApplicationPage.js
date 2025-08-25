import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Paper, Typography, Divider, IconButton, Card, Button, Box } from "@material-ui/core";
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

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(1),
    width: "100%",
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

  componentDidMount() {
    const { dispatch, modulesManager, application } = this.props;
    this.props.fetchWorkforceDocument(modulesManager, [`workforceApplication_Id:"${application?.id}"`]);
  }

  render() {
    const { classes, user_rights, application, documents, locale } = this.props;
    const { stateEdited, workforceEmployee, isForwardModalOpen } = this.state;

    const user_type = getUserTypeFromRights(user_rights);

    const bankInfo = this.safeParse(stateEdited?.employeeBankInfo);
    const AccidentInfo = this.safeParse(stateEdited?.employeeAccidentInfo);
    const dependentInfo = this.safeParse(stateEdited?.employeeDependentInfo);
    const childrenInfo = this.safeParse(stateEdited?.employeeChildrenInfo);
    const applicantInfo = this.safeParse(stateEdited?.applicantInfo);
    const metaInfo = this.safeParse(stateEdited?.employeeChildrenInfo);

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
              {/* <PreviewDetails formData={formData} language={locale} /> */}
              {/* <ApplicationViewPage application={formData} language={locale} /> */}
              <ApplicationViewPage application={formData} language={locale}   fileStates={documents}/>

            </Grid>
            {/* <Grid item xs={12}>
              {uploadByApplicant?.length > 0 && (
                <Typography variant="body2" gutterBottom style={{ textAlign: "left", fontWeight: "bold" }}>
                  <FormattedMessage module="workforce" id="workforce.previewDetails.uploadedBy.applicant" />
                </Typography>
              )}
              {uploadByApplicant?.map((file, index) => (
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
            </Grid> */}
            {/* <Grid item xs={12}>
              {uploadByFactoryAdmin?.length > 0 && (
                <Typography variant="body2" gutterBottom style={{ textAlign: "left", fontWeight: "bold" }}>
                  <FormattedMessage module="workforce" id="workforce.previewDetails.uploadedBy.factoryAdmin" />
                </Typography>
              )}
              {uploadByFactoryAdmin?.map((file, index) => (
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
            </Grid> */}
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
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  application: state.workforce.application,
  user_rights: state.core?.user?.i_user?.rights || {},
  documents: state.workforce.document,
  locale: state.core?.user?.i_user?.language ,

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
