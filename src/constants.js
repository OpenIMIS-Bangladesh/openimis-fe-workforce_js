export const MODULE_NAME = "workforce";

export const EMPTY_STRING = "";
export const WORKFORCE_MAIN_MENU_CONTRIBUTION_KEY = "workforce.MainMenu";

export const WORKFORCE_GENDER = [
  {
    name: "Male",
    id: "M",
  },
  {
    name: "Female",
    id: "F",
  },
  {
    name: "Other",
    id: "O",
  },
];

export const WORKFORCE_COMPANY_STATUS = [
  "Draft",
  "Pending",
  "Approve",
];

export const WORKFORCE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  DRAFT: "draft",
  INITIAL: "initial",
  SUSPENDED: "suspended",
  TERMINATED: "terminated",
  ON_LEAVE: "on_leave",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  APPROVED: "approved",
  REJECTED: "rejected",
  DEACTIVATED: "deactivated",
  REINSTATED: "reinstated",
  UNDER_REVIEW: "under_review",
  ESCALATED: "escalated",
  WAITING_FOR_INPUT: "waiting_for_input",
  ON_HOLD: "on_hold",
  CANCELED: "canceled",
  EXPIRED: "expired",
  DISABLED: "disabled",
  REASSIGNED: "reassigned",
  RESIGNED: "resigned",
  DG_APPROVED: "send_for_dg_approve",
  APPROVER_FORWARD:"forward_to_approver",
  SECOND_FORWARD:"second_forward",
  THIRD_FORWARD:"third_forward",
  NEW:"new",
  REVERT_TO_APPLICANT:"revert_to_applicant",
  REVERT_TO_CHECKER:"revert_to_checker",
  REVERT:"revert"
};

export const WORKFORCE_USER_TYPE = {
  ADMIN: "admin",
  CHECKER: "checker",
  APPROVER: "approver",
  APPLICANT: "applicant",
  FACTORY_ADMIN: "factory_admin",
};