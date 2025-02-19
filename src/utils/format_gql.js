import {
  formatGQLString, decodeId,
} from "@openimis/fe-core";
import { WORKFORCE_STATUS } from "../constants";

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
    ${organization.type ? `type: "${formatGQLString(organization.type)}"` : ""}
    ${organization.id ? `id: "${organization.id}"` : ""}
    ${organization.nameEn ? `nameEn: "${formatGQLString(organization.nameEn)}"` : ""}
    ${organization.nameBn ? `nameBn: "${formatGQLString(organization.nameBn)}"` : ""}
    ${organization.location.id ? `locationId: "${decodeId(organization.location.id)}"` : ""}
    ${organization.parent ? `parentId: "${decodeId(organization.parent)}"` : ""}
    ${organization.workforceRepresentativeId ? `workforceRepresentativeId: "${decodeId(organization.workforceRepresentativeId)}"` : ""}
    ${organization.address ? `address: "${formatGQLString(organization.address)}"` : ""}
    ${organization.phoneNumber ? `phoneNumber: "${formatGQLString(organization.phoneNumber)}"` : ""}
    ${organization.email ? `email: "${formatGQLString(organization.email)}"` : ""}
    ${organization.website ? `website: "${formatGQLString(organization.website)}"` : ""}
  `;
}

export function formatUnitGQL(unit) {
  console.log(unit);
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
export function formatBankGQL(bank) {
  return `
    ${bank.id ? `id: "${formatGQLString(bank.id)}"` : ""}
    ${bank.nameEn ? `nameEn: "${formatGQLString(bank.nameEn)}"` : ""}
    ${bank.nameBn ? `nameBn: "${formatGQLString(bank.nameBn)}"` : ""}
    ${bank.contactNumber ? `contactNumber: "${formatGQLString(bank.contactNumber)}"` : ""}
    ${bank.routingNumber ? `routingNumber: "${formatGQLString(bank.routingNumber)}"` : ""}
    ${bank.location.id ? `locationId: "${decodeId(bank.location.id)}"` : ""}
    ${bank.address ? `address: "${formatGQLString(bank.address)}"` : ""}
    ${bank.status ? `status: "${formatGQLString(bank.status)}"` : ""}
    ${(bank.parent && bank.parent.id) ? `parentId: "${decodeId(bank.parent.id)}"` : ""}
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
    ${employee.status ? `status: "${employee.status}"` : ""}
    ${employee.relatedUserId ? `relatedUserId: "${employee.relatedUserId}"` : ""}
  `;
}

export function formatWorkforceOfficeGQL(office) {
  return `
    ${office?.id ? `id: "${formatGQLString(office.id)}"` : ""}
    ${office.company ? `workforceEmployerId: "${office.company}"` : ""}
    ${office.nameEn ? `nameEn: "${formatGQLString(office.nameEn)}"` : ""}
    ${office.nameBn ? `nameBn: "${formatGQLString(office.nameBn)}"` : ""}
    ${office.phoneNumber ? `phoneNumber: "${formatGQLString(office.phoneNumber)}"` : ""}
    ${office.email ? `email: "${formatGQLString(office.email)}"` : ""}
    ${office.website ? `website: "${office.website}"` : ""}
    ${office.address ? `address: "${office.address}"` : ""}
    ${office.location.id ? `locationId: "${decodeId(office.location.id)}"` : ""}
    ${office.status ? `status: "${office.status}"` : ""}
    ${office.isSameCompanyRepresentative ? `isSameCompanyRepresentative: "${office.isSameCompanyRepresentative}"` : ""}
    ${office.workforceRepresentativeId ? `workforceRepresentativeId: "${decodeId(office.workforceRepresentativeId)}"` : ""}

  `;
}

export function formatWorkforceFactoryGQL(factory) {
  return `
    ${factory?.id ? `id: "${formatGQLString(factory.id)}"` : ""}
    ${factory.company ? `workforceEmployerId: "${formatGQLString(factory.company)}"` : ""}
    ${factory.nameEn ? `nameEn: "${formatGQLString(factory.nameEn)}"` : ""}
    ${factory.nameBn ? `nameBn: "${formatGQLString(factory.nameBn)}"` : ""}
    ${factory.phoneNumber ? `phoneNumber: "${formatGQLString(factory.phoneNumber)}"` : ""}
    ${factory.email ? `email: "${formatGQLString(factory.email)}"` : ""}
    ${factory.website ? `website: "${factory.website}"` : ""}
    ${factory.address ? `address: "${factory.address}"` : ""}
    ${factory.location.id ? `locationId: "${decodeId(factory.location.id)}"` : ""}
    ${factory.status ? `status: "${factory.status}"` : ""}
    ${factory.workforceRepresentativeId ? `workforceRepresentativeId: "${decodeId(factory.workforceRepresentativeId)}"` : ""}
    ${factory.isSameCompanyRepresentative ? `isSameCompanyRepresentative: "${factory.isSameCompanyRepresentative}"` : ""}
  `;
}

export function formatWorkforceCompanyGQL(company) {
  const DummyEmployerId = Date.now() + "";
  return `
    ${company?.id ? `id: "${formatGQLString(company?.id)}"` : ""}
    ${company?.employerId ? `employerId: "${formatGQLString(company?.employerId)}"` : `employerId: "id ${formatGQLString(DummyEmployerId)}"`}
    ${company?.employerIdLima ? `employerIdLima: "id ${formatGQLString(company?.employerIdLima)}"` : ""}
    ${company?.nameBn ? `nameBn: "${formatGQLString(company.nameBn)}"` : ""}
    ${company?.nameEn ? `nameEn: "${formatGQLString(company.nameEn)}"` : ""}
    ${decodeId(company?.location.id) ? `locationId: "${decodeId(company.location.id)}"` : ""}
    ${company?.address ? `address: "${company.address}"` : ""}
    ${company?.phoneNumber ? `phoneNumber: "${formatGQLString(company.phoneNumber)}"` : ""}
    ${company?.website ? `website: "${company.website}"` : ""}
    ${company?.establishmentDate ? `establishmentDate: "${company.establishmentDate}"` : ""}
    ${company?.establishmentName ? `establishmentName: "${company.establishmentName}"` : ""}
    ${company?.email ? `email: "${formatGQLString(company.email)}"` : ""}
    ${company?.associationMembershipNumber ? `associationMembershipNumber: "${company.associationMembershipNumber}"` : ""}
    ${company?.licenceType ? `licenceType: "${company?.licenceType}"` : ""}
    ${company?.licenceNumber ? `licenceNumber: "${company.licenceNumber}"` : ""}
    ${company?.foundationDate ? `foundationDate: "${company.foundationDate}"` : ""}
    ${company?.businessSector ? `businessSector: "${company.businessSector}"` : ""}
    ${company?.status ? `status: "${company.status}"` : ""}
    ${company?.workforceRepresentativeId ? `workforceRepresentativeId: "${decodeId(company.workforceRepresentativeId)}"` : ""}

  `;
}

export function formatWorkforceEmployeeGQL(employee) {
  return `
    ${employee?.id ? `id: "${formatGQLString(employee.id)}"` : ""}
    ${employee.firstNameBn ? `firstNameBn: "${formatGQLString(employee.firstNameBn)}"` : ""}
    ${employee.lastNameBn ? `lastNameBn: "${formatGQLString(employee.lastNameBn)}"` : ""}
    ${employee.firstNameEn ? `firstNameEn: "${formatGQLString(employee.firstNameEn)}"` : ""}
    ${employee.lastNameEn ? `lastNameEn: "${formatGQLString(employee.lastNameEn)}"` : ""}
    ${employee.otherName ? `otherName: "${formatGQLString(employee.otherName)}"` : ""}
    ${employee.phoneNumber ? `phoneNumber: "${formatGQLString(employee.phoneNumber)}"` : ""}
    ${employee.email ? `email: "${formatGQLString(employee.email)}"` : ""}
    ${employee.birthDate ? `birthDate: "${employee.birthDate}"` : ""}
    ${employee.gender ? `gender: "${employee.gender}"` : ""}
    ${employee.birthCertificateNo ? `birthCertificateNo: "${employee.birthCertificateNo}"` : ""}
    ${employee.nid ? `nid: "${employee.nid}"` : ""}
    ${employee.insuranceNumber ? `insuranceNumber: "${employee.insuranceNumber}"` : ""}
    ${employee.passportNo ? `passportNo: "${employee.passportNo}"` : ""}
    ${employee.permanentAddress ? `permanentAddress: "${employee.permanentAddress}"` : ""}
    ${employee.presentAddress ? `presentAddress: "${employee.presentAddress}"` : ""}
    ${employee.position ? `position: "${employee.position}"` : ""}
    ${employee.monthlyEarning ? `monthlyEarning: "${employee.monthlyEarning}"` : ""}
    ${employee.referenceSalary ? `referenceSalary: "${employee.referenceSalary}"` : ""}
    ${employee.fatherNameBn ? `fatherNameBn: "${employee.fatherNameBn}"` : ""}
    ${employee.fatherNameEn ? `fatherNameEn: "${employee.fatherNameEn}"` : ""}
    ${employee.motherNameBn ? `motherNameBn: "${employee.motherNameBn}"` : ""}
    ${employee.motherNameEn ? `motherNameEn: "${employee.motherNameEn}"` : ""}
    ${employee.spouseNameBn ? `spouseNameBn: "${employee.spouseNameBn}"` : ""}
    ${employee.spouseNameEn ? `spouseNameEn: "${employee.spouseNameEn}"` : ""}
    ${employee.maritalStatus ? `maritalStatus: "${employee.maritalStatus}"` : ""}
    ${employee.citizenship ? `citizenship: "${employee.citizenship}"` : ""}
    ${employee.privacyLaw ? `privacyLaw: "${employee.privacyLaw}"` : ""}
    ${employee.employeeType ? `employeeType: "${employee.employeeType}"` : ""}
    ${employee.presentLocation.id ? `presentLocationId: "${decodeId(employee.presentLocation.id)}"` : ""}
    ${employee.permanentLocation.id ? `permanentLocationId: "${decodeId(employee.permanentLocation.id)}"` : ""}
    ${employee.status ? `status: "${employee.status}"` : ""}
    ${employee?.relatedUserId ? `relatedUserId: "${employee.relatedUserId}"` : ""}
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

///employee designation gql///
export function formatEmployeeDesignationGQL(employeeDesignation) {

  return `
    ${employeeDesignation.id ? `id: "${formatGQLString(employeeDesignation.id)}"` : ""}
    ${employeeDesignation.designationId ? `designationId: "${formatGQLString(employeeDesignation.designationId)}"` : ""}
    ${employeeDesignation.employeeId ? `employeeId: "${formatGQLString(employeeDesignation.employeeId)}"` : ""}
    ${employeeDesignation.status ? `status: "${WORKFORCE_STATUS.INACTIVE}"` : ""}
    ${employeeDesignation.releaseDate ? `releaseDate: "${formatGQLString(employeeDesignation.releaseDate)}"` : ""}
  `;
}

export function formatEmployeeAssignDesignationGQL(employeeAssignDesignation) {

  return `
    ${employeeAssignDesignation.designationId ? `designationId: "${formatGQLString(employeeAssignDesignation.designationId)}"` : ""}
    ${employeeAssignDesignation.employeeId ? `employeeId: "${formatGQLString(employeeAssignDesignation.employeeId)}"` : ""}
    ${employeeAssignDesignation.status ? `status: "${WORKFORCE_STATUS.ACTIVE}"` : ""}
    ${employeeAssignDesignation.releaseDate ? `releaseDate: "${formatGQLString(employeeAssignDesignation.joiningDate)}"` : ""}
  `;
}

export function formatWorkforceCompanyStatusGql(company) {
  return `
    ${company?.id ? `id: "${formatGQLString(company?.id)}"` : ""}
    ${company?.status ? `status: "${company.status}"` : ""}
  `;
}