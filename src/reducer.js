import {
  parseData,
  pageInfo,
  formatServerError,
  formatGraphQLError,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
  decodeId,
} from "@openimis/fe-core";
import { CLEAR, ERROR, REQUEST, SUCCESS } from "./utils/action-type";

export const ACTION_TYPE = {};

function reducer(
  state = {
    ///organizations states
    fetchingOrganizations: false,
    errorOrganizations: null,
    fetchedOrganizations: false,
    organizations: [],
    organizationsPageInfo: { totalCount: 0 },

    fetchingOrganization: false,
    errorOrganization: null,
    fetchedOrganization: false,
    organization: null,
    organizationPageInfo: { totalCount: 0 },

    fetchingOrganizationsPick: false,
    errorOrganizationsPick: null,
    fetchedOrganizationsPick: false,
    organizationsPick: [],

    fetchingDocumentType: false,
    errorDocumentType: null,
    fetchedDocumentType: false,
    documentType: [],

    fetchingBanksPick: false,
    errorBanksPick: null,
    fetchedBanksPick: false,
    banksPick: [],

    fetchingPostOfficesPick: false,
    errorPostOfficesPick: null,
    fetchedPostOfficesPick: false,
    postOfficesPick: [],

    fetchingWorkforceOtp: false,
    errorWorkforceOtp: null,
    fetchedWorkforceOtp: false,
    workforceOtp: null,

    fetchingBranchPick: false,
    errorBranchPick: null,
    fetchedBranchPick: false,
    branchPick: [],

    fetchingDistrictBanksPick: false,
    errorDistrictBanksPick: null,
    fetchedDistrictBanksPick: false,
    districtBanksPick: [],

    ///representative states
    fetchingRepresentatives: false,
    errorRepresentatives: null,
    fetchedRepresentatives: false,
    representatives: [],
    representativesPageInfo: { totalCount: 0 },

    fetchedRepresentativeByClientMutationId: null,
    fetchedApplicationIdByClientMutationId: null,
    fetchedApplicationSummaryIdByClientMutationId: null,
    fetchedWorkforceOrganizationByDesignationId: null,
    fetchedWorkforceFactoryId: null,
    verifyNidDetails: null,

    ///organizations employee states
    fetchingOrganizationEmployees: false,
    errorOrganizationEmployees: null,
    fetchedOrganizationEmployees: false,
    organizationEmployees: [],
    organizationEmployeesPageInfo: { totalCount: 0 },

    fetchingOrganizationEmployee: false,
    errorOrganizationEmployee: null,
    fetchedOrganizationEmployee: false,
    organizationEmployee: null,
    organizationEmployeePageInfo: { totalCount: 0 },

    ////employee dependent states
    fetchingEmployeeDependents: false,
    errorEmployeeDependents: null,
    fetchedEmployeeDependents: false,
    employeeDependents: [],
    employeeDependentsPageInfo: { totalCount: 0 },

    fetchingEmployeeDependent: false,
    errorEmployeeDependent: null,
    fetchedEmployeeDependent: false,
    employeeDependent: null,
    employeeDependentPageInfo: { totalCount: 0 },

    ////employee services states
    fetchingEmployeeServices: false,
    errorEmployeeServices: null,
    fetchedEmployeeServices: false,
    employeeServices: [],
    employeeServicesPageInfo: { totalCount: 0 },

    fetchingEmployeeService: false,
    errorEmployeeService: null,
    fetchedEmployeeService: false,
    employeeService: null,
    employeeServicePageInfo: { totalCount: 0 },

    ///workforce office states
    fetchingWorkforceOffices: false,
    errorWorkforceOffices: null,
    fetchedWorkforceOffices: false,
    workforceOffices: [],
    workforceOfficesPageInfo: { totalCount: 0 },

    fetchingWorkforceOffice: false,
    errorWorkforceOffice: null,
    fetchedWorkforceOffice: false,
    workforceOffice: null,
    workforceOfficePageInfo: { totalCount: 0 },

    fetchingWorkforceOfficesPick: false,
    errorWorkforceOfficesPick: null,
    fetchedWorkforceOfficesPick: false,
    workforceOfficesPick: [],

    ///workforce factory states
    fetchingWorkforceFactories: false,
    errorWorkforceFactories: null,
    fetchedWorkforceFactories: false,
    workforceFactories: [],
    workforceFactoriesPageInfo: { totalCount: 0 },

    fetchingWorkforceFactory: false,
    errorWorkforceFactory: null,
    fetchedWorkforceFactory: false,
    workforceFactory: null,
    workforceFactoryPageInfo: { totalCount: 0 },

    fetchingWorkforceFactoriesPick: false,
    errorWorkforceFactoriesPick: null,
    fetchedWorkforceFactoriesPick: false,
    workforceFactoriesPick: [],

    ///workforce company states
    fetchingWorkforceCompanies: false,
    errorWorkforceCompanies: null,
    fetchedWorkforceCompanies: false,
    workforceCompanies: [],
    workforceCompaniesPageInfo: { totalCount: 0 },

    fetchingWorkforceCompany: false,
    errorWorkforceCompany: null,
    fetchedWorkforceCompany: false,
    workforceCompany: null,
    workforceCompanyPageInfo: { totalCount: 0 },

    fetchingWorkforceCompaniesPick: false,
    errorWorkforceCompaniesPick: null,
    fetchedWorkforceCompaniesPick: false,
    workforceCompaniesPick: [],

    fetchingDistrictOfficePick: false,
    errorDistrictOfficePick: null,
    fetchedDistrictOfficePick: false,
    districtOfficePick: [],

    fetchingEmployeePick: false,
    errorEmployeePick: null,
    fetchedEmployeePick: false,
    employeePick: [],

    ///workforce employee states
    fetchingWorkforceEmployees: false,
    errorWorkforceEmployees: null,
    fetchedWorkforceEmployees: false,
    workforceEmployees: [],
    workforceEmployeesPageInfo: { totalCount: 0 },

    fetchingWorkforceEmployee: false,
    errorWorkforceEmployee: null,
    fetchedWorkforceEmployee: false,
    workforceEmployee: null,
    workforceEmployeePageInfo: { totalCount: 0 },

    ///Unit Designations states
    fetchingUnitDesignations: false,
    errorUnitDesignations: null,
    fetchedUnitDesignations: false,
    unitDesignations: [],
    unitDesignationsPageInfo: { totalCount: 0 },

    fetchingUnitDesignation: false,
    errorUnitDesignation: null,
    fetchedUnitDesignation: false,
    unitDesignation: null,

    ///organization unit states
    fetchingOrganizationUnitsPick: false,
    errorOrganizationUnitsPick: null,
    fetchedOrganizationUnitsPick: false,
    organizationUnitsPick: [],

    fetchingOrganizationUnits: false,
    errorOrganizationUnits: null,
    fetchedOrganizationUnits: false,
    organizationUnits: [],
    organizationUnitsPageInfo: { totalCount: 0 },

    fetchingOrganizationUnit: false,
    errorOrganizationUnit: null,
    fetchedOrganizationUnit: false,
    organizationUnit: null,
    organizationUnitPageInfo: { totalCount: 0 },

    fetchingGrievanceConfig: false,
    fetchedGrievanceConfig: false,
    errorGrievanceConfig: null,
    grievanceConfig: null,

    ///employee designation states
    fetchingEmployeeDesignationData: false,
    fetchedEmployeeDesignationData: false,
    errorEmployeeDesignationData: null,
    employeeDesignationData: null,

    fetchingUnitWiseDesignationData: false,
    fetchedUnitWiseDesignationData: false,
    errorUnitWiseDesignationData: null,
    unitWiseDesignationData: null,

    fetchingWorkforceEmployeeDesignation: false,
    fetchedWorkforceEmployeeDesignation: false,
    errorWorkforceEmployeeDesignation: null,
    workforceEmployeeDesignation: null,

    ///Bank states
    fetchingBanks: false,
    errorBanks: null,
    fetchedBanks: false,
    banks: [],
    banksPageInfo: { totalCount: 0 },

    fetchingBank: false,
    errorBank: null,
    fetchedBank: false,
    bank: null,
    bankPageInfo: { totalCount: 0 },

    fetchingWorkforceDependent: false,
    errorWorkforceDependent: null,
    fetchedWorkforceDependent: false,
    workforceDependent: [],
    workforceDocumentPageInfo: { totalCount: 0 },

    submittingMutation: false,
    mutation: {},

    ////employee accident states
    fetchingEmployeeAccidents: false,
    errorEmployeeAccidents: null,
    fetchedEmployeeAccidents: false,
    employeeAccidents: [],
    employeeAccidentsPageInfo: { totalCount: 0 },

    fetchingEmployeeAccident: false,
    errorEmployeeAccident: null,
    fetchedEmployeeAccident: false,
    employeeAccident: null,
    employeeAccidentPageInfo: { totalCount: 0 },

    ///workforce document ///
    fetchingDocument: false,
    errorDocument: null,
    fetchedDocument: false,
    document: [],
    documentPageInfo: { totalCount: 0 },

    ////employee Account states
    fetchingEmployeeAccounts: false,
    errorEmployeeAccounts: null,
    fetchedEmployeeAccounts: false,
    employeeAccounts: [],
    employeeAccountsPageInfo: { totalCount: 0 },

    fetchingEmployeeAccount: false,
    errorEmployeeAccount: null,
    fetchedEmployeeAccount: false,
    employeeAccount: null,
    employeeAccountPageInfo: { totalCount: 0 },

    ////Application states
    fetchingApplications: false,
    errorApplications: null,
    fetchedApplications: false,
    applications: [],
    applicationsPageInfo: { totalCount: 0 },

    fetchingApplicationsSummary: false,
    errorApplicationsSummary: null,
    fetchedApplicationsSummary: false,
    applicationsSummary: [],
    applicationsSummaryPageInfo: { totalCount: 0 },

    fetchingApplication: false,
    errorApplication: null,
    fetchedApplication: false,
    application: null,
    applicationPageInfo: { totalCount: 0 },

    ////Application states
    fetchingApplications: false,
    errorApplications: null,
    fetchedApplications: false,
    applications: [],
    applicationsPageInfo: { totalCount: 0 },

    ///fetch diseases
    fetchingDiseases: false,
    errorDiseases: null,
    fetchedDiseases: false,
    diseases: [],
    diseasesPageInfo: { totalCount: 0 },

    fetchingApplication: false,
    errorApplication: null,
    fetchedApplication: false,
    application: null,
    applicationPageInfo: { totalCount: 0 },

    ////Application movement states
    fetchingApplicationMovements: false,
    errorApplicationMovements: null,
    fetchedApplicationMovements: false,
    applicationMovements: [],
    applicationMovementsPageInfo: { totalCount: 0 },

    fetchingApplicationMovement: false,
    errorApplicationMovement: null,
    fetchedApplicationMovement: false,
    applicationMovement: null,
    applicationMovementPageInfo: { totalCount: 0 },

    ////Application summary states

    fetchingApplicationSummary: false,
    errorApplicationSummary: null,
    fetchedApplicationSummary: false,
    applicationSummary: null,
    applicationSummaryPageInfo: { totalCount: 0 },

    // Admin workforce role-wise users
    fetchingRoleWiseUsers: false,
    errorRoleWiseUsers: null,
    fetchedRoleWiseUsers: false,
    roleWiseUsers: [],
    roleWiseUsersPageInfo: { totalCount: 0 },

    // eis payment process
    fetchingEisPayments: false,
    errorEisPayments: null,
    fetchedEisPayments: false,
    eisPayments: [],
    eisPaymentsPageInfo: { totalCount: 0 },

    ///file upload state
    uploadedFilesByField: {},

    ////workforce otp id ///
    workforceOtpId: "",

    selectedEmployee: null,

    uploadFile: [],
    uploadDependentFile: [],

    workforceApplicationStatusCount: {},
  },
  action
) {
  switch (action.type) {
    case "SET_UPLOADED_FILES":
      return {
        ...state,
        uploadedFilesByField: {
          ...state.uploadedFilesByField,
          [action.payload.fieldKey]: action.payload.files,
        },
      };

    case "REMOVE_UPLOADED_FILE":
      return {
        ...state,
        uploadedFilesByField: {
          ...state.uploadedFilesByField,
          [action.payload.fieldKey]: state.uploadedFilesByField[action.payload.fieldKey]?.filter((f) => f.file.name !== action.payload.fileName) || [],
        },
      };

    case "CLEAR_ALL_UPLOADED_FILES":
      return {
        ...state,
        uploadedFilesByField: {},
      };
    case "SET_UPLOAD_FILE_DATA":
      return {
        ...state,
        uploadFile: [...(state.uploadFile || []), action.payload],
      };
    case "SET_UPLOAD_DEPENDENT_FILE_DATA":
      return {
        ...state,
        uploadDependentFile: [...(state.uploadDependentFile || []), action.payload],
      };
    
      case "SET_SELECTED_EMPLOYEE":
      return {
        ...state,
        selectedEmployee: action.payload,
      };
    case "WORKFORCE_ORGANIZATIONS_REQ":
      return {
        ...state,
        fetchingOrganizations: true,
        fetchedOrganizations: false,
        organizations: [],
        organizationsPageInfo: { totalCount: 0 },
        errorOrganizations: null,
      };
    case "WORKFORCE_ORGANIZATIONS_RESP":
      return {
        ...state,
        fetchingOrganizations: false,
        fetchedOrganizations: true,
        organizations: parseData(action.payload.data.workforceOrganizations),
        organizationsPageInfo: pageInfo(action.payload.data.workforceOrganizations),
        errorOrganizations: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATIONS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_ORGANIZATION_REQ":
      return {
        ...state,
        fetchingOrganization: true,
        fetchedOrganization: false,
        organization: null,
        errorOrganization: null,
      };
    case "WORKFORCE_ORGANIZATION_RESP":
      return {
        ...state,
        fetchingOrganization: false,
        fetchedOrganization: true,
        organization: parseData(action.payload.data.workforceOrganizations).map((Organization) => ({
          ...Organization,
          id: decodeId(Organization.id),
        }))?.[0],
        errorOrganization: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_DOCUMENT_REQ":
      return {
        ...state,
        fetchingDocument: true,
        fetchedDocument: false,
        document: null,
        errorDocument: null,
      };
    case "WORKFORCE_DOCUMENT_RESP":
      return {
        ...state,
        fetchingDocument: false,
        fetchedDocument: true,
        document: parseData(action.payload.data.workforceDocuments),
        errorDocument: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_ORGANIZATION_UNIT_DESIGNATIONS_REQ":
      return {
        ...state,
        fetchingUnitDesignations: true,
        fetchedUnitDesignations: false,
        unitDesignations: [],
        unitDesignationsPageInfo: { totalCount: 0 },
        errorUnitDesignations: null,
      };
    case "WORKFORCE_ORGANIZATION_UNIT_DESIGNATIONS_RESP":
      return {
        ...state,
        fetchingUnitDesignations: false,
        fetchedUnitDesignations: true,
        unitDesignations: parseData(action.payload.data.workforceOrganizationUnitDesignations),
        unitDesignationsPageInfo: pageInfo(action.payload.data.workforceOrganizationUnitDesignations),
        errorUnitDesignations: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATION_UNIT_DESIGNATIONS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_ORGANIZATIONS_PICKER_REQ":
      return {
        ...state,
        fetchingOrganizationsPick: true,
        fetchedOrganizationsPick: false,
        organizationsPick: [],
        errorOrganizationsPick: null,
      };
    case "WORKFORCE_ORGANIZATIONS_PICKER_RESP":
      return {
        ...state,
        fetchingOrganizationsPick: false,
        fetchedOrganizationsPick: true,
        organizationsPick: parseData(action.payload.data.workforceOrganizations),
        errorOrganizationsPick: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATIONS_PICKER_ERR":
      return {
        ...state,
        fetching: false,
        errorOrganizationsPick: formatServerError(action.payload),
      };

    case "WORKFORCE_DOCUMENT_TYPE_REQ":
      return {
        ...state,
        fetchingDocumentType: true,
        fetchedDocumentType: false,
        documentType: [],
        errorDocumentType: null,
      };
    case "WORKFORCE_DOCUMENT_TYPE_RESP":
      return {
        ...state,
        fetchingDocumentType: false,
        fetchedDocumentType: true,
        documentType: parseData(action.payload.data.workforceDocumentTypes),
        errorDocumentType: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_DOCUMENT_TYPE_ERR":
      return {
        ...state,
        fetching: false,
        errorDocumentType: formatServerError(action.payload),
      };

    case "WORKFORCE_BANKS_PICKER_REQ":
      return {
        ...state,
        fetchingWorkforceDocumentsPick: true,
        fetchedBanksPick: false,
        banksPick: [],
        errorBanksPick: null,
      };
    case "WORKFORCE_BANKS_PICKER_RESP":
      return {
        ...state,
        fetchingWorkforceDocumentsPick: false,
        fetchedBanksPick: true,
        banksPick: parseData(action.payload.data.workforceBanks),
        errorBanksPick: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_BANKS_PICKER_ERR":
      return {
        ...state,
        fetching: false,
        errorBanksPick: formatServerError(action.payload),
      };

    case "WORKFORCE_POST_OFFICE_PICKER_REQ":
      return {
        ...state,
        fetchingPostOfficesPick: true,
        fetchedPostOfficesPick: false,
        postOfficesPick: [],
        errorPostOfficesPick: null,
      };
    case "WORKFORCE_POST_OFFICE_PICKER_RESP":
      return {
        ...state,
        fetchingPostOfficesPick: false,
        fetchedPostOfficesPick: true,
        postOfficesPick: action.payload.data.workforcePostoffice,
        errorPostOfficesPick: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_POST_OFFICE_PICKER_ERR":
      return {
        ...state,
        fetching: false,
        errorPostOfficesPick: formatServerError(action.payload),
      };

    case "WORKFORCE_OTP_REQ":
      return {
        ...state,
        fetchingWorkforceOtp: true,
        fetchedWorkforceOtp: false,
        workforceOtp: null,
        errorWorkforceOtp: null,
      };
    case "WORKFORCE_OTP_RESP":
      return {
        ...state,
        fetchingWorkforceOtp: false,
        fetchedWorkforceOtp: true,
        workforceOtp: action.payload.data.workforceOtp,
        errorWorkforceOtp: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_OTP_ERR":
      return {
        ...state,
        fetching: false,
        errorWorkforceOtp: formatServerError(action.payload),
      };

    case "WORKFORCE_BRANCH_PICKER_REQ":
      return {
        ...state,
        fetchingBranchPick: true,
        fetchedBranchPick: false,
        branchPick: [],
        errorBranchPick: null,
      };
    case "WORKFORCE_BRANCH_PICKER_RESP":
      return {
        ...state,
        fetchinBranchPick: false,
        fetcheBranchPick: true,
        branchPick: parseData(action.payload.data.workforceBanks),
        erroBranchPick: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_BRANCH_PICKER_ERR":
      return {
        ...state,
        fetching: false,
        errorBranchPick: formatServerError(action.payload),
      };

    case "WORKFORCE_DISTRICT_BANKS_PICKER_RESP":
      return {
        ...state,
        fetchinDistrictBanksPick: false,
        fetcheDistrictBanksPick: true,
        districtBanksPick: parseData(action.payload.data.workforceBanks),
        errorDistrictBanksPick: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_DISTRICT_BANKS_PICKER_ERR":
      return {
        ...state,
        fetching: false,
        errorDistrictBanksPick: formatServerError(action.payload),
      };
    case "WORKFORCE_DISTRICT_BANKS_PICKER_REQ":
      return {
        ...state,
        fetchingDistrictBanksPick: true,
        fetchedDistrictBanksPick: false,
        districtBanksPick: [],
        errorDistrictBanksPick: null,
      };

    case "WORKFORCE_ORGANIZATION_UNITS_PICKER_REQ":
      return {
        ...state,
        fetchingOrganizationUnitsPick: true,
        fetchedOrganizationUnitsPick: false,
        organizationUnitsPick: [],
        errorOrganizationUnitsPick: null,
      };
    case "WORKFORCE_ORGANIZATION_UNITS_PICKER_RESP":
      return {
        ...state,
        fetchingOrganizationUnitsPick: false,
        fetchedOrganizationUnitsPick: true,
        organizationUnitsPick: parseData(action.payload.data.workforceOrganizationUnits),
        errorOrganizationUnitsPick: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_ORGANIZATION_UNIT_DESIGNATION_REQ":
      return {
        ...state,
        fetchingUnitDesignation: true,
        fetchedUnitDesignation: false,
        unitDesignation: null,
        errorUnitDesignation: null,
      };
    case "WORKFORCE_ORGANIZATION_UNIT_DESIGNATION_RESP":
      console.log(action.payload.data.workforceOrganizationUnitDesignations);
      return {
        ...state,
        fetchingUnitDesignation: false,
        fetchedUnitDesignation: true,
        unitDesignation: parseData(action.payload.data.workforceOrganizationUnitDesignations).map((unitDesignation) => ({
          ...unitDesignation,
          id: decodeId(unitDesignation.id),
        }))?.[0],
        errorUnitDesignation: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_ORGANIZATION_UNIT_REQ":
      return {
        ...state,
        fetchingOrganizationUnit: true,
        fetchedOrganizationUnit: false,
        organizationUnit: null,
        errorOrganizationUnit: null,
      };
    case "WORKFORCE_ORGANIZATION_UNIT_RESP":
      return {
        ...state,
        fetchingOrganizationUnit: false,
        fetchedOrganizationUnit: true,
        organizationUnit: parseData(action.payload.data.workforceOrganizationUnits).map((OrganizationUnit) => ({
          ...OrganizationUnit,
          id: decodeId(OrganizationUnit.id),
        }))?.[0],
        errorOrganizationUnit: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_REPRESENTATIVES_REQ":
      return {
        ...state,
        fetchingRepresentatives: true,
        fetchedRepresentatives: false,
        representatives: [],
        representativesPageInfo: { totalCount: 0 },
        errorRepresentatives: null,
      };
    case "WORKFORCE_REPRESENTATIVES_RESP":
      return {
        ...state,
        fetchingRepresentatives: false,
        fetchedRepresentatives: true,
        representatives: parseData(action.payload.data.workforceRepresentatives),
        representativesPageInfo: pageInfo(action.payload.data.workforceRepresentatives),
        errorRepresentatives: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_REPRESENTATIVES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case "WORKFORCE_ORGANIZATION_UNITS_REQ":
      return {
        ...state,
        fetchingOrganizationUnits: true,
        fetchedOrganizationUnits: false,
        organizationUnits: [],
        organizationUnitsPageInfo: { totalCount: 0 },
        errorOrganizationUnits: null,
      };
    case "WORKFORCE_ORGANIZATION_UNITS_RESP":
      return {
        ...state,
        fetchingOrganizationUnits: false,
        fetchedOrganizationUnits: true,
        organizationUnits: parseData(action.payload.data.workforceOrganizationUnits),
        organizationUnitsPageInfo: pageInfo(action.payload.data.workforceOrganizationUnits),
        errorOrganizationUnits: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATION_UNITS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_ORGANIZATION_EMPLOYEES_REQ":
      return {
        ...state,
        fetchingOrganizationEmployees: true,
        fetchedOrganizationEmployees: false,
        organizationEmployees: [],
        organizationEmployeesPageInfo: { totalCount: 0 },
        errorOrganizationEmployees: null,
      };
    case "WORKFORCE_ORGANIZATION_EMPLOYEES_RESP":
      return {
        ...state,
        fetchingOrganizationEmployees: false,
        fetchedOrganizationEmployeess: true,
        organizationEmployees: parseData(action.payload.data.workforceOrganizationEmployees),
        organizationEmployeesPageInfo: pageInfo(action.payload.data.workforceOrganizationEmployees),
        errorOrganizationEmployees: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATION_EMPLOYEES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_ORGANIZATION_EMPLOYEE_REQ":
      return {
        ...state,
        fetchingOrganizationEmployee: true,
        fetchedOrganizationEmployee: false,
        organizationEmployee: null,
        errorOrganizationEmployee: null,
      };
    case "WORKFORCE_ORGANIZATION_EMPLOYEE_RESP":
      return {
        ...state,
        fetchingOrganizationEmployee: false,
        fetchedOrganizationEmployee: true,
        organizationEmployee: parseData(action.payload.data.workforceOrganizationEmployees).map((organizationEmployee) => ({
          ...organizationEmployee,
          id: decodeId(organizationEmployee.id),
        }))?.[0],
        errorOrganizationEmployee: formatGraphQLError(action.payload),
      };

    ///employee dependent ///
    case "WORKFORCE_EMPLOYEE_DEPENDENT_REQ":
      return {
        ...state,
        fetchingEmployeeDependent: true,
        fetchedEmployeeDependent: false,
        employeeDependent: null,
        errorEmployeeDependent: null,
      };
    case "WORKFORCE_EMPLOYEE_DEPENDENT_RESP":
      return {
        ...state,
        fetchingEmployeeDependent: false,
        fetchedEmployeeDependent: true,
        employeeDependent: parseData(action.payload.data.workforceEmployeeDependent).map((organizationEmployee) => ({
          ...organizationEmployee,
          id: decodeId(organizationEmployee.id),
        }))?.[0],
        errorEmployeeDependent: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_EMPLOYEES_DEPENDENTS_REQ":
      return {
        ...state,
        fetchingEmployeeDependents: true,
        fetchedEmployeeDependents: false,
        employeeDependents: [],
        employeeDependentsPageInfo: { totalCount: 0 },
        errorEmployeeDependents: null,
      };
    case "WORKFORCE_EMPLOYEES_DEPENDENTS_RESP":
      return {
        ...state,
        fetchingEmployeeDependents: false,
        fetchedEmployeeDependents: true,
        employeeDependents: parseData(action.payload.data.workforceEmployeeDependent),
        employeeDependentsPageInfo: pageInfo(action.payload.data.workforceEmployeeDependent),
        errorEmployeeDependents: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_EMPLOYEES_DEPENDENTS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    ///employee services
    case "WORKFORCE_EMPLOYEE_SERVICE_REQ":
      return {
        ...state,
        fetchingEmployeeService: true,
        fetchedEmployeeService: false,
        employeeService: null,
        errorEmployeeService: null,
      };
    case "WORKFORCE_EMPLOYEE_SERVICE_RESP":
      return {
        ...state,
        fetchingEmployeeService: false,
        fetchedEmployeeService: true,
        employeeService: parseData(action.payload.data.workforceEmployeeDesignation).map((employeeService) => ({
          ...employeeService,
          id: decodeId(employeeService.id),
        }))?.[0],
        errorEmployeeService: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_EMPLOYEES_SERVICES_REQ":
      return {
        ...state,
        fetchingEmployeeServices: true,
        fetchedEmployeeServices: false,
        employeeServices: [],
        employeeServicesPageInfo: { totalCount: 0 },
        errorEmployeeServices: null,
      };
    case "WORKFORCE_EMPLOYEES_SERVICES_RESP":
      return {
        ...state,
        fetchingEmployeeServices: false,
        fetchedEmployeeServices: true,
        employeeServices: parseData(action.payload.data.workforceEmployeeDesignation),
        employeeServicesPageInfo: pageInfo(action.payload.data.workforceEmployeeDesignation),
        errorEmployeeServices: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_EMPLOYEES_SERVICES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    //employee accident //
    case "WORKFORCE_EMPLOYEE_ACCIDENT_REQ":
      return {
        ...state,
        fetchingEmployeeAccident: true,
        fetchedEmployeeAccident: false,
        employeeAccident: null,
        errorEmployeeAccident: null,
      };
    case "WORKFORCE_EMPLOYEE_ACCIDENT_RESP":
      return {
        ...state,
        fetchingEmployeeAccident: false,
        fetchedEmployeeAccident: true,
        employeeAccident: parseData(action.payload.data.workforceEmployeeAccident).map((organizationEmployee) => ({
          ...organizationEmployee,
          id: decodeId(organizationEmployee.id),
        }))?.[0],
        errorEmployeeAccident: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_EMPLOYEES_ACCIDENTS_REQ":
      return {
        ...state,
        fetchingEmployeeAccidents: true,
        fetchedEmployeeAccidents: false,
        employeeAccidents: [],
        employeeAccidentsPageInfo: { totalCount: 0 },
        errorEmployeeAccidents: null,
      };
    case "WORKFORCE_EMPLOYEES_ACCIDENTS_RESP":
      return {
        ...state,
        fetchingEmployeeAccidents: false,
        fetchedEmployeeAccidents: true,
        employeeAccidents: parseData(action.payload.data.workforceEmployeeAccident),
        employeeAccidentsPageInfo: pageInfo(action.payload.data.workforceEmployeeAccident),
        errorEmployeeAccidents: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_EMPLOYEES_ACCIDENTS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    //employee account //
    case "WORKFORCE_EMPLOYEE_ACCOUNT_REQ":
      return {
        ...state,
        fetchingEmployeeAccount: true,
        fetchedEmployeeAccount: false,
        employeeAccount: null,
        errorEmployeeAccount: null,
      };
    case "WORKFORCE_EMPLOYEE_ACCOUNT_RESP":
      return {
        ...state,
        fetchingEmployeeAccount: false,
        fetchedEmployeeAccount: true,
        employeeAccount: parseData(action.payload.data.workforceEmployeeAccount).map((organizationEmployee) => ({
          ...organizationEmployee,
          id: decodeId(organizationEmployee.id),
        }))?.[0],
        errorEmployeeAccount: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_EMPLOYEES_ACCOUNTS_REQ":
      return {
        ...state,
        fetchingEmployeeAccounts: true,
        fetchedEmployeeAccounts: false,
        employeeAccounts: [],
        employeeAccountsPageInfo: { totalCount: 0 },
        errorEmployeeAccounts: null,
      };
    case "WORKFORCE_EMPLOYEES_ACCOUNTS_RESP":
      return {
        ...state,
        fetchingEmployeeAccounts: false,
        fetchedEmployeeAccounts: true,
        employeeAccounts: parseData(action.payload.data.workforceEmployeeAccount),
        employeeAccountsPageInfo: pageInfo(action.payload.data.workforceEmployeeAccount),
        errorEmployeeAccounts: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_EMPLOYEES_ACCOUNTS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    ////workforce organization employee designation////
    case "WORKFORCE_ORGANIZATIONS_EMPLOYEE_DESIGNATIONS_REQ":
      return {
        ...state,
        fetchingEmployeeDesignationData: true,
        fetchedEmployeeDesignationData: false,
        errorEmployeeDesignationData: null,
        employeeDesignationData: null,
      };
    case "WORKFORCE_ORGANIZATIONS_EMPLOYEE_DESIGNATIONS_RESP":
      return {
        ...state,
        fetchingEmployeeDesignationData: false,
        fetchedEmployeeDesignationData: true,
        employeeDesignationData: parseData(action.payload.data.workforceOrganizationEmployees).map((employeeDesignation) => ({
          ...employeeDesignation,
          id: decodeId(employeeDesignation.id),
        }))?.[0],
        errorEmployeeDesignationData: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATIONS_EMPLOYEE_DESIGNATIONS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_ORGANIZATIONS_UNITWISE_DESIGNATIONS_REQ":
      return {
        ...state,
        fetchingUnitWiseDesignationData: true,
        fetchedUnitWiseDesignationData: false,
        errorUnitWiseDesignationData: null,
        unitWiseDesignationData: null,
      };
    case "WORKFORCE_ORGANIZATIONS_UNITWISE_DESIGNATIONS_RESP":
      return {
        ...state,
        fetchingUnitWiseDesignationData: false,
        fetchedUnitWiseDesignationData: true,
        unitWiseDesignationData: parseData(action.payload.data.workforceOrganizationUnits),
        // errorUnitWiseDesignationData: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATIONS_UNITWISE_DESIGNATIONS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_EMPLOYEE_DESIGNATIONS_REQ":
      return {
        ...state,
        fetchingWorkforceEmployeeDesignation: true,
        fetchedWorkforceEmployeeDesignation: false,
        errorWorkforceEmployeeDesignation: null,
        workforceEmployeeDesignation: null,
      };
    case "WORKFORCE_EMPLOYEE_DESIGNATIONS_RESP":
      return {
        ...state,
        fetchingWorkforceEmployeeDesignation: false,
        fetchedWorkforceEmployeeDesignation: true,
        workforceEmployeeDesignation: parseData(action.payload.data.workforceEmployeeDesignation),
        // errorUnitWiseDesignationData: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_EMPLOYEE_DESIGNATIONS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    // start workforce office
    case "WORKFORCE_OFFICES_REQ":
      return {
        ...state,
        fetchingWorkforceOffices: true,
        fetchedWorkforceOffices: false,
        workforceOffices: [],
        workforceOfficesPageInfo: { totalCount: 0 },
        errorWorkforceOffices: null,
      };
    case "WORKFORCE_OFFICES_RESP":
      return {
        ...state,
        fetchingWorkforceOffices: false,
        fetchedWorkforceOffices: true,
        workforceOffices: parseData(action.payload.data.workforceEmployerOffices),
        workforceOfficesPageInfo: pageInfo(action.payload.data.workforceEmployerOffices),
        errorWorkforceOffices: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_OFFICES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_OFFICE_REQ":
      return {
        ...state,
        fetchingWorkforceOffice: true,
        fetchedWorkforceOffice: false,
        workforceOffice: null,
        errorWorkforceOffice: null,
      };
    case "WORKFORCE_OFFICE_RESP":
      return {
        ...state,
        fetchingWorkforceOffice: false,
        fetchedWorkforceOffice: true,
        workforceOffice: parseData(action.payload.data.workforceEmployerOffices).map((workforceOffice) => ({
          ...workforceOffice,
          id: decodeId(workforceOffice.id),
        }))?.[0],
        errorWorkforceOffice: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_OFFICES_PICKER_REQ":
      return {
        ...state,
        fetchingWorkforceOfficesPick: true,
        fetchedWorkforceOfficesPick: false,
        workforceOfficesPick: [],
        errorWorkforceOfficesPick: null,
      };
    case "WORKFORCE_OFFICES_PICKER_RESP":
      return {
        ...state,
        fetchingWorkforceOfficesPick: false,
        fetchedWorkforceOfficesPick: true,
        workforceOfficesPick: parseData(action.payload.data.workforceEmployerOffices),
        errorWorkforceOfficesPick: formatGraphQLError(action.payload),
      };

    // end workforce office

    // start workforce factory
    case "WORKFORCE_ORGANIZATION_FACTORIES_REQ":
      return {
        ...state,
        fetchingWorkforceFactories: true,
        fetchedWorkforceFactories: false,
        workforceFactories: [],
        workforceFactoriesPageInfo: { totalCount: 0 },
        errorWorkforceFactories: null,
      };
    case "WORKFORCE_ORGANIZATION_FACTORIES_RESP":
      return {
        ...state,
        fetchingWorkforceFactories: false,
        fetchedWorkforceFactories: true,
        workforceFactories: parseData(action.payload.data.workforceEmployerFactories),
        workforceFactoriesPageInfo: pageInfo(action.payload.data.workforceEmployerFactories),
        errorWorkforceFactories: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATION_FACTORIES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_FACTORY_REQ":
      return {
        ...state,
        fetchingWorkforceFactory: true,
        fetchedWorkforceFactory: false,
        workforceFactory: null,
        errorWorkforceFactory: null,
      };
    case "WORKFORCE_FACTORY_RESP":
      return {
        ...state,
        fetchingWorkforceFactory: false,
        fetchedWorkforceFactory: true,
        workforceFactory: parseData(action.payload.data.workforceEmployerFactories).map((WorkforceFactory) => ({
          ...WorkforceFactory,
          id: decodeId(WorkforceFactory.id),
        }))?.[0],
        errorWorkforceFactory: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_FACTORIES_PICKER_REQ":
      return {
        ...state,
        fetchingWorkforceFactoriesPick: true,
        fetchedWorkforceFactoriesPick: false,
        workforceFactoriesPick: [],
        errorWorkforceFactoriesPick: null,
      };
    case "WORKFORCE_FACTORIES_PICKER_RESP":
      return {
        ...state,
        fetchingWorkforceFactoriesPick: false,
        fetchedWorkforceFactoriesPick: true,
        workforceFactoriesPick: parseData(action.payload.data.workforceEmployerFactories),
        errorWorkforceFactoriesPick: formatGraphQLError(action.payload),
      };

    // end workforce factory

    // start workforce company
    case "WORKFORCE_COMPANIES_REQ":
      return {
        ...state,
        fetchingWorkforceCompanies: true,
        fetchedWorkforceCompanies: false,
        workforceCompanies: [],
        workforceCompaniesPageInfo: { totalCount: 0 },
        errorWorkforceCompanies: null,
      };
    case "WORKFORCE_COMPANIES_RESP":
      return {
        ...state,
        fetchingWorkforceCompanies: false,
        fetchedWorkforceCompanies: true,
        workforceCompanies: parseData(action.payload.data.workforceEmployers),
        workforceCompaniesPageInfo: pageInfo(action.payload.data.workforceEmployers),
        errorWorkforceCompanies: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_COMPANIES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_COMPANY_REQ":
      return {
        ...state,
        fetchingWorkforceCompany: true,
        fetchedWorkforceCompany: false,
        workforceCompany: null,
        errorWorkforceCompany: null,
      };
    case "WORKFORCE_COMPANY_RESP":
      return {
        ...state,
        fetchingWorkforceCompany: false,
        fetchedWorkforceCompany: true,
        workforceCompany: parseData(action.payload.data.workforceEmployers).map((workforceCompany) => ({
          ...workforceCompany,
          id: decodeId(workforceCompany.id),
        }))?.[0],
        errorWorkforceCompany: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_COMPANIES_PICKER_REQ":
      return {
        ...state,
        fetchingWorkforceCompaniesPick: true,
        fetchedWorkforceCompaniesPick: false,
        workforceCompaniesPick: [],
        errorWorkforceCompaniesPick: null,
      };
    case "WORKFORCE_COMPANIES_PICKER_RESP":
      return {
        ...state,
        fetchingWorkforceCompaniesPick: false,
        fetchedWorkforceCompaniesPick: true,
        workforceCompaniesPick: parseData(action.payload.data.workforceEmployers).map((workforceCompany) => ({
          ...workforceCompany,
          id: decodeId(workforceCompany.id),
        })),
        errorWorkforceCompaniesPick: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_DISTRICT_OFFICE_PICKER_REQ":
      return {
        ...state,
        fetchingDistrictOfficePick: true,
        fetchedDistrictOfficePick: false,
        districtOfficePick: [],
        errorDistrictOfficePick: null,
      };
    case "WORKFORCE_DISTRICT_OFFICE_PICKER_RESP":
      return {
        ...state,
        fetchingDistrictOfficePick: false,
        fetchedDistrictOfficePick: true,
        districtOfficePick: parseData(action.payload.data.workforceEmployers).map((workforceCompany) => ({
          ...workforceCompany,
          id: decodeId(workforceCompany.id),
        })),
        errorDistrictOfficePick: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_EMPLOYEE_PICKER_REQ":
      return {
        ...state,
        fetchingEmployeePick: true,
        fetchedEmployeePick: false,
        employeePick: [],
        errorEmployeePick: null,
      };
    case "WORKFORCE_EMPLOYEE_PICKER_RESP":
      return {
        ...state,
        fetchingEmployeePick: false,
        fetchedEmployeePick: true,
        employeePick: parseData(action.payload.data.workforceOrganizationEmployees).map((workforceEmployee) => ({
          ...workforceEmployee,
          id: decodeId(workforceEmployee.id),
        })),
        errorEmployeePick: formatGraphQLError(action.payload),
      };

    // end workforce company

    //start workforce employee
    case "WORKFORCE_EMPLOYEES_REQ":
      return {
        ...state,
        fetchingWorkforceEmployees: true,
        fetchedWorkforceEmployees: false,
        workforceEmployees: [],
        workforceEmployeesPageInfo: { totalCount: 0 },
        errorWorkforceEmployees: null,
      };
    case "WORKFORCE_EMPLOYEES_RESP":
      return {
        ...state,
        fetchingWorkforceEmployees: false,
        fetchedWorkforceEmployeess: true,
        workforceEmployees: parseData(action.payload.data.workforceEmployerEmployees),
        workforceEmployeesPageInfo: pageInfo(action.payload.data.workforceEmployerEmployees),
        errorWorkforceEmployees: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_EMPLOYEES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case "WORKFORCE_EMPLOYEE_REQ":
      return {
        ...state,
        fetchingWorkforceEmployee: true,
        fetchedWorkforceEmployee: false,
        workforceEmployee: null,
        errorWorkforceEmployee: null,
      };
    case "WORKFORCE_EMPLOYEE_RESP":
      return {
        ...state,
        fetchingWorkforceEmployee: false,
        fetchedWorkforceEmployee: true,
        workforceEmployee: parseData(action.payload.data.workforceEmployerEmployees).map((workforceEmployee) => ({
          ...workforceEmployee,
          id: decodeId(workforceEmployee.id),
        }))?.[0],
        errorWorkforceEmployee: formatGraphQLError(action.payload),
      };

    //// Admin workforce role-wise users ////
    case "ADMIN_WORKFORCE_ROLE_WISE_USERS_REQ":
      return {
        ...state,
        fetchingRoleWiseUsers: true,
        fetchedRoleWiseUsers: false,
        roleWiseUsers: [],
        roleWiseUsersPageInfo: { totalCount: 0 },
        errorRoleWiseUsers: null,
      };

    case "ADMIN_WORKFORCE_ROLE_WISE_USERS_RESP":
      return {
        ...state,
        fetchingRoleWiseUsers: false,
        fetchedRoleWiseUsers: true,
        roleWiseUsers: action.payload.data.workforceUserRole,
        roleWiseUsersPageInfo: pageInfo(action.payload.data.workforceUserRole),
        errorRoleWiseUsers: formatGraphQLError(action.payload),
      };

    case "ADMIN_WORKFORCE_ROLE_WISE_USERS_ERR":
      return {
        ...state,
        fetchingRoleWiseUsers: false,
        fetchedRoleWiseUsers: false,
        roleWiseUsers: [],
        roleWiseUsersPageInfo: { totalCount: 0 },
        errorRoleWiseUsers: formatServerError(action.payload),
      };

    //// eis payment process ////
    case "EIS_PAYMENT_PROCESS_REQ":
      return {
        ...state,
        fetchingEisPayments: true,
        fetchedEisPayments: false,
        eisPayments: [],
        eisPaymentsPageInfo: { totalCount: 0 },
        errorEisPayments: null,
      };

    case "EIS_PAYMENT_PROCESS_RESP":
      return {
        ...state,
        fetchingEisPayments: false,
        fetchedEisPayments: true,
        eisPayments: action.payload.data.workforceEisPaymentProcess,
        eisPaymentsPageInfo: pageInfo(action.payload.data.workforceEisPaymentProcess),
        errorEisPayments: formatGraphQLError(action.payload),
      };

    case "EIS_PAYMENT_PROCESS_ERR":
      return {
        ...state,
        fetchingEisPayments: false,
        fetchedEisPayments: false,
        eisPayments: [],
        eisPaymentsPageInfo: { totalCount: 0 },
        errorEisPayments: formatServerError(action.payload),
      };

    //end workforce employee

    case "WORKFORCE_REPRESENTATIVE_BY_CLIENT_MUTATION_ID_RESP":
      return {
        ...state,
        fetchedRepresentativeByClientMutationId: parseData(action.payload.data.workforceRepresentatives),
      };
    case "WORKFORCE_APPLICATION_BY_CLIENT_MUTATION_ID_RESP":
      return {
        ...state,
        fetchedApplicationIdByClientMutationId: parseData(action.payload.data.workforceApplication),
      };

    case "WORKFORCE_APPLICATION_SUMMARY_BY_CLIENT_MUTATION_ID":
      return {
        ...state,
        fetchedApplicationSummaryIdByClientMutationId: parseData(action.payload.data.workforceApplicationSummary),
      };

    case "WORKFORCE_ORGANIZATION_BY_DESIGNATION_MUTATION_ID_RESP":
      return {
        ...state,
        fetchedWorkforceOrganizationByDesignationId: parseData(action.payload.data.workforceOrganizationEmployeeDesignations.designation.id),
      };

    case "WORKFORCE_FACTORY_BY_FACTORY_MUTATION_ID_RESP":
      return {
        ...state,
        fetchedWorkforceFactoryId: parseData(action.payload.data.workforceEmployerFactories),
      };
    case "WORKFORCE_INFO_ID_BY_CLIENT_MUTATION_ID_RESP":
      return {
        ...state,
      };
    case "WORKFORCE_VERIFY_NID_RESP":
      return {
        ...state,
        verifyNidDetails: action.payload.data.workforceNidVerification,
      };

    /// bank actions////
    case "WORKFORCE_BANKS_REQ":
      return {
        ...state,
        fetchingWorkforceDocuments: true,
        fetchedBanks: false,
        banks: [],
        banksPageInfo: { totalCount: 0 },
        errorBanks: null,
      };
    case "WORKFORCE_BANKS_RESP":
      return {
        ...state,
        fetchingWorkforceDocuments: false,
        fetchedBanks: true,
        banks: parseData(action.payload.data.banks),
        banksPageInfo: pageInfo(action.payload.data.banks),
        errorBanks: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_BANKS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_BANK_REQ":
      return {
        ...state,
        fetchingBank: true,
        fetchedBank: false,
        bank: null,
        errorBank: null,
      };
    case "WORKFORCE_BANK_RESP":
      return {
        ...state,
        fetchingBank: false,
        fetchedBank: true,
        bank: parseData(action.payload.data.banks).map((bank) => ({
          ...bank,
          id: decodeId(bank.id),
        }))?.[0],
        errorBank: formatGraphQLError(action.payload),
      };

    case "WORKFORCE_DEPENDENT_REQ":
      return {
        ...state,
        fetchingWorkforceDependent: true,
        fetchedWorkforceDependent: false,
        workforceDependent: [],
        errorWorkforceDependent: null,
      };
    case "WORKFORCE_DEPENDENT_RESP":
      return {
        ...state,
        fetchingWorkforceDependent: false,
        fetchedWorkforceDependent: true,
        workforceDependent: parseData(action.payload.data.workforceEmployeeDependent),
        errorWorkforceDependent: formatGraphQLError(action.payload),
      };

    /// Application actions////
    case "WORKFORCE_APPLICATIONS_REQ":
      return {
        ...state,
        fetchingApplications: true,
        fetchedApplications: false,
        applications: [],
        applicationsPageInfo: { totalCount: 0 },
        errorApplications: null,
      };
    case "WORKFORCE_APPLICATIONS_RESP":
      return {
        ...state,
        fetchingApplications: false,
        fetchedApplications: true,
        applications: parseData(action.payload.data.workforceApplication).map((application) => ({
          ...application,
          educations: parseData(application.educations),
        })),
        applicationsPageInfo: pageInfo(action.payload.data.workforceApplication),
        errorApplications: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_APPLICATIONS_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_DISEASES_REQ":
      return {
        ...state,
        fetchingDiseases: true,
        fetchedDiseases: false,
        diseases: [],
        diseasesPageInfo: { totalCount: 0 },
        errorDiseases: null,
      };
    case "WORKFORCE_DISEASES_RESP":
      return {
        ...state,
        fetchingDiseases: false,
        fetchedDiseases: true,
        diseases: parseData(action.payload.data.workforceDiseases),
        diseasesPageInfo: pageInfo(action.payload.data.workforceDiseases),
        errorDiseases: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_DISEASES_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_APPLICATIONS_SUMMARY_REQ":
      return {
        ...state,
        fetchingApplicationsSummary: true,
        fetchedApplicationsSummary: false,
        applicationsSummary: [],
        applicationsSummaryPageInfo: { totalCount: 0 },
        errorApplicationsSummary: null,
      };
    case "WORKFORCE_APPLICATIONS_SUMMARY_RESP":
      return {
        ...state,
        fetchingApplicationsSummary: false,
        fetchedApplicationsSummary: true,
        applicationsSummary: parseData(action.payload.data.workforceApplicationSummary),
        applicationsSummaryPageInfo: pageInfo(action.payload.data.workforceApplicationSummary),
        errorApplicationsSummary: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_APPLICATIONS_SUMMARY_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_APPLICATION_REQ":
      return {
        ...state,
        fetchingApplication: true,
        fetchedApplication: false,
        application: null,
        errorApplication: null,
      };
    case "WORKFORCE_APPLICATION_RESP":
      return {
        ...state,
        fetchingApplication: false,
        fetchedApplication: true,
        application: parseData(action.payload.data.workforceApplication).map((application) => ({
          ...application,
          id: decodeId(application.id),
          educations: parseData(application.educations),
          workforceEmployeeDependentApplication: parseData(application.workforceEmployeeDependentApplication),
        }))?.[0],
        errorApplication: formatGraphQLError(action.payload),
      };

    /// Application movement actions////
    case "WORKFORCE_APPLICATIONS_MOVEMENT_REQ":
      return {
        ...state,
        fetchingApplicationMovements: true,
        fetchedApplicationMovements: false,
        applicationMovements: [],
        applicationMovementsPageInfo: { totalCount: 0 },
        errorApplicationMovements: null,
      };
    case "WORKFORCE_APPLICATIONS_MOVEMENT_RESP":
      return {
        ...state,
        fetchingApplicationMovements: false,
        fetchedApplicationMovements: true,
        applicationMovements: parseData(action.payload.data.workforceApplicationMovement),
        applicationMovementsPageInfo: pageInfo(action.payload.data.workforceApplicationMovement),
        errorApplicationMovements: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_APPLICATIONS_MOVEMENT_ERR":
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };

    case "WORKFORCE_APPLICATION_MOVEMENT_REQ":
      return {
        ...state,
        fetchingApplicationMovement: true,
        fetchedApplicationMovement: false,
        applicationMovement: null,
        errorApplication: null,
      };
    case "WORKFORCE_APPLICATION_MOVEMENT_RESP":
      return {
        ...state,
        fetchingApplicationMovement: false,
        fetchedApplicationMovement: true,
        applicationMovement: parseData(action.payload.data.workforceApplicationMovement).map((application) => ({
          ...application,
          id: decodeId(application.id),
        }))?.[0],
        errorApplication: formatGraphQLError(action.payload),
      };

    /// Application summary actions////

    case "WORKFORCE_APPLICATION_SUMMARY_REQ":
      return {
        ...state,
        fetchingApplicationSummary: true,
        fetchedApplicationSummary: false,
        applicationSummary: null,
        applicationSummaryPageInfo: null,
      };
    case "WORKFORCE_APPLICATION_SUMMARY_RESP":
      return {
        ...state,
        fetchingApplicationSummary: false,
        fetchedApplicationSummary: true,
        applicationSummaryPageInfo: parseData(action.payload.data.workforceApplicationSummary).map((application) => ({
          ...application,
          id: decodeId(application.id),
        }))?.[0],
        errorApplicationSummary: formatGraphQLError(action.payload),
      };

    case "ORG_UNIT_CREATE_RESP":
      return dispatchMutationResp(state, action);
    case CLEAR(ACTION_TYPE.CLEAR_TICKET):
      return {
        ...state,
        fetchingOrganization: false,
        fetchedOrganization: false,
        Organization: null,
        errorOrganization: null,
      };
    case REQUEST(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: true,
        fetchedGrievanceConfig: false,
        errorGrievanceConfig: null,
        grievanceConfig: null,
      };
    case SUCCESS(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: false,
        fetchedGrievanceConfig: true,
        errorGrievanceConfig: null,
        grievanceConfig: action.payload.data.grievanceConfig,
      };
    case ERROR(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: false,
        fetchedGrievanceConfig: false,
        errorGrievanceConfig: formatGraphQLError(action.payload),
        grievanceConfig: null,
      };
    case "WORKFORCE_APPLICATION_STATUS_COUNT_RESP":
      return {
        ...state,
        workforceApplicationStatusCount: action.payload.data,
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.RESOLVE_BY_COMMENT):
      return dispatchMutationResp(state, "resolveGrievanceByComment", action);
    case SUCCESS(ACTION_TYPE.REOPEN_TICKET):
      return dispatchMutationResp(state, "reopenTicket", action);
    case "ORG_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "ORG_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "ORG_CREATE_ORG_RESP":
      return dispatchMutationResp(state, "createOrganization", action);
    case "ORG_UPDATE_ORG_RESP":
      return dispatchMutationResp(state, "updateOrganization", action);

    case "OTP_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "OTP_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "OTP_CREATE_OTP_RESP":
      return dispatchMutationResp(state, "createWorkforceOtp", action);
    case "OTP_UPDATE_OTP_RESP":
      return dispatchMutationResp(state, "updateOtp", action);

    case "USER_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "USER_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "USER_CREATE_USER_RESP":
      return dispatchMutationResp(state, "createWorkforceUser", action);
    case "USER_UPDATE_USER_RESP":
      return dispatchMutationResp(state, "updateUser", action);

    case "DOCUMENT_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "DOCUMENT_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "DOCUMENT_CREATE_DOCUMENT_RESP":
      return dispatchMutationResp(state, "createWorkforceDocument", action);
    case "DOCUMENT_UPDATE_DOCUMENT_RESP":
      return dispatchMutationResp(state, "updateWorkforceDocument", action);

    case "COMPANY_STATUS_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "COMPANY_STATUS_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "COMPANY_STATUS_CREATE_RESP":
      return dispatchMutationResp(state, "createOrganization", action);
    case "COMPANY_STATUS_UPDATE_RESP":
      return dispatchMutationResp(state, "updateOrganization", action);

    case "REP_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "REP_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "REP_CREATE_REP_RESP":
      return dispatchMutationResp(state, "createRepresentative", action);
    case "REP_UPDATE_REP_RESP":
      return dispatchMutationResp(state, "updateRepresentative", action);

    case "UNIT_DESIGNATION_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "UNIT_DESIGNATION_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "UNIT_DESIGNATION_CREATE_UNIT_DESIGNATION_RESP":
      return dispatchMutationResp(state, "createOrganization", action);
    case "UNIT_DESIGNATION_UPDATE_UNIT_DESIGNATION_RESP":
      return dispatchMutationResp(state, "createOrganization", action);

    case "EMPLOYEE_DESIGNATION_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "EMPLOYEE_DESIGNATION_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "EMPLOYEE_DESIGNATION_UPDATE_RELEASE_RESP":
      return dispatchMutationResp(state, "updateOrganization", action);

    case "EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "EMPLOYEE_DESIGNATION_UPDATE_ASSIGN_RESP":
      return dispatchMutationResp(state, "createWorkforceOrganizationEmployeeDesignation", action);

    case "WORKFORCE_EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "WORKFORCE_EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "WORKFORCE_EMPLOYEE_DESIGNATION_UPDATE_ASSIGN_RESP":
      return dispatchMutationResp(state, "createWorkforceEmployeeDesignation", action);

    case "BANK_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "BANK_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "BANK_CREATE_BANK_RESP":
      return dispatchMutationResp(state, "createBank", action);
    case "BANK_UPDATE_BANK_RESP":
      return dispatchMutationResp(state, "updateBank", action);

    case "EDUCATION_INFO_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "EDUCATION_INFO_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "EDUCATION_INFO_CREATE_EDUCATION_RESP":
      return dispatchMutationResp(state, "createWorkforceEducation", action);
    case "EDUCATION_INFO_UPDATE_EDUCATION_RESP":
      return dispatchMutationResp(state, "updateWorkforceEducation", action);

    case "DEPENDENT_INFO_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "DEPENDENT_INFO_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "DEPENDENT_INFO_CREATE_DEPENDENT_RESP":
      return dispatchMutationResp(state, "createWorkforceDependentInfo", action);
    case "DEPENDENT_INFO_UPDATE_DEPENDENT_RESP":
      return dispatchMutationResp(state, "updateWorkforceDependentInfo", action);

    case "APPLICATION_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "APPLICATION_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "APPLICATION_CREATE_APPLICATION_RESP":
      return dispatchMutationResp(state, "createWorkforceApplication", action);
    case "APPLICATION_UPDATE_APPLICATION_RESP":
      return dispatchMutationResp(state, "updateWorkforceApplication", action);

    case "APPLICATION_MOVEMENT_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "APPLICATION_MOVEMENT_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "APPLICATION_MOVEMENT_CREATE_APPLICATION_RESP":
      return dispatchMutationResp(state, "createWorkforceApplicationMovement", action);
    case "APPLICATION_MOVEMENT_UPDATE_APPLICATION_RESP":
      return dispatchMutationResp(state, "updateWorkforceApplicationMovement", action);

    case "APPLICATION_SUMMARY_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "APPLICATION_SUMMARY_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "APPLICATION_SUMMARY_CREATE_APPLICATION_RESP":
      return dispatchMutationResp(state, "createWorkforceApplicationSummary", action);

    case "EMPLOYEE_DEPENDENT_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "EMPLOYEE_DEPENDENT_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "EMPLOYEE_DEPENDENT_CREATE_EMPLOYEE_DEPENDENT_RESP":
      return dispatchMutationResp(state, "createBank", action);
    case "EMPLOYEE_DEPENDENT_UPDATE_EMPLOYEE_DEPENDENT_RESP":
      return dispatchMutationResp(state, "updateBank", action);

    case "EMPLOYEE_SERVICE_MUTATION_REQ":
      return dispatchMutationReq(state, action);
    case "EMPLOYEE_SERVICE_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "EMPLOYEE_SERVICE_CREATE_EMPLOYEE_SERVICE_RESP":
      return dispatchMutationResp(state, "createBank", action);
    case "EMPLOYEE_SERVICE_UPDATE_EMPLOYEE_SERVICE_RESP":
      return dispatchMutationResp(state, "updateBank", action);
    default:
      return state;
  }
}

export default reducer;
