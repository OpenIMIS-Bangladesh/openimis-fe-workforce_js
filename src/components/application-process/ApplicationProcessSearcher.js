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
import ForwardApplicationSectionAdminModal from "./modals/ForwardApplicationSectionAdminModal";
import ForwardApplicationApproverModal from "./modals/ForwardApplicationApproverModal";
import RevertApplicationModal from "./modals/RevertApplicationModal";
import ForwardApplicationSummaryModal from "./modals/ForwardApplicationSummaryModal";
import ConfirmModal from "./modals/ConfirmModal";
import { WORKFORCE_STATUS } from "../../constants";
import { updateApplication, createApplicationMovement, updateApplicationSummary } from "../../actions";
import {
  itemAdminFormatters,
  itemFormattersApplicant,
  itemFormattersAssociation,
  itemFormattersApprover,
  itemFormattersChecker,
  itemFormattersCheckerTwo,
  itemFormattersSectionAdmin,
  itemFormattersSectionTwoAdmin,
  itemFormattersDoctor,
  itemFormattersFactoryAdmin,
  itemFormattersDirector,
  itemFormattersS1DeputyAsstDirector,
  itemFormattersS2DeputyAsstDirector,
  itemFormattersBlwfSectionAdmin
} from "../../utils/itemFormatters_types";
import GenerateBFTN from "../../pages/application-process/GenereteBFTN";
import { headerApplicant, headerApprover, headerChecker,headerCheckerTwo,headerS1DeputyAsstDirector,headerS2DeputyAsstDirector,headerDoctor, headerSectionAdmin, headerSectionTwoAdmin, headerAssociation, headersAdmin, 
headerFactoryAdmin, headerDirector,headerBlwfSectionAdmin } from "../../utils/headers_types";

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
      forwardModalOpenSA: false,
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
      dynamicTableTitle: "",
      confirmModalOpen: false,
      confirmModalMessage: "",
      confirmModalCallback: null,
    };
    this.rowsPerPageOptions = [10, 20, 50, 100];
    this.defaultPageSize = 10;
  }

  async fetchApplicant() {
    await this.props.fetchFactoryEmployee(this.props.modulesManager, [`relatedUser_LoginName_Iexact:"${this.props.userName}"`]);
  }

  fetch = async (prms) => {
    const { applicationType, userRights, revertedApplication,rejectedApplication, userName, workforceEmployeesFactoryId, dynamicTableTitle,loggedInUserId } = this.props;
    const { showHistoryFilter } = this.state;
    if(dynamicTableTitle)
    {
      this.dynamicTableTitle= dynamicTableTitle;
    }
    this.props.fetchOrganizationEmployee(this.props.modulesManager, [`username:"${userName}"`]);
    await this.fetchApplicant();
    console.log(this.props);
    if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.CHECKER || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });

      const defaultStatusFilters = [
        'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]'
      ];
      const orderByFilter = 'orderBy: ["-dateCreated"]';

      const hasStatusIn = prms?.some(f => f.includes("statusIn"));
      const hasOrderBy = prms?.some(f => f.includes("orderBy"));
      const hasAppTypeIn = prms?.some(f => f.includes("applicationTypeIn"));

      let finalFilters = [];

      if (prms?.length) {
        finalFilters = [...prms];

        if (!hasStatusIn) {
          finalFilters = [...defaultStatusFilters.slice(0, 1), ...finalFilters];
        }

        if (!hasAppTypeIn) {
          finalFilters = [...finalFilters, defaultStatusFilters[1]];
        }

        if (!hasOrderBy) {
          finalFilters.push(orderByFilter);
        }
      } else {
        finalFilters = [...defaultStatusFilters, orderByFilter];
      }
      if (loggedInUserId) {
        finalFilters.push(`applicationTo: "${loggedInUserId}"`);
      }

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);

    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SECTION_ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];

      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;

      if (rejectedApplication) {
        defaultStatusFilters.push('statusIn: ["rejected"]', 'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]');
      } else if (revertedApplication) {
        defaultStatusFilters.push('statusIn: ["revert","revert_to_applicant","revert_to_checker"]', 'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]');
      }
      else if (this.props.sentForVerificationApplications) {
        defaultStatusFilters.push('statusIn: ["forward_for_verification"]', 'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]');
      }
      else if (this.props.verifiedApplications) {
        defaultStatusFilters.push('statusIn: ["approved_by_doctor","verified"]', 'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]');
      }
      else if (summaryId) {
        defaultStatusFilters.push('applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]');
        // defaultStatusFilters.push('statusIn: ["forward_to_cf_section","meeting_created","approved_by_dg"]', 'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]');
        additionalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_cf_section"]', 'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]');
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';

      const nidFilters = this.props.nidFilters || [];

      let finalFilters = [];

      if (nidFilters.length) {
        // If NID search is present, ignore default status filters
        finalFilters = [...nidFilters];

        // Optionally add orderBy if not already present
        if (!finalFilters.some(f => f.includes("orderBy"))) {
          finalFilters.push(orderByFilter);
        }

        // Keep summaryId filter if present
        if (summaryId && !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))) {
          finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
        }
      } else if (prms?.length) {
        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));

        if (!hasStatusIn) {
          finalFilters = [...defaultStatusFilters, ...finalFilters];
        }
        if (!hasOrderBy) finalFilters.push(orderByFilter);
        if (summaryId && !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))) {
          finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
        }
      } else {
        finalFilters = [...defaultStatusFilters, ...additionalFilters, orderByFilter];
      }

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO) {
  this.setState({ displayVersion: showHistoryFilter });

  let defaultStatusFilters = [];
  let additionalFilters = [];

  const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;

  if (rejectedApplication) {
    defaultStatusFilters.push('statusIn: ["rejected"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]');
  } else if (revertedApplication) {
    defaultStatusFilters.push('statusIn: ["revert","revert_to_applicant","revert_to_checker"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]');
  } else if (summaryId) {
    defaultStatusFilters.push('statusIn: ["forward_to_cf_section","meeting_created","approved_by_dg"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]');
    additionalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
  } else {
    defaultStatusFilters.push('statusIn: ["forward_to_cf_section","approved_by_doctor","verified"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]');
  }

  const orderByFilter = 'orderBy: ["-dateCreated"]';

  const nidFilters = this.props.nidFilters || [];

  let finalFilters = [];

  if (nidFilters.length) {
    // If NID search is present, ignore default status filters
    finalFilters = [...nidFilters];

    // Optionally add orderBy if not already present
    if (!finalFilters.some(f => f.includes("orderBy"))) {
      finalFilters.push(orderByFilter);
    }

    // Keep summaryId filter if present
    if (summaryId && !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))) {
      finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
    }
  } else if (prms?.length) {
    finalFilters = [...prms];

    const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
    const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));

    if (!hasStatusIn) {
      finalFilters = [...defaultStatusFilters, ...finalFilters];
    }
    if (!hasOrderBy) finalFilters.push(orderByFilter);
    if (summaryId && !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))) {
      finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
    }
  } else {
    finalFilters = [...defaultStatusFilters, ...additionalFilters, orderByFilter];
  }

  this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];

      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;

      if (rejectedApplication) {
        defaultStatusFilters.push('statusIn: ["rejected"]',  'organizationTypeIn: ["blwf"]');
      } else if (revertedApplication) {
        defaultStatusFilters.push('statusIn: ["revert","revert_to_applicant","revert_to_checker"]',  'organizationTypeIn: ["blwf"]');
      } else if (summaryId) {
        defaultStatusFilters.push('statusIn: ["forward_to_blwf_section","meeting_created","approved_by_dg"]',  'organizationTypeIn: ["blwf"]');
        additionalFilters.push(`blwfApplicationSummary_Id:"${summaryId}"`);
      }
      else {
        defaultStatusFilters.push('statusIn: ["new"]', 'organizationTypeIn: ["blwf"]');
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';

      const nidFilters = this.props.nidFilters || [];

      let finalFilters = [];

      if (nidFilters.length) {
        finalFilters = [...nidFilters];

        if (!finalFilters.some(f => f.includes("orderBy"))) {
          finalFilters.push(orderByFilter);
        }

        if (summaryId && !finalFilters.some(f => f.includes("blwfApplicationSummary_Id"))) {
          finalFilters.push(`blwfApplicationSummary_Id:"${summaryId}"`);
        }
      } else if (prms?.length) {
        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));

        if (!hasStatusIn) {
          finalFilters = [...defaultStatusFilters, ...finalFilters];
        }
        if (!hasOrderBy) finalFilters.push(orderByFilter);
        if (summaryId && !finalFilters.some(f => f.includes("blwfApplicationSummary_Id"))) {
          finalFilters.push(`blwfApplicationSummary_Id:"${summaryId}"`);
        }
      } else {
        finalFilters = [...defaultStatusFilters, ...additionalFilters, orderByFilter];
      }

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DOCTOR) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, ['statusIn: ["forward_to_doctor"]', 'orderBy: ["-dateCreated"]']);
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.CHECKER_TWO || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });

      const defaultFilters = [
        'statusIn: ["forward_to_cf_section_two"]',
        'applicationTypeIn: ["disabilityAssistance","financialAssistance"]',
        'orderBy: ["-dateCreated"]',
      ];

      let finalFilters = [];

      if (prms?.length) {
        const hasStatusIn = prms.some(f => f.includes("statusIn"));
        const hasOrderBy = prms.some(f => f.includes("orderBy"));
        const hasAppTypeIn = prms.some(f => f.includes("applicationTypeIn"));

        finalFilters = [...prms];

        if (!hasStatusIn) {
          finalFilters.unshift(defaultFilters[0]);
        }
        if (!hasAppTypeIn) {
          finalFilters.push(defaultFilters[1]);
        }
        if (!hasOrderBy) {
          finalFilters.push(defaultFilters[2]);
        }
      } else {
        finalFilters = [...defaultFilters];
      }
      if (loggedInUserId) {
        finalFilters.push(`applicationTo: "${loggedInUserId}"`);
      }
      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);


    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION) {
     this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];

      if (revertedApplication) {
        defaultStatusFilters.push('statusIn: ["revert","revert_to_applicant"]');
      } 
      else if(this.props.forwardedApplications)
      {
        defaultStatusFilters.push('statusIn: ["forward_to_cf_section"]','associationTypeIn: "BGMEA"');
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_association"]','associationTypeIn: "BGMEA"');
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';

      const hasStatusIn = prms?.some(f => f.includes("statusIn"));
      const hasOrderBy = prms?.some(f => f.includes("orderBy"));

      let finalFilters = [];

      if (prms?.length) {
        finalFilters = [...prms];

        if (!hasStatusIn) {
          finalFilters = [...defaultStatusFilters, ...finalFilters];
        }

        if (!hasOrderBy) {
          finalFilters.push(orderByFilter);
        }
      } else {
        finalFilters = [...defaultStatusFilters, orderByFilter];
      }

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION) {
     this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];

      if (revertedApplication) {
        defaultStatusFilters.push('statusIn: ["revert","revert_to_applicant"]');
      } 
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn: ["forward_to_cf_section","revert_to_applicant"]');
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_association"]', 'associationTypeIn: "BKMEA"');
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';

      const hasStatusIn = prms?.some(f => f.includes("statusIn"));
      const hasOrderBy = prms?.some(f => f.includes("orderBy"));

      let finalFilters = [];

      if (prms?.length) {
        finalFilters = [...prms];

        if (!hasStatusIn) {
          finalFilters = [...defaultStatusFilters, ...finalFilters];
        }

        if (!hasOrderBy) {
          finalFilters.push(orderByFilter);
        }
      } else {
        finalFilters = [...defaultStatusFilters, orderByFilter];
      }

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);

    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultFilters = [];

      if (revertedApplication) {
        defaultFilters = [
          'statusIn: ["revert", "revert_to_applicant"]','organizationTypeIn: ["cf"]',
          'orderBy: ["-dateCreated"]',
        ];
      } else if (rejectedApplication) {
        defaultFilters = ['statusIn: ["rejected"]', 'orderBy: ["-dateCreated"]','organizationTypeIn: ["cf"]'];
      } else if (this.props.applicationStatus) {
        defaultFilters = ['statusIn: ["draft"]', 'orderBy: ["-dateCreated"]','organizationTypeIn: ["cf"]'];
      } else if (this.props.submittedByApplicants) {
        defaultFilters = ['statusIn: ["new"]','submittedByIn:["applicant"]', 'orderBy: ["-dateCreated"]','organizationTypeIn: ["cf"]'];
      }
      else if (this.props.forwardedApplications) {
        defaultFilters = ['statusIn: ["forward_to_association"]', 'orderBy: ["-dateCreated"]','organizationTypeIn: ["cf"]'];
      } else {
        defaultFilters = ['statusIn: ["new"]', 'orderBy: ["-dateCreated"]','organizationTypeIn: ["cf"]'];
      }

      // const hasStatusIn = prms?.some((f) => f.includes("statusIn"));

      let finalFilters = [];

      // if (prms?.length) {
      //   finalFilters = hasStatusIn ? prms : [...defaultFilters.filter(f => f.startsWith("statusIn")), ...prms];
      // } else {
      //   finalFilters = defaultFilters;
      // }
      finalFilters = defaultFilters;

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);

    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, [
        `statusIn: ["forward_to_director","approved_by_director","approved_by_dg"], orderBy: ["-dateCreated"],cfApplicationSummary_Id:"${decodeId(
          this.props.summaryId
        )}"`,
      ]);
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER) {
      this.setState({ displayVersion: showHistoryFilter });
      this.props.fetchApplicationsSummary(this.props.modulesManager, [
        `statusIn: ["forward_to_comiitee", "selected","forward_to_director"], orderBy: ["-dateCreated"],cfApplicationSummary_Id:"${decodeId(
          this.props.summaryId
        )}"`,
      ]);
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT) {
      this.setState({ displayVersion: showHistoryFilter });
      const isApproved = this.props.isApproved ? this.props.isApproved : false;
      if (revertedApplication) {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["revert","revert_to_applicant"], orderBy: ["-dateCreated"]`]
        );
      } else if (rejectedApplication) {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["rejected"], orderBy: ["-dateCreated"]`]
        );
      } else if (this.props.applicationStatus) {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["draft"], orderBy: ["-dateCreated"]`]
          // prms
        );
      } else if (isApproved) {
        console.log('ekhane dhukse');
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, 'statusIn: ["approved_by_dg"]', 'orderBy: ["-dateCreated"]']
          // prms
        );
      }else {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, 'statusIn: ["new"]', 'orderBy: ["-dateCreated"]']
          // prms
        );
      }
    }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });

      let filters = [];

      if (rejectedApplication) {
        filters.push('statusIn: ["rejected","rejected_by_dg"]');
      } else {
        filters.push(
          `statusIn: ["forward_to_director","approved_by_director","approved_by_dg"]`
        );
        filters.push(`cfApplicationSummary_Id:"${decodeId(this.props.summaryId)}"`);
      }

      filters.push(`orderBy: ["-dateCreated"]`);

      this.props.fetchApplicationsSummary(this.props.modulesManager, filters);

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

  handleOpenForwardModalForSectionAdmin = (application) => {
    this.setState({ forwardModalOpenSA: true, selectedApplication: application });
  };
  handleCloseForwardModalForSectionAdmin = () => {
    this.setState({ forwardModalOpenSA: false, selectedApplication: null });
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

  handleReject = (application) => {
    const { selectedApplication } = this.state;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.reject.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          this.setState({
            selectedApplication: {
              ...selectedApplication,
              isHistory: true,
            },
          }, async () => {
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
          });
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleRejectByDG = async (application) => {
    const { selectedApplication } = this.state;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.reject.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          this.setState({
            selectedApplication: {
              ...selectedApplication,
              isHistory: true,
            },
          }, async () => {
            const updateApplicationData = {
              id: decodeId(application.id),
              status: WORKFORCE_STATUS.REJECTED_BY_DG,
            };
            const createApplicationMovementData = {
              applicationId: decodeId(application.id),
              status: WORKFORCE_STATUS.REJECTED_BY_DG,
              note: "আবেদন ডিজি কর্তৃক বাতিল করা হয়েছে",
              action: "rejected_by_dg",
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
          });
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleApproval = async (application) => {
    const { selectedApplication } = this.state;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.approve.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          this.setState({
            selectedApplication: {
              ...selectedApplication,
              isHistory: true,
            },
          }, async () => {
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
          });
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleApprovalByDirector = async (application) => {
    const { selectedApplication } = this.state;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.approve.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          this.setState({
            selectedApplication: {
              ...selectedApplication,
              isHistory: true,
            },
          }, async () => {
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
          });
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleApprovalByDoctor = async (application) => {
    const { selectedApplication } = this.state;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.approve.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          this.setState({
            selectedApplication: {
              ...selectedApplication,
              isHistory: true,
            },
          }, async () => {
            const updateApplicationData = {
              id: decodeId(application.id),
              status: WORKFORCE_STATUS.APPROVED_BY_DOCTOR,
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
          });
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleSelected = async (application) => {
    const { selectedApplication } = this.state;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.select.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
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
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
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
      : userType === WORKFORCE_USER_TYPE.CHECKER_TWO
      ? headerCheckerTwo(this)
      : userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR
      ? headerS1DeputyAsstDirector(this)
      : userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR
      ? headerS2DeputyAsstDirector(this)
      : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
      ? headerSectionAdmin(this)
      : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO
      ? headerSectionTwoAdmin(this)
      : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
      ? headerBlwfSectionAdmin(this)
      : userType === WORKFORCE_USER_TYPE.DOCTOR
      ? headerDoctor(this)
      : userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION
      ? headerAssociation(this)
      : userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
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
      ? itemFormattersApplicant(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication, this.rejectedApplication)
      : userType === WORKFORCE_USER_TYPE.CHECKER
      ? itemFormattersChecker(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.CHECKER_TWO
      ? itemFormattersCheckerTwo(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR
      ? itemFormattersS1DeputyAsstDirector(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR
      ? itemFormattersS2DeputyAsstDirector(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
      ? itemFormattersSectionAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale,this.revertedApplication, this.rejectedApplication,this.nidFilters)
      : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO
      ? itemFormattersSectionTwoAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale,this.revertedApplication, this.rejectedApplication,this.nidFilters)
       : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
      ? itemFormattersBlwfSectionAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale,this.revertedApplication, this.rejectedApplication,this.nidFilters)
      : userType === WORKFORCE_USER_TYPE.DOCTOR
      ? itemFormattersDoctor(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION
      ? itemFormattersAssociation(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
      ? itemFormattersAssociation(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.APPROVER
      ? itemFormattersApprover(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale)
      : userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN
      ? itemFormattersFactoryAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale,this.revertedApplication, this.rejectedApplication)
      : userType === WORKFORCE_USER_TYPE.DIRECTOR
      ? itemFormattersDirector(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.rejectedApplication)
      : itemAdminFormatters(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale,this.rejectedApplication);
  };

  sorts = () => [];

  getUserOrganization = async (userId) => {
    await this.fetchOrganizationEmployeeDesignation(this.props.modulesManager, decodeId(userId));
  };

  handleBulkSelected = async () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.select.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkSelectedbyAssociation = () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
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
                  note: "আবেদন সিএফ শাখায় প্রেরণ করা হয়েছে",
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkSelectedbySectionAdminToDoctor = () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (id) => {
                const decodedId = decodeId(id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_DOCTOR,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_DOCTOR,
                  note: "আবেদন নির্বাচন করা হয়েছে",
                  action: "forward_to_doctor",
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkSelectedbyChecker = () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (id) => {
                const decodedId = decodeId(id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.VERIFIED,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.VERIFIED,
                  note: "আবেদন সিএফ শাখায় প্রেরণ করা হয়েছে",
                  action: "verified",
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkSelectedbyFactoryAdmin = () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkSelectedbySectionAdmin = async () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (id) => {
                const decodedId = decodeId(id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION_ONE,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION_ONE,
                  note: "আবেদন সিএফ শাখা-১ এ প্রেরণ করা হয়েছে",
                  action: "forward_to_cf_section_one",
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkSelectedbySectionTwoAdmin = async () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (id) => {
                const decodedId = decodeId(id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION_TWO,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION_TWO,
                  note: "আবেদন সিএফ শাখা-২ এ প্রেরণ করা হয়েছে",
                  action: "forward_to_cf_section_two",
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkApproveByAdmin = () => {
    const { selectedApplicationIds } = this.state;
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.approve.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement, updateApplicationSummary } = this.props;
          try {
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
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkApproveByDirector = async () => {
    const { selectedApplicationIds } = this.state;
    const { updateApplication, createApplicationMovement, updateApplicationSummary } = this.props;

    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }

    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.approve.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          try {
            const { updateApplication, createApplicationMovement, updateApplicationSummary } = this.props;
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
          } finally {
            window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };

  handleCloseBFTN = () => {
    this.setState({ openGenerateBFTN: false });
  };
  handleOpenBFTN = () => {
    this.setState({ openGenerateBFTN: true });
  };

  // onCheckBoxSelect = (selection) => {
  //   this.setState({selectedApplication: selection });
  // };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  // Modal close handler for ConfirmModal
  handleConfirmModalClose = (result) => {
    if (this.state.confirmModalCallback) {
      this.state.confirmModalCallback(result === 1);
    } else {
      this.setState({ confirmModalOpen: false });
    }
  };

  render() {
    const {
      forwardModalOpen,
      forwardModalOpenSA,
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
      isApproved
    } = this.props;

    const count = applicationsPageInfo.totalCount;
    const userType = getUserTypeFromRights(userRights);

    const filterPane = ({ filters, onChangeFilters }) =>{ 
      return (
      <ApplicationProcessFilter
        userRights={userRights}
        filters={filters}
        onChangeFilters={onChangeFilters}
        setShowHistoryFilter={(showHistoryFilter) => this.setState({ showHistoryFilter })}
      />
    )};

    console.log({faltu:selectedApplication})
    const disableButtons = this.props.disableButtons ? decodeId(this.props.disableButtons) : null;
    const meetingForwardButton = this.props.meetingForwardButton ? decodeId(this.props.meetingForwardButton) : null;
    return (
      <React.Fragment>
        <Searcher
          module={MODULE_NAME}
          // selectWithCheckbox={getUserTypeFromRights(userRights) !== WORKFORCE_USER_TYPE.APPLICANT ? true:false}
          // withSelection={getUserTypeFromRights(userRights) !== WORKFORCE_USER_TYPE.APPLICANT ? true:false}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT ? null : filterPane}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={applications}
          itemsPageInfo={applicationsPageInfo}
          fetchingItems={fetchingApplications}
          fetchedItems={fetchedApplications}
          errorItems={errorApplications}
          tableTitle={<FormattedMessage module={MODULE_NAME} id={this.dynamicTableTitle?this.dynamicTableTitle:"workforce.employee.application.process"} />}
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
          // onCheckBoxSelect={this.onCheckBoxSelect}
        />
          {userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ? (
            <Box
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                justifyContent: "space-between",
              }}
            >

              {disableButtons == 1 ? (
                <IconButton onClick={this.handleOpenBFTN}>
                  <PrintIcon />
                </IconButton>
              ) : (
                <>
                  {meetingForwardButton==1? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.setState({ forwardModalOpen: true })}
                      >
                        <FormattedMessage
                          module="workforce"
                          id="workforce.employee.application.createMeetingSheet"
                        />
                      </Button>
                    </>
                  ):(
                    <>
                      <Button variant="contained" color="primary" onClick={() => this.setState({ forwardModalOpenSA: true })}>
                        <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleBulkSelectedbySectionAdminToDoctor}
                      >
                        <FormattedMessage
                          module="workforce"
                          id="workforce.employee.application.forwardToDoctor"
                        />
                      </Button>
                    </>
                  )}
                </>
              )}
            </Box>
          ) : null}
          {userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ? (
            <Box
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                justifyContent: "space-between",
              }}
            >
            {meetingForwardButton==1?(
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.setState({ forwardModalOpen: true })}
                >
                  <FormattedMessage
                    module="workforce"
                    id="workforce.employee.application.createMeetingSheet"
                  />
                </Button>
              </>
            ):(
              <>
                <Button variant="contained" color="primary" onClick={() => this.setState({ forwardModalOpenSA: true })}>
                  <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleBulkSelectedbySectionAdminToDoctor}
                >
                  <FormattedMessage
                    module="workforce"
                    id="workforce.employee.application.forwardToDoctor"
                  />
                </Button>
              </>
            )}              
               <IconButton onClick={this.handleOpenBFTN}>
                <PrintIcon />
              </IconButton>
            </Box>
          ) : null}
          {userType === WORKFORCE_USER_TYPE.CHECKER || userType === WORKFORCE_USER_TYPE.CHECKER_TWO || userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR? (
            <Box
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                justifyContent: "space-between",
              }}
            >
            <Button variant="contained" color="primary" onClick={this.handleBulkSelectedbyChecker}>
              <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
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
        {userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION ? (
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
            {disableButtons!==1 && (
              <>
                <Button variant="contained" color="primary" onClick={this.handleBulkSelectedbyFactoryAdmin}>
                  <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                </Button>
              </>
            )}
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
                onSubmitForward={this.handleForwardSubmit}
              />
            );}
          else if (userType === WORKFORCE_USER_TYPE.DOCTOR) {
            return (
                <RevertApplicationModal
                  open={revertModalOpen}
                  onClose={this.handleCloseRevertModal}
                  revertByChecker={revertByChecker}
                  selectedApplication={this.state.selectedApplication}
                  onSubmitRevert={this.handleRevertSubmit}
                />
            );
          } else if (userType === WORKFORCE_USER_TYPE.ADMIN) {
            return (
              <>
                <ForwardApplicationAdminModal
                  open={forwardModalOpen}
                  onClose={this.handleCloseForwardModal}
                  selectedApplication={selectedApplication}
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
          } else if (userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION) {
            return (
              <>
                <RevertApplicationModal
                  open={revertModalOpen}
                  onClose={this.handleCloseRevertModal}
                  revertByChecker={revertByChecker}
                  selectedApplication={this.state.selectedApplication}
                  onSubmitRevert={this.handleRevertSubmit}
                />
              </>
            );
          } else if (userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
            return (
              <>
                 <ForwardApplicationSectionAdminModal
                  open={forwardModalOpenSA}
                  onClose={this.handleCloseForwardModalForSectionAdmin}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  onSubmitForward={this.handleForwardSubmit}
                  userRights={userRights}
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
                  userRights={userRights}
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
          } else if (userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO) {
            return (
              <>
               <ForwardApplicationSectionAdminModal
                  open={forwardModalOpenSA}
                  onClose={this.handleCloseForwardModalForSectionAdmin}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  onSubmitForward={this.handleForwardSubmit}
                  userRights={userRights}
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
                  userRights={userRights}
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
      <ConfirmModal
        open={this.state.confirmModalOpen}
        message={this.state.confirmModalMessage}
        onClose={this.handleConfirmModalClose}
      />
    </React.Fragment>
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
