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
  if (user_rights.length > 380) {
    user_type = WORKFORCE_USER_TYPE.ADMIN;
  }
  else
  {
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
    } else if (user_rights.includes(816000)) {
      user_type = WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE;
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
    } else if (user_rights.includes(836001)) {
      user_type = WORKFORCE_USER_TYPE.ASSOCIATION;
    } else if (user_rights.includes(818000)) {
      user_type = WORKFORCE_USER_TYPE.MINISTER;
    } else if (user_rights.includes(819000)) {
      user_type = WORKFORCE_USER_TYPE.BLWF_ACCOUNTANT;
    }else if (!isEmptyObject(user_rights)) {
      user_type = WORKFORCE_USER_TYPE.ADMIN;
    }
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
        institutionInfo: safeParse(rawData?.institutionInfo) || {},
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

export const normalizeNumberInput = (value = "") => {
  const map = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };

  return value
    .replace(/[০-৯]/g, (d) => map[d]) // Bangla → English
    .replace(/\D/g, "");              // Keep only 0-9
};

export const conditionalEnToBn = (num, locale, type = "") => {
  if (locale === "en") {
    return num;
  } else {
    return enToBn(num, type);
  }
};

export const formatDynamicValue = (value, language) => {
  if (value === null || value === undefined || value === "") return "—";

  const strValue = String(value);

  // Skip formatting if it's a translation key (contains a dot)
  if (strValue.includes(".")) {
    return strValue;
  }

  // Format snake_case and camelCase
  const formattedValue = strValue
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Convert numbers to Bangla
  return conditionalEnToBn(formattedValue, language);
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

export const validateRequiredFields = (containerRef, formatMessage, formdata) => {
  const fields = containerRef.current.querySelectorAll("[required]");
  const dependents = formdata?.dependents || formdata?.employeeDependentInfo || formdata?.workforceEmployeeDependentApplication;
  console.log({ fields });
  const errors = {};

  fields.forEach((field) => {
    const value = field.value?.trim?.() || "";

    if (!value && field.tagName !== "DIV") {
      if (
        (!field.id || field.id === "rdmp") &&
        field.parentElement.previousElementSibling?.classList &&
        Array.from(field.parentElement.previousElementSibling.classList).some((c) => c.startsWith("openIMISDatePicker-label"))
      ) {
        field.id = "rdmp";
      }

      let parent = field.parentElement;
      while (parent) {
        if (parent.classList && Array.from(parent.classList).some((c) => c.startsWith("DetailedLocation-form"))) {
          field.id = "detailedLocation";
          break;
        }
        parent = parent.parentElement;
      }

      errors[field.id || field.name] = formatMessage("core.error.required");
      console.warn(`Validation failed for field: ${field.id || field.name}`);
    }

    if (value && field.tagName !== "DIV") {
      if (
        (!field.id || field.id === "rdmp") &&
        field.parentElement.previousElementSibling?.classList &&
        Array.from(field.parentElement.previousElementSibling.classList).some((c) => c.startsWith("openIMISDatePicker-label")) &&
        !isNotFutureDateBangla(value)
      ) {
        field.id = "rdmp";
        errors[field.id || field.name] = formatMessage("core.error.dateTime");
        console.warn(`Validation failed for field: ${field.id || field.name}`);
      }
    }

    if (field.id === "phoneNumber") {
      if (value.length !== 11) {
        errors[field.id] = formatMessage("core.error.phoneNumberLength");
        console.warn(`Validation failed for phoneNumber: expected 11 digits, got ${value.length}`);
      }
    }

    if (field.id === "nid") {
      if (!(value.length === 10 || value.length === 13 || value.length === 17)) {
        errors[field.id] = formatMessage("core.error.nidLength");
        console.warn(`Validation failed for nid: expected 10, 13 or 17 digits, got ${value.length}`);
      } else {
        // FIX: Check if the NID appears MORE THAN ONCE in the array
        const duplicateCount = dependents?.filter((obj) => obj.nid === value).length;

        if (duplicateCount > 1) {
          errors[field.id] = formatMessage("core.error.nid.repeat");
        }
      }
    }

    if (formdata?.employeeAccidentInfo?.dateOfRejoining) {
      const accidentDate = new Date(formdata?.employeeAccidentInfo?.accidentDate);
      const rejoinDate = new Date(formdata?.employeeAccidentInfo?.dateOfRejoining);
      if (rejoinDate < accidentDate) {
        errors["dateOfRejoining"] = formatMessage("workforce.rejoinDate.error");
        console.warn(`The re-joining date cannot be earlier than the date of the accident.`);
      }
    }

    if (field.id === "accountNumber") {
      if (!(value.length >= 8 && value.length <= 17)) {
        errors[field.id] = formatMessage("core.error.accountNumberLength");
        console.warn(`Validation failed for phoneNumber: expected 11 digits, got ${value.length}`);
      }
    }
  });

  return errors;
};

// export const isAtLeast18YearsOld = (birthDateString) => {
//   if (!birthDateString) return false;

//   const birthDate = new Date(birthDateString);
//   const today = new Date();

//   // Calculate the difference in years
//   let age = today.getFullYear() - birthDate.getFullYear();

//   // Adjust if the birthday hasn’t occurred yet this year
//   const hasHadBirthdayThisYear =
//     today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

//   if (!hasHadBirthdayThisYear) {
//     age -= 1;
//   }

//   return age >= 16;
// };
export const isAtLeast18YearsOld = (birthDateString, ageLimit = 16) => {
  if (!birthDateString) return false;

  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) age--;

  return age >= ageLimit;
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
        <b style={{ color: "green" }}>Approved</b>
      </>
    );
  } else {
    return "Not Approved Yet";
  }
}

/**
 * @param {string|null} relation
 * @param {string} applicationType
 */
export const getFooterContent = (relation = null, applicationType) => {
  console.log("relation pawa gese");
  // -----------------------------
  // Disability Assistance
  // -----------------------------
  if (applicationType === "disabilityAssistance") {
    return (
      <FooterWrapper>
        <li>সর্বমোট প্রদেয় লাইফ টাইম টপ-আপ বেনিফিট ত্রৈমাসিক ৩ কিস্তির মাধ্যমে পরিশোধ করা হবে।</li>
        <li>শ্রমিকের জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে।</li>
        <li>বিবাহ বন্ধনে আবদ্ধ না হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
        <li>
          তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে অর্থায়ন
          করছে।
        </li>
      </FooterWrapper>
    );
  }

  // -----------------------------
  // Female dependents
  // -----------------------------
  if (["workforce.relation.daugter", "workforce.relation.grand_daugter", "workforce.relation.sister"].includes(relation)) {
    return (
      <FooterWrapper>
        <li>বিবাহের পূর্ব পর্যন্ত টপ-আপ বেনিফিট প্রদান করা হবে।</li>
        <li>বিবাহ হলে অবিলম্বে ই.আই.এস পাইলটকে অবহিত করতে হবে।</li>
      </FooterWrapper>
    );
  }

  // -----------------------------
  // Parents / Male dependents
  // -----------------------------
  if (
    [
      "workforce.relation.father",
      "workforce.relation.mother",
      "workforce.relation.grand_father",
      "workforce.relation.grand_mother",
      "workforce.relation.brother",
    ].includes(relation)
  ) {
    return (
      <FooterWrapper>
        <li>টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন।</li>
        <li>শ্রমিকের পিতা/মাতার কেউ মৃত্যুবরণ করলে সেক্ষেত্রে তার প্রাপ্য মাসিক টপ-আপ বেনিফিট পিতা/মাতার মধ্যে জীবিত সদস্যের নিকট প্রদেয় হবে।</li>
        <li>
          উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ সংক্রান্ত
          প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
        </li>
        <li>
          তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে অর্থায়ন
          করছে।
        </li>
      </FooterWrapper>
    );
  }
  if (["workforce.relation.orphan_son", "workforce.relation.brother", "workforce.relation.grand_son"].includes(relation)) {
    return (
      <FooterWrapper>
        <ol>
          <li>
            টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
            <ol type="a" style={{ marginTop: "5px" }}>
              <li>উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
              <li>প্রাপ্তবয়স্ক (১৮ বছর) হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
            </ol>
          </li>
          <li>অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>
          <li>
            উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ সংক্রান্ত
            প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>
          <li>
            তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  }
  if (["workforce.relation.orphan_daughter", "workforce.relation.sister", "workforce.relation.grand_daughter"].includes(relation)) {
    return (
      <FooterWrapper>
        <ol>
          <li>
            টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
            <ol style={{ listStyleType: "none", paddingLeft: "20px", marginTop: "5px" }}>
              <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
              <li>খ. বিবাহ বন্ধনে আবদ্ধ না হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
            </ol>
          </li>

          <li>অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

          <li>
            উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু/বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
            সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>

          <li>
            তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  }
  if (["workforce.relation.dauther_with_mother"].includes(relation)) {
    return (
      <FooterWrapper>
        <ol>
          <li>
            টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
            <ol style={{ listStyleType: "none", paddingLeft: "20px", marginTop: "5px" }}>
              <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
              <li>খ. </li>
            </ol>
          </li>
          <li>
            শ্রমিকের স্ত্রীর মৃত্যু হলে অথবা পুনরায় বিবাহ বন্ধনে আবদ্ধ হলে, সেক্ষেত্রে তার প্রাপ্য মাসিক টপ-আপ বেনিফিট নিম্নউল্লেখিত হারে মৃত শ্রমিকের উপযুক্ত
            নির্ভরশীল সন্তানদের মধ্যে প্রদেয় হবে।
            <ol style={{ listStyleType: "none", paddingLeft: "20px", marginTop: "5px" }}>
              <li>ক. </li>
              <li>খ. </li>
            </ol>
          </li>
          <li>অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>
          <li>
            উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ সংক্রান্ত
            প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>
          <li>
            তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  }
  if (["workforce.relation.minor_son_with_mother"].includes(relation)) {
    return (
      <FooterWrapper>
        <ol>
          <li>
            টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
            <ol style={{ listStyleType: "none", paddingLeft: "20px", marginTop: "5px" }}>
              <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
              <li>খ. প্রাপ্তবয়স্ক (১৮ বছর) হওয়া পর্যন্ত বেনিফিট পাবেন তবে প্রতিবন্ধী সন্তানের ক্ষেত্রে প্রতিবন্ধিতা শেষ না হলে আমৃত্যু বেনিফিট পাবেন।</li>
            </ol>
          </li>
          <li>
            শ্রমিকের স্ত্রীর মৃত্যু হলে অথবা পুনরায় বিবাহ বন্ধনে আবদ্ধ হলে, সেক্ষেত্রে তার প্রাপ্য মাসিক টপ-আপ বেনিফিট নিম্নউল্লেখিত হারে মৃত শ্রমিকের উপযুক্ত
            নির্ভরশীল সন্তানদের মধ্যে প্রদেয় হবে।
            <ol style={{ listStyleType: "none", paddingLeft: "20px", marginTop: "5px" }}>
              <li>ক. এক ও দুই সন্তানের ক্ষেত্রে ৮৭.৫ শতাংশ</li>
              <li>খ. দুই এর অধিক সন্তানের ক্ষেত্রে ১০০ শতাংশ</li>
            </ol>
          </li>

          <li>অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

          <li>
            উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ সংক্রান্ত
            প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>

          <li>
            তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  }
  if (["workforce.relation.widower_father"].includes(relation)) {
    return (
      <FooterWrapper>
        <ol>
          <li>টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন।</li>

          <li>
            উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ সংক্রান্ত
            প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>

          <li>
            তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  }
  if (["workforce.relation.wife_with_child"].includes(relation)) {
    return (
      <FooterWrapper>
        <ol>
          <li>
            টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না:
            <ol type="a" style={{ marginTop: "5px" }}>
              <li>উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
              <li>পুনঃবিবাহ করেন।</li>
            </ol>
          </li>

          <li>
            শ্রমিকের স্ত্রীর মৃত্যু হলে অথবা পুনরায় বিবাহ বন্ধনে আবদ্ধ হলে, সেক্ষেত্রে তার প্রাপ্য মাসিক টপ-আপ বেনিফিট নিম্মউল্লেখিত হারে মৃত শ্রমিকের উপযুক্ত
            নির্ভরশীল সন্তানদের মধ্যে প্রদেয় হবে।
            <ol type="a" style={{ marginTop: "5px" }}>
              <li>এক ও দুই সন্তানের ক্ষেত্রে ৮৭.৫ শতাংশ</li>
              <li>দুই এর অধিক সন্তানের ক্ষেত্রে ১০০ শতাংশ</li>
            </ol>
          </li>

          <li>অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

          <li>
            উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু, বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
            সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>

          <li>
            তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  }
  if (["workforce.relation.wife_without_child"].includes(relation)) {
    return (
      <FooterWrapper>
        <ol>
          <li>
            টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না:
            <ol type="a" style={{ marginTop: "5px" }}>
              <li>উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
              <li>পুনঃবিবাহ করেন।</li>
            </ol>
          </li>

          <li>
            উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু, বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
            সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>

          <li>
            তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  }

  return null;
};
/**
 * @param {string|null} relation
 * @param {string} applicationType
 */
export function getFooterContentNew(depObj, workerBirthDate, applicationType, paymentType) {
  console.log("applicationtype", applicationType);

  if (applicationType === "disabilityAssistance" && paymentType == "installment") {
    return (
      <FooterWrapper>
        <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
          <li>১। সর্বমোট প্রদেয় লাইফ টাইম টপ-আপ বেনিফিট ত্রৈমাসিক ৩ কিস্তির মাধ্যমে পরিশোধ করা হবে।</li>
          <li>২। শ্রমিকের জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে।</li>
          <li>৩। বিবাহ বন্ধনে আবদ্ধ না হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
          <li>
            ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে অর্থায়ন
            করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  } else if (applicationType === "disabilityAssistance" && paymentType == "onetime") {
    return (
      <FooterWrapper>
        <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
          <li>১। সর্বমোট টপ-আপ বেনিফিট এককালীন পরিশোধ করা হবে।</li>
          <li>২। শ্রমিকের জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। </li>
          <li>
            ৩। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে অর্থায়ন
            করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  } else if (applicationType === "disabilityAssistance" && paymentType == "monthly") {
    return (
      <FooterWrapper>
        <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
          
          <li>১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না বর্ণিত শ্রমিক মৃত্যুবরণ করেন।</li>
          <li>
            ২। শ্রমিকের জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ সংক্রান্ত প্রমাণপত্র প্রতি
            বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>
          <li>
            ৩। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে অর্থায়ন
            করছে।
          </li>
        </ol>
      </FooterWrapper>
    );
  } else {
    console.log("deps", depObj);

    const age = calculateAge(depObj.birthDate);
    const workerAge = calculateAge(workerBirthDate);

    const relation = depObj?.relationWithWorker || depObj?.relationType;
    const marital = depObj.maritalStatus;
    const disability = depObj.isDisabled;

    if (relation === "workforce.relation.wife" && age >= 16 && marital === "workforce.marital_status.widow") {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না:
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. পুনঃবিবাহ করেন।</li>
              </ol>
            </li>

            <li>
              ২। শ্রমিকের স্ত্রীর মৃত্যু হলে অথবা পুনরায় বিবাহ বন্ধনে আবদ্ধ হলে, সেক্ষেত্রে তার প্রাপ্য মাসিক টপ-আপ বেনিফিট নিম্মউল্লেখিত হারে মৃত শ্রমিকের উপযুক্ত
              নির্ভরশীল সন্তানদের মধ্যে প্রদেয় হবে।
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. এক ও দুই সন্তানের ক্ষেত্রে ৮৭.৫ শতাংশ</li>
                <li>খ. দুই এর অধিক সন্তানের ক্ষেত্রে ১০০ শতাংশ</li>
              </ol>
            </li>

            <li>৩। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

            <li>
              ৪। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু, বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>

            <li>
              ৫। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.husband" && age > 18 && marital === "workforce.marital_status.widower") {
      <FooterWrapper>
        <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
          <li>
            ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না:
            <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
              <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
              <li>খ. পুনঃবিবাহ করেন।</li>
            </ol>
          </li>

          <li>
            ২। শ্রমিকের স্বামীর মৃত্যু হলে অথবা পুনরায় বিবাহ বন্ধনে আবদ্ধ হলে, সেক্ষেত্রে তার প্রাপ্য মাসিক টপ-আপ বেনিফিট নিম্মউল্লেখিত হারে মৃত শ্রমিকের উপযুক্ত
            নির্ভরশীল সন্তানদের মধ্যে প্রদেয় হবে।
            <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
              <li>ক. এক ও দুই সন্তানের ক্ষেত্রে ৮৭.৫ শতাংশ</li>
              <li>খ. দুই এর অধিক সন্তানের ক্ষেত্রে ১০০ শতাংশ</li>
            </ol>
          </li>

          <li>৩। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

          <li>
            ৪। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু, বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
            সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
          </li>

          <li>
            ৫। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
            অর্থায়ন করছে।
          </li>
        </ol>
      </FooterWrapper>;
    } else if (relation === "workforce.relation.son") {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. প্রাপ্তবয়স্ক (১৮ বছর) হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>
            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>
            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>
            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.daughter" && marital === "workforce.marital_status.single") {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyleType: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. বিবাহ বন্ধনে আবদ্ধ না হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>

            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু/বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>

            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.brother" && age < 18) {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. প্রাপ্তবয়স্ক (১৮ বছর) হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>
            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>
            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>
            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.sister" && marital === "workforce.marital_status.single") {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. বিবাহ বন্ধনে আবদ্ধ না হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>

            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু/বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>

            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (
      (relation === "workforce.relation.father" && age > workerAge) ||
      (relation === "workforce.relation.mother" && age > workerAge) ||
      relation === "workforce.relation.grand_father" ||
      relation === "workforce.relation.grand_mother"
    ) {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন।</li>
            <li>২। শ্রমিকের পিতা/মাতার কেউ মৃত্যুবরণ করলে সেক্ষেত্রে তার প্রাপ্য মাসিক টপ-আপ বেনিফিট পিতা/মাতার মধ্যে জীবিত সদস্যের নিকট প্রদেয় হবে।</li>
            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ সংক্রান্ত
              প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>
            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/ অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.grand_son" && age < 18) {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>প্রাপ্তবয়স্ক (১৮ বছর) হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>
            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>
            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>
            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.grand_daughter" && age < 18) {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyleType: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. বিবাহ বন্ধনে আবদ্ধ না হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>

            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু/বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>

            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.grand_son_from_daughter" && age < 18) {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. প্রাপ্তবয়স্ক (১৮ বছর) হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>
            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>
            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>
            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.grand_daughter_from_daughter" && age < 18) {
      return (
        <FooterWrapper>
          <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
            <li>
              ১। টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে যতক্ষণ না—
              <ol style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                <li>ক. উপযুক্ত নির্ভরশীল ব্যক্তি মৃত্যুবরণ করেন; অথবা</li>
                <li>খ. বিবাহ বন্ধনে আবদ্ধ না হওয়া পর্যন্ত বেনিফিট পাবেন।</li>
              </ol>
            </li>

            <li>২। অপ্রাপ্তবয়স্ক উপযুক্ত নির্ভরশীল ব্যক্তির প্রাপ্য বেনিফিট তার আইনগত অভিভাবকের একাউন্টে পরিশোধ করা যাবে।</li>

            <li>
              ৩। উপযুক্ত নির্ভরশীল ব্যক্তির জীবনাবস্থার কোন পরিবর্তন ঘটলে (মৃত্যু/বিবাহ) ই.আই.এস পাইলট স্পেশাল ইউনিটকে অবশ্যই অবহিত করতে হবে। এক্ষেত্রে যাচাইকরণ
              সংক্রান্ত প্রমাণপত্র প্রতি বছরান্তে ই.আই.এস পাইলট স্পেশাল ইউনিটকে প্রদান করতে হবে।
            </li>

            <li>
              ৪। তৈরী পোশাক শিল্পের ক্রেতা/ব্র্যান্ডরা স্বেচ্ছায় এবং সাময়িক ভিত্তিতে/অন্তর্বর্তীকালীন সমাধান হিসেবে টপ-আপ বেনিফিট প্রদানের জন্য ই.আই.এস পাইলটকে
              অর্থায়ন করছে।
            </li>
          </ol>
        </FooterWrapper>
      );
    } else if (relation === "workforce.relation.daughter_in_law" && marital === "workforce.marital_status.widowed") {
      return "daughter in law noa";
    } else if (relation === "workforce.relation.illegitimate_son") {
      return "haram son noa";
    } else if (relation === "workforce.relation.illegitimate_daughter" && marital === "workforce.marital_status.single") {
      return "haram daughter noa";
    } else {
      return false;
    }
  }
}

export const isDateDifference150Days = (date1, date2, days = 150) => {
  if (!date1 || !date2) return false;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Check if dates are valid
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    console.warn("Invalid date provided");
    return false;
  }

  // Calculate difference in milliseconds
  const diffTime = Math.abs(d2 - d1);
  
  // Convert to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= days;   // Change to === if you want exactly 150 days
};

export function calculateAge(birthDate) {
  if (!birthDate) return 0;

  const dob = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

export function getRelationForApi(depObj, workerBirthDate) {
  console.log("deps", depObj);

  const age = calculateAge(depObj.birthDate);
  const workerAge = calculateAge(workerBirthDate);

  const relation = depObj?.relationWithWorker || depObj?.relationType;
  const marital = depObj.maritalStatus;
  const disability = depObj.isDisabled;

  // if (relation !== "workforce.relation.wife" && age < 18 && marital === "workforce.marital_status.married") {
  //   return false;
  // }

  if (relation === "workforce.relation.wife") {
    return age >= 16 && marital === "workforce.marital_status.widow";
  } else if (relation === "workforce.relation.husband") {
    return age > 18 && marital === "workforce.marital_status.widower";
  } else if (relation === "workforce.relation.son") {
    if (age < 18) return true;
    if (age >= 18 && disability === "yes") return true;
    return false;
  } else if (relation === "workforce.relation.daughter") {
    return marital === "workforce.marital_status.single";
  } else if (relation === "workforce.relation.brother") {
    return age < 18;
  } else if (relation === "workforce.relation.sister") {
    return marital === "workforce.marital_status.single";
  } else if (relation === "workforce.relation.father") {
    return age > workerAge;
  } else if (relation === "workforce.relation.mother") {
    return age > workerAge;
  } else if (relation === "workforce.relation.grand_father") {
    return true;
  } else if (relation === "workforce.relation.grand_mother") {
    return true;
  } else if (relation === "workforce.relation.grand_son") {
    return age < 18;
  } else if (relation === "workforce.relation.grand_daughter") {
    return age < 18;
  } else if (relation === "workforce.relation.grand_son_from_daughter") {
    return age < 18;
  } else if (relation === "workforce.relation.grand_daughter_from_daughter") {
    return age < 18;
  } else if (relation === "workforce.relation.daughter_in_law") {
    return marital === "workforce.marital_status.widowed";
  } else if (relation === "workforce.relation.illegitimate_son") {
    return true;
  } else if (relation === "workforce.relation.illegitimate_daughter") {
    return marital === "workforce.marital_status.single";
  } else {
    return false;
  }
}

// -----------------------------
// Reusable Wrapper
// -----------------------------
const FooterWrapper = ({ children }) => (
  <div style={{ marginTop: "15px" }}>
    <strong>মাসিক টপ-আপ বেনিফিট ও ই.আই.এস পাইলট সম্পর্কে গুরুত্বপূর্ণ তথ্য:</strong>
    <ol style={{ marginTop: "5px", paddingLeft: "20px" }}>{children}</ol>
  </div>
);

export const getPaymentTypeString = (paymentType) => {
  if (paymentType === "monthly") {
    return "Monthly";
  } else if (paymentType === "onetime") {
    return "One Time";
  } else if (paymentType === "installment") {
    return "Tri Monthly Installment";
  }
};

export const getRelationString = (depObj) => {
  const age = calculateAge(depObj.birthDate);

  const relation = depObj.relationWithWorker;
  const marital = depObj.maritalStatus;
  const disability = depObj.disabilityStatus;

  if (relation === "workforce.relation.brother") {
    return age < 18 ? "Dependent minor brother" : null;
  } else if (relation === "workforce.relation.sister") {
    if (age < 18) {
      return "Dependent minor sister";
    } else if (marital === "workforce.marital_status.single") {
      return "Dependent unmarried sister";
    } else if (marital === "workforce.marital_status.widowed") {
      return "Dependent widowed sister";
    }
    return null;
  } else if (relation === "workforce.relation.daughter") {
    if (disability === "yes") {
      return "Dependent disabled daughter";
    } else if (age < 18) {
      return "Minor daughter";
    } else if (marital === "workforce.marital_status.single") {
      return "Unmarried daughter";
    } else if (marital === "workforce.marital_status.widowed") {
      return "Dependent widowed daughter";
    }
    return null;
  } else if (relation === "workforce.relation.son") {
    if (disability === "yes") {
      return "Dependent disabled son";
    } else if (age < 18) {
      return "Minor son";
    }
    return null;
  } else if (relation === "workforce.relation.husband") {
    return "Dependent widower";
  } else if (relation === "workforce.relation.wife") {
    return "Widow";
  } else if (relation === "workforce.relation.father") {
    return "Dependent father";
  } else if (relation === "workforce.relation.mother") {
    return "Mother";
  } else if (relation === "workforce.relation.grand_father") {
    return "Dependent paternal grandfather";
  } else if (relation === "workforce.relation.grand_mother") {
    return "Dependent paternal grandmother";
  } else if (relation === "workforce.relation.grand_son") {
    return age < 18 ? "Dependent minor son of a deceased son" : null;
  } else if (relation === "workforce.relation.grand_daughter") {
    return age < 18 ? "Dependent minor daughter of a deceased son" : null;
  } else if (relation === "workforce.relation.grand_son_from_daughter") {
    return age < 18 ? "Dependent minor son of a deceased daughter" : null;
  } else if (relation === "workforce.relation.grand_daughter_from_daughter") {
    return age < 18 ? "Dependent minor daughter of a deceased daughter" : null;
  } else if (relation === "workforce.relation.daughter_in_law") {
    return marital === "workforce.marital_status.widowed" ? "Dependent widowed daughter-in-law" : null;
  } else if (relation === "workforce.relation.illegitimate_son") {
    return "Dependent son born out of wedlock";
  } else if (relation === "workforce.relation.illegitimate_daughter") {
    return marital === "workforce.marital_status.single" ? "Dependent unmarried daughter born out of wedlock" : null;
  }

  return null;
};

export function validateMandatoryDocuments(type1Array, type2Array) {
  let errors = [];

  for (const docConfig of type1Array) {
    if (docConfig.mandatoryForApplicant === true) {
      const isUploaded = type2Array.some((uploadedDoc) => uploadedDoc.documentType === docConfig.documentType);

      if (!isUploaded) {
        errors.push({
          documentType: docConfig.documentType,
          message: `Missing mandatory document: ${docConfig.nameEn} (${docConfig.nameBn})`,
        });
      }
    }
  }

  return errors.length > 0 ? { isValid: false, errors } : { isValid: true, errors: null };
}

export function validateMandatoryDocumentsForDependents(
  documentConfigs, // documentType from Redux (type1Array)
  uploadedFiles, // uploadDependentFile (pending uploads)
  dependents, // formData.dependents (contains attachments when saved/loaded)
) {
  const allErrors = [];

  dependents.forEach((dep, index) => {
    if (!dep) return;

    const isDisabled = dep.isDisabled === "yes"; // key missing or "no" → false

    // Build required documents for THIS dependent
    const requiredConfigs = documentConfigs.filter((doc) => {
      if (doc.mandatoryForApplicant !== true) return false;
      if (doc.documentType === "disability_certificate" && !isDisabled) return false;
      return true;
    });

    const depPrefix = `dependent_${index}_`;

    // 1. Pending uploads (newly selected files)
    const pending = (uploadedFiles || []).filter((f) => f.fieldKey?.startsWith(depPrefix));

    // 2. Already saved attachments (from your JSON)
    const saved = (dep.attachments || []).filter((att) => att.fieldKey?.startsWith(depPrefix));

    // Combine both sources
    const allFilesForThisDep = [...pending, ...saved];

    // Check every required document
    requiredConfigs.forEach((docConfig) => {
      const hasFile = allFilesForThisDep.some((item) => {
        const hasMatchingType = item.documentType === docConfig.documentType;
        if (!hasMatchingType) {
          return false;
        }

        if (Array.isArray(item.files)) {
          return item.files.length > 0;
        }

        return !!(item.path || item.url || item.name);
      });

      if (!hasFile) {
        allErrors.push({
          dependentIndex: index,
          dependentName: dep.nameEn || dep.nameBn || `Dependent ${index + 1}`,
          documentType: docConfig.documentType,
          message: `Missing mandatory document for ${dep.nameEn || `Dependent ${index + 1}`}: ${docConfig.nameEn} (${docConfig.nameBn})`,
        });
      }
    });
  });

  return allErrors.length > 0 ? { isValid: false, errors: allErrors } : { isValid: true, errors: null };
}

export const validateMandatoryBankDocumentsForAccounts = (docsConfig, uploadedBankFiles, bankAccounts) => {
  const errors = [];
  const accounts = Array.isArray(bankAccounts) ? bankAccounts : [];

  accounts.forEach((account, accountIndex) => {
    const accountPrefix = `account_${accountIndex}_`;
    const pending = (uploadedBankFiles || []).filter((file) => file.fieldKey?.startsWith(accountPrefix));
    const saved = (account?.attachments && typeof account.attachments === "string" ? JSON.parse(account.attachments) : account?.attachments || []).filter(
      (att) => att.fieldKey?.startsWith(accountPrefix),
    );
    const allFilesForAccount = [...pending, ...saved];

    docsConfig.forEach((docConfig) => {
      const hasFile = allFilesForAccount.some((item) => {
        const typeMatches = item.documentType === docConfig.documentType;
        if (!typeMatches) return false;
        if (Array.isArray(item.files)) return item.files.length > 0;
        return !!(item.path || item.url || item.name);
      });

      if (!hasFile) {
        errors.push({
          accountIndex,
          documentType: docConfig.documentType,
          message: `Missing mandatory bank document for account ${accountIndex + 1}: ${docConfig.nameEn} (${docConfig.nameBn})`,
        });
      }
    });
  });

  return errors.length > 0 ? { isValid: false, errors } : { isValid: true, errors: null };
};

export const toBanglaNumber = (str) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

  return str.toString().replace(/\d/g, (d) => banglaDigits[d]);
};

export const fixBrokenUnicode = (text) => {
  if (typeof text !== "string") return text;

  // Add missing backslash before uXXXX patterns
  const fixed = text.replace(/u([0-9a-fA-F]{4})/g, "\\u$1");

  try {
    return JSON.parse(`"${fixed}"`);
  } catch {
    return text;
  }
};

export const isVerify = () => {
  if (typeof window !== "undefined") {
    return window.location.href.includes("verify");
  }
  return false; // fallback if window is not defined
};

export const formatLabel = (str) => {
  return str
    .replace(/_/g, " ") // replace underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
};

export const getReturnUrl = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('from')) {
    const from = params.get('from');
    if(from==="eis-site"){
      return "https://mis.eis-pilot-bd.org";
    }
    else
    {
      if (window.location.href.includes("skydigitalbd.com") || window.location.href.includes("localhost")) {
        return "https://cf-site-stage.skydigitalbd.com"
      }
      else{
        return "https://labourwelfare.gov.bd"
      }
    }
  }
  else
  {
    if (window.location.href.includes("skydigitalbd.com") || window.location.href.includes("localhost")) {
      return "https://cf-site-stage.skydigitalbd.com"
    }
    else{
      return "https://labourwelfare.gov.bd"
    }
  } 
};

export const formatAddress = (locationData, addressData) => {
    const address = tryParse(addressData) || {};
    const location = tryParse(locationData) || {};

    const postOffice = address?.postOffice?.nameBn || address?.postOffice;
    const village = [address.houseName, address.paraMahalla, address.villageRoad]
      .filter(Boolean)
      .join(", ");

    const thana = location?.parent?.name || location?.name;
    const district = location?.parent?.parent?.name || location?.parent?.name;

    return { village, postOffice, thana, district };
  };


export const getOrdinalNumber = (number) => {
  if (number % 100 >= 11 && number % 100 <= 13) {
    return number + "th";
  }
  switch (number % 10) {
    case 1:
      return number + "st";
    case 2:
      return number + "nd";
    case 3:
      return number + "rd";
    default:
      return number + "th";
  }
}

export const isCfPath = () => {
  if (typeof window !== "undefined") {
    return window.location.href.includes("cf");
  }
  return false; // fallback if window is not defined
  // return true;
};

export const isBlwfPath = () => {
  if (typeof window !== "undefined") {
    return window.location.href.includes("blwf");
  }
  return false; // fallback if window is not defined
  // return true;
};
export const isEisPath = () => {
  if (typeof window !== "undefined") {
    return window.location.href.includes("eis");
  }
  return false; // fallback if window is not defined
  // return true;
};




