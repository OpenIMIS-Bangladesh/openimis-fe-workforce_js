import messages_en from "./translations/en.json";
import WorkforceMainMenu from "./menu/WorkforceMainMenu";
import reducer from './reducer';


import { ROUTE_WORKFORCE_ORGANIZATIONS } from "./routes";
import WorkforceOrganizationsPage from "./pages/WorkforceOranigzationsPage";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  reducers: [{ key: 'workforce', reducer }],
  'core.Router': [
    { path: ROUTE_WORKFORCE_ORGANIZATIONS, component: WorkforceOrganizationsPage },
  ],
  "core.MainMenu": [WorkforceMainMenu],
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};