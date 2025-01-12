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

    fetchingOrganizationsPick: false,
    errorOrganizationsPick: null,
    fetchedOrganizationsPick: false,
    organizationsPick: [],

    fetchingOrganization: false,
    errorOrganization: null,
    fetchedOrganization: false,
    organization: null,
    organizationPageInfo: { totalCount: 0 },

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
    case "WORKFORCE_ORGANIZATIONS_ERR":
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
    case "WORKFORCE_ORGANIZATIONS_PICKER_ERR":
      return {
        ...state,
        fetching: false,
        errorOrganizationsPick: formatServerError(action.payload),
      };
    case "WORKFORCE_ORGANIZATION_REQ":
      return {
        ...state,
        fetchingOrganization: true,
        fetchedOrganization: false,
        organization: null,
        errorOrganization: null,
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
          organizationEmployee: parseData(action.payload.data.workforceOrganizationEmployees).map((organizationEmployee) => ({
            ...organizationEmployee,
            id: decodeId(organizationEmployee.id),
          }))?.[0],
          errorOrganizationEmployee: formatGraphQLError(action.payload),
        };

    case "WORKFORCE_REPRESENTATIVE_BY_CLIENT_MUTATION_ID_RESP":
      return {
        ...state,
        fetchedRepresentativeByClientMutationId: parseData(
          action.payload.data.workforceRepresentatives
        ),
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
    case "UNIT_DESIGNATION_MUTATION_REQ": {
      return dispatchMutationReq(state, action);
    }
    case "UNIT_DESIGNATION_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "UNIT_DESIGNATION_CREATE_UNIT_DESIGNATION_RESP":
      return dispatchMutationResp(state, "createOrganization", action);
    case "UNIT_DESIGNATION_UPDATE_UNIT_DESIGNATION_RESP":
      return dispatchMutationResp(state, "createOrganization", action);
    default:
      return state;
  }
}

export default reducer;
