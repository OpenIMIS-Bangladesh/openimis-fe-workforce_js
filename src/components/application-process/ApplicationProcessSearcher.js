import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Box, Button } from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import { coreConfirm, journalize, Searcher, withHistory, withModulesManager, FormattedMessage, decodeId } from "@openimis/fe-core";
import { MODULE_NAME, WORKFORCE_USER_TYPE } from "../../constants";
import {
  fetchApplicationsSummary,
  fetchApplicationMovementsSummary,
  fetchOrganizationEmployeeDesignation,
  fetchOrganizationEmployee,
  fetchFactoryEmployee,
} from "../../actions";
import "react-quill/dist/quill.snow.css";
import ApplicationProcessFilter from "./ApplicationProcessFilter";
import ForwardApplicationModal from "./modals/ForwardApplicationModal";
import { getUserTypeFromRights, isEmptyObject } from "../../utils/utils";
import PrintIcon from "@material-ui/icons/Print";
import ForwardApplicationAdminModal from "./modals/ForwardApplicationAdminModal";
import ForwardApplicationCheckerMoal from "./modals/ForwardApplicationCheckerModal";
import ForwardApplicationFactoryAdminModal from "./modals/ForwardApplicationFactoryAdminModal";
import ForwardApplicationApproverModal from "./modals/ForwardApplicationApproverModal";
import RevertApplicationModal from "./modals/RevertApplicationModal";
import ForwardApplicationSummaryModal from "./modals/ForwardApplicationSummaryModal";
import { WORKFORCE_STATUS } from "../../constants";
import { updateApplication, createApplicationMovement, updateApplicationSummary } from "../../actions";
import {
  itemAdminFormatters,
  itemFormattersApplicant,
  itemFormattersAssociation,
  itemFormattersApprover,
  itemFormattersChecker,
  itemFormattersFactoryAdmin,
  itemFormattersDirector,
} from "../../utils/itemFormatters_types";
import GenerateBFTN from "../../pages/application-process/GenereteBFTN";
import { headerApplicant, headerApprover, headerChecker, headerAssociation, headersAdmin, headerFactoryAdmin, headerDirector } from "../../utils/headers_types";

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
      openGenerateBFTN: false,
      submitting: false,
      serverResponse: null,
      editedGrantMoney: "",
      editorContent: "",
      selectedOffice: "",
      selectedSuboffice: "",
      selectedUser: "",
      selectedApplicationIds: [],
      revertByChecker: false,
      revertByFactoryAdmin: false,
      officeData: {
        cf: {
          suboffices: {
            "Suboffice A": "রহিম উদ্দিন",
            "Suboffice B": "করিমা বেগম",
          },
        },
        blwf: {
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

  async fetchApplicant() {
    await this.props.fetchFactoryEmployee(this.props.modulesManager, [`relatedUser_LoginName_Iexact:"${this.props.userName}"`]);
  }

  fetch = async (prms) => {
    const { applicationType, userRights, revertedApplication, userName, workforceEmployeesFactoryId } = this.props;
    const { showHistoryFilter } = this.state;
    this.props.fetchOrganizationEmployee(this.props.modulesManager, [`username:"${userName}"`]);
    console.clear();
    await this.fetchApplicant();
    console.log(this.props);
    if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.CHECKER) {
      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;
      let filter = [];
      if (summaryId) {
        filter = [`statusIn: ["forward_to_cf_section","meeting_created"], orderBy: ["-dateCreated"],cfApplicationSummary_Id:"${summaryId}"`];
      } else {
        filter = [`statusIn: ["forward_to_cf_section"], orderBy: ["-dateCreated"]`];
      }

      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, filter);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ASSOCIATION) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, ['statusIn: ["forward_to_association"]', 'orderBy: ["-dateCreated"]']);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, ['statusIn: ["new"]', 'orderBy: ["-dateCreated"]']);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, [
        `statusIn: ["forward_to_director","approved_by_director","approved_by_dg"], orderBy: ["-dateCreated"],cfApplicationSummary_Id:"${decodeId(
          this.props.summaryId
        )}"`,
      ]);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, [
        `statusIn: ["forward_to_comiitee", "selected","forward_to_director"], orderBy: ["-dateCreated"],cfApplicationSummary_Id:"${decodeId(
          this.props.summaryId
        )}"`,
      ]);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT) {
      console.log(this.props.workforceEmployee);
      this.setState({ displayVersion: showHistoryFilter });
      if (revertedApplication) {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["revert","revert_to_applicant","revert_to_checker"], orderBy: ["-dateCreated"]`]
          // prms
        );
      } else if (this.props.applicationStatus) {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["draft"], orderBy: ["-dateCreated"]`]
          // prms
        );
      } else {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, 'statusIn: ["new"]', 'orderBy: ["-dateCreated"]']
          // prms
        );
      }
    } else {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, [
        `statusIn: ["forward_to_director","approved_by_director","approved_by_dg"], orderBy: ["-dateCreated"],cfApplicationSummary_Id:"${decodeId(
          this.props.summaryId
        )}"`,
      ]);
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
    this.setState({ revertModalOpen: false, revertByChecker: false, revertByApprover: false, revertByFactoryAdmin: false, selectedApplication: null });
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
      selectedUser: this.state.officeData[this.state.selectedOffice].suboffices[selectedSuboffice],
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
            status: WORKFORCE_STATUS.APPROVED_BY_DG,
            grantAmount: this.state.editedGrantMoney,
          };

          try {
            await this.props.updateApplication(updateApplicationData, "update workforce application");
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
  handleApprovalByDirector = async (application) => {
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
            status: WORKFORCE_STATUS.APPROVED_BY_DIRECTOR,
            grantAmount: this.state.editedGrantMoney,
          };

          try {
            await this.props.updateApplication(updateApplicationData, "update workforce application");

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
  handleSelected = async (application) => {
    const { selectedApplication } = this.state;

    if (window.confirm("Are you sure you want to select this application?")) {
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
            grantAmount: this.state.editedGrantMoney,
            status: WORKFORCE_STATUS.SELECTED,
          };

          const createApplicationMovementData = {
            applicationId: decodeId(application.id),
            status: WORKFORCE_STATUS.SELECTED,
            note: "আবেদন নির্বাচন করা হয়েছে",
            action: "approved",
          };

          try {
            await this.props.updateApplication(updateApplicationData, "update workforce application");

            await this.props.createApplicationMovement(createApplicationMovementData, "create workforce movement");
            this.setState({
              serverResponse: {
                status: "SUCCESS",
                message: "আবেদন নির্বাচন করা হয়েছে!",
              },
            });
            window.location.reload();
          } catch (error) {
            console.error("Approval failed:", error);
            this.setState({
              serverResponse: {
                status: "ERROR",
                message: "আবেদন নির্বাচন ব্যর্থ হয়েছে!",
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
    const selectedUser = this.state.userList.find((user) => user.id === this.state.selectedUserId);
    this.setState({ submitting: true });
    setTimeout(() => {
      this.setState({
        submitting: false,
        serverResponse: {
          status: "SUCCESS",
          message: "আবেদন সফলভাবে Forward করা হয়েছে!",
        },
      });
      setTimeout(() => {
        this.setState({
          revertModalOpen: false,
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

    const selectedUser = this.state.userList.find((user) => user.id === this.state.selectedUserId);

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
          revertModalOpen: false,
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
      : userType === WORKFORCE_USER_TYPE.ASSOCIATION
      ? headerAssociation(this)
      : userType === WORKFORCE_USER_TYPE.APPROVER
      ? headerApprover(this)
      : userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN
      ? headerFactoryAdmin(this)
      : userType === WORKFORCE_USER_TYPE.DIRECTOR
      ? headerDirector(this)
      : headersAdmin(this);
  };

  itemFormatters = () => {
    const userType = getUserTypeFromRights(this.props.userRights);
    const { locale } = this.props;

    return userType === WORKFORCE_USER_TYPE.APPLICANT
      ? itemFormattersApplicant(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication)
      : userType === WORKFORCE_USER_TYPE.CHECKER
      ? itemFormattersChecker(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.ASSOCIATION
      ? itemFormattersAssociation(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.APPROVER
      ? itemFormattersApprover(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN
      ? itemFormattersFactoryAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.DIRECTOR
      ? itemFormattersDirector(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : itemAdminFormatters(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale);
  };

  sorts = () => [];

  getUserOrganization = async (userId) => {
    await this.fetchOrganizationEmployeeDesignation(this.props.modulesManager, decodeId(userId));
  };

  handleBulkSelected = async () => {
    const { selectedApplicationIds } = this.state;
    const { updateApplication, createApplicationMovement } = this.props;

    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }

    if (window.confirm("Are you sure you want to select these applications?")) {
      try {
        // Process each selected application
        await Promise.all(
          selectedApplicationIds.map(async (id) => {
            const decodedId = decodeId(id);

            const updateApplicationData = {
              id: decodedId,
              status: WORKFORCE_STATUS.SELECTED,
            };

            const createApplicationMovementData = {
              applicationId: decodedId,
              status: WORKFORCE_STATUS.SELECTED,
              note: "আবেদন নির্বাচন করা হয়েছে",
              action: "approved",
            };

            await updateApplication(updateApplicationData, "update workforce application");
            await createApplicationMovement(createApplicationMovementData, "create workforce movement");
          })
        );

        this.setState({
          serverResponse: {
            status: "SUCCESS",
            message: "আবেদনসমূহ সফলভাবে নির্বাচন করা হয়েছে!",
          },
        });
      } catch (error) {
        console.error("Bulk selection failed:", error);
        this.setState({
          serverResponse: {
            status: "ERROR",
            message: "একাধিক আবেদন নির্বাচন ব্যর্থ হয়েছে!",
          },
        });
      }
    }
  };
  handleBulkSelectedbyAssociation = async () => {
    const { selectedApplicationIds } = this.state;
    const { updateApplication, createApplicationMovement } = this.props;

    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }

    if (window.confirm("Are you sure you want to forward these applications?")) {
      try {
        await Promise.all(
          selectedApplicationIds.map(async (id) => {
            const decodedId = decodeId(id);

            const updateApplicationData = {
              id: decodedId,
              status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION,
            };

            const createApplicationMovementData = {
              applicationId: decodedId,
              status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION,
              note: "আবেদন নির্বাচন করা হয়েছে",
              action: "forward_to_cf_section",
            };

            await updateApplication(updateApplicationData, "update workforce application");
            await createApplicationMovement(createApplicationMovementData, "create workforce movement");
          })
        );

        this.setState({
          serverResponse: {
            status: "SUCCESS",
            message: "আবেদনসমূহ সফলভাবে নির্বাচন করা হয়েছে!",
          },
        });
      } catch (error) {
        console.error("Bulk selection failed:", error);
        this.setState({
          serverResponse: {
            status: "ERROR",
            message: "একাধিক আবেদন নির্বাচন ব্যর্থ হয়েছে!",
          },
        });
      }
    }
  };
  handleBulkSelectedbyFactoryAdmin = async () => {
    const { selectedApplicationIds } = this.state;
    const { updateApplication, createApplicationMovement } = this.props;

    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }

    if (window.confirm("Are you sure you want to forward these applications?")) {
      try {
        await Promise.all(
          selectedApplicationIds.map(async (id) => {
            const decodedId = decodeId(id);

            const updateApplicationData = {
              id: decodedId,
              status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
            };

            const createApplicationMovementData = {
              applicationId: decodedId,
              status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
              note: "আবেদন নির্বাচন করা হয়েছে",
              action: "forward_to_association",
            };

            await updateApplication(updateApplicationData, "update workforce application");
            await createApplicationMovement(createApplicationMovementData, "create workforce movement");
          })
        );

        this.setState({
          serverResponse: {
            status: "SUCCESS",
            message: "আবেদনসমূহ সফলভাবে নির্বাচন করা হয়েছে!",
          },
        });
      } catch (error) {
        console.error("Bulk selection failed:", error);
        this.setState({
          serverResponse: {
            status: "ERROR",
            message: "একাধিক আবেদন নির্বাচন ব্যর্থ হয়েছে!",
          },
        });
      }
    }
  };
  handleBulkApproveByAdmin = async () => {
    const { selectedApplicationIds } = this.state;
    const { updateApplication, createApplicationMovement, updateApplicationSummary } = this.props;

    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }

    if (window.confirm("Are you sure you want to approve these applications?")) {
      try {
        // Process each selected application
        await Promise.all(
          selectedApplicationIds.map(async (id) => {
            const decodedId = decodeId(id);

            const updateApplicationData = {
              id: decodedId,
              status: WORKFORCE_STATUS.APPROVED_BY_DG,
            };

            const createApplicationMovementData = {
              applicationId: decodedId,
              status: WORKFORCE_STATUS.APPROVED_BY_DG,
              note: "আবেদন নির্বাচন করা হয়েছে",
              action: "approved_by_dg",
            };
            const updateApplicationSummaryData = {
              id: decodeId(this.props.summaryId),
              status: WORKFORCE_STATUS.APPROVED_BY_DG,
            };
            await updateApplication(updateApplicationData, "update workforce application");
            await createApplicationMovement(createApplicationMovementData, "create workforce movement");
            await updateApplicationSummary(updateApplicationSummaryData, "update workforce application summary");
          })
        );

        this.setState({
          serverResponse: {
            status: "SUCCESS",
            message: "আবেদনসমূহ সফলভাবে নির্বাচন করা হয়েছে!",
          },
        });

        window.location.reload();
      } catch (error) {
        console.error("Bulk selection failed:", error);
        this.setState({
          serverResponse: {
            status: "ERROR",
            message: "একাধিক আবেদন নির্বাচন ব্যর্থ হয়েছে!",
          },
        });
      }
    }
  };
  handleBulkApproveByDirector = async () => {
    const { selectedApplicationIds } = this.state;
    const { updateApplication, createApplicationMovement, updateApplicationSummary } = this.props;

    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }

    if (window.confirm("Are you sure you want to approve these applications?")) {
      try {
        // Process each selected application
        await Promise.all(
          selectedApplicationIds.map(async (id) => {
            const decodedId = decodeId(id);
            const updateApplicationData = {
              id: decodedId,
              status: WORKFORCE_STATUS.APPROVED_BY_DIRECTOR,
            };

            const createApplicationMovementData = {
              applicationId: decodedId,
              status: WORKFORCE_STATUS.APPROVED_BY_DIRECTOR,
              note: "আবেদন নির্বাচন করা হয়েছে",
              action: "approved_by_DIRECTOR",
            };

            const updateApplicationSummaryData = {
              id: decodeId(this.props.summaryId),
              status: WORKFORCE_STATUS.APPROVED_BY_DIRECTOR,
            };
            console.log("summay row id", id);
            await updateApplication(updateApplicationData, "update workforce application");
            await createApplicationMovement(createApplicationMovementData, "create workforce movement");
            await updateApplicationSummary(updateApplicationSummaryData, "update workforce application summary");
          })
        );

        this.setState({
          serverResponse: {
            status: "SUCCESS",
            message: "আবেদনসমূহ সফলভাবে নির্বাচন করা হয়েছে!",
          },
        });
      } catch (error) {
        console.error("Bulk selection failed:", error);
        this.setState({
          serverResponse: {
            status: "ERROR",
            message: "একাধিক আবেদন নির্বাচন ব্যর্থ হয়েছে!",
          },
        });
      }
    }
  };

  handleCloseBFTN = () => {
    this.setState({ openGenerateBFTN: false });
  };
  handleOpenBFTN = () => {
    this.setState({ openGenerateBFTN: true });
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      forwardModalOpen,
      revertModalOpen,
      revertByChecker,
      revertByApprover,
      revertByFactoryAdmin,
      selectedApplication,
      openGenerateBFTN,
      showHistoryFilter,
    } = this.state;
    const totalMoneyAmount = applications?.reduce((acc, app) => {
      const amount = parseFloat(app.moneyAmount) || 0;
      return acc + amount;
    }, 0);

    const {
      applications,
      applicationsPageInfo,
      fetchingApplications,
      fetchedApplications,
      errorApplications,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
      userRights,
      userName,
      organizationEmployee,
    } = this.props;

    const count = applicationsPageInfo.totalCount;
    const userType = getUserTypeFromRights(userRights);

    const filterPane = ({ filters, onChangeFilters }) => (
      <ApplicationProcessFilter
        filters={filters}
        onChangeFilters={onChangeFilters}
        setShowHistoryFilter={(showHistoryFilter) => this.setState({ showHistoryFilter })}
      />
    );

    return (
      <>
        <Searcher
          module={MODULE_NAME}
          // selectWithCheckbox={true}
          // withSelection={true}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT ? null : filterPane}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={applications}
          itemsPageInfo={applicationsPageInfo}
          fetchingItems={fetchingApplications}
          fetchedItems={fetchedApplications}
          errorItems={errorApplications}
          tableTitle={<FormattedMessage module={MODULE_NAME} id="workforce.employee.application.process" />}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-dateCreated"
          headers={this.headers}
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
            <Button variant="contained" color="primary" onClick={() => this.setState({ forwardModalOpen: true })}>
              <FormattedMessage module="workforce" id="workforce.employee.application.createMeetingSheet" />
            </Button>
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.APPROVER ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="primary" onClick={this.handleBulkSelected}>
              <FormattedMessage module="workforce" id="workforce.employee.application.bulkApprove" />
            </Button>
            <IconButton onClick={this.handleOpenBFTN}>
              <PrintIcon />
            </IconButton>
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.ASSOCIATION ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="primary" onClick={this.handleBulkSelectedbyAssociation}>
              <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
            </Button>
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="primary" onClick={this.handleBulkSelectedbyFactoryAdmin}>
              <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
            </Button>
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.ADMIN ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="primary" onClick={this.handleBulkApproveByAdmin}>
              <FormattedMessage module="workforce" id="workforce.employee.application.bulkApprove" />
            </Button>
            <IconButton onClick={this.handleOpenBFTN}>
              <PrintIcon />
            </IconButton>
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.DIRECTOR ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="primary" onClick={this.handleBulkApproveByDirector}>
              <FormattedMessage module="workforce" id="workforce.employee.application.bulkApprove" />
            </Button>
            <IconButton onClick={this.handleOpenBFTN}>
              <PrintIcon />
            </IconButton>
            <GenerateBFTN
              open={openGenerateBFTN}
              onClose={this.handleCloseBFTN}
              applications={applications}
              status={"approved_by_director"}
              userRights={userRights}
            />
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
                <ForwardApplicationAdminModal
                  open={forwardModalOpen}
                  onClose={this.handleCloseForwardModal}
                  selectedApplication={selectedApplication}
                  officeData={this.state.officeData}
                  onSubmitForward={this.handleForwardSubmit}
                />
                <GenerateBFTN
                  open={openGenerateBFTN}
                  onClose={this.handleCloseBFTN}
                  applications={applications}
                  status={"approved_by_dg"}
                  userRights={userRights}
                />
              </>
            );
          } else if (userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
            return (
              <>
                <ForwardApplicationFactoryAdminModal
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
                <ForwardApplicationSummaryModal
                  open={forwardModalOpen}
                  onClose={this.handleCloseForwardModal}
                  selectedApplication={this.state.selectedApplication}
                  selectedApplicationIds={this.state.selectedApplicationIds}
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
                <ForwardApplicationAdminModal
                  open={forwardModalOpen}
                  onClose={this.handleCloseForwardModal}
                  selectedApplication={selectedApplication}
                  officeData={this.state.officeData}
                  onSubmitForward={this.handleForwardSubmit}
                />
                <GenerateBFTN
                  open={openGenerateBFTN}
                  onClose={this.handleCloseBFTN}
                  applications={applications}
                  status={"selected"}
                  summary_Id={decodeId(this.props.summaryId)}
                  userRights={userRights}
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
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
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
  organizationEmployee: state.workforce.organizationEmployee,
  workforceEmployeesFactoryId: state.workforce.workforceEmployee?.edges?.[0]?.employeeDesignationEmployeeId?.edges?.[0]?.node?.workforceFactory?.id ?? null,
  workforceEmployee: state.workforce.workforceEmployee,
  locale: state.core?.user?.i_user?.language || "en",  
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationsSummary,
      fetchApplicationMovementsSummary,
      fetchOrganizationEmployeeDesignation,
      updateApplication,
      updateApplicationSummary,
      createApplicationMovement,
      fetchOrganizationEmployee,
      fetchFactoryEmployee,
      journalize,
      coreConfirm,
    },
    dispatch
  );

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(ApplicationProcessSearcher)))));
