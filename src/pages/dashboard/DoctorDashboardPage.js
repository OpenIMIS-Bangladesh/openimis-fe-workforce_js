import React, { useState, useEffect, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager } from "@openimis/fe-core";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
// Actions (Assuming your previous imports)
import { fetchApplicationByDate, fetchApplicationMonthWise } from "../../actions";
import { fetchSummaryApplications } from "../../actions";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import ForwardIcon from "@material-ui/icons/Forward";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import DashboardIcon from '@material-ui/icons/Dashboard';
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserType, getUserTypeFromRights, isBlwfPath, isEisPath } from "../../utils/utils";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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

const getSidebarMenu = (user_type) => {
  let allMenu = [];
  if (user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) {
    allMenu = [
      {
        id: "dashboard",
        text: <FormattedMessage module="workforce" id="workforce.application.dashboard" />,
        icon: <DashboardIcon />,
      },
      {
        id: "pendingMeetingSheet",
        text: <FormattedMessage module="workforce" id="workforce.employee.application.pendingMeetingSheet" />,
        icon: <HourglassFullTwoToneIcon />,
      },
      // {
      //   id: "forwardedMeetingSheet",
      //   text: (
      //     <FormattedMessage
      //       module="workforce"
      //       id="workforce.employee.application.forwardedMeetingSheet"
      //     />
      //   ),
      //   icon: <ForwardIcon />,
      // },
      {
        id: "forwardedApplications",
        text: <FormattedMessage module="workforce" id="workforce.application.forwarded" />,
        icon: <ForwardIcon />,
      },

      {
        id: "returnedApplications",
        text: <FormattedMessage module="workforce" id="workforce.application.returned" />,
        icon: <ArrowBackIcon />,
      },
    ];
  } else {
    allMenu = [
      {
        id: "dashboard",
        text: <FormattedMessage module="workforce" id="workforce.application.dashboard" />,
        icon: <DashboardIcon />,
      },
      {
        id: "pendingApplications",
        text: <FormattedMessage module="workforce" id="workforce.application.pending" />,
        icon: <HourglassFullTwoToneIcon />,
      },
      {
        id: "forwardedApplications",
        text: <FormattedMessage module="workforce" id="workforce.application.forwarded" />,
        icon: <ForwardIcon />,
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
    ];
  }

  // if (user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) {
  //   return allMenu.filter((m) => m.id === "pendingMeetingSheet");
  // }

  // if (
  //   user_type === WORKFORCE_USER_TYPE.DOCTOR ||
  //   user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR
  // ) {
  //   return allMenu.filter((m) => m.id !== "pendingMeetingSheet");
  // }

  return allMenu;
};

// ----------- Components to Render in Main Content -----------

const ForwardedApplications = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  return (
    <>
      <ApplicationProcessSearcher
        forwardedApplications={true}
        loggedInUserId={loggedInUserId}
        disableButtons={1}
        dynamicTableTitle={"workforce.application.forwarded"}
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

const FiledApplications = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  return (
    <>
      <Card className={classes.tableContainer}>
        <CardContent>
          <ApplicationProcessSearcher loggedInUserId={loggedInUserId} coloredRow={true} />
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
  );
};

const DashboardCard = ({ title, children }) => (
  <Card style={{ height: "100%", borderRadius: "16px", boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)", padding: "10px" }}>
    <CardHeader
      title={
        <Typography variant="h6" style={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      }
    />
    <CardContent style={{ paddingTop: 0 }}>{children}</CardContent>
  </Card>
);

const StatRow = ({ label, count, color }) => (
  <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #f0f0f0">
    <Typography style={{ color: color || "inherit" }}>{label}</Typography>
    <Typography variant="subtitle1" style={{ fontWeight: "bold", color: color || "inherit" }}>
      {count}
    </Typography>
  </Box>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || "en";

  // --- 1. RETAINED STATE FOR EFFECTS ---
  const [months, setMonths] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filter, setFilter] = useState("eis");
  const [graphMonths, setGraphMonths] = useState(6);

  // --- 2. NEW ASSESSMENT SPECIFIC STATE ---
  const [previousAssessments, setPreviousAssessments] = useState({
    male: 0,
    female: 0,
  });

  const [ongoingAssessments, setOngoingAssessments] = useState({
    male: 0,
    female: 0,
  });

  const [totalAssessments, setTotalAssessments] = useState({
    gender: { male: 0, female: 0 },
    accidentType: { commuting: 0, workplace: 0, rta: 0 },
  });

  // --- 3. RETAINED EFFECTS ---
  useEffect(() => {
    async function loadData() {
      try {
        const orgType = filter === "সব" || filter === "All" ? "" : filter.toLowerCase();
        // Retained background fetch logic as requested
        await dispatch(fetchApplicationByDate(months, fromDate, toDate, orgType));
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }
    loadData();
  }, [months, fromDate, toDate, filter, dispatch]);

  useEffect(() => {
    async function loadMonthWiseData() {
      try {
        await dispatch(fetchApplicationMonthWise(graphMonths));
      } catch (err) {
        console.error("Failed to fetch month wise data", err);
      }
    }
    loadMonthWiseData();
  }, [graphMonths, dispatch]);

  // --- 4. NEW ASSESSMENT DATA EFFECT ---
  useEffect(() => {
    async function loadAssessmentData() {
      // TODO: Dispatch specific actions for the Assessment user here
      // Example:
      // const res = await dispatch(fetchAssessmentOverview(fromDate, toDate));
      // setPreviousAssessments(res.previous);
      // setOngoingAssessments(res.ongoing);
      // setTotalAssessments(res.total);
    }
    loadAssessmentData();
  }, [fromDate, toDate]);

  return (
    <Grid container spacing={3} style={{ marginTop: "20px" }}>
      {/* Card 1: Previous Assessments */}
      <Grid item xs={12} md={4}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.assessments.previous" />}>
          <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.maleCount" />} count={previousAssessments.male} />
          <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.femaleCount" />} count={previousAssessments.female} />
        </DashboardCard>
      </Grid>

      {/* Card 2: Ongoing Assessments */}
      <Grid item xs={12} md={4}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.assessments.ongoing" />}>
          <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.maleCount" />} count={ongoingAssessments.male} color="#ed6c02" />
          <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.femaleCount" />} count={ongoingAssessments.female} color="#ed6c02" />
        </DashboardCard>
      </Grid>

      {/* Card 3: Total Assessments */}
      <Grid item xs={12} md={4}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.assessments.total" />}>
          <Typography variant="subtitle2" style={{ color: "#1976d2", marginTop: 10 }}>
            <FormattedMessage id="workforce.dashboard.assessments.byGender" />
          </Typography>
          <Box pl={2} mb={2}>
            <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.maleOnly" />} count={totalAssessments.gender.male} />
            <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.femaleOnly" />} count={totalAssessments.gender.female} />
          </Box>

          <Typography variant="subtitle2" style={{ color: "#d32f2f" }}>
            <FormattedMessage id="workforce.dashboard.assessments.byAccidentType" />
          </Typography>
          <Box pl={2}>
            <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.commuting" />} count={totalAssessments.accidentType.commuting} />
            <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.workplace" />} count={totalAssessments.accidentType.workplace} />
            <StatRow label={<FormattedMessage id="workforce.dashboard.assessments.rta" />} count={totalAssessments.accidentType.rta} />
          </Box>
        </DashboardCard>
      </Grid>
    </Grid>
  );
};

const MeetingSheet = ({ summaryData = [], disableButtons = 0 }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };
  return (
    <div className={classes.accordionPadding}>
      {summaryData.map((item, index) => (
        <Accordion key={index} expanded={expanded === item.id} onChange={handleChange(item.id)} className={classes.accordion}>
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
                    loggedInUserId={loggedInUserId}
                    filedMeetingSheet={true}
                    // disableButtons={disableButtons}
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

const DoctorDashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const user_type = getUserType();
  const SidebarMenu = useMemo(() => getSidebarMenu(user_type), [user_type]);
  const [selectedMenu, setSelectedMenu] = useState(user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR ? "dashboard" : "dashboard");
   const organizationType = isEisPath()
    ? "eis"
    : !isEisPath() && !isBlwfPath()
      ? "cf"
      : "blwf";
  useEffect(() => {
    return dispatch(fetchSummaryApplications(modulesManager, [`organizationType:"${organizationType}"`]));
  }, []);
  const data = useSelector((state) => state.workforce[`applicationsSummary`] ?? []);

  const pendingSummaryData = data.filter((d) => d.status === "forward_to_doctor" && organizationType);
  const forwardedSummaryData = data.filter((d) => d.status === "approved_by_doctor" && organizationType);

  const renderContent = () => {
    const user_type = getUserType();

    if (user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) {
      switch (selectedMenu) {
        case "dashboard":
          return <Dashboard />;
        case "pendingMeetingSheet":
          return <MeetingSheet summaryData={pendingSummaryData} disableButtons={1} />;
        case "forwardedApplications":
          return <ForwardedApplications />;
        case "returnedApplications":
          return <ReturnedApplications />;
        default:
          return <Dashboard />;
      }
    } else {
      switch (selectedMenu) {
        case "dashboard":
          return <Dashboard />;
        case "pendingApplications":
          // return <FiledApplications />;
          return <MeetingSheet summaryData={pendingSummaryData} disableButtons={1} />;

        case "forwardedApplications":
          return <ForwardedApplications />;

        case "revertedApplications":
          return <RevertedApplications />;

        case "returnedApplications":
          return <ReturnedApplications />;

        default:
          return <Dashboard />;
      }
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
          <Typography variant="h5" gutterBottom>
            {user_type === WORKFORCE_USER_TYPE.DOCTOR && <FormattedMessage module="workforce" id="workforce.section.cf.doctor.dashboard" />}
            {user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR && <FormattedMessage module="workforce" id="workforce.section.blwf.doctor.dashboard" />}
            {user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR && <FormattedMessage module="workforce" id="workforce.section.eis.doctor.dashboard" />}
          </Typography>
          {renderContent()}
        </Grid>
      </Grid>
    </div>
  );
};

export default DoctorDashboard;
