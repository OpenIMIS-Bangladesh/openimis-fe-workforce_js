import {
  parseData, pageInfo, formatServerError, formatGraphQLError,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
  decodeId,
} from "@openimis/fe-core";
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from "./utils/action-type";

export const ACTION_TYPE = {};

function reducer(
  state = {
    fetchingOrganizations: false,
    errorOrganizations: null,
    fetchedOrganizations: false,
    organizations: [],
    organizationsPageInfo: { totalCount: 0 },

    fetchingOrganizationsPick: false,
    errorOrganizationsPick: null,
    fetchedOrganizationsPick: false,
    organizationsPick: [],
    organizationsPageInfoPick: { totalCount: 0 },

    fetchingOrganization: false,
    errorOrganization: null,
    fetchedOrganization: false,
    organization: null,
    organizationPageInfo: { totalCount: 0 },

    fetchingRepresentatives: false,
    errorRepresentatives: null,
    fetchedRepresentatives: false,
    representatives: [],
    representativesPageInfo: { totalCount: 0 },

    fetchedRepresentativeByClientMutationId: null,

    fetchingOrganizationUnits: false,
    errorOrganizationUnits: null,
    fetcheOrganizationUnits: false,
    organizationUnits: [],
    organizationUnitsPageInfo: { totalCount: 0 },

    fetchingCategory: false,
    fetchedCategory: false,
    errorCategory: null,
    category: [],
    categoryPageInfo: { totalCount: 0 },

    fetchingOrganizationAttachments: false,
    fetchedOrganizationAttachments: false,
    errorOrganizationAttachments: null,
    OrganizationAttachments: null,

    fetchingGrievanceConfig: false,
    fetchedGrievanceConfig: false,
    errorGrievanceConfig: null,
    grievanceConfig: null,

    submittingMutation: false,
    mutation: {},

  },
  action,
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
        organizationsPageInfo: pageInfo(action.payload.data.workforceOrganizations),
        errorOrganizations: formatGraphQLError(action.payload),
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
        organizationsPageInfoPick: { totalCount: 0 },
        errorOrganizationsPick: null,
      };
    case "WORKFORCE_ORGANIZATIONS_PICKER_RESP":
      return {
        ...state,
        fetchingOrganizationsPick: false,
        fetchedOrganizationsPick: true,
        organizationsPick: parseData(action.payload.data.workforceOrganizations),
        organizationsPageInfoPick: pageInfo(action.payload.data.workforceOrganizations),
        errorOrganizationsPick: formatGraphQLError(action.payload),
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
      console.log("fahim", parseData(action.payload.data.workforceRepresentatives));
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
      console.log(parseData(action.payload.data.workforceOrganizationUnits));
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

    case "WORKFORCE_REPRESENTATIVE_BY_CLIENT_MUTATION_ID_RESP":
      console.log(action.payload.data);
      console.log(action.payload.data.workforceRepresentatives);
      return {
        ...state,
        fetchedRepresentativeByClientMutationId: parseData(action.payload.data.workforceRepresentatives),
      };
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
    case "TICKET_UPDATE_TICKET_RESP":
      return dispatchMutationResp(state, "updateTicket", action);
    case "TICKET_DELETE_TICKET_RESP":
      return dispatchMutationResp(state, "deleteTicket", action);
    case "TICKET_ATTACHMENT_MUTATION_REQ":
      return dispatchMutationReq(state, action);
    case "TICKET_ATTACHMENT_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "TICKET_CREATE_TICKET_ATTACHMENT_RESP":
      return dispatchMutationResp(state, "createTicketAttachment", action);
    default:
      return state;
  }
}

export default reducer;
