import {
  parseData, pageInfo, formatServerError, formatGraphQLError,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
  decodeId,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

export const ACTION_TYPE = {

};

function reducer(
  state = {
    fetchingOrganizations: false,
    errorOrganizations: null,
    fetchedOrganizations: false,
    organizations: [],
    organizationsPageInfo: { totalCount: 0 },

    fetchingTicket: false,
    errorTicket: null,
    fetchedTicket: false,
    ticket: null,
    ticketPageInfo: { totalCount: 0 },

    fetchingCategory: false,
    fetchedCategory: false,
    errorCategory: null,
    category: [],
    categoryPageInfo: { totalCount: 0 },

    fetchingTicketAttachments: false,
    fetchedTicketAttachments: false,
    errorTicketAttachments: null,
    ticketAttachments: null,

    fetchingGrievanceConfig: false,
    fetchedGrievanceConfig: false,
    errorGrievanceConfig: null,
    grievanceConfig: null,

    submittingMutation: false,
    mutation: {},

    fetchingTicketComments: false,
    fetchedTicketComments: false,
    errorTicketComments: null,
    ticketComments: null,
  },
  action,
) {
  switch (action.type) {
    case 'WORKFORCE_ORGANIZATIONS_REQ':
      return {
        ...state,
        fetchingOrganizations: true,
        fetchedOrganizations: false,
        organizations: [],
        organizationsPageInfo: { totalCount: 0 },
        errorOrganizations: null,
      };
    case 'WORKFORCE_ORGANIZATIONS_RESP':
      // console.log(parseData(action.payload.data.workforceOrganizations))
      return {
        ...state,
        fetchingOrganizations: false,
        fetchedOrganizations: true,
        organizations: parseData(action.payload.data.workforceOrganizations),
        organizationsPageInfo: pageInfo(action.payload.data.workforceOrganizations),
        errorOrganizations: formatGraphQLError(action.payload),
      };
    case 'WORKFORCE_ORGANIZATIONS_ERR':
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case 'TICKET_TICKET_REQ':
      return {
        ...state,
        fetchingTicket: true,
        fetchedTicket: false,
        ticket: null,
        errorTicket: null,
      };
    case 'TICKET_TICKET_RESP':
      return {
        ...state,
        fetchingTicket: false,
        fetchedTicket: true,
        ticket: parseData(action.payload.data.workforceOrganizations).map((ticket) => ({
          ...ticket,
          id: decodeId(ticket.id),
        }))?.[0],
        errorTicket: formatGraphQLError(action.payload),
      };
    case CLEAR(ACTION_TYPE.CLEAR_TICKET):
      return {
        ...state,
        fetchingTicket: false,
        fetchedTicket: false,
        ticket: null,
        errorTicket: null,
        fetchingTicketComments: false,
        fetchedTicketComments: false,
        ticketComments: [],
        ticketCommentsPageInfo: { totalCount: 0 },
        errorTicketComments: null,
      };
    case 'COMMENT_COMMENTS_REQ':
      return {
        ...state,
        fetchingTicketComments: false,
        fetchedTicketComments: false,
        ticketComments: state.ticketComments || [],
        ticketCommentsPageInfo: { totalCount: 0 },
        errorTicketComments: null,
      };
    case 'COMMENT_COMMENTS_RESP':
      return {
        ...state,
        fetchingTicketComments: false,
        fetchedTicketComments: true,
        ticketComments: parseData(action.payload.data.comments).map(
          (comment) => ({ ...comment, id: decodeId(comment.id) }),
        ),
        ticketCommentsPageInfo: pageInfo(action.payload.data.comments),
        errorTicketComments: formatGraphQLError(action.payload),
      };
    case 'COMMENT_COMMENTS_ERR':
      return {
        ...state,
        fetchingTicketComments: false,
        ticketComments: [],
        error: formatServerError(action.payload),
      };
    case 'CATEGORY_CATEGORY_REQ':
      return {
        ...state,
        fetchingCategory: true,
        fetchedCategory: false,
        category: [],
        errorCategory: null,
      };
    case 'CATEGORY_CATEGORY_RESP':
      return {
        ...state,
        fetchingCategory: false,
        fetchedCategory: true,
        category: parseData(action.payload.data.category),
        categoryPageInfo: pageInfo(action.payload.data.category),
        errorCategory: formatGraphQLError(action.payload),
      };
    case 'CATEGORY_CATEGORY_ERR':
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case 'TICKET_TICKET_ATTACHMENTS_REQ':
      return {
        ...state,
        fetchingTicketAttachments: true,
        fetchedTicketAttachments: false,
        ticketAttachments: null,
        errorTicketAttachments: null,
      };
    case 'TICKET_TICKET_ATTACHMENTS_RESP':
      return {
        ...state,
        fetchingTicketAttachments: false,
        fetchedTicketAttachments: true,
        ticketAttachments: parseData(action.payload.data.ticketAttachments),
        errorTicketAttachments: formatGraphQLError(action.payload),
      };
    case 'TICKET_TICKET_ATTACHMENTS_ERR':
      return {
        ...state,
        fetchingTicketAttachments: false,
        errorTicketAttachments: formatServerError(action.payload),
      };
    case 'TICKET_INSUREE_TICKETS_REQ':
      return {
        ...state,
        fetchingOrganizations: true,
        fetchedOrganizations: false,
        tickets: null,
        policy: null,
        errorOrganizations: null,
      };
    case 'TICKET_INSUREE_TICKETS_RESP':
      return {
        ...state,
        fetchingOrganizations: false,
        fetchedOrganizations: true,
        tickets: parseData(action.payload.data.ticketsByInsuree),
        organizationsPageInfo: pageInfo(action.payload.data.ticketsByInsuree),
        errorOrganizations: formatGraphQLError(action.payload),
      };
    case 'TICKET_INSUREE_TICKETS_ERR':
      return {
        ...state,
        fetchingOrganizations: false,
        errorOrganizations: formatServerError(action.payload),
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
      return dispatchMutationResp(state, 'resolveGrievanceByComment', action);
    case SUCCESS(ACTION_TYPE.REOPEN_TICKET):
      return dispatchMutationResp(state, 'reopenTicket', action);
    case 'TICKET_MUTATION_REQ':
      return dispatchMutationReq(state, action);
    case 'TICKET_MUTATION_ERR':
      return dispatchMutationErr(state, action);
    case 'TICKET_CREATE_TICKET_RESP':
      return dispatchMutationResp(state, 'createTicket', action);
    case 'TICKET_UPDATE_TICKET_RESP':
      return dispatchMutationResp(state, 'updateTicket', action);
    case 'TICKET_DELETE_TICKET_RESP':
      return dispatchMutationResp(state, 'deleteTicket', action);
    case 'TICKET_ATTACHMENT_MUTATION_REQ':
      return dispatchMutationReq(state, action);
    case 'TICKET_ATTACHMENT_MUTATION_ERR':
      return dispatchMutationErr(state, action);
    case 'TICKET_CREATE_TICKET_ATTACHMENT_RESP':
      return dispatchMutationResp(state, 'createTicketAttachment', action);
    default:
      return state;
  }
}

export default reducer;
