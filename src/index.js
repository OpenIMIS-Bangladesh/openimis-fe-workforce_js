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
  ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_DESIGNATION,
  ROUTE_WORKFORCE_OFFICES,
  ROUTE_WORKFORCE_OFFICES_OFFICE,
  ROUTE_WORKFORCE_COMPANIES_COMPANY,
  ROUTE_WORKFORCE_COMPANIES,
  ROUTE_WORKFORCE_FACTORIES,
  ROUTE_WORKFORCE_FACTORIES_FACTORY,
  ROUTE_WORKFORCE_EMPLOYEES,
  ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE,
  ROUTE_WORKFORCE_APPROVE_COMPANIES,
  ROUTE_WORKFORCE_EMPLOYEE_FACTORIES,
  ROUTE_WORKFORCE_APPROVE_COMPANIES_COMPANY,
  ROUTE_WORKFORCE_APPROVE_EDIT_COMPANIES_COMPANY,
  ROUTE_WORKFORCE_EDIT_COMPANIES_COMPANY
} from "./routes";
import WorkforceOrganizationsPage from "./pages/organization/WorkforceOranigzationsPage";
import WorkforceOrganizationPage from "./pages/organization/WorkforceOrganizationPage";
import WorkforceOrganizationUnitsPage from "./pages/organization-unit/WorkforceOrganizationUnitsPage";
import WorkforceOrganizationUnitPage from "./pages/organization-unit/WorkforceOrganizationUnitPage";
import OrganizationPicker from "./pickers/OrganizationPicker";
import CompanyPicker from "./pickers/CompanyPicker";
import OfficePicker from "./pickers/OfficePicker";
import FactoryPicker from "./pickers/FactoryPicker";
import UnitDesignationPage from "./pages/organization-unit-designation/UnitDesignationPage";
import UnitDesignationsPage from "./pages/organization-unit-designation/UnitDesignationsPage";
import OranigzationEmployeesPage from "./pages/organization-employee/OranigzationEmployeesPage";
import OrganizationEmployeePage from "./pages/organization-employee/OrganizationEmployeePage";
import WorkforceEmployeeDesignationPage from "./pages/organization-employee-designation/WorkforceEmployeeDesignationPage";
import OranigzationOfficesPage from "./pages/workforce-office/WorkforceOfficesPage";
import OranigzationOfficePage from "./pages/workforce-office/WorkforceOfficePage";
import OranigzationCompaniesPage from "./pages/workforce-company/WorkforceCompaniesPage";
import OranigzationCompanyPage from "./pages/workforce-company/WorkforceCompanyPage";
import OranigzationFactoriesPage from "./pages/workforce-factory/WorkforceFactoriesPage";
import OranigzationFactoryPage from "./pages/workforce-factory/WorkforceFactoryPage";
import WorkforceEmployeesPage from "./pages/workforce-employee/WorkforceEmployeesPage";
import WorkforceEmployeePage from "./pages/workforce-employee/WorkforceEmployeePage";
import WorkforceEmployeeFactoryPage from "./pages/workforce-employee-factory/WorkforceEmployeeFactoryPage";




const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  reducers: [{ key: "workforce", reducer }],

  refs: [
    { key: "workforce.route.organizations", ref: ROUTE_WORKFORCE_ORGANIZATIONS },
    { key: "workforce.route.organizations.organization", ref: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION },

    { key: "workforce.route.organizations.units.unit", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT },
    { key: "workforce.route.organizations.units", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS },

    { key: "workforce.route.unit.designations", ref: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS },
    { key: "workforce.route.unit.designations.designation", ref: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION },

    { key: "workforce.route.organizations.employees.employee", ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE },
    { key: "workforce.route.organizations.employees", ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES },

    { key: "workforce.route.offices.office", ref: ROUTE_WORKFORCE_OFFICES_OFFICE },
    { key: "workforce.route.offices", ref: ROUTE_WORKFORCE_OFFICES },

    { key: "workforce.route.companies.company", ref: ROUTE_WORKFORCE_COMPANIES_COMPANY },
    { key: "workforce.route.edit.companies.company", ref: ROUTE_WORKFORCE_EDIT_COMPANIES_COMPANY },
    { key: "workforce.route.approve.edit.companies.company", ref: ROUTE_WORKFORCE_APPROVE_EDIT_COMPANIES_COMPANY },
    { key: "workforce.route.approve.companies.company", ref: ROUTE_WORKFORCE_APPROVE_COMPANIES_COMPANY },
    { key: "workforce.route.companies", ref: ROUTE_WORKFORCE_COMPANIES },
    { key: "workforce.route.approve.companies", ref: ROUTE_WORKFORCE_APPROVE_COMPANIES },

    { key: "workforce.route.factories.factory", ref: ROUTE_WORKFORCE_FACTORIES_FACTORY },
    { key: "workforce.route.factories", ref: ROUTE_WORKFORCE_FACTORIES },

    { key: "workforce.route.employees.employee", ref: ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE },
    { key: "workforce.route.employees", ref: ROUTE_WORKFORCE_EMPLOYEES },
    
    { key: "workforce.route.employee.factories", ref: ROUTE_WORKFORCE_EMPLOYEE_FACTORIES },




    { key: "workforceOrganization.OrganizationPicker", ref: OrganizationPicker },
    { key: "workforceOrganization.CompanyPicker", ref: CompanyPicker },
    { key: "workforceOrganization.OfficePicker", ref: OfficePicker },
    { key: "workforceOrganization.FactoryPicker", ref: FactoryPicker },
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
    { path: `${ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION}/:organization_unit_designation_uuid`, component: UnitDesignationPage },

    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES, component: OranigzationEmployeesPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE, component: OrganizationEmployeePage },
    { path: `${ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE}/:organization_employee_uuid`, component: OrganizationEmployeePage },

    { path: ROUTE_WORKFORCE_OFFICES, component: OranigzationOfficesPage },
    { path: ROUTE_WORKFORCE_OFFICES_OFFICE, component: OranigzationOfficePage },
    { path: `${ROUTE_WORKFORCE_OFFICES_OFFICE}/:workforce_office_uuid`, component: OranigzationOfficePage },

    { path: ROUTE_WORKFORCE_COMPANIES, component: OranigzationCompaniesPage },
    { path: ROUTE_WORKFORCE_COMPANIES_COMPANY, component: OranigzationCompanyPage },
    { path: `${ROUTE_WORKFORCE_COMPANIES_COMPANY}/:workforce_company_uuid`, component: OranigzationCompanyPage },
    { path: `${ROUTE_WORKFORCE_EDIT_COMPANIES_COMPANY}/:workforce_company_uuid`, component: OranigzationCompanyPage },

    { path: `${ROUTE_WORKFORCE_APPROVE_COMPANIES_COMPANY}/:workforce_company_uuid`, component: OranigzationCompanyPage },
    { path: ROUTE_WORKFORCE_APPROVE_COMPANIES_COMPANY, component: OranigzationCompanyPage },
    { path: `${ROUTE_WORKFORCE_APPROVE_EDIT_COMPANIES_COMPANY}/:workforce_company_uuid`, component: OranigzationCompanyPage },
    { path: ROUTE_WORKFORCE_APPROVE_COMPANIES, component: OranigzationCompaniesPage },


    { path: ROUTE_WORKFORCE_FACTORIES, component: OranigzationFactoriesPage },
    { path: ROUTE_WORKFORCE_FACTORIES_FACTORY, component: OranigzationFactoryPage },
    { path: `${ROUTE_WORKFORCE_FACTORIES_FACTORY}/:workforce_factory_uuid`, component: OranigzationFactoryPage },

    { path: ROUTE_WORKFORCE_EMPLOYEES, component: WorkforceEmployeesPage },
    { path: ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE, component: WorkforceEmployeePage },
    { path: `${ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE}/:workforce_employee_uuid`, component: WorkforceEmployeePage },


    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_DESIGNATION, component: WorkforceEmployeeDesignationPage },
    { path: ROUTE_WORKFORCE_EMPLOYEE_FACTORIES, component: WorkforceEmployeeFactoryPage },


  ],

  "core.MainMenu": [WorkforceMainMenu],
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};