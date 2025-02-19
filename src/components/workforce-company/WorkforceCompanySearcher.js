import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Tooltip } from "@material-ui/core";
import { withStyles, withTheme } from "@material-ui/core/styles";
import {
  coreConfirm,
  journalize,
  Searcher,
  withHistory,
  withModulesManager,
  FormattedMessage,
  historyPush,
  decodeId,
} from "@openimis/fe-core";
import EditIcon from "@material-ui/icons/Edit";
import {
  Tab as TabIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from "@material-ui/icons";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
// import SendIcon from '@material-ui/icons/Send';
import { MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import {
  fetchWorkforceCompaniesSummary,
  updateStatusOfWorkforceCompany,
} from "../../actions";
import WorkforceCompanyFilter from "./WorkforceCompanyFilter";
import { withRouter } from "react-router-dom"; // Import withRouter

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
  horizontalButtonContainer: theme.buttonContainer.horizontal,
});

class WorkforceCompanySearcher extends Component {
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

  // componentDidMount() {
  //   console.log("Current URL Path:", this.props.location.pathname);
  // }

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
    this.props.fetchWorkforceCompaniesSummary(this.props.modulesManager, prms);
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
    "workforce.company.name.en",
    "workforce.company.name.bn",
    "workforce.company.phone",
    "workforce.company.email",
    "workforce.company.address",
    "workforce.company.website",
    "workforce.company.count",
    this.isShowHistory() ? "workforce.version" : "",
  ];

  sorts = () => [];

  requestApproval = (workforceCompany) => {
    const { dispatch } = this.props;
    console.log({ workforceCompany });

    const workforceCompanyData =
      this.props.history.location.pathname === "/workforce/approve/companies"
        ? {
            id: decodeId(workforceCompany.id),
            status: WORKFORCE_STATUS.APPROVED,
          }
        : {
            id: decodeId(workforceCompany.id),
            status: WORKFORCE_STATUS.PENDING,
          };

    this.props.updateStatusOfWorkforceCompany(
      workforceCompanyData,
      `Update Workforce Company ${workforceCompany.nameEn}`
    );
  };

  itemFormatters = () => {
    const formatters = [
      (workforcecompany) => workforcecompany.nameEn,
      (workforcecompany) => workforcecompany.nameBn,
      (workforcecompany) => workforcecompany.phoneNumber,
      (workforcecompany) => workforcecompany.email,
      (workforcecompany) => workforcecompany.address,
      (workforcecompany) => workforcecompany.website,
      (workforcecompany) => workforcecompany.factoryCount,
      (workforcecompany) =>
        this.isShowHistory() ? workforcecompany?.version : null,
    ];
    formatters.push((workforcecompany) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="Edit">
          <IconButton
            disabled={workforcecompany?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                this.props.history.location.pathname ==="/workforce/approve/companies"?"workforce.route.approve.edit.companies.company" :"workforce.route.edit.companies.company",
                [decodeId(workforcecompany.id)],
                false
              );
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        {this.props.history.location.pathname ===
        "/workforce/approve/companies" ? (
          <Tooltip title={"Approve"}>
            <IconButton
              onClick={() => this.requestApproval(workforcecompany)}
              disabled={workforcecompany.factoryCount === 0 ? true : false}
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={"Approve"}>
            <IconButton
              onClick={() => this.requestApproval(workforcecompany)}
              disabled={workforcecompany.factoryCount === 0 ? true : false}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        )}


          <Tooltip title={"view"}>
            <IconButton
              disabled={workforcecompany?.isHistory}
              onClick={() => {
                historyPush(
                  this.props.modulesManager,
                  this.props.history,
                  this.props.history.location.pathname ==="/workforce/approve/companies"?"workforce.route.approve.companies.company" :"workforce.route.companies.company",
                  [decodeId(workforcecompany.id)],
                  false
                );
              }}
            >
              <TabIcon />
            </IconButton>
          </Tooltip>

        {/* <Tooltip title={"view"}>
          <IconButton onClick={() => onDoubleClick(p, true)}>
            <TabIcon />
          </IconButton>
        </Tooltip> */}
      </div>
    ));
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      workforceCompanies,
      workforceCompaniesPageInfo,
      fetchingWorkforceCompanies,
      fetchedWorkforceCompanies,
      errorWorkforceCompanies,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;

    const count = workforceCompaniesPageInfo.totalCount;

    const pendingCompanies = workforceCompanies.filter(
      (company) => company.status === "pending"
    );
    console.log({ pendingCompanies });

    const filterPane = ({ filters, onChangeFilters }) => (
      <WorkforceCompanyFilter
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
          items={
            this.props.history.location.pathname ===
            "/workforce/approve/companies"
              ? pendingCompanies
              : workforceCompanies
          }
          itemsPageInfo={workforceCompaniesPageInfo}
          fetchingItems={fetchingWorkforceCompanies}
          fetchedItems={fetchedWorkforceCompanies}
          errorItems={errorWorkforceCompanies}
          tableTitle={
            <FormattedMessage
              module={MODULE_NAME}
              id="menu.workforce.company"
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
  workforceCompanies: state.workforce.workforceCompanies,
  workforceCompaniesPageInfo: state.workforce.workforceCompaniesPageInfo,
  fetchingWorkforceCompanies: state.workforce.fetchingWorkforceCompanies,
  fetchedWorkforceCompanies: state.workforce.fetchedWorkforceCompanies,
  errorWorkforceCompanies: state.workforce.errorWorkforceCompanies,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchWorkforceCompaniesSummary,
      updateStatusOfWorkforceCompany,
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
    )(withTheme(withStyles(styles)(WorkforceCompanySearcher)))
  )
);
