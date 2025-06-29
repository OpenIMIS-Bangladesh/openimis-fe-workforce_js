import React, { Component,useEffect,useState } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab,Accordion,AccordionSummary,Typography,AccordionDetails,Card,CardContent } from "@material-ui/core";
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
}

  render() {
    const { intl, classes, rights, applications, } = this.props;
    const { value, openGenerateBFTN } = this.state;
    const summaryData = this.props.summaryData || [];
    console.clear
    console.log('summary data',summaryData)
    console.log("process page", applications)
    return (
      <div className={classes.page}>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange} aria-label="simple tabs example">
            <Tab
              label={<FormattedMessage module="workforce" id="workforce.application.process.all" />}
              {...this.a11yProps(0)}
            />
            <Tab
              label={<FormattedMessage module="workforce" id="workforce.application.process.accidental" />}
              {...this.a11yProps(1)}
            />
            <Tab
              label={<FormattedMessage module="workforce" id="workforce.application.process.death" />}
              {...this.a11yProps(2)}
            />
            <Tab
              label={<FormattedMessage module="workforce" id="workforce.application.process.disability" />}
              {...this.a11yProps(3)}
            />
          </Tabs>
        </AppBar>

        <TabPanel value={value} index={0}>
            {summaryData.map((item, index) => (
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
                      {/* 👇 Only render when this accordion is expanded */}
                      {this.state.expanded === item.id && <ApplicationProcessSearcher summaryId={item.id} cacheFiltersKey="allApplications"
                      onDoubleClick={this.onDoubleClick} />}
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            ))}        
          <GenerateBFTN open={openGenerateBFTN} onClose={this.handleCloseBFTN} applications={applications} userRights={rights} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ApplicationProcessSearcher
            cacheFiltersKey="accidentalApplications"
            applicationType="accidentalGrant"
            onDoubleClick={this.onDoubleClick}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ApplicationProcessSearcher
            cacheFiltersKey="deathApplications"
            applicationType="deadlyGrant"
            onDoubleClick={this.onDoubleClick}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ApplicationProcessSearcher
            cacheFiltersKey="disabilityApplications"
            applicationType="disabilityAssistance"
            onDoubleClick={this.onDoubleClick}
          />
        </TabPanel>

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
    dispatch(fetchSummaryApplications(modulesManager, ['status:"forward_to_director"'])),
});


export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(
      withTheme(withStyles(styles)(ApplicationsProcessPage))
    ),
  ),
);

