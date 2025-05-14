import { useSelector } from "react-redux";
import { WORKFORCE_USER_TYPE } from "../constants";
import { fetchApplication } from "../actions";

export function isBase64Encoded(str) {
  // Base64 encoded strings can only contain characters from [A-Za-z0-9+/=]
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

export function getUserType() {
  const reduxState = useSelector((state) => state);
  const user_rights = reduxState.core.user.i_user.rights;
  return getUserTypeFromRights(user_rights);
}

export function getUserTypeFromRights(user_rights) {
  let user_type = WORKFORCE_USER_TYPE.APPLICANT;

  if (!isEmptyObject(user_rights)) {
    user_type = WORKFORCE_USER_TYPE.ADMIN;
  }

  return user_type;
}


export const getParsedApplication = async (dispatch, modulesManager, filters) => {
  try {
    await dispatch(fetchApplication(modulesManager, filters));

    // If response failed or empty
    // if (!response?.payload?.data?.workforceApplication?.nodes?.length) {
    //   return null;
    // }

    const rawData = useSelector(
        (state) => state.workforce[`application`] ?? []
      );

    // const rawData = response.payload.data.workforceApplication.nodes[0];
    console.log({rawData})

    // return {
    //   ...rawData,
    //   employeeDependentInfo: JSON.parse(rawData.employeeDependentInfo),
    //   employeeBankInfo: JSON.parse(rawData.employeeBankInfo),
    //   employeeAccidentInfo: JSON.parse(rawData.employeeAccidentInfo),
    // };
  } catch (error) {
    console.error("Error fetching or parsing application:", error);
    return null;
  }
};
