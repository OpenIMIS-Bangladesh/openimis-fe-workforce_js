import React, { use, useEffect, useState  } from "react";
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
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Box
} from "@material-ui/core";

import {
  useHistory,
} from "@openimis/fe-core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { getUserType, getUserTypeFromRights } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import DashboardIcon from '@material-ui/icons/Dashboard';
import ApplicationSummaryPage from "../application-process/ApplicationSummaryPage";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "calc(100vh - 64px)", // assuming 64px header/appbar, adjust as needed
    overflow: "hidden",
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "50vh",
    // backgroundColor: theme.palette.background.paper,
    // borderRight: `1px solid ${theme.palette.divider}`,
    // overflowY: "auto",
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

  // Sample data
  const caseData = [
    {
      month: "Jan",
      Permanent_Total_Disability: 4,
      Permanent_Partial_Disability: 8,
      Death: 11,
    },
    {
      month: "Feb",
      Permanent_Total_Disability: 0,
      Permanent_Partial_Disability: 0,
      Death: 0,
    },
    {
      month: "Mar",
      Permanent_Total_Disability: 2,
      Permanent_Partial_Disability: 0,
      Death: 3,
    },
  ];

  const statusData = [
    { name: "Open", value: 12 },
    { name: "Approved", value: 3 },
    { name: "Further Query", value: 3 },
    { name: "Reject", value: 3 },
    { name: "closed", value: 3 },
    { name: "Re-open", value: 3 },
  ];

  const COLORS = [
    "#3CA7B4",
    "#00CCCC",
    "#90B1BF",
    "#007BFF",
    "#007980",
    "#FDACB9",
    "#0295A0",
    "#7D84AF",
  ];

  const cardStyle = {
    height: "100%",
    borderRadius: 12,
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.background.paper,
    color: "white",
  };
  const StyledBadge = withStyles((theme) => ({
    badge: {
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '6px 6px',
      fontSize: '0.75rem',
      minWidth: '22px',
      height: '22px',
      marginLeft: theme.spacing(10),
      right: -15,

    },
  }))(Badge);

  const newCardStyles = makeStyles((theme) => ({
    card: {
      height: "100%",
      borderRadius: "20px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
      minHeight: "200px",
    },
    itemRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: theme.spacing(1),
    },
    value: {
      fontWeight: 600,
    },
  }));

  const newCard = {
    height: "100%",
    borderRadius: "20px",
    boxShadow: theme.shadows[2],
    color: "#000",
    padding: "10px",
  };

  const classes = useStyles();

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
                <HourglassFullTwoToneIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                আবেদন প্রকার
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
                <HourglassFullTwoToneIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                আবেদনকারীর বিবরণ
              </Typography>
              <Card style={{ ...newCard, margin: "10px",  padding:"0px" }}>
                <CardContent>
                    <Typography>মোট আবেদনকারী</Typography>
                    <Typography variant="h5"><b>{totalApplicationCount}</b></Typography>
                </CardContent>
              </Card>
              {applicationCounts.map((item) => (
                <Card style={{ ...newCard, margin: "10px", padding:"0px" }}>
                <CardContent>
                    <Typography>{item.bn}</Typography>
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
                <HourglassFullTwoToneIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                আর্থিক তথ্য
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
        <Grid item xs={12} sm={6}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS, height: 300 }}>
            <CardContent>
              <Typography variant="subtitle1">
                Case Distribution by Month
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={caseData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="Permanent_Total_Disability"
                    stackId="a"
                    fill="#64b5f6"
                  />
                  <Bar
                    dataKey="Permanent_Partial_Disability"
                    stackId="a"
                    fill="#9575cd"
                  />
                  <Bar dataKey="Death" stackId="a" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS, height: 300 }}>
            <CardContent>
              <Typography variant="subtitle1">Status Breakdown</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
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
