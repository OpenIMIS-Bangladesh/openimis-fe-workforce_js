import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserType, isEmptyObject } from "../../utils/utils";
import ApplicantDashboard from "./ApplicantDashboardPage";
import DashboardPage from "./DashboardPage";
import CheckerDashboardPage from "./CheckerDashboardPage";
import ApproverDashboardPage from "./ApproverDashboardPage";
import { WORKFORCE_USER_TYPE } from "../../constants";

const DashboardRelay = () => {
  const user_type = getUserType();
console.log(user_type)
  if (user_type === WORKFORCE_USER_TYPE.APPLICANT) {
    return <ApplicantDashboard />;
 
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER) {
    return <CheckerDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.APPROVER) {
    return <ApproverDashboardPage />;
  } else if (user_type === WORKFORCE_USER_TYPE.ADMIN) {
    return <DashboardPage />;
  }

  return <></>;

};

export default DashboardRelay;