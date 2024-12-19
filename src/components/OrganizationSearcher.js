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
import { MODULE_NAME, RIGHT_ORGANIZATION_EDIT } from "../constants";
import { fetchOrganizationsSummary } from "../actions";
import { isEmptyObject } from "../utils/utils";

import OrganizationFilter from "./OrganizationFilter";

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

class OrganizationSearcher extends Component {
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
    this.props.fetchOrganizationsSummary(
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
    "tickets.code",
    "tickets.title",
    "tickets.beneficary",
    "tickets.priority",
    "tickets.status",
    "tickets.category",
    this.isShowHistory() ? "tickets.version" : "",
  ];

  sorts = () => [
    ["code", true],
    ["title", true],
    ["reporter_id", true],
    ["priority", true],
    ["status", true],
    ["category", true],
    ["version", true],
  ];

  itemFormatters = () => {
    const formatters = [
      (ticket) => ticket.id,
      (ticket) => ticket.nameBn,
      (ticket) => ticket.priority,
      (ticket) => ticket.status,
      (ticket) => ticket.category,
      (ticket) => (this.isShowHistory() ? ticket?.version : null),
    ];

    // if (this.props.rights.includes(RIGHT_TICKET_EDIT)) {
    //   formatters.push((ticket) => (
    //     <Tooltip title={formatMessage(this.props.intl, MODULE_NAME, "editButtonTooltip")}>
    //       <IconButton
    //         disabled={ticket?.isHistory}
    //         onClick={() => {
    //           historyPush(
    //             this.props.modulesManager,
    //             this.props.history,
    //             "grievanceSocialProtection.route.ticket",
    //             [decodeId(ticket.id)],
    //             false,
    //           );
    //         }}
    //       >
    //         <EditIcon />
    //       </IconButton>
    //     </Tooltip>
    //   ));
    // }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      tickets, ticketsPageInfo, fetchingTickets, fetchedTickets, errorTickets,
      filterPaneContributionsKey, cacheFiltersKey, onDoubleClick,
    } = this.props;

    const count = ticketsPageInfo.totalCount;

    const filterPane = ({ filters, onChangeFilters }) => (
      <OrganizationFilter
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
          items={tickets}
          itemsPageInfo={ticketsPageInfo}
          fetchingItems={fetchingTickets}
          fetchedItems={fetchedTickets}
          errorItems={errorTickets}
          // tableTitle={formatMessageWithValues(intl, MODULE_NAME, "ticketSummaries", { count })}
          tableTitle={<FormattedMessage module={MODULE_NAME} id="menu.workforce.organizations" />}
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
    tickets: state.workforce.tickets,
    ticketsPageInfo: state.workforce.ticketsPageInfo,
    fetchingTickets: state.workforce.fetchingTickets,
    fetchedTickets: state.workforce.fetchedTickets,
    errorTickets: state.workforce.errorTickets,
    submittingMutation: state.workforce.submittingMutation,
    mutation: state.workforce.mutation,
    confirmed: state.core.confirmed,
  }
);

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchOrganizationsSummary, journalize, coreConfirm,
  },
  dispatch,
);

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(OrganizationSearcher))),
  ),
);
