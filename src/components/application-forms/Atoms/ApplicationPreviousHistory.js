import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch,useSelector } from "react-redux";
import { withModulesManager, FormattedMessage, decodeId, TextInput } from "@openimis/fe-core";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import { fetchPrevApplicationHistory } from "../../../actions";
import { banglaLabels, STATUS_MAP_BN, STATUS_MAP_EN } from "../../../constants";
import { conditionalEnToBn } from "../../../utils/utils";

const useStyles = makeStyles((theme) => ({
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 150,
  },
  chipContainer: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
  },
  statusChip: {
    textTransform: "capitalize",
    fontWeight: "bold",
  },
  emptyText: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
}));

const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s?.includes("reject")) return "secondary";
  if (s?.includes("new") || s?.includes("forward") || s?.includes("approve")) return "primary";
  return "default";
};

const formatKey = (key, language) => {
  const cleanKey = key.split(".").pop();
  if (["fr", "bangla", "bd"].includes(language) && banglaLabels[cleanKey]) {
    return banglaLabels[cleanKey];
  }
  return cleanKey
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const ApplicationPreviousHistory = ({ open, onClose, application }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const language = useSelector((state) => state.core?.user?.i_user?.language);

  useEffect(() => {
    if (!application || !open) return;

    let isMounted = true;
    setLoading(true);

    const loadHistory = async () => {
      try {
        const filters = ["financialAssistance", "DeadlyGrant"].includes(application?.type)
          ? [`nid: "${application?.applicantInfo?.nid}"`, `getOtherApplicationList: true`, `applicationTypeIn:["${application?.applicationType}"]`]
          : [`nid: "${application?.workforceEmployee?.nid}"`, `getOtherApplicationList: true`, `applicationTypeIn:["${application?.applicationType}"]`];
        const res = await dispatch(fetchPrevApplicationHistory(filters));

        if (res?.payload?.data?.workforceCheckApplicationDuplicacy) {
          setHistory(res?.payload?.data?.workforceCheckApplicationDuplicacy);
        }
      } catch (error) {
        console.error("Failed to fetch application history:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [application, open, dispatch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle><FormattedMessage id="workforce.previous.history.list" /></DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box className={classes.loaderContainer}>
            <CircularProgress size={30} />
          </Box>
        ) : history.length === 0 ? (
          <Typography className={classes.emptyText} color="textSecondary">
            No previous history found.
          </Typography>
        ) : (
          <List disablePadding>
            {history.map((app, index) => (
              <React.Fragment key={app.id}>
                <ListItem>
                  <ListItemText
                    primary={`${formatKey("OrganizationType",language)}: ${formatKey(app?.organizationType,language)}`}
                    secondary={`${formatKey("appliedOn",language)}: ${conditionalEnToBn(app?.dateCreated?.split("T")[0] || "—", language)}`}
                  />
                  <Box className={classes.chipContainer}>
                    <Chip label={language === "en" ? STATUS_MAP_EN[app.status] : STATUS_MAP_BN[app?.status]} color={getStatusColor(app.status)} size="small" className={classes.statusChip} />
                  </Box>
                </ListItem>
                {index < history.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationPreviousHistory;
