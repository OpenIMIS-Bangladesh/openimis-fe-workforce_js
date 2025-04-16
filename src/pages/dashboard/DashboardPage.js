import React from 'react';
import { Grid, Card, CardContent, Typography, useTheme } from '@material-ui/core';
import { useTranslations, useModulesManager, TextInput, useHistory,FormattedMessage } from "@openimis/fe-core";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const theme = useTheme();
    const history = useHistory();


  // Sample data
  const caseData = [
    { month: 'Jan', PTD: 4, PPD: 8, Death: 11 },
    { month: 'Feb', PTD: 0, PPD: 0, Death: 0 },
    { month: 'Mar', PTD: 2, PPD: 0, Death: 3 },
  ];

  const statusData = [
    { name: 'Open', value: 12 },
    { name: 'Approved', value: 3 },
  ];

  const COLORS = ['#3CA7B4', '#00CCCC', '#90B1BF', '#007BFF','#007980', '#FDACB9', '#0295A0', '#7D84AF'];

  const cardStyle = {
    height: '100%',
    borderRadius: 12,
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.background.paper,
    color:'white'
  };

  return (
    <div style={{ padding: theme.spacing(3) }}>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        {[
          { title: 'Total Dependent', count: 74, male: 31, female: 43 },
          { title: 'Total Injured Worker', count: 19, male: 18, female: 1 },
          { title: 'Total Deceased Worker', count: 28, male: 24, female: 4 },
        ].map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card style={{ ...cardStyle, backgroundColor: COLORS[index] }}>
              <CardContent>
                <Typography variant="subtitle1">{item.title}</Typography>
                <Typography variant="h6">Count: {item.count}</Typography>
                <Typography variant="body2">Male: {item.male} | Female: {item.female}</Typography>
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
              <Typography variant="subtitle1">Total Benefit Amount</Typography>
              <Typography variant="h6">TK: 0</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS[6] }}>
            <CardContent>
              <Typography variant="subtitle1">Monthly Total Benefit Amount</Typography>
              <Typography variant="body2">TK: 0.00</Typography>
              <Typography variant="body2">Disability Case: 0</Typography>
              <Typography variant="body2">Highest: 0.00 | Lowest: 0.00</Typography>
              <Typography variant="body2">Deceased Case: 0</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status & Charts */}
      <Grid container spacing={2} style={{ marginTop: theme.spacing(1) }}>
        <Grid item xs={12}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS[7] }} onClick={()=>history.push("workforce/applications/process")}>
            <CardContent>
              <Typography variant="subtitle1">Application Status</Typography>
              <Typography variant="body2">
                Count: 10 | Reject: 0 | Need to Verify: 0 | Verified: 0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card style={{ ...cardStyle, backgroundColor: COLORS, height: 300 }}>
            <CardContent>
              <Typography variant="subtitle1">Case Distribution by Month</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={caseData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="PTD" stackId="a" fill="#64b5f6" />
                  <Bar dataKey="PPD" stackId="a" fill="#9575cd" />
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;
