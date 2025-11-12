import React, { useState,useEffect} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage,useModulesManager,useHistory } from "@openimis/fe-core";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { fetchSummaryApplications } from "../../actions";
import { fetchApplicationsSummary } from "../../actions";
import RestorePageIcon from '@material-ui/icons/RestorePage';
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import HourglassFullTwoToneIcon from '@material-ui/icons/HourglassFullTwoTone';
import CheckCircleOutlineTwoToneIcon from '@material-ui/icons/CheckCircleOutlineTwoTone';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";
import CancelIcon from '@material-ui/icons/Cancel';
// import GppMaybeIcon from '@material-ui/icons/GppMaybe';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import AssignmentReturnedIcon from '@material-ui/icons/AssignmentReturned';
import ForwardIcon from '@material-ui/icons/Forward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import BeneficiaryReport from "../reports/BeneficiaryReport";

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
    height: "70vh",
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
    display: "none",
  },
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
    id: "pendingApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.pending" />
    ),
    icon: <AssignmentReturnedIcon />,
  },
  {
    id: "sentForVerificationApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.sentforverification" />
    ),
    icon: <HourglassFullTwoToneIcon />,
  },
  {
    id: "verifiedApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.verified" />
    ),
    icon: <VerifiedUserIcon />,
  },
  {
    id: "rejectedApplication",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.rejectedApplication" />
    ),
    icon: <CancelIcon />,
  },
  {
    id: "pendingMeetingSheet",
    text: (
      <FormattedMessage module="workforce" id="workforce.employee.application.pendingMeetingSheet" />
    ),
    icon: <HourglassFullTwoToneIcon  />,
  },
  {
    id: "revertedApplication",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.reverted" />
    ),
    icon: <RestorePageIcon  />,
  },
  {
    id: "returnedApplication",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.returned" />
    ),
    icon: <ArrowBackIcon  />,
  },
  {
    id: "sentMeetingSheet",
    text: (
      <FormattedMessage module="workforce" id="workforce.employee.application.sentMeetingSheet"
      />
    ),
    icon: <ForwardIcon />,
  },
  {
    id: "approveMeetingSheet",
    text: (
      <FormattedMessage module="workforce" id="workforce.employee.application.approveMeetingSheet"
      />
    ),
    icon: <CheckCircleOutlineTwoToneIcon />,
  },
  {
    id: "applicationStatus",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.status" />
    ),
    icon: <AssignmentIcon />,
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
        dynamicTableTitle= {"workforce.application.returned"}
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
  )
}

const FiledApplications = () =>{ 
  const classes = useStyles()
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.blwf.section.admin.dashboard" />
    </Typography>
   <Card className={classes.tableContainer}>
        <CardContent>
            <ApplicationProcessSearcher
              coloredRow={true}
            />
          </CardContent>
      </Card>

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
);}

const ApprovedApplications = ({ summaryData = [], disableButtons=0 }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };
  console.log("clear")
  console.log("summary data", summaryData);
  return (
    <div className={classes.accordionPadding}>
        {summaryData         
          .map((item, index) => (
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
                      <ApplicationProcessSearcher summaryId={item.id} disableButtons={disableButtons}/>
                    )}
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
          ))}
    </div>
  );
};
const SentMeetingSheet = ({ summaryData = [], disableButtons=0 }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };
  console.log("clear")
  console.log("summary data", summaryData);
  return (
    <div className={classes.accordionPadding}>
        {summaryData         
          .map((item, index) => (
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
                      <ApplicationProcessSearcher summaryId={item.id} disableButtons={disableButtons}/>
                    )}
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
          ))}
    </div>
  );
};

const SentForVerificationApplications = () =>{ 
  const classes = useStyles()
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.application.sentforverification" />
    </Typography>
   <Card className={classes.tableContainer}>
        <CardContent>
            <ApplicationProcessSearcher
              sentForVerificationApplications={true}
              disableButtons={1}
            />
          </CardContent>
      </Card>

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
);}
const VerifiedApplications = () =>{ 
  const classes = useStyles()
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.application.verified" />
    </Typography>
   <Card className={classes.tableContainer}>
        <CardContent>
            <ApplicationProcessSearcher
              verifiedApplications={true}
              meetingForwardButton={1}
            />
          </CardContent>
      </Card>

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
);}


const BeneficiaryReportSheet = () => {
  // historyPush("/workforce/reports/beneficiary-report");
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.employee.application.beneficiaryReportSheet" />
      </Typography>
      <BeneficiaryReport />
    </div>
  );
};

const ApplicationStatus = () => {
  const dispatch = useDispatch();
  const mm = useModulesManager();
  const [nid, setNid] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const classes = useStyles()
  const [hasResults, setHasResults] = useState(true);
  const handleApplicationSearch = () => {
  const filters = [`workforceEmployee_Nid: "${nid}"`];
  dispatch(fetchApplicationsSummary(mm, filters)).then((res) => {
    const edges = res.payload?.data?.workforceApplication?.edges || [];
    setApplicationData(edges.map((e) => e.node));
    setShowResult(true);
  });
};


  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <FormattedMessage module="workforce" id="workforce.application.status" />
        </Typography>

        <Grid container spacing={2} justifyContent="center" style={{ marginTop: 16, padding: "32px", textAlign: "center" }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={
                <FormattedMessage module="workforce" id="workforce.representative.nid" />
              }
              value={nid}
              onChange={(e) => setNid(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleApplicationSearch}>
                <FormattedMessage module="workforce" id="workforce.search.here" />
            </Button>
          </Grid>
        </Grid>

       {showResult && (
          <>
            <Card className={classes.tableContainer} style={{ marginTop: 10 }}>
              <CardContent>
                <ApplicationProcessSearcher
                  nidFilters={[`workforceEmployee_Nid: "${nid}"`]}
                  onDataLoaded={(data) => setHasResults(data && data.length > 0)}
                  disableButtons= {1}
                />
              </CardContent>
            </Card>

            {!hasResults && (
              <Typography color="error" style={{ marginTop: 32 }}>
                <FormattedMessage
                  module="workforce"
                  id="workforce.tracking.notfound"
                  defaultMessage="কোনো আবেদন পাওয়া যায়নি।"
                />
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};


const RevertApplication = () => {
  const classes = useStyles()
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.application.reverted" />
    </Typography>
   <Card className={classes.tableContainer}>
       <CardContent>
             <ApplicationProcessSearcher
                revertedApplication={true}
                loggedInUserId={loggedInUserId}
              />
            </CardContent>
      </Card>

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
)}


const RejectApplication = () => {
  const classes = useStyles()
  return (
    <>
      <ApplicationProcessSearcher
        rejectedApplication={true}
        dynamicTableTitle= {"workforce.application.rejectedApplication"}
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
  )
}
const PendingMeetingSheet = ({ summaryData = [] }) => {
  console.log("summary data", summaryData);
  const classes = useStyles()
  return (
    <>
      {/* Render each summaryData item as an accordion */}
      {summaryData.map((item, index) => (
        <Accordion key={index} defaultExpanded={false} className={classes.accordion}>
          <AccordionSummary className={classes.accordionSummary} expandIcon={<ExpandMoreIcon  className="material-icons"/>}>
            <Typography variant="subtitle1" style={{ flex: 1 }}>
              <strong>{item.name}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginLeft: 'auto' }}>
              {item.meetingDate} | {item.month} {item.year}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.AccordionDetails}>
            <Card style={{ width: "100%" }}>
              <CardContent>
                <ApplicationProcessSearcher summaryId={item.id}/>
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

// ------------------------------------------------------------

const BlwfSectionAdminDashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch()
  const modulesManager = useModulesManager()
  const [selectedMenu, setSelectedMenu] = useState("pendingApplications"); // Default first menu
 useEffect(() => {
      return dispatch(fetchSummaryApplications(modulesManager,['status:"approved_by_dg"','organizationType:"blwf"']));
    }, []);
  const data = useSelector(
      (state) => state.workforce[`applicationsSummary`] ?? []
    );

  const pendingSummaryData = data.filter(d => d.status !== "approved_by_dg");
  const approvedSummaryData = data.filter(d => d.status === "approved_by_dg");
  const sentSummaryData = data.filter(d => d.status === "forward_to_comiitee");

 

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingApplications":
        return <FiledApplications />;
      case "sentForVerificationApplications":
        return <SentForVerificationApplications />;
      case "verifiedApplications":
        return <VerifiedApplications />;
      case "rejectedApplication":
        return <RejectApplication />;
      case "revertedApplication":
        return <RevertApplication />;
      case "returnedApplication":
        return <ReturnedApplications />;
      case "pendingMeetingSheet":
        return <PendingMeetingSheet summaryData={pendingSummaryData} disableButtons={1} />;
      case "sentMeetingSheet":
        return <SentMeetingSheet summaryData={sentSummaryData} disableButtons={1} />;
      case "approveMeetingSheet":
        return <ApprovedApplications summaryData={approvedSummaryData} disableButtons={1} />;
      case "applicationStatus":
        return <ApplicationStatus />;
      case "beneficiaryReportSheet":
        return <BeneficiaryReportSheet />;
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

export default BlwfSectionAdminDashboard;
