import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Box, Button } from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import { coreConfirm, journalize, withHistory, withModulesManager, parseData,FormattedMessage, decodeId,formatMutation } from "@openimis/fe-core";
import { MODULE_NAME, WORKFORCE_USER_TYPE } from "../../constants";
import {
  fetchApplicationsSummary,
  fetchApplicationMovementsSummary,
  fetchOrganizationEmployeeDesignation,
  fetchOrganizationEmployee,
  fetchFactoryEmployee,
  fetchWorkforceDocument,
  testWorkforcePayment,
  fetchRoles,
  fetchUsersByRoleId,
} from "../../actions";
import "react-quill/dist/quill.snow.css";
import ApplicationProcessFilter from "./ApplicationProcessFilter";
import ForwardApplicationModal from "./modals/ForwardApplicationModal";
import { getUserTypeFromRights, isBlwfPath, isEisPath, isEmptyObject, safeDecodeId, safeParse } from "../../utils/utils";
import PrintIcon from "@material-ui/icons/Print";
import ForwardApplicationAdminModal from "./modals/ForwardApplicationAdminModal";
import ForwardApplicationCheckerMoal from "./modals/ForwardApplicationCheckerModal";
import ForwardApplicationFactoryAdminModal from "./modals/ForwardApplicationFactoryAdminModal";
import ForwardApplicationSectionAdminModal from "./modals/ForwardApplicationSectionAdminModal";
import ForwardApplicationEisCoordinatorModal from "./modals/ForwardApplicationEisCoordinatorModal";
import ForwardApplicationApproverModal from "./modals/ForwardApplicationApproverModal";
import RevertApplicationModal from "./modals/RevertApplicationModal";
import ForwardApplicationSummaryModal from "./modals/ForwardApplicationSummaryModal";
import ForwardEisCoordinatoToCommitteeModal from "./modals/ForwardEisCoordinatoToCommitteeModal";
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
  itemFormattersDeputyAsstDirector,
  itemFormattersBlwfSectionAdmin
} from "../../utils/itemFormatters_types";
import GenerateBFTN from "../../pages/application-process/GenereteBFTN";
import {
  headerApplicant, headerApprover, headerChecker, headerCheckerTwo, headerDeputyAsstDirector, headerDoctor, headerSectionAdmin, headerSectionTwoAdmin, headerAssociation, headersAdmin,
  headerFactoryAdmin, headerDirector, headerBlwfSectionAdmin
} from "../../utils/headers_types";
import Searcher from "../shared/searcher/Searcher";
import CustomSnackbar from "../../components/shared/CustomSnackbar";
import ForwardApplicationSummarySectionAdminModal from "./modals/ForwardApplicationSummarySectionAdminModal";
import ForwardApplicationEisDoctorModal from "./modals/ForwardApplicationEisDoctorModal"
import { handleBulkSelectedByAssociationLogic, handleBulkSelectedByCheckerLogic } from "../../utils/workforceForwardRevertActions";
import ForwardEisPaymentProcessModal from "./modals/ForwardEisPaymentProcessModal";
import GenerateEisBFTN from "../../pages/application-process/GenereteEisBFTN";
import GenereteEisDependentBFTN from "../../pages/application-process/GenereteEisDependentBFTN";
import EisApprovalSignature from "../../pages/application-process/EisApprovalSignature";
import GenerateCommitteeReport from "../../pages/application-process/GenerateCommitteeReport";
import ConfirmRejectModal from "./modals/ConfirmRejectModal";
import { formatApplicationSummaryGQL } from "../../utils/format_gql";


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
      forwardPaymentModalOpen: false,
      forwardModalOpenSA: false,
      forwardModalOpenEIS: false,
      forwardModalOpenEISToCoordinator: false,
      forwardModalOpenEisDoctor: false,
      forwardModalOpenSummarySA: false,
      forwardModalOpenFA: false,
      revertModalOpen: false,
      selectedApplication: null,
      selectedUserId: "",
      deadline: "",
      userList: [],
      openGenerateBFTN: false,
      openGenerateEisBFTN: false,
      openGenerateEisDependentBFTN: false,
      openEisApprovalSignature: false,
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
      rejectComment:"",
      modalFlag:"",
      openRejectModal:false,
      confirmModalMessage: "",
      confirmModalCallback: null,
    };
    this.rowsPerPageOptions = [10, 20, 50, 100];
    this.defaultPageSize = 10;
  }

  async fetchApplicant() {
    // const {loggedInUserId} = this.props
    await this.props.fetchFactoryEmployee(this.props.modulesManager, [`relatedUser_LoginName_Iexact:"${this.props.userName}"`]);
    // await this.props.fetchRoles(loggedInUserId)
  }

  fetch = async (prms) => {
    const { applicationType, userRights, revertedApplication, rejectedApplication, userName, workforceEmployeesFactoryId, dynamicTableTitle, loggedInUserId } = this.props;
    const { showHistoryFilter, startDate, endDate } = this.state;
    if (dynamicTableTitle) {
      this.dynamicTableTitle = dynamicTableTitle;
    }
    this.props.fetchOrganizationEmployee(this.props.modulesManager, [`username:"${userName}"`]);
    await this.fetchApplicant();
    console.log(this.props.i_user)
    console.log("user_type: " + getUserTypeFromRights(userRights));
    if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.CHECKER || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });

      const defaultStatusFilters = [
        'applicationTypeIn: ["scholarship", "medicalAssistance", "maternityGrant", "financialAssistance", "disabilityAssistance"], organizationTypeIn: ["cf"]'];

      if (this.props.filedApplications) {
        defaultStatusFilters.push('statusIn:["forward_for_verification"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo:"${loggedInUserId}"`);
        }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn:["verified"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      } else if (revertedApplication) {

        defaultStatusFilters.push(
          'statusIn: ["revert"]'
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters.push('statusIn:["revert"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';
      defaultStatusFilters.push(orderByFilter);

      this.props.fetchApplicationsSummary(this.props.modulesManager, defaultStatusFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_CHECKER || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });

      const defaultStatusFilters = [
        'applicationTypeIn: ["educationGrant", "medicalDonation", "deadlyGrant", "maternityGrant"], organizationTypeIn: ["blwf"]'];

      if (this.props.filedApplications) {
        defaultStatusFilters.push('statusIn:["forward_for_verification"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo:"${loggedInUserId}"`);
        }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn:["verified"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      }
      else if (revertedApplication) {

        defaultStatusFilters.push(
          'statusIn: ["revert"]'
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters.push('statusIn:["revert"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';
      defaultStatusFilters.push(orderByFilter);

      this.props.fetchApplicationsSummary(this.props.modulesManager, defaultStatusFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE) {
      this.setState({ displayVersion: showHistoryFilter });

      const defaultStatusFilters = [
        'applicationTypeIn: ["educationGrant", "medicalDonation", "deadlyGrant", "maternityGrant"], organizationTypeIn: ["blwf"]'
      ];

      if (this.props.filedApplications) {
        defaultStatusFilters.push('statusIn:["new"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo:"${loggedInUserId}"`);
        }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn:["verified"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      } else if (revertedApplication) {

        defaultStatusFilters.push(
          'statusIn: ["revert"]'
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters.push('statusIn:["revert"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      }
      const orderByFilter = 'orderBy: ["-dateCreated"]';
      defaultStatusFilters.push(orderByFilter);

      this.props.fetchApplicationsSummary(this.props.modulesManager, defaultStatusFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SECTION_ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];
      const summaryId = this.props.summaryId ? safeDecodeId(this.props.summaryId) : null;
      const sectionApplicationTypes =
        'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant"]';

      if (rejectedApplication) {
        defaultStatusFilters.push(
          'statusIn: ["rejected"]',
          'applicationTypeIn: ["scholarship","medicalAssistance","maternityGrant","financialAssistance","disabilityAssistance"]'
        );
      } else if (revertedApplication) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          sectionApplicationTypes
        );
      } else if (this.props.returnedApplications) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          sectionApplicationTypes
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      } else if (this.props.sentForVerificationApplications) {
        defaultStatusFilters.push(
          'statusIn: ["forward_for_verification","forward_to_doctor"]',
          sectionApplicationTypes
        );
      } else if (this.props.verifiedApplications) {
        defaultStatusFilters.push(
          'statusIn: ["approved_by_doctor","verified"]',
          sectionApplicationTypes
        );
      } else if (summaryId) {
        if (this.props.statusInSummary) {
        defaultStatusFilters.push(`statusIn: ["${this.props.statusInSummary}"]`);
        }
        defaultStatusFilters.push(sectionApplicationTypes);
        additionalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
      } else {
        defaultStatusFilters.push(
          'statusIn: ["forward_to_cf_section"]',
          sectionApplicationTypes
        );
      }

      if (loggedInUserId) {
        defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';
      const nidFilters = this.props.nidFilters || [];
      let finalFilters = [];
      if (nidFilters.length) {
        finalFilters = [...nidFilters];
        if (!finalFilters.some(f => f.includes("orderBy"))) {
          finalFilters.push(orderByFilter);
        }

        if (
          summaryId &&
          !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))
        ) {
          finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
        }
      } else if (prms?.length) {

        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasAppType = finalFilters.some(f => f.includes("applicationTypeIn"));
        const hasApplicationTo = finalFilters.some(f => f.includes("applicationTo"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));

        if (!hasStatusIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("statusIn")),
            ...finalFilters
          ];

        if (!hasAppType)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTypeIn")),
            ...finalFilters
          ];

        if (!hasApplicationTo)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTo")),
            ...finalFilters
          ];

        if (!hasOrderBy)
          finalFilters.push(orderByFilter);

        if (
          summaryId &&
          !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))
        ) {
          finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
        }
      } else {

        finalFilters = [
          ...defaultStatusFilters,
          ...additionalFilters,
          orderByFilter
        ];
      }

      finalFilters = finalFilters.filter((f, i, arr) =>
        i === arr.findIndex(x => {
          if (x.includes("statusIn") && f.includes("statusIn")) return true;
          if (x.includes("applicationTypeIn") && f.includes("applicationTypeIn")) return true;
          if (x.includes("applicationTo") && f.includes("applicationTo")) return true;
          if (x.includes("applicationFrom") && f.includes("applicationFrom")) return true;
          if (x.includes("orderBy") && f.includes("orderBy")) return true;
          if (x.includes("cfApplicationSummary_Id") && f.includes("cfApplicationSummary_Id")) return true;
          return x === f;
        })
      );
      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];

      const summaryId = this.props.summaryId
        ? decodeId(this.props.summaryId)
        : null;

      const sectionTwoApplicationTypes =
        'applicationTypeIn: ["disabilityAssistance","financialAssistance"]';

      if (rejectedApplication) {
        defaultStatusFilters.push(
          'statusIn: ["rejected"]',
          sectionTwoApplicationTypes
        );
      } else if (revertedApplication) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          sectionTwoApplicationTypes
        );
      } else if (this.props.returnedApplications) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          sectionTwoApplicationTypes
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      } else if (summaryId) {
        if (this.props.statusInSummary) {
        defaultStatusFilters.push(`statusIn: ["${this.props.statusInSummary}"]`,sectionTwoApplicationTypes);
        }
        defaultStatusFilters.push(
          'statusIn: ["forward_to_cf_section","meeting_created","approved_by_dg"]',
          sectionTwoApplicationTypes
        );

        additionalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
      } else {
        defaultStatusFilters.push(
          'statusIn: ["forward_to_cf_section","approved_by_doctor","verified"]',
          sectionTwoApplicationTypes
        );
      }
      if (loggedInUserId) {
        defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';
      const nidFilters = this.props.nidFilters || [];
      let finalFilters = [];

      if (nidFilters.length) {
        finalFilters = [...nidFilters];
        if (!finalFilters.some(f => f.includes("orderBy"))) {
          finalFilters.push(orderByFilter);
        }
        if (
          summaryId &&
          !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))
        ) {
          finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
        }
      } else if (prms?.length) {

        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasAppType = finalFilters.some(f => f.includes("applicationTypeIn"));
        const hasApplicationTo = finalFilters.some(f => f.includes("applicationTo"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));

        if (!hasStatusIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("statusIn")),
            ...finalFilters
          ];

        if (!hasAppType)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTypeIn")),
            ...finalFilters
          ];

        if (!hasApplicationTo)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTo")),
            ...finalFilters
          ];

        if (!hasOrderBy)
          finalFilters.push(orderByFilter);

        if (
          summaryId &&
          !finalFilters.some(f => f.includes("cfApplicationSummary_Id"))
        ) {
          finalFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
        }
      } else {

        finalFilters = [
          ...defaultStatusFilters,
          ...additionalFilters,
          orderByFilter
        ];
      }

      finalFilters = finalFilters.filter((f, i, arr) =>
        i === arr.findIndex(x => {
          if (x.includes("statusIn") && f.includes("statusIn")) return true;
          if (x.includes("applicationTypeIn") && f.includes("applicationTypeIn")) return true;
          if (x.includes("applicationTo") && f.includes("applicationTo")) return true;
          if (x.includes("applicationFrom") && f.includes("applicationFrom")) return true;
          if (x.includes("orderBy") && f.includes("orderBy")) return true;
          if (x.includes("cfApplicationSummary_Id") && f.includes("cfApplicationSummary_Id")) return true;
          return x === f;
        })
      );
      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];

      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;

      if (rejectedApplication) {
        defaultStatusFilters.push('statusIn: ["rejected"]', 'organizationTypeIn: ["blwf"]');
      } else if (revertedApplication) {
        defaultStatusFilters.push('organizationTypeIn: ["blwf"]');
        defaultStatusFilters.push('statusIn: ["revert"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]'];
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      }
      else if (this.props.sentForVerificationApplications) {
        defaultStatusFilters.push('statusIn: ["forward_for_verification","forward_to_doctor"]', 'organizationTypeIn: ["blwf"]');
      }
      else if (summaryId) {
        if (this.props.statusInSummary) {
        defaultStatusFilters.push(`statusIn: ["${this.props.statusInSummary}"], 'organizationTypeIn: ["blwf"]`);
        }else{
          defaultStatusFilters.push('statusIn: ["forward_to_blwf_section","meeting_created","approved_by_dg"]', 'organizationTypeIn: ["blwf"]');
        }
        additionalFilters.push(`blwfApplicationSummary_Id:"${summaryId}"`);
      } else if (this.props.verifiedApplications) {
        defaultStatusFilters.push('statusIn: ["approved_by_doctor","verified"]', 'organizationTypeIn: ["blwf"]');
      }
      else {
        defaultStatusFilters.push('statusIn: ["verified_by_dol_dife"]', 'organizationTypeIn: ["blwf"]');
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
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.CHECKER_TWO || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });
      let defaultStatusFilters = [
        'applicationTypeIn: ["disabilityAssistance","financialAssistance"], organizationTypeIn: ["cf"]',
      ];

      if (this.props.filedApplications) {
        defaultStatusFilters.push('statusIn:["forward_for_verification"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo:"${loggedInUserId}"`);
        }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn:["verified"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      } else if (revertedApplication) {

        defaultStatusFilters.push(
          'statusIn: ["revert"]'
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters.push('statusIn:["revert"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom:"${loggedInUserId}"`);
        }
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';
      defaultStatusFilters.push(orderByFilter);

      this.props.fetchApplicationsSummary(this.props.modulesManager, defaultStatusFilters);

    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];

      if (revertedApplication) {
        defaultStatusFilters = [
          'organizationTypeIn: ["cf"]',
          'statusIn: ["revert"]',
          'associationTypeIn: "BGMEA"'
        ];

        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn: ["forward_to_cf_section"]', 'associationTypeIn: "BGMEA"');
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]', 'associationTypeIn: "BGMEA"'];
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_association","resubmitted_application"]', 'associationTypeIn: "BGMEA"');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
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
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      if (revertedApplication) {
        defaultStatusFilters = [
          'organizationTypeIn: ["cf"]',
          'statusIn: ["revert"]',
          'associationTypeIn: "BKMEA"'
        ];

        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn: ["forward_to_cf_section","revert_to_applicant"]', 'associationTypeIn: ["BKMEA"]');
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]', 'associationTypeIn: "BKMEA"'];
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_association","resubmitted_application"]', 'associationTypeIn: ["BKMEA"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
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
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      if (revertedApplication) {
        defaultStatusFilters = [
          // 'organizationTypeIn: ["eis"]',
          'statusIn: ["revert"]',
          'associationTypeIn: "BEPZA"'
        ];

        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        // }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn: ["forward_to_eis_coordinator","revert_to_applicant"]', 'associationTypeIn: ["BEPZA"]');
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]', 'associationTypeIn: "BEPZA"'];
        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        // }
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_association","resubmitted_application"]', 'associationTypeIn: ["BEPZA"]');
        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        // }
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
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      if (revertedApplication) {
        defaultStatusFilters = [
          // 'organizationTypeIn: ["eis"]',
          'statusIn: ["revert"]',
          'associationTypeIn: "LFMEAB"'
        ];

        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        // }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn: ["forward_to_eis_coordinator","revert_to_applicant"]', 'associationTypeIn: ["LFMEAB"]');
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]', 'associationTypeIn: "LFMEAB"'];
        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        // }
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_association","resubmitted_application"]', 'associationTypeIn: ["LFMEAB"]');
        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        // }
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

    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ASSOCIATION) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      if (this.props.associationIds && this.props.associationIds.length > 0) {
        defaultStatusFilters.push(`allAssociationIdIn: [${this.props.associationIds.map(id => `"${safeDecodeId(id)}"`).join(",")}]`);
      }
      if (revertedApplication) {
        defaultStatusFilters = [
          'statusIn: ["revert"]',
        ];

        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.forwardedApplications) {
        defaultStatusFilters.push('statusIn: ["forward_to_eis_coordinator","revert_to_applicant"]');
      }
      else if (this.props.returnedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]'];
        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        // }
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_association","resubmitted_application"]');
        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        // }
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

    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });
      let organizationTypeIn = '["cf"]';
      if (isEisPath()) {
        organizationTypeIn = '["eis"]';
      }

      let defaultStatusFilters = [];
      if (revertedApplication) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          `organizationTypeIn: ${organizationTypeIn}`
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      } else if (this.props.returnedApplications) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          `organizationTypeIn: ${organizationTypeIn}`
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      } else if (rejectedApplication) {
        defaultStatusFilters.push(
          'statusIn: ["rejected"]',
          `organizationTypeIn: ${organizationTypeIn}`
        );
      } else if (this.props.submittedByApplicants) {
        defaultStatusFilters.push(
          'statusIn: ["new"]',
          'submittedByIn:["applicant"]',
          `organizationTypeIn: ${organizationTypeIn}`
        );
        if (this.props.factoryId) {
          console.log("factoryId from aps:", this.props.factoryId);
          defaultStatusFilters.push(`employeeFactoryId: "${this.props.factoryId}"`);
        }
      } else if (this.props.forwardedApplications) {
        defaultStatusFilters.push(
          `organizationTypeIn: ${organizationTypeIn}`
        );
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      }
      else if (this.props.isDraft) {
        defaultStatusFilters.push(
          'statusIn: ["draft"]',
          `organizationTypeIn: ${organizationTypeIn}`
        );
        if (this.props.factoryId) {
          defaultStatusFilters.push(`employeeFactoryId: "${this.props.factoryId}"`);
        }
      }
      else {
        defaultStatusFilters.push(
          'statusIn: ["new","resubmitted_application"]',
          `organizationTypeIn: ${organizationTypeIn}`
        );
        if (this.props.factoryId) {
          defaultStatusFilters.push(`employeeFactoryId: "${this.props.factoryId}"`);
        }
        // if (loggedInUserId) {
        //   defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        // }
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';
      let finalFilters = [];
      if (prms?.length) {

        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasApplicationTypeIn = finalFilters.some(f => f.includes("applicationTypeIn"));
        const hasOrganizationTypeIn = finalFilters.some(f => f.includes("organizationTypeIn"));
        const hasApplicationTo = finalFilters.some(f => f.includes("applicationTo"));
        const hasApplicationFrom = finalFilters.some(f => f.includes("applicationFrom"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));
        const hasEmployeeFactoryId = finalFilters.some(f => f.includes("employeeFactoryId"));

        if (!hasStatusIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("statusIn")),
            ...finalFilters
          ];
        if (!hasApplicationTypeIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTypeIn")),
            ...finalFilters
          ];
        if (!hasOrganizationTypeIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("organizationTypeIn")),
            ...finalFilters
          ];

        if (!hasApplicationTo)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTo")),
            ...finalFilters
          ];

        if (!hasApplicationFrom)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationFrom")),
            ...finalFilters
          ];

        if (!hasOrderBy)
          finalFilters.push(orderByFilter);

        if (!hasEmployeeFactoryId)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("employeeFactoryId")),
            ...finalFilters
          ];

      } else {

        finalFilters = [...defaultStatusFilters, orderByFilter];
      }

      finalFilters = finalFilters.filter((f, i, arr) =>
        i === arr.findIndex(x => {
          if (x.includes("applicationTypeIn") && f.includes("applicationTypeIn")) return true;
          if (x.includes("statusIn") && f.includes("statusIn")) return true;
          if (x.includes("orderBy") && f.includes("orderBy")) return true;
          if (x.includes("organizationTypeIn") && f.includes("organizationTypeIn")) return true;
          if (x.includes("applicationTo") && f.includes("applicationTo")) return true;
          if (x.includes("applicationFrom") && f.includes("applicationFrom")) return true;
          if (x.includes("employeeFactoryId") && f.includes("employeeFactoryId")) return true;
          return x === f;
        })
      );

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER) {
      this.setState({ displayVersion: showHistoryFilter });
      let filters = [
        `organizationTypeIn: ["cf"]`,
        `orderBy: ["-dateCreated"]`,
      ];

      if (this.props.summaryId) {
        filters.push(`cfApplicationSummary_Id: "${decodeId(this.props.summaryId)}"`);
      }

      if (this.props.returnedApplications) {
        filters.push(`statusIn: ["revert"]`);
        if (loggedInUserId) {
          filters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      }
      else if (this.props.revertedApplications) {
        filters.push(`statusIn: ["revert"]`);
        if (loggedInUserId) {
          filters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      // this.props.fetchApplicationsSummary(this.props.modulesManager, filters);
      this.props.fetchApplicationsSummary(this.props.modulesManager, filters);

    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_APPROVER) {
      this.setState({ displayVersion: showHistoryFilter });
      let filters = [
        `organizationTypeIn: ["blwf"]`,
        `orderBy: ["-dateCreated"]`,
      ];

      if (this.props.summaryId) {
        filters.push(`blwfApplicationSummary_Id: "${decodeId(this.props.summaryId)}"`);
        if (loggedInUserId) {
          filters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }

      if (this.props.statusInSummary) {
        filters.push(`statusIn: ["${this.props.statusInSummary}"]`);
      }

      if (this.props.returnedApplications) {
        filters.push(`statusIn: ["revert"]`);
        if (loggedInUserId) {
          filters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      }
      this.props.fetchApplicationsSummary(this.props.modulesManager, filters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT) {
      this.setState({ displayVersion: showHistoryFilter });
      const isApproved = this.props.isApproved ? this.props.isApproved : false;
      if (revertedApplication) {
        let filters = [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["revert","revert_to_applicant"], orderBy: ["-dateCreated"]`];
        if (loggedInUserId) {
          filters.push(`applicationTo:"${loggedInUserId}"`);
        }
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          filters
        );
      } else if (rejectedApplication) {
        if (loggedInUserId) {
          this.props.fetchApplicationsSummary(
            this.props.modulesManager,
            [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["rejected"], orderBy: ["-dateCreated"]`,`applicationTo:"${loggedInUserId}"`]
          );
        }
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["rejected"], orderBy: ["-dateCreated"]`,`applicationTo:"${loggedInUserId}"`]
        );
      } else if (this.props.applicationStatus) {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, `statusIn: ["draft"], orderBy: ["-dateCreated"]`]
        );
      } else if (isApproved) {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, 'statusIn: ["approved_by_dg"]', 'orderBy: ["-dateCreated"]']
        );
      } else {
        this.props.fetchApplicationsSummary(
          this.props.modulesManager,
          [`workforceEmployee_Id: "${this.props.workforceEmployee?.id}"`, 'statusIn: ["new","forward_to_factory_admin","forward_to_association","forward_for_verification","verified","forward_to_doctor","approved_by_doctor","forward_to_eis_advisor","approved_by_eis_advisor,""forward_to_comiitee","approved_by_committee"]', 'orderBy: ["-dateCreated"]']
        );
      }
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ADMIN) {
      this.setState({ displayVersion: showHistoryFilter });
      if (this.props.summaryId) {
        const filtersBase = [
          'statusIn: ["forward_to_director","approved_by_director","approved_by_dg"]',
          'organizationTypeIn: ["cf","blwf"]',
          'orderBy: ["-dateCreated"]',
        ];


        const cfFilters = [...filtersBase, `cfApplicationSummary_Id: "${decodeId(this.props.summaryId)}"`];
        const blwfFilters = [...filtersBase, `blwfApplicationSummary_Id: "${decodeId(this.props.summaryId)}"`];

        const [] = await Promise.all([
          this.props.fetchApplicationsSummary(this.props.modulesManager, cfFilters),
          this.props.fetchApplicationsSummary(this.props.modulesManager, blwfFilters),
        ]);
      } else if (rejectedApplication) {
        const filtersBase = [
          'statusIn: ["rejected_by_dg"]',
          'orderBy: ["-dateCreated"]'
        ];
        if (loggedInUserId) {
          filtersBase.push(`applicationTo:"${loggedInUserId}"`);
        }
        await this.props.fetchApplicationsSummary(this.props.modulesManager, filtersBase);
      } else if (this.props.returnedApplications) {
        const filtersBase = [
          'statusIn: ["revert"]',
          'orderBy: ["-dateCreated"]'
        ];
        if (loggedInUserId) {
          filtersBase.push(`applicationFrom:"${loggedInUserId}"`);
        }
        this.props.fetchApplicationsSummary(this.props.modulesManager, filtersBase);
      }
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });
      if (this.props.summaryId) {
        const filtersBase = [
          'statusIn: ["forward_to_director","approved_by_director","approved_by_dg"]',
          'organizationTypeIn: ["cf"]',
          'orderBy: ["-dateCreated"]',
        ];

        const cfFilters = [...filtersBase, `cfApplicationSummary_Id: "${decodeId(this.props.summaryId)}"`];

        const [] = await Promise.all([
          this.props.fetchApplicationsSummary(this.props.modulesManager, cfFilters),
        ]);
      }
      else if (this.props.returnedApplications) {
        const filtersBase = [
          'statusIn: ["revert"]',
          'organizationTypeIn: ["cf"]',
          'orderBy: ["-dateCreated"]',
        ];

        if (loggedInUserId) {
          filtersBase.push(`applicationFrom:"${loggedInUserId}"`);
        }
        this.props.fetchApplicationsSummary(this.props.modulesManager, filtersBase);
      }

    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DIRECTOR) {
      this.setState({ displayVersion: showHistoryFilter });
      if (this.props.summaryId) {
        const filtersBase = [
          'statusIn: ["forward_to_director","approved_by_director","approved_by_dg"]',
          'organizationTypeIn: ["blwf"]',
          'orderBy: ["-dateCreated"]',
        ];

        const blwfFilters = [...filtersBase, `blwfApplicationSummary_Id: "${decodeId(this.props.summaryId)}"`];

        const [] = await Promise.all([
          this.props.fetchApplicationsSummary(this.props.modulesManager, blwfFilters),
        ]);
      }
      else if (this.props.returnedApplications) {
        const filtersBase = [
          'statusIn: ["revert"]',
          'organizationTypeIn: ["cf"]',
          'orderBy: ["-dateCreated"]',
        ];

        if (loggedInUserId) {
          filtersBase.push(`applicationFrom:"${loggedInUserId}"`);
        }
        this.props.fetchApplicationsSummary(this.props.modulesManager, filtersBase);
      }

    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_COORDINATOR) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];

      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;

      if (rejectedApplication) {
        defaultStatusFilters.push('statusIn: ["rejected"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]', 'organizationTypeIn: ["eis"]');
      } else if (revertedApplication) {
        defaultStatusFilters.push(
          // 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]','organizationTypeIn: ["eis"]'
          'statusIn: ["revert"],  applicationTypeIn: ["disabilityAssistance","financialAssistance"]', 'organizationTypeIn: ["eis"]'
        );

        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }
      else if (this.props.sentForVerificationApplications) {
        defaultStatusFilters.push('statusIn: ["forward_for_verification","forward_to_doctor"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]', 'organizationTypeIn: ["eis"]');
      }
      else if (this.props.verifiedApplications) {
        defaultStatusFilters.push('statusIn: ["approved_by_doctor","verified"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]', 'organizationTypeIn: ["eis"]');
      }
      else if (summaryId) {
        defaultStatusFilters.push('applicationTypeIn: ["disabilityAssistance","financialAssistance"]');
        additionalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
      }
      else {
        defaultStatusFilters.push('statusIn: ["forward_to_eis_coordinator"]', 'applicationTypeIn: ["disabilityAssistance","financialAssistance"]', 'organizationTypeIn: ["eis"]');
        if (loggedInUserId) {
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      }

      const orderByFilter = 'orderBy: ["-dateCreated"]';

      const nidFilters = this.props.nidFilters || [];

      let finalFilters = [];

      if (nidFilters.length) {
        finalFilters = [...nidFilters];

        if (!finalFilters.some(f => f.includes("orderBy"))) {
          finalFilters.push(orderByFilter);
        }

        if (summaryId && !finalFilters.some(f => f.includes("eisApplicationSummary_Id"))) {
          finalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
        }
      } else if (prms?.length) {
        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));
        const hasApplicationTypeIn = finalFilters.some(f => f.includes("applicationTypeIn"));
        const hasAssociationTypeIn = finalFilters.some(f => f.includes("associationTypeIn"));

        if (!hasStatusIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("statusIn")),
            ...finalFilters
          ];
        }

        if (!hasApplicationTypeIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTypeIn")),
            ...finalFilters
          ];
        }
        if (!hasAssociationTypeIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("associationTypeIn")),
            ...finalFilters
          ];
        }
        if (!finalFilters.some(f => f.includes("organizationTypeIn"))) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("organizationTypeIn")),
            ...finalFilters
          ];
        }

        if (!hasOrderBy) finalFilters.push(orderByFilter);

        if (summaryId && !finalFilters.some(f => f.includes("eisApplicationSummary_Id"))) {
          finalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
        }

      } else {
        finalFilters = [...defaultStatusFilters, ...additionalFilters, orderByFilter];
      }

      if (startDate) finalFilters.push(`dateCreatedFrom: "${startDate}"`);
      if (endDate) finalFilters.push(`dateCreatedTo: "${endDate}"`);

      // Final safety: remove duplicates by argument name
      finalFilters = finalFilters.filter(
        (f, i, arr) =>
          i === arr.findIndex(x => {
            if (x.includes("applicationTypeIn") && f.includes("applicationTypeIn")) return true;
            if (x.includes("statusIn") && f.includes("statusIn")) return true;
            if (x.includes("orderBy") && f.includes("orderBy")) return true;
            if (x.includes("organizationTypeIn") && f.includes("organizationTypeIn")) return true;
            if (x.includes("associationTypeIn") && f.includes("associationTypeIn")) return true;
            if (x.includes("dateCreatedFrom") && f.includes("dateCreatedFrom")) return true;
            if (x.includes("dateCreatedTo") && f.includes("dateCreatedTo")) return true;
            return x === f;
          })
      );

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_COMMITTEE || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];
      defaultStatusFilters.push('applicationTypeIn: ["disabilityAssistance","financialAssistance"]');

      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;


      if (summaryId) {
        additionalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
      }


      const orderByFilter = 'orderBy: ["-dateCreated"]';

      const nidFilters = this.props.nidFilters || [];

      let finalFilters = [];

      if (nidFilters.length) {
        finalFilters = [...nidFilters];

        if (!finalFilters.some(f => f.includes("orderBy"))) {
          finalFilters.push(orderByFilter);
        }

        if (summaryId && !finalFilters.some(f => f.includes("eisApplicationSummary_Id"))) {
          finalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
        }
      } else if (prms?.length) {
        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));
        const hasApplicationTypeIn = finalFilters.some(f => f.includes("applicationTypeIn"));
        const hasAssociationTypeIn = finalFilters.some(f => f.includes("associationTypeIn"));

        if (!hasStatusIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("statusIn")),
            ...finalFilters
          ];
        }

        if (!hasApplicationTypeIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTypeIn")),
            ...finalFilters
          ];
        }
        if (!hasAssociationTypeIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("associationTypeIn")),
            ...finalFilters
          ];
        }
        if (!finalFilters.some(f => f.includes("organizationTypeIn"))) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("organizationTypeIn")),
            ...finalFilters
          ];
        }

        if (!hasOrderBy) finalFilters.push(orderByFilter);

        if (summaryId && !finalFilters.some(f => f.includes("eisApplicationSummary_Id"))) {
          finalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
        }

      } else {
        finalFilters = [...defaultStatusFilters, ...additionalFilters, orderByFilter];
      }

      if (startDate) finalFilters.push(`dateCreatedFrom: "${startDate}"`);
      if (endDate) finalFilters.push(`dateCreatedTo: "${endDate}"`);

      // Final safety: remove duplicates by argument name
      finalFilters = finalFilters.filter(
        (f, i, arr) =>
          i === arr.findIndex(x => {
            if (x.includes("applicationTypeIn") && f.includes("applicationTypeIn")) return true;
            if (x.includes("statusIn") && f.includes("statusIn")) return true;
            if (x.includes("orderBy") && f.includes("orderBy")) return true;
            if (x.includes("organizationTypeIn") && f.includes("organizationTypeIn")) return true;
            if (x.includes("associationTypeIn") && f.includes("associationTypeIn")) return true;
            if (x.includes("dateCreatedFrom") && f.includes("dateCreatedFrom")) return true;
            if (x.includes("dateCreatedTo") && f.includes("dateCreatedTo")) return true;
            return x === f;
          })
      );

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_OFFICER) {
      this.setState({ displayVersion: showHistoryFilter });
      let defaultStatusFilters = [];

      if (this.props.filedApplications) {
        defaultStatusFilters.push(
          'statusIn: ["forward_for_verification"]',
          'applicationTypeIn: ["disabilityAssistance","financialAssistance"]',
          'organizationTypeIn: ["eis"]',
          // 'associationTypeIn: ["BEPZA","LFMEAB"]'
        );
        if (loggedInUserId) {
          console.log("loggedin user id", loggedInUserId);
          defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
      } else if (this.props.forwardedApplications) {
        defaultStatusFilters.push(
          'statusIn: ["verified"]',
          'applicationTypeIn: ["disabilityAssistance","financialAssistance"]',
          'organizationTypeIn: ["eis"]',
          // 'associationTypeIn: ["BEPZA","LFMEAB"]'
        );
        if (loggedInUserId) defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
      } else if (revertedApplication) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          'applicationTypeIn: ["disabilityAssistance","financialAssistance"]',
          'organizationTypeIn: ["eis"]',
          // 'associationTypeIn: ["BEPZA","LFMEAB"]'
        );
        if (loggedInUserId) defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
      } else if (this.props.returnedApplications) {
        defaultStatusFilters.push(
          'statusIn: ["revert"]',
          'applicationTypeIn: ["disabilityAssistance","financialAssistance"]',
          'organizationTypeIn: ["eis"]',
          // 'associationTypeIn: ["BEPZA","LFMEAB"]'
        );
        if (loggedInUserId) defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
      } else {
        defaultStatusFilters.push(
          'statusIn: ["forward_to_eis_officer"]',
          'applicationTypeIn: ["disabilityAssistance","financialAssistance"]',
          'organizationTypeIn: ["eis"]',
          // 'associationTypeIn: ["BEPZA","LFMEAB"]'
        );
        if (loggedInUserId) defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
      }


      const orderByFilter = 'orderBy: ["-dateCreated"]';

      let finalFilters = [];

      if (prms?.length) {
        finalFilters = [...prms];

        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));
        const hasApplicationTypeIn = finalFilters.some(f => f.includes("applicationTypeIn"));
        const hasAssociationTypeIn = finalFilters.some(f => f.includes("associationTypeIn"));
        const hasApplicationTo = finalFilters.some(f => f.includes("applicationTo"));
        const hasApplicationFrom = finalFilters.some(f => f.includes("applicationFrom"));

        if (!hasStatusIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("statusIn")),
            ...finalFilters
          ];
        if (!hasApplicationTypeIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTypeIn")),
            ...finalFilters
          ];
        if (!hasAssociationTypeIn)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("associationTypeIn")),
            ...finalFilters
          ];
        if (!finalFilters.some(f => f.includes("organizationTypeIn")))
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("organizationTypeIn")),
            ...finalFilters
          ];

        if (!hasApplicationTo)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationTo")),
            ...finalFilters
          ];

        if (!hasApplicationFrom)
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("applicationFrom")),
            ...finalFilters
          ];
        if (!hasOrderBy) finalFilters.push(orderByFilter);

      } else {
        finalFilters = [...defaultStatusFilters, orderByFilter];
      }

      if (startDate) finalFilters.push(`dateCreatedFrom: "${startDate}"`);
      if (endDate) finalFilters.push(`dateCreatedTo: "${endDate}"`);

      finalFilters = finalFilters.filter((f, i, arr) =>
        i === arr.findIndex(x => {
          if (x.includes("applicationTypeIn") && f.includes("applicationTypeIn")) return true;
          if (x.includes("statusIn") && f.includes("statusIn")) return true;
          if (x.includes("orderBy") && f.includes("orderBy")) return true;
          if (x.includes("organizationTypeIn") && f.includes("organizationTypeIn")) return true;
          if (x.includes("associationTypeIn") && f.includes("associationTypeIn")) return true;
          if (x.includes("dateCreatedFrom") && f.includes("dateCreatedFrom")) return true;
          if (x.includes("dateCreatedTo") && f.includes("dateCreatedTo")) return true;
          return x === f;
        })
      );

      console.log("finalFilters", finalFilters);

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);

    } else if ([WORKFORCE_USER_TYPE.EIS_ADVISOR, WORKFORCE_USER_TYPE.EIS_DOCTOR].includes(getUserTypeFromRights(userRights))) {
      this.setState({ displayVersion: showHistoryFilter });
      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;

      let defaultStatusFilters = [];
      let additionalFilters = [];
      const userType = getUserTypeFromRights(userRights);
      if (userType === WORKFORCE_USER_TYPE.EIS_ADVISOR) {
        defaultStatusFilters.push('statusIn: ["forward_to_eis_advisor","approved_by_eis_director"]');
      } else if (userType === WORKFORCE_USER_TYPE.EIS_DOCTOR) {
        // defaultStatusFilters.push('statusIn: ["approved_by_doctor"]');
        if (this.props.filedMeetingSheet) {
          defaultStatusFilters.push('statusIn: ["forward_to_doctor"]');
          if (loggedInUserId) defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
        }
        else if (this.props.forwardedApplications) {
          defaultStatusFilters.push('statusIn: ["approved_by_doctor"]');
          if (loggedInUserId) defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
        else if (this.props.returnedApplications) {
          defaultStatusFilters.push('statusIn: ["revert"]');
          if (loggedInUserId) defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
        }
      }

      defaultStatusFilters.push(
        'applicationTypeIn: ["disabilityAssistance","financialAssistance"]'
      );

      defaultStatusFilters.push('organizationTypeIn: ["eis"]');

      const orderByFilter = 'orderBy: ["-dateCreated"]';
      if (summaryId) {
        console.log("summaryId", summaryId);
        additionalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
      }
      const nidFilters = this.props.nidFilters || [];

      let finalFilters = [];
      if (nidFilters.length) {

        finalFilters = [...nidFilters];

        if (!finalFilters.some(f => f.includes("orderBy"))) {
          finalFilters.push(orderByFilter);
        }
        if (
          summaryId &&
          !finalFilters.some(f => f.includes("eisApplicationSummary_Id"))
        ) {
          finalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
        }

      } else if (prms?.length) {

        finalFilters = [...prms];
        const hasStatusIn = finalFilters.some(f => f.includes("statusIn"));
        const hasOrderBy = finalFilters.some(f => f.includes("orderBy"));
        const hasApplicationTypeIn = finalFilters.some(f =>
          f.includes("applicationTypeIn")
        );
        const hasOrganizationTypeIn = finalFilters.some(f =>
          f.includes("organizationTypeIn")
        );
        if (!hasStatusIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f => f.includes("statusIn")),
            ...finalFilters,
          ];
        }
        if (!hasApplicationTypeIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f =>
              f.includes("applicationTypeIn")
            ),
            ...finalFilters,
          ];
        }
        if (!hasOrganizationTypeIn) {
          finalFilters = [
            ...defaultStatusFilters.filter(f =>
              f.includes("organizationTypeIn")
            ),
            ...finalFilters,
          ];
        }
        if (!hasOrderBy) finalFilters.push(orderByFilter);
        if (
          summaryId &&
          !finalFilters.some(f => f.includes("eisApplicationSummary_Id"))
        ) {
          finalFilters.push(`eisApplicationSummary_Id:"${summaryId}"`);
        }
      } else {

        finalFilters = [
          ...defaultStatusFilters,
          ...additionalFilters,
          orderByFilter,
        ];
      }

      if (startDate)
        finalFilters.push(`dateCreatedFrom: "${startDate}"`);
      if (endDate)
        finalFilters.push(`dateCreatedTo: "${endDate}"`);

      finalFilters = finalFilters.filter(
        (f, i, arr) =>
          i ===
          arr.findIndex(x => {
            if (x.includes("statusIn") && f.includes("statusIn")) return true;
            if (x.includes("applicationTypeIn") && f.includes("applicationTypeIn")) return true;
            if (x.includes("organizationTypeIn") && f.includes("organizationTypeIn")) return true;
            if (x.includes("orderBy") && f.includes("orderBy")) return true;
            if (x.includes("dateCreatedFrom") && f.includes("dateCreatedFrom")) return true;
            if (x.includes("dateCreatedTo") && f.includes("dateCreatedTo")) return true;
            return x === f;
          })
      );

      this.props.fetchApplicationsSummary(this.props.modulesManager, finalFilters);
      // ---------------- DOCTOR / BLWF_DOCTOR ----------------
    } else if (
      (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DOCTOR) ||
      (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DOCTOR)
    ) {
      this.setState({ displayVersion: showHistoryFilter });
      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;
      let defaultStatusFilters = [];

      if (this.props.returnedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]'];
        if (loggedInUserId) defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
      } else if (this.props.revertedApplications) {
        defaultStatusFilters = ['statusIn: ["revert"]'];
        if (loggedInUserId) defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
      } else if (this.props.forwardedApplications) {
        defaultStatusFilters = ['statusIn: ["approved_by_doctor"]'];
        if (loggedInUserId) defaultStatusFilters.push(`applicationFrom: "${loggedInUserId}"`);
      } else if (loggedInUserId) {
        defaultStatusFilters = ['statusIn: ["forward_to_doctor"]'];
        defaultStatusFilters.push(`applicationTo: "${loggedInUserId}"`);
      }
      if (summaryId) {
        console.log("summaryId", summaryId);
        if (isBlwfPath()) {
          defaultStatusFilters.push(`blwfApplicationSummary_Id:"${summaryId}"`);
        }else{
          defaultStatusFilters.push(`cfApplicationSummary_Id:"${summaryId}"`);
        }
      }
      const organizationType =
        (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DOCTOR) ? "blwf" : "cf";

      this.props.fetchApplicationsSummary(
        this.props.modulesManager,
        defaultStatusFilters,
        [`organizationTypeIn: ["${organizationType}"]`, 'orderBy: ["-dateCreated"]']
      );
    } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT) {
      this.setState({ displayVersion: showHistoryFilter });

      let defaultStatusFilters = [];
      let additionalFilters = [];

      const summaryId = this.props.summaryId ? decodeId(this.props.summaryId) : null;

      if (rejectedApplication) {
        defaultStatusFilters.push('statusIn: ["rejected"]', 'organizationTypeIn: ["blwf"]');
      }
      else if (summaryId) {
        defaultStatusFilters.push('statusIn: ["forward_to_blwf_section","meeting_created","approved_by_dg"]', 'organizationTypeIn: ["blwf"]');
        additionalFilters.push(`blwfApplicationSummary_Id:"${summaryId}"`);
      } else if (this.props.verifiedApplications) {
        defaultStatusFilters.push('statusIn: ["approved_by_doctor","verified"]', 'organizationTypeIn: ["blwf"]');
      }
      else {
        defaultStatusFilters.push('statusIn: ["verified_by_dol_dife"]', 'organizationTypeIn: ["blwf"]');
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
    }
    this.props.fetchRoles(loggedInUserId)
  }



  rowIdentifier = (r) => r.id;

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
  handleOpenForwardPaymentModal = (application) => {
    this.setState({ forwardPaymentModalOpen: true, selectedApplication: application });
  };

  handleOpenForwardModalForSectionAdmin = (application) => {
    this.setState({ forwardModalOpenSA: true, selectedApplication: application });
  };
  handleOpenForwardModalForEIS = (application) => {
    this.setState({ forwardModalOpenEIS: true, selectedApplication: application });
  };
  handleOpenForwardModalForEISToCommittee = (application) => {
    this.setState({ forwardModalOpenEISToCoordinator: true, selectedApplication: application });
  };
  handleCloseForwardModalForSectionAdmin = () => {
    this.setState({ forwardModalOpenSA: false, selectedApplication: null });
  };
  handleCloseForwardModalForSummarySectionAdmin = () => {
    this.setState({ forwardModalOpenSummarySA: false, selectedApplication: null });
  };
  handleCloseForwardModalForFA = () => {
    this.setState({ forwardModalOpenFA: false, selectedApplication: null });
  };
  handleCloseForwardModalForEisAdvisor = () => {
    this.setState({ forwardModalOpenSA: false, selectedApplication: null });
  };
  handleCloseForwardModalForEisCoordinator = () => {
    this.setState({ forwardModalOpenEIS: false, selectedApplication: null });
  };
  handleCloseForwardModalForEisCoordinatorToCommittee = () => {
    this.setState({ forwardModalOpenEISToCoordinator: false, selectedApplication: null });
  };
  handleCloseForwardModalForEisDoctor = () => {
    this.setState({ forwardModalOpenEisDoctor: false, selectedApplication: null });
  };

  handleCloseForwardModal = () => {
    this.setState({ forwardModalOpen: false, selectedApplication: null });
  };
  handleCloseForwardPaymentModal = () => {
    this.setState({ forwardPaymentModalOpen: false, selectedApplication: null });
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
    const userType = getUserTypeFromRights(this.props.userRights);
    this.setState({
      // confirmModalOpen: true,
      openRejectModal:true,
      modalFlag:"reject",
      // confirmModalMessage: "workforce.application.reject.message",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          this.setState({
            selectedApplication: {
              ...selectedApplication,
              isHistory: true,
            },
          }, async () => {
            const { rejectComment, modalFlag } = this.state;
            const summary =
              application.blwfApplicationSummary ||
              application.cfApplicationSummary ||
              application.eisApplicationSummary;

            if (summary) {
              // applicationData is stored as a JSON string
              const applicationIds = JSON.parse(summary.applicationData);

              // Remove the current application's id
              const updatedApplicationIds = applicationIds.filter(
                (id) => safeDecodeId(id) !== safeDecodeId(application.id)
              );

              console.log("Before:", applicationIds);
              console.log("After:", updatedApplicationIds);

              // Payload for updating the summary
              const updateSummaryData = {
                id: safeDecodeId(summary?.id),
                applicationData: JSON.stringify(updatedApplicationIds),
              };
              // const applicationSummeryMutation = formatMutation(
              //         "updateWorkforceApplicationSummary",
              //         formatApplicationSummaryGQL(updateSummaryData),
              //         "update workforce application summary",
              //       );
              console.log(updateSummaryData);
              this.props.updateApplicationSummary(updateSummaryData,"update application summary")
            }
            const updateApplicationData = {
              id: decodeId(application.id),
              status: (userType===WORKFORCE_USER_TYPE.BLWF_APPROVER||userType===WORKFORCE_USER_TYPE.APPROVER) ?WORKFORCE_STATUS.REJECTED_BY_COMMITTEE:WORKFORCE_STATUS.REJECTED,
              committeeRemarks:rejectComment
            };
            console.log({rejectComment:application})
            const createApplicationMovementData = {
              applicationId: decodeId(application.id),
              status: (userType===WORKFORCE_USER_TYPE.BLWF_APPROVER||userType===WORKFORCE_USER_TYPE.APPROVER) ?WORKFORCE_STATUS.REJECTED_BY_COMMITTEE:WORKFORCE_STATUS.REJECTED,
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
              // window.location.reload();
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
    const { loggedInUserId } = this.props;
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
              applicationFromId: loggedInUserId,
              applicationToId: 1,
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
    const { loggedInUserId } = this.props;
    const userType = getUserTypeFromRights(this.props.userRights);

    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.doctor.approve.message",
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
            const updateApplicationSummaryData = {
              id: isEisPath()?safeDecodeId(application?.eisApplicationSummary?.id):isBlwfPath()?safeDecodeId(application?.blwfApplicationSummary?.id):safeDecodeId(application?.cfApplicationSummary?.id),
              status: WORKFORCE_STATUS.APPROVED_BY_DOCTOR,
              // grantAmount: this.state.editedGrantMoney,
            };
            console.log({updateApplicationSummaryData:application})
            console.log({updateApplicationSummaryData})
            const createApplicationMovementData = {
              applicationId: decodeId(application.id),
              status: WORKFORCE_STATUS.APPROVED_BY_DOCTOR,
              note: "আবেদন ডাক্তার দ্বারা অনুমোদন করা হয়েছে",
              action: "approved_by_doctor",
              applicationFromId: loggedInUserId,
              applicationToId:
                userType === WORKFORCE_USER_TYPE.DOCTOR
                  ? 139
                  : userType === WORKFORCE_USER_TYPE.BLWF_DOCTOR
                    ? 187
                    : userType === WORKFORCE_USER_TYPE.EIS_DOCTOR
                      ? 173
                      : null,
              toRoleId:
                userType === WORKFORCE_USER_TYPE.DOCTOR
                  ? 32
                  : userType === WORKFORCE_USER_TYPE.BLWF_DOCTOR
                    ? 40
                    : userType === WORKFORCE_USER_TYPE.EIS_DOCTOR
                      ? 42
                      : null,
            };
            const summaryApplications =isEisPath()? parseData(application?.blwfApplicationSummary?.cfApplicationSummary):
                                         isBlwfPath()?parseData(application?.blwfApplicationSummary?.blwfApplicationSummary):
                                            parseData(application?.blwfApplicationSummary?.cfApplicationSummary)

            const shouldUpdateSummary = summaryApplications.every(
              (app) => app.status === "approved_by_doctor" || decodeId(app.id) === decodeId(application.id)
            );
            console.log({summaryApplications})
            console.log({shouldUpdateSummary})
            try {
              await this.props.updateApplication(updateApplicationData, "update workforce application");
              if (shouldUpdateSummary) {
                await this.props.updateApplicationSummary(updateApplicationSummaryData, "update workforce application summary");
              }
              await this.props.createApplicationMovement(createApplicationMovementData, "create workforce movement");

              this.setState({
                serverResponse: {
                  status: "SUCCESS",
                  message: "আবেদন অনুমোদন করা হয়েছে!",
                },
              });
              // window.location.reload();
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
      : userType === WORKFORCE_USER_TYPE.CHECKER || userType === WORKFORCE_USER_TYPE.EIS_OFFICER || userType === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.BLWF_CHECKER || userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
        ? headerChecker(this)
        : userType === WORKFORCE_USER_TYPE.CHECKER_TWO
          ? headerCheckerTwo(this)
          : userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR
            ? headerDeputyAsstDirector(this)
            : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR
              ? headerSectionAdmin(this)
              : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO
                ? headerSectionTwoAdmin(this)
                : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT
                  ? headerBlwfSectionAdmin(this)
                  : userType === WORKFORCE_USER_TYPE.DOCTOR || userType === WORKFORCE_USER_TYPE.BLWF_DOCTOR || userType === WORKFORCE_USER_TYPE.EIS_DOCTOR
                    ? headerDoctor(this)
                    : userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.ASSOCIATION || userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                      ? headerAssociation(this)
                      : userType === WORKFORCE_USER_TYPE.APPROVER || userType === WORKFORCE_USER_TYPE.EIS_COMMITTEE || userType === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE || userType === WORKFORCE_USER_TYPE.BLWF_APPROVER || userType === WORKFORCE_USER_TYPE.EIS_FINANCIAL_OFFICER
                        ? headerApprover(this)
                        : userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN
                          ? headerFactoryAdmin(this)
                          : userType === WORKFORCE_USER_TYPE.DIRECTOR || userType === WORKFORCE_USER_TYPE.BLWF_DIRECTOR
                            ? headerDirector(this)
                            : headersAdmin(this);
  };

  itemFormatters = () => {
    const userType = getUserTypeFromRights(this.props.userRights);
    const { locale } = this.props;

    return userType === WORKFORCE_USER_TYPE.APPLICANT
      ? itemFormattersApplicant(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication, this.rejectedApplication)
      : userType === WORKFORCE_USER_TYPE.CHECKER || userType === WORKFORCE_USER_TYPE.EIS_OFFICER || userType === WORKFORCE_USER_TYPE.BLWF_CHECKER || userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE || userType === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR
        ? itemFormattersChecker(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication)
        : userType === WORKFORCE_USER_TYPE.CHECKER_TWO
          ? itemFormattersCheckerTwo(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication)
          : userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR
            ? itemFormattersDeputyAsstDirector(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication)
            : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR
              ? itemFormattersSectionAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication, this.rejectedApplication, this.nidFilters)
              : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO
                ? itemFormattersSectionTwoAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication, this.rejectedApplication, this.nidFilters)
                : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT
                  ? itemFormattersBlwfSectionAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication, this.rejectedApplication, this.nidFilters)
                  : userType === WORKFORCE_USER_TYPE.DOCTOR || userType === WORKFORCE_USER_TYPE.BLWF_DOCTOR || userType === WORKFORCE_USER_TYPE.EIS_DOCTOR
                    ? itemFormattersDoctor(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication)
                    : userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.ASSOCIATION || userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                      ? itemFormattersAssociation(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication)
                      : userType === WORKFORCE_USER_TYPE.APPROVER || userType === WORKFORCE_USER_TYPE.BLWF_APPROVER || userType === WORKFORCE_USER_TYPE.EIS_COMMITTEE || userType === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE || userType === WORKFORCE_USER_TYPE.EIS_FINANCIAL_OFFICER
                        ? itemFormattersApprover(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication)
                        : userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN
                          ? itemFormattersFactoryAdmin(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.revertedApplication, this.rejectedApplication)
                          : userType === WORKFORCE_USER_TYPE.DIRECTOR || userType === WORKFORCE_USER_TYPE.BLWF_DIRECTOR
                            ? itemFormattersDirector(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.rejectedApplication, this.revertedApplication)
                            : itemAdminFormatters(this.isShowHistory, this.props.modulesManager, this.props.history, this, locale, this.rejectedApplication, this.revertedApplication);
  };

  sorts = () => [];

  getUserOrganization = async (userId) => {
    await this.fetchOrganizationEmployeeDesignation(this.props.modulesManager, decodeId(userId));
  };

  handleBulkSelectedByApprover = async () => {
    const { selectedApplicationIds } = this.state;
    const { loggedInUserId } = this.props;
    const userType = getUserTypeFromRights(this.props.userRights);

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
              selectedApplicationIds.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
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
    const { loggedInUserId, updateApplication, createApplicationMovement, userRights, modulesManager, fetchWorkforceDocument,fetchUsersByRoleId, testWorkforcePayment,roles } = this.props;
    handleBulkSelectedByAssociationLogic({
      selectedApplicationIds,
      loggedInUserId,
      updateApplication,
      createApplicationMovement,
      userRights,
      fetchWorkforceDocument,
      testWorkforcePayment,
      fetchUsersByRoleId,
      modulesManager,
      roles,
      setServerResponse: (resp) => this.setState({ serverResponse: resp }),
      setConfirmModalOpen: (v) => this.setState({ confirmModalOpen: v }),
      setConfirmModalMessage: (msg) => this.setState({ confirmModalMessage: msg }),
      setConfirmModalCallback: (cb) => this.setState({ confirmModalCallback: cb }),
    });
  };
  handleBulkSelectedbySectionAdminToDoctor = () => {
    const { selectedApplicationIds } = this.state;
    const { loggedInUserId } = this.props;
    const userType = getUserTypeFromRights(this.props.userRights);
    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message.toDoctor",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_DOCTOR,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_DOCTOR,
                  note: "আবেদন ডক্টরের কাছে প্রেরণ করা হয়েছে",
                  action: "forward_to_doctor",
                  applicationFromId: loggedInUserId,
                  applicationToId: userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
                    ? 151
                    : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
                      ? 199
                      : null,
                  toRoleId: userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
                    ? 33
                    : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
                      ? 50
                      : null,
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
            // window.location.reload();
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };
  handleBulkSelectedbyChecker = () => {
    const {
      selectedApplicationIds,
    } = this.state;
    const {
      loggedInUserId,
      userRights,
      fetchWorkforceDocument,
      updateApplication,
      createApplicationMovement,
      modulesManager,
      roles
    } = this.props;
    const userType = getUserTypeFromRights(this.props.userRights);
    let confirmModalMessage = "";

    handleBulkSelectedByCheckerLogic({
      selectedApplicationIds,
      loggedInUserId,
      userRights,
      fetchWorkforceDocument,
      updateApplication,
      createApplicationMovement,
      modulesManager,
      roles,
      setServerResponse: (res) => this.setState({ serverResponse: res }),
      setConfirmModalOpen: (val) => this.setState({ confirmModalOpen: val }),
      setConfirmModalMessage: (msg) => this.setState({ confirmModalMessage: msg }),
      setConfirmModalCallback: (cb) => this.setState({ confirmModalCallback: cb }),
      dispatch: this.props.dispatch
    });
  };

  handleBulkSelectedbyFactoryAdmin = () => {
    const { selectedApplicationIds } = this.state;
    const { loggedInUserId } = this.props;
    console.log("FACTORYADMINWEEE", loggedInUserId);

    if (selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message.toAssociation",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
                  note: "অ্যাসোসিয়েশনের কাছে প্রেরণ",
                  action: "forward_to_association",
                  applicationFromId: loggedInUserId,
                  applicationToId: 93,
                  toRoleId: 31,
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
      confirmModalMessage: "workforce.application.forward.message.toSectionUser",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
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
      confirmModalMessage: "workforce.application.forward.message.toSectionUser",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement } = this.props;
          try {
            await Promise.all(
              selectedApplicationIds.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
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
    const { loggedInUserId } = this.props;
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
              selectedApplicationIds.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.APPROVED_BY_DG,
                  grantAmount: this.state.editedGrantMoney,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.APPROVED_BY_DG,
                  note: "আবেদন ডিজি দ্বারা অনুমোদন করা হয়েছে",
                  action: "approved_by_dg",
                  applicationFromId: loggedInUserId,
                  applicationToId: 1,
                  toRoleId: 1,
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
    const { loggedInUserId } = this.props;
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
              selectedApplicationIds?.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.APPROVED_BY_DIRECTOR,
                  grantAmount: this.state.editedGrantMoney,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.APPROVED_BY_DIRECTOR,
                  note: "আবেদন পরিচালক দ্বারা অনুমোদন করা হয়েছে",
                  action: "approved_by_director",
                  applicationFromId: loggedInUserId,
                  applicationToId: 1,
                  toRoleId: 1,

                };
                const updateApplicationSummaryData = {
                  id: decodeId(this.props.summaryId),
                  status: WORKFORCE_STATUS.APPROVED_BY_DIRECTOR,
                };
                // console.log("summay row id", id);
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
  handleBulkApproveByEisAdvisor = async () => {
    const { selectedApplicationIds } = this.state;
    const { updateApplication, createApplicationMovement, updateApplicationSummary } = this.props;
    const { loggedInUserId } = this.props;
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
              selectedApplicationIds?.map(async (selectedItem) => {
                const decodedId = decodeId(selectedItem?.id);
                const updateApplicationData = {
                  id: decodedId,
                  status: WORKFORCE_STATUS.APPROVED_BY_EIS_ADVISOR,
                  grantAmount: this.state.editedGrantMoney,
                };
                const createApplicationMovementData = {
                  applicationId: decodedId,
                  status: WORKFORCE_STATUS.APPROVED_BY_EIS_ADVISOR,
                  note: "আবেদন ইআইএস উপদেষ্টা দ্বারা অনুমোদন করা হয়েছে",
                  action: "approved_by_eis_advisor",
                  applicationFromId: loggedInUserId,
                  applicationToId: 173,
                  toRoleId: 42,

                };
                const updateApplicationSummaryData = {
                  id: decodeId(this.props.summaryId),
                  status: WORKFORCE_STATUS.APPROVED_BY_EIS_ADVISOR,
                };
                // console.log("summay row id", id);
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
  handleBulkSelectedbyEisCommittee = () => {
    const { selectedApplicationIds } = this.state;
    const { loggedInUserId } = this.props;

    if (!selectedApplicationIds || selectedApplicationIds.length === 0) {
      alert("Please select at least one application.");
      return;
    }

    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message.toEisCoordinator",
      confirmModalCallback: async (confirmed) => {
        if (!confirmed) {
          this.setState({ confirmModalOpen: false, confirmModalCallback: null });
          return;
        }

        const {
          updateApplication,
          createApplicationMovement,
          updateApplicationSummary,
        } = this.props;

        try {
          /* -------------------------------------------------
             STEP 1: Validate Majority Approval For ALL
          ------------------------------------------------- */

          const allHaveMajority = selectedApplicationIds.every((item) => {
            const approvalUserIds = item?.eisApprovalIds
              ? safeParse(item.eisApprovalIds)
              : [];

            const approvedUserIds = item?.eisApprovedByIds
              ? safeParse(item.eisApprovedByIds)
              : [];

            const totalApprovals = Array.isArray(approvalUserIds) && approvalUserIds.length > 0
              ? approvalUserIds.length
              : 1;

            const totalApproved = Array.isArray(approvedUserIds)
              ? approvedUserIds.length
              : 0;

            if (totalApprovals === 0) return false;

            return totalApproved / totalApprovals > 0.5;
          });

          /* -------------------------------------------------
             STEP 2: Stop If Any Application Fails
          ------------------------------------------------- */

          if (!allHaveMajority) {
            this.setState({
              serverResponse: {
                status: "ERROR",
                message:
                  "অন্ততঃ একটি নির্বাচিত আবেদন মেজরিটি অনুমোদনপ্রাপ্ত নয়! অনুগ্রহ করে কমিটি সদস্যদের অনুমোদন প্রদান করতে বলুন",
              },
            });
            return;
          }

          /* -------------------------------------------------
             STEP 3: Run Updates (Only If All Passed)
          ------------------------------------------------- */

          await Promise.all(
            selectedApplicationIds.map(async (item) => {
              const decodedId = decodeId(item?.id);

              const updateApplicationData = {
                id: decodedId,
                status: WORKFORCE_STATUS.APPROVED_BY_COMMITTEE,
              };

              const createApplicationMovementData = {
                applicationId: decodedId,
                status: WORKFORCE_STATUS.APPROVED_BY_DG,
                note: "আবেদন কমিটি দ্বারা অনুমোদন করা হয়েছে",
                action: "approved_by_committee",
                applicationFromId: loggedInUserId,
                applicationToId: 173,
                toRoleId: 42,
              };

              await updateApplication(
                updateApplicationData,
                "update workforce application"
              );

              await createApplicationMovement(
                createApplicationMovementData,
                "create workforce movement"
              );
            })
          );

          // Update summary once (outside loop)
          await updateApplicationSummary(
            {
              id: decodeId(this.props.summaryId),
              status: WORKFORCE_STATUS.APPROVED_BY_COMMITTEE,
            },
            "update workforce application summary"
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

        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      },
    });
  };

  handleUpdateGrantMoney=async(application)=>{
    const { updateApplication} = this.props;
    const decodedId = safeDecodeId(application?.id);
    const updateApplicationData = {
                  id: decodedId,
                  grantAmount: this.state.editedGrantMoney,
                };
    await updateApplication(updateApplicationData, "update workforce application");
  }

  handleApprovalByEisCommittee = (selectedItem) => {
    const { loggedInUserId } = this.props;
    let majorityApproved = false;
    this.setState({
      confirmModalOpen: true,
      confirmModalMessage: "workforce.application.forward.message.toEisCoordinator",
      confirmModalCallback: async (confirmed) => {
        if (confirmed) {
          const { updateApplication, createApplicationMovement, updateApplicationSummary } = this.props;
          try {
            const approvalUserIds = selectedItem?.eisApprovalIds ? safeParse(selectedItem?.eisApprovalIds) : [];
            let approvedUserIds = selectedItem?.eisApprovedByIds ? safeParse(selectedItem?.eisApprovedByIds) : [];
            if (!approvedUserIds.includes(loggedInUserId)) {
              approvedUserIds.push(loggedInUserId);
            }
            else {
              this.setState({
                serverResponse: {
                  status: "ERROR",
                  message: "আপনি ইতিমধ্যে এই আবেদনটি অনুমোদন করেছেন!",
                },
              });
              return;
            }
            const numberOfApprovals = approvalUserIds?.length > 0 ? approvalUserIds?.length : 1;
            const numberOfApproved = approvedUserIds?.length > 0 ? approvedUserIds?.length : 0;


            if (numberOfApprovals > 0) {
              majorityApproved = numberOfApproved / numberOfApprovals > 0.5;
            }
            else {
              majorityApproved = true;
            }
            const decodedId = decodeId(selectedItem?.id);

            const updateApplicationData = {
              id: decodedId,
              status: majorityApproved ? WORKFORCE_STATUS.APPROVED_BY_COMMITTEE : selectedItem?.status,
              eisApprovedByIds: JSON.stringify(approvedUserIds),
            };
            // const createApplicationMovementData = {
            //   applicationId: decodedId,
            //   status: WORKFORCE_STATUS.APPROVED_BY_DG,
            //   note: "আবেদন কমিটি দ্বারা অনুমোদন করা হয়েছে",
            //   action: "approved_by_committee",
            //   applicationFromId: loggedInUserId,
            //   applicationToId: 173,
            //   toRoleId: 42,
            // };
            // const updateApplicationSummaryData = {
            //   id: decodeId(this.props.summaryId),
            //   status: WORKFORCE_STATUS.APPROVED_BY_COMMITTEE,
            // };
            await updateApplication(updateApplicationData, "update workforce application");
            // if (majorityApproved) {
            //   await createApplicationMovement(createApplicationMovementData, "create workforce movement");
            //   await updateApplicationSummary(updateApplicationSummaryData, "update workforce application summary");
            // }
            this.setState({
              serverResponse: {
                status: "SUCCESS",
                message: "নির্বাচিত আবেদনটির অনুমোদনের জন্য আপনার সাক্ষর গৃহিত হয়েছে। অপেক্ষা করুন যতক্ষণ না কমিটির অন্যান্য সদস্যরাও তাদের অনুমোদন প্রদান করেন।",
                // message: majorityApproved?"নির্বাচিত আবেদনটিতে মেজরিটি অনুমোদন প্রাপ্ত হয়েছে এবং আবেদনটি অনুমোদিত হয়েছে" :"নির্বাচিত আবেদনটির অনুমোদনের জন্য আপনার সাক্ষর গৃহিত হয়েছে। অপেক্ষা করুন যতক্ষণ না কমিটির অন্যান্য সদস্যরাও তাদের অনুমোদন প্রদান করেন।",
              },
            });
            window.location.reload();
          } catch (error) {
            console.error("Approval failed:", error);
            this.setState({
              serverResponse: {
                status: "ERROR",
                message: "আবেদন অনুমোদন ব্যর্থ হয়েছে!",
              },
            });
          }
        }
        this.setState({ confirmModalOpen: false, confirmModalCallback: null });
      }
    });
  };

  handleCloseBFTN = () => {
    this.setState({ openGenerateBFTN: false });
  };
  handleCloseCommitteeReport = () => {
    this.setState({ openGenerateCommitteeReport: false });
  };
  handleCloseEisBFTN = () => {
    this.setState({ openGenerateEisBFTN: false });
  };
  handleCloseEisDependentBFTN = () => {
    this.setState({ openGenerateEisDependentBFTN: false });
  };
  handleOpenBFTN = () => {
    this.setState({ openGenerateBFTN: true });
  };
  handleOpenGenerateCommitteeReport = () => {
    this.setState({ openGenerateCommitteeReport: true });
  };
  handleOpenEisBFTN = () => {
    this.setState({ openGenerateEisBFTN: true });
  };
  handleOpenEisDependentBFTN = () => {
    this.setState({ openGenerateEisDependentBFTN: true });
  };

  onCheckBoxSelect = (selection) => {
    this.setState({ selectedApplicationIds: selection });
  };

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
  handleConfirmRejectModalClose = (result) => {
    if (this.state.confirmModalCallback) {
      this.state.confirmModalCallback(result === 1);
    } else {
      this.setState({ openRejectModal: false });
    }
  };

  handleAddComment=(args)=>{
    this.setState({rejectComment:args})
  }

  render() {
    const {
      forwardModalOpen,
      forwardPaymentModalOpen,
      forwardModalOpenSA,
      forwardModalOpenEisDoctor,
      forwardModalOpenEIS,
      forwardModalOpenEISToCoordinator,
      revertModalOpen,
      revertByChecker,
      revertByApprover,
      revertByFactoryAdmin,
      selectedApplication,
      openGenerateBFTN,
      openGenerateCommitteeReport,
      openGenerateEisBFTN,
      openGenerateEisDependentBFTN,
      openEisApprovalSignature,
      showHistoryFilter,
      selectedApplicationIds
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
      isApproved,
      coloredRow,
      eisPayments,
      roles
    } = this.props;

    const count = applicationsPageInfo.totalCount;
    const userType = getUserTypeFromRights(userRights);

    const filterPane = ({ filters, onChangeFilters }) => {
      return (
        <ApplicationProcessFilter
          userRights={userRights}
          filters={filters}
          onChangeFilters={onChangeFilters}
          setShowHistoryFilter={(showHistoryFilter) => this.setState({ showHistoryFilter })}
        />
      )
    };

    console.log({ Ids: selectedApplicationIds })
    const disableButtons = this.props.disableButtons ? decodeId(this.props.disableButtons) : null;
    const approvedButton = this.props.approvedButton ? decodeId(this.props.approvedButton) : null;
    const meetingForwardButton = this.props.meetingForwardButton ? decodeId(this.props.meetingForwardButton) : null;
    return (
      <React.Fragment>
        <Searcher
          module={MODULE_NAME}
          selectWithCheckbox={getUserTypeFromRights(userRights) !== WORKFORCE_USER_TYPE.APPLICANT ? true : false}
          withSelection={getUserTypeFromRights(userRights) !== WORKFORCE_USER_TYPE.APPLICANT ? "multiple" : false}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPLICANT ? null : filterPane}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={applications}
          itemsPageInfo={applicationsPageInfo}
          fetchingItems={fetchingApplications}
          fetchedItems={fetchedApplications}
          errorItems={errorApplications}
          tableTitle={<FormattedMessage module={MODULE_NAME} id={this.dynamicTableTitle ? this.dynamicTableTitle : "workforce.employee.application.process"} />}
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
          // onChangeSelectionIds={(ids) => console.log("Selected ids:", ids)}
          onCheckBoxSelect={(ids) => this.onCheckBoxSelect(ids)}
          coloredRow={coloredRow}
        />
        {userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT || userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            {userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR &&
              approvedButton === 1 && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.setState({ forwardModalOpenEISToCoordinator: true })}
                  >
                    <FormattedMessage
                      module="workforce"
                      id="workforce.employee.application.forwardToSelectionOffice"
                    />
                  </Button>
                  {this.props.verifiedApplications && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleOpenEisDependentBFTN}
                      >
                        <FormattedMessage
                          module="workforce"
                          id="workforce.employee.application.paymentProcess"
                        />
                      </Button>
                    </>
                  )}

                </>
              )}



            {disableButtons == 1 ? (
              <>
                {userType !== WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
                  <>
                  <IconButton onClick={this.handleOpenBFTN}>
                    <PrintIcon />
                  </IconButton>
                  {userType !== WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT && (<Button variant="contained" color="primary" onClick={this.handleOpenGenerateCommitteeReport} style={{color:"white",paddingX:0.1,fontSize:"small"}}>
                    <IconButton style={{color:"white"}}>
                      <PrintIcon />
                    </IconButton>
                    <FormattedMessage id="workforce.generate.committee.report" />
                  </Button>)}
                  </>
                )}
                {userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
                  <>
                    <IconButton onClick={this.handleOpenEisBFTN}>
                      <PrintIcon />
                    </IconButton>
                    <Button variant="contained" color="primary" onClick={() => { this.setState({ openEisApprovalSignature: true }) }}>
                      <FormattedMessage module="workforce" id="workforce.employee.application.eisApproval.signature" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                {meetingForwardButton == 1 ? (
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
                    {userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleOpenEisDependentBFTN}
                        >
                          <FormattedMessage
                            module="workforce"
                            id="workforce.employee.application.paymentProcess"
                          />
                        </Button>
                      </>
                    )}
                    {![WORKFORCE_USER_TYPE.EIS_ADVISOR, WORKFORCE_USER_TYPE.EIS_COORDINATOR].includes(userType) && (
                      <Button
                        variant="contained"
                        color="primary"
                        // onClick={this.handleBulkSelectedbySectionAdminToDoctor}
                        onClick={() => this.setState({ forwardModalOpenEisDoctor: true })}
                      >
                        <FormattedMessage
                          module="workforce"
                          id="workforce.employee.application.forwardToDoctor"
                        />
                      </Button>
                    )}
                    {WORKFORCE_USER_TYPE.EIS_COORDINATOR.includes(userType) && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => this.setState({ forwardModalOpenEisDoctor: true })}
                        >
                          <FormattedMessage
                            module="workforce"
                            id="workforce.employee.application.forwardToDoctor"
                          />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {![WORKFORCE_USER_TYPE.EIS_ADVISOR, WORKFORCE_USER_TYPE.EIS_COORDINATOR].includes(userType) && (
                      <Button variant="contained" color="primary" onClick={() => this.setState({ forwardModalOpenSA: true })}>
                        <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                      </Button>
                    )}
                    {WORKFORCE_USER_TYPE.EIS_COORDINATOR.includes(userType) && this.props.filedApplications && (
                      <>
                        <Button variant="contained" color="primary" onClick={() => this.setState({ forwardModalOpenEIS: true })}>
                          <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
                        </Button>
                      </>
                    )}
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
            {meetingForwardButton == 1 ? (
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
                <Button
                  variant="contained"
                  color="primary"
                  // onClick={this.handleBulkSelectedbySectionAdminToDoctor}
                  onClick={() => this.setState({ forwardModalOpenEisDoctor: true })}
                >
                  <FormattedMessage
                    module="workforce"
                    id="workforce.employee.application.forwardToDoctor"
                  />
                </Button>
              </>
            ) : (
              disableButtons != 1 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.setState({ forwardModalOpenSA: true })}
                >
                  <FormattedMessage
                    module="workforce"
                    id="workforce.employee.application.forward"
                  />
                </Button>
              )
            )}
            {this.props.approveMeetingSheet && (
              <>
              <Button variant="contained" color="primary" onClick={this.handleOpenBFTN} style={{color:"white",paddingX:0.25,fontSize:"small"}}>
                <IconButton style={{color:"white"}}>
                  <PrintIcon />
                </IconButton>
                <FormattedMessage id="workforce.generateBFTN.beneficiary.payment.calculation"/>
              </Button>
              <Button variant="contained" color="primary" onClick={this.handleOpenGenerateCommitteeReport} style={{color:"white",paddingX:0.1,fontSize:"small"}}>
                <IconButton style={{color:"white"}}>
                  <PrintIcon />
                </IconButton>
                <FormattedMessage id="workforce.generate.committee.report" />
              </Button> 
              </>
            )}
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.CHECKER || userType === WORKFORCE_USER_TYPE.CHECKER_TWO || userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR
          || userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.BLWF_CHECKER || userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE || userType === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR
          || userType === WORKFORCE_USER_TYPE.EIS_OFFICER ? (
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
        <CustomSnackbar
          open={!!this.state.serverResponse}
          onClose={() => this.setState({ serverResponse: null })}
          autoHideDuration={3000}
          type={this.state.serverResponse?.status?.toLowerCase() || "info"}
          message={this.state.serverResponse?.message}
        />

        {userType === WORKFORCE_USER_TYPE.APPROVER || userType === WORKFORCE_USER_TYPE.BLWF_APPROVER ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            {disableButtons !== 1 && (
              <>
                <Button variant="contained" color="primary" onClick={this.handleBulkSelectedByApprover}>
                  <FormattedMessage module="workforce" id="workforce.employee.application.bulkApprove" />
                </Button>
                <Button variant="contained" color="primary" onClick={this.handleOpenBFTN}>
                  <PrintIcon /> &nbsp;
                  <FormattedMessage module="workforce" id="workforce.employee.application.printAndForwardToDirector" />
                </Button>
              </>
            )}
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.ASSOCIATION ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="primary" onClick={this.handleBulkSelectedbyAssociation}>
              {/* <FormattedMessage module="workforce" id="workforce.employee.application.forwardToSectionAdmin" /> */}
              <FormattedMessage module="workforce" id="workforce.employee.application.forward" />
              {/* <FormattedMessage module="workforce" id="workforce.employee.application.forwardToDG" /> */}
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
            {disableButtons !== 1 && (
              <>
                <Button variant="contained" color="primary" onClick={() => this.setState({ forwardModalOpenFA: true })}>
                  <FormattedMessage module="workforce" id="workforce.employee.application.forwardToAssociation" />
                </Button>
              </>
            )}
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.ADMIN ? (
          disableButtons !== 1 && (
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
          )
        ) : null}
        {userType === WORKFORCE_USER_TYPE.EIS_COMMITTEE || userType === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE ? (
          <Box
            style={{
              marginTop: 10,
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
           
            <Button variant="contained" color="primary" onClick={this.handleOpenEisDependentBFTN}>
              <FormattedMessage module="workforce" id="workforce.employee.application.eisApproval" />
            </Button>
           
            <GenereteEisDependentBFTN
              open={openGenerateEisDependentBFTN}
              onClose={this.handleCloseEisDependentBFTN}
              eisPayments={eisPayments}
              status="approved_by_committee"
              userRights={userRights}
              selectedApplicationIds={this.state.selectedApplicationIds}
            />
          </Box>
        ) : null}
        {userType === WORKFORCE_USER_TYPE.DIRECTOR || userType === WORKFORCE_USER_TYPE.BLWF_DIRECTOR ? (
          disableButtons !== 1 && (
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
              <Button variant="contained" color="primary" onClick={this.handleOpenBFTN} style={{color:"white",paddingX:0.25,fontSize:"small"}}>
              <IconButton  style={{color:"white"}}>
                <PrintIcon />
              </IconButton>
              <FormattedMessage id="workforce.generateBFTN.beneficiary.payment.calculation"/>
              </Button>
              <GenerateBFTN
                open={openGenerateBFTN}
                onClose={this.handleCloseBFTN}
                applications={applications}
                status={"forward_to_director"}
                userRights={userRights}
              />
              <RevertApplicationModal
                open={revertModalOpen}
                onClose={this.handleCloseRevertModal}
                revertByChecker={revertByChecker}
                selectedApplication={this.state.selectedApplication}
                onSubmitRevert={this.handleRevertSubmit}
              />
            </Box>
          )
        ) : null}
        {userType === WORKFORCE_USER_TYPE.EIS_ADVISOR ? (
          disableButtons !== 1 && (
            <Box
              style={{
                marginTop: 10,
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
              }}
            >
              <Button variant="contained" color="primary" onClick={this.handleBulkApproveByEisAdvisor}>
                <FormattedMessage module="workforce" id="workforce.employee.application.eis_advisor.recommended" />
              </Button>
              {/* <Button variant="contained" color="primary" onClick={()=>{this.setState({openEisApprovalSignature:true})}}>
                <FormattedMessage module="workforce" id="workforce.employee.application.eisApproval.signature" />
              </Button>
              {/* <IconButton onClick={this.handleOpenEisDependentBFTN}>
              <PrintIcon />
              </IconButton> */}
              <Button variant="outlined" color="primary" onClick={this.handleOpenEisDependentBFTN}>
                <FormattedMessage module="workforce" id="workforce.employee.application.eisApproval" />
              </Button>

              <RevertApplicationModal
                open={revertModalOpen}
                onClose={this.handleCloseRevertModal}
                revertByChecker={revertByChecker}
                selectedApplication={this.state.selectedApplication}
                onSubmitRevert={this.handleRevertSubmit}
              />
              <GenereteEisDependentBFTN
                open={openGenerateEisDependentBFTN}
                onClose={this.handleCloseEisDependentBFTN}
                eisPayments={eisPayments}
                status="approved_by_committee"
                userRights={userRights}
                selectedApplicationIds={this.state.selectedApplicationIds}
              />
              <EisApprovalSignature
                open={openEisApprovalSignature}
                onClose={() => this.setState({ openEisApprovalSignature: false })}
                eisPayments={eisPayments}
                status="approved_by_committee"
                userRights={userRights}
                selectedApplicationIds={this.state.selectedApplicationIds}
              />
            </Box>
          )
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
            );
          }
          else if (userType === WORKFORCE_USER_TYPE.DOCTOR || userType === WORKFORCE_USER_TYPE.BLWF_DOCTOR || userType === WORKFORCE_USER_TYPE.CHECKER || userType === WORKFORCE_USER_TYPE.CHECKER_TWO ||userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
            || userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR || userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR
            || userType === WORKFORCE_USER_TYPE.EIS_OFFICER || userType === WORKFORCE_USER_TYPE.BLWF_CHECKER || userType === WORKFORCE_USER_TYPE.EIS_DOCTOR) {
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
              disableButtons !== 1 && (
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
                    status={"approved_by_director"}
                    userRights={userRights}
                  />
                  <RevertApplicationModal
                    open={revertModalOpen}
                    onClose={this.handleCloseRevertModal}
                    revertByChecker={revertByChecker}
                    selectedApplication={this.state.selectedApplication}
                    onSubmitRevert={this.handleRevertSubmit}
                  />
                </>
              )
            );
          } else if (userType === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
            return (
              <>
                <ForwardApplicationFactoryAdminModal
                  open={this.state.forwardModalOpenFA}
                  onClose={this.handleCloseForwardModalForFA}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  onSubmitForward={this.handleForwardSubmit}
                  organizationEmployee={organizationEmployee}
                  roles={roles}
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
          } else if (userType === WORKFORCE_USER_TYPE.ASSOCIATION) {
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
          } else if (userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT || userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR) {
            return (
              <>
                <ForwardApplicationSectionAdminModal
                  open={forwardModalOpenSA}
                  onClose={this.handleCloseForwardModalForSectionAdmin}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  onSubmitForward={this.handleForwardSubmit}
                  userRights={userRights}
                />
                <ForwardApplicationSummarySectionAdminModal
                  open={this.state.forwardModalOpenSummarySA}
                  onClose={this.handleCloseForwardModalForSummarySectionAdmin}
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
                  roleIds={this.props.roleIds}
                />
                <ForwardEisPaymentProcessModal
                  open={forwardPaymentModalOpen}
                  onClose={this.handleCloseForwardPaymentModal}
                  selectedApplication={this.state.selectedApplication}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  userRights={userRights}
                />
                {userType !== WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
                  <>
                  <GenerateBFTN
                    open={openGenerateBFTN}
                    onClose={this.handleCloseBFTN}
                    applications={applications}
                    status={"approved_by_dg"}
                    userRights={userRights}
                  />
                  <GenerateCommitteeReport
                    open={openGenerateCommitteeReport}
                    onClose={this.handleCloseCommitteeReport}
                    applications={applications}
                    status={"approved_by_dg"}
                    userRights={userRights}
                  />
                  </>
                )}
                {userType === WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
                  <>
                    <GenerateEisBFTN
                      open={openGenerateEisBFTN}
                      onClose={this.handleCloseEisBFTN}
                      eisPayments={eisPayments}
                      status="approved_by_committee"
                      userRights={userRights}
                      selectedApplicationIds={this.state.selectedApplicationIds}

                    />
                    <EisApprovalSignature
                      open={openEisApprovalSignature}
                      onClose={() => this.setState({ openEisApprovalSignature: false })}
                      eisPayments={eisPayments}
                      status="approved_by_committee"
                      userRights={userRights}
                      selectedApplicationIds={this.state.selectedApplicationIds}
                    />
                    <GenereteEisDependentBFTN
                      open={openGenerateEisDependentBFTN}
                      onClose={this.handleCloseEisDependentBFTN}
                      eisPayments={eisPayments}
                      status="approved_by_committee"
                      userRights={userRights}
                      selectedApplicationIds={this.state.selectedApplicationIds}
                    />
                  </>
                )}

                <ForwardApplicationEisDoctorModal
                  open={forwardModalOpenEisDoctor}
                  onClose={this.handleCloseForwardModalForEisDoctor}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  onSubmitForward={this.handleForwardSubmit}
                  userRights={userRights}
                />
                <ForwardApplicationEisCoordinatorModal
                  open={forwardModalOpenEIS}
                  onClose={this.handleCloseForwardModalForEisCoordinator}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  onSubmitForward={this.handleForwardSubmit}
                  userRights={userRights}
                  summaryId={this.props.summaryId}
                  roleIds={this.props.roleIds}
                />
                <ForwardEisCoordinatoToCommitteeModal
                  open={forwardModalOpenEISToCoordinator}
                  onClose={this.handleCloseForwardModalForEisCoordinatorToCommittee}
                  selectedApplicationIds={this.state.selectedApplicationIds}
                  onSubmitForward={this.handleForwardSubmit}
                  userRights={userRights}
                  summaryId={this.props.summaryId}
                  roleIds={this.props.roleIds}
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
                <ForwardApplicationEisDoctorModal
                  open={forwardModalOpenEisDoctor}
                  onClose={this.handleCloseForwardModalForEisDoctor}
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
                  roleIds={this.props.roleIds}
                />
                <GenerateBFTN
                  open={openGenerateBFTN}
                  onClose={this.handleCloseBFTN}
                  applications={applications}
                  status={"approved_by_dg"}
                  userRights={userRights}
                />
                <GenerateCommitteeReport
                    open={openGenerateCommitteeReport}
                    onClose={this.handleCloseCommitteeReport}
                    applications={applications}
                    status={"approved_by_dg"}
                    userRights={userRights}
                  />
              </>
            );
          } else if (userType === WORKFORCE_USER_TYPE.APPROVER || userType === WORKFORCE_USER_TYPE.BLWF_APPROVER) {
            return (
              disableButtons !== 1 && (
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
                    onClose={this.handleCloseRevertModal}
                    revertByChecker={revertByChecker}
                    selectedApplication={this.state.selectedApplication}
                    onSubmitRevert={this.handleRevertSubmit}
                  />
                  {/* <ForwardApplicationAdminModal
                    open={forwardModalOpen}
                    onClose={this.handleCloseForwardModal}
                    selectedApplication={selectedApplication}
                    onSubmitForward={this.handleForwardSubmit}
                  /> */}
                  <GenerateBFTN
                    open={openGenerateBFTN}
                    onClose={this.handleCloseBFTN}
                    applications={applications}
                    status={"selected"}
                    summary_Id={decodeId(this.props.summaryId)}
                    summaryData={this.props.summaryData}
                    userRights={userRights}
                  />
                </>
              )
            );
          } else if (userType === WORKFORCE_USER_TYPE.EIS_COMMITTEE || userType === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE) {
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
          }
          return null;
        })()}

        <ConfirmModal
          open={this.state.confirmModalOpen}
          message={this.state.confirmModalMessage}
          onClose={this.handleConfirmModalClose}
          addComment={this.handleAddComment}
          modalFlag={this.state.modalFlag}
        />
        <ConfirmRejectModal
          open={this.state.openRejectModal}
          onClose={this.handleConfirmRejectModalClose}
          addComment={this.handleAddComment}
          modalFlag={"reject"}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  i_user: state.core && state.core.user && state.core.user.i_user,
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  applications: state.workforce.applications,
  eisPayments: state.workforce.eisPayments,
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
  loggedInUserId: state.core?.user?.i_user?.id,
  roles: state?.workforce?.roles,
});

const mapDispatchToProps = (dispatch) => (
  {
    ...bindActionCreators(
      {
        fetchApplicationsSummary,
        fetchApplicationMovementsSummary,
        fetchOrganizationEmployeeDesignation,
        updateApplication,
        updateApplicationSummary,
        createApplicationMovement,
        fetchOrganizationEmployee,
        fetchFactoryEmployee,
        fetchWorkforceDocument,
        testWorkforcePayment,
        fetchUsersByRoleId,
        fetchRoles,
        journalize,
        coreConfirm,
      },
      dispatch
    ), dispatch
  });

export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(ApplicationProcessSearcher)))));
