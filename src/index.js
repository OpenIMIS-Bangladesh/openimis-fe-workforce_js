import messages_en from "./translations/en.json";
import messages_bn from "./translations/bn.json";
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
  ROUTE_WORKFORCE_EDIT_COMPANIES_COMPANY,
  ROUTE_WORKFORCE_BANKS,
  ROUTE_WORKFORCE_BANKS_BANK,
  ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE_ACCOUNT_INFO,
  ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE_SERVICES,
  ROUTE_WORKFORCE_EMPLOYEES_DEPENDENTS,
  ROUTE_WORKFORCE_EMPLOYEES_DEPENDENTS_DEPENDENT,
  ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS,
  ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS_INFO,
  ROUTE_WORKFORCE_EMPLOYEES_ACCOUNT_INFOS,
  ROUTE_WORKFORCE_EMPLOYEES_ACCOUNT_INFOS_INFO,
  ROUTE_WORKFORCE_EMPLOYEES_SERVICES,
  ROUTE_WORKFORCE_EMPLOYEES_SERVICES_SERVICE,
  ROUTE_WORKFORCE_REGISTRATION,
  ROUTE_WORKFORCE_APPLICATION,
  ROUTE_WORKFORCE_APPLICATIONS_PROCESS,
  ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VIEW_PROCESS,
  ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VERIFY,
  ROUTE_HOME,
  ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_ACTIONS,
  ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_RESEND,
  ROUTE_WORKFORCE_FACTORY_EMPLOYEE_DESIGNATION
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
import OrganizationEmployeesPage from "./pages/organization-employee/OrganizationEmployeesPage";
import OrganizationEmployeePage from "./pages/organization-employee/OrganizationEmployeePage";
import OrganizationEmployeeDesignationPage
  from "./pages/organization-employee-designation/OrganizationEmployeeDesignationPage";
import OrganizationOfficesPage from "./pages/workforce-office/WorkforceOfficesPage";
import OrganizationOfficePage from "./pages/workforce-office/WorkforceOfficePage";
import OrganizationCompaniesPage from "./pages/workforce-company/WorkforceCompaniesPage";
import OrganizationCompanyPage from "./pages/workforce-company/WorkforceCompanyPage";
import OrganizationFactoriesPage from "./pages/workforce-factory/WorkforceFactoriesPage";
import OrganizationFactoryPage from "./pages/workforce-factory/WorkforceFactoryPage";
import WorkforceEmployeesPage from "./pages/workforce-employee/WorkforceEmployeesPage";
import WorkforceEmployeePage from "./pages/workforce-employee/WorkforceEmployeePage";
import WorkforceBanksPage from "./pages/workforce-banks/WorkforceBanksPage";
import WorkforceBankPage from "./pages/workforce-banks/WorkforceBankPage";
import BanksPicker from "./pickers/BanksPicker";
import DependentsPage from "./pages/workforce-employee/dependent/DependentsPage";
import DependentPage from "./pages/workforce-employee/dependent/DependentPage";
import AccidentInfosPage from "./pages/workforce-employee/accident-info/AccidentInfosPage";
import AccidentInfoPage from "./pages/workforce-employee/accident-info/AccidentInfoPage";
import AccountInfosPage from "./pages/workforce-employee/account-info/AccountInfosPage";
import AccountInfoPage from "./pages/workforce-employee/account-info/AccountInfoPage";
import ServicesPage from "./pages/workforce-employee/services/ServicesPage";
import ServicePage from "./pages/workforce-employee/services/ServicePage";
import RegistrationPage from "./pages/registration/RegistrationPage";
import MultiStepApplyForm from "./pages/application/MultiStepApplyForm";
import ApplicationsProcessPage from "./pages/application-process/ApplicationsProcessPage";
import RegistrationButton from "./pages/registration/RegistrationButton";
import ApplicationProcessPage from "./pages/application-process/ApplicationProcessPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DashboardRelay from "./pages/dashboard/DashboardRelay";
import ApplicantDashboardPage from "./pages/dashboard/ApplicantDashboardPage";
import CheckerDashboardPage from "./pages/dashboard/CheckerDashboardPage";
import ApproverDashboardPage from "./pages/dashboard/ApproverDashboardPage";
import NotificationBar from "./components/app-bar/NotificationBar";
import ActionsApplicationPage from "./pages/application-process/ActionsApplicationPage";
import ResendApplicationPage from "./pages/application-process/ResendApplicationPage";
import WorkforceEmployeeDesignationPage from "./pages/workforce-employee-designation/WorkforceEmployeeDesignationPage";
import VerifyApplicationPage from "./pages/application-process/VerifyApplicationPage";
// import DependentsPage from "./pages/workforce-employee/dependent/DependentsPage";


const DEFAULT_CONFIG = {
  "translations": [{ key: "fr", messages: messages_bn },{ key: "en", messages: messages_en } ],
  reducers: [{ key: "workforce", reducer }],

  refs: [
    { key: "route.home", ref: ROUTE_HOME },
    { key: "workforce.route.organizations", ref: ROUTE_WORKFORCE_ORGANIZATIONS },
    { key: "workforce.route.organizations.organization", ref: ROUTE_WORKFORCE_ORGANIZATIONS_ORGANIZATION },

    { key: "workforce.route.organizations.units.unit", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT },
    { key: "workforce.route.organizations.units", ref: ROUTE_WORKFORCE_ORGANIZATIONS_UNITS },

    { key: "workforce.route.unit.designations", ref: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS },
    { key: "workforce.route.unit.designations.designation", ref: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION },

    { key: "workforce.route.organizations.employees.employee", ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE },

    {
      key: "workforce.route.organizations.employees.employee.account.info",
      ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE_ACCOUNT_INFO,
    },
    {
      key: "workforce.route.organizations.employees.employee.services",
      ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE_SERVICES,
    },
    // { key: "workforce.route.organizations.employees.employee.dependent", ref: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE_DEPENDENT },
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

    { key: "workforce.route.registration", ref: ROUTE_WORKFORCE_REGISTRATION },
    { key: "workforce.route.application", ref: ROUTE_WORKFORCE_APPLICATION },
    {
      key: "workforce.route.applications.application.process.view",
      ref: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VIEW_PROCESS,
    },
    {
      key: "workforce.route.applications.application.process.actions",
      ref: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_ACTIONS,
    },
    {
      key: "workforce.route.applications.application.process.resend",
      ref: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_RESEND,
    },
    { key: "workforce.route.applications.application.verify", ref: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VERIFY },
    { key: "workforce.route.applications.process", ref: ROUTE_WORKFORCE_APPLICATIONS_PROCESS },

    { key: "workforce.route.employees.accident.infos", ref: ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS },
    { key: "workforce.route.employees.accident.infos.info", ref: ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS_INFO },

    { key: "workforce.route.employees.account.infos", ref: ROUTE_WORKFORCE_EMPLOYEES_ACCOUNT_INFOS },
    { key: "workforce.route.employees.account.infos.info", ref: ROUTE_WORKFORCE_EMPLOYEES_ACCOUNT_INFOS_INFO },

    { key: "workforce.route.employees.dependents", ref: ROUTE_WORKFORCE_EMPLOYEES_DEPENDENTS },

    { key: "workforce.route.employees.dependents.dependent", ref: ROUTE_WORKFORCE_EMPLOYEES_DEPENDENTS_DEPENDENT },
    { key: "workforce.route.employees.services", ref: ROUTE_WORKFORCE_EMPLOYEES_SERVICES },
    { key: "workforce.route.employees.services.service", ref: ROUTE_WORKFORCE_EMPLOYEES_SERVICES_SERVICE },

    { key: "workforce.route.employee.factories", ref: ROUTE_WORKFORCE_EMPLOYEE_FACTORIES },

    { key: "workforce.route.banks", ref: ROUTE_WORKFORCE_BANKS },
    { key: "workforce.route.banks.bank", ref: ROUTE_WORKFORCE_BANKS_BANK },


    { key: "workforceOrganization.OrganizationPicker", ref: OrganizationPicker },
    { key: "workforce.BanksPicker", ref: BanksPicker },
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
    {
      path: `${ROUTE_WORKFORCE_ORGANIZATIONS_UNITS_UNIT}/:organization_unit_uuid`,
      component: WorkforceOrganizationUnitPage,
    },

    { path: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS, component: UnitDesignationsPage },
    { path: ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION, component: UnitDesignationPage },
    {
      path: `${ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS_DESIGNATION}/:organization_unit_designation_uuid`,
      component: UnitDesignationPage,
    },

    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES, component: OrganizationEmployeesPage },
    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE, component: OrganizationEmployeePage },
    {
      path: `${ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE}/:organization_employee_uuid`,
      component: OrganizationEmployeePage,
    },

    { path: ROUTE_WORKFORCE_OFFICES, component: OrganizationOfficesPage },
    { path: ROUTE_WORKFORCE_OFFICES_OFFICE, component: OrganizationOfficePage },
    { path: `${ROUTE_WORKFORCE_OFFICES_OFFICE}/:workforce_office_uuid`, component: OrganizationOfficePage },

    { path: ROUTE_WORKFORCE_COMPANIES, component: OrganizationCompaniesPage },
    { path: ROUTE_WORKFORCE_COMPANIES_COMPANY, component: OrganizationCompanyPage },
    { path: `${ROUTE_WORKFORCE_COMPANIES_COMPANY}/:workforce_company_uuid`, component: OrganizationCompanyPage },
    { path: `${ROUTE_WORKFORCE_EDIT_COMPANIES_COMPANY}/:workforce_company_uuid`, component: OrganizationCompanyPage },

    {
      path: `${ROUTE_WORKFORCE_APPROVE_COMPANIES_COMPANY}/:workforce_company_uuid`,
      component: OrganizationCompanyPage,
    },
    { path: ROUTE_WORKFORCE_APPROVE_COMPANIES_COMPANY, component: OrganizationCompanyPage },
    {
      path: `${ROUTE_WORKFORCE_APPROVE_EDIT_COMPANIES_COMPANY}/:workforce_company_uuid`,
      component: OrganizationCompanyPage,
    },
    { path: ROUTE_WORKFORCE_APPROVE_COMPANIES, component: OrganizationCompaniesPage },


    { path: ROUTE_WORKFORCE_FACTORIES, component: OrganizationFactoriesPage },
    { path: ROUTE_WORKFORCE_FACTORIES_FACTORY, component: OrganizationFactoryPage },
    { path: `${ROUTE_WORKFORCE_FACTORIES_FACTORY}/:workforce_factory_uuid`, component: OrganizationFactoryPage },

    { path: ROUTE_WORKFORCE_EMPLOYEES, component: WorkforceEmployeesPage },
    { path: ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE, component: WorkforceEmployeePage },
    { path: `${ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE}/:workforce_employee_uuid`, component: WorkforceEmployeePage },
    { path: `${ROUTE_WORKFORCE_EMPLOYEES_DEPENDENTS}/:workforce_employee_uuid`, component: DependentsPage },
    { path: ROUTE_WORKFORCE_EMPLOYEES_DEPENDENTS_DEPENDENT, component: DependentPage },
    { path: `${ROUTE_WORKFORCE_EMPLOYEES_DEPENDENTS_DEPENDENT}/:dependent_uuid`, component: DependentPage },

    { path: `${ROUTE_WORKFORCE_EMPLOYEES_SERVICES}/:dependent_uuid`, component: ServicesPage },
    { path: ROUTE_WORKFORCE_EMPLOYEES_SERVICES_SERVICE, component: ServicePage },
    { path: `${ROUTE_WORKFORCE_EMPLOYEES_SERVICES_SERVICE}/:service_uuid`, component: ServicePage },

    { path: `${ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS}/:workforce_employee_uuid`, component: AccidentInfosPage },
    { path: ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS_INFO, component: AccidentInfoPage },
    { path: `${ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS_INFO}/:workforce_employee_uuid`, component: AccidentInfoPage },

    { path: `${ROUTE_WORKFORCE_EMPLOYEES_ACCOUNT_INFOS}/:workforce_employee_uuid`, component: AccountInfosPage },
    { path: ROUTE_WORKFORCE_EMPLOYEES_ACCOUNT_INFOS_INFO, component: AccountInfoPage },
    { path: `${ROUTE_WORKFORCE_EMPLOYEES_ACCOUNT_INFOS_INFO}/:workforce_employee_uuid`, component: AccountInfoPage },


    { path: ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_DESIGNATION, component: OrganizationEmployeeDesignationPage },
    { path: ROUTE_WORKFORCE_FACTORY_EMPLOYEE_DESIGNATION, component: WorkforceEmployeeDesignationPage },
    // { path: ROUTE_WORKFORCE_EMPLOYEE_FACTORIES, component: WorkforceEmployeeDesignationPage },

    { path: ROUTE_WORKFORCE_BANKS, component: WorkforceBanksPage },
    { path: ROUTE_WORKFORCE_BANKS_BANK, component: WorkforceBankPage },
    { path: `${ROUTE_WORKFORCE_BANKS_BANK}/:bank_uuid`, component: WorkforceBankPage },

    { path: ROUTE_WORKFORCE_APPLICATION, component: MultiStepApplyForm },
    { path: `${ROUTE_WORKFORCE_APPLICATION}/:application_uuid`, component: MultiStepApplyForm },
    { path: ROUTE_WORKFORCE_APPLICATIONS_PROCESS, component: ApplicationsProcessPage },
    { path: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VIEW_PROCESS, component: ApplicationProcessPage },
    {
      path: `${ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VIEW_PROCESS}/:application_uuid`,
      component: ApplicationProcessPage,
    },
    { path: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_ACTIONS, component: ActionsApplicationPage },
   {
      path: `${ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_ACTIONS}/:application_uuid`,
      component: ActionsApplicationPage,
    },
    { path: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_RESEND, component: ResendApplicationPage },
   {
      path: `${ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_RESEND}/:application_uuid`,
      component: ResendApplicationPage,
    },
    { path: ROUTE_WORKFORCE_APPLICATIONS_PROCESS, component: ApplicationsProcessPage },
    { path: ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VERIFY, component: ApplicationProcessPage },
    { path: `${ROUTE_WORKFORCE_APPLICATIONS_APPLICATION_VERIFY}/:application_uuid`, component: VerifyApplicationPage },
  ],

  "core.UnauthenticatedRouter": [
    { path: ROUTE_WORKFORCE_REGISTRATION, component: RegistrationPage },
  ],

  "core.MainMenu": [WorkforceMainMenu],

  "core.LoginPage": RegistrationButton,
  "core.AppBar": NotificationBar,
  "home.HomePage.Blocks": DashboardRelay,
};

export const WorkforceModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};