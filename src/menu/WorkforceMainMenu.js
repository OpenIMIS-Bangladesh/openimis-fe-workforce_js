import React from "react";
import { connect } from "react-redux";
import { ListAlt } from "@material-ui/icons";
import { FormattedMessage, MainMenuContribution, withModulesManager, formatMessage } from "@openimis/fe-core";
import {
  WORKFORCE_MAIN_MENU_CONTRIBUTION_KEY,
  MODULE_NAME, WORKFORCE_USER_TYPE,
} from "../constants";
import {
  ROUTE_WORKFORCE_ORGANIZATIONS,
  ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS,
  ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES,
  ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_DESIGNATION,
  ROUTE_WORKFORCE_APPROVE_COMPANIES,
  ROUTE_WORKFORCE_ORGANIZATIONS_UNITS,
  ROUTE_WORKFORCE_OFFICES,
  ROUTE_WORKFORCE_COMPANIES,
  ROUTE_WORKFORCE_FACTORIES,
  ROUTE_WORKFORCE_EMPLOYEES,
  ROUTE_WORKFORCE_EMPLOYEE_FACTORIES,
  ROUTE_WORKFORCE_BANKS,
  ROUTE_WORKFORCE_REGISTRATION,
  ROUTE_WORKFORCE_APPLICATION,
  ROUTE_WORKFORCE_APPLICATIONS_PROCESS,
  ROUTE_WORKFORCE_DOCUMENTS,
  ROUTE_WORKFORCE_FACTORY_EMPLOYEE_DESIGNATION,
  ROUTE_WORKFORCE_ASSOCIATIONS,
  ROUTE_WORKFORCE_ASSOCIATION_USER_MAP
} from "../routes";
import { RIGHT_WORKFORCE_EMPLOYER_APPROVE } from "../permission-rights";
import { getUserType, isEmptyObject } from "../utils/utils";


function WorkforceMainMenu(props) {

  const user_type = getUserType();

  const entries = [
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS}`,
      id: `menu.workforce.organizations`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.unit" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS_UNITS}`,
      id: `menu.workforce.organizations.unit`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.unit.designation" />,
      icon: <ListAlt />,
      route: `/${ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS}`,
      id: `menu.workforce.organizations.unit.designation`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.employee" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES}`,
      id: `menu.workforce.organizations.employee`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.employee.designation" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_DESIGNATION}`,
      id: `menu.workforce.organizations.employee.designation`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.company" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_COMPANIES}`,
      id: `menu.workforce.companies`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },

    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.office" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_OFFICES}`,
      id: `menu.workforce.offices`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.factory" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_FACTORIES}`,
      id: `menu.workforce.factories`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.factory.employee.designation" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_FACTORY_EMPLOYEE_DESIGNATION}`,
      id: `menu.workforce.factory.employee.designation`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.approve.company" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_APPROVE_COMPANIES}`,
      id: `menu.workforce.approve.company`,
      filter: (rights) => rights.includes(RIGHT_WORKFORCE_EMPLOYER_APPROVE),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.employee" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_EMPLOYEES}`,
      id: `menu.workforce.employees`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.application" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_APPLICATION}`,
      id: `menu.workforce.application`,
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.application.process" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_APPLICATIONS_PROCESS}`,
      id: `menu.workforce.application.process`,
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.banks" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_BANKS}`,
      id: `menu.workforce.banks`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.association" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ASSOCIATIONS}`,
      id: `menu.workforce.association`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.documents" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_DOCUMENTS}`,
      id: `menu.workforce.documents`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.association.user.map" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ASSOCIATION_USER_MAP}`,
      id: `menu.workforce.association.user.map`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    // {
    //   text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.employee.factory" />,
    //   icon: <ListAlt />,
    //   route: `/${ROUTE_WORKFORCE_EMPLOYEE_FACTORIES}`,
    //   // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    // },
  ];
  const factory_entries = [
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.factory" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_FACTORIES}`,
      id: `menu.workforce.factories`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.factory.employee.designation" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_FACTORY_EMPLOYEE_DESIGNATION}`,
      id: `menu.workforce.factory.employee.designation`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },

    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.employee" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_EMPLOYEES}`,
      id: `menu.workforce.employees`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.association.user.map" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ASSOCIATION_USER_MAP}`,
      id: `menu.workforce.association.user.map`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
  ];


  const factory_admin_entries = [
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.employee" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_EMPLOYEES}`,
      id: `menu.workforce.employees`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },

  ];
  if (user_type === WORKFORCE_USER_TYPE.ADMIN || user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR) {
    return (
      <MainMenuContribution
        {...props}
        header={<FormattedMessage module="workforce" id="menu.workforce" />}
        entries={entries}
        menuId="WorkforceMainMenu"
      />
    );
  } 
  else if (user_type.includes("association")) {
    return (
      <MainMenuContribution 
        {...props}
        header={<FormattedMessage module="workforce" id="menu.factory.management" />}
        entries={factory_entries}
        menuId="WorkforceMainMenu"
      />
    )
  }
  else if (user_type== WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
    return (
      <MainMenuContribution 
        {...props}
        header={<FormattedMessage module="workforce" id="menu.factory.management" />}
        entries={factory_admin_entries}
        menuId="WorkforceMainMenu"
      />
    )
  }
  else {
    return <></>;
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(connect(mapStateToProps)(WorkforceMainMenu));
