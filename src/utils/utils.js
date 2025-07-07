import { useSelector } from "react-redux";
import { WORKFORCE_USER_TYPE } from "../constants";
import { fetchApplication } from "../actions";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";

export function isBase64Encoded(str) {
  // Base64 encoded strings can only contain characters from [A-Za-z0-9+/=]
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

export const safeApplicationId = (applicationId, parsedApplicationData) => {
    console.clear();
    console.log("applicationId", applicationId);
    console.log("parsedApplicationData", parsedApplicationData);
    if (applicationId && applicationId.length > 0 && applicationId[0]?.id) {
      return decodeId(applicationId[0].id);
    } else if (parsedApplicationData && parsedApplicationData.id) {
      return parsedApplicationData.id;
    } else {
      return null;
    }
  };

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
  }else if (user_rights.includes(815001)) {
    user_type = WORKFORCE_USER_TYPE.DIRECTOR;
  }else if (user_rights.includes(816001)) {
    user_type = WORKFORCE_USER_TYPE.ASSOCIATION;
  }else if(!isEmptyObject(user_rights)) {
    user_type = WORKFORCE_USER_TYPE.ADMIN;
  }
  
  return user_type;
}

const safeParse = (str) => {
  try {
    if (!str) return null;
    const once = JSON.parse(str);     // first parse
    return typeof once === 'string' ? JSON.parse(once) : once; // second parse if needed
  } catch (e) {
    console.warn("Parsing failed for:", str);
    return null;
  }
};

export const getParsedApplication = (modulesManager, filters) => {
  console.log('hello from getParsedApplication',filters)
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
        employeeDependentInfo: safeParse(rawData.employeeDependentInfo) || {},
        employeeBankInfo: safeParse(rawData.employeeBankInfo) || {},
        employeeAccidentInfo: safeParse(rawData.employeeAccidentInfo) || {},
        employeeChildrenInfo: safeParse(rawData.employeeChildrenInfo) || {},
        metadata:safeParse(rawData.metadata) ||{}
      };

      return parsedData;
    } catch (error) {
      console.error("Error in getParsedApplication:", error);
      throw error; // Re-throw to let caller handle it
    }
  };
};
