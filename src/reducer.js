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

    fetchingBanksPick: false,
    errorBanksPick: null,
    fetchedBanksPick: false,
    banksPick: [],

    ///representative states
    fetchingRepresentatives: false,
    errorRepresentatives: null,
    fetchedRepresentatives: false,
    representatives: [],
    representativesPageInfo: { totalCount: 0 },

    fetchedRepresentativeByClientMutationId: null,

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

    submittingMutation: false,
    mutation: {},
  },
  action
) {
  switch (action.type) {
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
        organizationsPageInfo: pageInfo(
          action.payload.data.workforceOrganizations
        ),
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
          organization: parseData(action.payload.data.workforceOrganizations).map(
            (Organization) => ({
              ...Organization,
              id: decodeId(Organization.id),
            })
          )?.[0],
          errorOrganization: formatGraphQLError(action.payload),
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
        unitDesignations: parseData(
          action.payload.data.workforceOrganizationUnitDesignations
        ),
        unitDesignationsPageInfo: pageInfo(
          action.payload.data.workforceOrganizationUnitDesignations
        ),
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
        organizationsPick: parseData(
          action.payload.data.workforceOrganizations
        ),
        errorOrganizationsPick: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATIONS_PICKER_ERR":
        return {
          ...state,
          fetching: false,
          errorOrganizationsPick: formatServerError(action.payload),
        };
  
    case "WORKFORCE_BANKS_PICKER_REQ":
      return {
        ...state,
        fetchingBanksPick: true,
        fetchedBanksPick: false,
        banksPick: [],
        errorBanksPick: null,
      };
    case "WORKFORCE_BANKS_PICKER_RESP":
      return {
        ...state,
        fetchingBanksPick: false,
        fetchedBanksPick: true,
        banksPick: parseData(
          action.payload.data.banks
        ),
        errorBanksPick: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_BANKS_PICKER_ERR":
        return {
          ...state,
          fetching: false,
          errorBanksPick: formatServerError(action.payload),
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
        organizationUnitsPick: parseData(
          action.payload.data.workforceOrganizationUnits
        ),
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
        unitDesignation: parseData(
          action.payload.data.workforceOrganizationUnitDesignations
        ).map((unitDesignation) => ({
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
        organizationUnit: parseData(
          action.payload.data.workforceOrganizationUnits
        ).map((OrganizationUnit) => ({
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
        representatives: parseData(
          action.payload.data.workforceRepresentatives
        ),
        representativesPageInfo: pageInfo(
          action.payload.data.workforceRepresentatives
        ),
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
        organizationUnits: parseData(
          action.payload.data.workforceOrganizationUnits
        ),
        organizationUnitsPageInfo: pageInfo(
          action.payload.data.workforceOrganizationUnits
        ),
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
        organizationEmployees: parseData(
          action.payload.data.workforceOrganizationEmployees
        ),
        organizationEmployeesPageInfo: pageInfo(
          action.payload.data.workforceOrganizationEmployees
        ),
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
        organizationEmployee: parseData(
          action.payload.data.workforceOrganizationEmployees
        ).map((organizationEmployee) => ({
          ...organizationEmployee,
          id: decodeId(organizationEmployee.id),
        }))?.[0],
        errorOrganizationEmployee: formatGraphQLError(action.payload),
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
        employeeDesignationData: parseData(
          action.payload.data.workforceOrganizationEmployees
        ).map((employeeDesignation) => ({
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
        unitWiseDesignationData: parseData(
          action.payload.data.workforceOrganizationUnits
        ),
        // errorUnitWiseDesignationData: formatGraphQLError(action.payload),
      };
    case "WORKFORCE_ORGANIZATIONS_UNITWISE_DESIGNATIONS_ERR":
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
        workforceOffices: parseData(
          action.payload.data.workforceEmployerOffices
        ),
        workforceOfficesPageInfo: pageInfo(
          action.payload.data.workforceEmployerOffices
        ),
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
        workforceOffice: parseData(
          action.payload.data.workforceEmployerOffices
        ).map((workforceOffice) => ({
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
        workforceOfficesPick: parseData(
          action.payload.data.workforceEmployerOffices
        ),
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
        workforceFactories: parseData(
          action.payload.data.workforceEmployerFactories
        ),
        workforceFactoriesPageInfo: pageInfo(
          action.payload.data.workforceEmployerFactories
        ),
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
        workforceFactory: parseData(
          action.payload.data.workforceEmployerFactories
        ).map((WorkforceFactory) => ({
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
        workforceFactoriesPick: parseData(
          action.payload.data.workforceEmployerFactories
        ),
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
        workforceCompaniesPageInfo: pageInfo(
          action.payload.data.workforceEmployers
        ),
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
        workforceCompany: parseData(action.payload.data.workforceEmployers).map(
          (workforceCompany) => ({
            ...workforceCompany,
            id: decodeId(workforceCompany.id),
          })
        )?.[0],
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
        workforceCompaniesPick: parseData(
          action.payload.data.workforceEmployers
        ).map((workforceCompany) => ({
          ...workforceCompany,
          id: decodeId(workforceCompany.id),
        })),
        errorWorkforceCompaniesPick: formatGraphQLError(action.payload),
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
        workforceEmployees: parseData(
          action.payload.data.workforceEmployerEmployees
        ),
        workforceEmployeesPageInfo: pageInfo(
          action.payload.data.workforceEmployerEmployees
        ),
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
        workforceEmployee: parseData(
          action.payload.data.workforceEmployerEmployees
        ).map((workforceEmployee) => ({
          ...workforceEmployee,
          id: decodeId(workforceEmployee.id),
        }))?.[0],
        errorWorkforceEmployee: formatGraphQLError(action.payload),
      };

    //end workforce employee

    case "WORKFORCE_REPRESENTATIVE_BY_CLIENT_MUTATION_ID_RESP":
      return {
        ...state,
        fetchedRepresentativeByClientMutationId: parseData(
          action.payload.data.workforceRepresentatives
        ),
      };

    /// bank actions////
    case "WORKFORCE_BANKS_REQ":
      return {
        ...state,
        fetchingBanks: true,
        fetchedBanks: false,
        banks: [],
        banksPageInfo: { totalCount: 0 },
        errorBanks: null,
      };
    case "WORKFORCE_BANKS_RESP":
      return {
        ...state,
        fetchingBanks: false,
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
            bank: parseData(action.payload.data.banks).map(
              (bank) => ({
                ...bank,
                id: decodeId(bank.id),
              })
            )?.[0],
            errorBank: formatGraphQLError(action.payload),
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
    
    case "BANK_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "BANK_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "BANK_CREATE_BANK_RESP":
      return dispatchMutationResp(state, "createOrganization", action);
    case "BANK_UPDATE_BANK_RESP":
      return dispatchMutationResp(state, "updateOrganization", action);

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
      return dispatchMutationResp(
        state,
        "createWorkforceOrganizationEmployeeDesignation",
        action
      );

    case "BANK_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "BANK_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "BANK_CREATE_BANK_RESP":
      return dispatchMutationResp(state, "createBank", action);
    case "BANK_UPDATE_BANK_RESP":
      return dispatchMutationResp(state, "updateBank", action);
    default:
      return state;
  }
}

export default reducer;
