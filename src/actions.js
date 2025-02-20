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
  formatWorkforceFactoryGQL,
  formatEmployeeDesignationGQL,
  formatWorkforceEmployeeGQL,
  formatEmployeeAssignDesignationGQL, formatWorkforceCompanyStatusGql,
  formatBankGQL,
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
    "type"
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
/// bank picker ///
export function fetchBanksPick(filters) {
  const projections = ["id", "nameEn"];
  const payload = formatPageQueryWithCount(
    "banks",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_BANKS_PICKER");
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
    "id",
    "nameEn",
    "nameBn",
    "designationLevel",
    "designationSequence",
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
    "workforceRepresentative { id,nameBn,nameEn,position,email,nid,address,phoneNumber}",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerOffices",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_OFFICES");
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
    location_projection,
    "website",
    "workforceEmployer{id}",
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " +
    location_projection + "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerOffices",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_OFFICE");
}

export function fetchWorkforceFactoriesSummary(mm, filters) {
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
    "workforceRepresentative { id,nameBn,nameEn,position,email,nid,address,phoneNumber}",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerFactories",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_FACTORIES");
}

export function fetchWorkforceFactory(mm, filters) {
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
    "workforceEmployer{id}",
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " +
    location_projection + "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerFactories",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_FACTORY");
}

export function fetchWorkforceCompaniesSummary(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "employerId",
    "employerIdLima",
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
    "officeCount",
    "factoryCount",
    "workforceRepresentative { id,nameBn,nameEn,position,email,nid,address,phoneNumber}",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_COMPANIES");
}

export function fetchCompaniesPick(filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_COMPANIES_PICKER");
}

export function fetchOfficesPick(filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceEmployerOffices",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_OFFICES_PICKER");
}

export function fetchFactoriesPick(filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceEmployerFactories",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_FACTORIES_PICKER");
}

export function fetchWorkforceCompany(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "employerId",
    "employerIdLima",
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
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " +
    location_projection + "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_COMPANY");
}

export function fetchWorkforceCompanyWithFactoriesAndOffices(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "employerId",
    "employerIdLima",
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
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " + location_projection + "}",
    "factories {id,nameBn,nameEn,address,phoneNumber,email,website,status, " + location_projection + "}",
    "offices {id,nameBn,nameEn,address,phoneNumber,email,website,status, " + location_projection + "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_COMPANY");
}

export function fetchWorkforceEmployeesSummary(mm, filters) {
  const present_location_projection =
    "presentLocation" + mm.getProjection("location.Location.FlatProjection");
  const permanent_location_projection =
    "permanentLocation" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "firstNameBn",
    "lastNameBn",
    "firstNameEn",
    "lastNameEn",
    "otherName",
    "phoneNumber",
    "email",
    "status",
    "gender",
    "birthCertificateNo",
    "nid",
    "passportNo",
    "permanentAddress",
    "presentAddress",
    "position",
    "monthlyEarning",
    "referenceSalary",
    "fatherNameBn",
    "fatherNameEn",
    "motherNameBn",
    "motherNameEn",
    "spouseNameBn",
    "spouseNameEn",
    "maritalStatus",
    "citizenship",
    "privacyLaw",
    "insuranceNumber",
    "birthDate",
    "employeeType",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerEmployees",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES");
}

export function fetchWorkforceEmployee(mm, filters) {
  const present_location_projection =
    "presentLocation" + mm.getProjection("location.Location.FlatProjection");
  const permanent_location_projection =
    "permanentLocation" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "firstNameBn",
    "lastNameBn",
    "firstNameEn",
    "lastNameEn",
    "otherName",
    "phoneNumber",
    "email",
    "status",
    "gender",
    "birthCertificateNo",
    "nid",
    "passportNo",
    "permanentAddress",
    "presentAddress",
    "position",
    "monthlyEarning",
    "referenceSalary",
    "fatherNameBn",
    "fatherNameEn",
    "motherNameBn",
    "motherNameEn",
    "spouseNameBn",
    "spouseNameEn",
    "maritalStatus",
    "citizenship",
    "privacyLaw",
    "insuranceNumber",
    "birthDate",
    "employeeType",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerEmployees",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_EMPLOYEE");
}

export function createRepresentative(mutation, clientMutationLabel) {
  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["REP_MUTATION_REQ", "REP_CREATE_REP_RESP", "REP_MUTATION_ERR"],
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
  organization,
  clientMutationLabel,
) {
  const mutation = formatMutation(
    "createWorkforceOrganization",
    formatOrganizationGQL(organization),
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
    [
      "WORKFORCE_ORGANIZATION_EMPLOYEES_REQ",
      "WORKFORCE_ORGANIZATION_EMPLOYEES_RESP",
      "WORKFORCE_ORGANIZATION_EMPLOYEES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateOrganizationEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationEmployee",
    formatOrganizationEmployeeGQL(employee),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_ORGANIZATION_EMPLOYEES_REQ",
      "WORKFORCE_ORGANIZATION_EMPLOYEES_RESP",
      "WORKFORCE_ORGANIZATION_EMPLOYEES_ERR",
    ],
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
    "createWorkforceEmployerOffice",
    formatWorkforceOfficeGQL(office),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_OFFICES_REQ",
      "WORKFORCE_OFFICES_RESP",
      "WORKFORCE_OFFICES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateWorkforceOffice(office, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerOffice",
    formatWorkforceOfficeGQL(office),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_OFFICES_REQ",
      "WORKFORCE_OFFICES_RESP",
      "WORKFORCE_OFFICES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createWorkforceCompany(company, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployer",
    formatWorkforceCompanyGQL(company),
    clientMutationLabel,
  );

  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_COMPANIES_REQ",
      "WORKFORCE_COMPANIES_RESP",
      "WORKFORCE_COMPANIES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createWorkforceFactory(factory, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployerFactory",
    formatWorkforceFactoryGQL(factory),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_FACTORIES_REQ",
      "WORKFORCE_FACTORIES_RESP",
      "WORKFORCE_FACTORIES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateWorkforceFactory(factory, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerFactory",
    formatWorkforceFactoryGQL(factory),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_FACTORY_REQ",
      "WORKFORCE_FACTORY_RESP",
      "WORKFORCE_FACTORY_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: factory.id,
    },
  );
}

export function createWorkforceEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployerEmployee",
    formatWorkforceEmployeeGQL(employee),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_EMPLOYEES_REQ",
      "WORKFORCE_EMPLOYEES_RESP",
      "WORKFORCE_EMPLOYEES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateWorkforceEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerEmployee",
    formatWorkforceEmployeeGQL(employee),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_EMPLOYEES_REQ",
      "WORKFORCE_EMPLOYEES_RESP",
      "WORKFORCE_EMPLOYEES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employee.id,
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
    [
      "WORKFORCE_COMPANIES_REQ",
      "WORKFORCE_COMPANIES_RESP",
      "WORKFORCE_COMPANIES_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: company?.id,
    },
  );
}

export function updateStatusOfWorkforceCompany(company, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerStatus",
    formatWorkforceCompanyStatusGql(company),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "COMPANY_STATUS_MUTATION_REQ",
      "COMPANY_STATUS_UPDATE_RESP",
      "COMPANY_STATUS_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: company?.id,
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
    "parent{id,nameEn,nameBn}",
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

export function fetchEmployeeDesignations(filters) {
  const projections = [
    "id",
    "nameBn",
    "email",
    "nid",
    "phoneNumber",
    "designations {id,status,designation{id,nameBn, nameEn,unit{nameBn,nameEn},organization{nameBn,nameEn}}}",
    "relatedUser {id,loginName}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationEmployees",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_EMPLOYEE_DESIGNATIONS");
}

export function updateWorkforceOrganizationEmployeeDesignation(
  employeeDesignation,
  clientMutationLabel,
) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationEmployeeDesignation",
    formatEmployeeDesignationGQL(employeeDesignation),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["EMPLOYEE_DESIGNATION_MUTATION_REQ", "EMPLOYEE_DESIGNATION_MUTATION_ERR", "EMPLOYEE_DESIGNATION_UPDATE_RELEASE_RESP"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employeeDesignation.id,
    },
  );
}

export function updateWorkforceOrganizationEmployeeAssignDesignation(
  employeeAssignDesignation,
  clientMutationLabel,
) {
  const mutation = formatMutation(
    "createWorkforceOrganizationEmployeeDesignation",
    formatEmployeeAssignDesignationGQL(employeeAssignDesignation),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_REQ", "EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_ERR", "EMPLOYEE_DESIGNATION_UPDATE_ASSIGN_RESP"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employeeAssignDesignation.id,
    },
  );
}

///workforce bank  actions////
export function fetchBanksSummary(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "headquarterAddress",
    "routingNumber",
    "contactNumber",
    "parent{id}",
    "status",
    location_projection
  ];
  const payload = formatPageQueryWithCount(
    "banks",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_BANKS");
}

export function fetchBank(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameEn",
    "nameBn",
    "headquarterAddress",
    "routingNumber",
    "contactNumber",
    "parent{id}",
    "status",
    location_projection
  ];
  const payload = formatPageQueryWithCount(
    "banks",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_BANK");
}

export function fetchBanksBranchSummary(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "name",
    "parentId",
    "headquarterAddress",
    "status",
    "branchName",
    "routingNumber",
    "contactNumber",
    location_projection
    // "workforceRepresentative { id,nameBn,nameEn,position,email,nid,address,phoneNumber}",
    // "location{name,type,parent{name,type,parent{name,type,parent{name,type}}}}",
    // "address",
  ];
  const payload = formatPageQueryWithCount(
    "banks",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_BANK");
}

export function createBank(
  bank,
  clientMutationLabel,
) {
  const mutation = formatMutation(
    "createBank",
    formatBankGQL(bank),
    clientMutationLabel,
  );

  console.log({mutation})
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["BANK_MUTATION_REQ", "BANK_CREATE_BANK_RESP", "BANK_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}
export function updateBank(
  bank,
  clientMutationLabel,
) {
  const mutation = formatMutation(
    "updateBank",
    formatBankGQL(bank),
    clientMutationLabel,
  );

  console.log({mutation})
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["BANK_MUTATION_REQ", "BANK_UPDATE_BANK_RESP", "BANK_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
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

export function fetchWorkforceUnitsWithEmployeeDesignation(filters) {
  const projections = [
    "id",
    "nameBn",
    "unitDesignations {id,nameBn,nameEn,activeEmployeeDesignation{id,status,joiningDate,employee{id,nameEn,nameBn,email,phoneNumber}}}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnits",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_UNITWISE_DESIGNATIONS");
}
