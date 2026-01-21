import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { FormattedMessage, useModulesManager,parseData } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import HourglassFullTwoToneIcon from "@material-ui/icons/HourglassFullTwoTone";
import CheckCircleOutlineTwoToneIcon from "@material-ui/icons/CheckCircleOutlineTwoTone";
import ApplicationProcessSearcher from "../../components/application-process/ApplicationProcessSearcher";
import { fetchSummaryApplications } from "../../actions";
import { WORKFORCE_USER_TYPE} from "../../constants";
import { getUserType, getUserTypeFromRights } from "../../utils/utils";


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: "calc(100vh - 64px)",
    overflow: "hidden",
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

const SidebarMenu = [
  {
    id: "pendingMeetingSheet",
    text: (
      <FormattedMessage
        module="workforce"
        id="workforce.employee.application.meetingSheet"
      />
    ),
    icon: <HourglassFullTwoToneIcon />,
  },
  {
    id: "approveMeetingSheet",
    text: (
      <FormattedMessage
        module="workforce"
        id="workforce.application.forwarded"
      />
    ),
    icon: <CheckCircleOutlineTwoToneIcon />,
  },
];

// ----------- Components to Render in Main Content -----------

const FiledApplications = ({ summaryData = [], disableButtons = 0 }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);
  const [renderedData, setRenderedData] = useState(summaryData);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const user_type = getUserType();

  const handleChange = (panelId) => (event, isExpanded) => {
    if (isExpanded) {
      setRenderedData((prev) => {
        const clickedItem = prev.find((item) => item.id === panelId);
        const rest = prev.filter((item) => item.id !== panelId);
        return [clickedItem, ...rest];
      });
      setExpanded(panelId);
    } else {
      setExpanded(null);
    }
  };

  return (
    <div className={classes.accordionPadding}>
      <Typography variant="h5" gutterBottom>
         {user_type === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE && ( 
        <FormattedMessage
          module="workforce"
          id="workforce.eis.committe.dashboard"
        />
         )}
         {user_type === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE && ( 
        <FormattedMessage
          module="workforce"
          id="workforce.eis.association.committe.dashboard"
        />
         )}
      </Typography>

      {renderedData.map((item, index) => (
        <Accordion
          key={item.id}
          expanded={expanded === item.id}
          onChange={handleChange(item.id)}
          className={classes.accordion}
        >
          <AccordionSummary
            className={classes.accordionSummary}
            expandIcon={<ExpandMoreIcon className="material-icons" />}
          >
            <Typography variant="subtitle1" style={{ flex: 1 }}>
              <strong>{item.name}</strong>
            </Typography>
            <Typography
              variant="body2"
              style={{ marginLeft: "auto", color: "#015C63" }}
            >
              {item.meetingDate} | {item.month} {item.year}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <Card style={{ width: "100%" }}>
              <CardContent>
                {expanded === item.id && (
                  <ApplicationProcessSearcher
                    summaryId={item.id}
                    disableButtons={disableButtons}
                    loggedInUserId={loggedInUserId}
                    coloredRow={true}
                  />
                )}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

// ------------------------------------------------------------

const EisCommitteeDashboardPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [selectedMenu, setSelectedMenu] = useState("pendingMeetingSheet"); // Default first menu
  const [data,setData]= useState()
  useEffect(() => {
     dispatch(fetchSummaryApplications(modulesManager, ['organizationType:"eis"'])).then((res)=>{
        const response = parseData(res?.payload?.data?.applicationsSummary)
        console.log({response})
        setData(response)})
  }, []);

  // const data = useSelector(
  //   (state) => state.workforce[`applicationsSummary`] ?? []
  // );

  const pendingSummaryData = data?.filter(d => d.status === "forward_to_comiitee");
  const sentSummaryData = data?.filter(d => d.status === "forward_to_dg" || d.status ==='forward_to_director');

  const renderContent = () => {
    switch (selectedMenu) {
      case "pendingMeetingSheet":
        return (
          <FiledApplications summaryData={pendingSummaryData}/>
        );
      case "approveMeetingSheet":
        return <FiledApplications summaryData={sentSummaryData} disableButtons={1}/>;
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

export default EisCommitteeDashboardPage;
