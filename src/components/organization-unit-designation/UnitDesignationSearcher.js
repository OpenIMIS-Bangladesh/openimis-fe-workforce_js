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
import { MODULE_NAME } from "../../constants";
import { fetchUnitDesignationSummary } from "../../actions";
import UnitDesignationFilter from ".//UnitDesignationFilter";


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

class UnitDesignationSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // open: false,
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
    this.props.fetchUnitDesignationSummary(
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
    "workforce.organization.name.en",
    "workforce.organization.unit.name.en",
    "workforce.organization.unit.designation.name.en",
    "workforce.organization.unit.designation.name.bn",
    "workforce.organization.unit.designation.level",
    "workforce.organization.unit.designation.sequence",
  ];

  sorts = () => [
    
  ];

  itemFormatters = () => {
    const formatters = [
      (unitdesignation) => unitdesignation.organization.nameEn,
      (unitdesignation) => unitdesignation.unit.nameEn,
      (unitdesignation) => unitdesignation.nameEn,
      (unitdesignation) => unitdesignation.nameBn,
      (unitdesignation) => unitdesignation.designationLevel,
      (unitdesignation) => unitdesignation.designationSequence,

    ];

    // if (this.props.rights.includes(RIGHT_ORGANIZATION_EDIT)) {
         formatters.push((workforce) => (
           <Tooltip title="Edit">
             <IconButton
               disabled={workforce?.isHistory}
               onClick={() => {
                 historyPush(
                   this.props.modulesManager,
                   this.props.history,
                   'workforce.route.unit.designations.designation',
                   [decodeId(workforce.id)],
                   false,
                 );
               }}
             >
               <EditIcon />
             </IconButton>
           </Tooltip>
         ));
       // }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      unitDesignations, unitDesignationsPageInfo, fetchingUnitDesignations, fetchedUnitDesignations, errorUnitDesignations,
      filterPaneContributionsKey, cacheFiltersKey, onDoubleClick,
    } = this.props;

    const count = unitDesignationsPageInfo.totalCount;
    console.log({unitDesignations})

    const filterPane = ({ filters, onChangeFilters }) => (
      <UnitDesignationFilter
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
          items={unitDesignations}
          itemsPageInfo={unitDesignationsPageInfo}
          fetchingItems={fetchingUnitDesignations}
          fetchedItems={fetchedUnitDesignations}
          errorItems={errorUnitDesignations}
          // tableTitle={formatMessageWithValues(intl, MODULE_NAME, "ticketSummaries", { count })}
          tableTitle={<FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations.unit.designation" values={count} />}
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
  // console.log(state),
  {
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    unitDesignations: state.workforce.unitDesignations,
    unitDesignationsPageInfo: state.workforce.unitDesignationsPageInfo,
    fetchingUnitDesignations: state.workforce.fetchingUnitDesignations,
    fetchedUnitDesignations: state.workforce.fetchedUnitDesignations,
    errorUnitDesignations: state.workforce.errorUnitDesignations,
    submittingMutation: state.workforce.submittingMutation,
    mutation: state.workforce.mutation,
    confirmed: state.core.confirmed,
  }
);

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchUnitDesignationSummary, journalize, coreConfirm,
  },
  dispatch,
);

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(UnitDesignationSearcher))),
  ),
);
