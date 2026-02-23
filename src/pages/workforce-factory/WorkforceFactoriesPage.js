import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
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
import { getAssociationNameByUserType, getUserType, isEmptyObject, safeDecodeId } from "../../utils/utils";
import { fetchWorkforceAssociationUserMaps } from "../../actions";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
  ROUTE_WORKFORCE_FACTORIES_FACTORY,
});

const OrganizationFactoriesPage = (props) => {
  const { modulesManager, history, intl, classes, rights } = props;
  const dispatch = useDispatch();
  const [associationIds, setAssociationIds] = useState("");
  // const user_type = getUserType();
  // const association= getAssociationNameByUserType(user_type);
  const [loading, setLoading] = useState(true);
  const reduxState = useSelector((state) => state);
  const loggedInUserId = reduxState.core.user.i_user.id;

  const loadAssociationIds = async () => {
    const filters = [];
    filters.push("userId:" + loggedInUserId);

    const response = await dispatch(fetchWorkforceAssociationUserMaps(filters));
    // .then(response => {
    const edges = response?.payload?.data?.workforceAssociationUserMap?.edges ?? [];
    const associationIdsArray = edges.map(edge => safeDecodeId(edge.node.allAssociation.id));
    const associationIdsString = associationIdsArray.map(id => `"${id}"`).join(",");
    setAssociationIds(associationIdsString);
    setLoading(false);

    // })
    // .catch(err => {
    //   console.error("Association fetch error:", err);
    // });
  };
  useEffect(() => {
    loadAssociationIds();
  }, [dispatch, loggedInUserId]);



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

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className={classes.page}>
      <OrganizationFactorySearcher
        cacheFiltersKey="ticketPageFiltersCache"
        onDoubleClick={onDoubleClick}
        association={associationIds}
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
