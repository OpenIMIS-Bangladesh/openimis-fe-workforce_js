import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Tooltip } from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import {
  coreConfirm,
  formatMessageWithValues,
  journalize,
  Searcher,
  withHistory,
  withModulesManager,
  PublishedComponent,
  FormattedMessage,
  formatMessage,
  historyPush,
  decodeId,
} from "@openimis/fe-core";
import EditIcon from "@material-ui/icons/Edit";
import { MODULE_NAME, RIGHT_ORGANIZATION_EDIT } from "../../constants";
import { fetchWorkforceOfficesSummary } from "../../actions";
import WorkforceOfficeFilter from "./WorkforceFactoryFilter";


const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    margin: 0,
  },
  paperHeader: {
    ...theme.paper.header,
    padding: 10,
  },
  tableTitle: theme.table.title,
  fab: theme.fab,
  button: {
    margin: theme.spacing(1),
  },
  item: {
    padding: theme.spacing(1),
  },
});

class WorkforceFactorySearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chfid: null,
      confirmedAction: null,
      reset: 0,
      showHistoryFilter: false,
      displayVersion: false,
    };
    this.rowsPerPageOptions = [10, 20, 50, 100];
    this.defaultPageSize = 10;
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: prevState.reset + 1 });
    } else if (!prevProps.confirmed && this.props.confirmed) {
      this.state.confirmedAction();
    }
  }

  fetch = (prms) => {
    const { showHistoryFilter } = this.state;
    this.setState({ displayVersion: showHistoryFilter });
    this.props.fetchWorkforceOfficesSummary(
      this.props.modulesManager,
      prms,
    );
  };

  rowIdentifier = (r) => r.uuid;

  isShowHistory = () => this.state.displayVersion;

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((f) => !!state.filters[f].filter)
      .map((f) => state.filters[f].filter);
    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  headers = () => [
    "workforce.factory.name.en",
    "workforce.factory.name.bn",
    "workforce.factory.phone",
    "workforce.factory.email",
    "workforce.factory.address",
    "workforce.factory.website",
    "workforce.factory.status",
    this.isShowHistory() ? 'workforce.version' : '',
  ];

  sorts = () => [
    
  ];

  itemFormatters = () => {
    const formatters = [
      (workforcefactory) => workforcefactory.nameEn,
      (workforcefactory) => workforcefactory.nameBn,
      (workforcefactory) => workforcefactory.phoneNumber,
      (workforcefactory) => workforcefactory.email,
      (workforcefactory) => workforcefactory.address,
      (workforcefactory) => workforcefactory.sebsite,
      (workforcefactory) => workforcefactory.status,
      (workforcefactory) => (this.isShowHistory() ? workforcefactory?.version : null),

    ];
         formatters.push((workforcefactory) => (
           <Tooltip title="Edit">
             <IconButton
               disabled={workforcefactory?.isHistory}
               onClick={() => {
                 historyPush(
                   this.props.modulesManager,
                   this.props.history,
                   'workforce.route.offices.factory',
                   [decodeId(workforcefactory.id)],
                   false,
                 );
               }}
             >
               <EditIcon />
             </IconButton>
           </Tooltip>
         ));
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      workforceOffices, workforceOfficesPageInfo, fetchingWorkforceOffices, fetchedWorkforceOffices, errorWorkforceOffices,
      filterPaneContributionsKey, cacheFiltersKey, onDoubleClick,
    } = this.props;

    const count = workforceOfficesPageInfo.totalCount;

    const filterPane = ({ filters, onChangeFilters }) => (
      <WorkforceOfficeFilter
        filters={filters}
        onChangeFilters={onChangeFilters}
        setShowHistoryFilter={(showHistoryFilter) => this.setState({ showHistoryFilter })}
      />
    );

    return (
      <>
        <Searcher
          module={MODULE_NAME}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={filterPane}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={workforceOffices}
          itemsPageInfo={workforceOfficesPageInfo}
          fetchingItems={fetchingWorkforceOffices}
          fetchedItems={fetchedWorkforceOffices}
          errorItems={errorWorkforceOffices}
          tableTitle={<FormattedMessage module={MODULE_NAME} id="menu.workforce.factory" />}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-dateCreated"
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(i) => !i.clientMutationId && onDoubleClick(i)}
          reset={this.state.reset}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => (
  {
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    workforceOffices: state.workforce.workforceOffices,
    workforceOfficesPageInfo: state.workforce.workforceOfficesPageInfo,
    fetchingWorkforceOffices: state.workforce.fetchingWorkforceOffices,
    fetchedWorkforceOffices: state.workforce.fetchedWorkforceOffices,
    errorWorkforceOffices: state.workforce.errorWorkforceOffices,
    submittingMutation: state.workforce.submittingMutation,
    mutation: state.workforce.mutation,
    confirmed: state.core.confirmed,
  }
);

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchWorkforceOfficesSummary, journalize, coreConfirm,
  },
  dispatch,
);

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(WorkforceFactorySearcher))),
  ),
);
