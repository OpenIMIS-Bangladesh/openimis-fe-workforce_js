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
  console.log({ bank });
  return `
    ${bank?.id ? `id: "${formatGQLString(bank?.id)}"` : ""}
    ${bank?.nameEn ? `nameEn: "${formatGQLString(bank.nameEn)}"` : ""}
    ${bank?.nameBn ? `nameBn: "${formatGQLString(bank.nameBn)}"` : ""}
    ${bank?.contactNumber ? `contactNumber: "${formatGQLString(bank.contactNumber)}"` : ""}
    ${bank?.routingNumber ? `routingNumber: "${formatGQLString(bank.routingNumber)}"` : ""}
    ${bank?.locationId ? `locationId: "${decodeId(bank.locationId.id)}"` : ""}
    ${bank?.address ? `headquarterAddress: "${formatGQLString(bank.address)}"` : ""}
    ${bank?.status ? `status: "${formatGQLString(bank.status)}"` : ""}
    ${bank?.parentId ? `parentId: "${decodeId(bank.parentId)}"` : ""}
    ${bank?.type ? `type: "${formatGQLString(bank.type)}"` : ""}
  `;
}
export function formatEducationInfoGQL(education) {
  console.log({ education });
  return `
    ${education?.id ? `id: "${(education?.id)}"` : ""}
    ${education?.applicationId ? `applicationId: "${(education?.applicationId)}"` : ""}
    ${education?.educationLevel ? `educationLevel: "${(education?.educationLevel)}"` : ""}
    ${education?.educationBoard ? `educationBoard: "${(education?.educationBoard)}"` : ""}
    ${education?.passingYear ? `passingYear: "${(education?.passingYear)}"` : ""}
    ${education?.locationId ? `locationId: "${decodeId(education?.locationId.id)}"` : ""}
    ${education?.rollNumber ? `rollNumber: "${(education?.rollNumber)}"` : ""}
    ${education?.registrationNumber ? `registrationNumber: "${(education?.registrationNumber)}"` : ""}
    ${education?.childNidNo ? `childNidNo: "${(education?.childNidNo)}"` : ""}
    ${education?.childNameEn ? `childNameEn: "${(education?.childNameEn)}"` : ""}
    ${education?.childNameBn ? `childNameBn: "${(education?.childNameBn)}"` : ""}
    ${education?.childBirthDate ? `childBirthDate: "${(education?.childBirthDate)}"` : ""}
    ${education?.childBirthCertificateNo ? `childBirthCertificateNo: "${(education?.childBirthCertificateNo)}"` : ""}
    ${education?.studyClass ? `studyClass: "${(education?.studyClass)}"` : ""}
    ${education?.result ? `result: "${(education?.result)}"` : ""}
    ${education?.institution ? `institution: "${(education?.institution)}"` : ""}
  `;
}

export function formatApplicationSummaryGQL(applicationSummary) {
  return `
    ${applicationSummary?.id ? `id: "${formatGQLString(applicationSummary?.id)}"` : ""}
    ${applicationSummary?.applicationData ? `applicationData: ${escapeQuotes(applicationSummary?.applicationData)}` : ""}
    ${applicationSummary.name ? `name: "${applicationSummary.name}"` : ""}
    ${applicationSummary.remarks ? `remarks: "${applicationSummary.remarks}"` : ""}
    ${applicationSummary.meetingDate ? `meetingDate: "${applicationSummary.meetingDate}"` : ""}
    ${applicationSummary?.status ? `status: "${formatGQLString(applicationSummary.status)}"` : ""}
    ${applicationSummary?.year ? `year: ${applicationSummary.year}` : ""}
    ${applicationSummary?.sectionType ? `sectionType: "${applicationSummary.sectionType}"` : ""}
    ${applicationSummary?.month ? `month: "${formatGQLString(applicationSummary.month)}"` : ""}
    ${applicationSummary?.organizationType ? `organizationType: "${formatGQLString(applicationSummary.organizationType)}"` : ""}
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
    ${factory?.id ? `id: "${formatGQLString(factory?.id)}"` : ""}
    ${factory?.company?.id ? `workforceEmployerId: "${(factory?.company.id)}"` : ""}
    ${factory?.nameEn ? `nameEn: "${formatGQLString(factory?.nameEn)}"` : ""}
    ${factory?.nameBn ? `nameBn: "${formatGQLString(factory?.nameBn)}"` : ""}
    ${factory?.phoneNumber ? `phoneNumber: "${formatGQLString(factory?.phoneNumber)}"` : ""}
    ${factory?.email ? `email: "${formatGQLString(factory?.email)}"` : ""}
    ${factory?.website ? `website: "${factory?.website}"` : ""}
    ${factory?.address ? `address: "${factory?.address}"` : ""}
    ${factory?.associationType ? `associationType: "${factory?.associationType}"` : ""}
    ${factory?.location?.id ? `locationId: "${decodeId(factory?.location.id)}"` : ""}
    ${factory?.status ? `status: "${factory?.status}"` : ""}
    ${factory?.workforceRepresentativeId ? `workforceRepresentativeId: "${decodeId(factory?.workforceRepresentativeId)}"` : ""}
    ${factory?.isSameCompanyRepresentative ? `isSameCompanyRepresentative: "${factory?.isSameCompanyRepresentative}"` : ""}
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
    ${employee.company ? `workforceEmployerId: "${employee.company}"` : ""}
    ${employee.factory ? `workforceFactoryId: "${employee.factory}"` : ""}
    ${employee.firstNameBn ? `firstNameBn: "${formatGQLString(employee.firstNameBn)}"` : ""}
    ${employee.lastNameBn ? `lastNameBn: "${formatGQLString(employee.lastNameBn)}"` : ""}
    ${employee.firstNameEn ? `firstNameEn: "${formatGQLString(employee.firstNameEn)}"` : ""}
    ${employee.lastNameEn ? `lastNameEn: "${formatGQLString(employee.lastNameEn)}"` : ""}
    ${employee.otherName ? `otherName: "${formatGQLString(employee.otherName)}"` : ""}
    ${employee.phoneNumber ? `phoneNumber: "${formatGQLString(employee.phoneNumber)}"` : ""}
    ${employee.email ? `email: "${formatGQLString(employee.email)}"` : ""}
    ${employee.birthDate ? `birthDate: "${employee.birthDate}"` : ""}
    ${employee.joinDate ? `joinDate: "${employee.joinDate}"` : ""}
    ${employee.deathDate ? `deathDate: "${employee.deathDate}"` : ""}
    ${employee.gender ? `gender: "${employee.gender}"` : ""}
    ${employee.birthCertificateNo ? `birthCertificateNo: "${employee.birthCertificateNo}"` : ""}
    ${employee.nid ? `nid: "${employee.nid}"` : ""}
    ${employee.insuranceNumber ? `insuranceNumber: "${employee.insuranceNumber}"` : ""}
    ${employee.passportNo ? `passportNo: "${employee.passportNo}"` : ""}
    ${employee.permanentAddress ? `permanentAddress: ${escapeQuotes(employee.permanentAddress)}` : ""}
    ${employee.presentAddress ? `presentAddress: ${escapeQuotes(employee.presentAddress)}` : ""}
    ${employee.position ? `position: "${employee.position}"` : ""}
    ${employee.monthlyEarning ? `monthlyEarning: "${employee.monthlyEarning}"` : ""}
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
    ${employee.presentLocation?.id ? `presentLocationId: "${decodeId(employee.presentLocation.id)}"` : ""}
    ${employee.permanentLocation?.id ? `permanentLocationId: "${decodeId(employee.permanentLocation.id)}"` : ""}
    ${employee.status ? `status: "${employee.status}"` : ""}
    ${employee.lifeStatus ? `lifeStatus: "${employee.lifeStatus}"` : ""}
    ${employee?.relatedUserId ? `relatedUserId: "${employee.relatedUserId}"` : ""}
  `;
}

export function formatWorkforceDependentGQL(employee) {
  return `
    ${employee?.id ? `id: "${formatGQLString(employee.id)}"` : ""}
    ${employee.company ? `workforceEmployerId: "${employee.company}"` : ""}
    ${employee.factory ? `workforceFactoryId: "${employee.factory}"` : ""}
    ${employee.firstNameBn ? `firstNameBn: "${formatGQLString(employee.firstNameBn)}"` : ""}
    ${employee.lastNameBn ? `lastNameBn: "${formatGQLString(employee.lastNameBn)}"` : ""}
    ${employee.firstNameEn ? `firstNameEn: "${formatGQLString(employee.firstNameEn)}"` : ""}
    ${employee.lastNameEn ? `lastNameEn: "${formatGQLString(employee.lastNameEn)}"` : ""}
    ${employee.otherName ? `otherName: "${formatGQLString(employee.otherName)}"` : ""}
    ${employee.phoneNumber ? `phoneNumber: "${formatGQLString(employee.phoneNumber)}"` : ""}
    ${employee.email ? `email: "${formatGQLString(employee.email)}"` : ""}
    ${employee.birthDate ? `birthDate: "${employee.birthDate}"` : ""}
    ${employee.joinDate ? `joinDate: "${employee.joinDate}"` : ""}
    ${employee.deathDate ? `deathDate: "${employee.deathDate}"` : ""}
    ${employee.gender ? `gender: "${employee.gender}"` : ""}
    ${employee.birthCertificateNo ? `birthCertificateNo: "${employee.birthCertificateNo}"` : ""}
    ${employee.nid ? `nid: "${employee.nid}"` : ""}
    ${employee.insuranceNumber ? `insuranceNumber: "${employee.insuranceNumber}"` : ""}
    ${employee.passportNo ? `passportNo: "${employee.passportNo}"` : ""}
    ${employee.permanentAddress ? `permanentAddress: "${employee.permanentAddress}"` : ""}
    ${employee.presentAddress ? `presentAddress: "${employee.presentAddress}"` : ""}
    ${employee.position ? `position: "${employee.position}"` : ""}
    ${employee.monthlyEarning ? `monthlyEarning: "${employee.monthlyEarning}"` : ""}
    ${employee.fatherNameBn ? `fatherNameBn: "${employee.fatherNameBn}"` : ""}
    ${employee.fatherNameEn ? `fatherNameEn: "${employee.fatherNameEn}"` : ""}
    ${employee.motherNameBn ? `motherNameBn: "${employee.motherNameBn}"` : ""}
    ${employee.motherNameEn ? `motherNameEn: "${employee.motherNameEn}"` : ""}
    ${employee.spouseNameBn ? `spouseNameBn: "${employee.spouseNameBn}"` : ""}
    ${employee.spouseNameEn ? `spouseNameEn: "${employee.spouseNameEn}"` : ""}
    ${employee.maritalStatus ? `maritalStatus: "${employee.maritalStatus}"` : ""}
    ${employee.relationship ? `relationship: "${employee.relationship}"` : ""}
    ${employee.presentLocation.id ? `presentLocationId: "${decodeId(employee.presentLocation.id)}"` : ""}
    ${employee.permanentLocation.id ? `permanentLocationId: "${decodeId(employee.permanentLocation.id)}"` : ""}
    ${employee.status ? `status: "${employee.status}"` : ""}
  `;
}

///application   ////
export function formatApplicationeGQL(application) {
  return `
  ${application?.id ? `id: "${(application?.id)}"` : ""}
  ${application?.workforceEmployeeId ? `workforceEmployeeId: "${(application?.workforceEmployeeId)}"` : ""}
  ${application?.organizationId ? `organizationId: "${decodeId(application?.organizationId?.id)}"` : ""}
  ${application?.organizationType ? `organizationType: "${formatGQLString(application?.organizationType)}"` : ""}
  ${application?.applicationType ? `applicationType: "${formatGQLString(application?.applicationType)}"` : ""}
  ${application?.grantAmount ? `grantAmount: "${(application?.grantAmount)}"` : ""}
  ${application?.status ? `status: "${application?.status}"` : ""}
  ${application?.trackingNumber ? `trackingNumber: "${application?.trackingNumber}"` : ""}
  ${application?.employeeDependentInfo ? `employeeDependentInfo: ${escapeQuotes(application?.employeeDependentInfo)}` : ""}
  ${application?.employeeBankInfo ? `employeeBankInfo: ${escapeQuotes(application?.employeeBankInfo)}` : ""}
  ${application?.employeeApplicantInfo ? `applicantInfo: ${escapeQuotes(application?.employeeApplicantInfo)}` : ""}
  ${application?.employeeAccidentInfo ? `employeeAccidentInfo: ${escapeQuotes(application?.employeeAccidentInfo)}` : ""}
  ${application?.metadata ? `metadata: ${escapeQuotes(application?.metadata)}` : ""}
  ${application?.employeeChildrenInfo ? `employeeChildrenInfo: ${escapeQuotes(application?.employeeChildrenInfo)}` : ""}
  ${application?.employeeDesignationInfo ? `employeeDesignationInfo: ${escapeQuotes(application?.employeeDesignationInfo)}` : ""}
  ${application?.isSubmitted ? `isSubmitted: "${(application?.isSubmitted)}"` : ""}
  ${application?.submittedBy ? `submittedBy: "${(application?.submittedBy)}"` : ""}
  ${application?.associationType ? `associationType: "${(application?.associationType)}"` : ""}
  ${application?.company ? `employeeEmployerId: "${(application?.company)}"` : ""}
  ${application?.factory ? `employeeFactoryId: "${(application?.factory)}"` : ""}
  ${application?.cfApplicationSummaryId ? `cfApplicationSummaryId: "${(application?.cfApplicationSummaryId)}"` : ""}
  ${application?.eisApplicationSummaryId ? `eisApplicationSummaryId: "${(application?.eisApplicationSummaryId)}"` : ""}
  ${application?.blwfApplicationSummaryId ? `blwfApplicationSummaryId: "${(application?.blwfApplicationSummaryId)}"` : ""}
`;
}
///application movement ////
export function formatApplicationMovementGQL(application) {
  return `
  ${application?.id ? `id: "${(application?.id)}"` : ""}
  ${application?.applicationId ? `applicationId: "${(application?.applicationId)}"` : ""}
  ${application?.note ? `note: "${(application?.note)}"` : ""}
  ${application?.action ? `action: "${(application?.action)}"` : ""}
  ${application?.toEmployeeRecordId ? `toEmployeeRecordId: "${(application?.toEmployeeRecordId)}"` : ""}
  ${application?.fromEmployeeRecordId ? `fromEmployeeRecordId: "${(application?.fromEmployeeRecordId)}"` : ""}
  ${application?.toOfficeUnitOrganogramId ? `toOfficeUnitOrganogramId: "${(application?.toOfficeUnitOrganogramId)}"` : ""}
  ${application?.fromOfficeUnitOrganogramId ? `fromOfficeUnitOrganogramId: "${(application?.fromOfficeUnitOrganogramId)}"` : ""}
  ${application?.toOfficeId ? `toOfficeId: "${(application?.toOfficeId)}"` : ""}
  ${application?.fromOfficeId ? `fromOfficeId: "${(application?.fromOfficeId)}"` : ""}
  ${application?.toOfficeUnitId ? `toOfficeUnitId: "${(application?.toOfficeUnitId)}"` : ""}
  ${application?.fromOfficeUnitId ? `fromOfficeUnitId: "${(application?.fromOfficeUnitId)}"` : ""}
  ${application?.isCurrent ? `isCurrent: "${(application?.isCurrent)}"` : ""}
  ${application?.isCc ? `isCc: "${(application?.isCc)}"` : ""}
  ${application?.isCommitteeHead ? `isCommitteeHead: "${(application?.isCommitteeHead)}"` : ""}
  ${application?.isCommitteeMember ? `isCommitteeMember: "${(application?.isCommitteeMember)}"` : ""}
  ${application?.toEmployeeNameBng ? `toEmployeeNameBng: "${(application?.toEmployeeNameBng)}"` : ""}
  ${application?.fromEmployeeNameBng ? `fromEmployeeNameBng: "${(application?.fromEmployeeNameBng)}"` : ""}
  ${application?.toEmployeeNameEng ? `toEmployeeNameEng: "${(application?.toEmployeeNameEng)}"` : ""}
  ${application?.fromEmployeeNameEng ? `fromEmployeeNameEng: "${(application?.fromEmployeeNameEng)}"` : ""}
  ${application?.toEmployeeDesignationBng ? `toEmployeeDesignationBng: "${(application?.toEmployeeDesignationBng)}"` : ""}
  ${application?.fromEmployeeDesignationBng ? `fromEmployeeDesignationBng: "${(application?.fromEmployeeDesignationBng)}"` : ""}
  ${application?.toOfficeNameBng ? `toOfficeNameBng: "${(application?.toOfficeNameBng)}"` : ""}
  ${application?.fromOfficeNameBng ? `fromOfficeNameBng: "${(application?.fromOfficeNameBng)}"` : ""}
  ${application?.toEmployeeUnitNameBng ? `toEmployeeUnitNameBng: "${(application?.toEmployeeUnitNameBng)}"` : ""}
  ${application?.fromEmployeeUnitNameBng ? `fromEmployeeUnitNameBng: "${(application?.fromEmployeeUnitNameBng)}"` : ""}
  ${application?.fromEmployeeUsername ? `fromEmployeeUsername: "${(application?.fromEmployeeUsername)}"` : ""}
  ${application?.deadlineDate ? `deadlineDate: "${(application?.deadlineDate)}"` : ""}
  ${application?.status ? `status: "${(application?.status)}"` : ""}
  ${application?.revertNote ? `revertNote: "${(application?.revertNote)}"` : ""}
  ${application?.isReverted ? `isReverted: "${(application?.isReverted)}"` : ""}
  ${application?.revertedById ? `revertedById: "${(application?.revertedById)}"` : ""}
  ${application?.revertingDate ? `revertingDate: "${(application?.revertingDate)}"` : ""}
`;
}
///beneficiary registration   ////
export function formatWorkforceBeneficiaryGQL(beneficiary) {
  return `
  ${beneficiary?.id ? `id: "${(beneficiary?.id)}"` : ""}
  ${beneficiary.lastName ? `lastName: "${(beneficiary.lastName)}"` : ""}
  ${beneficiary.loginName ? `loginName: "${decodeId(beneficiary.loginName)}"` : ""}
  ${beneficiary.otherNames ? `otherNames: "${formatGQLString(beneficiary.otherNames)}"` : ""}
  ${beneficiary.applicationType ? `applicationType: "${formatGQLString(beneficiary.applicationType)}"` : ""}
  ${beneficiary.status ? `status: "${WORKFORCE_STATUS.ACTIVE}"` : ""}
  ${beneficiary.employeeDependentInfo ? `employeeDependentInfo: ${escapeQuotes(beneficiary.employeeDependentInfo)}` : ""}
  ${beneficiary.employeeBankInfo ? `employeeBankInfo: ${escapeQuotes(beneficiary.employeeBankInfo)}` : ""}
  ${beneficiary.employeeAccidentInfo ? `employeeAccidentInfo: ${escapeQuotes(beneficiary.employeeAccidentInfo)}` : ""}
  ${beneficiary.employeeDesignationInfo ? `employeeDesignationInfo: ${escapeQuotes(beneficiary.employeeDesignationInfo)}` : ""}
  ${beneficiary.isSubmitted ? `isSubmitted: "${(beneficiary.isSubmitted)}"` : ""}
`;
}

function escapeQuotes(data) {
  // Check if it's a string and needs escaping
  if (typeof data === "string") {
    return `"${data.replace(/"/g, "\\\"")}"`;
  }
  // If it's not a string, stringify it properly
  return `"${JSON.stringify(data).replace(/"/g, "\\\"")}"`;
}

export function formatEmployeeDependentGQL(employee) {
  return `
    ${employee?.id ? `id: "${formatGQLString(employee?.id)}"` : ""}
    ${employee.firstNameBn ? `firstNameBn: "${formatGQLString(employee.firstNameBn)}"` : ""}
    ${employee.lastNameBn ? `lastNameBn: "${formatGQLString(employee.lastNameBn)}"` : ""}
    ${employee.firstNameEn ? `firstNameEn: "${formatGQLString(employee.firstNameEn)}"` : ""}
    ${employee.lastNameEn ? `lastNameEn: "${formatGQLString(employee.lastNameEn)}"` : ""}
    ${employee.phoneNumber ? `phoneNumber: "${formatGQLString(employee.phoneNumber)}"` : ""}
    ${employee.email ? `email: "${formatGQLString(employee.email)}"` : ""}
    ${employee.birthDate ? `birthDate: "${employee.birthDate}"` : ""}
    ${employee.deathDate ? `deathDate: "${employee.deathDate}"` : ""}
    ${employee.gender ? `gender: "${employee.gender}"` : ""}
    ${employee.birthCertificateNo ? `birthCertificateNo: "${employee.birthCertificateNo}"` : ""}
    ${employee.nid ? `nid: "${employee.nid}"` : ""}
    ${employee.permanentAddress ? `permanentAddress: "${employee.permanentAddress}"` : ""}
    ${employee.presentAddress ? `presentAddress: "${employee.presentAddress}"` : ""}
    ${employee.fatherNameBn ? `fatherNameBn: "${employee.fatherNameBn}"` : ""}
    ${employee.fatherNameEn ? `fatherNameEn: "${employee.fatherNameEn}"` : ""}
    ${employee.motherNameBn ? `motherNameBn: "${employee.motherNameBn}"` : ""}
    ${employee.motherNameEn ? `motherNameEn: "${employee.motherNameEn}"` : ""}
    ${employee.maritalStatus ? `maritalStatus: "${employee.maritalStatus}"` : ""}
    ${employee.occupation ? `occupation: "${employee.occupation}"` : ""}
    ${employee.relationType ? `relationType: "${employee.relationType}"` : ""}
    ${employee.relationWithWorker ? `relationWithWorker: "${employee.relationWithWorker}"` : ""}
    ${employee.presentLocation.id ? `presentLocationId: "${decodeId(employee.presentLocation.id)}"` : ""}
    ${employee.permanentLocation.id ? `permanentLocationId: "${decodeId(employee.permanentLocation.id)}"` : ""}
    ${employee.status ? `status: "${employee.status}"` : ""}
    ${employee.lifeStatus ? `lifeStatus: "${employee.lifeStatus}"` : ""}
  `;
}

export function formatWorkforceEmployeeAccidentInfoGQL(employee) {
  return `
    ${employee.injuryType ? `injuryType: "${formatGQLString(employee.injuryType)}"` : ""}
    ${employee.accidentDate ? `accidentDate: "${formatGQLString(employee.accidentDate)}"` : ""}
    ${employee.accidentPlace ? `accidentPlace: "${formatGQLString(employee.accidentPlace)}"` : ""}
    ${employee.accidentTime ? `accidentTime: "${employee.accidentTime}"` : ""}
    ${employee.accidentType ? `accidentType: "${employee.accidentType}"` : ""}
    ${employee.dutyStatus ? `dutyStatus: "${employee.dutyStatus}"` : ""}
    ${employee.inOutsideFactory ? `inOutsideFactory: "${employee.inOutsideFactory}"` : ""}
    ${employee.description ? `description: "${employee.description}"` : ""}
  `;
}

export function formatWorkforceEmployeeAccountInfoGQL(employee) {
  return `
    ${employee.beneficiaryType ? `beneficiaryType: "${formatGQLString(employee.beneficiaryType)}"` : ""}
    ${employee.beneficiaryId ? `beneficiaryId: "${formatGQLString(employee.beneficiaryId)}"` : ""}
    ${employee.onBehalfOf ? `onBehalfOf: "${formatGQLString(employee.onBehalfOf)}"` : ""}
    ${employee.accountHolderName ? `accountHolderName: "${employee.accountHolderName}"` : ""}
    ${employee.accountNumber ? `accountNumber: "${employee.accountNumber}"` : ""}
    ${employee.status ? `status: "${employee.status}"` : ""}
 
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
export function formatFactoryEmployeeAssignDesignationGQL(employeeAssignDesignation) {

  return `
    ${employeeAssignDesignation?.id ? `id: "${employeeAssignDesignation?.id}"` : ""}
    ${employeeAssignDesignation?.workforceEmployeeId ? `workforceEmployeeId: "${employeeAssignDesignation?.workforceEmployeeId}"` : ""}
    ${employeeAssignDesignation?.status ? `status: "${employeeAssignDesignation?.status}"` : ""}
    ${employeeAssignDesignation?.position ? `position: "${employeeAssignDesignation?.position}"` : ""}
    ${employeeAssignDesignation?.resignatioDate ? `resignationDate: "${employeeAssignDesignation?.resignatioDate}"` : ""}
    ${employeeAssignDesignation?.resignatioReason ? `resignationReason: "${employeeAssignDesignation?.resignatioReason}"` : ""}
    ${employeeAssignDesignation?.joiningDate ? `joinDate: "${formatGQLString(employeeAssignDesignation?.joiningDate)}"` : ""}
    ${employeeAssignDesignation?.workforceCompany ? `workforceCompanyId: "${employeeAssignDesignation?.workforceCompany}"` : ""}
  `;
}
 

export function formatWorkforceOtpGQL(workforceOtp) {

  return `
    ${workforceOtp.firstNameBn ? `nameBn: "${formatGQLString(workforceOtp.firstNameBn)}"` : ""}
    ${workforceOtp.firstNameEn ? `firstNameEn: "${formatGQLString(workforceOtp.firstNameEn)}"` : ""}
    ${workforceOtp.lastNameEn ? `lastNameEn: ""` : ""}
    ${workforceOtp.NID ? `nid: "${formatGQLString(workforceOtp.NID)}"` : ""}
    ${workforceOtp.mobile ? `phoneNumber: "${formatGQLString(workforceOtp.mobile)}"` : ""}
    ${workforceOtp.status ? `status: "${WORKFORCE_STATUS.ACTIVE}"` : ""}
  `;
}
export function formatWorkforceDocumentGQL(workforceDocumentType) {

  return `
    ${workforceDocumentType?.id ? `id: "${workforceDocumentType?.id}"` : ""}
    ${workforceDocumentType?.workforceApplicationId ? `workforceApplicationId: "${workforceDocumentType?.workforceApplicationId}"` : ""}
    ${workforceDocumentType?.factoryId ? `factoryId: "${workforceDocumentType?.factoryId}"` : ""}
    ${workforceDocumentType?.workforceDependentId ? `workforceDependentId: "${workforceDocumentType?.workforceDependentId}"` : ""}
    ${workforceDocumentType?.workforceDocumentTypeId ? `workforceDocumentTypeId: "${workforceDocumentType?.workforceDocumentTypeId}"` : ""}
    ${workforceDocumentType?.path ? `path: "${workforceDocumentType?.path}"` : ""}
    ${workforceDocumentType?.url ? `url: "${workforceDocumentType?.url}"` : ""}

    ${workforceDocumentType?.documentType ? `documentType: "${formatGQLString(workforceDocumentType?.documentType)}"` : ""}
    ${workforceDocumentType?.holderType ? `holderType: "${workforceDocumentType?.holderType}"` : ""}
    ${workforceDocumentType?.holder ? `holder: "${formatGQLString(workforceDocumentType?.holder)}"` : ""}
    ${workforceDocumentType?.verifierId ? `verifierId: "${formatGQLString(workforceDocumentType?.verifierId)}"` : ""}
    ${workforceDocumentType?.approverId ? `approverId: "${formatGQLString(workforceDocumentType?.approverId)}"` : ""}
    ${workforceDocumentType?.submissionDate ? `submissionDate: "${formatGQLString(workforceDocumentType?.submissionDate)}"` : ""}
    ${workforceDocumentType?.approvalDate ? `approvalDate: "${formatGQLString(workforceDocumentType?.approvalDate)}"` : ""}
    ${workforceDocumentType?.remarks ? `remarks: "${formatGQLString(workforceDocumentType?.remarks)}"` : ""}
    ${workforceDocumentType?.status ? `status: "${formatGQLString(workforceDocumentType?.status)}"` : ""}
    ${workforceDocumentType?.note ? `note: "${formatGQLString(workforceDocumentType?.note)}"` : ""}
  `;
}

export function formatWorkforceCompanyStatusGql(company) {
  return `
    ${company?.id ? `id: "${formatGQLString(company?.id)}"` : ""}
    ${company?.status ? `status: "${company.status}"` : ""}
  `;
}