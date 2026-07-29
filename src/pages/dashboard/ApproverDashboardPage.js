import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CancelTwoToneIcon from "@material-ui/icons/CancelTwoTone";
import CheckCircleOutlineTwoToneIcon from "@material-ui/icons/CheckCircleOutlineTwoTone";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { fetchSummaryApplications } from "../../actions";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "calc(100vh - 64px)", // assuming 64px header/appbar, adjust as needed
    overflow: "visible",
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "40vh",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
  },
  content: {
    height: "100vh",
    overflowY: "auto",
    padding: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(0),
  },
  tableHeadCell: {
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  searchInput: {
    border: "1px solid #ccc",
    borderRadius: 4,
    padding: "4px 8px",
    width: 200,
  },
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#B7D4D8",
  },
  accordion: {
    boxShadow: "1px 1px 1px 1px",
    border: "none",
    backgroundColor: "white",
    marginBottom: "12px",
    borderRadius: "6px",
    "&::before": {
      display: "none",
    },
  },
  accordionPadding: {
    paddingBottom: "40px !important",
  },
  accordionSummary: {
    padding: "8px 16px",
    backgroundColor: "white",
    borderRadius: "6px",
    "& .MuiTypography-root": {
      color: "#015C63", // teal-like tone
      fontWeight: 600,
    },
  },
  accordionDetails: {
    backgroundColor: "white",
    padding: "16px",
    borderTop: "1px solid #ddd",
  },
}));

const SidebarMenu = [
  {
    id: "pendingMeetingSheet",
    text: <FormattedMessage module="workforce" id="workforce.employee.application.meetingSheet" />,
    icon: <HourglassFullTwoToneIcon />,
  },
  {
    id: "approveMeetingSheet",
    text: <FormattedMessage module="workforce" id="workforce.application.forwarded" />,
    icon: <CheckCircleOutlineTwoToneIcon />,
  },
  {
    id: "revertedApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.reverted" />,
    icon: <RestorePageIcon />,
  },
  {
    id: "returnedApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.returned" />,
    icon: <ArrowBackIcon />,
  },
  {
    id: "rejectedApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.rejected" />, // Add appropriate i18n id
    icon: <CancelTwoToneIcon />,
  },
];

// ----------- Components to Render in Main Content -----------

const ReturnedApplications = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  return (
    <>
      <ApplicationProcessSearcher
        returnedApplications={true}
        loggedInUserId={loggedInUserId}
        disableButtons={1}
        dynamicTableTitle={"workforce.application.returned"}
      />
      {/* Pagination */}
      <div className={classes.pagination}>
        <Button>
          <FormattedMessage module="workforce" id="workforce.back" />
        </Button>
        <Button>
          <FormattedMessage module="workforce" id="workforce.next" />
        </Button>
      </div>
    </>
  );
};
const RevertedApplications = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  return (
    <>
      <ApplicationProcessSearcher
        revertedApplications={true}
        loggedInUserId={loggedInUserId}
        disableButtons={1}
        dynamicTableTitle={"workforce.application.reverted"}
      />
      {/* Pagination */}
      <div className={classes.pagination}>
        <Button>
          <FormattedMessage module="workforce" id="workforce.back" />
        </Button>
        <Button>
          <FormattedMessage module="workforce" id="workforce.next" />
        </Button>
      </div>
    </>
  );
};

const FiledApplications = ({ summaryData = [], disableButtons = 0, rejectedByCommittee }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);
  const [currentData, setCurrentData] = useState(summaryData);
  const [originalData, setOriginalData] = useState(summaryData);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  // keep originalData and currentData in sync when props change
  useEffect(() => {
    setCurrentData(summaryData);
    setOriginalData(summaryData);
  }, [summaryData]);

  const handleChange = (panelId) => (event, isExpanded) => {
    if (isExpanded) {
      // move clicked item to top
      setCurrentData((prev) => {
        const idx = prev.findIndex((item) => item.id === panelId);
        if (idx === -1) return prev;
        const newList = [...prev];
        const [selected] = newList.splice(idx, 1);
        newList.unshift(selected);
        return newList;
      });
      setExpanded(panelId);
    } else {
      setExpanded(null);
      setCurrentData(originalData);
    }
  };

  return (
    <div className={classes.accordionPadding}>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.cf.approver.dashboard" />
      </Typography>

      {currentData.map((item) => (
        <Accordion key={item.id} expanded={expanded === item.id} onChange={handleChange(item.id)} className={classes.accordion}>
          <AccordionSummary className={classes.accordionSummary} expandIcon={<ExpandMoreIcon className="material-icons" />}>
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
                {expanded === item.id && (
                  <ApplicationProcessSearcher
                    summaryId={item.id}
                    disableButtons={disableButtons}
                    loggedInUserId={loggedInUserId}
                    coloredRow={true}
                    summaryData={item}
                  />
                )}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

const RejectedApplications = ({ disableButtons = 0 }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [expanded, setExpanded] = useState(null);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  useEffect(() => {
    // Adjust the fetch action/parameters for rejected applications as needed
    dispatch(fetchSummaryApplications(modulesManager, ['organizationType:"cf"', 'status:"forward_to_comiitee"','applicationStatusIn:["rejected_by_committee"]']));
  }, [dispatch, modulesManager]);

  const data = useSelector((state) => state.workforce[`applicationsSummary`] ?? []);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };

  return (
    <div className={classes.accordionPadding}>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.dashboard" />
      </Typography>

      {data.map((item, index) => (
        <Accordion
          key={index}
          expanded={expanded === item.id}
          onChange={handleChange(item.id)}
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
              style={{ marginLeft: "auto", color: "#015C63" }}
            >
              {item.meetingDate} | {item.month} {item.year}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <Card style={{ width: "100%" }}>
              <CardContent>
                {expanded === item.id && (
                  <ApplicationProcessSearcher 
                    coloredRow={true} 
                    summaryId={item.id} 
                    loggedInUserId={loggedInUserId} 
                    disableButtons={disableButtons} 
                    statusInSummary={"rejected_by_committee"} 
                  />
                )}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

// ------------------------------------------------------------

const ApproverDashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [selectedMenu, setSelectedMenu] = useState("pendingMeetingSheet");
  useEffect(() => {
    return dispatch(fetchSummaryApplications(modulesManager, ['organizationType:"cf"']));
  }, []);

  const data = useSelector((state) => state.workforce[`applicationsSummary`] ?? []);

  const pendingSummaryData = data.filter((d) => d.status === "meeting_created" || d.status === "forward_to_comiitee");
  const sentSummaryData = data.filter((d) => d.status === "forward_to_dg" || d.status === "forward_to_director" || d.status === "approved_by_committee");
  const rejectedSummaryData = data.filter((d) => d.status === "forward_to_comiitee");
  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingMeetingSheet":
        return <FiledApplications summaryData={pendingSummaryData} />;
      case "approveMeetingSheet":
        return <FiledApplications summaryData={sentSummaryData} disableButtons={1} />;
      case "revertedApplications":
        return <RevertedApplications />;
      case "returnedApplications":
        return <ReturnedApplications />;
      case "rejectedApplications":
        return <RejectedApplications/>;
      default:
        return <FiledApplications />;
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={2} className={classes.root}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper className={classes.sidebar}>
            <List>
              {SidebarMenu.map((item) => (
                <ListItem button key={item.id} selected={selectedMenu === item.id} onClick={() => setSelectedMenu(item.id)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9} className={classes.content}>
          {renderContent()}
        </Grid>
      </Grid>
    </div>
  );
};

export default ApproverDashboard;
