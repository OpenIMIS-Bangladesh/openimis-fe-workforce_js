import { useSelector } from "react-redux";
import { WORKFORCE_USER_TYPE } from "../constants";

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
