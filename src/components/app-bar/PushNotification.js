import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, decodeId, FormattedMessage, useHistory } from "@openimis/fe-core";
import { getUserTypeFromRights } from '../../utils/utils';
import { WORKFORCE_USER_TYPE } from '../../constants';

// MUI v4 Imports
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';

// Define styles including the glow animation
const useStyles = makeStyles((theme) => ({
  '@keyframes glow': {
    '0%': { 
        boxShadow: '0 0 0px rgba(25, 118, 210, 0)' 
    },
    '50%': { 
        boxShadow: '0 0 15px rgba(25, 118, 210, 0.8), 0 0 5px rgba(25, 118, 210, 0.5)' 
    },
    '100%': { 
        boxShadow: '0 0 0px rgba(25, 118, 210, 0)' 
    }
  },
  glowingIcon: {
    animation: '$glow 2s infinite alternate',
    borderRadius: '50%', // Ensures the shadow forms a perfect circle around the IconButton
    color: theme.palette.primary.main,
  },
  defaultIcon: {
    color: 'inherit', // Adjust based on your header's color scheme
  }
}));

// Mock functions: Replace these with your actual API/Redux action imports
const fetchNotificationData = async (userId) => {
  // Example implementation
  // const response = await api.get(`/notifications/${userId}`);
  // return response.data.count;
  return Promise.resolve(3); // Mocking 3 unread notifications
};

const updateNotificationData = async (userId) => {
  // Example implementation
  // await api.put(`/notifications/${userId}/read`);
  return Promise.resolve();
};

const PushNotification = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  
  const user_rights = useSelector((state) => state.core.user.i_user.rights);
  const userId = useSelector((state) => state.core?.user?.i_user?.id);
  const userType = getUserTypeFromRights(user_rights);

  // Local state to track the notification count
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notifications on mount and when userId changes
  useEffect(() => {
    if (userId && userType !== WORKFORCE_USER_TYPE.APPLICANT) {
      fetchNotificationData(userId)
        .then((count) => {
          setNotificationCount(count);
        })
        .catch((error) => {
          console.error("Failed to fetch notifications:", error);
        });
    }
  }, [userId, userType]);

  const handleNotificationClick = async () => {
    if (!userId) return;

    try {
      // Call update function
      await updateNotificationData(userId);
      
      // Clear the badge count after clicking
      setNotificationCount(0);
      
      // Optional: Open a popper/menu or redirect to a notifications page
      // history.push('/notifications');
    } catch (error) {
      console.error("Failed to update notifications:", error);
    }
  };

  if (userType === WORKFORCE_USER_TYPE.APPLICANT) {
    return <></>;
  }

  const hasNotifications = notificationCount > 0;

  return (
    <IconButton 
      onClick={handleNotificationClick}
      className={hasNotifications ? classes.glowingIcon : classes.defaultIcon}
      aria-label="show new notifications"
      color="inherit"
    >
      <Badge badgeContent={notificationCount} style={{color:"white"}}>
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default PushNotification;