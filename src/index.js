import messages_en from "./translations/en.json";
import WorkforceMainMenu from "./menu/WorkforceMainMenu";
import reducer from './reducer';


import {
  ROUTE_WORKFORCE_ORGANIZATIONS,
  ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION,
} from "./routes";
import WorkforceOrganizationsPage from "./pages/WorkforceOranigzationsPage";
import WorkforceOrganizationPage from "./pages/WorkforceOrganizationPage";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  reducers: [{ key: 'workforce', reducer }],

 refs: [
    { key: 'workforce.route.organizations.organization', ref: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION },
  ],

  'core.Router': [
    { path: ROUTE_WORKFORCE_ORGANIZATIONS, component: WorkforceOrganizationsPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION, component: WorkforceOrganizationPage },
  ],
  "core.MainMenu": [WorkforceMainMenu],
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};