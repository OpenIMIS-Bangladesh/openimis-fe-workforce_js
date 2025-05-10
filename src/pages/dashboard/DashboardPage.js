import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  FormattedMessage,
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

const DashboardPage = () => {
  const theme = useTheme();
  const history = useHistory();

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
    <div style={{ padding: theme.spacing(3) }}>
      <Grid container spacing={2} style={{ marginBottom: theme.spacing(1) }}>
        <Grid item xs={12}>
          <Card
            style={{ ...cardStyle, backgroundColor: COLORS[7],display:"flex",flexWrap:"wrap" }}
            onClick={() => history.push("workforce/applications/process")}
          >
           <CardContent>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" style={{ marginRight: 16 }}>
              Application Status* --
            </Typography>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
              <StyledBadge badgeContent={10} color="secondary"><span>Pending</span></StyledBadge>
              <StyledBadge badgeContent={2} color="error"><span>Rejected</span></StyledBadge>
              <StyledBadge badgeContent={20} color="primary"><span>Verified</span></StyledBadge>
              <StyledBadge badgeContent={30} color="info"><span>On Process</span></StyledBadge>
            </div>
          </div>

          </CardContent>

          </Card>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        {[
          { title: "Total Dependent", count: 74, male: 31, female: 43 },
          { title: "Total Injured Worker", count: 19, male: 18, female: 1 },
          { title: "Total Deceased Worker", count: 28, male: 24, female: 4 },
        ].map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card style={{ ...cardStyle, backgroundColor: COLORS[index] }}>
              <CardContent>
                <Typography variant="subtitle1">{item.title} - {item.count} (Male: {item.male} | Female: {item.female}) </Typography>
                {/* <Typography variant="h6">Count: {item.count}</Typography>
                <Typography variant="body2">
                  Male: {item.male} | Female: {item.female}
                </Typography> */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* More Info Cards */}
      <Grid container spacing={2} style={{ marginTop: theme.spacing(1) }}>
        <Grid item xs={12} sm={6}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS[5] }}>
            <CardContent>
              <Typography variant="subtitle1">Total Benefit Amount - 55185000Tk</Typography>
              {/* <Typography variant="h6">TK: 55185000</Typography> */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS[6] }}>
            <CardContent>
              <Typography variant="subtitle1">
                Monthly Total Benefit Amount - 0.00TK (Disability Case: 0 | Deceased Case: 0)
              </Typography>
              {/* <Typography variant="body2">TK: 0.00</Typography>
              <Typography variant="body2">Disability Case: 0</Typography> */}
              <Typography variant="body2">
                Highest: 0.00 | Lowest: 0.00
              </Typography>
              {/* <Typography variant="body2">Deceased Case: 0</Typography> */}
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

      {/* Status & Charts */}
      {/* <Grid container spacing={2} columns={12} style={{ marginTop: theme.spacing(1) }}>
        <Grid item xs={6}>
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

        <Grid item xs={6}>
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
      </Grid> */}
    </div>
  );
};

export default DashboardPage;
