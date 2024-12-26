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

    fetchingOrganization: false,
    errorOrganization: null,
    fetchedOrganization: false,
    organization: null,
    organizationPageInfo: { totalCount: 0 },

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
      // console.log(parseData(action.payload.data.workforceOrganizations))
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
    case "ORG_MUTATION_REQ":
      return dispatchMutationReq(state, action);
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
