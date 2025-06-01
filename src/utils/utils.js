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
  if (user_rights.includes(812001)) {
    user_type = WORKFORCE_USER_TYPE.CHECKER;
  }else if (user_rights.includes(813001)) {
    user_type = WORKFORCE_USER_TYPE.APPROVER;
  }else if (user_rights.includes(814001)) {
    user_type = WORKFORCE_USER_TYPE.FACTORY_ADMIN;
  }else if(!isEmptyObject(user_rights)) {
    user_type = WORKFORCE_USER_TYPE.ADMIN;
  }
  
  return user_type;
}


export const getParsedApplication = (modulesManager, filters) => {
  return async (dispatch, getState) => {
    try {
      // Dispatch the fetch action and wait for it to complete
      await dispatch(fetchApplication(modulesManager, filters));
      
      // Get the current state after the fetch completes
      const state = getState();
      const rawData = state.workforce.application;
      
      if (!rawData) {
        console.warn("No application data found in Redux store");
        return null;
      }

      console.log("Raw application data:", rawData);

      // Parse the JSON fields safely
      const parsedData = {
        ...rawData,
        employeeDependentInfo: rawData.employeeDependentInfo 
          ? JSON.parse(rawData.employeeDependentInfo.replace(/^"|"$/g, ''))
          : [],
        employeeBankInfo: rawData.employeeBankInfo 
          ? JSON.parse(rawData.employeeBankInfo.replace(/^"|"$/g, ''))
          : {},
        employeeAccidentInfo: rawData.employeeAccidentInfo 
          ? JSON.parse(rawData.employeeAccidentInfo.replace(/^"|"$/g, ''))
          : null,
      };

      return parsedData;
    } catch (error) {
      console.error("Error in getParsedApplication:", error);
      throw error; // Re-throw to let caller handle it
    }
  };
};
