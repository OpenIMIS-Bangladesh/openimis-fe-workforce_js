import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { isEmptyObject } from "../../utils/utils";
import ApplicantDashboard from "./ApplicantDashboardPage";
import DashboardPage from "./DashboardPage";

const DashboardRelay = () => {
  const reduxState = useSelector((state) => state);
  const user_rights = reduxState.core.user.i_user.rights;
  console.clear();
  console.log(user_rights);
  if (isEmptyObject((user_rights))) {
    return <ApplicantDashboard />;
  } else if (!isEmptyObject(user_rights)) {
    return <DashboardPage />;
  }

  return <></>;

};

export default DashboardRelay;