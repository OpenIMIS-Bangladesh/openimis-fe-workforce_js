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
  FormattedMessage,
  historyPush,
  decodeId,
} from "@openimis/fe-core";
import {
  Tab as TabIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from "@material-ui/icons";
import { MODULE_NAME } from "../../constants";
import { fetchApplicationsSummary } from "../../actions";
import ApplicationProcessFilter from "./ApplicationProcessFilter";

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

class ApplicationProcessSearcher extends Component {
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
    this.props.fetchApplicationsSummary(
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
    // "workforce.employee.application.first.name.en",
    // "workforce.employee.application.last.name.en",
    "workforce.employee.application.first.name.bn",
    "workforce.employee.application.last.name.bn",
    "workforce.employee.application.nid",
    "workforce.employee.application.phone",
    "workforce.employee.application.status",
    this.isShowHistory() ? "workforce.version" : "",
  ];

  sorts = () => [];

  itemFormatters = () => {
    const formatters = [
      // (application) => console.log({application}),
      // (application) => application.lastNameEn,
      (application) => application.workforceEmployee.firstNameBn,
      (application) => application.workforceEmployee.lastNameBn,
      (application) => application.workforceEmployee.nid,
      (application) => application.workforceEmployee.phoneNumber,
      (application) => application.organizationType,
      (application) =>
        this.isShowHistory() ? application?.version : null,
    ];
    
    formatters.push((application) => (
        <Tooltip title="Edit">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.application.process.view",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
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
      applications,
      applicationsPageInfo,
      fetchingApplications,
      fetchedApplications,
      errorApplications,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;

    const count = applicationsPageInfo.totalCount;

    const filterPane = ({ filters, onChangeFilters }) => (
      <ApplicationProcessFilter
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
          items={applications}
          itemsPageInfo={applicationsPageInfo}
          fetchingItems={fetchingApplications}
          fetchedItems={fetchedApplications}
          errorItems={errorApplications}
          tableTitle={
            <FormattedMessage
              module={MODULE_NAME}
              id="workforce.employee.application.process"
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
  applications: state.workforce.applications,
  applicationsPageInfo: state.workforce.applicationsPageInfo,
  fetchingApplications: state.workforce.fetchingApplications,
  fetchedApplications: state.workforce.fetchedApplications,
  errorApplications: state.workforce.errorApplications,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplicationsSummary,
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
    )(withTheme(withStyles(styles)(ApplicationProcessSearcher)))
  )
);
