import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { getUserTypeFromRights, safeDecodeId } from '../../utils/utils';
import { STATUS_MAP_BN, STATUS_MAP_EN, WORKFORCE_USER_TYPE } from '../../constants';
import { fetchNotificationData, updateNotification } from '../../actions';

// MUI v4 Imports
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

const POLL_INTERVAL_MS = 15000;

const useStyles = makeStyles((theme) => ({
  '@keyframes glow': {
    '0%': { boxShadow: '0 0 0px rgba(25, 118, 210, 0)' },
    '50%': { boxShadow: '0 0 15px rgba(25, 118, 210, 0.8), 0 0 5px rgba(25, 118, 210, 0.5)' },
    '100%': { boxShadow: '0 0 0px rgba(25, 118, 210, 0)' },
  },
  glowingIcon: {
    animation: '$glow 2s infinite alternate',
    borderRadius: '50%',
    color: theme.palette.common.white,
  },
  defaultIcon: {
    color: theme.palette.common.white,
  },
  bellIcon: {
    color: 'inherit',
  },
  menuPaper: {
    width: 360,
    maxHeight: 420,
    overflowY: 'auto',
    padding: 0,
  },
  notificationItem: {
    whiteSpace: 'normal',
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  notificationUnread: {
    backgroundColor: theme.palette.action.selected,
  },
  notificationRead: {
    backgroundColor: 'transparent',
  },
  notificationText: {
    display: 'block',
    wordBreak: 'break-word',
  },
  badge: {
    backgroundColor: '#f44336',
    color: '#ffffff',
  },
  statusText: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
  },
}));

const isNotificationRead = (notification) => {
  if (notification?.isRead === undefined || notification?.isRead === null) {
    return false;
  }
  return notification.isRead === true || notification.isRead === 'true';
};

const normalizeNotifications = (response) => {
  const raw = response?.payload?.data?.workforceNotifications;
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw;
  }
  return raw.edges?.map((edge) => edge.node) ?? [];
};

const PushNotification = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const userRights = useSelector((state) => state.core?.user?.i_user?.rights);
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || "en";
  const userId = useSelector((state) => state.core?.user?.i_user?.id);
  const userType = getUserTypeFromRights(userRights);

  const refreshNotifications = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const response = await dispatch(fetchNotificationData([`loggedInUserId:"${userId}"`]));
      const fetchedNotifications = normalizeNotifications(response);
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n) => !isNotificationRead(n)).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId || userType === WORKFORCE_USER_TYPE.APPLICANT) {
      return undefined;
    }

    refreshNotifications();
    intervalRef.current = setInterval(refreshNotifications, POLL_INTERVAL_MS);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [userId, userType, refreshNotifications]);

  const handleBellClick = (event) => {
    if (anchorEl) {
      setAnchorEl(null);
      return;
    }
    setAnchorEl(event.currentTarget);
    refreshNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markNotificationAsRead = async (notification) => {
    if (!notification || !notification.id || isNotificationRead(notification)) {
      return;
    }

    try {
      const payload={
        id: safeDecodeId(notification.id),
        isRead: true,
        userId: safeDecodeId(notification.user.id),
        status: notification.status,
        notification: notification.notification,
        notificationBn: notification.notificationBn,
        workforceApplicationId: safeDecodeId(notification.workforceApplication.id),
      };

      await dispatch(
        updateNotification(
          payload,
          'updateNotification'
        )
      );
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      window.location.href = window.location.origin + '/front/workforce/applications/application/verify/'+safeDecodeId(notification.workforceApplication.id);
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  if (userType === WORKFORCE_USER_TYPE.APPLICANT) {
    return null;
  }

  const hasNotifications = unreadCount > 0;

  return (
    <>
      <IconButton
        onClick={handleBellClick}
        className={hasNotifications ? classes.glowingIcon : classes.defaultIcon}
        aria-label="show notifications"
        color="inherit"
      >
        <Badge badgeContent={locale === "en" ? unreadCount : Number(unreadCount).toLocaleString("bn-BD")} classes={{ badge: classes.badge }}>
          <NotificationsIcon className={classes.bellIcon} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{ className: classes.menuPaper }}
      >
        <Box className={classes.menuHeader}>
          <Typography variant="subtitle1">{locale === "en" ? "Notifications" : "নোটিফিকেশন"}</Typography>
          {
            unreadCount > 0 && (
              <Typography variant="body2">{locale === "en" ? unreadCount : Number(unreadCount).toLocaleString("bn-BD")} {locale === "en" ? "unread" : "টি নোটিফিকেশন অপঠিত"}</Typography>
            )
          }
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary={locale === "en" ? "No notifications" : "কোনো নোটিফিকেশন নেই"} />
          </MenuItem>
        ) : (
          notifications.map((notification) => {
            const read = isNotificationRead(notification);
            return (
              <MenuItem
                key={notification.id}
                className={
                  `${classes.notificationItem} ${read ? classes.notificationRead : classes.notificationUnread}`
                }
                onClick={() => markNotificationAsRead(notification)}
              >
                <ListItemText
                  primary={
                    <Typography className={classes.notificationText} variant="body2">
                      {locale === "en" ? notification.notification || 'No message' : notification.notificationBn || 'No message'}
                    </Typography>
                  }
                  secondary={
                    notification.status ? (
                      <Typography className={classes.statusText} variant="caption">
                        {locale === "en" ? STATUS_MAP_EN[notification.status] : STATUS_MAP_BN[notification.status]}
                      </Typography>
                    ) : null
                  }
                />
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
};

export default PushNotification;
