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
  Box
} from "@material-ui/core";

import DescriptionIcon from "@material-ui/icons/Description";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import HourglassFullTwoToneIcon from '@material-ui/icons/HourglassFullTwoTone';
import CheckCircleOutlineTwoToneIcon from '@material-ui/icons/CheckCircleOutlineTwoTone';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ApplicantApplicationProcessSearcher from "../../components/application-process/ApplicantApplicationProcessSearcher";
import MultiStepApplyForm from "../application/MultiStepApplyForm";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery, decodeId } from "@openimis/fe-core";
import { fetchApplication } from "../../actions";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: '100vh', // assuming 64px header/appbar, adjust as needed
    overflow: 'hidden',
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "40vh",
    overflowY: "auto",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
    
  },
  content: {
    height: '100vh',
    overflowY: 'auto',
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
}));

const SidebarMenu = [
  {
    id: "pendingApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.myself" />
    ),
    icon:<DescriptionIcon />,
  },
  {
    id: "newApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.new.application" />
    ),
    icon: <AddCircleOutlineIcon />,
  },
  // {
  //   id: "recentApplications",
  //   text: (
  //     <FormattedMessage module="workforce" id="workforce.application.recent" />
  //   ),
  //   icon: <DoneAllIcon />,
  // },
  {
    id: "applicationStatus",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.status" />
    ),
    icon: <AssignmentIcon  />,
  },
   
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = () =>{ 
  const classes = useStyles()
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.applicant.dashboard" />
    </Typography>
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

const newApplications = () => (
   <Typography 
      variant="h5" 
      onClick={() => history.push("/workforce/application")} 
      style={{ cursor: "pointer" }} // Add pointer cursor to show it's clickable
    >
      <FormattedMessage module="workforce" id="workforce.new.application" />
    </Typography>
);

const ApplicationStatus = () => {
  const dispatch = useDispatch();
  const mm = useModulesManager();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [applicationData, setApplicationData] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSearch = () => {
    const filters = {
      id: `eq:${trackingNumber}`,
      "workforceEmployee.phoneNumber": `eq:${phoneNumber}`,
    };

    dispatch(
      fetchApplication(mm, filters)
    ).then((res) => {
      const data = res.payload?.data?.workforceApplication?.edges?.[0]?.node;
      setApplicationData(data);
      setShowResult(true);
    });
  };
  
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
              label={
                <FormattedMessage module="workforce" id="workforce.employee.dependent.phone" />
              }
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={
                <FormattedMessage module="workforce" id="workforce.application.tracking.number" />
              }
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleSearch}>
              <FormattedMessage module="workforce" id="workforce.search.here" />
            </Button>
          </Grid>
        </Grid>

        {showResult && applicationData && (
          <Box
            mt={4}
            p={3}
            border={1}
            borderColor="#ccc"
            borderRadius={2}
            textAlign="left"
            maxWidth={800}
            margin="32px auto 0"
          >
            <Typography variant="h6" gutterBottom style={{ textAlign: "center" }}>
              <FormattedMessage
                module="workforce"
                id="workforce.tracking.summary"
                defaultMessage="ট্র্যাকিং সারাংশ"
              />
            </Typography>

            <Grid container style={{ marginTop: 16 }} spacing={2}>
              <Grid item xs={6}>
                <Typography>
                  <strong>ট্র্যাকিং নম্বর:</strong> 
                </Typography>
                <Typography>
                  <strong>বর্তমান অবস্থা:</strong> {applicationData.status}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>
                  <strong>আবেদনের বিষয়:</strong> {applicationData.applicationType}
                </Typography>
                <Typography>
                  <strong>আবেদনের তারিখ:</strong> {applicationData?.dateCreated || "-"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
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

const ApplicantDashboard = () => {
  const classes = useStyles();
  const [selectedMenu, setSelectedMenu] = useState("pendingApplications"); // Default first menu

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingApplications":
        return <FiledApplications />;
      case "newApplications":
        return <MultiStepApplyForm />;
      case "recentApplications":
        return <FiledApplications />;
      case "applicationStatus":
        return <ApplicationStatus />;
      default:
        return <FiledApplications />;
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
        <Grid item xs={12} md={9} className={classes.content}>
          {renderContent()}
        </Grid>
      </Grid>
    </div>
  );
};

export default ApplicantDashboard;
