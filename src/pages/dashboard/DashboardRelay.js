import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserType, isEmptyObject } from "../../utils/utils";
import ApplicantDashboard from "./ApplicantDashboardPage";
import DashboardPage from "./DashboardPage";
import CheckerDashboardPage from "./CheckerDashboardPage";
import CheckerTwoDashboardPage from "./CheckerTwoDashboardPage";
import S1DeputyAsstDirectorDashboardPage from "./S1DeputyAsstDirectorDashboardPage";
import S2DeputyAsstDirectorDashboardPage from "./S2DeputyAsstDirectorDashboardPage";
import BGMEAAssociationDashboardPage from "./BGMEAAssociationDashboardPage";
import BKMEAAssociationDashboardPage from "./BKMEAAssociationDashboardPage";
import ApproverDashboardPage from "./ApproverDashboardPage";
import FactoryAdminDashboardPage from "./FactoryAdminDashboardPage";
import SectionAdminDashboardPage from "./SectionAdminDashboardPage";
import SectionTwoAdminDashboardPage from "./SectionTwoAdminDashboardPage";
import BlwfSectionAdminDashboardPage from "./BlwfSectionAdminDashboardPage";
import DoctorDashboardPage from "./DoctorDashboardPage";
import { WORKFORCE_USER_TYPE } from "../../constants";
import BlwfApproverDashboard from "./BlwfApproverDashboardPage";
import BlwfCheckerDashboard from "./BlwfCheckerDashboardPage";
import BlwfDeputyAsstDirectorDashboardPage from "./BlwfDeputyAsstDirectorDashboardPage";
import EisCoordinatorDashboardPage from "./EisCoordinatorDashboardPage";
import EisOfficerDashboardPage from "./EisOfficerDashboardPage";
import EisCommitteeDashboardPage from "./EisCommitteeDashboardPage"

const DashboardRelay = () => {
  const user_type = getUserType();
console.log(user_type)
  if (user_type === WORKFORCE_USER_TYPE.APPLICANT) {
    return <ApplicantDashboard />;
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER) {
    return <CheckerDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER_TWO) {
    return <CheckerTwoDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR) {
    return <S1DeputyAsstDirectorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR) {
    return <S2DeputyAsstDirectorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN) {
    return <SectionAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO) {
    return <SectionTwoAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
    return <BlwfSectionAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.DOCTOR) {
    return <DoctorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.APPROVER) {
    return <ApproverDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_APPROVER) {
    return <BlwfApproverDashboard />;
  } else if (user_type === WORKFORCE_USER_TYPE.ADMIN) {
    return <DashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.DIRECTOR) {
    return <DashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_DIRECTOR) {
    return <DashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION) {
    return <BGMEAAssociationDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION) {
    return <BKMEAAssociationDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
    return <FactoryAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_CHECKER) {
    return <BlwfCheckerDashboard />;
  } else if (user_type === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR) {
    return <BlwfDeputyAsstDirectorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR) {
    return <EisCoordinatorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_OFFICER) {
    return <EisOfficerDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_ADVISOR) {
    return <DashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.EIS_COMMITTEE) {
    return <EisCommitteeDashboardPage />;
  }
  return <></>;

};

export default DashboardRelay;