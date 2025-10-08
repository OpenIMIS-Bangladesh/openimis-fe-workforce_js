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
import RestorePageIcon from '@material-ui/icons/RestorePage';
import MultiStepApplyForm from "../application/MultiStepApplyForm";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery, decodeId, encodeId } from "@openimis/fe-core";
import { fetchApplicationsSummary,  fetchFactoryEmployee } from "../../actions";
import CancelIcon from '@material-ui/icons/Cancel';
import DraftsIcon from '@material-ui/icons/Drafts';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "70vh",
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
      <FormattedMessage module="workforce" id="workforce.new.application.factory" />
    ),
    icon: <AddCircleOutlineIcon />,
  },
  {
    id: "submittedByApplicants",
    text: (
      <FormattedMessage module="workforce" id="workforce.new.application.submittedbyapplicant" />
    ),
    icon: <VerifiedUserIcon />,
  },
  {
    id: "forwardedApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.forwarded" /> 
    ),
    icon: <ArrowForwardIcon />,
  },
  {
    id: "revertedApplication",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.reverted" />
    ),
    icon: <RestorePageIcon  />,
  },
  {
    id: "returnedApplication",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.returned" />
    ),
    icon: <ArrowBackIcon  />,
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
    icon: <AssignmentIcon  />,
  },
  
  
   
];

// ----------- Components to Render in Main Content -----------

const     FiledApplications = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);

  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  if (loggedInUserId) {
    const filters = [`relatedUser_Id: "${encodeId(modulesManager,"InteractiveUserGQLType",loggedInUserId)}"`];

    dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
      const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
      const node = edges[0]?.node;

      const factoryId = node?.workforceFactory?.id || null;
      console.log("factoryId",factoryId)
      setWorkforceFactoryId(factoryId);
    });
  }
  
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.factory_admin.dashboard" />
    </Typography>
   <Card className={classes.tableContainer}>
       <CardContent>
             <ApplicationProcessSearcher loggedInUserId={loggedInUserId} factoryId={workforceFactoryId}
                     
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

const DraftApplications = () => {
  const classes = useStyles()
  return (
    <>
      <ApplicationProcessSearcher applicationStatus={"draft"} dynamicTableTitle= {"workforce.application.draft_applications"} />
    </>
  );
}


const ApplicationStatus = () => {
  const dispatch = useDispatch();
  const mm = useModulesManager();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [applicationData, setApplicationData] = useState(null);
  const [showResult, setShowResult] = useState(false);

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
  const classes = useStyles()
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  
  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.application.reverted" />
    </Typography>
   <Card className={classes.tableContainer}>
       <CardContent>
             <ApplicationProcessSearcher
                revertedApplication={true}
                loggedInUserId={loggedInUserId}
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
)}


const ReturnedApplications = () => {
  const classes = useStyles();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  return (
    <>
      <ApplicationProcessSearcher
        returnedApplications={true}
        loggedInUserId={loggedInUserId}
        disableButtons={1}
        dynamicTableTitle= {"workforce.application.returned"}
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
const SubmittedByApplicants = () => {
  const classes = useStyles()
  return (
    <>
      <ApplicationProcessSearcher
        submittedByApplicants={true}
        dynamicTableTitle= {"workforce.new.application.submittedbyapplicant"}
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
const ForwardedApplications = () => {
  const classes = useStyles()
  return (
    <>
      <ApplicationProcessSearcher
        forwardedApplications={true}
        disableButtons={1}
        dynamicTableTitle= {"workforce.application.forwarded"}
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


const Others = () => (
  <Typography variant="h5">
    <FormattedMessage module="workforce" id="workforce.others" />
  </Typography>
);

// ------------------------------------------------------------

const FactoryAdminDashboard = () => {
  const classes = useStyles();
  const [selectedMenu, setSelectedMenu] = useState("pendingApplications"); // Default first menu

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingApplications":
        return <FiledApplications />;
      case "newApplications":
        return <MultiStepApplyForm />;
      case "submittedByApplicants":
        return <SubmittedByApplicants />;
      case "forwardedApplications":
        return <ForwardedApplications />;
      case "revertedApplication":
        return <RevertApplication />;
      case "returnedApplication":
        return <ReturnedApplications />;
      case "rejectedApplication":
        return <RejectApplication />;
      case "draftApplications":
        return <DraftApplications />;
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

export default FactoryAdminDashboard;
