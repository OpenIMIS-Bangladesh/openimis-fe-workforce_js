import React, { Component, useEffect, useState } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {Grid, Fab, Accordion, AccordionSummary, Typography, AccordionDetails, Card, CardContent } from "@material-ui/core";
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
import { useSelector, useDispatch } from "react-redux";

const styles = (theme) => ({
  page: theme.page,
  fab: {
    ...theme.fab,
    display: "flex",
    flexDirection: "column"
  },
  page: {
    width: "100%",
    overflowX: "hidden",
  },
  accordion: {
    marginBottom: theme.spacing(1),
  },
  accordionSummary: {
    display: "flex",
    alignItems: "center",
  },
  accordionDetails: {
    padding: theme.spacing(2),
  },
});

class ApplicationSummaryPage extends Component {
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
    const { loggedInUserId } = this.props;
    const status = this.props.status || "";

    // console.clear();
    console.log('status data', status);

    let renderSummaryData = [];

    if(getUserTypeFromRights(rights) === WORKFORCE_USER_TYPE.DIRECTOR)
    {
      if(status === "pending")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "forward_to_director" && item.organizationType==='cf'
        );
      }
      else if(status === "rejected")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "rejected" && item.organizationType==='cf'
        );
      }
      else if(status === "approved")
      {
        renderSummaryData = summaryData.filter(item => item.status === "forward_to_dg" && item.organizationType==='cf');
      }
    }
    else if(getUserTypeFromRights(rights) === WORKFORCE_USER_TYPE.BLWF_DIRECTOR)
    {
      if(status === "pending")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "forward_to_director" && item.organizationType==='blwf'
        );
      }
      else if(status === "rejected")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "rejected" && item.organizationType==='blwf'
        );
      }
      else if(status === "approved")
      {
        renderSummaryData = summaryData.filter(item => item.status === "forward_to_dg" && item.organizationType==='blwf');
      }
    }
    else if(getUserTypeFromRights(rights) === WORKFORCE_USER_TYPE.ADMIN)
    {
      if(status === "pending")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "approved_by_director"
        );
      }
      else if(status === "rejected")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "rejected"
        );
      }
      else if(status === "approved")
      {
        renderSummaryData = summaryData.filter(item => item.status === "approved_by_dg");
      }
    }
    else if(getUserTypeFromRights(rights) === WORKFORCE_USER_TYPE.EIS_ADVISOR)
    {
      if(status === "pending")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "forward_to_eis_advisor" && item.organizationType==='eis'
        );
      }
      else if(status === "rejected")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "rejected" && item.organizationType==='eis'
        );
      }
      else if(status === "approved")
      {
        renderSummaryData = summaryData.filter(item => item.status === "approved_by_eis_director" && item.organizationType==='eis');
      }
    }

    return (
      <div>
      <Grid container spacing={2}>
        <Grid item xs={12} >
        {renderSummaryData.map((item, index) => (
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
                        loggedInUserId={loggedInUserId}
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
        </Grid>
      </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  applications: state.workforce.applications,
  summaryData: state.workforce.applicationsSummary ?? [],
  loggedInUserId: state.core?.user?.i_user?.id,

});

const mapDispatchToProps = (dispatch) => ({
  fetchSummaryApplications: (modulesManager) =>
    dispatch(fetchSummaryApplications(modulesManager, "")),
});


export default withModulesManager(
  withHistory(
    connect(mapStateToProps, mapDispatchToProps)(
      withTheme(withStyles(styles)(ApplicationSummaryPage))
    ),
  ),
);

