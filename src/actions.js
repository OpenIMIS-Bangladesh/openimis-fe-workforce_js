import {
  graphql,
  formatMutation,
  formatPageQueryWithCount,
  formatPageQuery,
  formatQuery,
  graphqlWithVariables
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
  formatEmployeeAssignDesignationGQL,
  formatWorkforceCompanyStatusGql,
  formatBankGQL,
  formatEmployeeDependentGQL,
  formatWorkforceEmployeeAccountInfoGQL,
  formatWorkforceEmployeeAccidentInfoGQL,
  formatApplicationeGQL,
  formatWorkforceBeneficiaryGQL,
  formatWorkforceOtpGQL,
  formatApplicationMovementGQL,
  formatFactoryEmployeeAssignDesignationGQL,
  formatApplicationSummaryGQL,
  formatWorkforceDocumentGQL,
  formatEducationInfoGQL
} from "./utils/format_gql";
import { WORKFORCE_STATUS } from "./constants";

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
    "type",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS");
}

export function fetchOrganizationsPick(filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_PICKER");
}
export function fetchDocumentType(mm, filters) {
  const projections = [
    "id",
    "fieldId",
    "applicationType",
    "documentType",
    "applicationFor",
    "organizationType",
    "status",
    "nameEn",
    "nameBn",
    "mandatoryForApplicant"
  ];
  const payload = formatPageQueryWithCount(
    "workforceDocumentTypes",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_DOCUMENT_TYPE");
}

/// bank picker ///
export function fetchBanksPick(mm, filters) {
  const projections = ["id", "nameEn", "nameBn", "parent{id},bankCode,routingNumber"];
  const payload = formatPageQuery("workforceBanks", filters, projections);
  return graphql(payload, "WORKFORCE_BANKS_PICKER");
}

export function fetchWorkforceOtp(mm, filters) {
  const projections = ["status", "nameBn", "firstNameEn", "phoneNumber"];
  const payload = formatQuery("workforceOtp", filters, projections);
  return graphql(payload, "WORKFORCE_OTP");
}

export function fetchBranchPick(mm, filters) {
  const projections = ["id", "nameEn","nameBn", "parent{id},bankCode,routingNumber","districtCode","districtNameEn","districtNameBn"];
  const payload = formatPageQuery("workforceBanks", filters, projections);
  return graphql(payload, "WORKFORCE_BRANCH_PICKER");
}
export function fetchDistrictBanksPick(mm, filters) {
  const projections = ["id", "nameEn","nameBn", "parent{id},bankCode,routingNumber","districtCode","districtNameEn","districtNameBn"];
  const payload = formatPageQuery("workforceBanks", filters, projections);
  return graphql(payload, "WORKFORCE_DISTRICT_BANKS_PICKER");
}

export function fetchOrganizationUnitsPick(mm, filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnits",
    filters,
    projections
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
    projections
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
    projections
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
    "designations{id,joiningDate,releaseDate,designation{unit{id,organization{id,nameBn}nameBn,unitDesignations{id,nameBn}}}}",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationEmployees",
    filters,
    projections
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
    "designations{id,joiningDate,releaseDate,designation{unit{id,organization{id,nameBn}nameBn,unitDesignations{id,nameBn}}}}",
    location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationEmployees",
    filters,
    projections
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
    projections
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
    location_projection +
    "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerOffices",
    filters,
    projections
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
    "associationType",
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
    projections
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
    "associationType",
    "phoneNumber",
    "email",
    "status",
    "website",
    location_projection,
    "workforceEmployer{id}",
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " +
    location_projection +
    "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerFactories",
    filters,
    projections
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
    projections
  );
  return graphql(payload, "WORKFORCE_COMPANIES");
}

export function fetchCompaniesPick(filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_COMPANIES_PICKER");
}

export function fetchDistrictOfficePick(mm, filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_DISTRICT_OFFICE_PICKER");
}

export function fetchEmployeePick(filters) {
  // const location_projection =
  // "location" + mm.getProjection("location.Location.FlatProjection");
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
    // location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationEmployees",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEE_PICKER");
}

export function fetchOfficesPick(filters) {
  const projections = ["id", "nameEn", "nameBn"];
  const payload = formatPageQueryWithCount(
    "workforceEmployerOffices",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_OFFICES_PICKER");
}

export function fetchFactoriesPick(filters) {
  const projections = ["id", "nameEn", "nameBn", "workforceEmployer{id}"];
  const payload = formatPageQueryWithCount(
    "workforceEmployerFactories",
    filters,
    projections
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
    location_projection +
    "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections
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
    "workforceRepresentative { id,nameBn,nameEn,position,email,phoneNumber,nid,birthDate, passportNo, address, " +
    location_projection +
    "}",
    "factories {id,nameBn,nameEn,address,phoneNumber,email,website,status, " +
    location_projection +
    "}",
    "offices {id,nameBn,nameEn,address,phoneNumber,email,website,status, " +
    location_projection +
    "}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployers",
    filters,
    projections
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
    "lifeStatus",
    "deathDate",
    "relatedUser{id}",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerEmployees",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES");
}

export function fetchDependentsSummary(mm, filters) {
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
    "phoneNumber",
    "email",
    "maritalStatus",
    "gender",
    "occupation",
    "birthDate",
    "nid",
    "lifeStatus",
    "relationType",
    "relationWithWorker",
    "status",
    // "permanentAddress",
    // "presentAddress",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeDependent",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES_DEPENDENTS");
}

export function fetchServicesSummary(mm, filters) {
  const projections = [
    "id",
    "workforceCompany{id}",
    "workforceFactory{id}",
    "workforceOffice{id}",
    "position",
    "joinDate",
    "resignationDate",
    "resignationReason",
    "monthlySalary",
    "status",
    "workforceEmployee{id,firstNameEn,firstNameBn,lastNameEn,lastNameBn}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeDesignation",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES_SERVICES");
}

export function fetchAccidentInfosSummary(mm, filters) {
  const projections = [
    "id",
    "injuryType",
    "accidentDate",
    "accidentPlace",
    "accidentTime",
    "accidentType",
    "dutyStatus",
    "inOutsideFactory",
    "description",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeAccident",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES_ACCIDENTS");
}

export function fetchAccidentInfo(mm, filters) {
  const projections = [
    "id",
    "injuryType",
    "accidentDate",
    "accidentTime",
    "accidentType",
    "dutyStatus",
    "inOutsideFactory",
    "deathDate",
    "description",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeAccident",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES_ACCIDENT");
}

export function fetchAccountInfosSummary(mm, filters) {
  const present_location_projection =
    "presentLocation" + mm.getProjection("location.Location.FlatProjection");
  const permanent_location_projection =
    "permanentLocation" + mm.getProjection("location.Location.FlatProjection");

  const projections = [
    "id",
    "beneficiaryType",
    "beneficiaryId",
    "onBehalfOf",
    "accountHolderName",
    "accountNumber",
    "status",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeAccountInfo",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES_ACCOUNTS");
}

export function fetchAccountInfo(mm, filters) {
  const present_location_projection =
    "presentLocation" + mm.getProjection("location.Location.FlatProjection");
  const permanent_location_projection =
    "permanentLocation" + mm.getProjection("location.Location.FlatProjection");

  const projections = [
    "id",
    "beneficiaryType",
    "beneficiaryId",
    "onBehalfOf",
    "accountHolderName",
    "accountNumber",
    "status",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeAccountInfo",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES_ACCOUNT");
}

export function fetchApplicationsSummary(mm, filters) {
  const present_location_projection =
    "presentLocation" + mm.getProjection("location.Location.FlatProjection");
  const permanent_location_projection =
    "permanentLocation" + mm.getProjection("location.Location.FlatProjection");

  const projections = [
    "id",
    "workforceEmployee{" +
    present_location_projection +
    permanent_location_projection +
    "id,firstNameBn,lastNameBn,firstNameEn,lastNameEn,otherName,phoneNumber,email,status,gender,birthCertificateNo,nid,passportNo,permanentAddress,presentAddress,position,monthlyEarning,fatherNameBn,fatherNameEn,motherNameBn,motherNameEn,spouseNameBn,spouseNameEn,maritalStatus,citizenship,privacyLaw,insuranceNumber,birthDate,employeeType,lifeStatus,deathDate,relatedUser{id}}",
    "applicantInfo",   
    "dateCreated",
    "organizationType",
    "applicationType",
    "status",
    "employeeFactory{id,nameEn,nameBn}",
    "trackingNumber",
    "employeeDependentInfo",
    "employeeBankInfo",
    "employeeAccidentInfo",
    "employeeChildrenInfo",
    "institutionInfo",
    "metadata",
    "educations{edges{node{id,childNameEn,childNameBn}}}",
    "cfApplicationSummary{id}",
    "eisApplicationSummary{id}",
    "blwfApplicationSummary{id}",
    "grantMoney {id,grantMoney,applicationTypeNameEn,applicationTypeNameBn}",
    "grantAmount",
    "submittedBy",
    "associationType",
    "applicationFor"
  ];
  const payload = formatPageQueryWithCount(
    "workforceApplication",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_APPLICATIONS");
}
export function fetchSummaryApplications(mm, filters) {
  const projections = [
    "id",
    "dateCreated",
    "organizationType",
    "applicationData",
    "status",
    "name",
    "meetingDate",
    "month",
    "year",
    "sectionType",
  ];
  const payload = formatPageQueryWithCount(
    "workforceApplicationSummary",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_APPLICATIONS_SUMMARY");
}

export function fetchApplication(mm, filters) {
  const present_location_projection =
    "presentLocation" + mm.getProjection("location.Location.FlatProjection");
  const permanent_location_projection =
    "permanentLocation" + mm.getProjection("location.Location.FlatProjection");

  const projections = [
    "id",
    "workforceEmployee{" + present_location_projection + permanent_location_projection + ",id,firstNameBn,lastNameBn,firstNameEn,lastNameEn,otherName,phoneNumber,email,status,gender,birthCertificateNo,nid,passportNo,permanentAddress,presentAddress,position,monthlyEarning,fatherNameBn,fatherNameEn,motherNameBn,motherNameEn,spouseNameBn,spouseNameEn,maritalStatus,citizenship,privacyLaw,insuranceNumber,birthDate,employeeType,lifeStatus,deathDate,relatedUser{id}}",
    "applicantInfo",   
    "organizationType",
    "dateCreated",
    "applicationType",
    "status",
    "trackingNumber",
    "employeeDependentInfo",
    "employeeBankInfo",
    "employeeAccidentInfo",
    "employeeChildrenInfo",
    "institutionInfo",
    "educations{edges{node{id,childNameEn,childNameBn,childBirthDate,childBirthCertificateNo,childNidNo,studyClass,institution,educationLevel,educationBoard,passingYear,rollNumber,registrationNumber,result}}}",
    "workforceEmployeeDependentApplication{edges{node{id,nameBn,nameEn,fatherNameBn,fatherNameEn,motherNameBn,motherNameEn,nid,birthDate,percentageOfCfGrant,phoneNumber,presentLocation {id},presentAddress,permanentLocation {id},permanentAddress}}}",
    "metadata",
    "employeeFactory{id}",
    "cfApplicationSummary{id}",
    "eisApplicationSummary{id}",
    "blwfApplicationSummary{id}",
    "grantAmount",
    "grantMoney {id,grantMoney,applicationTypeNameEn,applicationTypeNameBn}",
    "submittedBy",
    "associationType",
    "applicationFor"
  ];
  // const filterArray = filters
  //   ? Object.entries(filters).map(([key, value]) => `${key}: "${value}"`)
  //   : [];

  const payload = formatPageQueryWithCount(
    "workforceApplication",
    filters,
    projections
  );

  return graphql(payload, "WORKFORCE_APPLICATION");
}
export function fetchWorkforceUserRoleWiseUser(mm, variables) {
  return graphqlWithVariables(
    `
      query ($roleIds: [String!], $orderBy: [String]) {
        workforceUserRole(roleIdIn: $roleIds, orderBy: $orderBy) {
          id
          roleId
          userId
          lastName
          otherNames
        }
      }
    `,
    variables,
["ADMIN_WORKFORCE_ROLE_WISE_USERS_REQ", "ADMIN_WORKFORCE_ROLE_WISE_USERS_RESP", "ADMIN_WORKFORCE_ROLE_WISE_USERS_ERR"]
  );
}

export function fetchApplicationWiseMovementList(mm, variables) {
  return graphqlWithVariables(
    `
      query ($applicationId: String) {
        workforceApplicationMovement(applicationId: $applicationId) {
          edges {
            node {
              id
              status
              revertNote
              dateCreated
              applicationFrom {
                id
                lastName
                otherNames
                loginName
              }
              applicationTo {
                id
                lastName
                otherNames
                loginName
                userRoles {
                  role {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables,
    [
      "WORKFORCE_APPLICATIONS_MOVEMENT_REQ",
      "WORKFORCE_APPLICATIONS_MOVEMENT_RESP",
      "WORKFORCE_APPLICATIONS_MOVEMENT_ERR",
    ]
  );
}


export function fetchApplicationMovementsSummary(mm, filters) {
  const projections = [
    "id",
    "applicationId",
    "note",
    "action",
    "toEmployeeRecordId",
    "fromEmployeeRecordId",
    "toOfficeUnitOrganogramId",
    "fromOfficeUnitOrganogramId",
    "toOfficeId",
    "fromOfficeId",
    "toOfficeUnitId",
    "fromOfficeUnitId",
    "isCurrent",
    "isCc",
    "isCommitteeHead",
    "isCommitteeMember",
    "toEmployeeNameBng",
    "fromEmployeeNameBng",
    "toEmployeeNameEng",
    "fromEmployeeNameEng",
    "toEmployeeDesignationBng",
    "fromEmployeeDesignationBng",
    "toOfficeNameBng",
    "fromOfficeNameBng",
    "toEmployeeUnitNameBng",
    "fromEmployeeUnitNameBng",
    "fromEmployeeUsername",
    "deadlineDate",
    "status",
    "revertNote",
    "isReverted",
    "revertedById",
    "revertingDate",
    "applicationFromId",
    "applicationToId",
    "toRoleId",
    "fromRoleId",
    "fromOfficeDesignationId",
    "toOfficeDesignationId",
  ];
  const payload = formatPageQueryWithCount(
    "workforceApplicationMovement",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_APPLICATION_MOVEMENTS");
}

export function fetchApplicationMovement(mm, filters) {
  const projections = [
    "id",
    "applicationId",
    "note",
    "action",
    "toEmployeeRecordId",
    "fromEmployeeRecordId",
    "toOfficeUnitOrganogramId",
    "fromOfficeUnitOrganogramId",
    "toOfficeId",
    "fromOfficeId",
    "toOfficeUnitId",
    "fromOfficeUnitId",
    "isCurrent",
    "isCc",
    "isCommitteeHead",
    "isCommitteeMember",
    "toEmployeeNameBng",
    "fromEmployeeNameBng",
    "toEmployeeNameEng",
    "fromEmployeeNameEng",
    "toEmployeeDesignationBng",
    "fromEmployeeDesignationBng",
    "toOfficeNameBng",
    "fromOfficeNameBng",
    "toEmployeeUnitNameBng",
    "fromEmployeeUnitNameBng",
    "fromEmployeeUsername",
    "deadlineDate",
    "status",
    "revertNote",
    "isReverted",
    "revertedById",
    "revertingDate",
    "applicationFromId",
    "applicationToId",
  ];
  const payload = formatPageQueryWithCount(
    "workforceApplicationMovement",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_APPLICATION_MOVEMENT");
}

export function fetchApplicationPackage(mm, filters) {

  const projections = [
    "id",
    "applicationData",
    "meetingDate",
    "status",
    "name",
    "remarks",
    "year",
    "month",
    "organizationType",
    "sectionType",
  ];
  const payload = formatPageQueryWithCount(
    "workforceApplicationSummary",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_APPLICATION_SUMMARY");
}

export function fetchDiseases(mm, filters) {
  const projections = [
    "id",
    "grade",
    "diseaseType",
    "diseaseName",
    "diseaseNo",
    "minimumDonationAmount",
    "maximumDonationAmount",
    "status",
  ];
  const payload = formatPageQueryWithCount(
    "workforceDiseases",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_DISEASES");
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
    "lifeStatus",
    "deathDate",
    "relatedUser{id}",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerEmployees",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEE");
}

export function fetchDependent(mm, filters) {
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
    "phoneNumber",
    "email",
    "maritalStatus",
    "gender",
    "occupation",
    "birthDate",
    "nid",
    "lifeStatus",
    "relationType",
    "relationWithWorker",
    "status",
    present_location_projection,
    permanent_location_projection,
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeDependent",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEE_DEPENDENT");
}

export function fetchService(mm, filters) {
  const projections = [
    "id",
    "workforceCompany{id}",
    "workforceFactory{id}",
    "workforceOffice{id}",
    "position",
    "joinDate",
    "resignationDate",
    "resignationReason",
    "monthlySalary",
    "status",
    "workforceEmployee{id,firstNameEn,firstNameBn,lastNameEn,lastNameBn}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeDesignation",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEES_SERVICE");
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
    }
  );
}

export function updateRepresentative(representativeData, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceRepresentative",
    formatRepresentativeGQL(representativeData),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_MUTATION_REQ", "ORG_UPDATE_ORG_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createWorkforceOrganization(organization, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganization",
    formatOrganizationGQL(organization),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_MUTATION_REQ", "ORG_CREATE_ORG_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateWorkforceOrganization(
  representative,
  clientMutationLabel
) {
  const mutation = formatMutation(
    "updateWorkforceOrganization",
    formatOrganizationGQL(representative),
    clientMutationLabel
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
    }
  );
}

///registration actions///
export function createWorkforceOtp(workforceOtp, clientMutationLabel) {
  const mutation = `mutation {
  createWorkforceOtp(
    nameBn: "${workforceOtp.firstNameBn}",
    firstNameEn: "${workforceOtp.firstNameEn}",
    lastNameEn: "",
    nid: "${workforceOtp?.NID}",
    birthCertificateNo: "${workforceOtp?.birthCertificateNo}",
    phoneNumber: "${workforceOtp.mobile}",
    status: "${WORKFORCE_STATUS.ACTIVE}"
  ) {
    internalId
  }
}`;
  // const mutation = formatMutation(
  //   "createWorkforceOtp",
  //   formatWorkforceOtpGQL(workforceOtp),
  //   clientMutationLabel,
  // );
  const requestedDateTime = new Date();
  return graphql(
    mutation,
    ["OTP_MUTATION_REQ", "OTP_CREATE_OTP_RESP", "OTP_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createWorkforceUser(workforceUser, clientMutationLabel) {
  const mutation = `mutation {
  createWorkforceUser(
    nameBn: "${workforceUser.firstNameBn}",
    firstNameEn: "${workforceUser.firstNameEn}",
    lastNameEn: " ",
    nid: "${workforceUser?.NID || ""}",
    birthCertificateNo: "${workforceUser?.birthCertificateNo || ""}",
    phoneNumber: "${workforceUser.mobile}",
    status: "${WORKFORCE_STATUS.ACTIVE}",
    username: "",
    password: "${workforceUser?.password}",
  ) {
    internalId
  }
}`;
  const requestedDateTime = new Date();
  return graphql(
    mutation,
    ["USER_MUTATION_REQ", "USER_CREATE_USER_RESP", "USER_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function fetchWorkforceDocument(mm, filters) {
  const projections = [
    "id",
    "path",
    "url",
    "status",
    "documentType",
    "holderType",
    "holder",
    "note",
    "workforceApplication{id}",
    "workforceDocumentType{id,nameBn,nameEn,documentType,mandatoryForApplicant,formStepNo,fieldId}",

  ];
  const payload = formatPageQueryWithCount(
    "workforceDocuments",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_DOCUMENT");
}

export function createWorkforceDocument(
  workforceDocumentType,
  clientMutationLabel
) {
  const mutation = formatMutation(
    "createWorkforceDocument",
    formatWorkforceDocumentGQL(workforceDocumentType),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "DOCUMENT_MUTATION_REQ",
      "DOCUMENT_CREATE_DOCUMENT_RESP",
      "DOCUMENT_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateWorkforceDocument(
  workforceDocumentType,
  clientMutationLabel
) {
  const mutation = formatMutation(
    "updateWorkforceDocument",
    formatWorkforceDocumentGQL(workforceDocumentType),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "DOCUMENT_MUTATION_REQ",
      "DOCUMENT_UPDATE_DOCUMENT_RESP",
      "DOCUMENT_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createWorkforceOrganizationUnit(unit, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganizationUnit",
    formatUnitGQL(unit),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["ORG_UNIT_MUTATION_REQ", "ORG_UNIT_CREATE_RESP", "ORG_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateWorkforceOrganizationUnit(unit, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationUnit",
    formatUnitGQL(unit),
    clientMutationLabel
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
    }
  );
}

export function createOrganizationEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganizationEmployee",
    formatOrganizationEmployeeGQL(employee),
    clientMutationLabel
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
    }
  );
}

export function updateOrganizationEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationEmployee",
    formatOrganizationEmployeeGQL(employee),
    clientMutationLabel
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
    }
  );
}

export function createWorkforceOffice(office, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployerOffice",
    formatWorkforceOfficeGQL(office),
    clientMutationLabel
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
    }
  );
}

export function updateWorkforceOffice(office, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerOffice",
    formatWorkforceOfficeGQL(office),
    clientMutationLabel
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
    }
  );
}

export function createWorkforceCompany(company, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployer",
    formatWorkforceCompanyGQL(company),
    clientMutationLabel
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
    }
  );
}

export function createWorkforceFactory(factory, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployerFactory",
    formatWorkforceFactoryGQL(factory),
    clientMutationLabel
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
    }
  );
}

export function updateWorkforceFactory(factory, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerFactory",
    formatWorkforceFactoryGQL(factory),
    clientMutationLabel
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
    }
  );
}

export function createWorkforceBeneficiary(beneficiary, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceBeneficiary",
    formatWorkforceBeneficiaryGQL(beneficiary),
    clientMutationLabel
  );
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
    }
  );
}
export function createWorkforceEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployerEmployee",
    formatWorkforceEmployeeGQL(employee),
    clientMutationLabel
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
    }
  );
}

export function updateWorkforceEmployee(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerEmployee",
    formatWorkforceEmployeeGQL(employee),
    clientMutationLabel
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
    }
  );
}

export function createAccidentInfo(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployeeAccident",
    formatWorkforceEmployeeAccidentInfoGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_EMPLOYEES_ACCIDENT_REQ",
      "WORKFORCE_EMPLOYEES_ACCIDENT_RESP",
      "WORKFORCE_EMPLOYEES_ACCIDENT_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateAccidentInfo(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployeeAccident",
    formatWorkforceEmployeeAccidentInfoGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_EMPLOYEES_ACCIDENT_REQ",
      "WORKFORCE_EMPLOYEES_ACCIDENT_RESP",
      "WORKFORCE_EMPLOYEES_ACCIDENT_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employee.id,
    }
  );
}

export function createAccountInfo(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployeeAccountInfo",
    formatWorkforceEmployeeAccountInfoGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_EMPLOYEES_ACCOUNT_REQ",
      "WORKFORCE_EMPLOYEES_ACCOUNT_RESP",
      "WORKFORCE_EMPLOYEES_ACCOUNT_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateAccountInfo(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployeeAccountInfo",
    formatWorkforceEmployeeAccountInfoGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_EMPLOYEES_ACCOUNT_REQ",
      "WORKFORCE_EMPLOYEES_ACCOUNT_RESP",
      "WORKFORCE_EMPLOYEES_ACCOUNT_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employee.id,
    }
  );
}

export function createEmployeeDependent(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployeeDependent",
    formatWorkforceEmployeeGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "EMPLOYEE_DEPENDENT_MUTATION_REQ",
      "EMPLOYEE_DEPENDENT_CREATE_EMPLOYEE_DEPENDENT_RESP",
      "EMPLOYEE_DEPENDENT_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateEmployeeDependent(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployeeDependent",
    formatEmployeeDependentGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "EMPLOYEE_DEPENDENT_MUTATION_REQ",
      "EMPLOYEE_DEPENDENT_UPDATE_EMPLOYEE_DEPENDENT_RESP",
      "EMPLOYEE_DEPENDENT_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employee.id,
    }
  );
}

export function createEmployeeService(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEmployeeService",
    formatWorkforceEmployeeGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "EMPLOYEE_SERVICE_MUTATION_REQ",
      "EMPLOYEE_SERVICE_CREATE_EMPLOYEE_SERVICE_RESP",
      "EMPLOYEE_SERVICE_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateEmployeeService(employee, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployeeService",
    formatEmployeeDependentGQL(employee),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "EMPLOYEE_SERVICE_MUTATION_REQ",
      "EMPLOYEE_SERVICE_UPDATE_EMPLOYEE_SERVICE_RESP",
      "EMPLOYEE_SERVICE_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employee.id,
    }
  );
}

export function updateWorkforceCompany(company, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployer",
    formatWorkforceCompanyGQL(company),
    clientMutationLabel
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
    }
  );
}

export function updateStatusOfWorkforceCompany(company, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceEmployerStatus",
    formatWorkforceCompanyStatusGql(company),
    clientMutationLabel
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
    }
  );
}

////unit designation update /////////
export function createUnitDesignation(unitDesignation, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceOrganizationUnitDesignation",
    formatUnitDesignationGQL(unitDesignation),
    clientMutationLabel
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
    }
  );
}

export function updateUnitDesignation(unitDesignation, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationUnitDesignation",
    formatUnitDesignationGQL(unitDesignation),
    clientMutationLabel
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
    }
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
    projections
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
    projections
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
    projections
  );
  return graphql(payload, "WORKFORCE_ORGANIZATION_UNIT_DESIGNATION");
}

///fetching workforce factory employee////
export function fetchFactoryEmployee(mm, filters) {
  const projections = [
    "id",
    "employeeDesignationEmployeeId{edges{node{id,workforceFactory{id}}}}",
    // "workforceOffice{id}",
    // "workforceFactory{id}",
    // "workforceRepresentative{id}",
    // "workforceApplication{id}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployerEmployees",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEE");
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
    projections
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_EMPLOYEE_DESIGNATIONS");
}

export function updateWorkforceOrganizationEmployeeDesignation(
  employeeDesignation,
  clientMutationLabel
) {
  const mutation = formatMutation(
    "updateWorkforceOrganizationEmployeeDesignation",
    formatEmployeeDesignationGQL(employeeDesignation),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "EMPLOYEE_DESIGNATION_MUTATION_REQ",
      "EMPLOYEE_DESIGNATION_MUTATION_ERR",
      "EMPLOYEE_DESIGNATION_UPDATE_RELEASE_RESP",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employeeDesignation.id,
    }
  );
}

export function updateWorkforceOrganizationEmployeeAssignDesignation(
  employeeAssignDesignation,
  clientMutationLabel
) {
  const mutation = formatMutation(
    "createWorkforceOrganizationEmployeeDesignation",
    formatEmployeeAssignDesignationGQL(employeeAssignDesignation),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_REQ",
      "EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_ERR",
      "EMPLOYEE_DESIGNATION_UPDATE_ASSIGN_RESP",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employeeAssignDesignation.id,
    }
  );
}

export function updateWorkforceEmployeeAssignDesignation(
  employeeAssignDesignation,
  clientMutationLabel
) {
  const mutation = formatMutation(
    "updateWorkforceEmployeeDesignation",
    formatFactoryEmployeeAssignDesignationGQL(employeeAssignDesignation),
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "WORKFORCE_ EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_REQ",
      "WORKFORCE_ EMPLOYEE_ASSIGN_DESIGNATION_MUTATION_ERR",
      "WORKFORCE_ EMPLOYEE_DESIGNATION_UPDATE_ASSIGN_RESP",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      id: employeeAssignDesignation.id,
    }
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
    location_projection,
  ];
  const payload = formatPageQueryWithCount("banks", filters, projections);
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
    "type",
    location_projection,
  ];
  const payload = formatPageQueryWithCount("banks", filters, projections);
  return graphql(payload, "WORKFORCE_BANK");
}
export function fetchEmployeeDependent(mm, filters) {
  const location_projection =
    "location" + mm.getProjection("location.Location.FlatProjection");
  const projections = [
    "id",
    "nameBn",
        "nameEn"
  ];
  const payload = formatPageQueryWithCount("workforceEmployeeDependent", filters, projections);
  return graphql(payload, "WORKFORCE_DEPENDENT");
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
    location_projection,
    // "workforceRepresentative { id,nameBn,nameEn,position,email,nid,address,phoneNumber}",
    // "location{name,type,parent{name,type,parent{name,type,parent{name,type}}}}",
    // "address",
  ];
  const payload = formatPageQueryWithCount("banks", filters, projections);
  return graphql(payload, "WORKFORCE_BANK");
}

export function createBank(bank, clientMutationLabel) {
  const mutation = formatMutation(
    "createBank",
    formatBankGQL(bank),
    clientMutationLabel
  );

  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["BANK_MUTATION_REQ", "BANK_CREATE_BANK_RESP", "BANK_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateBank(bank, clientMutationLabel) {
  const mutation = formatMutation(
    "updateBank",
    formatBankGQL(bank),
    clientMutationLabel
  );

  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["BANK_MUTATION_REQ", "BANK_UPDATE_BANK_RESP", "BANK_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createApplication(mutation, clientMutationLabel) {
  // const mutation = formatMutation(
  //   "createWorkforceApplication",
  //   formatApplicationeGQL(application),
  //   clientMutationLabel,
  // );

  // console.log({mutation})
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "APPLICATION_MUTATION_REQ",
      "APPLICATION_CREATE_APPLICATION_RESP",
      "APPLICATION_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updateApplication(application, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceApplication",
    formatApplicationeGQL(application),
    clientMutationLabel
  );

  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "APPLICATION_MUTATION_REQ",
      "APPLICATION_UPDATE_APPLICATION_RESP",
      "APPLICATION_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createDependentInfo(education, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceDependentInfo",
    formatEducationInfoGQL(education),
    clientMutationLabel
  );

  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["EDUCATION_INFO_MUTATION_REQ", "EDUCATION_INFO_CREATE_EDUCATION_RESP", "EDUCATION_INFO_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createEducationInfo(education, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceEducation",
    formatEducationInfoGQL(education),
    clientMutationLabel
  );

  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["EDUCATION_INFO_MUTATION_REQ", "EDUCATION_INFO_CREATE_EDUCATION_RESP", "EDUCATION_INFO_MUTATION_ERR"],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}
export function createApplicationMovement(application, clientMutationLabel) {
  const mutation = formatMutation(
    "createWorkforceApplicationMovement",
    formatApplicationMovementGQL(application),
    clientMutationLabel
  );

  console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "APPLICATION_MOVEMENT_MUTATION_REQ",
      "APPLICATION_MOVEMENT_CREATE_APPLICATION_RESP",
      "APPLICATION_MOVEMENT_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createApplicationSummary(mutation, clientMutationLabel) {
  // const mutation = formatMutation(
  //   "createWorkforceApplicationSummary",
  //   formatApplicationSummaryGQL(applicationSummary),
  //   clientMutationLabel
  // );

  // console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "APPLICATION_SUMMARY_MUTATION_REQ",
      "APPLICATION_SUMMARY_CREATE_APPLICATION_RESP",
      "APPLICATION_SUMMARY_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}
export function updateApplicationSummary(applicationSummary, clientMutationLabel) {
  const mutation = formatMutation(
    "updateWorkforceApplicationSummary",
    formatApplicationSummaryGQL(applicationSummary),
    clientMutationLabel
  );

  // console.log({ mutation });
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "APPLICATION_SUMMARY_MUTATION_REQ",
      "APPLICATION_SUMMARY_CREATE_APPLICATION_RESP",
      "APPLICATION_SUMMARY_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function fetchInfoIdByClientMutationId(mm, querySchema, clientMutationId, reduxKey) {
  const payload = `{
  ${querySchema}(
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
  return graphql(payload, reduxKey);
}

export function fetchFactoryByClientMutationId(mm, clientMutationId) {
  const payload = `{
  workforceEmployerFactories(
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
  return graphql(payload, "WORKFORCE_FACTORY_BY_FACTORY_MUTATION_ID_RESP");
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

export function fetchApplicationSummaryByClientMutationId(mm, clientMutationId) {
  const payload = `{
  workforceApplicationSummary(
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
  return graphql(payload, "WORKFORCE_APPLICATION_SUMMARY_BY_CLIENT_MUTATION_ID");
}

export function fetchApplicationId(mm, clientMutationId) {
  const payload = `{
  workforceApplication(
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
  return graphql(payload, "WORKFORCE_APPLICATION_BY_CLIENT_MUTATION_ID");
}

export function fetchOrganizationEmployeeDesignation(mm, clientMutationId) {
  const payload = `{
  workforceOrganizationEmployeeDesignations(employee_Id:"${clientMutationId}") {
    edges {
      node {
        id
        designation {
          id
        }
      }
    }
  }
}
`;
  return graphql(payload, "WORKFORCE_ORGANIZATION_BY_DESIGNATION_MUTATION_ID");
}
export function fetchPostOfficesPick(mm, id) {
  const payload = `{
  workforcePostoffice(wCodeId: "${id}", orderBy: ["name_bn"]){
    id
    postCode
    postOffice
    nameEn
    nameBn
    wCode
    status
  }
}
`;
  return graphql(payload, "WORKFORCE_POST_OFFICE_PICKER");
}

export function fetchWorkforceEmployeeDesignation(mm, filters) {
  const projections = [
    "id",
    "joinDate",
    "resignationDate",
    "resignationReason",
    "position",
    "status",
    "workforceCompany {id,nameEn,nameBn}",
    "workforceFactory {id,nameEn,nameBn}",
    "workforceOffice {id}",
    "workforceEmployee{id,firstNameBn,firstNameEn,email,phoneNumber,birthDate,deathDate,joinDate,presentAddress,insuranceNumber,nid,birthCertificateNo,permanentAddress}",
    // "unitDesignations {id,nameBn,nameEn,activeEmployeeDesignation{id,status,joiningDate,employee{id,nameEn,nameBn,email,phoneNumber}}}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceEmployeeDesignation",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_EMPLOYEE_DESIGNATIONS");
}
export function fetchWorkforceUnitsWithEmployeeDesignation(filters) {
  const projections = [
    "id",
    "nameBn",
    "nameEn",
    "unitDesignations {id,nameBn,nameEn,activeEmployeeDesignation{id,status,joiningDate,employee{id,nameEn,nameBn,email,phoneNumber}}}",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizationUnits",
    filters,
    projections
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS_UNITWISE_DESIGNATIONS");
}

export function verifyNid(mm, clientMutationId) {
  const payload = `{
  workforceNidVerification(nid:"8658556249")
}
`;
  return graphql(payload, "WORKFORCE_VERIFY_NID");
}

export function fetchWorkforceApplicationStatusCount() {
  const payload = `query{
  pending: workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_DIRECTOR}", "${WORKFORCE_STATUS.FORWARD_TO_DG}"]){
    totalCount
  }
  rejected:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REJECTED}"]){
    totalCount
  }
  approved:workforceApplication(statusIn: ["${WORKFORCE_STATUS.APPROVED_BY_DG}"]){
    totalCount
  }
  pendingForDirector: workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_DIRECTOR}"]){
    totalCount
  }
  rejectedForDirector:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REJECTED}"]){
    totalCount
  }
  approvedForDirector:workforceApplication(statusIn: ["${WORKFORCE_STATUS.APPROVED_BY_DIRECTOR}"]){
    totalCount
  }
  pendingForFactoryAdmin:workforceApplication(statusIn: ["${WORKFORCE_STATUS.NEW}"]){
    totalCount
  }
  rejectedForFactoryAdmin:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REJECTED}"]){
    totalCount
  }
  revertedForFactoryAdmin:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REVERT}"]){
    totalCount
  }
  pendingForBGMEAAssociation:workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION}"]){
    totalCount
  }
  rejectedForBGMEAAssociation:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REJECTED}"]){
    totalCount
  }
  revertedForBGMEAAssociation:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REVERT}"]){
    totalCount
  }
  pendingForBKMEAAssociation:workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION}"]){
    totalCount
  }
  rejectedForBKMEAAssociation:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REJECTED}"]){
    totalCount
  }
  revertedForBKMEAAssociation:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REVERT}"]){
    totalCount
  }
  pendingForSectionAdmin:workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_CF_SECTION}"]){
    totalCount
  }
  rejectedForSectionAdmin:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REJECTED}"]){
    totalCount
  }
  revertedForSectionAdmin:workforceApplication(statusIn: ["${WORKFORCE_STATUS.REVERT}"]){
    totalCount
  }
    pendingForChecker:workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_CF_SECTION}"]){
    totalCount
  }
    pendingForCheckerTwo:workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_CF_SECTION}"]){
    totalCount
  }
    pendingForDoctor:workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_DOCTOR}"]){
    totalCount
  }
    pendingForApprover:workforceApplication(statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_COMIITEE}"]){
    totalCount
  }
}`
  return graphql(payload, "WORKFORCE_APPLICATION_STATUS_COUNT");
}




export function fetchApplicationByDate(months, fromDate, toDate, organizationType) {
  const APPLICATION_FIELDS = `
    applicationType
    applicationCount
    approvedCount
    rejectedCount
  `;
  const args = [];

  if (organizationType) {
    args.push(`organizationType: "${organizationType}"`);
  }

  if (months > 0) {
    args.push(`lastMonths: "${months}"`);
  } else if (fromDate && toDate) {
    args.push(`dateBetween: ["${fromDate}", "${toDate}"]`);
  }

  const argString = args.length > 0 ? `(${args.join(", ")})` : "";

  const payload = `
    query {
      workforceApplicationMatrix${argString} {
        ${APPLICATION_FIELDS}
      }
    }
  `;

  return graphql(payload, "WORKFORCE_APPLICATIONS_BY_DATE");
}


export function fetchApplicationMonthWise(months) {
  const APPLICATION_FIELDS = `
    month
    medical
    educational
    death
    maternityGrant
    disabilityAssistance
  `;
  const args = [];

  // if (organizationType) {
  //   args.push(`organizationType: "${organizationType}"`);
  // }

  if (months > 0) {
    args.push(`monthsBetween: "${months}"`);
  } 

  const argString = args.length > 0 ? `(${args.join(", ")})` : "";

  const payload = `
    query {
      workforceMonthwiseApplications${argString} {
        ${APPLICATION_FIELDS}
      }
    }
  `;

  return graphql(payload, "WORKFORCE_APPLICATIONS_MONTH_WISE");
}


export function fetchGenderWiseApplicationMatrixByDate(months, fromDate, toDate, organizationType) {
  const GENDER_FIELDS = `
    totalApplicant
    totalDependent
    maleApplicant
    femaleApplicant
    maleDependent
    femaleDependent
    totalBenefitAmount
  `;

  const args = [];

  if (organizationType) {
    args.push(`organizationType: "${organizationType}"`);
  }
  if (months > 0) {
    args.push(`lastMonths: "${months}"`);
  } 
  else if (fromDate && toDate) {
    args.push(`dateBetween: ["${fromDate}", "${toDate}"]`);
  }

  const argString = args.length > 0 ? `(${args.join(", ")})` : "";

  const payload = `
    query {
      workforceGenderwiseMatrix${argString} {
        ${GENDER_FIELDS}
      }
    }
  `;

  return graphql(payload, "GENDER_WISE_APPLICATION_MATRIX_BY_DATE");
}
