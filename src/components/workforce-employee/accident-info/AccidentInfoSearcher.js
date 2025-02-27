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
import { fetchDependentsSummary } from "../../../actions";
// import OrganizationEmployeeFilter from "./OrganizationEmployeeFilter";
import DependentFilter from "./AccidentInfoFilter";

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

class DependentSearcher extends Component {
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
    this.props.fetchDependentsSummary(
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
    "workforce.organization.employee.name.en",
    "workforce.organization.employee.name.bn",
    "workforce.organization.employee.phone",
    "workforce.organization.employee.email",
    "workforce.organization.employee.address",
    "workforce.organization.employee.gender",
    "workforce.organization.employee.status",
    this.isShowHistory() ? "workforce.version" : "",
  ];

  sorts = () => [];

  itemFormatters = () => {
    const formatters = [
      (organizationemployee) => organizationemployee.nameEn,
      (organizationemployee) => organizationemployee.nameBn,
      (organizationemployee) => organizationemployee.phoneNumber,
      (organizationemployee) => organizationemployee.email,
      (organizationemployee) => organizationemployee.address,
      (organizationemployee) => organizationemployee.gender,
      (organizationemployee) => organizationemployee.status,
      (organizationemployee) =>
        this.isShowHistory() ? organizationemployee?.version : null,
    ];
    formatters.push((organizationemployee) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="Edit">
          <IconButton
            disabled={organizationemployee?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.organizations.employees.employee",
                [decodeId(organizationemployee.id)],
                false
              );
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Account info">
          <IconButton
            disabled={organizationemployee?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.organizations.employees.employee.account.info",
                [decodeId(organizationemployee.id)],
                false
              );
            }}
          >
            <AccountBoxIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Services">
          <Button
            className={this.props.classes.compactButton}
            disabled={organizationemployee?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
               "workforce.route.organizations.employees.employee.accident.info",
                [decodeId(organizationemployee.id)],
                false
              );
            }}
          >
            Accident info
          </Button>
        </Tooltip>

        <Tooltip title="Services">
          <Button
            className={this.props.classes.compactButton}
            disabled={organizationemployee?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.organizations.employees.employee.services",
                [decodeId(organizationemployee.id)],
                false
              );
            }}
          >
            Services
          </Button>
        </Tooltip>

        <Tooltip title="Dependent">
          <Button
            className={this.props.classes.compactButton}
            disabled={organizationemployee?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.organizations.employees.employee.dependent",
                [decodeId(organizationemployee.id)],
                false
              );
            }}
          >
            Dependent
          </Button>
        </Tooltip>
      </div>
    ));
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      organizationEmployees,
      organizationEmployeesPageInfo,
      fetchingOrganizationEmployees,
      fetchedOrganizationEmployees,
      errorOrganizationEmployees,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;

    const count = organizationEmployeesPageInfo.totalCount;

    const filterPane = ({ filters, onChangeFilters }) => (
      <DependentFilter
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
          items={organizationEmployees}
          itemsPageInfo={organizationEmployeesPageInfo}
          fetchingItems={fetchingOrganizationEmployees}
          fetchedItems={fetchedOrganizationEmployees}
          errorItems={errorOrganizationEmployees}
          tableTitle={
            <FormattedMessage
              module={MODULE_NAME}
              id= "menu.workforce.employee.accident.info"
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
  organizationEmployees: state.workforce.organizationEmployees,
  organizationEmployeesPageInfo: state.workforce.organizationEmployeesPageInfo,
  fetchingOrganizationEmployees: state.workforce.fetchingOrganizationEmployees,
  fetchedOrganizationEmployees: state.workforce.fetchedOrganizationEmployees,
  errorOrganizationEmployees: state.workforce.errorOrganizationEmployees,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchDependentsSummary,
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
    )(withTheme(withStyles(styles)(DependentSearcher)))
  )
);
