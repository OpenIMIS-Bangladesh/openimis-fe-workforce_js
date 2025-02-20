import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
// import { IconButton, Tooltip } from "@material-ui/core";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Tooltip
} from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import {
  coreConfirm,
  formatMessageWithValues,
  journalize,
  Searcher,
  withHistory,
  withModulesManager,
  FormattedMessage,
  historyPush,
  decodeId,
} from "@openimis/fe-core";
import EditIcon from "@material-ui/icons/Edit";
import { MODULE_NAME } from "../../constants";
import { fetchBanksSummary } from "../../actions";
import OrganizationFilter from "./BankFilter";


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

class BanksSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // open: false,
      chfid: null,
      confirmedAction: null,
      reset: 0,
      showHistoryFilter: false,
      displayVersion: false,
      selectedBankId: null,
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
    this.props.fetchBanksSummary(
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

  bankHeaders = () => [
    "workforce.banks.nameEn",
    "workforce.banks.address",
    this.isShowHistory() ? 'workforce.version' : '',
  ];
  branchHeaders = () => [
    "workforce.banks.branch.nameEn",
    "workforce.banks.address",
    "workforce.banks.routingNumber",
    "workforce.banks.contactNumber",
    this.isShowHistory() ? 'workforce.version' : '',
  ];

  sorts = () => [
    
  ];

  bankItemFormatters = () => {
    const formatters = [
      (workforce) => workforce.nameEn,
      (workforce) => workforce.headquarterAddress,
      (workforce) => (this.isShowHistory() ? workforce?.version : null),

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
                   'workforce.route.banks.bank',
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

  branchItemFormatters = () => {
    const formatters = [
      (workforce) => workforce.nameEn,
      (workforce) => workforce.headquarterAddress,
      (workforce) => workforce.routingNumber,
      (workforce) => workforce.contactNumber,
      (workforce) => (this.isShowHistory() ? workforce?.version : null),

    ];

         formatters.push((workforce) => (
           <Tooltip title="Edit">
             <IconButton
               disabled={workforce?.isHistory}
               onClick={() => {
                 historyPush(
                   this.props.modulesManager,
                   this.props.history,
                   'workforce.route.banks.bank',
                   [decodeId(workforce.id)],
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

  onDoubleClick = (bank, newTab = false) => {
    this.setState({ selectedBankId: bank.id });
    console.log({bank})

  };
  

  render() {
    const {
      intl,
      banks, banksPageInfo, fetchingBanks, fetchedBanks,
      filterPaneContributionsKey, cacheFiltersKey, 
    } = this.props;

    const { selectedBankId } = this.state;

    const count = banksPageInfo.totalCount;
    const bankData = banks.filter(item => !item.parent)
    const branchData = banks.filter(item => item.parent)
    const filteredBranchData  = branchData.filter(branch => branch.parent?.id === selectedBankId);


    console.log({banks})

    const filterPane = ({ filters, onChangeFilters }) => (
      <OrganizationFilter
        filters={filters}
        onChangeFilters={onChangeFilters}
        setShowHistoryFilter={(showHistoryFilter) => this.setState({ showHistoryFilter })}
      />
    );

    return (
      <Grid container spacing={2}>
      <Grid item xs={4}>
        <Searcher
          module={MODULE_NAME}
          cacheFiltersKey={cacheFiltersKey}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={bankData}
          itemsPageInfo={banksPageInfo}
          fetchingItems={fetchingBanks}
          fetchedItems={fetchedBanks}
          // errorItems={errorOrganizations}
          tableTitle={<FormattedMessage module={MODULE_NAME} id="menu.workforce.banks" values={count} />}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-dateCreated"
          headers={this.bankHeaders}
          itemFormatters={this.bankItemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          
          onDoubleClick={(i) => !i.clientMutationId && this.onDoubleClick(i)}
          reset={this.state.reset}
        />
      </Grid>
      {selectedBankId && (

      <Grid item xs={8}>
        <Searcher
          module={MODULE_NAME}
          cacheFiltersKey={cacheFiltersKey}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={filteredBranchData}
          itemsPageInfo={banksPageInfo}
          fetchingItems={fetchingBanks}
          fetchedItems={fetchedBanks}
          // errorItems={errorOrganizations}
          tableTitle={<FormattedMessage module={MODULE_NAME} id="menu.workforce.branch" values={count} />}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-dateCreated"
          headers={this.branchHeaders}
          itemFormatters={this.branchItemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(i) => !i.clientMutationId && onDoubleClick(i)}
          reset={this.state.reset}
        />
      </Grid>
      )}
    </Grid>
    );
  }
}

const mapStateToProps = (state) => (
  // console.log(state),
  {
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    banks: state.workforce.banks,
    banksPageInfo: state.workforce.banksPageInfo,
    fetchingBanks: state.workforce.fetchingBanks,
    fetchedBanks: state.workforce.fetchedBanks,
    submittingMutation: state.workforce.submittingMutation,
    mutation: state.workforce.mutation,
    confirmed: state.core.confirmed,
  }
);

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchBanksSummary, journalize, coreConfirm,
  },
  dispatch,
);

export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(BanksSearcher))),
  ),
);
