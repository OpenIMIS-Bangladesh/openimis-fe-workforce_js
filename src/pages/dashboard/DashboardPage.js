import React, { use, useEffect, useState  } from "react";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Typography,
  useTheme,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField
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
    height: "40vh",
    // backgroundColor: theme.palette.background.paper,
    // borderRight: `1px solid ${theme.palette.divider}`,
    // overflowY: "auto",
    // minWidth: 390,   // <-- force a stable width
    // maxWidth: 390,   // (optional) prevent oversizing
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
    // flexShrink: 0,   // <-- prevents collapsing
  },
  content: {
    // flexGrow: 1,
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
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card
            style={{ ...cardStyle, backgroundColor: COLORS[7], display: "flex", flexWrap: "wrap" }}
          >
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" style={{ marginRight: 16 }}>
                  Status -
                </Typography>

                <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button backgroundColor="transparent" border="1px solid" style={{ color: "white", padding: 0, minWidth: 'auto' }}>
                    <StyledBadge onClick={() => history.push("workforce/applications/process?status=pending")} badgeContent={application_status_count?.pending || 0} color="secondary" className="cu"><span>Pending</span></StyledBadge>
                  </Button>
                  <Button backgroundColor="transparent" border="1px solid" style={{ color: "white", padding: 0, minWidth: 'auto' }}>
                    <StyledBadge onClick={() => history.push("workforce/applications/process?status=rejected")} badgeContent={application_status_count?.rejected || 0} color="error"><span>Rejected</span></StyledBadge>
                  </Button>
                  <Button backgroundColor="transparent" border="1px solid" style={{ color: "white", padding: 0, minWidth: 'auto' }}>
                    <StyledBadge onClick={() => history.push("workforce/applications/process?status=approved")} badgeContent={application_status_count?.approved || 0} color="primary"><span>Approved</span></StyledBadge>
                  </Button>
                </div>
              </div>

            </CardContent>

          </Card>
        </Grid>
        {[
          { title: "Total Dependent", count: 74, male: 31, female: 43 },
          { title: "Total Injured Worker", count: 19, male: 18, female: 1 },
          { title: "Total Deceased Worker", count: 28, male: 24, female: 4 },
        ].map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card style={{ ...cardStyle, backgroundColor: COLORS[index] }}>
              <CardContent>
                <Typography variant="subtitle1">{item.title} - {item.count} (Male: {item.male} | Female: {item.female}) </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={4}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS[5] }}>
            <CardContent>
              <Typography variant="subtitle1">Total Benefit Amount - 55185000Tk</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS[6] }}>
            <CardContent>
              <Typography variant="subtitle1">
                Monthly Total Benefit Amount - 0.00TK (Disability Case: 0 | Deceased Case: 0 | Highest: 0.00 | Lowest: 0.00)
              </Typography>
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
        return <ApplicationSummaryPage status="pending"/>;
      case "rejectedApplications":
        return <ApplicationSummaryPage status="rejected"/>;
      case "approvedApplications":
        return <ApplicationSummaryPage status="approved"/>;
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
