import React, { Component, useEffect, useState } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {Grid, Fab, Accordion, AccordionSummary, Typography, AccordionDetails, Card, CardContent, Button,CircularProgress } from "@material-ui/core";
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
import RescheduleMeetingDialog from "../../components/shared/modals/RescheduleMeetingDialog";


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
      reorderedData: null, 
      // ADDED: State for Reschedule Dialog
      rescheduleDialogOpen: false,
      selectedRescheduleId: null,
      isLoading: true,
    };
  } 

  // ADDED: Handlers for Reschedule Dialog
  handleOpenReschedule = (event, id) => {
    event.stopPropagation(); // Prevents the accordion from expanding/collapsing
    this.setState({ rescheduleDialogOpen: true, selectedRescheduleId: id });
  };

 handleCloseReschedule = () => {
    this.setState({ 
        rescheduleDialogOpen: false, 
        selectedRescheduleId: null 
    }, () => {
        // This callback runs AFTER the state is updated
        const { modulesManager, fetchSummaryApplications } = this.props;
        fetchSummaryApplications(modulesManager);
    });
};

  handleRescheduleSuccess = () => {
    const { modulesManager, fetchSummaryApplications } = this.props;
    // Refresh the data
    fetchSummaryApplications(modulesManager);
    // Close the dialog automatically after success
    this.handleCloseReschedule();
};

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
    this.setState((prev) => {
      if (isExpanded) {
        const { renderSummaryData } = this;
        const reordered = [
          renderSummaryData.find((i) => i.id === panelId),
          ...renderSummaryData.filter((i) => i.id !== panelId),
        ];
        return { expanded: panelId, reorderedData: reordered };
      } else {
        return { expanded: null, reorderedData: null };
      }
    });
  };
  
  componentDidMount() {
    const { modulesManager, fetchSummaryApplications } = this.props;
    Promise.resolve(fetchSummaryApplications(modulesManager))
      .finally(() => this.setState({ isLoading: false }));
  }

  componentDidUpdate(prevProps) {
    if (this.state.isLoading && prevProps.summaryData !== this.props.summaryData) {
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { classes, rights, applications, summaryData, loggedInUserId, status, disableButtons = 0,isLoading } = this.props;
    // EXTRACTED new state variables
    const { value, openGenerateBFTN, expanded, reorderedData, rescheduleDialogOpen, selectedRescheduleId } = this.state;

    let renderSummaryData = [];
    
    const currentUserType = getUserTypeFromRights(rights);

    if(currentUserType === WORKFORCE_USER_TYPE.DIRECTOR)
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
    else if(currentUserType === WORKFORCE_USER_TYPE.BLWF_DIRECTOR)
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
    else if(currentUserType === WORKFORCE_USER_TYPE.ADMIN)
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
    else if(currentUserType === WORKFORCE_USER_TYPE.EIS_ADVISOR)
    {
      if(status === "pending")
      {
        renderSummaryData = summaryData.filter(item =>
          (item.status === "forward_to_eis_advisor" || item.status === "meeting_created") && item.organizationType==='eis'
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
        renderSummaryData = summaryData.filter(item => (item.status === "approved_by_eis_director" || item.status === "approved_by_eis_advisor") && item.organizationType==='eis');
      }
    }
    else if(currentUserType === WORKFORCE_USER_TYPE.SECRETARY)
    {
      if(status === "pending")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "approved_by_dg"
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
        renderSummaryData = summaryData.filter(item => item.status === "approved_by_secretary");
      }
    }
    else if(currentUserType === WORKFORCE_USER_TYPE.MINISTER)
    {
      if(status === "pending")
      {
        renderSummaryData = summaryData.filter(item =>
          item.status === "approved_by_secretary"
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
        renderSummaryData = summaryData.filter(item => item.status === "approved_by_minister");
      }
    }

    this.renderSummaryData = renderSummaryData;
    const dataToRender = reorderedData || renderSummaryData;

    return (
       <div>
        <Grid container spacing={2}>
          {isLoading ? (
            <Grid item xs={12} style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <CircularProgress />
            </Grid>
          ) : dataToRender.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
                No Records Found
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            {dataToRender.map((item, index) => (
              <Accordion
                key={index}
                expanded={expanded === item.id}
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
                  <Typography
                    variant="body2"
                    style={{ marginLeft: "auto", color: "#015C63", display: "flex", alignItems: "center" }}
                  >
                    {item.meetingDate} | {item.month} {item.year}
                    
                    {currentUserType === WORKFORCE_USER_TYPE.EIS_ADVISOR && (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="primary"
                        style={{ marginLeft: "16px" }}
                        onClick={(e) => this.handleOpenReschedule(e, item.id)} // CHANGED: Calls our new handler
                      >
                        Reschedule
                      </Button>
                    )}

                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionDetails}>
                  <Card style={{ width: "100%" }}>
                    <CardContent>
                      {expanded === item.id && (
                        <ApplicationProcessSearcher
                          summaryId={item.id}
                          cacheFiltersKey="pending"
                          onDoubleClick={this.onDoubleClick}
                          loggedInUserId={loggedInUserId}
                          disableButtons={disableButtons}
                          status={status}
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
            
            {/* ADDED: The Dialog component rendered at the root of the page to prevent nesting issues */}
            <RescheduleMeetingDialog 
              open={rescheduleDialogOpen}
              onClose={this.handleCloseReschedule}
              summaryId={selectedRescheduleId}
              onSuccess={this.handleRescheduleSuccess}
            />

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