import React, { useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Box, Badge, Typography, Tooltip } from "@material-ui/core";
import RestorePageIcon from '@material-ui/icons/RestorePage';
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { fetchWorkforceApplicationStatusCount } from "../../actions";
import { useDispatch, useSelector } from "react-redux";
import {
  useHistory,
} from "@openimis/fe-core";

const styles = (theme) => ({
  root: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: theme.spacing(1),
    backgroundColor: "transparent", // 👈 Transparent background
    gap: theme.spacing(2), // 👈 Reduced horizontal gap
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5), // 👈 Tighter icon/text spacing
  },
  label: {
    fontWeight: 500,
    fontSize: "0.875rem",
  },
});

const NotificationBar = ({ classes }) => {

  const user_type = getUserType();
  const history = useHistory();

  const dispatch = useDispatch();
  useEffect(() => {
    return dispatch(
      fetchWorkforceApplicationStatusCount()
    );
  }, []);
  const status_count = useSelector(
    (state) => state.workforce[`workforceApplicationStatusCount`]
  );

  const status_data = {
    pending: status_count?.pending?.totalCount || 0,
    rejected: status_count?.rejected?.totalCount || 0,
    approved: status_count?.approved?.totalCount || 0,
    pendingForDirector: status_count?.pendingForDirector?.totalCount || 0,
    rejectedForDirector: status_count?.rejectedForDirector?.totalCount || 0,
    approvedForDirector: status_count?.approvedForDirector?.totalCount || 0,
  }

  const data = [];

  if (user_type === WORKFORCE_USER_TYPE.APPLICANT) {
    return (<></>)
  }

  if (user_type === WORKFORCE_USER_TYPE.DIRECTOR) {
    data.pending = status_data.pendingForDirector;
    data.rejected = status_data.rejectedForDirector;
    data.approved = status_data.approvedForDirector;
  } else {
    data.pending = status_data.pending;
    data.rejected = status_data.rejected;
    data.approved = status_data.approved;
  }

  return (
    <Box className={classes.root}>
      {/* Pending */}
      <Tooltip title="Pending Applications">
        <Box className={classes.item} onClick={() => history.push("/workforce/applications/process?status=pending")}>
          <Badge badgeContent={data.pending || 0} color="primary">
            <HourglassEmptyIcon color="yellow" />
          </Badge>
          <Typography className={classes.label}>Pending</Typography>
        </Box>
      </Tooltip>

      {/* In Progress */}
      <Tooltip title="Rejected Applications">
        <Box className={classes.item} onClick={() => history.push("/workforce/applications/process?status=rejected")}>
          <Badge badgeContent={data.rejected || 0} color="primary">
            <RestorePageIcon color="red" />
          </Badge>
          <Typography className={classes.label}>Rejected</Typography>
        </Box>
      </Tooltip>

      {/* Verified */}
      <Tooltip title="Verified Applications">
        <Box className={classes.item} onClick={() => history.push("/workforce/applications/process?status=approved")}>
          <Badge badgeContent={data.approved || 0} color="primary">
            <VerifiedUserIcon style={{ color: "#4caf50" }} />
          </Badge>
          <Typography className={classes.label}>Approved</Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default withStyles(styles)(NotificationBar);
