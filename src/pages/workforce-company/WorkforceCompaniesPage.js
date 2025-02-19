import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, FormattedMessage, decodeId,
} from "@openimis/fe-core";

import { MODULE_NAME } from "../../constants";
import OrganizationCompanySearcher from "../../components/workforce-company/WorkforceCompanySearcher";
import { ROUTE_WORKFORCE_COMPANIES_COMPANY } from "../../routes";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab, ROUTE_WORKFORCE_COMPANIES_COMPANY,
});

class OranigzationCompaniesPage extends Component {
  onDoubleClick = (company, newTab = false) => {
    const routeParams = ["workforce.route.companies.company", [decodeId(company.id)]];
    if (company?.isHistory) {
      routeParams[1].push(company.version);
    }
    historyPush(this.props.modulesManager, this.props.history, ...routeParams, newTab);
  };

  onAdd = () => {
    const path =  this.props.history.location.pathname
    const isApprove = path.includes("approve")
    console.log({isApprove})
    historyPush(this.props.modulesManager, this.props.history,isApprove? "workforce.route.approve.companies.company": "workforce.route.companies.company");
  };

  render() {
    const { intl, classes, rights } = this.props;

    return (
      <div className={classes.page}>
        <OrganizationCompanySearcher
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
          <FormattedMessage module={MODULE_NAME} id={"workforce.company.addNewTooltip"} />,
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
    connect(mapStateToProps)(withTheme(withStyles(styles)(OranigzationCompaniesPage))),
  ),
);
