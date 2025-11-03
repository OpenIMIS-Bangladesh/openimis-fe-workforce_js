import React from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush,
  withModulesManager,
  withHistory,
  withTooltip,
  FormattedMessage,
  decodeId,
} from "@openimis/fe-core";

import { MODULE_NAME } from "../../constants";
import OrganizationFactorySearcher from "../../components/workforce-factory/WorkforceFactorySearcher";
import { ROUTE_WORKFORCE_FACTORIES_FACTORY } from "../../routes";
import { getAssociationNameByUserType, getUserType, isEmptyObject } from "../../utils/utils";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
  ROUTE_WORKFORCE_FACTORIES_FACTORY,
});

const OrganizationFactoriesPage = (props) => {
  const { modulesManager, history, intl, classes, rights } = props;
  const user_type = getUserType();
  const association= getAssociationNameByUserType(user_type);

  const onDoubleClick = (factory, newTab = false) => {
    const routeParams = ["workforce.route.factories.factory", [decodeId(factory.id)]];
    if (factory?.isHistory) {
      routeParams[1].push(factory.version);
    }
    historyPush(modulesManager, history, ...routeParams, newTab);
  };

  const onAdd = () => {
    historyPush(modulesManager, history, "workforce.route.factories.factory");
  };

  return (
    <div className={classes.page}>
      <OrganizationFactorySearcher
        cacheFiltersKey="ticketPageFiltersCache"
        onDoubleClick={onDoubleClick}
        association = {association}
      />
      {withTooltip(
        <div className={classes.fab}>
          <Fab color="primary" onClick={onAdd}>
            <AddIcon />
          </Fab>
        </div>,
        <FormattedMessage module={MODULE_NAME} id="workforce.factory.addNewTooltip" />,
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
});

export default connect(mapStateToProps)(
  withModulesManager(
    withHistory(withTheme(withStyles(styles)(OrganizationFactoriesPage)))
  )
);
