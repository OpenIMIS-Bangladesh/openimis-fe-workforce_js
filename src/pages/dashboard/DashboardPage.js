import React, { use, useEffect, useState, useMemo} from "react";
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
} from "@openimis/fe-core";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { getUserType, getUserTypeFromRights } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import DescriptionIcon from '@material-ui/icons/Description';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import PersonIcon from '@material-ui/icons/Person';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ApplicationSummaryPage from "../application-process/ApplicationSummaryPage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "fit-content", // assuming 64px header/appbar, adjust as needed
    overflow: "hidden",
  },
  sidebar: {
    position: "sticky",
    top: 0,
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
}));





const Dashboard = () =>{
  const theme = useTheme();
  const history = useHistory();
  const user_type = getUserType();

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

  // Sample data (replace with API data)
  const barData = [
    { name: "জানু", চিকিৎসা: 12, মৃত্যু: 6, শিক্ষা: 3, মাতৃত্ব: 2, 'স্থায়ী ও অস্থায়ী অক্ষমতা': 2 },
    { name: "ফেব", চিকিৎসা: 15, মৃত্যু: 7, শিক্ষা: 4, মাতৃত্ব: 2, 'স্থায়ী ও অস্থায়ী অক্ষমতা': 2 },
    { name: "মার্চ", চিকিৎসা: 10, মৃত্যু: 5, শিক্ষা: 2, মাতৃত্ব: 1, 'স্থায়ী ও অস্থায়ী অক্ষমতা': 1 },
    { name: "এপ্রিল", চিকিৎসা: 18, মৃত্যু: 8, শিক্ষা: 6, মাতৃত্ব: 3, 'স্থায়ী ও অস্থায়ী অক্ষমতা': 3 },
    { name: "মে", চিকিৎসা: 11, মৃত্যু: 6, শিক্ষা: 2, মাতৃত্ব: 2, 'স্থায়ী ও অস্থায়ী অক্ষমতা': 1 },
    { name: "জুন", চিকিৎসা: 14, মৃত্যু: 7, শিক্ষা: 3, মাতৃত্ব: 2, 'স্থায়ী ও অস্থায়ী অক্ষমতা': 2 },
  ];


  const pieData = [
    { name: "প্রক্রিয়াধীন", value: 36, color: "#2E7D32" },
    { name: "সভা কার্যতালিকায়", value: 25, color: "#CFD8DC" },
    { name: "অনুমোদিত", value: 18, color: "#263238" },
    { name: "বাতিল", value: 12, color: "#FF9800" },
    { name: "পুনরায় খোলা", value: 6, color: "#FFD600" },
    { name: "বন্ধ", value: 3, color: "#E91E63" },
  ];

  const tableRows = [
    {
      type: "চিকিৎসা অনুদান",
      total: 120,
      approved: 100,
      cancelled: 15,
      processing: 5,
    },
    {
      type: "শিক্ষা অনুদান",
      total: 80,
      approved: 70,
      cancelled: 5,
      processing: 5,
    },
    {
      type: "মৃত্যুজনিত অনুদান",
      total: 45,
      approved: 40,
      cancelled: 3,
      processing: 2,
    },
    {
      type: "মাতৃত্বজনিত অনুদান",
      total: 60,
      approved: 55,
      cancelled: 2,
      processing: 3,
    },
    {
      type: "স্থায়ী ও আংশিক অক্ষমতা জনিত আর্থিক সহায়তা",
      total: 90,
      approved: 80,
      cancelled: 8,
      processing: 2,
    },
  ];

  


  const [timeRange, setTimeRange] = useState("৩ মাস");

  const handleRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
      // এখানে চাইলে API call দিয়ে data filter করতে পারো
    }
  };

  const [filter, setFilter] = useState("সব");

  // totals computed from visible rows (if you later filter rows, apply filter logic here)
  const totals = useMemo(() => {
    return tableRows.reduce(
      (acc, r) => {
        acc.total += Number(r.total || 0);
        acc.approved += Number(r.approved || 0);
        acc.cancelled += Number(r.cancelled || 0);
        acc.processing += Number(r.processing || 0);
        return acc;
      },
      { total: 0, approved: 0, cancelled: 0, processing: 0 }
    );
  }, []);

  // placeholder: when filter changes, you might fetch new rows. For demo we keep same rows.
  const handleFilter = (f) => {
    setFilter(f);
    // TODO: fetch/filter data by `f` and `timeRange`
  };

  const handleTimeRange = (range) => {
    setTimeRange(range);
    // TODO: fetch/filter data by timeRange
  };



  const newCard = {
    height: "100%",
    borderRadius: "20px",
    boxShadow: theme.shadows[2],
    color: "#000",
    padding: "10px",
  };


  let applicationTypes=[];
  if(user_type === WORKFORCE_USER_TYPE.BLWF_DIRECTOR){
    applicationTypes=[
      {en:'Medical Grant', bn: 'চিকিৎসা অনুদান', count: 1250},
      {en:'Education Grant', bn: 'শিক্ষা অনুদান', count: 450},
      {en:'Deadly Grant', bn: 'মৃত্যুজনিত অনুদান', count: 155},
      {en:'Maternal Grant', bn: 'মাতৃত্বজনিত অনুদান', count: 123},
    ]; 
  }
  else
  {
    applicationTypes=[
      {en:'Medical Grant', bn: 'চিকিৎসা অনুদান', count: 120},
      {en:'Education Grant', bn: 'শিক্ষা অনুদান', count: 80},
      {en:'Deadly Grant', bn: 'মৃত্যুজনিত অনুদান', count: 45},
      {en:'Maternal Grant', bn: 'মাতৃত্বজনিত অনুদান', count: 60},
      {en:'Financial Assistance due to Permanent Disability', bn: 'স্থায়ী অক্ষমতা জনিত', count: 90},
      {en:'Financial Assistance due to Partial Disability', bn: 'আংশিক অক্ষমতা জনিত', count: 75},
    ];
  }


  let applicationCounts = [
      {type: 'male', en:'Male Applicant', bn: 'পুরুষ আবেদনকারী', count: 570},
      {type: 'female', en:'Female Applicant', bn: 'নারী আবেদনকারী', count: 1240},
      {type: 'dependent', en:'Dependent Applicant', bn: 'নির্ভরশীল আবেদনকারী', count: 350},
    ];

  let totalApplicationCount=0;
  applicationCounts.forEach(element => {
    totalApplicationCount+=element.count;
  });
  return (
    <>
      <Grid container spacing={2}>
        {/* Left Card */}
        <Grid item xs={12} md={4}>
          <Card style={newCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                আবেদন প্রকার
                <DescriptionIcon style={{ verticalAlign: 'middle', marginRight: 8, float:"right"}} />
              </Typography>
              <table cellPadding={"6px"} style={{ width: "100%" }}>
                <tbody>
                    {applicationTypes.map((type) => (
                      <tr style={{paddingTop:"10px", paddingBottom:"10px"}}>
                        <th style={{textAlign:"left"}}><Typography>{type.bn}</Typography></th>
                        <td style={{textAlign:"right"}}><Typography>{type.count}</Typography></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Grid>

        {/* Middle Card */}
        <Grid item xs={12} md={4}>
          <Card style={newCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                আবেদনকারীর বিবরণ
                <PeopleAltIcon style={{ verticalAlign: 'middle', marginRight: 8, float:"right" }} />
              </Typography>
              <Card style={{ ...newCard, margin: "10px",  padding:"0px" }}>
                <CardContent>
                    <Typography>মোট আবেদনকারী
                      <PersonIcon style={{ verticalAlign: 'middle', marginLeft: 8, float:"right" }} />
                    </Typography>
                    <Typography variant="h5"><b>{totalApplicationCount}</b></Typography>
                </CardContent>
              </Card>
              {applicationCounts.map((item) => (
                <Card style={{ ...newCard, margin: "10px", padding:"0px" }}>
                <CardContent>
                    <Typography>{item.bn}
                      <PersonIcon style={{ verticalAlign: 'middle', marginLeft: 8, float:"right" }} />
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
          <Card style={newCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                আর্থিক তথ্য
                <LocalAtmIcon style={{ verticalAlign: 'middle', marginRight: 8, float:"right" }} />
              </Typography>
                <Card style={{ ...newCard, margin: "10px", padding:"0px" }}>
                  <CardContent>
                      <Typography>মোট সুবিধা পরিমাণ</Typography>
                      <Typography variant="h5"><b>৳ ৩,০০,০০,০০০</b></Typography>
                  </CardContent>
                </Card>
                <Card style={{ ...newCard, margin: "10px", padding:"0px" }}>
                  <CardContent>
                      <Typography>মাসিক মোট সুবিধা</Typography>
                      <Typography variant="h5"><b>৳ ৫,০০,০০০</b></Typography>
                      <Typography>(সর্বোচ্চ: ৭.৫ লাখ | সর্বনিম্ন: ২.০ লাখ)</Typography>
                  </CardContent>
                </Card>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card style={newCard} sx={{ borderRadius: "16px", boxShadow: 3 }}>
            <CardHeader
              title="সময়ভিত্তিক অ্যাপ্লিকেশন"
              subheader="মাসিক ডেটা ওভারভিউ - বিভাগ অনুসারে"
              action={
              <>
                <Card style={{padding:"10px", borderRadius:"12px"}}>
                  <Typography style={{ textAlign:"center", fontWeight:"bold" }}>সময়সীমা নির্বাচন করুন:</Typography>
                  <ButtonGroup variant="outlined">
                    {["৩ মাস", "৬ মাস", "৯ মাস", "১২ মাস"].map((label) => (
                      <Button
                        key={label}
                        variant={timeRange === label ? "contained" : "outlined"}
                        onClick={() => setTimeRange(label)}
                      >
                        {label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Card>
              </>
            }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="চিকিৎসা" stackId="a" fill="#009688" />
                  <Bar dataKey="মৃত্যু" stackId="a" fill="#90CAF9" />
                  <Bar dataKey="শিক্ষা" stackId="a" fill="#FBC02D" />
                  <Bar dataKey="মাতৃত্ব" stackId="a" fill="#FF9800" />
                  <Bar dataKey="স্থায়ী ও অস্থায়ী অক্ষমতা" stackId="a" fill="#212121" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Pie Chart */}
        <Grid item xs={12} md={5}>
          <Card style={newCard} sx={{ borderRadius: "16px", boxShadow: 3 }}>
            <CardHeader title="স্ট্যাটাস বিতরণ" subheader="অ্যাপ্লিকেশনের বর্তমান অবস্থা" />
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
        <Grid item xs={12} md={12}>
          <Card style={newCard} sx={{ borderRadius: "12px", boxShadow: 2 }}>
            <CardHeader
              title={
                <Box>
                  <Typography variant="h6" component="div">
                    অ্যাপ্লিকেশন প্রকার ম্যাট্রিক্স
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    বিস্তারিত অ্যাপ্লিকেশন প্রতিবেদন - ফান্ড প্রকার অনুসারে
                  </Typography>
                </Box>
              }
              action={
                <>
                  <Card style={{padding:"10px", borderRadius:"12px", paddingLeft:"30px", paddingRight:"30px"}}>
                    <Typography style={{ textAlign:"center", fontWeight:"bold" }}>সময়সীমা নির্বাচন করুন:</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ButtonGroup variant="outlined">
                        {["৩ মাস", "৬ মাস", "৯ মাস", "১২ মাস"].map((label) => (
                          <Button
                            key={label}
                            variant={timeRange === label ? "contained" : "outlined"}
                            onClick={() => handleTimeRange(label)}
                          >
                            {label}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </Box>
                  </Card>
                </>
              }
            />
            <CardContent>
              {/* Filters row */}
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <ButtonGroup size="small" variant="outlined">
                    {["সব", "CF", "BLWF"].map((l) => (
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
                  <Typography variant="caption" color="textSecondary">
                    তহবিল: <strong>{filter}</strong>
                  </Typography>
                </Box>
              </Box>

              {/* Table */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "bold" }}>অ্যাপ্লিকেশন প্রকার</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>মোট অ্যাপ্লিকেশন</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>অনুমোদিত</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>বাতিল</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>প্রক্রিয়াধীন</TableCell>
                    <TableCell align="center" style={{ fontWeight: "bold" }}>বিস্তারিত</TableCell>
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
                          বিস্তারিত দেখুন
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">মোট=</Typography>
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
      </Grid>
    </>
  );
};

const DashboardPage = () => {

  const reduxState = useSelector((state) => state);
  const user_rights = reduxState.core.user.i_user.rights;
  const approvedTextId= getUserTypeFromRights(user_rights) === WORKFORCE_USER_TYPE.DIRECTOR? "workforce.application.forwarded":"workforce.application.approved";

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
        default:
          setSelectedMenu("dashboard");
      }
    }
  }, [status]);


  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return (
          <Dashboard/>
        );
      case "waitingApplications":
        return (<ApplicationSummaryPage status="pending"/>);
      case "rejectedApplications":
        return <ApplicationSummaryPage status="rejected"/>;
      case "approvedApplications":
        return (<ApplicationSummaryPage status="approved"/>);
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
