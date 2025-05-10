import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Box, Badge, Typography, Tooltip } from "@material-ui/core";
import MailIcon from "@material-ui/icons/Mail";
import RestorePageIcon from '@material-ui/icons/RestorePage';
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";

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
    const data = {
        pending: 10,
        inProgress: 2,
        verified: 20,
        checked: 4,
      }
      const user_type = getUserType();

  if (user_type === WORKFORCE_USER_TYPE.APPLICANT) {
    return ( <></>)
  }

  return (
    <Box className={classes.root}>
      {/* Pending */}
      <Tooltip title="Pending Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.pending || 0} color="primary">
            <HourglassEmptyIcon color="white" />
          </Badge>
          <Typography className={classes.label}>Pending</Typography>
        </Box>
      </Tooltip>

      {/* In Progress */}
      <Tooltip title="Rejected Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.inProgress || 0} color="primary">
            <RestorePageIcon color="white" />
          </Badge>
          <Typography className={classes.label}>Rejected</Typography>
        </Box>
      </Tooltip>

      {/* Verified */}
      <Tooltip title="Verified Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.verified || 0} color="primary">
            <VerifiedUserIcon style={{ color: "#4caf50" }} />
          </Badge>
          <Typography className={classes.label}>Verified</Typography>
        </Box>
      </Tooltip>

      {/* Checked */}
      <Tooltip title="Checked Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.checked || 0} color="primary">
            <CheckCircleIcon style={{ color: "#ff9800" }} />
          </Badge>
          <Typography className={classes.label}>Checked</Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default withStyles(styles)(NotificationBar);
