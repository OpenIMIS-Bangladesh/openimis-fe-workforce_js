import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage } from "@openimis/fe-core";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
} from "@material-ui/core";

import DescriptionIcon from "@material-ui/icons/Description";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import HourglassFullTwoToneIcon from '@material-ui/icons/HourglassFullTwoTone';
import CheckCircleOutlineTwoToneIcon from '@material-ui/icons/CheckCircleOutlineTwoTone';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  sidebar: {
    width: 340,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    height: "auto",
    position: "sticky",
    top: 0,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(0),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
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
}));

const SidebarMenu = [
  {
    id: "pendingApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.pending" />
    ),
    icon: <HourglassFullTwoToneIcon />,
  },
  {
    id: "checkedApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.approve" />
    ),
    icon: <CheckCircleOutlineTwoToneIcon />,
  },
  {
    id: "recentApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.recent" />
    ),
    icon: <DoneAllIcon />,
  },
   
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = () =>{ 
  const classes = useStyles()
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.approver.dashboard" />
    </Typography>

    {/* Filters */}
    {/* <Grid container spacing={2} alignItems="center">
      <Grid item>
        <TextField
        variant="outlined"
        size="small"
          // className={classes.searchInput}
          label={<FormattedMessage module="workforce" id="workforce.search.here" />}
        />
      </Grid>
    </Grid> */}

    {/* Table */}
    <Card className={classes.tableContainer}>
     <CardContent>
           <ApplicationProcessSearcher
                   
            />
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
);}

const checkedApplications = () => (
  <Typography variant="h5">
    <FormattedMessage module="workforce" id="workforce.new.application" />
  </Typography>
);

const ApplicationStatus = () => {
  const classes = useStyles();

  return (
    <Card style={{ marginTop: 0, padding: "32px", textAlign: "center" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <FormattedMessage module="workforce" id="workforce.application.status" />
        </Typography>

        <Grid container spacing={2} justifyContent="center" style={{ marginTop: 16 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={<FormattedMessage module="workforce" id="workforce.employee.dependent.phone" />}
              style={{
                // border: "1px solid #ccc",
                // borderRadius: 4,
                // padding: "8px 12px",
                marginBottom: 16,
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={<FormattedMessage module="workforce" id="workforce.application.tracking.number" />}
              style={{
                // border: "1px solid #ccc",
                // borderRadius: 4,
                // padding: "8px 12px",
                marginBottom: 16,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
            >
              <FormattedMessage module="workforce" id="workforce.search.here" />
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};


const HelpAndComplaints = () => (
  <Typography variant="h5">
    <FormattedMessage module="workforce" id="workforce.help.complain" />
  </Typography>
);

const Others = () => (
  <Typography variant="h5">
    <FormattedMessage module="workforce" id="workforce.others" />
  </Typography>
);

// ------------------------------------------------------------

const ApproverDashboard = () => {
  const classes = useStyles();
  const [selectedMenu, setSelectedMenu] = useState("pendingApplications"); // Default first menu

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingApplications":
        return <FiledApplications />;
      case "checkedApplications":
        return <FiledApplications />;
      case "recentApplications":
        return <FiledApplications />;
      default:
        return <FiledApplications />;
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
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

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <div className={classes.content}>{renderContent()}</div>
        </Grid>
      </Grid>
    </div>
  );
};

export default ApproverDashboard;
