import {
  formatGQLString, decodeId,
} from "@openimis/fe-core";

export function formatRepresentativeGQL(representative) {
  console.log(representative.id);
  return `
    ${representative.id ? `id: "${formatGQLString(representative.id)}"` : ""}
    ${representative.nameEn ? `nameEn: "${formatGQLString(representative.nameEn)}"` : ""}
    ${representative.nameBn ? `nameBn: "${formatGQLString(representative.nameBn)}"` : ""}
    ${representative.location.id ? `location: "${decodeId(representative.location.id)}"` : ""}
    ${representative.address ? `address: "${formatGQLString(representative.address)}"` : ""}
    ${representative.phoneNumber ? `phoneNumber: "${formatGQLString(representative.phoneNumber)}"` : ""}
    ${representative.email ? `email: "${formatGQLString(representative.email)}"` : ""}
    ${representative.nid ? `nid: "${formatGQLString(representative.nid)}"` : ""}
    ${representative.passportNo ? `passportNo: "${formatGQLString(representative.passportNo)}"` : ""}
    ${representative.birthDate ? `birthDate: "${formatGQLString(representative.birthDate)}"` : ""}
    ${representative.position ? `position: "${formatGQLString(representative.position)}"` : ""}
    ${representative.type ? `type: "${formatGQLString(representative.type)}"` : ""}
  `;
}


export function formatOrganizationGQL(organization) {

  return `
    ${organization.id ? `id: "${organization.id}"` : ""}
    ${organization.nameEn ? `nameEn: "${formatGQLString(organization.nameEn)}"` : ""}
    ${organization.nameBn ? `nameBn: "${formatGQLString(organization.nameBn)}"` : ""}
    ${organization.location.id ? `location: "${decodeId(organization.location.id)}"` : ""}
    ${organization.workforceRepresentativeId ? `workforceRepresentativeId: "${decodeId(organization.workforceRepresentativeId)}"` : ""}
    ${organization.address ? `address: "${formatGQLString(organization.address)}"` : ""}
    ${organization.phoneNumber ? `phoneNumber: "${formatGQLString(organization.phoneNumber)}"` : ""}
    ${organization.email ? `email: "${formatGQLString(organization.email)}"` : ""}
    ${organization.website ? `website: "${formatGQLString(organization.website)}"` : ""}
  `;
}

export function formatUpdateTicketGQL(ticket) {
  // eslint-disable-next-line no-param-reassign
  if (ticket.reporter) ticket.reporter = JSON.parse(JSON.parse(ticket.reporter || "{}"), "{}");
  return `
    ${ticket.id !== undefined && ticket.id !== null ? `id: "${ticket.id}"` : ""}
    ${!!ticket.category && !!ticket.category ? `category: "${ticket.category}"` : ""}
    ${!!ticket.title && !!ticket.title ? `title: "${ticket.title}"` : ""}
    ${!!ticket.description && !!ticket.description ? `description: "${ticket.description}"` : ""}
    ${!!ticket.attendingStaff && !!ticket.attendingStaff ? `attendingStaffId: "${decodeId(ticket.attendingStaff.id)}"` : ""}
    ${ticket.reporter
    ? (isBase64Encoded(ticket.reporter.id)
      ? `reporterId: "${decodeId(ticket.reporter.id)}"`
      : `reporterId: "${ticket.reporter.id}"`)
    : ""}
    ${!!ticket.reporter && !!ticket.reporter ? "reporterType: \"Individual\"" : ""}
    ${ticket.nameOfComplainant ? `nameOfComplainant: "${formatGQLString(ticket.nameOfComplainant)}"` : ""}
    ${ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ""}
    ${ticket.status ? `status: ${formatGQLString(ticket.status)}` : ""}
    ${ticket.priority ? `priority: "${formatGQLString(ticket.priority)}"` : ""}
    ${ticket.dueDate ? `dueDate: "${formatGQLString(ticket.dueDate)}"` : ""}
    ${ticket.dateSubmitted ? `dateSubmitted: "${formatGQLString(ticket.dateSubmitted)}"` : ""}
    ${ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ""}
    ${!!ticket.channel && !!ticket.channel ? `channel: "${ticket.channel}"` : ""}
    ${!!ticket.flags && !!ticket.flags ? `flags: "${ticket.flags}"` : ""}
  `;
}

export function formatUnitGQL(unit) {
  console.log(unit)
  return `
    ${unit.id ? `id: "${formatGQLString(unit.id)}"` : ""}
    ${unit.nameEn ? `nameEn: "${formatGQLString(unit.nameEn)}"` : ""}
    ${unit.nameBn ? `nameBn: "${formatGQLString(unit.nameBn)}"` : ""}
    ${unit.phoneNumber ? `phoneNumber: "${formatGQLString(unit.phoneNumber)}"` : ""}
    ${unit.email ? `email: "${formatGQLString(unit.email)}"` : ""}
    ${unit.level ? `unitLevel: "${unit.level}"` : ""}
    ${(unit.parent && unit.parent.id) ? `parent: "${decodeId(unit.parent.id)}"` : ""}
    ${unit.organization?.id ? `organization: "${decodeId(unit.organization.id)}"` : ""}
  `;
}
export function formatOrganizationEmployeeGQL(employee) {
  return `
    ${employee.id ? `id: "${formatGQLString(employee.id)}"` : ""}
    ${employee.nameEn ? `nameEn: "${formatGQLString(employee.nameEn)}"` : ""}
    ${employee.nameBn ? `nameBn: "${formatGQLString(employee.nameBn)}"` : ""}
    ${employee.phoneNumber ? `phoneNumber: "${formatGQLString(employee.phoneNumber)}"` : ""}
    ${employee.email ? `email: "${formatGQLString(employee.email)}"` : ""}
    ${employee.birthDate ? `birthDate: "${employee.birthDate}"` : ""}
    ${employee.gender ? `gender: "${employee.gender}"` : ""}
    ${employee.firstJoiningDate ? `firstJoiningDate: "${employee.firstJoiningDate}"` : ""}
    ${employee.birthCertificateNo ? `birthCertificateNo: "${employee.birthCertificateNo}"` : ""}
    ${employee.nid ? `nid: "${employee.nid}"` : ""}
    ${employee.passportNo ? `passportNo: "${employee.passportNo}"` : ""}
    ${employee.address ? `address: "${employee.address}"` : ""}
    ${decodeId(employee.location.id) ? `location: "${decodeId(employee.location.id)}"` : ""}
    ${employee.status ? `status: "${employee.status}"` : ""}
  `;
}
export function formatWorkforceOfficeGQL(office) {
  return `
    ${office.id ? `id: "${formatGQLString(office.id)}"` : ""}
    ${office.nameEn ? `nameEn: "${formatGQLString(office.nameEn)}"` : ""}
    ${office.nameBn ? `nameBn: "${formatGQLString(office.nameBn)}"` : ""}
    ${office.phoneNumber ? `phoneNumber: "${formatGQLString(office.phoneNumber)}"` : ""}
    ${office.email ? `email: "${formatGQLString(office.email)}"` : ""}
    ${office.website ? `passportNo: "${office.website}"` : ""}
    ${office.address ? `address: "${office.address}"` : ""}
    ${decodeId(office.location.id) ? `location: "${decodeId(office.location.id)}"` : ""}
    ${office.status ? `status: "${office.status}"` : ""}
  `;
}

export function formatUnitDesignationGQL(unitDesignation) {
  return `
    ${unitDesignation.id ? `id: "${formatGQLString(unitDesignation.id)}"` : ""}
    ${unitDesignation.organization ? `organization: "${decodeId(unitDesignation.organization.id)}"` : ""}
    ${unitDesignation.unit ? `unit: "${decodeId(unitDesignation.unit.id)}"` : ""}
    ${unitDesignation.nameEn ? `nameEn: "${formatGQLString(unitDesignation.nameEn)}"` : ""}
    ${unitDesignation.nameBn ? `nameBn: "${formatGQLString(unitDesignation.nameBn)}"` : ""}
    ${unitDesignation.status !== undefined ? `status: ${unitDesignation.status}` : ""}
    ${unitDesignation.designationLevel !== undefined ? `designationLevel: ${unitDesignation.designationLevel}` : ""}
    ${unitDesignation.designationSequence !== undefined ? `designationSequence: ${unitDesignation.designationSequence}` : ""}
  `;
}
