import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withStyles, withTheme } from "@material-ui/core/styles";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import { IconButton, Tooltip, Button } from "@material-ui/core";
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
import { fetchWorkforceAllAssociationSummary } from "../../actions";
import WorkforceAssociationFilter from "./WorkforceAssociationFilter";

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

class WorkforceAssociationSearcher extends Component {
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
    this.props.fetchWorkforceAllAssociationSummary(
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
    "workforce.association.name.bn",
    "workforce.association.name.en",
    "workforce.association.phone",
    "workforce.association.email",
    "workforce.association.minimumSalary",
    this.isShowHistory() ? "workforce.version" : "",
  ];

  sorts = () => [];

  itemFormatters = () => {
    const formatters = [
      (workforceassociation) => workforceassociation.nameEn,
      (workforceassociation) => workforceassociation.nameBn,
      (workforceassociation) => workforceassociation.phoneNumber,
      (workforceassociation) => workforceassociation.email,
      (workforceassociation) => workforceassociation.minimumSalary,
      (workforceassociation) =>
        this.isShowHistory() ? workforceassociation?.version : null,
    ];
    formatters.push((workforceassociation) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="Edit">
          <IconButton
            disabled={workforceassociation?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.associations.association",
                [decodeId(workforceassociation.id)],
                false
              );
            }}
          >
            <EditIcon />
          </IconButton>
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
      workforceAllAssociations,
      workforceAllAssociationsPageInfo,
      fetchingWorkforceAllAssociations,
      fetchedWorkforceAllAssociations,
      errorWorkforceAllAssociations,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;

    console.log({ workforceAllAssociations });
    const count = workforceAllAssociationsPageInfo.totalCount;

    const filterPane = ({ filters, onChangeFilters }) => (
      <WorkforceAssociationFilter
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
          items={workforceAllAssociations}
          itemsPageInfo={workforceAllAssociationsPageInfo}
          fetchingItems={fetchingWorkforceAllAssociations}
          fetchedItems={fetchedWorkforceAllAssociations}
          errorItems={errorWorkforceAllAssociations}
          tableTitle={
            <FormattedMessage
              module={MODULE_NAME}
              id="menu.workforce.association"
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
  workforceAllAssociations: state.workforce.workforceAllAssociations,
  workforceAllAssociationsPageInfo:
    state.workforce.workforceAllAssociationsPageInfo,
  fetchingWorkforceAllAssociations:
    state.workforce.fetchingWorkforceAllAssociations,
  fetchedWorkforceAllAssociations:
    state.workforce.fetchedWorkforceAllAssociations,
  errorWorkforceAllAssociations: state.workforce.errorWorkforceAllAssociations,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchWorkforceAllAssociationSummary,
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
    )(withTheme(withStyles(styles)(WorkforceAssociationSearcher)))
  )
);
