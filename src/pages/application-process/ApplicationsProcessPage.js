import React, { Component, useEffect, useState } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab, Accordion, AccordionSummary, Typography, AccordionDetails, Card, CardContent } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, FormattedMessage, decodeId,
} from "@openimis/fe-core";
import PrintIcon from '@material-ui/icons/Print';
import { MODULE_NAME } from "../../constants";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from "./TabPanel";
import GenerateBFTN from "./GenereteBFTN";
import { fetchSummaryApplications } from "../../actions";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights } from "../../utils/utils";

const styles = (theme) => ({
  page: theme.page,
  fab: {
    ...theme.fab,
    display: "flex",
    flexDirection: "column"
  },
});

class ApplicationsProcessPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || 0,
      openGenerateBFTN: false,
      expanded: null,
    }
  }

  handleCloseBFTN = () => {
    this.setState({ openGenerateBFTN: false })
  }
  handleOpenBFTN = () => {
    this.setState({ openGenerateBFTN: true })
  }

  onDoubleClick = (application, newTab = false) => {
    const routeParams = ["workforce.route.application", [decodeId(application.id)]];
    if (application?.isHistory) {
      routeParams[1].push(application.version);
    }
    historyPush(this.props.modulesManager, this.props.history, ...routeParams, newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "workforce.route.application");
  };

  getQueryStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    console.log(status);
    if (status) {
      switch (status) {
        case 'pending':
          this.setState({ value: 1 });
          break;
        case 'approved':
          this.setState({ value: 2 });
          break;
        default:
          this.setState({ value: 0 });
      }
    }
  }

  a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue }, () => {
      console.log("Current tab index:", this.state.value);
    });
  };

  handleAccordionChange = (panelId) => (event, isExpanded) => {
    this.setState({ expanded: isExpanded ? panelId : null });
  };
  componentDidMount() {
    const { modulesManager, fetchSummaryApplications } = this.props;
    fetchSummaryApplications(modulesManager);
    this.getQueryStatus();
  }
  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.getQueryStatus();
    }
  }

  render() {
    const { intl, classes, rights, applications, } = this.props;
    const { value, openGenerateBFTN } = this.state;
    const summaryData = this.props.summaryData || [];
    // console.clear();
    console.log('summary data', summaryData);

    const approvedSummaries = summaryData.filter(item =>
      item.status === "approved_by_dg"
    );
    const pendingSummaries = summaryData.filter(item =>
      item.status === "forward_to_director" || item.status === "approved_by_director"
    );

    const allSummaries = summaryData.filter(item =>
      item.status === "forward_to_director" || item.status === "approved_by_director" || item.status === "approved_by_dg"
    );
    const approvedSummariesDirector = summaryData.filter(item =>
      item.status === "approved_by_director"
    );
    const pendingSummariesDirector = summaryData.filter(item =>
      item.status === "forward_to_director"
    );

    const allSummariesDirector = summaryData.filter(item =>
      item.status === "forward_to_director" || item.status === "approved_by_director" || item.status === "forward_to_dg"
    );

    return (
      <div className={classes.page}>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange} aria-label="simple tabs example">
            <Tab
              label={<FormattedMessage module="workforce" id="workforce.application.process.all" />}
              {...this.a11yProps(0)}
            />
            <Tab
              label={<FormattedMessage module="workforce" id="workforce.application.process.pending" />}
              {...this.a11yProps(1)}
            />
            <Tab
              label={<FormattedMessage module="workforce" id="workforce.application.process.approved" />}
              {...this.a11yProps(2)}
            />
          </Tabs>
        </AppBar>

        {getUserTypeFromRights(rights) === WORKFORCE_USER_TYPE.ADMIN ? (
          <>
            <TabPanel value={value} index={0}>
              {allSummaries.map((item, index) => (
                <Accordion
                  key={index}
                  expanded={this.state.expanded === item.id}
                  onChange={this.handleAccordionChange(item.id)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    className={classes.accordionSummary}
                    expandIcon={<ExpandMoreIcon className="material-icons" />}
                  >
                    <Typography variant="subtitle1" style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                    </Typography>
                    <Typography variant="body2" style={{ marginLeft: "auto", color: "#015C63" }}>
                      {item.meetingDate} | {item.month} {item.year}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetails}>
                    <Card style={{ width: "100%" }}>
                      <CardContent>
                        {this.state.expanded === item.id && (
                          <ApplicationProcessSearcher
                            summaryId={item.id}
                            cacheFiltersKey="all"
                            onDoubleClick={this.onDoubleClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              ))}
              <GenerateBFTN
                open={openGenerateBFTN}
                onClose={this.handleCloseBFTN}
                applications={applications}
                userRights={rights}
              />
            </TabPanel>

            <TabPanel value={value} index={1}>
              {pendingSummaries.map((item, index) => (
                <Accordion
                  key={index}
                  expanded={this.state.expanded === item.id}
                  onChange={this.handleAccordionChange(item.id)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    className={classes.accordionSummary}
                    expandIcon={<ExpandMoreIcon className="material-icons" />}
                  >
                    <Typography variant="subtitle1" style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                    </Typography>
                    <Typography variant="body2" style={{ marginLeft: "auto", color: "#015C63" }}>
                      {item.meetingDate} | {item.month} {item.year}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetails}>
                    <Card style={{ width: "100%" }}>
                      <CardContent>
                        {this.state.expanded === item.id && (
                          <ApplicationProcessSearcher
                            summaryId={item.id}
                            cacheFiltersKey="pending"
                            onDoubleClick={this.onDoubleClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              ))}
              <GenerateBFTN
                open={openGenerateBFTN}
                onClose={this.handleCloseBFTN}
                applications={applications}
                userRights={rights}
              />
            </TabPanel>

            <TabPanel value={value} index={2}>
              {approvedSummaries.map((item, index) => (
                <Accordion
                  key={index}
                  expanded={this.state.expanded === item.id}
                  onChange={this.handleAccordionChange(item.id)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    className={classes.accordionSummary}
                    expandIcon={<ExpandMoreIcon className="material-icons" />}
                  >
                    <Typography variant="subtitle1" style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                    </Typography>
                    <Typography variant="body2" style={{ marginLeft: "auto", color: "#015C63" }}>
                      {item.meetingDate} | {item.month} {item.year}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetails}>
                    <Card style={{ width: "100%" }}>
                      <CardContent>
                        {this.state.expanded === item.id && (
                          <ApplicationProcessSearcher
                            summaryId={item.id}
                            cacheFiltersKey="approved"
                            onDoubleClick={this.onDoubleClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              ))}
              <GenerateBFTN
                open={openGenerateBFTN}
                onClose={this.handleCloseBFTN}
                applications={applications}
                userRights={rights}
              />
            </TabPanel>
          </>
        ) : (
          // Else part: Blank or fallback UI
          <>
            <TabPanel value={value} index={0}>
              {allSummariesDirector.map((item, index) => (
                <Accordion
                  key={index}
                  expanded={this.state.expanded === item.id}
                  onChange={this.handleAccordionChange(item.id)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    className={classes.accordionSummary}
                    expandIcon={<ExpandMoreIcon className="material-icons" />}
                  >
                    <Typography variant="subtitle1" style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                    </Typography>
                    <Typography variant="body2" style={{ marginLeft: "auto", color: "#015C63" }}>
                      {item.meetingDate} | {item.month} {item.year}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetails}>
                    <Card style={{ width: "100%" }}>
                      <CardContent>
                        {this.state.expanded === item.id && (
                          <ApplicationProcessSearcher
                            summaryId={item.id}
                            cacheFiltersKey="all"
                            onDoubleClick={this.onDoubleClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              ))}
              <GenerateBFTN
                open={openGenerateBFTN}
                onClose={this.handleCloseBFTN}
                applications={applications}
                userRights={rights}
              />
            </TabPanel>

            <TabPanel value={value} index={1}>
              {pendingSummariesDirector.map((item, index) => (
                <Accordion
                  key={index}
                  expanded={this.state.expanded === item.id}
                  onChange={this.handleAccordionChange(item.id)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    className={classes.accordionSummary}
                    expandIcon={<ExpandMoreIcon className="material-icons" />}
                  >
                    <Typography variant="subtitle1" style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                    </Typography>
                    <Typography variant="body2" style={{ marginLeft: "auto", color: "#015C63" }}>
                      {item.meetingDate} | {item.month} {item.year}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetails}>
                    <Card style={{ width: "100%" }}>
                      <CardContent>
                        {this.state.expanded === item.id && (
                          <ApplicationProcessSearcher
                            summaryId={item.id}
                            cacheFiltersKey="pending"
                            onDoubleClick={this.onDoubleClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              ))}
              <GenerateBFTN
                open={openGenerateBFTN}
                onClose={this.handleCloseBFTN}
                applications={applications}
                userRights={rights}
              />
            </TabPanel>

            <TabPanel value={value} index={2}>
              {approvedSummariesDirector.map((item, index) => (
                <Accordion
                  key={index}
                  expanded={this.state.expanded === item.id}
                  onChange={this.handleAccordionChange(item.id)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    className={classes.accordionSummary}
                    expandIcon={<ExpandMoreIcon className="material-icons" />}
                  >
                    <Typography variant="subtitle1" style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                    </Typography>
                    <Typography variant="body2" style={{ marginLeft: "auto", color: "#015C63" }}>
                      {item.meetingDate} | {item.month} {item.year}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetails}>
                    <Card style={{ width: "100%" }}>
                      <CardContent>
                        {this.state.expanded === item.id && (
                          <ApplicationProcessSearcher
                            summaryId={item.id}
                            cacheFiltersKey="approved"
                            onDoubleClick={this.onDoubleClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              ))}
              <GenerateBFTN
                open={openGenerateBFTN}
                onClose={this.handleCloseBFTN}
                applications={applications}
                userRights={rights}
              />
            </TabPanel>
          </>
        )}


        {withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={this.onAdd} style={{ marginBottom: 10 }}>
              <AddIcon />
            </Fab>
            <Fab color="primary" onClick={this.handleOpenBFTN}>
              <PrintIcon />
            </Fab>
          </div>,
          <FormattedMessage module={MODULE_NAME} id={"workforce.employee.application.addNewTooltip"} />,
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  applications: state.workforce.applications,
  summaryData: state.workforce.applicationsSummary ?? [],
});

const mapDispatchToProps = (dispatch) => ({
  fetchSummaryApplications: (modulesManager) =>
    dispatch(fetchSummaryApplications(modulesManager, "")),
});


export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(
      withTheme(withStyles(styles)(ApplicationsProcessPage))
    ),
  ),
);

