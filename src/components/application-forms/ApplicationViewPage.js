import React, { useMemo } from "react";
import { Grid, Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Divider, Card, CardContent, Box } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  sidebar: {
    padding: theme.spacing(2),
    background: "#f5f5f5",
    borderRadius: 8,
  },
  accordion: {
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    textTransform: "capitalize",
  },
  titleColor: {
    background: "#B7D4D8",
  },
  itemRow: {
    marginBottom: theme.spacing(0.5),
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    color: "#222",
    wordBreak: "break-word",
  },
  nestedCard: {
    // marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    background: "#fafafa",
    borderRadius: 8,
  },
  label: {
    fontWeight: 450,
    color: "#333",
    marginRight: 6,
  },
}));

/**
 * Keys to hide from rendering
 */
const hiddenKeys = ["id", "uuid", "__typename", "applicationId", "parent"];

/**
 * Convert key into a user-friendly label
 */
const formatKey = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Try parsing JSON safely
 */
const tryParse = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

/**
 * Recursive renderer for objects & arrays in Grid format
 */
const renderDetails = (data, classes, parentKey = "") => {
  if (!data) return <Typography color="textSecondary">No data</Typography>;

  if (Array.isArray(data)) {
    return data.map((item, idx) => {
      if (typeof item !== "object" || !item) return null;

      // Separate scalars and objects inside this array item
      const scalars = Object.entries(item).filter(([key, value]) => typeof value !== "object" && !hiddenKeys.includes(key));
      const objects = Object.entries(item).filter(([key, value]) => typeof value === "object" && value && !hiddenKeys.includes(key));

      return (
        <Card key={idx} className={classes.nestedCard}>
          <CardContent>
            {/* Card Title */}
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold", fontSize: "large" }}>
              {formatKey(parentKey)} {idx + 1}
            </Typography>
            <Divider style={{ marginBottom: 12 }} />

            {/* ✅ Scalars at the top of the card */}
            <Grid container spacing={2}>
              {scalars.map(([key, value]) => (
                <Grid item xs={6} key={key} className={classes.itemRow}>
                  <Typography variant="body1" className={classes.value}>
                    <span className={classes.label}>{formatKey(key)}:</span> {value || "—"}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* ✅ Objects (nested sections) after scalars */}
            {objects.map(([key, value]) => (
              <Box key={key} mt={2}>
                <Typography
                  variant="subtitle1"
                  className={classes.label}
                  style={{
                    fontWeight: "bold",
                    fontSize: "large",
                    background: "#B7D4D8",
                    padding: 3,
                  }}
                >
                  {formatKey(key)}
                </Typography>
                {renderDetails(value, classes, key)}
              </Box>
            ))}
          </CardContent>
        </Card>
      );
    });
  }

  if (typeof data === "object") {
    return (
      <Grid container spacing={2}>
        {Object.entries(data)
          .filter(([key]) => !hiddenKeys.includes(key))
          .map(([key, value]) => {
            const parsedValue = tryParse(value);

            if (typeof parsedValue === "object" && parsedValue) {
              return (
                <Grid item xs={12} key={key}>
                  <Typography
                    variant="subtitle1"
                    className={classes.label}
                    style={{ fontWeight: "bold", fontSize: "large", background: "#B7D4D8", padding: 3 }}
                  >
                    {formatKey(key)}
                  </Typography>
                  {renderDetails(parsedValue, classes, key)}
                </Grid>
              );
            }
            return (
              <Grid item xs={6} key={key} className={classes.itemRow}>
                <Typography variant="body1" className={classes.value}>
                  <span className={classes.label}>{formatKey(key)}:</span> {parsedValue || "—"}
                </Typography>
              </Grid>
            );
          })}
      </Grid>
    );
  }

  return <Typography>{String(data)}</Typography>;
};

const ApplicationViewPage = ({ application }) => {
  const classes = useStyles();
  console.log({ view: application });
  // Sidebar summary fields
  const sidebarFields = useMemo(
    () => ({
      "Application Type": application.applicationType,
      "Organization Type": application.organizationType,
      "Tracking Number": application.trackingNumber,
      Status: application.status,
      "Submitted By": application.submittedBy,
      "Grant Amount": application.grantAmount,
      "Created Date": application?.createdAt || "—",
    }),
    [application]
  );

  return (
    <Grid container spacing={3} className={classes.root}>
      {/* Sidebar */}
      <Grid item xs={12} md={4}>
        <Paper className={classes.sidebar}>
          <Typography variant="h6" gutterBottom>
            Application Info
          </Typography>
          <Divider />
          <Box mt={2}>
            {Object.entries(sidebarFields).map(([label, value]) => (
              <Typography variant="body1" className={classes.value}>
                <span className={classes.label} style={{ fontWeight: "bold" }}>
                  {label}:
                </span>{" "}
                {value || "—"}
              </Typography>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Details Section */}
      <Grid item xs={12} md={8}>
        {Object.entries(application).map(([key, value]) => {
          // skip sidebar & hidden fields
          if (["applicationType", "organizationType", "trackingNumber", "status", "grantAmount", "submittedBy", "createdAt", ...hiddenKeys].includes(key))
            return null;

          const parsedValue = tryParse(value);

          return (
            <Accordion key={key} className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.sectionTitle}>{formatKey(key)}</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ display: "block" }}>{renderDetails(parsedValue, classes, key)}</AccordionDetails>
            </Accordion>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default ApplicationViewPage;
