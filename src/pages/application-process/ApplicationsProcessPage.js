import React, { Component } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, FormattedMessage, decodeId,
} from "@openimis/fe-core";

import { MODULE_NAME } from "../../constants";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import TabsForm from "../../components/application-process/TabsForm";
import { ROUTE_WORKFORCE_ORGANIZATIONS_EMPLOYEES_EMPLOYEE } from "../../routes";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TabPanel from "./TabPanel";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class ApplicationsProcessPage extends Component {
  constructor(props){
    super(props);
    this.state = {value:props.value || 0}
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

  render() {
    const { intl, classes, rights } = this.props;
    const {value}=this.state;

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
        <ApplicationProcessSearcher
          cacheFiltersKey="allApplications"
          onDoubleClick={this.onDoubleClick}
        />
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
            <Fab color="primary" onClick={this.onAdd}>
              <AddIcon />
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
});

export default withModulesManager(
  withHistory(
    connect(mapStateToProps)(withTheme(withStyles(styles)(ApplicationsProcessPage))),
  ),
);
