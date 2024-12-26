import messages_en from "./translations/en.json";
import WorkforceMainMenu from "./menu/WorkforceMainMenu";
import reducer from './reducer';


import {
  ROUTE_WORKFORCE_ORGANIZATIONS,
  ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION,
  ROUTE_WORKFORCE_ORGANIZATIONS_UNITS,
  ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT
} from "./routes";
import WorkforceOrganizationsPage from "./pages/WorkforceOranigzationsPage";
import WorkforceOrganizationPage from "./pages/WorkforceOrganizationPage";
import WorkforceOranigzationsUnitPage from "./pages/WorkforceOranigzationsUnitPage";
import WorkforceOrganizationUnitPage from "./pages/WorkforceOrganizationUnitPage";
import ParentPicker from "./pickers/ParentPicker";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  reducers: [{ key: 'workforce', reducer }],

 refs: [
    { key: 'workforce.route.organizations.organization', ref: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION },
    { key: 'workforce.route.organizations.organization.units.unit', ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT },
    { key: 'workforceOrganization.ParentPicker', ref: ParentPicker },
    { key: 'workforceOrganization.ParentPicker', ref: ParentPicker },
  ],

  'core.Router': [
    { path: ROUTE_WORKFORCE_ORGANIZATIONS, component: WorkforceOrganizationsPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION, component: WorkforceOrganizationPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS, component: WorkforceOranigzationsUnitPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT, component: WorkforceOrganizationUnitPage },
  ],
  "core.MainMenu": [WorkforceMainMenu],
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};