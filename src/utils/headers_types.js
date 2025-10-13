  export const headersAdmin = (component) => [
  "workforce.application.tracking.number",
  "workforce.employee.application.applicationDate",
  "workforce.employee.name",
  "workforce.employee.application.factoryName",
  "workforce.employee.application.applicationType",
  "workforce.employee.application.moneyAmount",
  "workforce.employee.application.status",
  component.isShowHistory() ? "workforce.version" : "",

  // 1️⃣ View header — always visible
  "view",
  // 2️⃣ Revert header — visible only when disableButtons !== 1
  component.props.disableButtons !== 1 && "revert" ,

  // 3️⃣ Reject header — visible only when disableButtons !== 1
  component.props.disableButtons !== 1 && "reject" ,
];

  export const headerDirector = (component) => [
    //  "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    component.isShowHistory() ? "workforce.version" : "",
  ];

  export const headerApplicant = (component) => [
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.serviceProviderName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.status",
    "view",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerFactoryAdmin = (component) => [
    // "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.status",
    "workforce.application.submittedBy",
    "view",
   ...(component.props.disableButtons !== 1 && !component.props.revertedApplication
    ? ["verify", "revert"]
    : []),
    // "verify",
    // "revert",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerChecker = (component) => [
  "workforce.application.tracking.number",
  "workforce.employee.application.applicationDate",
  "workforce.employee.name",
  "workforce.employee.application.factoryName",
  "workforce.employee.application.applicationType",
  // "workforce.employee.application.moneyAmount",
  "workforce.employee.application.status",
  "view",
  // ✅ Conditionally add verify & revert (when buttons are enabled)
  ...(component.props.disableButtons !== 1
    ? ["verify", "revert"]
    : []),
  // ✅ Conditionally add resend (when reverted applications exist)
  ...(component.props.revertedApplication
    ? ["resend"]
    : []),
  // ✅ Conditionally add version column
  ...(component.isShowHistory() ? ["workforce.version"] : []),
];

  export const headerCheckerTwo = (component) => [
    // "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    // "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    "view",
    "verify",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerDeputyAsstDirector = (component) => [
    // "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    "view",
    "verify",
    component.isShowHistory() ? "workforce.version" : "",
  ];
  export const headerSectionAdmin = (component) => [
  "workforce.application.tracking.number",
  "workforce.employee.application.applicationDate",
  "workforce.employee.name",
  "workforce.employee.application.factoryName",
  "workforce.employee.application.applicationType",
  // "workforce.employee.application.moneyAmount",
  "workforce.employee.application.nid",
  "workforce.employee.application.status",

  // ✅ Conditionally add "workforce.version"
  ...(component.isShowHistory() ? ["workforce.version"] : []),

  // ✅ Always show "view"
  "view",

  // ✅ Conditionally add "verify", "revert", "reject" when buttons enabled and not reverted
  ...(component.props.disableButtons !== 1 && !component.props.revertedApplication
    ? ["verify", "revert", "reject"]
    : []),

  // ✅ Conditionally add "resend" when revertedApplication is true
  ...(component.props.revertedApplication ? ["resend"] : []),
];

  export const headerSectionTwoAdmin = (component) => [
  "workforce.application.tracking.number",
  "workforce.employee.application.applicationDate",
  "workforce.employee.name",
  "workforce.employee.application.factoryName",
  "workforce.employee.application.applicationType",
  // "workforce.employee.application.moneyAmount",
  "workforce.employee.application.nid",
  "workforce.employee.application.status",

  // ✅ Conditionally add version column
  ...(component.isShowHistory() ? ["workforce.version"] : []),

  // ✅ Always show "view"
  "view",

  // ✅ Conditionally show verify & revert & reject (only if not reverted)
  ...(component.props.disableButtons !== 1 && !component.props.revertedApplication
    ? ["verify", "revert", "reject"]
    : []),

  // ✅ Conditionally show resend (only if reverted)
  ...(component.props.disableButtons !== 1 && component.props.revertedApplication
    ? ["resend"]
    : []),
];

   export const headerBlwfSectionAdmin = (component) => [
  "workforce.application.tracking.number",
  "workforce.employee.application.applicationDate",
  "workforce.employee.name",
  "workforce.employee.application.applicationType",
  "workforce.employee.application.moneyAmount",
  "workforce.employee.application.nid",
  "workforce.employee.application.status",

  // ✅ Conditionally show version
  ...(component.isShowHistory() ? ["workforce.version"] : []),

  // ✅ Always show "view"
  "view",

  // ✅ Conditionally show verify, revert, reject (only if not reverted)
  ...(component.props.disableButtons !== 1 && !component.props.revertedApplication
    ? ["verify", "revert", "reject"]
    : []),

  // ✅ Conditionally show resend (only if reverted)
  ...(component.props.disableButtons !== 1 && component.props.revertedApplication
    ? ["resend"]
    : []),
];

  export const headerDoctor = (component) => [
  "workforce.application.tracking.number",
  "workforce.employee.application.applicationDate",
  "workforce.employee.name",
  "workforce.employee.application.factoryName",
  "workforce.employee.application.applicationType",
  "workforce.employee.application.moneyAmount",
  "workforce.employee.application.status",

  // ✅ Conditionally add version column
  ...(component.isShowHistory() ? ["workforce.version"] : []),

  // ✅ Always show "view"
  "view",

  // ✅ Conditionally show verify, approve & revert (only if not reverted)
  ...(component.props.disableButtons !== 1 && !component.props.revertedApplication
    ? ["verify", "approve", "revert"]
    : []),

  // ✅ Conditionally show resend (only if reverted)
  ...(component.props.disableButtons !== 1 && component.props.revertedApplication
    ? ["resend"]
    : []),
];

 export const headerAssociation = (component) => [
  "workforce.application.tracking.number",
  "workforce.employee.application.applicationDate",
  "workforce.employee.name",
  "workforce.employee.application.factoryName",
  "workforce.employee.application.applicationType",
  "workforce.employee.application.status",
  "view",
  // ✅ Conditionally add verify & revert
  ...(component.props.disableButtons !== 1 && !component.props.revertedApplication
    ? ["verify", "revert"]
    : []),
  // ✅ Conditionally add resend
  ...(component.props.disableButtons !== 1 && component.props.revertedApplication
    ? ["resend"]
    : []),
  // ✅ Conditionally add version column
  ...(component.isShowHistory() ? ["workforce.version"] : []),
];

  export const headerApprover = (component) => [
    //  "",
    "workforce.application.tracking.number",
    "workforce.employee.application.applicationDate",
    "workforce.employee.name",
    "workforce.employee.application.applicationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.status",
    component.isShowHistory() ? "workforce.version" : "",
  ];