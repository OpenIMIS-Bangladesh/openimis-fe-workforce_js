import React, { useEffect, useState, useMemo } from "react";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardHeader,
  CardContent,
  Typography,
  useTheme,
  Button,
  ButtonGroup,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  Link,
  Select,       // <-- Added for new Association filter
  MenuItem,     // <-- Added for new Association filter
  FormControl,  // <-- Added for new Association filter
  InputLabel    // <-- Added for new Association filter
} from "@material-ui/core";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import Badge from '@material-ui/core/Badge';

import {
  useHistory,
  PublishedComponent,
  FormattedMessage,
  useModulesManager,
  parseData
} from "@openimis/fe-core";

import { useSelector, useDispatch } from "react-redux";

// Icons
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import DescriptionIcon from '@material-ui/icons/Description';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import PersonIcon from '@material-ui/icons/Person';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Local Utilities & Components
import { getUserType, getUserTypeFromRights } from "../../utils/utils";
import ApplicationSummaryPage from "../application-process/ApplicationSummaryPage";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import AgingReportModal from "../reports/modals/AgingReportModal";

// Actions & Constants
import { fetchApplicationByDate, fetchGenderWiseApplicationMatrixByDate, fetchApplicationMonthWise, fetchApplicationsSummary, fetchWorkforceEisPaymentDisbursementStage } from "../../actions";
import { WORKFORCE_USER_TYPE, APP_TYPE_DASHBOARD_EN, APP_TYPE_DASHBOARD_BN, APPLICANT_TYPE_BN, APPLICANT_TYPE_EN } from "../../constants";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "fit-content", // assuming 64px header/appbar, adjust as needed
    overflow: "visible",
  },
  sidebar: {
    position: "sticky",
    top: 85,
    height: "50vh",
  },
  content: {
    height: "fit-content",
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
  item: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    cursor: "pointer",
    padding: "7px",
    borderRadius: "10px",
    "&:hover": {
      backgroundColor: "#517688",
      color: "#fff",
    },
  },
}));

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

// --- Reusable UI Wrapper for New Cards ---
const DashboardCard = ({ title, subtitle, children }) => (
  <Card style={{ height: "100%", borderRadius: "16px", boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)", padding: "10px" }}>
    <CardHeader 
      title={<Typography variant="h6" style={{ fontWeight: "bold" }}>{title}</Typography>}
      subheader={subtitle ? <Typography variant="body2" color="textSecondary">{subtitle}</Typography> : null}
    />
    <CardContent style={{ paddingTop: 0 }}>{children}</CardContent>
  </Card>
);

const StatRow = ({ label, count, onClick, color }) => (
  <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #f0f0f0">
    <Typography style={{ color: color || "inherit" }}>{label}</Typography>
    {onClick ? (
      <Link component="button" variant="subtitle1" style={{ fontWeight: "bold" }} onClick={onClick}>{count}</Link>
    ) : (
      <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>{count}</Typography>
    )}
  </Box>
);

const Dashboard = () => {
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
  let buttonOptions = {};
  if (isBn) {
    buttonOptions = { 1: "১ মাস", 3: "৩ মাস", 6: "৬ মাস", 12: "১২ মাস" };
  } else {
    buttonOptions = { 1: "1 Month", 3: "3 Months", 6: "6 Months", 12: "12 Months" };
  }

  const [applications, setApplications] = useState([]);
  const [disbursedApplication, setDisbursedApplication] = useState([]);
  const [months, setMonths] = useState(0);
  const [monthString, setMonthString] = useState("");
  const [filter, setFilter] = useState("eis");
  const [fromDate, setFromDate] = useState("");
  const [fromDateString, setFromDateString] = useState("");
  const [toDate, setToDate] = useState("");
  const [toDateString, setToDateString] = useState(isBn ? " আজ পর্যন্ত" : " To Date");
  const [organizationName, setOrganizationName] = useState(isBn ? "সকল তহবিল" : "All Funds");

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

  // --- 4. PREVIOUS OVERVIEW STATES ---
  const [pipelineCounts, setPipelineCounts] = useState({ factory: 0, association: 0, eis: 0 });
  const [pendingCounts, setPendingCounts] = useState({ verified: { death: 0, disability: 0 }, nonVerified: { death: 0, disability: 0 } });
  const [overviewCounts, setOverviewCounts] = useState({ death: { male: 0, female: 0 }, disability: { male: 0, female: 0 } });
  const [accidentCounts, setAccidentCounts] = useState({ death: { workplace: 0, commuting: 0, rta: 0 }, disability: { workplace: 0, commuting: 0, rta: 0 } });
  const [financialCounts, setFinancialCounts] = useState({ paid: { death: 0, disability: 0 }, lifetime: { death: 0, disability: 0 } });

  // Chart Strings
  const chartLabels = {
    processing: isBn ? "প্রক্রিয়াধীন" : "Processing",
    approved: isBn ? "অনুমোদিত" : "Approved",
    reverted: isBn ? "বাতিল" : "Reverted",
    medical: isBn ? "চিকিৎসা" : "Medical",
    death: isBn ? "মৃত্যু" : "Death",
    educational: isBn ? "শিক্ষা" : "Educational",
    maternity: isBn ? "মাতৃত্ব" : "Maternity",
    disability: isBn ? "স্থায়ী ও অস্থায়ী অক্ষমতা" : "Permanent Or Curable Disability"
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

  const handleMonthChange = (month) => {
    setMonths(month);
    if (isBn) setMonthString("সর্বশেষ " + Number(month).toLocaleString("bn-BD") + " মাসের তথ্য");
    else setMonthString("Last " + month + " Month(s) Data");
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    if (isBn) setFromDateString(getBanglaDate(date) + " হতে ");
    else setFromDateString("From " + date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    if (isBn) setToDateString(getBanglaDate(date) + " পর্যন্ত");
    else setToDateString(" To " + date);
  };

  const handleGraphMonthChange = (month) => {
    setGraphMonths(month); setGraphFromDate(""); setGraphToDate("");
  };

  const navigateToBeneficiaries = () => history.push("/beneficiary-management");

  const getBeneficiaryCount = (key) => {
    const found = applicationCounts.find(item => item.type === applicantTypeNames[key]);
    return found ? found.count : 0;
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (months > 0) { setFromDate(""); setToDate(""); }
  }, [months]);

  useEffect(() => {
    setMonths(0); setMonthString("");
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
            pendingAppTypes.push({ appType: type, type: applicationTypeNames[type], count: Number(item.applicationCount) - (Number(item.approvedCount) + Number(item.rejectedCount)) });
          }
        });

        setApplicationTypes(appTypes);
        setPendingApplicationTypes(pendingAppTypes);

        const totalsCalc = rows.reduce((acc, r) => {
          acc.total += Number(r.total); acc.approved += Number(r.approved);
          acc.cancelled += Number(r.cancelled); acc.processing += Number(r.processing);
          return acc;
        }, { total: 0, approved: 0, cancelled: 0, processing: 0 });

        let approvedTotal = 0; let cancelledTotal = 0; let processingTotal = 0;
        rows.map((r) => {
          approvedTotal += Number(r.approved); cancelledTotal += Number(r.cancelled); processingTotal += Number(r.processing);
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

      } catch (err) { console.error("Failed to fetch data", err); }
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
      } catch (err) { console.error("Failed to fetch month wise data", err); }
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
        ]
      dispatch(fetchApplicationsSummary(modulesManager, filtersBase)).then((res)=>{
        const response = parseData(res?.payload?.data?.workforceApplication)
        const formData =response?.map((application)=>{
          const parsedMetadata = JSON.parse(application?.metadata)
          const parsedApplicantInfo = JSON.parse(application?.applicantInfo)
          const parsedDeceasedWorkerInfo = JSON.parse(application?.deceasedWorkerInfo)
          const parsedEmployeeAccidentInfo = JSON.parse(application?.employeeAccidentInfo)
          // const parsedEmployeeDependentInfo = JSON.parse(application?.employeeDependentInfo)
          // const parsedEmployeeBankInfo = JSON.parse(application?.employeeBankInfo)

          return {
            ...application,
            applicantInfo:JSON.parse(parsedApplicantInfo),
            metadata:JSON.parse(parsedMetadata),
            deceasedWorkerInfo:JSON.parse(parsedDeceasedWorkerInfo),
            employeeAccidentInfo:JSON.parse(parsedEmployeeAccidentInfo),
            // employeeDependentInfo:JSON.parse(parsedEmployeeDependentInfo),
            // employeeBankInfo:JSON.parse(parsedEmployeeBankInfo)
          }
        })
        setApplications(formData)
        console.log({fromEISAdvisor:formData})
      })

      dispatch(fetchWorkforceEisPaymentDisbursementStage({isDisbursed: true}, modulesManager)).then(r =>{
        console.log({baller:r})
        const response = r?.payload?.data?.workforceEisPaymentDisbursementStage
        setDisbursedApplication(response)
        console.log({response})

      })
    }
    loadNewDashboardRequirements();
  }, []);

  return (
    <Grid container spacing={3}>
      {/* --- OVERALL FILTERS SECTION --- */}
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
                  <MenuItem value="all"><FormattedMessage id="workforce.dashboard.allAssociations" /></MenuItem>
                  <MenuItem value="bgmea">BGMEA</MenuItem>
                  <MenuItem value="bkmea">BKMEA</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            
          </Grid>
        </Card>
      </Grid>

      {/* --- DASHBOARD METRICS --- */}
      <Grid item xs={12}>
        <DashboardCard 
          title={<FormattedMessage id="workforce.dashboard.pipeline" />} 
          subtitle={<FormattedMessage id="workforce.dashboard.pipeline.subtitle" />}
        >
          <Grid container spacing={4}>
             <Grid item xs={4}><StatRow label={<FormattedMessage id="workforce.dashboard.pipeline.factory" />} count={applications?.filter(item=>item.status ==="new").length} /></Grid>
             <Grid item xs={4}><StatRow label={<FormattedMessage id="workforce.dashboard.pipeline.association" />} count={applications?.filter(item=>item.status ==="forward_to_association").length} /></Grid>
             <Grid item xs={4}><StatRow label={<FormattedMessage id="workforce.dashboard.pipeline.eis" />} count={applications?.filter(item=>item.status !="forward_to_association"||item.status !="new"||item.status !="draft").length} /></Grid>
          </Grid>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <DashboardCard 
          title={<FormattedMessage id="workforce.dashboard.pending" />} 
          subtitle={<FormattedMessage id="workforce.dashboard.pending.subtitle" />}
        >
           <Typography variant="subtitle2" style={{ color: "#1976d2", marginTop: 10 }}>
             <FormattedMessage id="workforce.dashboard.pending.verified" />
           </Typography>
           <Box pl={2} mb={2}>
              <StatRow label={<FormattedMessage id="workforce.dashboard.pending.death" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.eisVerified).length} />
              <StatRow label={<FormattedMessage id="workforce.dashboard.pending.disability" />} count={applications?.filter(item=>item.applicationType ==="disabilityAssistance" && item?.eisVerified).length} />
           </Box>
           <Typography variant="subtitle2" style={{ color: "#d32f2f" }}>
             <FormattedMessage id="workforce.dashboard.pending.nonVerified" />
           </Typography>
           <Box pl={2}>
              <StatRow label={<FormattedMessage id="workforce.dashboard.pending.death" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && !item?.eisVerified).length} />
              <StatRow label={<FormattedMessage id="workforce.dashboard.pending.disability" />} count={applications?.filter(item=>item.applicationType ==="disabilityAssistance" && !item?.eisVerified).length} />
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
              <StatRow label={<FormattedMessage id="workforce.dashboard.overview.deadMale" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.status === "approved_by_committee"&& item?.deceasedWorkerInfo?.gender?.name ==="workforce.gender.male").length} />
              <StatRow label={<FormattedMessage id="workforce.dashboard.overview.deadFemale" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.status === "approved_by_committee"&& item?.deceasedWorkerInfo?.gender?.name ==="workforce.gender.female").length} />
           </Box>
           <Typography variant="subtitle2">
             <FormattedMessage id="workforce.dashboard.overview.disability" />
           </Typography>
           <Box pl={2}>
              <StatRow label={<FormattedMessage id="workforce.dashboard.overview.maleWorker" />} count={applications?.filter(item=>item.applicationType ==="disabilityAssistance" && item?.status === "approved_by_committee"&& item?.workforceEmployee?.gender ==="workforce.gender.male").length} />
              <StatRow label={<FormattedMessage id="workforce.dashboard.overview.femaleWorker" />} count={applications?.filter(item=>item.applicationType ==="disabilityAssistance" && item?.status === "approved_by_committee"&& item?.workforceEmployee?.gender ==="workforce.gender.female").length} />
           </Box>
        </DashboardCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <DashboardCard 
          title={<FormattedMessage id="workforce.dashboard.beneficiary" />} 
          subtitle={<FormattedMessage id="workforce.dashboard.beneficiary.subtitle" />}
        >
           <StatRow label={<FormattedMessage id="workforce.dashboard.beneficiary.male" />} count={getBeneficiaryCount("maleApplicant")} onClick={navigateToBeneficiaries} />
           <StatRow label={<FormattedMessage id="workforce.dashboard.beneficiary.female" />} count={getBeneficiaryCount("femaleApplicant")} onClick={navigateToBeneficiaries} />
           <Box mt={2} p={1} bgcolor="#f9f9f9" borderRadius="8px">
             <StatRow label={<FormattedMessage id="workforce.dashboard.beneficiary.total" />} count={getBeneficiaryCount("totalApplicant")} onClick={navigateToBeneficiaries} />
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
               <StatRow label={<FormattedMessage id="workforce.dashboard.accidentSegregation.workplace" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.employeeAccidentInfo?.accidentMainType ==="workforce.accident.mainType.workplace").length} />
               <StatRow label={<FormattedMessage id="workforce.dashboard.accidentSegregation.commuting" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.employeeAccidentInfo?.accidentMainType ==="workforce.accident.mainType.commuting").length} />
               <StatRow label={<FormattedMessage id="workforce.dashboard.accidentSegregation.rta" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.employeeAccidentInfo?.accidentMainType ==="workforce.accident.mainType.onDutyRTA").length} />
             </Grid>
             <Grid item xs={6}>
               <Typography variant="subtitle2" style={{ marginTop: 10 }}>
                 <FormattedMessage id="workforce.dashboard.overview.disability" />
               </Typography>
               <StatRow label={<FormattedMessage id="workforce.dashboard.accidentSegregation.workplace" />} count={applications?.filter(item=>item.applicationType ==="disabilityAssistance" && item?.employeeAccidentInfo?.accidentMainType==="workforce.accident.mainType.workplace").length} />
               <StatRow label={<FormattedMessage id="workforce.dashboard.accidentSegregation.commuting" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.employeeAccidentInfo?.accidentMainType ==="workforce.accident.mainType.commuting").length} />
               <StatRow label={<FormattedMessage id="workforce.dashboard.accidentSegregation.rta" />} count={applications?.filter(item=>item.applicationType ==="financialAssistance" && item?.employeeAccidentInfo?.accidentMainType ==="workforce.accident.mainType.onDutyRTA").length} />
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
               <StatRow label={<FormattedMessage id="workforce.dashboard.financial.deathTotal" />} count={`৳ ${financialCounts.paid.death}`} />
               <StatRow label={<FormattedMessage id="workforce.dashboard.financial.disabilityTotal" />} count={`৳ ${financialCounts.paid.disability}`} />
             </Grid>
             <Grid item xs={6}>
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

      <AgingReportModal open={openModal} onClose={() => setOpenModal(false)} data={selectedType} organizationType={filter.toLowerCase()} />
    </Grid>
  );
};


const EISAdvisorDashboardPage = () => {
  const reduxState = useSelector((state) => state);
  const user_rights = reduxState.core.user.i_user.rights;
  const approvedTextId =
    getUserTypeFromRights(user_rights) === WORKFORCE_USER_TYPE.DIRECTOR ? "workforce.application.forwarded" : "workforce.application.approved";

  const SidebarMenu = [
    {
      id: "dashboard",
      text: <FormattedMessage module="workforce" id="workforce.application.dashboard" />,
      icon: <DashboardIcon />,
    },
    {
      id: "waitingApplications",
      text: <FormattedMessage module="workforce" id="workforce.employee.application.meetingSheet" />,
      icon: <DashboardIcon />,
    },
    {
      id: "rejectedApplications",
      text: <FormattedMessage module="workforce" id="workforce.application.rejectedApplication" />,
      icon: <DashboardIcon />,
    },
    {
      id: "approvedApplications",
      text: <FormattedMessage module="workforce" id={approvedTextId} />,
      icon: <DashboardIcon />,
    },
    {
      id: "returnedApplications",
      text: <FormattedMessage module="workforce" id="workforce.application.returned" />,
      icon: <DashboardIcon />,
    },
  ];

  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [selectedMenu, setSelectedMenu] = useState("dashboard");

  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");
  useEffect(() => {
    if (status) {
      switch (status) {
        case "pending":
          setSelectedMenu("waitingApplications");
          break;
        case "approved":
          setSelectedMenu("approvedApplications");
          break;
        case "rejected":
          setSelectedMenu("rejectedApplications");
          break;
        case "returnedApplications":
          setSelectedMenu("returnedApplications");
          break;
        default:
          setSelectedMenu("dashboard");
      }
    }
  }, [status]);

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <Dashboard />;
      case "waitingApplications":
        return <ApplicationSummaryPage status="pending" />;
      case "rejectedApplications":
        return <RejectApplication />;
      case "approvedApplications":
        return <ApplicationSummaryPage status="approved" disableButtons={1} />;
      case "returnedApplications":
        return <ReturnedApplications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={2} className={classes.root}>
        <Grid item xs={12} md={3} className={classes.sidebar}>
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
        <Grid item xs={12} md={9} className={classes.content}>
          {renderContent()}
        </Grid>
      </Grid>
    </div>
  );
};

export default EISAdvisorDashboardPage;
