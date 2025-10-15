import React, { useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Box, Badge, Typography, Tooltip } from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
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

const UserInfo = ({ classes }) => {

  const user_type = getUserType();
  const history = useHistory();

  const dispatch = useDispatch();
  const reduxStateUserInfo = useSelector((state) => state.core.user.i_user);



  return (
    <Box className={classes.root}>
      <Box style={{ display: "flex", flexDirection: "column", flexWrap: "wrap",textAlign:"right" }}>
        <Typography>
          {/* <strong><FormattedMessage module="workforce" id="workforce.user.name" />:</strong>{" "} */}
          <strong>
            {/* {reduxStateUserInfo.other_names}  */}
            {reduxStateUserInfo.last_name}
          </strong>
        </Typography>

        <Typography>
          {/* <strong><FormattedMessage module="workforce" id="workforce.user.role" />:</strong>{" "} */}
          {user_type === WORKFORCE_USER_TYPE.ADMIN && (
            <FormattedMessage module="workforce" id="workforce.user.role.admin" defaultMessage="Admin" />
          )}
          {user_type === WORKFORCE_USER_TYPE.DIRECTOR && (
            <FormattedMessage module="workforce" id="workforce.user.role.director" defaultMessage="Director" />
          )}
          {user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && (
            <FormattedMessage module="workforce" id="workforce.user.role.factoryAdmin" defaultMessage="Factory Admin" />
          )}
          {user_type === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION && (
            <FormattedMessage module="workforce" id="workforce.user.role.bgmeaAssociation" defaultMessage="BGMEA Association" />
          )}
          {user_type === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION && (
            <FormattedMessage module="workforce" id="workforce.user.role.bkmeaAssociation" defaultMessage="BKMEA Association" />
          )}
          {user_type === WORKFORCE_USER_TYPE.SECTION_ADMIN && (
            <FormattedMessage module="workforce" id="workforce.user.role.sectionAdmin" defaultMessage="Section Admin" />
          )}
          {user_type === WORKFORCE_USER_TYPE.CHECKER && (
            <FormattedMessage module="workforce" id="workforce.user.role.checker" defaultMessage="Checker" />
          )}
          {user_type === WORKFORCE_USER_TYPE.CHECKER_TWO && (
            <FormattedMessage module="workforce" id="workforce.user.role.checkerTwo" defaultMessage="Checker Two" />
          )}
          {user_type === WORKFORCE_USER_TYPE.DOCTOR && (
            <FormattedMessage module="workforce" id="workforce.user.role.doctor" defaultMessage="Doctor" />
          )}
          {user_type === WORKFORCE_USER_TYPE.APPROVER && (
            <FormattedMessage module="workforce" id="workforce.user.role.approver" defaultMessage="Approver" />
          )}
          {user_type === WORKFORCE_USER_TYPE.APPLICANT && (
            <FormattedMessage module="workforce" id="workforce.user.role.applicant" defaultMessage="Applicant" />
          )}
        </Typography>
      </Box>
      <AccountCircleIcon/>


    </Box>
  );
};

export default withStyles(styles)(UserInfo);
