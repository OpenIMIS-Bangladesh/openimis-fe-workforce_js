import React, { use, useEffect, useState, useMemo } from "react";
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
} from "@material-ui/core";

import {
  useHistory,
  PublishedComponent,
} from "@openimis/fe-core";
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { getUserType, getUserTypeFromRights } from "../../utils/utils";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import DescriptionIcon from '@material-ui/icons/Description';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import PersonIcon from '@material-ui/icons/Person';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ApplicationSummaryPage from "../application-process/ApplicationSummaryPage";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fetchApplicationByDate, fetchGenderWiseApplicationMatrixByDate, fetchApplicationMonthWise } from "../../actions";
import { WORKFORCE_USER_TYPE, APP_TYPE_DASHBOARD_EN, APP_TYPE_DASHBOARD_BN, APPLICANT_TYPE_BN, APPLICANT_TYPE_EN } from "../../constants";
import AgingReportModal from "../reports/modals/AgingReportModal";


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
  )
};
const RejectApplication = () => {
  const classes = useStyles()
  return (
    <>
      <ApplicationProcessSearcher
        rejectedApplication={true}
        dynamicTableTitle={"workforce.application.rejectedApplication"}
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


const Dashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const history = useHistory();
  const user_type = getUserType();
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || 'en';

  const applicationTypeNames = locale == 'en' ? APP_TYPE_DASHBOARD_EN : APP_TYPE_DASHBOARD_BN;
  const applicantTypeNames = locale == 'en' ? APPLICANT_TYPE_EN : APPLICANT_TYPE_BN;
  let buttonOptions = {};
  if (locale == 'fr') {

    buttonOptions = {
      1: "১ মাস",
      3: "৩ মাস",
      6: "৬ মাস",
      12: "১২ মাস",
    };
  }
  else {
    buttonOptions = {
      1: "1 Month",
      3: "3 Months",
      6: "6 Months",
      12: "12 Months",
    };
  }

  const getMonthName = (index, locale = "en-US") => {
    const date = new Date(2000, index, 1);
    return date.toLocaleString(locale, { month: "long" });
  };

  const getBanglaDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bn-BD')
  }

  const [months, setMonths] = useState(0);
  const [monthString, setMonthString] = useState("");
  const [filter, setFilter] = useState(locale == 'fr' ? "সব" : "All");
  const [fromDate, setFromDate] = useState("");
  const [fromDateString, setFromDateString] = useState("");
  const [toDate, setToDate] = useState("");
  const [toDateString, setToDateString] = useState(locale=="fr"? " আজ পর্যন্ত" : " To Date");
  const [organizationName, setOrganizationName] = useState(locale == 'fr' ? "সকল তহবিল" : "All Funds"); 

  const [graphMonths, setGraphMonths] = useState(6);
  const [graphFromDate, setGraphFromDate] = useState("");
  const [graphToDate, setGraphToDate] = useState("");

  const handleFilter = (f) => {
    setFilter(f);
    if(f === (locale == 'fr' ? "সব" : "All") || f=="") {
      setOrganizationName(locale == 'fr' ? "সকল তহবিল" : "All Funds");
    }else if(f === "CF") {
      setOrganizationName(locale == 'fr' ? "কেন্দ্রীয় তহবিল" : "Central Fund");
    }else if(f === "BLWF") {
      setOrganizationName(locale == 'fr' ? "বাংলাদেশ শ্রমিক কল্যাণ ফাউন্ডেশন" : "Bangladesh Labour Welfare Foundation");
    }else if(f === "EIS") {
      setOrganizationName(locale == 'fr' ? "এমপ্লয়ি ইন্জুরি স্কিম" : "Employee Injury Scheme");
    }
  };

  const handleMonthChange = (month) => {
    setMonths(month);
    if(locale == 'fr') {
      setMonthString("সর্বশেষ "+Number(month).toLocaleString("bn-BD")+" মাসের তথ্য");
    }
    else
    {
      setMonthString("Last "+month+" Month(s) Data");
    }
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    if(locale == 'fr') {
      let datestr= getBanglaDate(date);
      datestr+=' হতে ';
      setFromDateString(datestr);
    }
    else {
      setFromDateString("From "+date);
    }
  }

  const handleToDateChange = (date) => {
    setToDate(date);
    if(locale == 'fr') {
      let datestr= getBanglaDate(date);
      setToDateString(datestr + " পর্যন্ত");
    }
    else {
      setToDateString(" To "+date);
    }
  }

  useEffect(() => {
    if (months > 0) {
      setFromDate("");
      setToDate("");
    }
  }, [
    months
  ]);

  useEffect(() => {
    setMonths(0);
    setMonthString("");
  }, [
    fromDate, toDate
  ]);


  const handleGraphMonthChange = (month) => {
    setGraphMonths(month);
    setGraphFromDate("");
    setGraphToDate("");
  };

  const handleGraphFromDateChange = (date) => {
    setGraphFromDate(date);
    setGraphMonths(0);
  }

  const handleGraphToDateChange = (date) => {
    setGraphToDate(date);
    setGraphMonths(0);
  }

  const [tableRows, setTableRows] = useState([]);
  const [totals, setTotals] = useState({
    total: 0,
    approved: 0,
    cancelled: 0,
    processing: 0,
  });

  const [pendingApplicationTypes, setPendingApplicationTypes] = useState([]);
  const [applicationTypes, setApplicationTypes] = useState([]);
  const [applicationCounts, setApplicationCounts] = useState([]);
  const [totalBenefitAmount, setTotalBenefitAmount] = useState(0);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);



  useEffect(() => {
    async function loadData() {
      try {
        const orgType = filter === "সব" || filter === "All" ? "" : filter.toLowerCase();
        console.log(orgType);

        let res = [];
        await dispatch(fetchApplicationByDate(months, fromDate, toDate, orgType)).then((response) => {
          res = response.payload?.data?.workforceApplicationMatrix || [];
        });
        // Map API response to table structure
        let rows = [];
        res.forEach((item) => {
          const type = item.applicationType;

          let allow = false;

          if (orgType === "blwf") {
            // include all except disabilityAssistance
            allow = type !== "disabilityAssistance";

          } else if (orgType === "eis") {
            // include only disabilityAssistance and financialAssistance
            allow = ["disabilityAssistance", "financialAssistance", "death"].includes(type);

          } else {
            // include all
            allow = true;
          }

          if (allow) {
            rows.push({
              type: applicationTypeNames[type],
              total: Number(item.applicationCount),
              approved: Number(item.approvedCount),
              cancelled: Number(item.rejectedCount),
              processing:
                Number(item.applicationCount) -
                (Number(item.approvedCount) + Number(item.rejectedCount)),
            });
          } else {
            console.log("Skipping", type, "for org:", orgType);
          }
        });
        // const rows = res.map((item) => ({
        //   type: applicationTypeNames[item.applicationType],
        //   total: Number(item.applicationCount),
        //   approved: Number(item.approvedCount),
        //   cancelled: Number(item.rejectedCount),
        //   processing: Number(item.applicationCount) - (Number(item.approvedCount) + Number(item.rejectedCount)),
        // }));
        let appTypes = [];
        let pendingAppTypes = [];

        res.forEach((item) => {
          const type = item.applicationType;

          let allow = false;

          if (orgType === "blwf") {
            // include all except disabilityAssistance
            allow = type !== "disabilityAssistance";

          } else if (orgType === "eis") {
            // include only disabilityAssistance and financialAssistance
            allow = ["disabilityAssistance", "financialAssistance", "death"].includes(type);

          } else {
            // include all types
            allow = true;
          }

          if (allow) {
            appTypes.push({
              appType: type,
              type: applicationTypeNames[type],
              count: Number(item.applicationCount),
            });

            pendingAppTypes.push({
              appType: type,
              type: applicationTypeNames[type],
              count:
                Number(item.applicationCount) -
                (Number(item.approvedCount) + Number(item.rejectedCount)),
            });
          }
        });


        setApplicationTypes(appTypes);
        setPendingApplicationTypes(pendingAppTypes);


        // Calculate totals
        const totalsCalc = rows.reduce(
          (acc, r) => {
            acc.total += Number(r.total);
            acc.approved += Number(r.approved);
            acc.cancelled += Number(r.cancelled);
            acc.processing += Number(r.processing);
            return acc;
          },
          { total: 0, approved: 0, cancelled: 0, processing: 0 }
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
          { name: locale == 'fr' ? "প্রক্রিয়াধীন" : 'Processing', value: processingTotal, color: "#6cdfdfff" },
          { name: locale == 'fr' ? "অনুমোদিত" : 'Approved', value: approvedTotal, color: "#68b88cff" },
          { name: locale == 'fr' ? "বাতিল" : 'Reverted', value: cancelledTotal, color: "#d48aa3ff" },
        ]);

        setTableRows(rows);
        setTotals(totalsCalc);

        let genderRes = [];

        await dispatch(fetchGenderWiseApplicationMatrixByDate(months, fromDate, toDate, orgType)).then((response) => {
          genderRes = response.payload?.data?.workforceGenderwiseMatrix[0] || [];
        });

        const applicationCounts = [
          { type: applicantTypeNames['totalApplicant'], count: genderRes.totalApplicant },
          { type: applicantTypeNames['maleApplicant'], count: genderRes.maleApplicant },
          { type: applicantTypeNames['femaleApplicant'], count: genderRes.femaleApplicant },
          { type: applicantTypeNames['totalDependent'], count: genderRes.totalDependent },
          // { type: applicantTypeNames['maleDependent'], count: genderRes.maleDependent },
          // { type: applicantTypeNames['femaleDependent'], count: genderRes.femaleDependent },
        ];
        setApplicationCounts(applicationCounts);
        setTotalBenefitAmount(genderRes.totalBenefitAmount || 0);


      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }

    loadData();
  }, [months, fromDate, toDate, filter]);

  useEffect(() => {
    console.log("graphMonths/From/To changed");
    async function loadMonthWiseData() {
      try {
        let monthWiseRes = [];
        await dispatch(fetchApplicationMonthWise(graphMonths)).then((response) => {
          monthWiseRes = response.payload?.data?.workforceMonthwiseApplications || [];
        });

        console.log("monthWiseRes", monthWiseRes);

        let barDataArray = [];
        monthWiseRes.map((item) => {
          barDataArray.push({
            month: getMonthName(Number(item.month) - 1),
            [locale == 'fr' ? "চিকিৎসা" : "Medical"]: item.medical,
            [locale == 'fr' ? "মৃত্যু" : "Death"]: item.death,
            [locale == 'fr' ? "শিক্ষা" : "Educational"]: item.educational,
            [locale == 'fr' ? "মাতৃত্ব" : "Maternity"]: item.maternityGrant,
            [locale == 'fr' ? "স্থায়ী ও অস্থায়ী অক্ষমতা" : "Permanent Or Curable Disability"]: item.disabilityAssistance,
          });
        });

        setBarData(barDataArray);

      } catch (err) {
        console.error("Failed to fetch month wise data", err);
      }
    }
    loadMonthWiseData();
  }, [graphMonths, graphFromDate, graphToDate]);





  const application_status_count_data = useSelector(
    (state) => state.workforce[`workforceApplicationStatusCount`]
  );

  const application_status_count = [];

  if (user_type === WORKFORCE_USER_TYPE.DIRECTOR) {
    application_status_count.pending = application_status_count_data?.pendingForDirector?.totalCount;
    application_status_count.rejected = application_status_count_data?.rejectedForDirector?.totalCount;
    application_status_count.approved = application_status_count_data?.approvedForDirector?.totalCount;
  } else {
    application_status_count.pending = application_status_count_data?.pending?.totalCount;
    application_status_count.rejected = application_status_count_data?.rejected?.totalCount;
    application_status_count.approved = application_status_count_data?.approved?.totalCount;
  }






  const newCard = {
    height: "100%",
    borderRadius: "20px",
    boxShadow: theme.shadows[2],
    // color: "#000",
    padding: "10px",
  };


  const [openModal, setOpenModal] = useState(false);



  const handleCloseModal = () => {
    setOpenModal(false);
  };


  const [selectedType, setSelectedType] = useState(null);


  const Filters = () => {
    return (
      <Grid container spacing={2} style={{marginTop:"15px", marginBottom:"10px", color: "red" }}>
        <Grid item xs={6} md={6} >
            {organizationName}
        </Grid>
        <Grid item xs={6} md={6} style={{ textAlign: "right" }}>
          {fromDate && fromDate!="" ?fromDateString + toDateString :""}
          {monthString!="" ? monthString :""}
        </Grid>
      </Grid>
    )
  };

  const handleOpenModal = (type) => {
    setSelectedType(type);
    setOpenModal(true);
  };


  return (
    <>
      <Grid container spacing={2}>
        {/* Left Card */}
        <Grid item xs={12} md={12}>
          <Card style={{ ...newCard, padding: "30px", borderRadius: "15px", overflow: "visible" }}>
            <Grid container spacing={2} style={{ marginBottom: "10px" }}>
              <Grid item xs={12} md={12}>
                <Typography style={{ fontWeight: "bold" }}><FormattedMessage id="workforce.select.time.range" /></Typography>
                <Box gap={2}>
                  <ButtonGroup variant="outlined" style={{ display: "flex", margin: "auto", gap: "10px" }}>
                    {Object.entries(buttonOptions).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={months === key ? "contained" : "outlined"}
                        onClick={() => handleMonthChange(key)}
                        style={{ border: "1px solid #aaa", borderRadius: "10px", width: "100%" }}
                      >
                        {label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>
              </Grid>
              <Grid item md={12}>
                <Card style={{ ...newCard, padding: "10px", borderRadius: "15px", overflow: "visible" }}>
                  <Grid container spacing={2}>
                    <Grid item md={3} xs={3} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <PublishedComponent
                        pubRef="workforce.DatePicker"
                        label={"workforce.from.date"}
                        onChange={(datevalue) => handleFromDateChange(datevalue)}
                        width="100%"
                        style={{ border: "1px solid #aaa", padding: "10px", borderRadius: "10px", width: "100%" }}
                      />
                    </Grid>
                    <Grid item md={3} xs={3} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <PublishedComponent
                        pubRef="workforce.DatePicker"
                        label={"workforce.to.date"}
                        onChange={(datevalue) => handleToDateChange(datevalue)}
                        style={{ border: "1px solid #aaa", padding: "10px", borderRadius: "10px" }}
                      />
                    </Grid>
                    <Grid item md={6} xs={6}>
                      <Card style={{ ...newCard, padding: "10px", borderRadius: "15px", overflow: "visible", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        {/* Filters row */}
                        <Typography component="div">
                          {locale == 'fr' ? "তহবিল নির্বাচন করুন" : "Fund Type"}
                        </Typography>
                        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <ButtonGroup size="small" variant="outlined">
                              {[locale == 'fr' ? "সব" : "All", "CF", "BLWF"].map((l) => (
                                <Button
                                  key={l}
                                  variant={filter === l ? "contained" : "outlined"}
                                  onClick={() => handleFilter(l)}
                                >
                                  {l}
                                </Button>
                              ))}
                            </ButtonGroup>
                          </Box>
                          <Box>
                            <Typography variant="caption" style={{color:"red"}}>
                              {locale == 'fr' ? "নির্বাচিত তহবিল" : "Selected Fund"}: <strong>{organizationName}</strong>
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* AT A GLANCE */}
        {/* Left Card */}
        <Grid item xs={12} md={4}>
          <Card style={newCard}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {/* <FormattedMessage id="workforce.dashboard.application.types"/> */}
                {locale == 'fr' ? "প্রক্রিয়াধীন আবেদনসমূহ" : "Pending Applications"}
                <DescriptionIcon style={{ verticalAlign: 'middle', marginRight: 8, float: "right" }} />
              </Typography>
              <Filters/>
              <table cellPadding={"6px"} style={{ width: "100%" }}>
                <tbody>
                  {pendingApplicationTypes.map((item) => (
                    <tr style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                      <th style={{ textAlign: "left" }}><Typography>{item.type}</Typography></th>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleOpenModal(item)}
                        >
                          <Typography>{item.count}</Typography>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Attach modal here */}
              <AgingReportModal open={openModal} onClose={handleCloseModal} data={selectedType} organizationType={filter.toLowerCase()} />
            </CardContent>
          </Card>
        </Grid>

        {/* Middle Card */}
        <Grid item xs={12} md={4}>
          <Card style={newCard}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <FormattedMessage id="workforce.dashboard.applicant.types" />
                <PeopleAltIcon style={{ verticalAlign: 'middle', marginRight: 8, float: "right" }} />
              </Typography>
              <Filters/>
              {applicationCounts.map((item) => (
                <Card style={{ ...newCard, margin: "10px", padding: "0px" }}>
                  <CardContent>
                    <Typography>{item.type}
                      <PersonIcon style={{ verticalAlign: 'middle', marginLeft: 8, float: "right" }} />
                    </Typography>
                    <Typography variant="h5"><b>{item.count}</b></Typography>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Card */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} style={{ marginBottom: "10px" }}>
            <Grid item xs={12} md={12}>
              <Card style={newCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {/* <FormattedMessage id="workforce.dashboard.application.types"/> */}
                    {locale == 'fr' ? "মোট আবেদন" : "Total Applications"}
                    <DescriptionIcon style={{ verticalAlign: 'middle', marginRight: 8, float: "right" }} />
                  </Typography>
                  <Filters/>
                  <table cellPadding={"6px"} style={{ width: "100%" }}>
                    <tbody>
                      {applicationTypes.map((type) => (
                        <tr style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                          <th style={{ textAlign: "left" }}><Typography>{type.type}</Typography></th>
                          <td style={{ textAlign: "right" }}><Typography>{type.count}</Typography></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <Card style={newCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <FormattedMessage id="workforce.dashboard.financial.info" />
                    <LocalAtmIcon style={{ verticalAlign: 'middle', marginRight: 8, float: "right" }} />
                  </Typography>
                  <Filters/>
                  <Card style={{ ...newCard, margin: "10px", padding: "0px" }}>
                    <CardContent>
                      <Typography><FormattedMessage id="workforce.dashboard.total.beneficiary.amount" /></Typography>
                      <Typography variant="h5"><b>৳ {locale == 'fr' ? Number(totalBenefitAmount).toLocaleString('bn') : Number(totalBenefitAmount).toLocaleString('en')}</b></Typography>
                    </CardContent>
                  </Card>
                  {/* <Card style={{ ...newCard, margin: "10px", padding:"0px" }}>
                      <CardContent>
                          <Typography>মাসিক মোট সুবিধা</Typography>
                          <Typography variant="h5"><b>৳ ৫,০০,০০০</b></Typography>
                          <Typography>(সর্বোচ্চ: ৭.৫ লাখ | সর্বনিম্ন: ২.০ লাখ)</Typography>
                      </CardContent>
                    </Card> */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>


        <Grid item xs={12} md={12}>
          <Card style={{ ...newCard, overflow: "visible" }} sx={{ borderRadius: "12px", boxShadow: 2 }}>
            <CardHeader
              title={
                <Box>
                  <Typography variant="h6" component="div">
                    {locale == 'fr' ? "আবেদন প্রকার ম্যাট্রিক্স" : "Application Type Matrix"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {locale == 'fr' ? "বিস্তারিত আবেদনের প্রতিবেদন - ফান্ড প্রকার অনুসারে" : "Detailed Application Report - By Fund Type"}
                  </Typography>
                </Box>
              }
              action={<Filters/>}
            />
            <CardContent>
              {/* Table */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold" }}>{locale == 'fr' ? "মোট আবেদন" : "Total Applications"}</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>{locale == 'fr' ? "আবেদনের প্রকার" : "Application Type"}</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>{locale == 'fr' ? "অনুমোদিত/ সুপারিশকৃত" : "Approved/ Recommended"}</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>{locale == 'fr' ? "বাতিল/ ফেরত" : "Reverted/ Rejected"}</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>{locale == 'fr' ? "প্রক্রিয়াধীন" : "Processing"}</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold" }}>{locale == 'fr' ? "বিস্তারিত" : "Detail"}</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tableRows.map((r, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{r.type}</TableCell>
                      <TableCell align="right">{r.total}</TableCell>
                      <TableCell align="right">{r.approved}</TableCell>
                      <TableCell align="right">{r.cancelled}</TableCell>
                      <TableCell align="right">{r.processing}</TableCell>
                      <TableCell align="center">
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => {
                            // replace with real navigation
                            console.log("বিস্তারিত:", r.type);
                          }}
                          sx={{ color: "#138a66" }}
                        >
                          {locale == 'fr' ? "বিস্তারিত দেখুন" : "See Detail"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">{locale == 'fr' ? "মোট" : "Total"}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {totals.total}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {totals.approved}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {totals.cancelled}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {totals.processing}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card style={newCard} sx={{ borderRadius: "16px", boxShadow: 3 }}>
            <CardHeader
              title={locale == 'fr' ? 'মাসিক ডেটা ওভারভিউ' : 'Monthly Data Overview'}
              subheader={locale == 'fr' ? 'আবেদনের ধরণ অনুসারে' : 'By Application Type'}
              action={
                <>
                  <Card style={{ padding: "10px", borderRadius: "12px" }}>
                    <Typography style={{ textAlign: "center", fontWeight: "bold" }}><FormattedMessage id="workforce.select.time.range" /></Typography>
                    <ButtonGroup variant="outlined" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {Object.entries(buttonOptions).map(([key, label]) => (
                        <Button
                          key={key}
                          variant={graphMonths === key ? "contained" : "outlined"}
                          onClick={() => handleGraphMonthChange(key)}
                        >
                          {label}
                        </Button>
                      ))}
                    </ButtonGroup>
                    {/* <Grid container spacing={1} style={{marginTop:"10px"}}>
                     <Grid item xs={6} md={6}>
                        <PublishedComponent
                          pubRef="workforce.DatePicker"
                          label={"তারিখ হতে"}
                          onChange={(datevalue) => handleGraphFromDateChange(datevalue)}
                        />
                      </Grid>
                      <Grid item xs={6} md={6}>
                        <PublishedComponent
                          pubRef="workforce.DatePicker"
                          label={"তারিখ পর্যন্ত"}
                          onChange={(datevalue) => handleGraphToDateChange(datevalue)}
                        />
                      </Grid>
                  </Grid> */}
                  </Card>
                </>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={locale == 'fr' ? "চিকিৎসা" : "Medical"} stackId="a" fill="#009688" />
                  <Bar dataKey={locale == 'fr' ? "মৃত্যু" : "Death"} stackId="a" fill="#90CAF9" />
                  <Bar dataKey={locale == 'fr' ? "শিক্ষা" : "Educational"} stackId="a" fill="#FBC02D" />
                  <Bar dataKey={locale == 'fr' ? "মাতৃত্ব" : "Maternity"} stackId="a" fill="#FF9800" />
                  <Bar dataKey={locale == 'fr' ? "স্থায়ী ও অস্থায়ী অক্ষমতা" : "Permanent Or Curable Disability"} stackId="a" fill="#212121" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card style={newCard} sx={{ borderRadius: "16px", boxShadow: 3 }}>
            <CardHeader 
              title={locale == 'fr' ? 'আবেদনের অবস্থা' : 'Application Status'} subheader={locale == 'fr' ? 'একনজরে আবেদনসমূহের অবস্থা' : 'Status At a Glance'}
              action={<Filters/>}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle" // optional: circle, square, line
                    layout="horizontal"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </>
  );
};

const DashboardPage = () => {

  const reduxState = useSelector((state) => state);
  const user_rights = reduxState.core.user.i_user.rights;
  const approvedTextId = getUserTypeFromRights(user_rights) === WORKFORCE_USER_TYPE.DIRECTOR ? "workforce.application.forwarded" : "workforce.application.approved";

  const SidebarMenu = [
    {
      id: "dashboard",
      text: (
        <FormattedMessage
          module="workforce"
          id="workforce.application.dashboard"
        />
      ),
      icon: <DashboardIcon />,
    },
    {
      id: "waitingApplications",
      text: (
        <FormattedMessage
          module="workforce"
          id="workforce.employee.application.meetingSheet"
        />
      ),
      icon: <DashboardIcon />,
    },
    {
      id: "rejectedApplications",
      text: (
        <FormattedMessage
          module="workforce"
          id="workforce.application.rejectedApplication"
        />
      ),
      icon: <DashboardIcon />,
    },
    {
      id: "approvedApplications",
      text: (
        <FormattedMessage
          module="workforce"
          id={approvedTextId}
        />
      ),
      icon: <DashboardIcon />,
    },
    {
      id: "returnedApplications",
      text: (
        <FormattedMessage
          module="workforce"
          id="workforce.application.returned"
        />
      ),
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
        return (
          <Dashboard />
        );
      case "waitingApplications":
        return (<ApplicationSummaryPage status="pending" />);
      case "rejectedApplications":
        return <RejectApplication />;
      case "approvedApplications":
        return (<ApplicationSummaryPage status="approved" disableButtons={1} />);
      case "returnedApplications":
        return (<ReturnedApplications />);
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
        <Grid item xs={12} md={9} className={classes.content}>
          {renderContent()}
        </Grid>
      </Grid>
    </div>
  );

};


export default DashboardPage;
