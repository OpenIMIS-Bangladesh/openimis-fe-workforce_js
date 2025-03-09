import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Tooltip, Button } from "@material-ui/core";
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
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import { MODULE_NAME } from "../../../constants";
import { fetchAccountInfosSummary } from "../../../actions";
import AccountInfoFilter from "./AccountInfoFilter";

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
  horizontalButtonContainer: {
    ...theme.buttonContainer.horizontal,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  compactButton: {
    maxHeight: "30px",
    minWidth: "80px",
    padding: "1px 4px",
    borderRadius: "6px",
    backgroundColor: "#006273",
    color: "white",
    fontSize: "0.7rem",
    textTransform: "none",
    marginRight: "2px",
    "&:hover": {
      backgroundColor: "#004a5e",
    },
  },
  buttonContainer: {
    display: "flex",
    gap: theme.spacing(1),
  },
});

class AccountInfoSearcher extends Component {
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
    this.props.fetchAccountInfosSummary(
      this.props.modulesManager,
      prms
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
    "workforce.employee.account.info.accountOwnerName",
    "workforce.employee.account.info.onbehalfOf",
    "workforce.employee.account.info.reference",
    "workforce.employee.account.info.bankName",
    "workforce.employee.account.info.branchName",
    "workforce.employee.account.info.routingNumber",
    "workforce.employee.account.info.accountHolderName",
    "workforce.employee.account.info.status",
   
    this.isShowHistory() ? "workforce.version" : "",
  ];

  sorts = () => []; "beneficiaryType"

  itemFormatters = () => {
    const formatters = [
      (organizationemployee) => organizationemployee.accountHolderName,
      (organizationemployee) => organizationemployee.onBehalfOf,
      (organizationemployee) => organizationemployee.onBehalfOf,
      (organizationemployee) => organizationemployee.bankId,
      (organizationemployee) => organizationemployee.branchName,
      (organizationemployee) => organizationemployee.branchName,
      (organizationemployee) => organizationemployee.routingNumber,
      (organizationemployee) => organizationemployee.accountHolderName,
      (organizationemployee) => organizationemployee.status,
        this.isShowHistory() ? organizationemployee?.version : null,
    ];
    formatters.push((organizationemployee) => (
        <Tooltip title="Edit">
          <IconButton
            disabled={organizationemployee?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.employees.account.infos.info",
                [decodeId(organizationemployee.id)],
                false
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
      employeeAccidents,
      employeeAccidentsPageInfo,
      fetchingEmployeeAccidents,
      fetchedEmployeeAccidents,
      errorEmployeeAccidents,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;

    const count = employeeAccidentsPageInfo.totalCount;

    const filterPane = ({ filters, onChangeFilters }) => (
      <AccountInfoFilter
        filters={filters}
        onChangeFilters={onChangeFilters}
        setShowHistoryFilter={(showHistoryFilter) =>
          this.setState({ showHistoryFilter })
        }
      />
    );

    return (
      <>
        <Searcher
          module={MODULE_NAME}
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={filterPane}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={employeeAccidents}
          itemsPageInfo={employeeAccidentsPageInfo}
          fetchingItems={fetchingEmployeeAccidents}
          fetchedItems={fetchedEmployeeAccidents}
          errorItems={errorEmployeeAccidents}
          tableTitle={
            <FormattedMessage
              module={MODULE_NAME}
              id= "menu.workforce.employee.account.info"
            />
          }
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

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  employeeAccidents: state.workforce.employeeAccidents,
  employeeAccidentsPageInfo: state.workforce.employeeAccidentsPageInfo,
  fetchingEmployeeAccidents: state.workforce.fetchingEmployeeAccidents,
  fetchedEmployeeAccidents: state.workforce.fetchedEmployeeAccidents,
  errorEmployeeAccidents: state.workforce.errorEmployeeAccidents,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchAccountInfosSummary,
      journalize,
      coreConfirm,
    },
    dispatch
  );

export default withModulesManager(
  withHistory(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withTheme(withStyles(styles)(AccountInfoSearcher)))
  )
);
