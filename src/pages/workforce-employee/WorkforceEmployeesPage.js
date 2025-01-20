import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, FormattedMessage, decodeId,
} from "@openimis/fe-core";

import { MODULE_NAME, RIGHT_ORGANIZATION_EDIT, RIGHT_ORGANIZATION_CREATE } from "../../constants";
import WorkforceEmployeeSearcher from "../../components/workforce-employee/WorkforceEmployeeSearcher";
import { ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE } from "../../routes";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,ROUTE_WORKFORCE_EMPLOYEES_EMPLOYEE
});

class WorkforceEmployeesPage extends Component {
  onDoubleClick = (employee, newTab = false) => {
    const routeParams = ['workforce.route.employees.employee', [decodeId(employee.id)]];
    if (employee?.isHistory) {
      routeParams[1].push(employee.version);
    }
    historyPush(this.props.modulesManager, this.props.history, ...routeParams, newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, 'workforce.route.employees.employee');
  };

  render() {
    const { intl, classes, rights } = this.props;

    return (
      <div className={classes.page}>
        <WorkforceEmployeeSearcher
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
          <FormattedMessage module={MODULE_NAME} id={"workforce.employee.addNewTooltip"} />,
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
    connect(mapStateToProps)(withTheme(withStyles(styles)(WorkforceEmployeesPage))),
  ),
);
