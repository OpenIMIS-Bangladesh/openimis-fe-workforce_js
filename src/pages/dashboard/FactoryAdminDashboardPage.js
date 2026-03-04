import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useHistory } from "@openimis/fe-core";
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
  Box,
} from "@material-ui/core";

import DescriptionIcon from "@material-ui/icons/Description";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import MultiStepApplyForm from "../application/MultiStepApplyForm";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, useTranslations, Autocomplete, useGraphqlQuery, decodeId, encodeId } from "@openimis/fe-core";
import { fetchApplicationsSummary, fetchFactoryEmployee } from "../../actions";
import CancelIcon from "@material-ui/icons/Cancel";
import DraftsIcon from "@material-ui/icons/Drafts";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import EisMultiStepApplyForm from "../application/EisMultiStepApplyForm";
import { isEisPath, conditionalEnToBn, safeDecodeId } from "../../utils/utils";
import {
  STATUS_MAP_BN,
  STATUS_MAP_EN,
  WORKFORCE_USER_TYPE_MAP_EN,
  WORKFORCE_USER_TYPE_MAP_BN,
  ORGANIZATION_TYPE_NAME_EN,
  ORGANIZATION_TYPE_NAME_BN,
} from "../../constants";
import CustomSnackbar from "../../components/shared/CustomSnackbar";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "100vh",
    overflow: "visible",
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
}));

const SidebarMenu = [
  {
    id: "pendingApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.myself" />,
    icon: <DescriptionIcon />,
  },
  {
    id: "newApplications",
    text: <FormattedMessage module="workforce" id="workforce.new.application.factory" />,
    icon: <AddCircleOutlineIcon />,
  },
  {
    id: "submittedByApplicants",
    text: <FormattedMessage module="workforce" id="workforce.new.application.submittedbyapplicant" />,
    icon: <VerifiedUserIcon />,
  },
  {
    id: "forwardedApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.forwarded" />,
    icon: <ArrowForwardIcon />,
  },
  {
    id: "revertedApplication",
    text: <FormattedMessage module="workforce" id="workforce.application.reverted" />,
    icon: <RestorePageIcon />,
  },
  {
    id: "returnedApplication",
    text: <FormattedMessage module="workforce" id="workforce.application.returned" />,
    icon: <ArrowBackIcon />,
  },
  {
    id: "rejectedApplication",
    text: <FormattedMessage module="workforce" id="workforce.application.rejectedApplication" />,
    icon: <CancelIcon />,
  },
  {
    id: "draftApplications",
    text: <FormattedMessage module="workforce" id="workforce.application.draft_applications" />,
    icon: <DraftsIcon />,
  },
  {
    id: "applicationStatus",
    text: <FormattedMessage module="workforce" id="workforce.application.status" />,
    icon: <AssignmentIcon />,
  },
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);

  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory?.id || null;
        setWorkforceFactoryId(factoryId);
      });
    }
  }, [loggedInUserId]);
  return (
    <>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.factory_admin.dashboard" />
      </Typography>
      <Card className={classes.tableContainer}>
        <CardContent>
          <ApplicationProcessSearcher loggedInUserId={loggedInUserId} factoryId={workforceFactoryId} />
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
  );
};

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
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);

  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory?.id || null;
        setWorkforceFactoryId(safeDecodeId(factoryId));
      });
    }
  }, [loggedInUserId]);
  return (
    <>
      <ApplicationProcessSearcher 
        isDraft={true} 
        applicationStatus={"draft"} 
        factoryId= {workforceFactoryId}
        dynamicTableTitle={"workforce.application.draft_applications"} 
      />
    </>
  );
};

const ApplicationStatus = () => {
  const dispatch = useDispatch();
  const mm = useModulesManager();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [applicationData, setApplicationData] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || "en";

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
              label={<FormattedMessage module="workforce" id="workforce.application.tracking.number" />}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleApplicationSearch}>
              <FormattedMessage module="workforce" id="workforce.search.here" />
            </Button>
          </Grid>
        </Grid>
        {showResult &&
          (applicationData ? (
            <Box mt={4} p={3} border={1} borderColor="#ccc" borderRadius={2} textAlign="left" maxWidth={800} margin="32px auto 0">
              <Typography variant="h6" gutterBottom style={{ textAlign: "center" }}>
                <FormattedMessage module="workforce" id="workforce.tracking.summary" defaultMessage="ট্র্যাকিং সারাংশ" />
              </Typography>

              <Grid container style={{ marginTop: 16 }} spacing={2}>
                <Grid item xs={6}>
                  <Typography>
                    <strong>
                      <FormattedMessage module="workforce" id="workforce.application.tracking.number" />:
                    </strong>{" "}
                    {applicationData.trackingNumber}
                  </Typography>
                  <Typography>
                    <strong>
                      <FormattedMessage module="workforce" id="workforce.employee.application.currentStatus" />:
                    </strong>
                    {(locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN)[applicationData?.status] || applicationData?.status}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    <strong>
                      <FormattedMessage module="workforce" id="workforce.employee.application.applicationType" />:
                    </strong>{" "}
                    {locale === "en" ? applicationData?.grantMoney?.applicationTypeNameEn : applicationData?.grantMoney?.applicationTypeNameBn}
                  </Typography>
                  <Typography>
                    <strong>
                      <FormattedMessage module="workforce" id="workforce.employee.application.applicationDate" />:
                    </strong>{" "}
                    {applicationData?.dateCreated ? conditionalEnToBn(applicationData?.dateCreated?.split("T")[0], locale) : "-"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography color="error" style={{ marginTop: 32 }}>
              <FormattedMessage module="workforce" id="workforce.tracking.notfound" defaultMessage="কোনো আবেদন পাওয়া যায়নি।" />
            </Typography>
          ))}
      </CardContent>
    </Card>
  );
};

const RevertApplication = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory?.id || null;
        setWorkforceFactoryId(factoryId);
      });
    }
  }, [loggedInUserId]);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        <FormattedMessage module="workforce" id="workforce.application.reverted" />
      </Typography>
      <Card className={classes.tableContainer}>
        <CardContent>
          <ApplicationProcessSearcher revertedApplication={true} loggedInUserId={loggedInUserId} factoryId={workforceFactoryId} />
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
  );
};

const ReturnedApplications = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory?.id || null;
        setWorkforceFactoryId(factoryId);
      });
    }
  }, [loggedInUserId]);
  return (
    <>
      <ApplicationProcessSearcher
        returnedApplications={true}
        loggedInUserId={loggedInUserId}
        disableButtons={1}
        dynamicTableTitle={"workforce.application.returned"}
        factoryId={workforceFactoryId}
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
  );
};

const RejectApplication = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory?.id || null;
        setWorkforceFactoryId(factoryId);
      });
    }
  }, [loggedInUserId]);
  return (
    <>
      <ApplicationProcessSearcher
        rejectedApplication={true}
        dynamicTableTitle={"workforce.application.rejectedApplication"}
        loggedInUserId={loggedInUserId}
        factoryId={workforceFactoryId}
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
  );
};
const SubmittedByApplicants = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory?.id || null;
        setWorkforceFactoryId(factoryId);
      });
    }
  }, [loggedInUserId]);
  return (
    <>
      <ApplicationProcessSearcher
        submittedByApplicants={true}
        dynamicTableTitle={"workforce.new.application.submittedbyapplicant"}
        loggedInUserId={loggedInUserId}
        factoryId={workforceFactoryId}
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
  );
};
const ForwardedApplications = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);

  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory?.id || null;
        setWorkforceFactoryId(factoryId);
      });
    }
  }, [loggedInUserId]);
  return (
    <>
      <ApplicationProcessSearcher
        forwardedApplications={true}
        disableButtons={1}
        dynamicTableTitle={"workforce.application.forwarded"}
        loggedInUserId={loggedInUserId}
        factoryId={workforceFactoryId}
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
  );
};

// ------------------------------------------------------------

const FactoryAdminDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  // const path = window.location.href;
  // const isEisPath = path.includes("eis");
  // console.log({ isEisPath });
  const [showActivationError, setShowActivationError] = useState(false); // Default first menu
  const [selectedMenu, setSelectedMenu] = useState("pendingApplications"); // Default first menu
  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  useEffect(() => {
    if (loggedInUserId) {
      const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", loggedInUserId)}"`];
      dispatch(fetchFactoryEmployee(modulesManager, filters)).then((res) => {
        const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
        const node = edges[0]?.node;
        const factoryId = node?.workforceFactory || null;
        setWorkforceFactoryId(factoryId);
      });
    }
  }, [loggedInUserId]);

  useEffect(() => {
    if (workforceFactoryId?.status === "draft") {
      setSelectedMenu("newApplications");
    }
  }, [workforceFactoryId]);
  console.log({ workforceFactoryId });

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingApplications":
        return <FiledApplications />;
      case "newApplications":
        return isEisPath() ? <EisMultiStepApplyForm workforceFactoryId={workforceFactoryId} /> : <MultiStepApplyForm workforceFactoryId={workforceFactoryId} />;
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
            {workforceFactoryId?.status === "draft" && <Typography style={{color:"red",textAlign:"center",fontWeight:"bold"}}><FormattedMessage id="workforce.application.factory.activation.error" /></Typography>}
            <List>
              {SidebarMenu.map((item) => {
                // Determine if this item should be disabled
                const isDraftStatus = workforceFactoryId?.status === "draft";
                const isNotNewApplication = item.id !== "newApplications";
                const isDisabled = isDraftStatus && isNotNewApplication;
                // const isDisabled = false;

                return (
                  <ListItem
                    button
                    key={item.id}
                    selected={selectedMenu === item.id}
                    // Disable the click and apply the disabled look
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedMenu(item.id);
                      } else {
                        setShowActivationError(true);
                      }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {/* Optional: Show a hint why it's disabled */}
                    {/* {isDisabled && isDraftStatus && (
                      <Typography variant="caption" color="error">
                        {" "}
                        (Required){" "}
                      </Typography>
                    )} */}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9} className={classes.content}>
          {renderContent()}
        </Grid>
      </Grid>

      <CustomSnackbar
        open={showActivationError}
        onClose={() => setShowActivationError(false)}
        type="error"
        message={<FormattedMessage id="workforce.application.factory.activation.error" module="workforce" />}
      />
    </div>
  );
};

export default FactoryAdminDashboard;
