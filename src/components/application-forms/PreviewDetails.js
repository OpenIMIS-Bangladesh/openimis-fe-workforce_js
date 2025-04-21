import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import {
    Grid,
    Paper,
    Typography,
    Divider,
    IconButton,
    Card,
    CardContent,
    Box,
  } from "@material-ui/core";


const styles = (theme) => ({
    // paper: theme.paper.paper,
    paper: {
      padding: theme.spacing(1),
      width: 700,
      margin: "0 auto",
    },
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: "medium",
      fontWeight: "bold",
    },
    tableTitle: theme.table.title,
    item: theme.paper.item,
    fullHeight: {
      height: "100%",
    },
    overrideReadOnly: {
      "& .Mui-disabled": {
        color: `${theme.palette.text.primary} !important`, // Ensures text remains default color
      },
    },
  });

  const PreviewDetails = ({ formData = {}, classes }) => {
    const formatKey = (key) =>
      key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
  
    const renderValue = (value) => {
      if (Array.isArray(value)) {
        return value.length === 0
          ? "N/A"
          : value.map((item, idx) => (
              <Box key={idx} mb={1}>
                {typeof item === "object" ? renderNestedObject(item) : item}
              </Box>
            ));
      } else if (typeof value === "object" && value !== null) {
        if ("code" in value && "name" in value) {
          return `${value.name} (${value.code})`;
        }
        return renderNestedObject(value);
      } else {
        return value ?? "N/A";
      }
    };
  
    const renderNestedObject = (obj) => (
      <Box pl={1}>
        {Object.entries(obj).map(([k, v], i) => (
          <Typography variant="body2" key={i}>
            <b>{formatKey(k)}:</b> {renderValue(v)}
          </Typography>
        ))}
      </Box>
    );
  
    const renderSection = ( type, title, data) => (
      <Grid item xs={12} key={title}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {formatKey(title)}
            </Typography>
            <Divider style={{ marginBottom: "10px" }} />
            <Grid container spacing={2}>
              {Object.entries(data)
                .filter(([k]) => !["id", "uuid", "parent"].includes(k))
                .map(([key, value], idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Typography variant="body2">
                      <b>{formatKey(key)}:</b> {renderValue(value)}
                    </Typography>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  
    const renderArraySection = (title, arrayData) => (
      <Grid item xs={12} key={title}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {formatKey(title)}
            </Typography>
            <Divider style={{ marginBottom: "10px" }} />
            {arrayData.map((item, index) => (
              <Box key={index} mb={2} pl={1}>
                <Typography variant="subtitle2">
                  {formatKey(title)} #{index + 1}
                </Typography>
                {renderNestedObject(item)}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    );
  
    const renderDynamicSections = () => {
      return Object.entries(formData).map(([key, value]) => {
        if (!value || ["id", "uuid", "parent"].includes(key)) return null;
  
        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object") {
            return renderArraySection(key, value);
          }
        } else if (typeof value === "object") {
          return renderSection( key, value);
        } else {
          return renderSection("Application Info", { [key]: value });
        }
  
        return null;
      });
    };
  
    return (
      <div className={classes?.container}>
        <Box p={0} className={classes?.paper}>
          <Grid container spacing={2}>
            {renderDynamicSections()}
          </Grid>
        </Box>
      </div>
    );
  };

export default connect()(
  withStyles(styles)(PreviewDetails)
);
