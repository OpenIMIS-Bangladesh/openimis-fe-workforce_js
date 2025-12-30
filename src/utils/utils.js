import { useSelector } from "react-redux";
import React from "react";
import { WORKFORCE_USER_TYPE } from "../constants";
import { fetchApplication } from "../actions";
import { useModulesManager, formatMutation, decodeId, FormattedMessage, parseData } from "@openimis/fe-core";

export function isBase64Encoded(str) {
  // Base64 encoded strings can only contain characters from [A-Za-z0-9+/=]
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

export const safeApplicationId = (applicationId, parsedApplicationData) => {
  console.log("applicationId", applicationId);
  console.log("parsedApplicationData", parsedApplicationData);
  if (applicationId && applicationId.length > 0 && applicationId[0]?.id) {
    return decodeId(applicationId[0].id);
  } else if (parsedApplicationData && parsedApplicationData?.id) {
    return parsedApplicationData?.id;
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
  } else if (user_rights.includes(819001)) {
    user_type = WORKFORCE_USER_TYPE.CHECKER_TWO;
  } else if (user_rights.includes(817001)) {
    user_type = WORKFORCE_USER_TYPE.SECTION_ADMIN;
  } else if (user_rights.includes(821002)) {
    user_type = WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO;
  } else if (user_rights.includes(821003)) {
    user_type = WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR;
  } else if (user_rights.includes(821004)) {
    user_type = WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR;
  } else if (user_rights.includes(821005)) {
    user_type = WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN;
  } else if (user_rights.includes(821007)) {
    user_type = WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR;
  } else if (user_rights.includes(818001)) {
    user_type = WORKFORCE_USER_TYPE.DOCTOR;
  } else if (user_rights.includes(813001)) {
    user_type = WORKFORCE_USER_TYPE.APPROVER;
  } else if (user_rights.includes(821006)) {
    user_type = WORKFORCE_USER_TYPE.BLWF_APPROVER;
  } else if (user_rights.includes(814001)) {
    user_type = WORKFORCE_USER_TYPE.FACTORY_ADMIN;
  } else if (user_rights.includes(815001)) {
    user_type = WORKFORCE_USER_TYPE.DIRECTOR;
  } else if (user_rights.includes(812009)) {
    user_type = WORKFORCE_USER_TYPE.BLWF_DIRECTOR;
  } else if (user_rights.includes(816001)) {
    user_type = WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION;
  } else if (user_rights.includes(821001)) {
    user_type = WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION;
  } else if (user_rights.includes(812008)) {
    user_type = WORKFORCE_USER_TYPE.BLWF_CHECKER;
  } else if (user_rights.includes(813000)) {
    user_type = WORKFORCE_USER_TYPE.EIS_COORDINATOR;
  } else if (user_rights.includes(813002)) {
    user_type = WORKFORCE_USER_TYPE.EIS_OFFICER;
  } else if (user_rights.includes(813003)) {
    user_type = WORKFORCE_USER_TYPE.EIS_ADVISOR;
  } else if (user_rights.includes(813004)) {
    user_type = WORKFORCE_USER_TYPE.EIS_COMMITTEE;
  } else if (user_rights.includes(813005)) {
    user_type = WORKFORCE_USER_TYPE.BLWF_DOCTOR;
  } else if (user_rights.includes(813006)) {
    user_type = WORKFORCE_USER_TYPE.EIS_FINANCIAL_OFFICER;
  } else if (user_rights.includes(813007)) {
    user_type = WORKFORCE_USER_TYPE.EIS_DOCTOR;
  } else if (user_rights.includes(813008)) {
    user_type = WORKFORCE_USER_TYPE.BLWF_DOL_DIFE;
  } else if (user_rights.includes(813009)) {
    user_type = WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION;
  } else if (user_rights.includes(814000)) {
    user_type = WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION;
  } else if (user_rights.includes(815000)) {
    user_type = WORKFORCE_USER_TYPE.SECRETARY;
  } else if (!isEmptyObject(user_rights)) {
    user_type = WORKFORCE_USER_TYPE.ADMIN;
  }

  return user_type;
}

export const safeParse = (str) => {
  try {
    if (!str) return null;
    const once = JSON.parse(str); // first parse
    return typeof once === "string" ? JSON.parse(once) : once; // second parse if needed
  } catch (e) {
    console.warn("Parsing failed for:", str);
    return null;
  }
};

export const tryParse = (value) => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    } catch {
      return value;
    }
  }
  return value;
};

export const getParsedApplication = (modulesManager, filters) => {
  console.log("hello from getParsedApplication", filters);
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
      const workforceDependentInfo = safeParse(rawData?.employeeDependentInfo);
      const dependentInfoWithId = workforceDependentInfo?.map((dep, idx) => {
        const temp = { ...dep, id: rawData?.workforceEmployeeDependentApplication?.[idx]?.id };
        return temp;
      });
      const parsedDependentInfo = Array.isArray(rawData?.workforceEmployeeDependentApplication)
        ? rawData?.workforceEmployeeDependentApplication?.map((dep) => ({
            ...dep,
            presentAddress: safeParse(dep?.presentAddress),
            permanentAddress: safeParse(dep?.permanentAddress),
          }))
        : rawData?.workforceEmployeeDependentApplication;

      // Parse the JSON fields safely
      const parsedData = {
        ...rawData,
        employeeDependentInfo: dependentInfoWithId || [{}],
        workforceEmployeeDependentApplication: parsedDependentInfo || [{}],
        employeeBankInfo: safeParse(rawData?.employeeBankInfo) || [{}],
        employeeAccidentInfo: safeParse(rawData?.employeeAccidentInfo) || {},
        employeeChildrenInfo: safeParse(rawData?.employeeChildrenInfo) || {},
        metadata: safeParse(rawData?.metadata) || {},
        deceasedWorkerInfo: safeParse(rawData?.deceasedWorkerInfo) || {},
        applicantInfo: safeParse(rawData?.applicantInfo) || {},
      };

      return parsedData;
    } catch (error) {
      console.error("Error in getParsedApplication:", error);
      throw error; // Re-throw to let caller handle it
    }
  };
};

export const getParsedApplicationFromArray = (applications) => {
  const returnArray = [];
  if (!Array.isArray(applications)) return [];
  applications.forEach((rawData) => {
    const parsedData = {
      ...rawData,
      employeeDependentInfo: safeParse(rawData.employeeDependentInfo) || {},
      employeeBankInfo: safeParse(rawData.employeeBankInfo) || {},
      employeeAccidentInfo: safeParse(rawData.employeeAccidentInfo) || {},
      employeeChildrenInfo: safeParse(rawData.employeeChildrenInfo) || {},
      metadata: safeParse(rawData.metadata) || {},
    };
    returnArray.push(parsedData);
  });
  return returnArray;
};

export const isEmpty = (value) => {
  if (typeof value == "undefined" || value == "" || value == null || value == 0) {
    return true;
  }
  return false;
};

export const enToBn = (input, type = "") => {
  var numbers = {
    0: "০",
    1: "১",
    2: "২",
    3: "৩",
    4: "৪",
    5: "৫",
    6: "৬",
    7: "৭",
    8: "৮",
    9: "৯",
  };
  var output = "";

  if (typeof input == "number") {
    input = input.toString();
  }
  if (isEmpty(input?.length)) {
    return input;
  }
  for (var i = 0; i < input?.length; ++i) {
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
    "০": 0,
    "১": 1,
    "২": 2,
    "৩": 3,
    "৪": 4,
    "৫": 5,
    "৬": 6,
    "৭": 7,
    "৮": 8,
    "৯": 9,
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  };
  var output = "";

  if (typeof input == "number") {
    input = input.toString();
  }
  if (empty(input)) {
    return input;
  }
  for (var i = 0; i < input?.length; ++i) {
    if (numbers.hasOwnProperty(input[i])) {
      output += numbers[input[i]];
    } else {
      output += input[i];
    }
  }
  return output;
};

export const conditionalEnToBn = (num, locale, type = "") => {
  if (locale === "en") {
    return num;
  } else {
    return enToBn(num, type);
  }
};

export const getInfoId = (resp, dataKey) => {
  let id = null;
  if (resp?.payload?.data) {
    const data = parseData(resp.payload.data[dataKey]).map((info) => ({
      ...info,
      id: decodeId(info.id),
    }))?.[0];

    id = data?.id;
  }

  return id;
};

export const validateForm = (emp, formatMessage, formData) => {
  // const emp = formData?.workforceEmployee || {};
  const errs = {};

  if (!emp.nameBn) errs.nameBn = formatMessage("core.error.required");
  if (!emp.nameEn) errs.nameEn = formatMessage("core.error.required");
  if (!emp.birthDate) errs.birthDate = formatMessage("core.error.required");
  if (!emp.gender) errs.gender = formatMessage("core.error.required");
  if (!emp.maritalStatus) errs.maritalStatus = formatMessage("core.error.required");
  if (!emp.citizenship) errs.citizenship = formatMessage("core.error.required");

  if (!emp.nid && !emp.birthCertificateNo) {
    errs.nid = formatMessage("core.error.required");
  }

  if (formData.applicationType === "deadlyGrant" && !emp.deathDate) {
    errs.deathDate = formatMessage("core.error.required");
  }

  return errs;
};

export function getThirdStepId(location) {
  let current = location;
  let step = 0;

  while (current?.parent && step < 1) {
    current = current.parent;
    step++;
  }

  // after 2 jumps, we're at step 3
  return current?.id || null;
}
const convertBanglaToEnglishDigits = (str) => {
  return str.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
};

export const isNotFutureDateBangla = (dateString) => {
  if (!dateString) return false;

  // Convert Bangla digits to English first
  const en = convertBanglaToEnglishDigits(dateString);

  // Parse DD-MM-YYYY manually
  const parts = en.split("-");
  if (parts.length !== 3) return false;

  const [day, month, year] = parts.map(Number);
  const selectedDate = new Date(year, month - 1, day);

  if (isNaN(selectedDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate <= today;
};



export const isNotFutureDate = (dateString) => {
  if (!dateString) return false;

  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  return selectedDate <= today;
};

export const validateRequiredFields = (containerRef, formatMessage) => {
  const fields = containerRef.current.querySelectorAll("[required]");
  console.log({ fields })
  const errors = {};

  fields.forEach((field) => {
    const value = field.value?.trim?.() || "";

    if (!value && field.tagName !== "DIV") {
      if (!field.id && field.parentElement.previousElementSibling?.classList && Array.from(field.parentElement.previousElementSibling.classList).some(c => c.startsWith("openIMISDatePicker-label"))) {
        field.id = "rdmp";
      }

      let parent = field.parentElement;
      while (parent) {
        if (
          parent.classList &&
          Array.from(parent.classList).some(c => c.startsWith("DetailedLocation-form"))
        ) {
          field.id = "detailedLocation";
          break;
        }
        parent = parent.parentElement;
      }

      errors[field.id || field.name] = formatMessage("core.error.required");
      console.warn(`Validation failed for field: ${field.id || field.name}`);
    }

    if (value && field.tagName !== "DIV") {
      if (!field.id && field.parentElement.previousElementSibling?.classList && Array.from(field.parentElement.previousElementSibling.classList).some(c => c.startsWith("openIMISDatePicker-label")) && !isNotFutureDateBangla(value)) {
        field.id = "rdmp";
        errors[field.id || field.name] = formatMessage("core.error.dateTime");
        console.warn(`Validation failed for field: ${field.id || field.name}`);
      }

    }

    if (field.id === "phoneNumber") {
      if (value.length !== 11) {
        errors[field.id] = formatMessage("core.error.phoneNumberLength");
        console.warn(
          `Validation failed for phoneNumber: expected 11 digits, got ${value.length}`
        );
      }
    }

    if (field.id === "nid") {
      if (!(value.length === 10  || value.length === 13 ||  value.length === 17)) {
        errors[field.id] = formatMessage("core.error.nidLength");
        console.warn(
          `Validation failed for phoneNumber: expected 11 digits, got ${value.length}`
        );
      }
    }

    if (field.id === "accountNumber") {
      if (!(value.length >= 8 && value.length <= 17)) {
        errors[field.id] = formatMessage("core.error.accountNumberLength");
        console.warn(
          `Validation failed for phoneNumber: expected 11 digits, got ${value.length}`
        );
      }
    }
  });

  return errors;
};

export const isAtLeast18YearsOld = (birthDateString) => {
  if (!birthDateString) return false;

  const birthDate = new Date(birthDateString);
  const today = new Date();

  // Calculate the difference in years
  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust if the birthday hasn’t occurred yet this year
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 18;
};

export function extractId(item) {
  if (!item && item !== 0) return null;
  if (typeof item === "object" && item.id !== undefined) return item.id;
  return item;
}

function isNumericString(s) {
  return typeof s === "string" && /^[0-9]+$/.test(s);
}

function looksLikeBase64(s) {
  if (typeof s !== "string") return false;
  if (!/^[A-Za-z0-9+/=]+$/.test(s)) return false;
  if (s.length % 4 !== 0) return false;
  try {
    return btoa(atob(s)) === s;
  } catch (e) {
    return false;
  }
}

export function safeDecodeId(maybeEncoded) {
  if (maybeEncoded === null || maybeEncoded === undefined) return maybeEncoded;

  if (typeof maybeEncoded === "number") return maybeEncoded;

  if (typeof maybeEncoded === "object") {
    const extracted = extractId(maybeEncoded);
    if (extracted !== maybeEncoded) return safeDecodeId(extracted);
  }
  const s = String(maybeEncoded);
  if (isNumericString(s)) return s;

  if (looksLikeBase64(s)) {
    try {
      return decodeId(s);
    } catch (err) {
      return s;
    }
  }
  try {
    return decodeId(s);
  } catch (err) {
    return s;
  }
}

export function getAssociationNameByUserType(user_type) {
  if (user_type.includes("association")) {
    return user_type.split("_")[0].toUpperCase();
  } else {
    return "";
  }
}

export function getApprovalStatus(isApproved) {
  if (isApproved === "yes") {
    return (
      <>
        <b style= {{ color: "green" }}>
          Approved
        </b>
      </>
    )

  } else {
    return "Not Approved Yet";
  }
}


export const isEisPath = () => {
  // if (typeof window !== "undefined") {
  //   return window.location.href.includes("eis");
  // }
  // return false; // fallback if window is not defined (SSR)
  return true;
};
