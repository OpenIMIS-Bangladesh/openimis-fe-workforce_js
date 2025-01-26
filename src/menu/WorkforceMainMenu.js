import React from "react";
import { connect } from "react-redux";
import { ListAlt } from "@material-ui/icons";
import { FormattedMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import {
  WORKFORCE_MAIN_MENU_CONTRIBUTION_KEY,
  MODULE_NAME,
} from "../constants";
import { ROUTE_WORKFORCE_ORGANIZATIONS, ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS,ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES, ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_DESIGNATION, ROUTE_WORKFORCE_APPROVE_COMPANIES } from "../routes";
import { ROUTE_WORKFORCE_ORGANIZATIONS_UNITS,ROUTE_WORKFORCE_OFFICES,ROUTE_WORKFORCE_COMPANIES,ROUTE_WORKFORCE_FACTORIES,ROUTE_WORKFORCE_EMPLOYEES } from "../routes";

function WorkforceMainMenu(props) {
  const entries = [
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.unit" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS_UNITS}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.unit.designation" />,
      icon: <ListAlt />,
      route: `/${ROUTE_ORGANIZATIONS_UNIT_DESIGNATIONS}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.employee" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.employee.designation" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_DESIGNATION}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.company" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_COMPANIES}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.approve.company" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_APPROVE_COMPANIES}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.office" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_OFFICES}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.factory" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_FACTORIES}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
    {
      text: <FormattedMessage module={MODULE_NAME} id="menu.workforce.employee" />,
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_EMPLOYEES}`,
      // filter: (rights) => rights.includes(RIGHT_TICKET_SEARCH),
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(WORKFORCE_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(props.rights)),
  );

  return (
    <MainMenuContribution
      {...props}
      header="Workforce"
      entries={entries}
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(connect(mapStateToProps)(WorkforceMainMenu));
