import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, FormattedMessage, decodeId,
} from "@openimis/fe-core";
import { MODULE_NAME } from "../../constants";
import WorkforceAssociationSearcher from "../../components/workforce-association/WorkforceAssociationSearcher";
import { ROUTE_WORKFORCE_ASSOCIATIONS_ASSOCIATION } from "../../routes";
import { getUserTypeFromRights } from "../../utils/utils";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab, ROUTE_WORKFORCE_ASSOCIATIONS_ASSOCIATION,
});

class WorkforceAsociationsPage extends Component {
  onDoubleClick = (assocition, newTab = false) => {
    const routeParams = ["workforce.route.associations.association", [decodeId(assocition.id)]];
    if (assocition?.isHistory) {
      routeParams[1].push(assocition.version);
    }
    historyPush(this.props.modulesManager, this.props.history, ...routeParams, newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "workforce.route.associations.association");
  };

  render() {
    const { intl, classes, rights } = this.props;

    return (
      <div className={classes.page}>
        <WorkforceAssociationSearcher
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
          <FormattedMessage module={MODULE_NAME} id={"workforce.assocition.addNewTooltip"} />,
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  userType: getUserTypeFromRights(state.core.user.i_user.rights),
});

export default withModulesManager(
  withHistory(
    connect(mapStateToProps)(withTheme(withStyles(styles)(WorkforceAsociationsPage))),
  ),
);
