/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from "react";
import { connect } from "react-redux";
import { ListAlt, AddCircleOutline } from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import {
  WORKFORCE_MAIN_MENU_CONTRIBUTION_KEY,
  MODULE_NAME,
} from "../constants";

function WorkforceMainMenu(props) {
  const ROUTE_WORKFORCE_ORGANIZATIONS = "workforce/organizations";
  const entries = [
    {
      // text: formatMessage(props.intl, MODULE_NAME, "menu.workforce.organizations"),
      text: "Workforce Organizations",
      icon: <ListAlt />,
      route: `/${ROUTE_WORKFORCE_ORGANIZATIONS}`,
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
