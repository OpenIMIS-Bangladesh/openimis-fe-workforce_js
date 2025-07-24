import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserType, isEmptyObject } from "../../utils/utils";
import ApplicantDashboard from "./ApplicantDashboardPage";
import DashboardPage from "./DashboardPage";
import CheckerDashboardPage from "./CheckerDashboardPage";
import CheckerTwoDashboardPage from "./CheckerTwoDashboardPage";
import AssociationDashboardPage from "./AssociationDashboardPage";
import ApproverDashboardPage from "./ApproverDashboardPage";
import FactoryAdminDashboardPage from "./FactoryAdminDashboardPage";
import SectionAdminDashboardPage from "./SectionAdminDashboardPage";
import DoctorDashboardPage from "./DoctorDashboardPage";
import { WORKFORCE_USER_TYPE } from "../../constants";

const DashboardRelay = () => {
  const user_type = getUserType();
console.log(user_type)
  if (user_type === WORKFORCE_USER_TYPE.APPLICANT) {
    return <ApplicantDashboard />;
 
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER) {
    return <CheckerDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER_TWO) {
    return <CheckerTwoDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN) {
    return <SectionAdminDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.DOCTOR) {
    return <DoctorDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.APPROVER) {
    return <ApproverDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.ADMIN) {
    return <DashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.DIRECTOR) {
    return <DashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.ASSOCIATION) {
    return <AssociationDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
    return <FactoryAdminDashboardPage />;
  }

  return <></>;

};

export default DashboardRelay;