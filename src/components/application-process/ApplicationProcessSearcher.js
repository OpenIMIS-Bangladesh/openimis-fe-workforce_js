import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  IconButton,
  Tooltip,
  Checkbox,
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import {
  coreConfirm,
  formatMessageWithValues,
  journalize,
  Searcher,
  withHistory,
  withModulesManager,
  FormattedMessage,
  historyPush,
  decodeId,
} from "@openimis/fe-core";
import { MODULE_NAME, WORKFORCE_USER_TYPE } from "../../constants";
import {
  fetchApplicationsSummary,
  fetchApplicationMovementsSummary,
  fetchOrganizationEmployeeDesignation,
  fetchOrganizationEmployee,
} from "../../actions";
import "react-quill/dist/quill.snow.css";
import ApplicationProcessFilter from "./ApplicationProcessFilter";
import ForwardApplicationModal from "./modals/ForwardApplicationModal";
import { getUserTypeFromRights, isEmptyObject } from "../../utils/utils";
import PrintIcon from '@material-ui/icons/Print';
import ForwardApplicationAdminModal from "./modals/ForwardApplicationAdminModal";
import ForwardApplicationCheckerMoal from "./modals/ForwardApplicationCheckerModal";
import ForwardApplicationApproverModal from "./modals/ForwardApplicationApproverModal";
import RevertApplicationModal from "./modals/RevertApplicationModal";
import { WORKFORCE_STATUS } from "../../constants";
import { updateApplication, createApplicationMovement } from "../../actions";
import { itemAdminFormatters, itemFormattersApplicant, itemFormattersApprover, itemFormattersChecker,itemFormattersFactoryAdmin } from "../../utils/itemFormatters_types";
import GenereteBFTN from "../../pages/application-process/GenereteBFTN";
import GenerateBFTN from "../../pages/application-process/GenereteBFTN";
import { headerApplicant, headerApprover, headerChecker, headersAdmin, headerFactoryAdmin} from "../../utils/headers_types";

const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    margin: 0,
  },
  paperHeader: {
    ...theme.paper.header,
    padding: 10,
  },
  tableTitle: theme.table.title,
  fab: theme.fab,
  button: {
    margin: theme.spacing(1),
  },
  item: {
    padding: theme.spacing(1),
  },
  horizontalButtonContainer: theme.buttonContainer.horizontal,
});

class ApplicationProcessSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chfid: null,
      confirmedAction: null,
      reset: 0,
      showHistoryFilter: false,
      displayVersion: false,
      // 🆕 Modal state
      forwardModalOpen: false,
      revertModalOpen: false,
      selectedApplication: null,
      selectedUserId: "",
      deadline: "",
      userList: [],
      openGenerateBFTN:false,
      submitting: false,
      serverResponse: null,
      editorContent: "",
      selectedOffice: "",
      selectedSuboffice: "",
      selectedUser: "",
      selectedApplicationIds: [],
      revertByChecker:false,
      officeData: {
        "Central Fund": {
          suboffices: {
            "Suboffice A": "রহিম উদ্দিন",
            "Suboffice B": "করিমা বেগম",
          },
        },
        BLWF: {
          suboffices: {
            "Suboffice C": "সজল হোসেন",
            "Suboffice D": "রাবেয়া খাতুন",
          },
        },
        "EIS PILOT": {
          suboffices: {
            "Suboffice E": "মাহফুজ রহমান",
            "Suboffice F": "নুসরাত জাহান",
          },
        },
      },
    };
    this.rowsPerPageOptions = [10, 20, 50, 100];
    this.defaultPageSize = 10;
  }

  fetch = (prms) => {
    const { applicationType,userRights,revertedApplication,userName } = this.props;
    const { showHistoryFilter } = this.state;
    this.props.fetchOrganizationEmployee(
      this.props.modulesManager,
      [`username:"${userName}"`]
    )
  
    if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.CHECKER) {
      const finalParams = {
        ...prms,
        ... [`status:"new", orderBy: ["-dateCreated"]`],
      };
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        [`status:"new",orderBy: ["-dateCreated"]`]
      );
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        [`status:"forward_to_approver", orderBy: ["-dateCreated"]`]
      );
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT) {
      this.setState({ displayVersion: showHistoryFilter });
      if (revertedApplication) {
        this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        [`status:"revert_to_applicant",orderBy: ["-dateCreated"]`]
        // prms
      );
      }else {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`orderBy: ["-dateCreated"]`]
          // prms
        );
      }
    }else{
      const finalParams = {
        ...prms,
        ... [`orderBy: ["-dateCreated"]`],
        };
        // console.log('shariful',prms)
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        prms
      );
    }
  };

  rowIdentifier = (r) => r.uuid;

  isShowHistory = () => this.state.displayVersion;

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((f) => !!state.filters[f].filter)
      .map((f) => state.filters[f].filter);
    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };
  handleOpenForwardModal = (application) => {
    this.setState({ forwardModalOpen: true, selectedApplication: application });
  };

  handleCloseForwardModal = () => {
    this.setState({ forwardModalOpen: false, selectedApplication: null });
  };
  handleOpenRevertModal = (application) => {
    this.setState({ revertModalOpen: true, selectedApplication: application });
  };

  handleCloseRevertModal = () => {
    this.setState({ revertModalOpen: false,revertByChecker:false, selectedApplication: null });
  };
  handleUserChange = (event) => {
    this.setState({ selectedUserId: event.target.value });
  };

  handleDeadlineChange = (event) => {
    this.setState({ deadline: event.target.value });
  };
  handleOfficeChange = (event) => {
    const selectedOffice = event.target.value;
    this.setState({
      selectedOffice,
      selectedSuboffice: "",
      selectedUser: "",
    });
  };

  handleSubofficeChange = (event) => {
    const selectedSuboffice = event.target.value;
    this.setState({
      selectedSuboffice,
      selectedUser:
        this.state.officeData[this.state.selectedOffice].suboffices[
          selectedSuboffice
        ],
    });
  };
  handleCheckboxChange = (id) => (event) => {
    const { selectedApplicationIds } = this.state;
    const selectedIndex = selectedApplicationIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedApplicationIds, id];
    } else {
      newSelected = selectedApplicationIds.filter((item) => item !== id);
    }

    this.setState({ selectedApplicationIds: newSelected });
  };

  handleReject = async (application) => {
    const { selectedApplication } = this.state;

    if (window.confirm("Are you sure you want to reject this application?")) {
      this.setState(
        {
          selectedApplication: {
            ...selectedApplication,
            isHistory: true,
          },
        },
        async () => {
          const updateApplicationData = {
            id: decodeId(application.id),
            status: WORKFORCE_STATUS.REJECTED,
          };

          const createApplicationMovementData = {
            applicationId: decodeId(application.id),
            status: WORKFORCE_STATUS.REJECTED,
            note: "আবেদন বাতিল করা হয়েছে",
            action: "rejected",
          };

          try {
            await this.props.updateApplication(
              updateApplicationData,
              "update workforce application"
            );

            await this.props.createApplicationMovement(
              createApplicationMovementData,
              "create workforce movement"
            );
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
        }
      );
    }
  };
  handleApproval = async (application) => {
    const { selectedApplication } = this.state;

    if (window.confirm("Are you sure you want to approve this application?")) {
      this.setState(
        {
          selectedApplication: {
            ...selectedApplication,
            isHistory: true,
          },
        },
        async () => {
          const updateApplicationData = {
            id: decodeId(application.id),
            status: WORKFORCE_STATUS.APPROVED,
          };

          const createApplicationMovementData = {
            applicationId: decodeId(application.id),
            status: WORKFORCE_STATUS.APPROVED,
            note: "আবেদন অনুমোদন করা হয়েছে",
            action: "approved",
          };

          try {
            await this.props.updateApplication(
              updateApplicationData,
              "update workforce application"
            );

            await this.props.createApplicationMovement(
              createApplicationMovementData,
              "create workforce movement"
            );
            this.setState({
              serverResponse: {
                status: "SUCCESS",
                message: "আবেদন অনুমোদন করা হয়েছে!",
              },
            });
            window.location.reload();
          } catch (error) {
            console.error("Approval failed:", error);
            this.setState({
              serverResponse: {
                status: "ERROR",
                message: "আবেদন অনুমোদন ব্যর্থ হয়েছে!",
              },
            });
          }
        }
      );
    }
  };

  handleForwardSubmit = (event) => {
    this.state.editorContent;
    event.preventDefault();
    const selectedUser = this.state.userList.find(
      (user) => user.id === this.state.selectedUserId
    );
    this.setState({ submitting: true });
    setTimeout(() => {
      this.setState({
        submitting: false,
        serverResponse: {
          status: "SUCCESS",
          message: "আবেদন সফলভাবে revert করা হয়েছে!",
        },
      });
      setTimeout(() => {
        this.setState({
          revertModalOpen : false,
          selectedUserId: "",
          deadline: "",
          selectedApplication: null,
          serverResponse: null,
        });
      }, 2000);
    }, 2000);
  };
  handleRevertSubmit = (event) => {
    this.state.editorContent;
    event.preventDefault();

    const selectedUser = this.state.userList.find(
      (user) => user.id === this.state.selectedUserId
    );

    this.setState({ submitting: true });

    // Simulate async submit
    setTimeout(() => {
      this.setState({
        submitting: false,
        serverResponse: {
          status: "SUCCESS",
          message: "আবেদন সফলভাবে revert করা হয়েছে!",
        },
      });

      // After 2 seconds, close modal and reset form
      setTimeout(() => {
        this.setState({
          revertModalOpen : false,
          selectedUserId: "",
          deadline: "",
          selectedApplication: null,
          serverResponse: null,
        });
      }, 2000);
    }, 2000);
  };

    headers = () => {
      const userType = getUserTypeFromRights(this.props.userRights);
      return userType === WORKFORCE_USER_TYPE.APPLICANT
        ? headerApplicant(this)
        : userType === WORKFORCE_USER_TYPE.CHECKER
        ? headerChecker(this)
        : userType === WORKFORCE_USER_TYPE.APPROVER
        ? headerApprover(this)
        : userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN
        ? headerFactoryAdmin(this)
        : headersAdmin(this);
    };

    itemFormatters = () => {
      const userType = getUserTypeFromRights(this.props.userRights);
      return userType === WORKFORCE_USER_TYPE.APPLICANT
        ? itemFormattersApplicant(this.isShowHistory, this.props.modulesManager, this.props.history, this)
        : userType === WORKFORCE_USER_TYPE.CHECKER
        ? itemFormattersChecker(this.isShowHistory, this.props.modulesManager, this.props.history, this)
        : userType === WORKFORCE_USER_TYPE.APPROVER
        ? itemFormattersApprover(this.isShowHistory, this.props.modulesManager, this.props.history, this)
        : userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN
        ? itemFormattersFactoryAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this)
        : itemAdminFormatters(this.isShowHistory, this.props.modulesManager, this.props.history, this);
    };

  sorts = () => [];

  getUserOrganization = async (userId) => {
    await this.fetchOrganizationEmployeeDesignation(
      this.props.modulesManager,
      decodeId(userId)
    );
  };

  handleBulkForward  = async () => {
    const {updateApplication} = this.props
    this.state.selectedApplicationIds.map(async(id) =>
      await updateApplication(
        {
          id: decodeId(id),
          status: WORKFORCE_STATUS.DRAFT,
        },
        `update workforce application`
      )
    );
  };

  handleCloseBFTN = ()=>{
    this.setState({openGenerateBFTN:false})
  }
  handleOpenBFTN = ()=>{
    this.setState({openGenerateBFTN:true})
  }

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const { forwardModalOpen,revertModalOpen,revertByChecker, selectedApplication, openGenerateBFTN,showHistoryFilter } =
      this.state;
    // const { selectedOffice, selectedSuboffice, selectedUser, officeData } =
    //   this.state;
    const totalMoneyAmount = applications?.reduce((acc, app) => {
      const amount = parseFloat(app.moneyAmount) || 0;
      return acc + amount;
    }, 0);

    const {
      intl,
      history,
      modulesManager,
      applications,
      applicationsPageInfo,
      fetchingApplications,
      fetchedApplications,
      errorApplications,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
      userRights,
      userId,
      userName,
      revertedApplication,
      organizationEmployee
    } = this.props;

    // this.getUserOrganization(userId)

    const count = applicationsPageInfo.totalCount;
    const userType = getUserTypeFromRights(userRights);

    const filterPane = ({ filters, onChangeFilters }) => (
      <ApplicationProcessFilter
        filters={filters}
        onChangeFilters={onChangeFilters}
        setShowHistoryFilter={(showHistoryFilter) =>
          this.setState({ showHistoryFilter })
        }
      />
    );

    console.log({ revertedApplication });
    console.log(itemAdminFormatters(this.isShowHistory,modulesManager,history,this))

    return (
      <>
        <Searcher
          module={MODULE_NAME}
          // selectWithCheckbox={true}
          // withSelection={true}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={
            getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT
              ? null
              : filterPane
          }
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={applications}
          itemsPageInfo={applicationsPageInfo}
          fetchingItems={fetchingApplications}
          fetchedItems={fetchedApplications}
          errorItems={errorApplications}
          tableTitle={
            <FormattedMessage
              module={MODULE_NAME}
              id="workforce.employee.application.process"
            />
          }
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-dateCreated"
          headers={ this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(i) => !i.clientMutationId && onDoubleClick(i)}
          reset={this.state.reset}
        />
        {userType === WORKFORCE_USER_TYPE.CHECKER ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button variant="outlined" color="error">
              বন্ধ করুন
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleBulkForward}
            >
              {/* {submitting ? "ফরওয়ার্ড করা হচ্ছে..." : "ফরওয়ার্ড করুন"} */}
              বাল্ক ফরওয়ার্ড করুন
            </Button>
          </Box>
        ) : null}

        {(() => {
          const userType = getUserTypeFromRights(userRights);

          if (userType === WORKFORCE_USER_TYPE.APPLICANT) {
            return (
              <ForwardApplicationModal
                open={forwardModalOpen}
                onClose={this.handleCloseForwardModal}
                selectedApplication={selectedApplication}
                officeData={this.state.officeData}
                onSubmitForward={this.handleForwardSubmit}
              />
            );
          } else if (userType === WORKFORCE_USER_TYPE.ADMIN) {
            return (
              <>
              <IconButton onClick={this.handleOpenBFTN}><PrintIcon /></IconButton>
              <ForwardApplicationAdminModal
                open={forwardModalOpen}
                onClose={this.handleCloseForwardModal}
                selectedApplication={selectedApplication}
                officeData={this.state.officeData}
                onSubmitForward={this.handleForwardSubmit}
              />
              <GenerateBFTN  open={openGenerateBFTN} onClose={this.handleCloseBFTN} applications={applications}/>
              </>
            );
          } else if (userType === WORKFORCE_USER_TYPE.CHECKER) {
            return (
              <>
              <ForwardApplicationCheckerMoal
                open={forwardModalOpen}
                onClose={this.handleCloseForwardModal}
                selectedApplication={selectedApplication}
                onSubmitForward={this.handleForwardSubmit}
                organizationEmployee={organizationEmployee}
              />
              <RevertApplicationModal
                open={revertModalOpen}
                onClose={this.handleCloseRevertModal}
                revertByChecker={revertByChecker}
                selectedApplication={this.state.selectedApplication}
                onSubmitRevert={this.handleRevertSubmit}
              />
            </>
              
            );
          } else if (userType === WORKFORCE_USER_TYPE.APPROVER) {
            return (
              <>
              <ForwardApplicationApproverModal
                open={forwardModalOpen}
                onClose={this.handleCloseForwardModal}
                selectedApplication={selectedApplication}
                onSubmitForward={this.handleForwardSubmit}
                userName={userName}
              />
               <RevertApplicationModal
                open={revertModalOpen}
                revertByChecker={revertByChecker}
                onClose={this.handleCloseRevertModal}
                selectedApplication={this.state.selectedApplication}
                onSubmitRevert={this.handleRevertSubmit}
                userName={userName}
              />
            </>
            );
          }

          return null;
        })()}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  applications: state.workforce.applications,
  applicationsPageInfo: state.workforce.applicationsPageInfo,
  fetchingApplications: state.workforce.fetchingApplications,
  fetchedApplications: state.workforce.fetchedApplications,
  // designationId:state.workforce.fetchedWorkforceOrganizationByDesignationId,
  errorApplications: state.workforce.errorApplications,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  confirmed: state.core.confirmed,
  userRights: state.core.user.i_user.rights,
  userId: state.core.user.i_user.uuid,
  userName: state.core.user.username,
  organizationEmployee:state.workforce.organizationEmployee
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationsSummary,
      fetchApplicationMovementsSummary,
      fetchOrganizationEmployeeDesignation,
      updateApplication,
      createApplicationMovement,
      fetchOrganizationEmployee,
      journalize,
      coreConfirm,
    },
    dispatch
  );

export default withModulesManager(
  withHistory(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withTheme(withStyles(styles)(ApplicationProcessSearcher)))
  )
);
