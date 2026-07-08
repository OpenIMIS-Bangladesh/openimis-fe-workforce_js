import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserType, isEmptyObject } from "../../utils/utils";
import ApplicantDashboard from "./ApplicantDashboardPage";
import DashboardPage from "./DashboardPage";
import CheckerDashboardPage from "./CheckerDashboardPage";
import DeputyAsstDirectorDashboardPage from "./DeputyAsstDirectorDashboardPage";
import AssociationDashboardPage from "./AssociationDashboardPage";
import ApproverDashboardPage from "./ApproverDashboardPage";
import FactoryAdminDashboardPage from "./FactoryAdminDashboardPage";
import SectionAdminDashboardPage from "./SectionAdminDashboardPage";
import SectionTwoAdminDashboardPage from "./SectionTwoAdminDashboardPage";
import BlwfSectionAdminDashboardPage from "./BlwfSectionAdminDashboardPage";
import DoctorDashboardPage from "./DoctorDashboardPage";
import { WORKFORCE_USER_TYPE } from "../../constants";
import BlwfApproverDashboard from "./BlwfApproverDashboardPage";
import EisCoordinatorDashboardPage from "./EisCoordinatorDashboardPage";
import EisCommitteeDashboardPage from "./EisCommitteeDashboardPage"
import EisFinancialOfficerDashboard from "./EisFinancialOfficerDashboardPage";
import EISAdvisorDashboard from "./EISAdvisorDashboardPage";
import SecretaryDashboardPage from "./SecretaryDashboardPage";
import BlwfAccountantDashboardPage from "./BlwfAccountantDashboardPage";

const DashboardRelay = () => {
  const user_type = getUserType();
console.log("userTpe",user_type)
  if (user_type === WORKFORCE_USER_TYPE.APPLICANT) {
    return <ApplicantDashboard />;
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER || user_type === WORKFORCE_USER_TYPE.CHECKER_TWO || user_type === WORKFORCE_USER_TYPE.BLWF_CHECKER || user_type === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE || user_type === WORKFORCE_USER_TYPE.EIS_OFFICER) {
    return <CheckerDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR || user_type === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR || user_type === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR)  {
    return <DeputyAsstDirectorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN) {
    return <SectionAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO) {
    return <SectionTwoAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
    return <BlwfSectionAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.DOCTOR || user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR || user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) {
    return <DoctorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.APPROVER) {
    return <ApproverDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_APPROVER) {
    return <BlwfApproverDashboard />;
  } else if (user_type === WORKFORCE_USER_TYPE.ADMIN || user_type === WORKFORCE_USER_TYPE.DIRECTOR || user_type === WORKFORCE_USER_TYPE.BLWF_DIRECTOR) {
    return <DashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION || user_type === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || user_type === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION) {
    return <AssociationDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.ASSOCIATION) {
    return <AssociationDashboardPage />; 
  } else if (user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
    return <FactoryAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR) {
    return <EisCoordinatorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE || user_type === WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE ) {
    return <EisCommitteeDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_FINANCIAL_OFFICER) {
    return <EisFinancialOfficerDashboard />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_ADVISOR) {
    return <EISAdvisorDashboard />;
  } else if (user_type === WORKFORCE_USER_TYPE.SECRETARY||user_type === WORKFORCE_USER_TYPE.MINISTER) {
    return <SecretaryDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT) {
    return <BlwfAccountantDashboardPage />;
  } 
  else {
    return <FactoryAdminDashboardPage />;
  }
  return <></>;

};

export default DashboardRelay;