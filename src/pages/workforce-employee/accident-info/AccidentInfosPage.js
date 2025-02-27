import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, FormattedMessage, decodeId,
} from "@openimis/fe-core";
import { ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS_INFO } from "../../../routes";
import AccidentInfoSearcher from "../../../components/workforce-employee/accident-info/AccidentInfoSearcher";
import { MODULE_NAME } from "../../../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab, ROUTE_WORKFORCE_EMPLOYEES_ACCIDENT_INFOS_INFO,
});

class AccidentInfosPage extends Component {
  onDoubleClick = (employee, newTab = false) => {
    const routeParams = ["workforce.route.employees.accident.info", [decodeId(employee.id)]];
    if (employee?.isHistory) {
      routeParams[1].push(employee.version);
    }
    historyPush(this.props.modulesManager, this.props.history, ...routeParams, newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "workforce.route.employees.accident.info");
  };

  render() {
    const { intl, classes, rights } = this.props;

    return (
      <div className={classes.page}>
        <AccidentInfoSearcher
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
          <FormattedMessage module={MODULE_NAME} id={"workforce.employee.accident.info.addNewTooltip"} />,
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
    connect(mapStateToProps)(withTheme(withStyles(styles)(AccidentInfosPage))),
  ),
);
