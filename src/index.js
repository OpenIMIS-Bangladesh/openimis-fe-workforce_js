import messages_en from "./translations/en.json";
import WorkforceMainMenu from "./menu/WorkforceMainMenu";
import reducer from "./reducer";
import {
  ROUTE_WORKFORCE_ORGANIZATIONS,
  ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION,
  ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS,
  ROUTE_WORKFORCE_ORGANIZATIONS_UNITS,
  ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT,
  ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION,
  ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES,
  ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE,
} from "./routes";
import WorkforceOrganizationsPage from "./pages/organization/WorkforceOranigzationsPage";
import WorkforceOrganizationPage from "./pages/organization/WorkforceOrganizationPage";
import WorkforceOrganizationUnitsPage from "./pages/organization-unit/WorkforceOrganizationUnitsPage";
import WorkforceOrganizationUnitPage from "./pages/organization-unit/WorkforceOrganizationUnitPage";
import OrganizationPicker from "./pickers/OrganizationPicker";
import UnitDesignationPage from "./pages/organization-unit-designation/UnitDesignationPage";
import UnitDesignationsPage from "./pages/organization-unit-designation/UnitDesignationsPage";
import OranigzationEmployeesPage from "./pages/organization-employee/OranigzationEmployeesPage";
import OrganizationEmployeePage from "./pages/organization-employee/OrganizationEmployeePage";


const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  reducers: [{ key: "workforce", reducer }],

  refs: [
    { key: "workforce.route.organizations.organization", ref: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION },
    // { key: "workforce.route.organizations.organization", ref: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION },

    { key: "workforce.route.organizations.units.unit", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT },
    { key: "workforce.route.organizations.units", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS },

    { key: "workforce.route.unit.designations.designation", ref: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION },

    { key: "workforce.route.organizations.employees.employee", ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE },
    { key: "workforce.route.organizations.employees", ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES },



    { key: "workforceOrganization.OrganizationPicker", ref: OrganizationPicker },
  ],

  "core.Router": [
    { path: ROUTE_WORKFORCE_ORGANIZATIONS, component: WorkforceOrganizationsPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION, component: WorkforceOrganizationPage },
    { path: `${ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION}/:organization_uuid`, component: WorkforceOrganizationPage },

    { path: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS, component: WorkforceOrganizationUnitsPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT, component: WorkforceOrganizationUnitPage },
    { path: `${ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT}/:organization_unit_uuid`, component: WorkforceOrganizationUnitPage },

    { path: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS, component: UnitDesignationsPage },
    { path: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION, component: UnitDesignationPage },

    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES, component: OranigzationEmployeesPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE, component: OrganizationEmployeePage },
    { path: `${ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE}/:organization_employee_uuid`, component: OrganizationEmployeePage },


  ],

  "core.MainMenu": [WorkforceMainMenu],
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};