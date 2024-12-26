import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString, formatPageQuery,
  baseApiUrl, decodeId, openBlob, formatQuery,
} from "@openimis/fe-core";

export function formatRepresentativeGQL(representative) {
  console.log({representative})
  return `
    ${representative.nameEn ? `nameEn: "${formatGQLString(representative.nameEn)}"` : ''}
    ${representative.nameBn ? `nameBn: "${formatGQLString(representative.nameBn)}"` : ''}
    ${representative.location ? `location: "${formatGQLString(representative.location)}"` : ''}
    ${representative.address ? `address: "${formatGQLString(representative.address)}"` : ''}
    ${representative.phoneNumber ? `phoneNumber: "${formatGQLString(representative.phoneNumber)}"` : ''}
    ${representative.email ? `email: "${formatGQLString(representative.email)}"` : ''}
    ${representative.nid ? `nid: "${formatGQLString(representative.nid)}"` : ''}
    ${representative.passportNo ? `passportNo: "${formatGQLString(representative.passportNo)}"` : ''}
    ${representative.birthDate ? `birthDate: "${formatGQLString(representative.birthDate)}"` : ''}
    ${representative.position ? `position: "${formatGQLString(representative.position)}"` : ''}
  `;
}


export function fetchOrganizationsSummary(mm, filters) {
  const projections = [
    "id", "nameEn", "nameBn", "phoneNumber", "email", "workforceRepresentative { id,nameBn,nameEn,position,email,nid,address,phoneNumber}",
    "location{name,type,parent{name,type,parent{name,type,parent{name,type}}}}",
    "address",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS");
}


export function createOrganization(ticket, grievanceConfig, clientMutationLabel) {
  // const resolutionTimeMap = {};
  // grievanceConfig.grievanceDefaultResolutionsByCategory.forEach((item) => {
  //   resolutionTimeMap[item.category] = item.resolutionTime;
  // });
  // ticket.resolution = resolutionTimeMap[ticket.category];
  const mutation = formatMutation("createWorkforceRepresentative", formatRepresentativeGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_CREATE_ORG_RESP", "ORG_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

// export function createOrganization(representative, grievanceConfig, clientMutationLabel) {
//   const mutation = formatMutation(
//     "createWorkforceRepresentative",
//     formatRepresentativeGQL(representative),
//     clientMutationLabel
//   );
//   const requestedDateTime = new Date();
//   return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_CREATE_ORG_RESP", "ORG_MUTATION_ERR"], {
//     clientMutationId: mutation.clientMutationId,
//     clientMutationLabel,
//     requestedDateTime,
//   });
// }


export function updateOrganization(ticket, clientMutationLabel) {
  const mutation = formatMutation("updateTicket", formatUpdateTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_MUTATION_REQ", "TICKET_UPDATE_TICKET_RESP", "TICKET_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    id: ticket.id,
  });
}

export function fetchOrganization(mm, filters) {
  const projections = [
    "id", "title", "code", "description", "status",
    "priority", "dueDate", "reporter", "reporterId",
    "reporterType", "reporterTypeName", "category", "flags", "channel",
    "resolution", "title", "dateOfIncident", "dateCreated",
    "attendingStaff {id, username}", "version", "isHistory,", "jsonExt",
  ];
  const payload = formatPageQueryWithCount(
    "tickets",
    filters,
    projections,
  );
  return graphql(payload, "TICKET_TICKET");
}