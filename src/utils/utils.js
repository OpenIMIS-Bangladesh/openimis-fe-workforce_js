import { useSelector } from "react-redux";
import { WORKFORCE_USER_TYPE } from "../constants";
import { fetchApplication } from "../actions";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
  parseData
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
  }else if (user_rights.includes(817001)) {
    user_type = WORKFORCE_USER_TYPE.SECTION_ADMIN;
  } else if (user_rights.includes(813001)) {
    user_type = WORKFORCE_USER_TYPE.APPROVER;
  } else if (user_rights.includes(814001)) {
    user_type = WORKFORCE_USER_TYPE.FACTORY_ADMIN;
  } else if (user_rights.includes(815001)) {
    user_type = WORKFORCE_USER_TYPE.DIRECTOR;
  } else if (user_rights.includes(816001)) {
    user_type = WORKFORCE_USER_TYPE.ASSOCIATION;
  } else if (!isEmptyObject(user_rights)) {
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
  console.log('hello from getParsedApplication', filters)
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
        metadata: safeParse(rawData.metadata) || {}
      };

      return parsedData;
    } catch (error) {
      console.error("Error in getParsedApplication:", error);
      throw error; // Re-throw to let caller handle it
    }
  };
};

export const isEmpty = (value) => {
  if (typeof (value) == 'undefined' || value == '' || value == null || value == 0) {
    return true;
  }
  return false;
}

export const enToBn = (input, type = '') => {
  var numbers = {
    0: '০', 1: '১', 2: '২', 3: '৩', 4: '৪', 5: '৫', 6: '৬', 7: '৭', 8: '৮', 9: '৯'
  };
  var output = '';

  if (typeof (input) == 'number') {
    input = input.toString();
  }
  if (isEmpty(input.length)) {
    return input;
  }
  for (var i = 0; i < input.length; ++i) {
    if (numbers.hasOwnProperty(input[i])) {
      output += numbers[input[i]];
    } else {
      output += input[i];
    }
  }
  return output;
};

export const bnToEn = (input) => {
  var numbers = {
    '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };
  var output = '';

  if (typeof (input) == 'number') {
    input = input.toString();
  }
  if (empty(input)) {
    return input;
  }
  for (var i = 0; i < input.length; ++i) {
    if (numbers.hasOwnProperty(input[i])) {
      output += numbers[input[i]];
    } else {
      output += input[i];
    }
  }
  return output;
};

export const conditionalEnToBn = (num, locale, type = '') => {
  if (locale === 'en') {
    return num;
  } else {
    return enToBn(num, type);
  }
}

export const getInfoId = (resp, dataKey) => {
  let id = null;
  if (resp?.payload?.data) {
    const data = parseData(resp.payload.data[dataKey]).map(
      (info) => ({
        ...info,
        id: decodeId(info.id),
      })
    )?.[0];

    id = data?.id;
  }

  return id;
};