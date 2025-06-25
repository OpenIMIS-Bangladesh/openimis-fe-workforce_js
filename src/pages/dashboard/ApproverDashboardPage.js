import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage,useModulesManager } from "@openimis/fe-core";
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
import HourglassFullTwoToneIcon from '@material-ui/icons/HourglassFullTwoTone';
import CheckCircleOutlineTwoToneIcon from '@material-ui/icons/CheckCircleOutlineTwoTone';
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { fetchSummaryApplications } from "../../actions";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: 'calc(100vh - 64px)', // assuming 64px header/appbar, adjust as needed
    overflow: 'hidden',
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
    height: '100vh',
    overflowY: 'auto',
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
    display: "none", // removes default top border
  },
},
accordionPadding:{
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
    text: (
      <FormattedMessage module="workforce" id="workforce.employee.application.pendingMeetingSheet" />
    ),
    icon: <HourglassFullTwoToneIcon />,
  },
  {
    id: "approveMeetingSheet",
    text: (
      <FormattedMessage module="workforce" id="workforce.employee.application.approveMeetingSheet" />
    ),
    icon: <CheckCircleOutlineTwoToneIcon />,
  },
  // {
  //   id: "recentApplications",
  //   text: (
  //     <FormattedMessage module="workforce" id="workforce.application.recent" />
  //   ),
  //   icon: <DoneAllIcon />,
  // },
  // {
  //   id: "applicationStatus",
  //   text: (
  //     <FormattedMessage module="workforce" id="workforce.application.status" />
  //   ),
  //   icon: <AssignmentIcon  />,
  // },
   
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = ({ summaryData = [] }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };

  return (
    <div  className={classes.accordionPadding} >
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.approver.dashboard" />
      </Typography>

      {summaryData.map((item, index) => (
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
            <Typography variant="body2" style={{ marginLeft: "auto", color: "#015C63" }}>
              {item.meetingDate} | {item.month} {item.year}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <Card style={{ width: "100%" }}>
              <CardContent>
                {/* 👇 Only render when this accordion is expanded */}
                {expanded === item.id && <ApplicationProcessSearcher summaryId={item.id} />}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};


const ApplicationStatus = () => {
  const classes = useStyles();

  return (
    <Card style={{ marginTop: 0, padding: "32px", textAlign: "center" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <FormattedMessage module="workforce" id="workforce.application.status" />
        </Typography>

        <Grid container spacing={2} justifyContent="center" style={{ marginTop: 16 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={<FormattedMessage module="workforce" id="workforce.employee.dependent.phone" />}
              style={{
                // border: "1px solid #ccc",
                // borderRadius: 4,
                // padding: "8px 12px",
                marginBottom: 16,
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={<FormattedMessage module="workforce" id="workforce.application.tracking.number" />}
              style={{
                // border: "1px solid #ccc",
                // borderRadius: 4,
                // padding: "8px 12px",
                marginBottom: 16,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
            >
              <FormattedMessage module="workforce" id="workforce.search.here" />
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ------------------------------------------------------------

const ApproverDashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch()
  const modulesManager = useModulesManager()
  const [selectedMenu, setSelectedMenu] = useState("pendingMeetingSheet"); // Default first menu
  useEffect(() => {
      return dispatch(fetchSummaryApplications(modulesManager,['status:"forward_to_comiitee"']));
    }, []);

  const data = useSelector(
      (state) => state.workforce[`applicationsSummary`] ?? []
    );
  console.clear()
  console.log("hello i am approver",data)

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingMeetingSheet":
        return <FiledApplications summaryData={data}/>;
      case "approveMeetingSheet":
        return <FiledApplications />;
      case "recentApplications":
        return <FiledApplications />;
      case "applicationStatus":
        return <ApplicationStatus />;
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
                <ListItem
                  button
                  key={item.id}
                  selected={selectedMenu === item.id}
                  onClick={() => setSelectedMenu(item.id)}
                >
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
