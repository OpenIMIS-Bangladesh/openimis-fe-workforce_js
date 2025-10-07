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
  useHistory,FormattedMessage
} from "@openimis/fe-core";

const styles = (theme) => ({
  root: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: theme.spacing(1),
    backgroundColor: "transparent",
    gap: theme.spacing(2),
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    cursor: "pointer",
    padding: "7px",
    borderRadius:"10px",
    "&:hover": {
      backgroundColor: "#517688",
      color: "#fff",
    },
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
  const reduxState = useSelector((state) => state);
  useEffect(() => {
    return dispatch(
      fetchWorkforceApplicationStatusCount()
    );
  }, []);
  const status_count = useSelector(
    (state) => state.workforce[`workforceApplicationStatusCount`]
  );

  console.log("Status Count in NotificationBar:", status_count);
  const status_data = {
    pending: status_count?.pending?.totalCount || 0,
    rejected: status_count?.rejected?.totalCount || 0,
    approved: status_count?.approved?.totalCount || 0,
    pendingForDirector: status_count?.pendingForDirector?.totalCount || 0,
    rejectedForDirector: status_count?.rejectedForDirector?.totalCount || 0,
    approvedForDirector: status_count?.approvedForDirector?.totalCount || 0,
    pendingForFactoryAdmin: status_count?.pendingForFactoryAdmin?.totalCount || 0,
    rejectedForFactoryAdmin: status_count?.rejectedForFactoryAdmin?.totalCount || 0,
    revertedForFactoryAdmin: status_count?.revertedForFactoryAdmin?.totalCount || 0,
    pendingForBGMEAAssociation: status_count?.pendingForBGMEAAssociation?.totalCount || 0,
    rejectedForBGMEAAssociation: status_count?.rejectedForBGMEAAssociation?.totalCount || 0,
    revertedForBGMEAAssociation: status_count?.revertedForBGMEAAssociation?.totalCount || 0,
    pendingForBKMEAAssociation: status_count?.pendingForBKMEAAssociation?.totalCount || 0,
    rejectedForBKMEAAssociation: status_count?.rejectedForBKMEAAssociation?.totalCount || 0,
    revertedForBKMEAAssociation: status_count?.revertedForBKMEAAssociation?.totalCount || 0,
    pendingForSectionAdmin: status_count?.pendingForSectionAdmin?.totalCount || 0,
    rejectedForSectionAdmin: status_count?.rejectedForSectionAdmin?.totalCount || 0,
    revertedForSectionAdmin: status_count?.revertedForSectionAdmin?.totalCount || 0,
    pendingForChecker: status_count?.pendingForChecker?.totalCount || 0,
    pendingForCheckerTwo: status_count?.pendingForCheckerTwo?.totalCount || 0,
    pendingForDoctor: status_count?.pendingForDoctor?.totalCount || 0,
    pendingForApprover: status_count?.pendingForApprover?.totalCount || 0,

  }

  const data = [];
  const approveLabel = user_type === WORKFORCE_USER_TYPE.DIRECTOR ? "workforce.application.process.forwarded":"workforce.application.process.approved";

  if (user_type === WORKFORCE_USER_TYPE.APPLICANT) {
    return (<></>)
  }

  if (user_type === WORKFORCE_USER_TYPE.DIRECTOR) {
    data.pending = status_data.pendingForDirector;
    data.rejected = status_data.rejectedForDirector;
    data.approved = status_data.approvedForDirector;
  } else if (user_type === WORKFORCE_USER_TYPE.ADMIN){
    data.pending = status_data.pending;
    data.rejected = status_data.rejected;
    data.approved = status_data.approved;
  } else if (user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN) {
    data.pending = status_data.pendingForFactoryAdmin;
    data.rejected = status_data.rejectedForFactoryAdmin;
    data.revert = status_data.revertedForFactoryAdmin;
  } else if (user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION) {
    data.pending = status_data.pendingForBGMEAAssociation;
    data.rejected = status_data.rejectedForBGMEAAssociation;
    data.revert = status_data.revertedForBGMEAAssociation;
  } else if (user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION) {
    data.pending = status_data.pendingForBKMEAAssociation;
    data.rejected = status_data.rejectedForBKMEAAssociation;
    data.revert = status_data.revertedForBKMEAAssociation;
  } else if (user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN) {
    data.pending = status_data.pendingForSectionAdmin;
    data.rejected = status_data.rejectedForSectionAdmin;
    data.revert = status_data.revertedForSectionAdmin;
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER) {
    data.pending = status_data.pendingForChecker;
  } else if (user_type === WORKFORCE_USER_TYPE.CHECKER_TWO) {
    data.pending = status_data.pendingForCheckerTwo;
  } else if (user_type === WORKFORCE_USER_TYPE.DOCTOR) {
    data.pending = status_data.pendingForDoctor;
  } else if (user_type === WORKFORCE_USER_TYPE.APPROVER) {
    data.pending = status_data.pendingForApprover;

  }

  return (
    <Box className={classes.root}>
{(user_type === WORKFORCE_USER_TYPE.ADMIN || user_type === WORKFORCE_USER_TYPE.DIRECTOR) && (
          <>
      {/* Pending */}
      <Tooltip title="Pending Applications">
        <Box className={classes.item} 
        onClick={() => history.push("/home?status=pending")}
        // onClick={() => history.push("/workforce/applications/process?status=pending")}
          >
          <Badge badgeContent={data.pending || 0} color="primary">
            <HourglassEmptyIcon color="yellow" />
          </Badge>
          <Typography className={classes.label}><FormattedMessage module="workforce" id="workforce.application.process.pending" /></Typography>
        </Box>
      </Tooltip>

      {/* In Progress */}
      <Tooltip title="Rejected Applications">
        <Box className={classes.item} 
        // onClick={() => history.push("/workforce/applications/process?status=rejected")}
        onClick={() => history.push("/home?status=rejected")}
        >
          <Badge badgeContent={data.rejected || 0} color="primary">
            <RestorePageIcon color="red" />
          </Badge>
          <Typography className={classes.label}><FormattedMessage module="workforce" id="workforce.application.process.rejected" /></Typography>
        </Box>
      </Tooltip>

      {/* Verified */}
      <Tooltip title="Verified Applications">
        <Box className={classes.item} 
        onClick={() => history.push("/home?status=approved")}
        // onClick={() => history.push("/workforce/applications/process?status=approved")}
        >
          <Badge badgeContent={data.approved || 0} color="primary">
            <VerifiedUserIcon style={{ color: "#4caf50" }} />
          </Badge>
          <Typography className={classes.label}>  <FormattedMessage module="workforce" id={approveLabel} /></Typography>
          {/* <Typography className={classes.label}>  <FormattedMessage module="workforce" id="workforce.application.process.approved" /></Typography> */}
        </Box>
      </Tooltip>
      </>
    )}
{(user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN || user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
  || user_type === WORKFORCE_USER_TYPE.DOCTOR
) && (
          <>
      {/* Pending */}
      <Tooltip title="Pending Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.pending || 0} color="primary">
            <HourglassEmptyIcon color="yellow" />
          </Badge>
          <Typography className={classes.label}><FormattedMessage module="workforce" id="workforce.application.process.pending" /></Typography>
        </Box>
      </Tooltip>

      {/* In Progress */}
      <Tooltip title="Rejected Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.rejected || 0} color="primary">
            <RestorePageIcon color="red" />
          </Badge>
          <Typography className={classes.label}><FormattedMessage module="workforce" id="workforce.application.process.rejected" /></Typography>
        </Box>
      </Tooltip>

      {/* Verified */}
      <Tooltip title="Reverted Applications">
        <Box className={classes.item} >
          <Badge badgeContent={data.revert || 0} color="primary">
            <VerifiedUserIcon style={{ color: "#4caf50" }} />
          </Badge>
          <Typography className={classes.label}>  <FormattedMessage module="workforce" id="workforce.application.process.reverted" /></Typography>
        </Box>
      </Tooltip>
      </>
    )}
{(user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN
) && (
          <>
      {/* Pending */}
      <Tooltip title="Pending Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.pending || 0} color="primary">
            <HourglassEmptyIcon color="yellow" />
          </Badge>
          <Typography className={classes.label}><FormattedMessage module="workforce" id="workforce.application.process.pending" /></Typography>
        </Box>
      </Tooltip>

      {/* In Progress */}
      <Tooltip title="Rejected Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.rejected || 0} color="primary">
            <RestorePageIcon color="red" />
          </Badge>
          <Typography className={classes.label}><FormattedMessage module="workforce" id="workforce.application.process.rejected" /></Typography>
        </Box>
      </Tooltip>
      </>
    )}
{(user_type === WORKFORCE_USER_TYPE.DOCTOR || user_type === WORKFORCE_USER_TYPE.CHECKER || user_type === WORKFORCE_USER_TYPE.CHECKER_TWO
|| user_type === WORKFORCE_USER_TYPE.APPROVER) && (
          <>
      {/* Pending */}
      <Tooltip title="Pending Applications">
        <Box className={classes.item}>
          <Badge badgeContent={data.pending || 0} color="primary">
            <HourglassEmptyIcon color="yellow" />
          </Badge>
          <Typography className={classes.label}><FormattedMessage module="workforce" id="workforce.application.process.pending" /></Typography>
        </Box>
      </Tooltip>
      </>
    )}


    </Box>
  );
};

export default withStyles(styles)(NotificationBar);
