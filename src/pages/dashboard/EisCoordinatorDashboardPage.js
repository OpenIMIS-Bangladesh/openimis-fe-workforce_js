import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager, useHistory, parseData } from "@openimis/fe-core";
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
  Select, // <-- Added for new Association filter
  MenuItem, // <-- Added for new Association filter
  FormControl,
  ButtonGroup,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { fetchSummaryApplications, fetchApplicationsSummary, fetchWorkforceEisPaymentDisbursementStage, fetchApplicationsSummaryDashboard } from "../../actions";
import { getUserType, getUserTypeFromRights, safeParse } from "../../utils/utils";
import { fetchApplicationByDate, fetchGenderWiseApplicationMatrixByDate, fetchApplicationMonthWise } from "../../actions";
import { WORKFORCE_USER_TYPE, APP_TYPE_DASHBOARD_EN, APP_TYPE_DASHBOARD_BN, APPLICANT_TYPE_BN, APPLICANT_TYPE_EN } from "../../constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import AgingReportModal from "../reports/modals/AgingReportModal";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import CheckCircleOutlineTwoToneIcon from "@material-ui/icons/CheckCircleOutlineTwoTone";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";
import CancelIcon from "@material-ui/icons/Cancel";
import DashboardIcon from "@material-ui/icons/Dashboard";
// import GppMaybeIcon from '@material-ui/icons/GppMaybe';
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import AssignmentReturnedIcon from "@material-ui/icons/AssignmentReturned";
import ForwardIcon from "@material-ui/icons/Forward";
import BeneficiaryReport from "../reports/BeneficiaryReport";
import BeneficiaryManagement from "../../components/dashboard/beneficiary-management/BeneficiaryManagement";
import BeneficiaryPaymentProcess from "../../components/dashboard/beneficiary-management/BeneficiaryPaymentProcess";
import BeneficiaryProcessedPaymentList from "../../components/dashboard/beneficiary-management/BeneficiaryProcessedPaymentList";
import BeneficiaryBankAdviceList from "../../components/dashboard/beneficiary-management/BeneficiaryBankAdviceList";
import BeneficiaryDisbursedPayments from "../../components/dashboard/beneficiary-management/BeneficiaryDisbursedPayments";
import BeneficiaryNoaConfirmation from "../../components/dashboard/beneficiary-management/BeneficiaryNoaConfirmation";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "100%", // assuming 64px header/appbar, adjust as needed
    overflow: "visible",
  },
  sidebar: {
    position: "sticky",
    top: "100px",
    height: "70vh",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
  },
  content: {
    height: "100%",
    overflowY: "visible",
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
    id: "dashboard",
    text: <FormattedMessage module="workforce" id="workforce.application.dashboard" />,
    icon: <DashboardIcon />,
  },
  {
    id: "pendingApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.pending" />,
    icon: <AssignmentReturnedIcon />,
  },
  {
    id: "sentForVerificationApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.sentforverification" />,
    icon: <HourglassFullTwoToneIcon />,
  },
  {
    id: "verifiedApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.verified" />,
    icon: <VerifiedUserIcon />,
  },
  {
    id: "rejectedApplication",
    text: <FormattedMessage module="workforce" id="workforce.application.rejectedApplication" />,
    icon: <CancelIcon />,
  },
  {
    id: "pendingMeetingSheet",
    text: <FormattedMessage module="workforce" id="workforce.employee.application.pendingMeetingSheet" />,
    icon: <HourglassFullTwoToneIcon />,
  },
  {
    id: "advisorApproveMeetingSheet",
    text: <FormattedMessage module="workforce" id="workforce.employee.application.advisorApproveMeetingSheet" />,
    icon: <CheckCircleOutlineTwoToneIcon />,
  },
  {
    id: "revertedApplication",
    text: <FormattedMessage module="workforce" id="workforce.application.reverted" />,
    icon: <RestorePageIcon />,
  },
  {
    id: "sentMeetingSheet",
    text: <FormattedMessage module="workforce" id="workforce.employee.application.sentMeetingSheet" />,
    icon: <ForwardIcon />,
  },
  {
    id: "approveMeetingSheet",
    text: <FormattedMessage module="workforce" id="workforce.employee.application.approveMeetingSheet" />,
    icon: <CheckCircleOutlineTwoToneIcon />,
  },
  {
    id: "applicationStatus",
    text: <FormattedMessage module="workforce" id="workforce.application.status" />,
    icon: <AssignmentIcon />,
  },
  {
    id: "beneficiaryManagement",
    text: <FormattedMessage module="workforce" id="workforce.application.beneficiaryManagement" />,
    icon: <AssignmentIcon />,
  },
  {
    id: "beneficiaryPaymentProcess",
    text: <FormattedMessage module="workforce" id="workforce.application.beneficiaryPaymentProcess" />,
    icon: <AssignmentIcon />,
  },
  {
    id: "beneficiaryProcessedPaymentList",
    text: <FormattedMessage module="workforce" id="workforce.application.beneficiaryProcessedPaymentList" />,
    icon: <AssignmentIcon />,
  },
  {
    id: "beneficiaryBankAdviceList",
    text: <FormattedMessage module="workforce" id="workforce.application.beneficiaryBankAdviceList" />,
    icon: <AssignmentIcon />,
  },
  {
    id: "beneficiaryDisbursedPayments",
    text: <FormattedMessage module="workforce" id="workforce.application.beneficiaryDisbursedPayments" />,
    icon: <AssignmentIcon />,
  },
  {
    id: "beneficiaryNoaConfirmation",
    text: <FormattedMessage module="workforce" id="workforce.application.beneficiaryNoaConfirmation" />,
    icon: <AssignmentIcon />,
  },
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.eis.coordinator.dashboard" />
      </Typography>
      <Card className={classes.tableContainer}>
        <CardContent>
          <ApplicationProcessSearcher filedApplications={true} loggedInUserId={loggedInUserId} coloredRow={true} roleIds={["47"]} />
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

const ApprovedApplications = ({ summaryData = [], disableButtons = 0 }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };
  console.log("clear");
  console.log("summary data", summaryData);
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
              <CardContent>{expanded === item.id && <ApplicationProcessSearcher summaryId={item.id} disableButtons={disableButtons} />}</CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
const AdvisorApprovedApplications = ({ summaryData = [] }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };
  console.log("clear");
  console.log("summary data", summaryData);
  return (
    <div className={classes.accordionPadding}>
      {summaryData.length === 0 && (
        <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
          Loading...
        </Typography>
      )}
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
                {expanded === item.id && <ApplicationProcessSearcher summaryId={item.id} approvedButton={1} roleIds={["49"]} meetingForwardButton={0} />}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
const SentMeetingSheet = ({ summaryData = [], disableButtons = 0 }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : null);
  };
  console.log("clear");
  console.log("summary data", summaryData);
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
              <CardContent>{expanded === item.id && <ApplicationProcessSearcher summaryId={item.id} disableButtons={disableButtons} />}</CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

const SentForVerificationApplications = () => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.application.sentforverification" />
      </Typography>
      <Card className={classes.tableContainer}>
        <CardContent>
          <ApplicationProcessSearcher sentForVerificationApplications={true} />
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
const VerifiedApplications = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.application.verified" />
      </Typography>
      <Card className={classes.tableContainer}>
        <CardContent>
          <ApplicationProcessSearcher verifiedApplications={true} meetingForwardButton={1} loggedInUserId={loggedInUserId} />
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

const BeneficiaryReportSheet = () => {
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
  const classes = useStyles();
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
              label={<FormattedMessage module="workforce" id="workforce.representative.nid" />}
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
                  disableButtons={1}
                />
              </CardContent>
            </Card>

            {!hasResults && (
              <Typography color="error" style={{ marginTop: 32 }}>
                <FormattedMessage module="workforce" id="workforce.tracking.notfound" defaultMessage="কোনো আবেদন পাওয়া যায়নি।" />
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardCard = ({ title, subtitle, children }) => (
  <Card style={{ height: "100%", borderRadius: "16px", boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)", padding: "10px" }}>
    <CardHeader
      title={
        <Typography variant="h6" style={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      }
      subheader={
        subtitle ? (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        ) : null
      }
    />
    <CardContent style={{ paddingTop: 0 }}>{children}</CardContent>
  </Card>
);

const StatRow = ({ label, count, onClick, color }) => (
  <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #f0f0f0">
    <Typography style={{ color: color || "inherit" }}>{label}</Typography>
    {onClick ? (
      <Link component="button" variant="subtitle1" style={{ fontWeight: "bold", color: color || "#1976d2" }} onClick={onClick}>
        {count}
      </Link>
    ) : (
      <Typography variant="subtitle1" style={{ fontWeight: "bold", color: color || "inherit" }}>
        {count}
      </Typography>
    )}
  </Box>
);

const Dashboard = ({selectedMenu}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const history = useHistory();
  const user_type = getUserType();
  const modulesManager = useModulesManager();
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || "en";
  const isBn = locale === "fr" || locale === "bn";

  const applicationTypeNames = locale === "en" ? APP_TYPE_DASHBOARD_EN : APP_TYPE_DASHBOARD_BN;
  const applicantTypeNames = locale === "en" ? APPLICANT_TYPE_EN : APPLICANT_TYPE_BN;

  // --- 1. ORIGINAL STATE ---
  const [applications, setApplications] = useState([]);
  const [disbursedApplication, setDisbursedApplication] = useState([]);
  const [months, setMonths] = useState(0);
  const [monthString, setMonthString] = useState("");
  const [filter, setFilter] = useState("eis");
  const [fromDate, setFromDate] = useState("");
  const [fromDateString, setFromDateString] = useState("");
  const [toDate, setToDate] = useState("");
  const [toDateString, setToDateString] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [graphMonths, setGraphMonths] = useState(6);
  const [graphFromDate, setGraphFromDate] = useState("");
  const [graphToDate, setGraphToDate] = useState("");

  const [tableRows, setTableRows] = useState([]);
  const [totals, setTotals] = useState({ total: 0, approved: 0, cancelled: 0, processing: 0 });
  const [pendingApplicationTypes, setPendingApplicationTypes] = useState([]);
  const [applicationTypes, setApplicationTypes] = useState([]);
  const [applicationCounts, setApplicationCounts] = useState([]);
  const [totalBenefitAmount, setTotalBenefitAmount] = useState(0);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // --- 2. GLOBAL FILTERS STATE ---
  const [accFromDate, setAccFromDate] = useState("");
  const [accToDate, setAccToDate] = useState("");
  const [association, setAssociation] = useState("all");

  // --- 3. EIS ADVISOR STATE ---
  const [beneficiaryMonitoring, setBeneficiaryMonitoring] = useState({ almost18: 0, adultFemaleUnmarried: 0, elderly: 0, widowUnder35: 0 });
  const [verificationOverview, setVerificationOverview] = useState({ pending1m: 0, pending3m: 0, pending6m: 0, pending9m: 0, successful: 0 });
  const [marriageStatus, setMarriageStatus] = useState({
    unmarriedWidow: 0,
    unmarriedWidower: 0,
    unmarriedSister: 0,
    unmarriedDaughter: 0,
    unmarriedGrandDaughter: 0,
  });
  const [paymentStatus, setPaymentStatus] = useState({ disbursed: 0, pending: 0, onHold: 0 });

  // --- 4. PREVIOUS OVERVIEW STATES ---
  const [pipelineCounts, setPipelineCounts] = useState({ factory: 0, association: 0, eis: 0 });
  const [pendingCounts, setPendingCounts] = useState({ verified: { death: 0, disability: 0 }, nonVerified: { death: 0, disability: 0 } });
  const [overviewCounts, setOverviewCounts] = useState({ death: { male: 0, female: 0 }, disability: { male: 0, female: 0 } });
  const [accidentCounts, setAccidentCounts] = useState({ death: { workplace: 0, commuting: 0, rta: 0 }, disability: { workplace: 0, commuting: 0, rta: 0 } });
  const [financialCounts, setFinancialCounts] = useState({ paid: { death: 0, disability: 0 }, lifetime: { death: 0, disability: 0 } });

  // Chart String Translations (Used for Recharts Data objects)
  const chartLabels = {
    processing: isBn ? "প্রক্রিয়াধীন" : "Processing",
    approved: isBn ? "অনুমোদিত" : "Approved",
    reverted: isBn ? "বাতিল" : "Reverted",
    medical: isBn ? "চিকিৎসা" : "Medical",
    death: isBn ? "মৃত্যু" : "Death",
    educational: isBn ? "শিক্ষা" : "Educational",
    maternity: isBn ? "মাতৃত্ব" : "Maternity",
    disability: isBn ? "স্থায়ী ও অস্থায়ী অক্ষমতা" : "Permanent Or Curable Disability",
  };

  // --- HELPER FUNCTIONS ---
  const getMonthName = (index, locale = "en-US") => {
    const date = new Date(2000, index, 1);
    return date.toLocaleString(locale, { month: "long" });
  };

  const getBanglaDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("bn-BD");
  };
  const handleFromDateChange = (date) => setFromDate(date);
  const handleToDateChange = (date) => setToDate(date);

  const handleBeneficiaryClick = (filterValue) => {
    history.push(`/beneficiary-management?filter=${filterValue}`);
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (months > 0) {
      setFromDate("");
      setToDate("");
    }
  }, [months]);

  useEffect(() => {
    setMonths(0);
    setMonthString("");
  }, [fromDate, toDate]);

  useEffect(() => {
    async function loadData() {
      try {
        const orgType = filter === "সব" || filter === "All" ? "" : filter.toLowerCase();
        let res = [];
        await dispatch(fetchApplicationByDate(months, fromDate, toDate, orgType)).then((response) => {
          res = response.payload?.data?.workforceApplicationMatrix || [];
        });

        let rows = [];
        let appTypes = [];
        let pendingAppTypes = [];

        res.forEach((item) => {
          const type = item.applicationType;
          let allow = false;
          if (orgType === "blwf") allow = type !== "disabilityAssistance";
          else if (orgType === "eis") allow = ["disabilityAssistance", "financialAssistance", "death"].includes(type);
          else allow = true;

          if (allow) {
            rows.push({
              type: applicationTypeNames[type],
              total: Number(item.applicationCount),
              approved: Number(item.approvedCount),
              cancelled: Number(item.rejectedCount),
              processing: Number(item.applicationCount) - (Number(item.approvedCount) + Number(item.rejectedCount)),
            });
            appTypes.push({ appType: type, type: applicationTypeNames[type], count: Number(item.applicationCount) });
            pendingAppTypes.push({
              appType: type,
              type: applicationTypeNames[type],
              count: Number(item.applicationCount) - (Number(item.approvedCount) + Number(item.rejectedCount)),
            });
          }
        });

        setApplicationTypes(appTypes);
        setPendingApplicationTypes(pendingAppTypes);

        const totalsCalc = rows.reduce(
          (acc, r) => {
            acc.total += Number(r.total);
            acc.approved += Number(r.approved);
            acc.cancelled += Number(r.cancelled);
            acc.processing += Number(r.processing);
            return acc;
          },
          { total: 0, approved: 0, cancelled: 0, processing: 0 },
        );

        let approvedTotal = 0;
        let cancelledTotal = 0;
        let processingTotal = 0;
        rows.map((r) => {
          approvedTotal += Number(r.approved);
          cancelledTotal += Number(r.cancelled);
          processingTotal += Number(r.processing);
        });

        setPieData([
          { name: chartLabels.processing, value: processingTotal, color: "#6cdfdfff" },
          { name: chartLabels.approved, value: approvedTotal, color: "#68b88cff" },
          { name: chartLabels.reverted, value: cancelledTotal, color: "#d48aa3ff" },
        ]);

        setTableRows(rows);
        setTotals(totalsCalc);

        let genderRes = [];
        await dispatch(fetchGenderWiseApplicationMatrixByDate(months, fromDate, toDate, orgType)).then((response) => {
          genderRes = response.payload?.data?.workforceGenderwiseMatrix[0] || [];
        });

        const appCounts = [
          { type: applicantTypeNames["totalApplicant"], count: genderRes.totalApplicant },
          { type: applicantTypeNames["maleApplicant"], count: genderRes.maleApplicant },
          { type: applicantTypeNames["femaleApplicant"], count: genderRes.femaleApplicant },
          { type: applicantTypeNames["totalDependent"], count: genderRes.totalDependent },
        ];
        setApplicationCounts(appCounts);
        setTotalBenefitAmount(genderRes.totalBenefitAmount || 0);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }
    loadData();
  }, [months, fromDate, toDate, filter, chartLabels.processing, chartLabels.approved, chartLabels.reverted]);

  useEffect(() => {
    async function loadMonthWiseData() {
      try {
        let monthWiseRes = [];
        await dispatch(fetchApplicationMonthWise(graphMonths)).then((response) => {
          monthWiseRes = response.payload?.data?.workforceMonthwiseApplications || [];
        });

        let barDataArray = [];
        monthWiseRes.map((item) => {
          barDataArray.push({
            month: getMonthName(Number(item.month) - 1),
            [chartLabels.medical]: item.medical,
            [chartLabels.death]: item.death,
            [chartLabels.educational]: item.educational,
            [chartLabels.maternity]: item.maternityGrant,
            [chartLabels.disability]: item.disabilityAssistance,
          });
        });
        setBarData(barDataArray);
      } catch (err) {
        console.error("Failed to fetch month wise data", err);
      }
    }
    loadMonthWiseData();
  }, [graphMonths, chartLabels.medical, chartLabels.death, chartLabels.educational, chartLabels.maternity, chartLabels.disability]);

  useEffect(() => {
    async function loadNewDashboardRequirements() {
      // Dispatch new API actions here using accFromDate, accToDate, association
      const filtersBase = [
        // 'statusIn: ["forward_to_eis_advisor","approved_by_eis_director"]',
        'organizationTypeIn: ["eis"]',
        'orderBy: ["-dateCreated"]',
      ];
      dispatch(fetchApplicationsSummaryDashboard(modulesManager, filtersBase)).then((res) => {
        const response = parseData(res?.payload?.data?.workforceApplication);
        const formData = response?.map((application) => {
          const parsedMetadata = safeParse(application?.metadata);
          const parsedApplicantInfo = safeParse(application?.applicantInfo);
          const parsedDeceasedWorkerInfo = safeParse(application?.deceasedWorkerInfo);
          const parsedEmployeeAccidentInfo = safeParse(application?.employeeAccidentInfo);
          // const parsedEmployeeDependentInfo = JSON.parse(application?.employeeDependentInfo)
          // const parsedEmployeeBankInfo = JSON.parse(application?.employeeBankInfo)

          return {
            ...application,
            applicantInfo: parsedApplicantInfo,
            metadata: parsedMetadata,
            deceasedWorkerInfo: parsedDeceasedWorkerInfo,
            employeeAccidentInfo: parsedEmployeeAccidentInfo,
            // employeeDependentInfo:JSON.parse(parsedEmployeeDependentInfo),
            // employeeBankInfo:JSON.parse(parsedEmployeeBankInfo)
          };
        });
        setApplications(formData);
        console.log({ fromEISAdvisor: formData });
      });

      dispatch(fetchWorkforceEisPaymentDisbursementStage({ isDisbursed: true }, modulesManager)).then((r) => {
        const response = r?.payload?.data?.workforceEisPaymentDisbursementStage;
        setDisbursedApplication(response);
        console.log({ response });
      });
    }
    if (selectedMenu === "dashboard") {
      loadNewDashboardRequirements();
    }
  }, [selectedMenu]);

  const getBeneficiaryCount = (key) => {
    const found = applicationCounts.find((item) => item.type === applicantTypeNames[key]);
    return found ? found.count : 0;
  };

  return (
    <Grid container spacing={3}>
      {/* --- 1. OVERALL FILTERS SECTION --- */}
      <Grid item xs={12}>
        <Card style={{ borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Typography variant="h6" style={{ marginBottom: "15px", fontWeight: "bold" }}>
            <FormattedMessage id="workforce.dashboard.overallFilters" />
          </Typography>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">
                <FormattedMessage id="workforce.dashboard.appSubmissionDate" />
              </Typography>
              <Box display="flex" gridGap={10}>
                <TextField type="date" size="small" variant="outlined" fullWidth value={fromDate} onChange={(e) => handleFromDateChange(e.target.value)} />
                <TextField type="date" size="small" variant="outlined" fullWidth value={toDate} onChange={(e) => handleToDateChange(e.target.value)} />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">
                <FormattedMessage id="workforce.dashboard.accidentDate" />
              </Typography>
              <Box display="flex" gridGap={10}>
                <TextField type="date" size="small" variant="outlined" fullWidth value={accFromDate} onChange={(e) => setAccFromDate(e.target.value)} />
                <TextField type="date" size="small" variant="outlined" fullWidth value={accToDate} onChange={(e) => setAccToDate(e.target.value)} />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" size="small" fullWidth>
                <Select value={association} onChange={(e) => setAssociation(e.target.value)} displayEmpty>
                  <MenuItem value="all">
                    <FormattedMessage id="workforce.dashboard.allAssociations" />
                  </MenuItem>
                  <MenuItem value="bgmea">BGMEA</MenuItem>
                  <MenuItem value="bkmea">BKMEA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* --- 2. GENERAL DASHBOARD (PREVIOUS CARDS) --- */}
      <Grid item xs={12}>
        <DashboardCard
          title={<FormattedMessage id="workforce.dashboard.pipeline" />}
          subtitle={<FormattedMessage id="workforce.dashboard.pipeline.subtitle" />}
        >
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.pipeline.factory" />}
                count={applications!==null ? applications?.filter((item) => item.status === "new").length : 0}
              />
            </Grid>
            <Grid item xs={4}>
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.pipeline.association" />}
                count={applications!==null ? applications?.filter((item) => item.status === "forward_to_association").length: 0}
              />
            </Grid>
            <Grid item xs={4}>
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.pipeline.eis" />}
                count={applications!==null ? applications?.filter((item) => item.status != "forward_to_association" || item.status != "new" || item.status != "draft").length: 0}
              />
            </Grid>
          </Grid>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.pending" />} subtitle={<FormattedMessage id="workforce.dashboard.pending.subtitle" />}>
          <Typography variant="subtitle2" style={{ color: "#1976d2", marginTop: 10 }}>
            <FormattedMessage id="workforce.dashboard.pending.verified" />
          </Typography>
          <Box pl={2} mb={2}>
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.pending.death" />}
              count={applications!==null ? applications?.filter((item) => item.applicationType === "financialAssistance" && item?.eisVerified).length: 0}
            />
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.pending.disability" />}
              count={applications!==null ? applications?.filter((item) => item.applicationType === "disabilityAssistance" && item?.eisVerified).length: 0}
            />
          </Box>
          <Typography variant="subtitle2" style={{ color: "#d32f2f" }}>
            <FormattedMessage id="workforce.dashboard.pending.nonVerified" />
          </Typography>
          <Box pl={2}>
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.pending.death" />}
              count={applications!==null ? applications?.filter((item) => item.applicationType === "financialAssistance" && !item?.eisVerified).length: 0}
            />
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.pending.disability" />}
              count={applications!==null ? applications?.filter((item) => item.applicationType === "disabilityAssistance" && !item?.eisVerified).length: 0}
            />
          </Box>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <DashboardCard
          title={<FormattedMessage id="workforce.dashboard.overview" />}
          subtitle={<FormattedMessage id="workforce.dashboard.overview.subtitle" />}
        >
          <Typography variant="subtitle2" style={{ marginTop: 10 }}>
            <FormattedMessage id="workforce.dashboard.overview.death" />
          </Typography>
          <Box pl={2} mb={2}>
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.overview.deadMale" />}
              count={
                applications!==null ? applications?.filter(
                  (item) =>
                    item.applicationType === "financialAssistance" &&
                    item?.status === "approved_by_committee" &&
                    item?.deceasedWorkerInfo?.gender?.name === "workforce.gender.male",
                ).length: 0
              }
            />
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.overview.deadFemale" />}
              count={
                applications!==null ? applications?.filter(
                  (item) =>
                    item.applicationType === "financialAssistance" &&
                    item?.status === "approved_by_committee" &&
                    item?.deceasedWorkerInfo?.gender?.name === "workforce.gender.female",
                ).length : 0
              }
            />
          </Box>
          <Typography variant="subtitle2">
            <FormattedMessage id="workforce.dashboard.overview.disability" />
          </Typography>
          <Box pl={2}>
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.overview.maleWorker" />}
              count={
                applications!==null ? applications?.filter(
                  (item) =>
                    item.applicationType === "disabilityAssistance" &&
                    item?.status === "approved_by_committee" &&
                    item?.workforceEmployee?.gender === "workforce.gender.male",
                ).length: 0
              }
            />
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.overview.femaleWorker" />}
              count={
                applications!==null ? applications?.filter(
                  (item) =>
                    item.applicationType === "disabilityAssistance" &&
                    item?.status === "approved_by_committee" &&
                    item?.workforceEmployee?.gender === "workforce.gender.female",
                ).length: 0
              }
            />
          </Box>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <DashboardCard
          title={<FormattedMessage id="workforce.dashboard.beneficiary" />}
          subtitle={<FormattedMessage id="workforce.dashboard.beneficiary.subtitle" />}
        >
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.beneficiary.male" />}
            count={getBeneficiaryCount("maleApplicant")}
            onClick={() => handleBeneficiaryClick("approvedMale")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.beneficiary.female" />}
            count={getBeneficiaryCount("femaleApplicant")}
            onClick={() => handleBeneficiaryClick("approvedFemale")}
          />
          <Box mt={2} p={1} bgcolor="#f9f9f9" borderRadius="8px">
            <StatRow
              label={<FormattedMessage id="workforce.dashboard.beneficiary.total" />}
              count={getBeneficiaryCount("totalApplicant")}
              onClick={() => handleBeneficiaryClick("approvedTotal")}
            />
          </Box>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashboardCard
          title={<FormattedMessage id="workforce.dashboard.accidentSegregation" />}
          subtitle={<FormattedMessage id="workforce.dashboard.accidentSegregation.subtitle" />}
        >
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" style={{ marginTop: 10 }}>
                <FormattedMessage id="workforce.dashboard.overview.death" />
              </Typography>
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.accidentSegregation.workplace" />}
                count={
                  applications!==null ? applications?.filter(
                    (item) =>
                      item.applicationType === "financialAssistance" &&
                      item?.employeeAccidentInfo?.accidentMainType === "workforce.accident.mainType.workplace",
                  ).length: 0
                }
              />
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.accidentSegregation.commuting" />}
                count={
                  applications!==null ? applications?.filter(
                    (item) =>
                      item.applicationType === "financialAssistance" &&
                      item?.employeeAccidentInfo?.accidentMainType === "workforce.accident.mainType.commuting",
                  ).length: 0
                }
              />
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.accidentSegregation.rta" />}
                count={
                  applications!==null ? applications?.filter(
                    (item) =>
                      item.applicationType === "financialAssistance" &&
                      item?.employeeAccidentInfo?.accidentMainType === "workforce.accident.mainType.onDutyRTA",
                  ).length: 0
                }
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" style={{ marginTop: 10 }}>
                <FormattedMessage id="workforce.dashboard.overview.disability" />
              </Typography>
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.accidentSegregation.workplace" />}
                count={
                  applications!==null ? applications?.filter(
                    (item) =>
                      item.applicationType === "disabilityAssistance" &&
                      item?.employeeAccidentInfo?.accidentMainType === "workforce.accident.mainType.workplace",
                  ).length: 0
                }
              />
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.accidentSegregation.commuting" />}
                count={
                  applications!==null ? applications?.filter(
                    (item) =>
                      item.applicationType === "financialAssistance" &&
                      item?.employeeAccidentInfo?.accidentMainType === "workforce.accident.mainType.commuting",
                  ).length: 0
                }
              />
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.accidentSegregation.rta" />}
                count={
                  applications!==null ? applications?.filter(
                    (item) =>
                      item.applicationType === "financialAssistance" &&
                      item?.employeeAccidentInfo?.accidentMainType === "workforce.accident.mainType.onDutyRTA",
                  ).length: 0
                }
              />
            </Grid>
          </Grid>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.financialOverview" />}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" style={{ marginTop: 10, color: "#2e7d32" }}>
                <FormattedMessage id="workforce.dashboard.financial.paidTillNow" />
              </Typography>
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.financial.deathTotal" />}
                count={`৳ ${disbursedApplication !== null ? disbursedApplication.filter((item) => item.workforceApplication?.applicationType === "financialAssistance").reduce((acc, obj) => acc + (Number(parseFloat(obj?.paidAmount).toFixed(2)) || 0), 0).toFixed(2) : "0.00"}`}
              />
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.financial.disabilityTotal" />}
                count={`৳ ${disbursedApplication !== null ? disbursedApplication.filter((item) => item.workforceApplication?.applicationType === "disabilityAssistance").reduce((acc, obj) => acc + (Number(parseFloat(obj?.paidAmount).toFixed(2)) || 0), 0).toFixed(2) : "0.00"}`}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" style={{ marginTop: 10, color: "#ed6c02" }}>
                <FormattedMessage id="workforce.dashboard.financial.approxLifetime" />
              </Typography>
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.financial.deathTotal" />}
                count={`৳ ${disbursedApplication !== null ? disbursedApplication.filter((item) => item.workforceApplication?.applicationType === "financialAssistance").reduce((acc, obj) => acc + (Number(parseFloat(obj?.eisCalculatedAmount).toFixed(2)) || 0), 0).toFixed(2) : "0.00"}`}
              />
              <StatRow
                label={<FormattedMessage id="workforce.dashboard.financial.disabilityTotal" />}
                count={`৳ ${disbursedApplication !== null ? disbursedApplication.filter((item) => item.workforceApplication?.applicationType === "financialAssistance").reduce((acc, obj) => acc + (Number(parseFloat(obj?.eisCalculatedAmount).toFixed(2)) || 0), 0).toFixed(2) : "0.00"}`}
              />
            </Grid>
          </Grid>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={5}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.appSegregation" />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
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
              <YAxis label={{ value: isBn ? "দুর্ঘটনার সংখ্যা" : "Number of accidents", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey={chartLabels.death} stackId="death" fill="#d32f2f" />
              <Bar dataKey={chartLabels.disability} stackId="disability" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </Grid>

      {/* --- 3. EIS ADVISOR DASHBOARD --- */}
      <Grid item xs={12} md={6}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.monitoring" />}>
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.monitoring.almost18" />}
            count={beneficiaryMonitoring.almost18}
            onClick={() => handleBeneficiaryClick("almost18")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.monitoring.adultFemale" />}
            count={beneficiaryMonitoring.adultFemaleUnmarried}
            onClick={() => handleBeneficiaryClick("adultFemaleUnmarried")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.monitoring.elderly" />}
            count={beneficiaryMonitoring.elderly}
            onClick={() => handleBeneficiaryClick("elderly")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.monitoring.widowUnder35" />}
            count={beneficiaryMonitoring.widowUnder35}
            onClick={() => handleBeneficiaryClick("widowUnder35")}
          />
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.verification" />}>
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.verification.pending1m" />}
            count={verificationOverview.pending1m}
            onClick={() => handleBeneficiaryClick("pending1m")}
            color="#ed6c02"
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.verification.pending3m" />}
            count={verificationOverview.pending3m}
            onClick={() => handleBeneficiaryClick("pending3m")}
            color="#ed6c02"
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.verification.pending6m" />}
            count={verificationOverview.pending6m}
            onClick={() => handleBeneficiaryClick("pending6m")}
            color="#ed6c02"
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.verification.pending9m" />}
            count={verificationOverview.pending9m}
            onClick={() => handleBeneficiaryClick("pending9m")}
            color="#d32f2f"
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.verification.successful" />}
            count={verificationOverview.successful}
            onClick={() => handleBeneficiaryClick("successfulVerified")}
            color="#2e7d32"
          />
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.marriage" />}>
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.marriage.widow" />}
            count={marriageStatus.unmarriedWidow}
            onClick={() => handleBeneficiaryClick("unmarriedWidow")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.marriage.widower" />}
            count={marriageStatus.unmarriedWidower}
            onClick={() => handleBeneficiaryClick("unmarriedWidower")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.marriage.sister" />}
            count={marriageStatus.unmarriedSister}
            onClick={() => handleBeneficiaryClick("unmarriedSister")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.marriage.daughter" />}
            count={marriageStatus.unmarriedDaughter}
            onClick={() => handleBeneficiaryClick("unmarriedDaughter")}
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.marriage.grandDaughter" />}
            count={marriageStatus.unmarriedGrandDaughter}
            onClick={() => handleBeneficiaryClick("unmarriedGrandDaughter")}
          />
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashboardCard title={<FormattedMessage id="workforce.dashboard.payment" />} subtitle={<FormattedMessage id="workforce.dashboard.payment.subtitle" />}>
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.payment.disbursed" />}
            count={paymentStatus.disbursed}
            onClick={() => handleBeneficiaryClick("paymentDisbursed")}
            color="#2e7d32"
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.payment.pending" />}
            count={paymentStatus.pending}
            onClick={() => handleBeneficiaryClick("paymentPending")}
            color="#ed6c02"
          />
          <StatRow
            label={<FormattedMessage id="workforce.dashboard.payment.onHold" />}
            count={paymentStatus.onHold}
            onClick={() => handleBeneficiaryClick("paymentOnHold")}
            color="#d32f2f"
          />
        </DashboardCard>
      </Grid>

      <AgingReportModal open={openModal} onClose={() => setOpenModal(false)} data={selectedType} organizationType={filter.toLowerCase()} />
    </Grid>
  );
};

const RevertApplication = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.application.reverted" />
      </Typography>
      <Card className={classes.tableContainer}>
        <CardContent>
          <ApplicationProcessSearcher revertedApplication={true} loggedInUserId={loggedInUserId} />
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

const RejectApplication = () => {
  const classes = useStyles();
  return (
    <>
      <ApplicationProcessSearcher rejectedApplication={true} dynamicTableTitle={"workforce.application.rejectedApplication"} />
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
const PendingMeetingSheet = ({ summaryData = [] }) => {
  console.log("summary data", summaryData);
  const classes = useStyles();
  return (
    <>
      {/* Render each summaryData item as an accordion */}
      {summaryData.map((item, index) => (
        <Accordion key={index} defaultExpanded={false} className={classes.accordion}>
          <AccordionSummary className={classes.accordionSummary} expandIcon={<ExpandMoreIcon className="material-icons" />}>
            <Typography variant="subtitle1" style={{ flex: 1 }}>
              <strong>{item.name}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginLeft: "auto" }}>
              {item.meetingDate} | {item.month} {item.year}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.AccordionDetails}>
            <Card style={{ width: "100%" }}>
              <CardContent>
                <ApplicationProcessSearcher summaryId={item.id} />
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

// ------------------------------------------------------------

const EisCoordinatorDashboardPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  useEffect(() => {
    return dispatch(fetchSummaryApplications(modulesManager, ['organizationType:"eis"']));
  }, []);
  const data = useSelector((state) => state.workforce[`applicationsSummary`] ?? []);

  const pendingSummaryData = data.filter((d) => d.status === "forward_to_dg" || d.status === "forward_to_eis_advisor" || d.status === "meeting_created");
  const approvedSummaryData = data.filter((d) => d.status === "approved_by_committee");
  const advisorApprovedSummaryData = data.filter((d) => d.status === "approved_by_eis_advisor");
  const sentSummaryData = data.filter((d) => d.status === "forward_to_comiitee");

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <Dashboard selectedMenu={selectedMenu}/>;
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
      case "pendingMeetingSheet":
        return <PendingMeetingSheet summaryData={pendingSummaryData} disableButtons={1} />;
      case "advisorApproveMeetingSheet":
        return <AdvisorApprovedApplications summaryData={advisorApprovedSummaryData} approvedButton={1} />;
      case "sentMeetingSheet":
        return <SentMeetingSheet summaryData={sentSummaryData} disableButtons={1} />;
      case "approveMeetingSheet":
        return <ApprovedApplications summaryData={approvedSummaryData} disableButtons={1} />;
      case "applicationStatus":
        return <ApplicationStatus />;
      case "beneficiaryReportSheet":
        return <BeneficiaryReportSheet />;
      case "beneficiaryManagement":
        return <BeneficiaryManagement />;
      case "beneficiaryPaymentProcess":
        return <BeneficiaryPaymentProcess />;
      case "beneficiaryProcessedPaymentList":
        return <BeneficiaryProcessedPaymentList />;
      case "beneficiaryBankAdviceList":
        return <BeneficiaryBankAdviceList />;
      case "beneficiaryDisbursedPayments":
        return <BeneficiaryDisbursedPayments />;
      case "beneficiaryNoaConfirmation":
        return <BeneficiaryNoaConfirmation />;
      default:
        return <Dashboard selectedMenu={selectedMenu}/>;
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

export default EisCoordinatorDashboardPage;
