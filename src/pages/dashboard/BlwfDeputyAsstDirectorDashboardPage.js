import React, { useState,useEffect} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage,useModulesManager } from "@openimis/fe-core";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { fetchSummaryApplications } from "../../actions";
import RestorePageIcon from '@material-ui/icons/RestorePage';
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import HourglassFullTwoToneIcon from '@material-ui/icons/HourglassFullTwoTone';
import CheckCircleOutlineTwoToneIcon from '@material-ui/icons/CheckCircleOutlineTwoTone';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { useSelector, useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: 'calc(100vh - 64px)', // assuming 64px header/appbar, adjust as needed
    overflow: 'hidden',
  },
  sidebar: {
    position: "sticky",
    top: 0,
    height: "40vh",
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

const SidebarMenu = [
  {
    id: "pendingApplications",
    text: (
      <FormattedMessage module="workforce" id="workforce.application.pending" />
    ),
    icon: <HourglassFullTwoToneIcon />,
  },  
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = () =>{ 
  const classes = useStyles()
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  return (
  <>
    <Typography variant="h5" gutterBottom>
      <FormattedMessage module="workforce" id="workforce.blwf.deputy.admin.dashboard" />
    </Typography>
   <Card className={classes.tableContainer}>
        <CardContent>
            <ApplicationProcessSearcher loggedInUserId={loggedInUserId}
            coloredRow={true}
                    
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
                marginBottom: 16,
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={<FormattedMessage module="workforce" id="workforce.application.tracking.number" />}
              style={{
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

const Others = () => (
  <Typography variant="h5">
    <FormattedMessage module="workforce" id="workforce.others" />
  </Typography>
);

// ------------------------------------------------------------

const BlwfDeputyAsstDirectorDashboardPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch()
  const modulesManager = useModulesManager()
  const [selectedMenu, setSelectedMenu] = useState("pendingApplications");
 useEffect(() => {
      return dispatch(fetchSummaryApplications(modulesManager,['status:"meeting_created"']));
    }, []);
  const data = useSelector(
      (state) => state.workforce[`applicationsSummary`] ?? []
    );

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingApplications":
        return <FiledApplications />;
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

export default BlwfDeputyAsstDirectorDashboardPage;
