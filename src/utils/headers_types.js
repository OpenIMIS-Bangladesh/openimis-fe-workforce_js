  export const headersAdmin = (component) => [
     "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.verifier",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerDirector = (component) => [
     "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.verifier",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    component.isShowHistory() ? "workforce.version" : "",
  ];

  export const headerApplicant = (component) => [
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.status",
    // "workforce.employee.application.revertNote",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerFactoryAdmin = (component) => [
    "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.status",
    "workforce.application.submittedBy",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerChecker = (component) => [
    "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerAssociation = (component) => [
    "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerApprover = (component) => [
     "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    component.isShowHistory() ? "workforce.version" : "",
  ];