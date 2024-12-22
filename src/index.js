import messages_en from "./translations/en.json";
import WorkforceMainMenu from "./menu/WorkforceMainMenu";
import reducer from './reducer';


import { ROUTE_WORKFORCE_ORGANIZATIONS, ROUTE_WORKFORCE_ORGANIZATIONS_CREATE } from "./routes";
import WorkforceOrganizationsPage from "./pages/WorkforceOranigzationsPage";
import WorkforceOrganizationPage from "./pages/WorkforceOrganizationPage";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  reducers: [{ key: 'workforce', reducer }],
  'core.Router': [
    { path: ROUTE_WORKFORCE_ORGANIZATIONS, component: WorkforceOrganizationsPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_CREATE, component: WorkforceOrganizationPage },
  ],
  "core.MainMenu": [WorkforceMainMenu],
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};