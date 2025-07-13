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
  import {FormattedMessage} from "@openimis/fe-core";


  const styles = (theme) => ({
    paper: {
      padding: theme.spacing(0),
      width: "100%", // 🔥 full width
    },
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      width: "100%", // 🔥 full width
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
    cardGridItem: {
      display: "flex",
      flexDirection: "column",
    },
    card: {
      flex: 1, // 🔥 makes all cards same height inside grid
      display: "flex",
      flexDirection: "column",
    },
  });
  

  const PreviewDetails = ({ formData = {}, classes }) => {
    const formatKey = (key) =>
      String(key)
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());    
  
    const renderValue = (value) => {
      if (Array.isArray(value)) {
        return value.length === 0
          ? "N/A"
          : value.map((item, idx) => (
              <Box key={idx} mb={0}>
                {typeof item === "object" ? renderNestedObject(item) : item}
              </Box>
            ))
      } else if (typeof value === "object" && value !== null) {
        if ("code" in value && "name" in value) {
          return `${value.name} (${value.code})`;
        }
        return renderNestedObject(value);
      } else {
        return value ?? "N/A";
      }
    };
  
    const renderNestedObject = (obj) => {
      if (!obj || typeof obj !== "object") return null;
    
      return (
        <Box pl={1}>
          {Object.entries(obj).filter(([k]) => !["id", "parent","cronicDiseaseType"].includes(k)).map(([k, v], i) => (
            <Typography variant="body2" key={i}>
              <b>{formatKey(k)}:</b> {renderValue(v)}
            </Typography>
          ))}
        </Box>
      );
    };
    
  
    const renderSection = (title, data) => {
      if (!data || typeof data !== "object") return null;
    
      const filteredEntries = Object.entries(data)
        .filter(([k]) => !["id", "uuid", "parent", "workforceEmployer","cronicDiseaseType"].includes(k));
    
      if (filteredEntries.length === 0) return null; // 🚀 Don't render empty objects
    
      return (
        <Grid item xs={6} className={classes.cardGridItem} key={title}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <FormattedMessage module="workforce" id={title} />
              </Typography>
              <Divider style={{ marginBottom: "10px" }} />
              <Grid container spacing={2}>
                {filteredEntries.map(([key, value], idx) => (
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
    };

    const renderWorkforceEmployeeSections = (employeeData) => {
      if (!employeeData || typeof employeeData !== "object") return null;
    
      const personalFields = ["nameEn","nameBn","fatherNameEn","fatherNameBn", "motherNameEn","motherNameBn", "spouseName", "citizenship", "nid", "birthCertificate", "birthDate", "insuranceNumber", "gender"];
      const contactFields = ["email", "phoneNumber", "presentAddress", "permanentAddress", "presentLocation", "permanentLocation"];
      const statusFields = ["birthDate", "deathDate", "lifeStatus", "maritalStatus","monthlyEarning"];
      const accidentFields = [ "diagnosisDate", "hospitalName", "admitDate","releaseDate","hospitalDoctorName"];
      const childrenFields = ["nameEn","nameBn", "birthDate", "educationInstituteName","studyingClass","result","nid"];
    
      const pickFields = (fields) => {
        return fields.reduce((acc, field) => {
          if (employeeData[field] !== undefined) {
            acc[field] = employeeData[field];
          }
          return acc;
        }, {});
      };
    
      const omitFields = (data, fieldsToOmit) => {
        return Object.keys(data)
          .filter(key => !fieldsToOmit.includes(key) && !["id", "uuid", "parent"].includes(key))
          .reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {});
      };
    
      const personalInfo = pickFields(personalFields);
      const organizationInfo = omitFields(employeeData, [...personalFields, ...contactFields, ...statusFields]);
      const contactInfo = pickFields(contactFields);
      const statusInfo = pickFields(statusFields);
      const accidentInfo = pickFields(accidentFields);
      const childrenInfo = pickFields(childrenFields);
    
      return (
        <>
          {renderSection("workforce.previewDetails.personalInfo", personalInfo)}
          {/* {renderSection("Organization Info", organizationInfo)} */}
          {renderSection("workforce.previewDetails.statusInfo", statusInfo)}
          {renderSection("workforce.previewDetails.accidentInfo", accidentInfo)}
          {renderSection("workforce.previewDetails.contactInfo", contactInfo)}
          {renderSection("workforce.previewDetails.childrenInfo", childrenInfo)}
        </>
      );
    };
    
    
    
  
    const renderArraySection = (title, arrayData) => {
      if (!Array.isArray(arrayData) || arrayData.length === 0) return null;
    
      // Filter out completely empty objects
      const nonEmptyItems = arrayData.filter(
        (item) => item && typeof item === "object" && Object.keys(item).length > 0
      );
    
      if (nonEmptyItems.length === 0) return null; // 🚀 Don't render empty arrays
    
      return (
        <Grid item xs={6} className={classes.cardGridItem} key={title}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {formatKey(title)}
              </Typography>
              <Divider style={{ marginBottom: "10px" }} />
              {nonEmptyItems.map((item, index) => (
                <Box key={index} mb={1} pl={1}>
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
    };
    
    
  
    const renderDynamicSections = () => {
      return Object.entries(formData).map(([key, value]) => {
        if (!value || ["id", "uuid", "parent","applicationType","organizationType","applicationForSelf"].includes(key)) return null;
        if (key === "workforceEmployee") {
          return renderWorkforceEmployeeSections(value); // 🔥 special case
        }

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
