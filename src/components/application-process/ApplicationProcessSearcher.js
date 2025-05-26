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
import {
  Tab as TabIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from "@material-ui/icons";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import { MODULE_NAME, WORKFORCE_USER_TYPE } from "../../constants";
import {
  fetchApplicationsSummary,
  fetchOrganizationEmployeeDesignation,
} from "../../actions";
import ApplicationProcessFilter from "./ApplicationProcessFilter";
import ForwardIcon from "@material-ui/icons/Forward";
import UndoIcon from "@material-ui/icons/Undo";
import "react-quill/dist/quill.snow.css";
import FileUploader from "../../pickers/FileUploader";
import CloseIcon from "@material-ui/icons/Close";
import RestorePageIcon from '@material-ui/icons/RestorePage';
import ForwardApplicationModal from "./modals/ForwardApplicationModal";
import { getUserTypeFromRights, isEmptyObject } from "../../utils/utils";
import ForwardApplicationAdminModal from "./modals/ForwardApplicationAdminModal";
import ForwardApplicationCheckerMoal from "./modals/ForwardApplicationCheckerModal";
import ForwardApplicationApproverModal from "./modals/ForwardApplicationApproverModal";
import RevertApplicationModal from "./modals/RevertApplicationModal";
import { WORKFORCE_STATUS } from "../../constants";
import { updateApplication, createApplicationMovement } from "../../actions";
import HistoryIcon from "@material-ui/icons/History";

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
    const { showHistoryFilter } = this.state;
    const { applicationType,userRights } = this.props;
    if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.CHECKER) {
      const finalParams = {
        ...prms,
        ... [`status:"first_forward", orderBy: ["-dateCreated"]`],
      };
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        [`status:"first_forward"`]
      );
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        [`status:"second_forward", orderBy: ["-dateCreated"]`]
      );
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        [`status:"pending", orderBy: ["-dateCreated"]`]
        // prms
      );
    }else{
      const finalParams = {
        ...prms,
        ... [`status:"send_for_dg_approve",, orderBy: ["-dateCreated"]`],
      };
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        [`status:"send_for_dg_approve"`]
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
    this.setState({ revertModalOpen: true,revertByChecker:true, selectedApplication: application });
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
            id: decodeId(application.id),
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
            id: decodeId(application.id),
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

  headers = () => [
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.verifier",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    this.isShowHistory() ? "workforce.version" : "",
  ];

  headerApplicant = () => [
    "workforce.employee.name.en",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationDate",
    "workforce.employee.application.status",
    this.isShowHistory() ? "workforce.version" : "",
  ];
  headerChecker = () => [
    "",
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    this.isShowHistory() ? "workforce.version" : "",
  ];
  headerApprover = () => [
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    this.isShowHistory() ? "workforce.version" : "",
  ];

  sorts = () => [];

  itemFormatters = () => {
    const formatters = [
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      (application) => 200000,
      (application) => "Nafi",
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
      this.isShowHistory() ? application?.version : null,
    ];

    formatters.push((application) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="দেখুন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.view",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>

        {/* <Tooltip title="যাচাই">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="অনুমোদন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => this.handleApproval(application)}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>
        {/* <Tooltip title="ফরওয়ার্ড">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => this.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip> */}
        {/* <Tooltip title="রিভার্ট">
          <IconButton
            disabled={application?.isHistory}
            // onClick={() => this.handleOpenForwardModal(application)}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="রিজেক্ট">
          <span>
            <IconButton
              onClick={() => this.handleReject(application)}
              disabled={this.state.selectedApplication?.isHistory}
              color="error"
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="গৃহীত কার্যক্রম">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.actions",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };

  itemFormattersApplicant = () => {
    const formatters = [
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.applicationType,
      (application) => "Akij",
      (application) => application.dateCreated.split("T")[0],
      (application) => application.status,
      this.isShowHistory() ? application?.version : null,
    ];

    formatters.push((application) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="দেখুন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.view",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="গৃহীত কার্যক্রম">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.actions",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="গৃহীত কার্যক্রম">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <RestorePageIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };
  itemFormattersChecker = () => {
    const formatters = [
      (application) =>
        application.workforceEmployee ? (
          <Checkbox
            checked={this.state.selectedApplicationIds.includes(application.id)}
            onChange={this.handleCheckboxChange(application.id)}
            color="primary"
          />
        ) : (
          ""
        ),
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      (application) => 200000,
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
      this.isShowHistory() ? application?.version : null,
    ];

    formatters.push((application) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="দেখুন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.view",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="যাচাই">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="ফরওয়ার্ড">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => this.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="রিভার্ট">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => this.handleOpenRevertModal(application)}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };
  itemFormattersApprover = () => {
    const formatters = [
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      // (application) => application.workforceEmployee?.nid,
      // (application) => application.workforceEmployee?.phoneNumber,
      (application) => application.applicationType,
      // (application) => application.organizationType,
      (application) => 200000,
      (application) => "Nafi",
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
      // (application) => "Hafiz",
      // (application) => application.dateCreated.split('T')[0],
      this.isShowHistory() ? application?.version : null,
    ];

    formatters.push((application) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="দেখুন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.view",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="অনুমোদন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="ফরওয়ার্ড">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => this.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="রিভার্ট">
          <IconButton
            disabled={application?.isHistory}
            // onClick={() => this.handleOpenForwardModal(application)}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };

  getUserOrganization = async (userId) => {
    await this.fetchOrganizationEmployeeDesignation(
      this.props.modulesManager,
      decodeId(userId)
    );
  };

  handleBulkForward  = async () => {
    /// here is a problem will focus on later
    this.state.selectedApplicationIds.map(async(id) =>
      await updateApplication(
        {
          id: decodeId(id),
          status: WORKFORCE_STATUS.FIRST_FORWARD,
        },
        `update workforce application`
      )
    );
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const { forwardModalOpen,revertModalOpen,revertByChecker, selectedApplication, selectedApplicationIds } =
      this.state;
    // const { selectedOffice, selectedSuboffice, selectedUser, officeData } =
    //   this.state;
    const totalMoneyAmount = applications?.reduce((acc, app) => {
      const amount = parseFloat(app.moneyAmount) || 0;
      return acc + amount;
    }, 0);

    const {
      intl,
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

    console.log({ selectedApplicationIds });

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
          headers={
            getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT
              ? this.headerApplicant
              : getUserTypeFromRights(userRights) ===
                WORKFORCE_USER_TYPE.CHECKER
              ? this.headerChecker
              : getUserTypeFromRights(userRights) ===
                WORKFORCE_USER_TYPE.APPROVER
              ? this.headerApprover
              : this.headers
          }
          itemFormatters={
            getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT
              ? this.itemFormattersApplicant
              : getUserTypeFromRights(userRights) ===
                WORKFORCE_USER_TYPE.CHECKER
              ? this.itemFormattersChecker
              : getUserTypeFromRights(userRights) ===
                WORKFORCE_USER_TYPE.APPROVER
              ? this.itemFormattersApprover
              : this.itemFormatters
          }
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
              <ForwardApplicationAdminModal
                open={forwardModalOpen}
                onClose={this.handleCloseForwardModal}
                selectedApplication={selectedApplication}
                officeData={this.state.officeData}
                onSubmitForward={this.handleForwardSubmit}
              />
            );
          } else if (userType === WORKFORCE_USER_TYPE.CHECKER) {
            return (
              <>
              <ForwardApplicationCheckerMoal
                open={forwardModalOpen}
                onClose={this.handleCloseForwardModal}
                selectedApplication={selectedApplication}
                onSubmitForward={this.handleForwardSubmit}
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
              />
               <RevertApplicationModal
                open={revertModalOpen}
                revertByChecker={revertByChecker}
                onClose={this.handleCloseRevertModal}
                selectedApplication={this.state.selectedApplication}
                onSubmitRevert={this.handleRevertSubmit}
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationsSummary,
      fetchOrganizationEmployeeDesignation,
      updateApplication,
      createApplicationMovement,
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
