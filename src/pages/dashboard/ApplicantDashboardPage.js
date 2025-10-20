import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage,useHistory  } from "@openimis/fe-core";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Box
} from "@material-ui/core";

import DescriptionIcon from "@material-ui/icons/Description";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import RestorePageIcon from '@material-ui/icons/RestorePage';
import CancelIcon from '@material-ui/icons/Cancel';
import DraftsIcon from '@material-ui/icons/Drafts';
import CheckIcon from '@material-ui/icons/Check';
import MultiStepApplyForm from "../application/MultiStepApplyForm";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery, decodeId } from "@openimis/fe-core";
import { fetchApplicationsSummary } from "../../actions";
import EisMultiStepApplyForm from "../application/EisMultiStepApplyForm";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    // height: '100vh', // assuming 64px header/appbar, adjust as needed
    overflow: 'hidden',
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "45vh",
    overflowY: "auto",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",

  },
  content: {
    height: 'fit-content',
    // overflowY: 'auto',
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
    icon: <DescriptionIcon />,
  },
  {
    id: "newApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.new.application" />
    ),
    icon: <AddCircleOutlineIcon />,
  },
  // {
  //   id: "newEisApplications",
  //   text: (
  //     <FormattedMessage module="workforce" id="workforce.new.eis.application" />
  //   ),
  //   icon: <AddCircleOutlineIcon />,
  // },
  {
    id: "revertedApplication",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.reverted" />
    ),
    icon: <RestorePageIcon />,
  },
  {
    id: "rejectedApplication",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.rejectedApplication" />
    ),
    icon: <CancelIcon />,
  },
  {
    id: "draftApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.draft_applications" />
    ),
    icon: <DraftsIcon />,
  },
  {
    id: "applicationStatus",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.status" />
    ),
    icon: <AssignmentIcon />,
  },
  {
    id: "approvedApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.approve.applications" />
    ),
    icon: <CheckIcon />,
  },


];

// ----------- Components to Render in Main Content -----------

const FiledApplications = () => {
  const classes = useStyles()
  const username = useSelector((state) => state.core.user.username);
  return (
    <>
      <ApplicationProcessSearcher dynamicTableTitle= {"workforce.applicant.dashboard"}/>
    </>
  );
}

const DraftApplications = () => {
  const classes = useStyles()
  return (
    <>
      <ApplicationProcessSearcher applicationStatus={"draft"} dynamicTableTitle= {"workforce.application.draft_applications"} />
    </>
  );
}

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
  const history = useHistory();

 const handleApplicationSearch = () => {
 const filters = [`trackingNumber: "${trackingNumber}"`];
   dispatch(fetchApplicationsSummary(mm, filters)).then((res) => {
     const edges = res.payload?.data?.workforceApplication?.edges || [];
     const matchedApp = edges[0]?.node || null;
 
     setApplicationData(matchedApp);
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
                <FormattedMessage module="workforce" id="workforce.application.tracking.number" />
              }
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleApplicationSearch}>
              <FormattedMessage module="workforce" id="workforce.search.here" />
            </Button>
          </Grid>
        </Grid>
        {showResult && (
          applicationData ? (
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
                    <strong><FormattedMessage module="workforce" id="workforce.application.tracking.number" />:</strong> {applicationData.trackingNumber}
                  </Typography>
                  <Typography>
                    <strong><FormattedMessage module="workforce" id="workforce.employee.application.currentStatus" />:</strong> {applicationData.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <strong><FormattedMessage module="workforce" id="workforce.employee.application.applicationType" />:</strong> {applicationData.applicationType}
                  </Typography>
                  <Typography>
                    <strong><FormattedMessage module="workforce" id="workforce.employee.application.applicationDate" />:</strong> {applicationData.dateCreated || "-"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography color="error" style={{ marginTop: 32 }}>
              <FormattedMessage
                module="workforce"
                id="workforce.tracking.notfound"
                defaultMessage="কোনো আবেদন পাওয়া যায়নি।"
              />
            </Typography>
          )
        )}
      </CardContent>
    </Card>
  );
};


const RevertApplication = () => {
  const classes = useStyles();
  const loggedInUserId= useSelector((state) => state.core?.user?.i_user?.id);
  return (
    <>
      <ApplicationProcessSearcher
        revertedApplication={true}
        loggedInUserId= {loggedInUserId}
        dynamicTableTitle= {"workforce.application.reverted"}
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
const RejectApplication = () => {
  const classes = useStyles()
  return (
    <>
      <ApplicationProcessSearcher
        rejectedApplication={true}
        dynamicTableTitle= {"workforce.application.rejectedApplication"}
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


const ApprovedApplications = () => {
  const classes = useStyles();
  return (
      <>
        <ApplicationProcessSearcher
          disableButtons={1}
          isApproved={true}
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


const ApplicantDashboard = () => {
  const classes = useStyles();
  const history = useHistory()
  const path = history.location.pathname
  // const isEisPath = path.includes("eis")
  const isEisPath = true
  console.log("heello from url history",isEisPath)
  const [selectedMenu, setSelectedMenu] = useState(() => {
    const hash = window.location.hash.substring(1);
    return SidebarMenu.some(item => item.id === hash) ? hash : "pendingApplications";
  });

  const renderContent = () => {
    useEffect(() => {
      window.history.pushState(null, "", `#${selectedMenu}`);
    }, [selectedMenu]);

    switch (selectedMenu) {
      case "pendingApplications":
        return <FiledApplications />;
      case "newApplications":
        return isEisPath ? <EisMultiStepApplyForm /> : <MultiStepApplyForm />;
      // case "newEisApplications":
      //   return <EisMultiStepApplyForm />;
      case "revertedApplication":
        return <RevertApplication />;
      case "rejectedApplication":
        return <RejectApplication />;
      case "applicationStatus":
        return <ApplicationStatus />;
      case "draftApplications":
        return <DraftApplications />;
      case "approvedApplications":
        return <ApprovedApplications/>;
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
