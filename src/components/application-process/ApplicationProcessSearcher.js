import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  IconButton,
  Tooltip,
  Button,
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
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
import {
  Tab as TabIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from "@material-ui/icons";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import { MODULE_NAME } from "../../constants";
import { fetchApplicationsSummary } from "../../actions";
import ApplicationProcessFilter from "./ApplicationProcessFilter";
import ForwardIcon from "@material-ui/icons/Forward";
import UndoIcon from "@material-ui/icons/Undo";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FileUploader from "../../pickers/FileUploader";
import CloseIcon from '@material-ui/icons/Close';

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

class ApplicationProcessSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chfid: null,
      confirmedAction: null,
      reset: 0,
      showHistoryFilter: false,
      displayVersion: false,

      // 🆕 Modal state
      forwardModalOpen: false,
      selectedApplication: null,
      selectedUserId: "",
      deadline: "",
      userList: [],
      submitting: false,
      serverResponse: null,
      editorContent: "",
      selectedOffice: "",
      selectedSuboffice: "",
      selectedUser: "",
      officeData: {
        "Central Fund": {
          suboffices: {
            "Suboffice A": "রহিম উদ্দিন",
            "Suboffice B": "করিমা বেগম",
          },
        },
        BLWF: {
          suboffices: {
            "Suboffice C": "সজল হোসেন",
            "Suboffice D": "রাবেয়া খাতুন",
          },
        },
        "EIS PILOT": {
          suboffices: {
            "Suboffice E": "মাহফুজ রহমান",
            "Suboffice F": "নুসরাত জাহান",
          },
        },
      },
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
    this.props.fetchApplicationsSummary(this.props.modulesManager, prms);
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
  handleOpenForwardModal = (application) => {
    this.setState({ forwardModalOpen: true, selectedApplication: application });
  };

  handleCloseForwardModal = () => {
    this.setState({ forwardModalOpen: false, selectedApplication: null });
  };
  handleUserChange = (event) => {
    this.setState({ selectedUserId: event.target.value });
  };

  handleDeadlineChange = (event) => {
    this.setState({ deadline: event.target.value });
  };
  handleOfficeChange = (event) => {
    const selectedOffice = event.target.value;
    this.setState({
      selectedOffice,
      selectedSuboffice: "", 
      selectedUser: "",
    });
  };

  handleSubofficeChange = (event) => {
    const selectedSuboffice = event.target.value;
    this.setState({
      selectedSuboffice,
      selectedUser: this.state.officeData[this.state.selectedOffice].suboffices[selectedSuboffice],
    });
  };

  handleReject = () => {
    const { selectedApplication } = this.state;
  
    if (window.confirm('Are you sure you want to reject this application?')) {
      this.setState({
        selectedApplication: {
          ...selectedApplication,
          isHistory: true,
        },
      });
    }
  };
  
  handleForwardSubmit = (event) => {
    this.state.editorContent;

    event.preventDefault();

    const selectedUser = this.state.userList.find(
      (user) => user.id === this.state.selectedUserId
    );

    this.setState({ submitting: true });

    // Simulate async submit
    setTimeout(() => {
      this.setState({
        submitting: false,
        serverResponse: {
          status: "SUCCESS",
          message: "আবেদন সফলভাবে ফরওয়ার্ড করা হয়েছে!",
        },
      });

      // After 2 seconds, close modal and reset form
      setTimeout(() => {
        this.setState({
          forwardModalOpen: false,
          selectedUserId: "",
          deadline: "",
          selectedApplication: null,
          serverResponse: null,
        });
      }, 2000);
    }, 2000);
  };

  headers = () => [
    "workforce.employee.name.en",
    "workforce.employee.name.bn",
    // "workforce.employee.application.nid",
    // "workforce.employee.application.phone",
    "workforce.employee.application.applicationType",
    // "workforce.employee.application.organizationType",
    "workforce.employee.application.moneyAmount",
    "workforce.employee.application.verifier",
    "workforce.employee.application.factoryName",
    "workforce.employee.application.status",
    "workforce.employee.application.applicationDate",
    // "workforce.employee.application.assignedBy",
    // "workforce.employee.application.assignedDate",
    // "workforce.employee.application.actions",
    this.isShowHistory() ? "workforce.version" : "",
  ];

  sorts = () => [];

  itemFormatters = () => {
    const formatters = [
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      // (application) => application.workforceEmployee?.nid,
      // (application) => application.workforceEmployee?.phoneNumber,
      (application) => application.applicationType,
      // (application) => application.organizationType,
      (application) => 200000,
      (application) => "Nafi",
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
      // (application) => "Hafiz",
      // (application) => application.dateCreated.split('T')[0],
      this.isShowHistory() ? application?.version : null,
    ];

    formatters.push((application) => (
      <div className={this.props.classes.horizontalButtonContainer}>
        <Tooltip title="দেখুন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.process.view",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="যাচাই">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="অনুমোদন">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                this.props.modulesManager,
                this.props.history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="ফরওয়ার্ড">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => this.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="রিভার্ট">
          <IconButton
            disabled={application?.isHistory}
            // onClick={() => this.handleOpenForwardModal(application)}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="রিজেক্ট">
          <span>
            <IconButton
              onClick={this.handleReject}
              disabled={this.state.selectedApplication?.isHistory}
              color="error"
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Tooltip>

      </div>
    ));
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const { forwardModalOpen, selectedApplication } = this.state;
    const { selectedOffice, selectedSuboffice, selectedUser, officeData } =
      this.state;
    const totalMoneyAmount = applications?.reduce((acc, app) => {
      const amount = parseFloat(app.moneyAmount) || 0;
      return acc + amount;
    }, 0);

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
        <Modal
          open={forwardModalOpen}
          onClose={this.handleCloseForwardModal}
          aria-labelledby="forward-modal-title"
          aria-describedby="forward-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1200,
              height: 750,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            {/* Close Button */}
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
              <Button size="small" onClick={this.handleCloseForwardModal}>
                ✕
              </Button>
            </Box>

            <Typography id="forward-modal-title" variant="h6" component="h2">
              ফরওয়ার্ড অ্যাপ্লিকেশন
            </Typography>

            <Typography id="forward-modal-description" sx={{ mt: 2 }}>
              {selectedApplication
                ? `${
                    selectedApplication.workforceEmployee?.firstNameBn ||
                    "আবেদনকারী"
                  } এর আবেদন ফরওয়ার্ড করতে চান?`
                : "একটি আবেদন বেছে নিন।"}
            </Typography>

            <Box
              component="form"
              onSubmit={this.handleForwardSubmit}
              sx={{ mt: 3 }}
            >
              {/* ✅ Success Message */}
              {this.state.serverResponse?.status === "SUCCESS" && (
                <Typography sx={{ mb: 2, color: "green", fontWeight: "bold" }}>
                  ✅ {this.state.serverResponse.message}
                </Typography>
              )}

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}
              >
              <FormattedMessage module="workforce" id="workforce.application.reasons.addComment" />
                <Box sx={{ width: "100%", mb: 7 }}>
                  <ReactQuill
                    value={this.state.editorContent}
                    onChange={(content) =>
                      this.setState({ editorContent: content })
                    }
                    theme="snow"
                    style={{ height: "150px" }}
                  />
                </Box>

                {/* Static User List */}
                <FormattedMessage module="workforce" id="workforce.application.reasons.selectedOfficer" />
                <Box sx={{ mb:7 }}>
                  {/* Office Selection */}
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="office-select-label">
                      অফিস নির্বাচন করুন
                    </InputLabel>
                    <Select
                      labelId="office-select-label"
                      value={selectedOffice}
                      onChange={this.handleOfficeChange}
                      required
                    >
                      {Object.keys(officeData).map((office) => (
                        <MenuItem key={office} value={office}>
                          {office}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Suboffice Selection */}
                  {selectedOffice && (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="suboffice-select-label">
                        সাবঅফিস নির্বাচন করুন
                      </InputLabel>
                      <Select
                        labelId="suboffice-select-label"
                        value={selectedSuboffice}
                        onChange={this.handleSubofficeChange}
                        required
                        disabled={!selectedOffice}
                      >
                        {Object.keys(
                          officeData[selectedOffice]?.suboffices || {}
                        ).map((suboffice) => (
                          <MenuItem key={suboffice} value={suboffice}>
                            {suboffice}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* User Display */}
                  {selectedSuboffice && selectedUser && (
                    <div>
                      <Typography sx={{ mt: 2 }}>
                        {selectedSuboffice} এর জন্য ইউজার:
                      </Typography>
                      <Typography sx={{ fontWeight: "bold", color: "green" }}>
                        {selectedUser}
                      </Typography>
                    </div>
                  )}
                </Box>
                <Grid item xs={12} sx={{ mt: 7, borderBottom: "1px solid #ccc", pb: 1 }}>
                    <Typography fontWeight="bold">
                      ইতঃপূর্বের সংযুক্তিসমূহ
                    </Typography>
                </Grid>

                <Grid item xs={12} sx={{ mt: 7 }}>
                  <Typography>ফাইল যুক্ত করুন...  {document.nameBn} </Typography>
                  <FileUploader fieldKey={document.fieldId} />
                </Grid>
              </Box>

              {/* Buttons */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  display: "flex",
                  gap: 2,
                }}
              >
                <Button
                  onClick={this.handleCloseForwardModal}
                  color="secondary"
                >
                  বন্ধ করুন
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={this.state.submitting}
                >
                  {this.state.submitting
                    ? "ফরওয়ার্ড করা হচ্ছে..."
                    : "ফরওয়ার্ড করুন"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>

        <div style={{ margin: "16px", fontWeight: "bold" }}>
          <FormattedMessage
            module="workforce"
            id="workforce.employee.application.totalAmount"
          />{" "}
          xxxxxx{" "}
          <FormattedMessage
            module="workforce"
            id="workforce.employee.application.tk"
          />
        </div>
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
