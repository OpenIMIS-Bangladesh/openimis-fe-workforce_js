import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  Card,
  CardContent,
  Box,
} from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { FormattedMessage } from "@openimis/fe-core";

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(0),
    width: "100%",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
  },
  cardGridItem: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
});

const banglaLabels = {
  nameEn: "নাম (ইংরেজি)",
  nameBn: "নাম (বাংলা)",
  fatherNameEn: "পিতার নাম (ইংরেজি)",
  fatherNameBn: "পিতার নাম (বাংলা)",
  motherNameEn: "মাতার নাম (ইংরেজি)",
  motherNameBn: "মাতার নাম (বাংলা)",
  spouseName: "স্বামী/স্ত্রীর নাম",
  citizenship: "নাগরিকত্ব",
  nid: "এনআইডি",
  birthCertificate: "জন্ম সনদ",
  birthDate: "জন্ম তারিখ",
  insuranceNumber: "ইনসুরেন্স নম্বর",
  gender: "লিঙ্গ",
  maritalStatus: "বৈবাহিক অবস্থা",
  phoneNumber: "ফোন নম্বর",
  email: "ইমেইল",
  lifeStatus: "জীবিত অবস্থা",
  deathDate: "মৃত্যুর তারিখ",
  monthlyEarning: "মাসিক আয়",
  presentAddress: "বর্তমান ঠিকানা",
  permanentAddress: "স্থায়ী ঠিকানা",
  presentLocation: "বর্তমান এলাকা",
  permanentLocation: "স্থায়ী এলাকা",
  accountNumber: "অ্যাকাউন্ট নম্বর",
  accountHolderName: "হোল্ডারের নাম",
  routingNumber: "রাউটিং নম্বর",
  branch: "শাখা",
  cronicDiseaseType: "জটিল রোগের ধরন",
  grantAmount: "অনুদানের পরিমাণ",
  diagnosisDate: "রোগ নির্ণয়ের তারিখ",
  doctorName: "ডাক্তারের নাম",
  admitted: "হাসপাতালে ভর্তি",
  hospitalName: "হাসপাতালের নাম",
  admitDate: "ভর্তির তারিখ",
  releaseDate: "ছাড়পত্রের তারিখ",
  hospitalDoctorName: "হাসপাতালের ডাক্তার",
  accidentType: "দুর্ঘটনার ধরণ",
  accidentPlace: "দুর্ঘটনার স্থান",
  accidentDate: "দুর্ঘটনার তারিখ",
  accidentTime: "দুর্ঘটনার সময়",
  inOutsideFactory: "কারখানার ভিতরে/বাইরে",
  reJoiningDate: "পুনঃযোগদানের তারিখ",
  educationInstituteName: "শিক্ষা প্রতিষ্ঠানের নাম",
  studyingClass: "অধ্যয়নরত শ্রেণী",
  result: "ফলাফল",
  diagnosisDate: "রোগ নির্ণয়ের তারিখ",
  otherInfo: "অন্যান্য তথ্য",
  dateofReceipt: "গ্রহণের তারিখ",
  reasonforReceipt: "গ্রহণের কারণ",
  disabilityType: "প্রতিবন্ধিতার ধরণ",
  deathType: "মৃত্যুর ধরণ",
  scholarshipFor: "স্কলারশিপের উদ্দেশ্য"
};

const PreviewDetails = ({ formData = {}, classes, language = "en" }) => {
  const formatKey = (key) => {
    if (language === "fr" && banglaLabels[key]) return banglaLabels[key];
    return String(key)
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.length === 0
        ? "N/A"
        : value.map((item, idx) => (
            <Box key={idx} mb={0}>
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

  const renderNestedObject = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    return (
      <Box pl={1}>
        {Object.entries(obj)
          .filter(([k]) => !["id", "parent", "cronicDiseaseType"].includes(k))
          .map(([k, v], i) => (
            <Typography variant="body2" key={i}>
              <b>{formatKey(k)}:</b> {renderValue(v)}
            </Typography>
          ))}
      </Box>
    );
  };

  const renderSection = (title, data) => {
    if (!data || typeof data !== "object") return null;
    const filteredEntries = Object.entries(data).filter(
      ([k]) => !["id", "uuid", "parent", "workforceEmployer", "cronicDiseaseType"].includes(k)
    );
    if (filteredEntries.length === 0) return null;

    return (
      <Grid item xs={6} className={classes.cardGridItem} key={title}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FormattedMessage module="workforce" id={title} defaultMessage={formatKey(title)} />
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

  const renderArraySection = (title, arrayData) => {
    if (!Array.isArray(arrayData) || arrayData.length === 0) return null;
    const nonEmptyItems = arrayData.filter(
      (item) => item && typeof item === "object" && Object.keys(item).length > 0
    );
    if (nonEmptyItems.length === 0) return null;

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

  const renderWorkforceEmployeeSections = (employeeData) => {
  if (!employeeData || typeof employeeData !== "object") return null;

  const personalFields = [
    "nameEn", "nameBn", "fatherNameEn", "fatherNameBn",
    "motherNameEn", "motherNameBn", "spouseName", "spouseNameEn", "spouseNameBn",
    "citizenship", "nid", "birthCertificate", "birthCertificateNo",
    "birthDate", "insuranceNumber", "gender"
  ];
  const contactFields = [
    "email", "phoneNumber", "presentAddress", "permanentAddress",
    "presentLocation", "permanentLocation"
  ];
  const statusFields = [
    "birthDate", "deathDate", "lifeStatus", "maritalStatus", "monthlyEarning"
  ];
  const accidentFields = [
    "diagnosisDate", "hospitalName", "admitDate", "releaseDate", "hospitalDoctorName"
  ];

  const pickFields = (fields) =>
    fields.reduce((acc, field) => {
      if (employeeData[field] !== undefined) acc[field] = employeeData[field];
      return acc;
    }, {});

  const personalInfo = pickFields(personalFields);
  const contactInfo = pickFields(contactFields);
  const statusInfo = pickFields(statusFields);
  const accidentInfo = pickFields(accidentFields);
  const childrenInfo = formData?.employeeChildrenInfo;

  return (
    <>
      {renderSection("workforce.previewDetails.personalInfo", personalInfo)}
      {renderSection("workforce.previewDetails.statusInfo", statusInfo)}
      {renderSection("workforce.previewDetails.accidentInfo", accidentInfo)}
      {renderSection("workforce.previewDetails.contactInfo", contactInfo)}
      {childrenInfo && Object.keys(childrenInfo).length > 0 &&
        renderSection("workforce.previewDetails.employeeChildrenInfo", childrenInfo)}
    </>
  );
};


  const renderOthersInfoSection = () => {
    const primitiveFields = Object.entries(formData)
      .filter(
        ([key, value]) =>
          typeof value !== "object" &&
          !["id", "uuid", "parent", "applicationType", "organizationType", "applicationForSelf", "workforceEmployee"].includes(key)
      )
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    return renderSection("workforce.previewDetails.othersInfo", primitiveFields);
  };

  const renderDynamicSections = () => {
    return Object.entries(formData).map(([key, value]) => {
      if (!value || ["id", "uuid", "parent", "applicationType", "organizationType", "applicationForSelf"].includes(key)) return null;

      if (key === "workforceEmployee") {
        return renderWorkforceEmployeeSections(value);
      }

      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        return renderArraySection(key, value);
      }

      if (typeof value === "object" && value !== null) {
        return renderSection(`workforce.previewDetails.${key}`, value);
      }

      return null;
    });
  };

  return (
    <div className={classes?.container}>
      <Box p={0} className={classes?.paper}>
        <Grid container spacing={2}>
          {renderDynamicSections()}
          {renderOthersInfoSection()}
        </Grid>
      </Box>
    </div>
  );
};

export default connect()(withStyles(styles)(PreviewDetails));
