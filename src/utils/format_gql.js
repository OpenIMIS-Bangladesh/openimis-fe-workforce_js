import {
  formatGQLString, decodeId,
} from "@openimis/fe-core";

export function formatRepresentativeGQL(representative) {
  return `
    ${representative.id ? `id: "${formatGQLString(representative.id)}"` : ""}
    ${representative.nameEn ? `nameEn: "${formatGQLString(representative.nameEn)}"` : ""}
    ${representative.nameBn ? `nameBn: "${formatGQLString(representative.nameBn)}"` : ""}
    ${representative.location.id ? `locationId: "${decodeId(representative.location.id)}"` : ""}
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
    ${organization.location.id ? `locationId: "${decodeId(organization.location.id)}"` : ""}
    ${organization.workforceRepresentativeId ? `workforceRepresentativeId: "${decodeId(organization.workforceRepresentativeId)}"` : ""}
    ${organization.address ? `address: "${formatGQLString(organization.address)}"` : ""}
    ${organization.phoneNumber ? `phoneNumber: "${formatGQLString(organization.phoneNumber)}"` : ""}
    ${organization.email ? `email: "${formatGQLString(organization.email)}"` : ""}
    ${organization.website ? `website: "${formatGQLString(organization.website)}"` : ""}
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
    ${(unit.parent && unit.parent.id) ? `parentId: "${decodeId(unit.parent.id)}"` : ""}
    ${unit.organization?.id ? `organizationId: "${decodeId(unit.organization.id)}"` : ""}
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
    ${decodeId(employee.location.id) ? `locationId: "${decodeId(employee.location.id)}"` : ""}
    ${employee.status ? `status: ${employee.status}` : ""}
    ${employee.relatedUserId ? `relatedUserId: "${employee.relatedUserId}"` : ""}
  `;
}

export function formatUnitDesignationGQL(unitDesignation) {
  return `
    ${unitDesignation.id ? `id: "${formatGQLString(unitDesignation.id)}"` : ""}
    ${unitDesignation.organization ? `organizationId: "${decodeId(unitDesignation.organization.id)}"` : ""}
    ${unitDesignation.unit ? `unitId: "${decodeId(unitDesignation.unit.id)}"` : ""}
    ${unitDesignation.nameEn ? `nameEn: "${formatGQLString(unitDesignation.nameEn)}"` : ""}
    ${unitDesignation.nameBn ? `nameBn: "${formatGQLString(unitDesignation.nameBn)}"` : ""}
    ${unitDesignation.status !== undefined ? `status: ${unitDesignation.status}` : ""}
    ${unitDesignation.designationLevel !== undefined ? `designationLevel: ${unitDesignation.designationLevel}` : ""}
    ${unitDesignation.designationSequence !== undefined ? `designationSequence: ${unitDesignation.designationSequence}` : ""}
  `;
}
