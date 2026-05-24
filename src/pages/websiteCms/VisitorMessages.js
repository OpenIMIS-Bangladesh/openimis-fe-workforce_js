import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Box,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EmailIcon from "@material-ui/icons/Email";
import PhoneIcon from "@material-ui/icons/Phone";
import PersonIcon from "@material-ui/icons/Person";
import MessageIcon from "@material-ui/icons/Message";
import TodayIcon from "@material-ui/icons/Today";

import { fetchWebsiteVisitorMessages } from "../../actions";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    background: "#f5f7fb",
    minHeight: "100vh",
  },

  headerCard: {
    padding: theme.spacing(3),
    borderRadius: 20,
    marginBottom: theme.spacing(3),
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },

  title: {
    fontWeight: 700,
    fontSize: 28,
    marginBottom: theme.spacing(1),
  },

  subtitle: {
    opacity: 0.85,
    fontSize: 14,
  },

  statsCard: {
    padding: theme.spacing(2),
    borderRadius: 18,
    background: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    textAlign: "center",
    height: "100%",
  },

  statsValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
  },

  statsLabel: {
    fontSize: 14,
    color: "#64748b",
  },

  tableContainer: {
    marginTop: theme.spacing(3),
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
  },

  tableHeader: {
    background: "#0f172a",
  },

  headerCell: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
  },

  tableRow: {
    transition: "all 0.2s ease",
    "&:hover": {
      background: "#f8fafc",
    },
  },

  visitorBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    background: "#2563eb",
    width: 42,
    height: 42,
    fontWeight: 700,
  },

  visitorName: {
    fontWeight: 600,
    color: "#0f172a",
  },

  contactLink: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#2563eb",
    fontWeight: 500,

    "&:hover": {
      textDecoration: "underline",
    },
  },

  messageBox: {
    maxWidth: 350,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#334155",
  },

  emptyBox: {
    padding: theme.spacing(6),
    textAlign: "center",
    background: "#fff",
    borderRadius: 20,
  },

  chip: {
    fontWeight: 600,
  },

  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(6),
  },
}));

const VisitorMessages = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [visitorMessages, setVisitorMessages] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
    dispatch(fetchWebsiteVisitorMessages()).then((response) => {
      console.log("Visitor Messages Response:", response);
      setVisitorMessages(response?.payload?.data?.websiteVisitorMessages || []);
    });
    setLoading(false);
  }, [dispatch]);

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Paper className={classes.headerCard} elevation={0}>
        <Grid container>
            <Grid item md={8}>
                <Typography className={classes.title}>
                Website Visitor Messages
                </Typography>

                <Typography className={classes.subtitle}>
                Reply to your website visitors with email and contact number from here (Latest Records are at the top).
                </Typography>
            </Grid>
                  {/* Stats */}
            <Grid item md={4}>
            <Paper className={classes.statsCard}>
                <Typography className={classes.statsValue}>
                {visitorMessages?.length || 0}
                </Typography>
                <Typography className={classes.statsLabel}>
                Total Messages
                </Typography>
            </Paper>
            </Grid>
        </Grid>
      </Paper>



      {/* Loading */}
      {loading && (
        <Box className={classes.loadingBox}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && (!visitorMessages || visitorMessages.length === 0) && (
        <Box className={classes.emptyBox} style={{ marginTop: 24 }}>
          <Typography variant="h6" gutterBottom>
            No Visitor Messages Found
          </Typography>

          <Typography color="textSecondary">
            Visitor messages from your website will appear here.
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && visitorMessages?.length > 0 && (
        <TableContainer
          component={Paper}
          className={classes.tableContainer}
          style={{ marginTop: 24 }}
        >
          <Table>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell className={classes.headerCell}>
                  Visitor
                </TableCell>

                <TableCell className={classes.headerCell}>
                  Email
                </TableCell>

                <TableCell className={classes.headerCell}>
                  Phone
                </TableCell>

                <TableCell className={classes.headerCell}>
                  Message
                </TableCell>

                <TableCell className={classes.headerCell}>
                  Date
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visitorMessages.map((item, index) => (
                <TableRow key={item.id || index} className={classes.tableRow}>
                  {/* Visitor */}
                  <TableCell>
                    <Box className={classes.visitorBox}>
                      <Avatar className={classes.avatar}>
                        {item?.visitorName?.charAt(0)?.toUpperCase() || "V"}
                      </Avatar>

                      <Box>
                        <Typography className={classes.visitorName}>
                          {item.visitorName}
                        </Typography>

                        <Chip
                          size="small"
                          icon={<PersonIcon />}
                          label="Visitor"
                          className={classes.chip}
                        />
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <Tooltip title="Send Email">
                      <a
                        href={`mailto:${item.visitorEmail}`}
                        className={classes.contactLink}
                      >
                        <EmailIcon fontSize="small" />
                        {item.visitorEmail}
                      </a>
                    </Tooltip>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <Tooltip title="Call Number">
                      <a
                        href={`tel:${item.visitorNumber}`}
                        className={classes.contactLink}
                      >
                        <PhoneIcon fontSize="small" />
                        {item.visitorNumber}
                      </a>
                    </Tooltip>
                  </TableCell>

                  {/* Message */}
                  <TableCell>
                    <Box display="flex" alignItems="flex-start" gridGap={8}>
                      <MessageIcon
                        fontSize="small"
                        style={{ marginTop: 2, color: "#64748b" }}
                      />

                      <Typography
                        variant="body2"
                        className={classes.messageBox}
                      >
                        {item.visitorMessage}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gridGap={6}>
                      <TodayIcon
                        fontSize="small"
                        style={{ color: "#64748b" }}
                      />

                      <Typography variant="body2">
                        {item.dateCreated
                          ? new Date(item.dateCreated).toLocaleString()
                          : "-"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default VisitorMessages;