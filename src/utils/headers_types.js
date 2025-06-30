  export const headersAdmin = (component) => [
     "",
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.verifier",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerDirector = (component) => [
     "",
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.verifier",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    component.isShowHistory() ? "workforce.version" : "",
  ];

  export const headerApplicant = (component) => [
    "workforce.employee.name.en",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationDate",
    "workforce.employee.application.status",
    // "workforce.employee.application.revertNote",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerFactoryAdmin = (component) => [
    "",
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerChecker = (component) => [
    "",
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerApprover = (component) => [
     "",
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    // "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    component.isShowHistory() ? "workforce.version" : "",
  ];