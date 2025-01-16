import {
  graphql,
  formatMutation,
  formatPageQueryWithCount,
  formatPageQuery,
  baseApiUrl,
  decodeId,
  openBlob,
  formatQuery,
} from "@openimis/fe-core";
import {
  formatOrganizationEmployeeGQL,
  formatOrganizationGQL,
  formatRepresentativeGQL,
  formatUnitDesignationGQL,
  formatUnitGQL,
  formatWorkforceOfficeGQL,
  formatWorkforceCompanyGQL,
} from "./utils/format_gql";

export function fetchOrganizationsSummary(mm, filters) {
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "phoneNumber",
    "email",
    "workforceRepresentative { id,nameBn,nameEn,position,email,nid,address,phoneNumber}",
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
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_PICKER");
}

export function fetchOrganizationUnitsPick(mm, filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnits",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_UNITS_PICKER");
}

export function fetchOrganizationUnitsSummary(mm, filters) {
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "unitLevel",
    "phoneNumber",
    "email",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnits",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_UNITS");
}

///unit designation fetch summary///
export function fetchUnitDesignationSummary(mm, filters) {
  const projections = [
    "id", "nameEn", "nameBn", "designationLevel", "designationSequence",
    "organization{nameEn,nameBn}",
    "unit{nameEn,nameBn}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnitDesignations",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_UNIT_DESIGNATIONS");
}

export function fetchOrganizationEmployeesSummary(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "address",
    "phoneNumber",
    "email",
    "status",
    "gender",
    "firstJoiningDate",
    "birthCertificateNo",
    "nid",
    "passportNo",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationEmployees",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_EMPLOYEES");
}

export function fetchOrganizationEmployee(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "address",
    "phoneNumber",
    "email",
    "status",
    "gender",
    "firstJoiningDate",
    "birthCertificateNo",
    "nid",
    "passportNo",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationEmployees",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_EMPLOYEE");
}

export function fetchWorkforceOfficesSummary(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "address",
    "phoneNumber",
    "email",
    "status",
    "website",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOffices",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_EMPLOYEES");
}

export function fetchWorkforceOffice(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "address",
    "phoneNumber",
    "email",
    "status",
    "website",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOffices",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_EMPLOYEE");
}

export function fetchWorkforceCompaniesSummary(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "address",
    "phoneNumber",
    "email",
    "status",
    "establishmentDate",
    "associationName",
    "associationMembershipNumber",
    "licenceType",
    "licenceNumber",
    "website",
    "businessSector",
    "foundationDate",
    "establishmentName",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_COMPANIES");
}

export function fetchWorkforceCompany(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "address",
    "phoneNumber",
    "email",
    "status",
    "establishmentDate",
    "associationName",
    "associationMembershipNumber",
    "licenceType",
    "licenceNumber",
    "website",
    "businessSector",
    "foundationDate",
    "establishmentName",

    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_COMPANY");
}

export function createRepresentative(mutation, clientMutationLabel) {
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_MUTATION_REQ", "ORG_CREATE_ORG_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateRepresentative(representativeData, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceRepresentative",
    formatRepresentativeGQL(representativeData),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createWorkforceOrganization(
  representative,
  clientMutationLabel,
) {
  const mutation = formatMutation(
    "createWorkforceOrganization",
    formatOrganizationGQL(representative),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_MUTATION_REQ", "ORG_CREATE_ORG_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateWorkforceOrganization(
  representative,
  clientMutationLabel,
) {
  const mutation = formatMutation(
    "updateWorkforceOrganization",
    formatOrganizationGQL(representative),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: representative.id,
    },
  );
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
  return graphql(
    mutation.payload,
    ["ORG_UNIT_MUTATION_REQ", "ORG_UNIT_CREATE_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateWorkforceOrganizationUnit(unit, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationUnit",
    formatUnitGQL(unit),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_UNIT_MUTATION_REQ", "ORG_UNIT_CREATE_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: unit.id,
    },
  );
}

export function createOrganizationEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganizationEmployee",
    formatOrganizationEmployeeGQL(employee),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["WORKFORCE_ORGANIZATION_EMPLOYEES_REQ", "WORKFORCE_ORGANIZATION_EMPLOYEES_RESP", "WORKFORCE_ORGANIZATION_EMPLOYEES_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateOrganizationEMployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationEmployee",
    formatOrganizationEmployeeGQL(employee),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["WORKFORCE_ORGANIZATION_EMPLOYEES_REQ", "WORKFORCE_ORGANIZATION_EMPLOYEES_RESP", "WORKFORCE_ORGANIZATION_EMPLOYEES_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employee.id,
    },
  );
}

export function createWorkforceOffice(office, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOffice",
    formatWorkforceOfficeGQL(office),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["WORKFORCE_OFFICES_REQ", "WORKFORCE_OFFICES_RESP", "WORKFORCE_OFFICES_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateWorkforceOffice(office, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOffice",
    formatWorkforceOfficeGQL(office),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["WORKFORCE_OFFICES_REQ", "WORKFORCE_OFFICES_RESP", "WORKFORCE_OFFICES_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employee.id,
    },
  );
}

export function createWorkforceCompany(company, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployer",
    formatWorkforceCompanyGQL(company),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["WORKFORCE_COMPANIES_REQ", "WORKFORCE_COMPANIES_RESP", "WORKFORCE_COMPANIES_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateWorkforceCompany(company, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployer",
    formatWorkforceCompanyGQL(company),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["WORKFORCE_COMPANIES_REQ", "WORKFORCE_COMPANIES_RESP", "WORKFORCE_COMPANIES_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: company.id,
    },
  );
}

////unit designation update /////////
export function createUnitDesignation(unitDesignation, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganizationUnitDesignation",
    formatUnitDesignationGQL(unitDesignation),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "UNIT_DESIGNATION_MUTATION_REQ",
      "UNIT_DESIGNATION_CREATE_UNIT_DESIGNATION_RESP",
      "UNIT_DESIGNATION_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateUnitDesignation(unitDesignation, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationUnitDesignation",
    formatUnitDesignationGQL(unitDesignation),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "UNIT_DESIGNATION_MUTATION_REQ",
      "UNIT_DESIGNATION_UPDATE_UNIT_DESIGNATION_RESP",
      "UNIT_DESIGNATION_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: unitDesignation.id,
    },
  );
}

export function updateOrganization(ticket, clientMutationLabel) {
  const mutation = formatMutation(
    "updateTicket",
    formatUpdateTicketGQL(ticket),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: ticket.id,
    },
  );
}

export function fetchOrganization(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "phoneNumber",
    "email",
    "website",
    "parent{id}",
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " +
    location_projection +
    "}",
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

export function fetchOrganizationUnit(mm, filters) {
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "phoneNumber",
    "email",
    "unitLevel",
    "parent{id,nameBn,nameEn}",
    " organization{id,nameBn,nameEn}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnits",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_UNIT");
}

///fetching workforce organization unit designations////
export function fetchUnitDesignation(mm, filters) {
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "designationLevel",
    "designationSequence",
    "unit{id,nameBn,nameEn}",
    "organization{id,nameBn,nameEn}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnitDesignations",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_UNIT_DESIGNATION");
}

///fetching employee designation details

export function fetchEmployeeDesignations(mm, filters) {
  const projections = [
    "id",
    "nameBn",
    "email",
    "nid",
    "phoneNumber",
    "designations {id,designation{id,nameBn, nameEn,unit{nameBn,nameEn},organization{nameBn,nameEn}}}",
    "relatedUser {id,loginName}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationEmployees",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_EMPLOYEE_DESIGNATIONS");
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
