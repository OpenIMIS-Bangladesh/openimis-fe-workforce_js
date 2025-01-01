import messages_en from "./translations/en.json";
import WorkforceMainMenu from "./menu/WorkforceMainMenu";
import reducer from "./reducer";


import {
  ROUTE_WORKFORCE_ORGANIZATIONS,
  ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION,
  ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION_EDIT,
  ROUTE_WORKFORCE_ORGANIZATIONS_UNITS,
  ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT,
} from "./routes";
import WorkforceOrganizationsPage from "./pages/organization/WorkforceOranigzationsPage";
import WorkforceOrganizationPage from "./pages/organization/WorkforceOrganizationPage";
import WorkforceOrganizationUnitsPage from "./pages/organization-unit/WorkforceOrganizationUnitsPage";
import WorkforceOrganizationUnitPage from "./pages/organization-unit/WorkforceOrganizationUnitPage";
import OrganizationParentPicker from "./pickers/OrganizationParentPicker";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  reducers: [{ key: "workforce", reducer }],

  refs: [
    { key: "workforce.route.organizations.organization", ref: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION },

    { key: "workforce.route.organizations.units.unit", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT },
    { key: "workforce.route.organizations.units", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS },

    { key: "workforceOrganization.OrganizationParentPicker", ref: OrganizationParentPicker },
  ],

  "core.Router": [
    { path: ROUTE_WORKFORCE_ORGANIZATIONS, component: WorkforceOrganizationsPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION, component: WorkforceOrganizationPage },
    { path: `${ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION}/:organization_uuid`, component: WorkforceOrganizationPage },

    { path: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS, component: WorkforceOrganizationUnitsPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT, component: WorkforceOrganizationUnitPage },
    { path: `${ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT}/:ticket_uuid`, component: WorkforceOrganizationUnitPage },

  ],

  "core.MainMenu": [WorkforceMainMenu],
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};