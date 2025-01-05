import {
  graphql, formatMutation, formatPageQueryWithCount, formatPageQuery,
  baseApiUrl, decodeId, openBlob, formatQuery,
} from "@openimis/fe-core";
import { formatOrganizationGQL, formatRepresentativeGQL, formatUnitGQL } from "./utils/format_gql";


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

export function fetchOrganizationsPick(filters) {
  const projections = [
    "id", "nameEn", "nameBn"
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_PICKER");
}


export function fetchOrganizationUnitsSummary(mm, filters) {
  const projections = [
    "id", "nameEn", "nameBn", "unitLevel", "phoneNumber", "email",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnits",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_UNITS");
}


export function createRepresentative(mutation, clientMutationLabel) {
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_CREATE_ORG_RESP", "ORG_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function updateRepresentative(mutation, clientMutationLabel) {
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    id: mutation.id
  });
}

export function createWorkforceOrganization(representative, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganization",
    formatOrganizationGQL(representative),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_CREATE_ORG_RESP", "ORG_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function updateWorkforceOrganization(representative, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganization",
    formatOrganizationGQL(representative),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    id: representative.id
  });
}

// export function updateOrganization(ticket, clientMutationLabel) {
//   const mutation = formatMutation("updateTicket", formatUpdateTicketGQL(ticket), clientMutationLabel);
//   const requestedDateTime = new Date();
//   return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"], {
//     clientMutationId: mutation.clientMutationId,
//     clientMutationLabel,
//     requestedDateTime,
//     id: ticket.id,
//   });
// }

export function createWorkforceOrganizationUnit(unit, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganizationUnit",
    formatUnitGQL(unit),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["ORG_UNIT_MUTATION_REQ", "ORG_UNIT_CREATE_RESP", "ORG_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}


export function updateOrganization(ticket, clientMutationLabel) {
  const mutation = formatMutation("updateTicket", formatUpdateTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    id: ticket.id,
  });
}

export function fetchOrganization(mm, filters) {
  const location_projection = "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id", "nameEn", "nameBn", "phoneNumber", "email", "website", "parent{id}",
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " + location_projection + "}",
    "address",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION");
}

export function fetchRepresentativeByClientMutationId(mm, clientMutationId) {
  const payload = `{
  workforceRepresentatives(
    clientMutationId: "${clientMutationId}"
  ) {
    edges {
      node {
        id
      }
    }
  }
}
`;
  return graphql(payload, "WORKFORCE_REPRESENTATIVE_BY_CLIENT_MUTATION_ID");
}