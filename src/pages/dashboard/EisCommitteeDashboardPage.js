import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager,useHistory } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardHeader,
  CardContent,
  TextField,
  useTheme,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Select,       // <-- Added for new Association filter
  MenuItem,     // <-- Added for new Association filter
  FormControl,
  ButtonGroup,  
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { fetchSummaryApplications, fetchApplicationsSummary } from "../../actions";
import { fetchApplicationByDate, fetchGenderWiseApplicationMatrixByDate, fetchApplicationMonthWise } from "../../actions";
import { WORKFORCE_USER_TYPE, APP_TYPE_DASHBOARD_EN, APP_TYPE_DASHBOARD_BN, APPLICANT_TYPE_BN, APPLICANT_TYPE_EN } from "../../constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import DashboardIcon from '@material-ui/icons/Dashboard';
import CheckCircleOutlineTwoToneIcon from "@material-ui/icons/CheckCircleOutlineTwoTone";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { getUserType, getUserTypeFromRights } from "../../utils/utils";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "calc(100vh - 64px)",
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
      id: "dashboard",
      text: <FormattedMessage module="workforce" id="workforce.application.dashboard" />,
      icon: <DashboardIcon />,
    },
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
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = ({ summaryData = [], disableButtons = 0 }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);
  const [renderedData, setRenderedData] = useState([]);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const user_type = getUserType();

  useEffect(() => {
    setRenderedData(summaryData);
  }, [summaryData]);

  const handleChange = (panelId) => (event, isExpanded) => {
    if (isExpanded) {
      setRenderedData((prev) => {
        const clickedItem = prev.find((item) => item.id === panelId);
        const rest = prev.filter((item) => item.id !== panelId);
        return [clickedItem, ...rest];
      });
      setExpanded(panelId);
    } else {
      setExpanded(null);
    }
  };

  return (
    <div className={classes.accordionPadding}>
      <Typography variant="h5" gutterBottom>
        {user_type === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE && <FormattedMessage module="workforce" id="workforce.eis.committe.dashboard" />}
        {user_type === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE && <FormattedMessage module="workforce" id="workforce.eis.association.committe.dashboard" />}
      </Typography>

      {renderedData.map((item, index) => (
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
                  <ApplicationProcessSearcher summaryId={item.id} disableButtons={disableButtons} loggedInUserId={loggedInUserId} coloredRow={true} />
                )}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

const DashboardCard = ({ title, subtitle, children }) => (
  <Card style={{ height: "100%", borderRadius: "16px", boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)", padding: "10px" }}>
    <CardHeader 
      title={<Typography variant="h6" style={{ fontWeight: "bold" }}>{title}</Typography>}
      subheader={subtitle ? <Typography variant="body2" color="textSecondary">{subtitle}</Typography> : null}
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
  const history = useHistory();
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || "en";
  const isBn = locale === "fr" || locale === "bn"; // Handling your existing language toggle

  // --- 1. GLOBAL FILTERS STATE ---
  const [filter, setFilter] = useState("eis");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [accFromDate, setAccFromDate] = useState("");
  const [accToDate, setAccToDate] = useState("");
  const [association, setAssociation] = useState("all");

  const [months, setMonths] = useState(0);
  const [graphMonths, setGraphMonths] = useState(6);

  // --- 2. NEW MEETING SPECIFIC STATE ---
  const [lastMeetingOverview, setLastMeetingOverview] = useState({
    presented: 0,
    approved: 0,
    rejected: 0,
    reverted: 0
  });

  const [ongoingMeetingOverview, setOngoingMeetingOverview] = useState({
    caseType: { death: 0, disability: 0 },
    accidentType: { commuting: 0, workplace: 0, rta: 0 }
  });

  // --- 3. RETAINED METRICS STATE ---
  const [financialCounts, setFinancialCounts] = useState({ 
    paid: { death: 0, disability: 0 }, 
    lifetime: { death: 0, disability: 0 } 
  });
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  // --- HELPER FUNCTIONS ---
  const getMonthName = (index, locale = "en-US") => {
    const date = new Date(2000, index, 1);
    return date.toLocaleString(locale, { month: "long" });
  };

  const handleFilter = (f) => setFilter(f);

  // Strings needed as raw values for Recharts tooltips/legends
  const chartLabels = {
    processing: isBn ? "প্রক্রিয়াধীন" : "Processing",
    approved: isBn ? "অনুমোদিত" : "Approved",
    reverted: isBn ? "বাতিল" : "Reverted/Rejected",
    death: isBn ? "মৃত্যু" : "Death",
    disability: isBn ? "স্থায়ী ও অস্থায়ী অক্ষমতা" : "Permanent Or Curable Disability"
  };

  // --- EFFECTS ---

  useEffect(() => {
    async function loadPieData() {
      try {
        const orgType = filter === "সব" || filter === "All" ? "" : filter.toLowerCase();
        let res = [];
        await dispatch(fetchApplicationByDate(months, fromDate, toDate, orgType)).then((response) => {
          res = response.payload?.data?.workforceApplicationMatrix || [];
        });

        let approvedTotal = 0; let cancelledTotal = 0; let processingTotal = 0;
        
        res.forEach((item) => {
          const type = item.applicationType;
          let allow = false;
          if (orgType === "blwf") allow = type !== "disabilityAssistance";
          else if (orgType === "eis") allow = ["disabilityAssistance", "financialAssistance", "death"].includes(type);
          else allow = true;

          if (allow) {
            approvedTotal += Number(item.approvedCount);
            cancelledTotal += Number(item.rejectedCount);
            processingTotal += Number(item.applicationCount) - (Number(item.approvedCount) + Number(item.rejectedCount));
          }
        });

        setPieData([
          { name: chartLabels.processing, value: processingTotal, color: "#6cdfdfff" },
          { name: chartLabels.approved, value: approvedTotal, color: "#68b88cff" },
          { name: chartLabels.reverted, value: cancelledTotal, color: "#d48aa3ff" },
        ]);
      } catch (err) { console.error("Failed to fetch pie data", err); }
    }
    loadPieData();
  }, [months, fromDate, toDate, filter, chartLabels.processing, chartLabels.approved, chartLabels.reverted]);

  useEffect(() => {
    async function loadBarData() {
      try {
        let monthWiseRes = [];
        await dispatch(fetchApplicationMonthWise(graphMonths)).then((response) => {
          monthWiseRes = response.payload?.data?.workforceMonthwiseApplications || [];
        });

        let barDataArray = [];
        monthWiseRes.map((item) => {
          barDataArray.push({
            month: getMonthName(Number(item.month) - 1),
            [chartLabels.death]: item.death,
            [chartLabels.disability]: item.disabilityAssistance,
          });
        });
        setBarData(barDataArray);
      } catch (err) { console.error("Failed to fetch bar data", err); }
    }
    loadBarData();
  }, [graphMonths, chartLabels.death, chartLabels.disability]);

  return (
    <Grid container spacing={3}>
      {/* --- 1. OVERALL FILTERS SECTION --- */}
      <Grid item xs={12}>
        <Card style={{ borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Typography variant="h6" style={{ marginBottom: "15px", fontWeight: "bold" }}>
            <FormattedMessage id="workforce.dashboard.overallFilters" />
          </Typography>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                <FormattedMessage id="workforce.dashboard.appSubmissionDate" />
              </Typography>
              <Box display="flex" gridGap={10}>
                <TextField type="date" size="small" variant="outlined" fullWidth value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <TextField type="date" size="small" variant="outlined" fullWidth value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="textSecondary">
                <FormattedMessage id="workforce.dashboard.accidentDate" />
              </Typography>
              <Box display="flex" gridGap={10}>
                <TextField type="date" size="small" variant="outlined" fullWidth value={accFromDate} onChange={(e) => setAccFromDate(e.target.value)} />
                <TextField type="date" size="small" variant="outlined" fullWidth value={accToDate} onChange={(e) => setAccToDate(e.target.value)} />
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl variant="outlined" size="small" fullWidth>
                <Select value={association} onChange={(e) => setAssociation(e.target.value)} displayEmpty>
                  <MenuItem value="all"><FormattedMessage id="workforce.dashboard.allAssociations" /></MenuItem>
                  <MenuItem value="bgmea">BGMEA</MenuItem>
                  <MenuItem value="bkmea">BKMEA</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
               <ButtonGroup size="small" variant="outlined" fullWidth>
                  {["All", "CF", "EIS"].map((f) => (
                    <Button key={f} variant={filter === f ? "contained" : "outlined"} onClick={() => handleFilter(f)}>
                      {f === "All" ? <FormattedMessage id="workforce.dashboard.filter.all" defaultMessage="All"/> : f}
                    </Button>
                  ))}
               </ButtonGroup>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* --- 2. NEW METRICS: MEETING OVERVIEWS --- */}
      <Grid item xs={12} md={6}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.lastMeetingOverview" />}>
          <StatRow label={<FormattedMessage id="workforce.dashboard.lastMeeting.presented" />} count={lastMeetingOverview.presented} />
          <StatRow label={<FormattedMessage id="workforce.dashboard.lastMeeting.approved" />} count={lastMeetingOverview.approved} color="#2e7d32" />
          <StatRow label={<FormattedMessage id="workforce.dashboard.lastMeeting.rejected" />} count={lastMeetingOverview.rejected} color="#d32f2f" />
          <StatRow label={<FormattedMessage id="workforce.dashboard.lastMeeting.reverted" />} count={lastMeetingOverview.reverted} color="#ed6c02" />
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.ongoingMeetingOverview" />}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" style={{ marginTop: 10, color: "#1976d2" }}>
                <FormattedMessage id="workforce.dashboard.ongoingMeeting.caseType" />
              </Typography>
              <StatRow label={<FormattedMessage id="workforce.dashboard.ongoingMeeting.deathCount" />} count={ongoingMeetingOverview.caseType.death} />
              <StatRow label={<FormattedMessage id="workforce.dashboard.ongoingMeeting.disabilityCount" />} count={ongoingMeetingOverview.caseType.disability} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" style={{ marginTop: 10, color: "#ed6c02" }}>
                <FormattedMessage id="workforce.dashboard.ongoingMeeting.accidentType" />
              </Typography>
              <StatRow label={<FormattedMessage id="workforce.dashboard.ongoingMeeting.commutingCount" />} count={ongoingMeetingOverview.accidentType.commuting} />
              <StatRow label={<FormattedMessage id="workforce.dashboard.ongoingMeeting.workplaceCount" />} count={ongoingMeetingOverview.accidentType.workplace} />
              <StatRow label={<FormattedMessage id="workforce.dashboard.ongoingMeeting.rtaCount" />} count={ongoingMeetingOverview.accidentType.rta} />
            </Grid>
          </Grid>
        </DashboardCard>
      </Grid>

      {/* --- 3. RETAINED METRICS: FINANCIAL & CHARTS --- */}
      <Grid item xs={12}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.financialOverview" />}>
           <Grid container spacing={4}>
             <Grid item xs={12} md={6}>
               <Typography variant="subtitle2" style={{ marginTop: 10, color: "#2e7d32" }}>
                 <FormattedMessage id="workforce.dashboard.financial.paidTillNow" />
               </Typography>
               <StatRow label={<FormattedMessage id="workforce.dashboard.financial.deathTotal" />} count={`৳ ${financialCounts.paid.death}`} />
               <StatRow label={<FormattedMessage id="workforce.dashboard.financial.disabilityTotal" />} count={`৳ ${financialCounts.paid.disability}`} />
             </Grid>
             <Grid item xs={12} md={6}>
               <Typography variant="subtitle2" style={{ marginTop: 10, color: "#ed6c02" }}>
                 <FormattedMessage id="workforce.dashboard.financial.approxLifetime" />
               </Typography>
               <StatRow label={<FormattedMessage id="workforce.dashboard.financial.deathTotal" />} count={`৳ ${financialCounts.lifetime.death}`} />
               <StatRow label={<FormattedMessage id="workforce.dashboard.financial.disabilityTotal" />} count={`৳ ${financialCounts.lifetime.disability}`} />
             </Grid>
           </Grid>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={5}>
         <DashboardCard title={<FormattedMessage id="workforce.dashboard.appSegregation" />}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
         </DashboardCard>
      </Grid>

      <Grid item xs={12} md={7}>
         <DashboardCard title={<FormattedMessage id="workforce.dashboard.accidentVsTime" />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}> 
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: isBn ? "দুর্ঘটনার সংখ্যা" : "Number of accidents", angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey={chartLabels.death} stackId="death" fill="#d32f2f" />
                <Bar dataKey={chartLabels.disability} stackId="disability" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
         </DashboardCard>
      </Grid>
    </Grid>
  );
};

// ------------------------------------------------------------

const EisCommitteeDashboardPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [selectedMenu, setSelectedMenu] = useState("dashboard"); // Default first menu
  useEffect(() => {
    return dispatch(fetchSummaryApplications(modulesManager, ['organizationType:"eis"']));
  }, []);

  const data = useSelector((state) => state.workforce[`applicationsSummary`] ?? []);

  const pendingSummaryData = data.filter((d) => d.status === "forward_to_comiitee");
  const sentSummaryData = data.filter((d) => d.status === "approved_by_committee");
  console.log("Pending Summary Data:", pendingSummaryData);

  const renderContent = () => {
    console.log("Selected Menu:", selectedMenu);
    switch (selectedMenu) {
      case "dashboard":
        return <Dashboard />;
      case "pendingMeetingSheet":
        return <FiledApplications summaryData={pendingSummaryData} />;
      case "approveMeetingSheet":
        return <FiledApplications summaryData={sentSummaryData} disableButtons={1} />;
      // default:
      //   return <FiledApplications summaryData={pendingSummaryData} />;
      default:
        return <Dashboard />;
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

export default EisCommitteeDashboardPage;
