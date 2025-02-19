import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, FormattedMessage, decodeId,
} from "@openimis/fe-core";

import { MODULE_NAME } from "../../constants";

import OrganizationOfficeSearcher from "../../components/workforce-office/WorkforceOfficeSearcher";
import { ROUTE_WORKFORCE_OFFICES_OFFICE } from "../../routes";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,ROUTE_WORKFORCE_OFFICES_OFFICE
});

class WorkforceOfficesPage extends Component {
  onDoubleClick = (office, newTab = false) => {
    const routeParams = ['workforce.route.offices.office', [decodeId(office.id)]];
    if (office?.isHistory) {
      routeParams[1].push(office.version);
    }
    historyPush(this.props.modulesManager, this.props.history, ...routeParams, newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, 'workforce.route.offices.office');
  };

  render() {
    const { intl, classes, rights } = this.props;

    return (
      <div className={classes.page}>
        <OrganizationOfficeSearcher
          cacheFiltersKey="ticketPageFiltersCache"
          onDoubleClick={this.onDoubleClick}
        />
        {/*{rights.includes(RIGHT_ORGANIZATION_CREATE)*/}
        {/*  && withTooltip(*/}
        {withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={this.onAdd}>
              <AddIcon />
            </Fab>
          </div>,
          <FormattedMessage module={MODULE_NAME} id={"workforce.office.addNewTooltip"} />,
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(
  withHistory(
    connect(mapStateToProps)(withTheme(withStyles(styles)(WorkforceOfficesPage))),
  ),
);
