import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
// Added Checkbox to imports
import { Paper, Typography, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, Button, Divider, Checkbox } from "@material-ui/core";
import ReactToPrint from "react-to-print";
import PrintIcon from "@material-ui/icons/Print";
import CloseIcon from "@material-ui/icons/Close";

// --- ROBUST STYLES FOR PRINTING (NO CHANGES) ---
const useStyles = makeStyles({
  "@global": {
    fontSize: "small",
    "@media all": {
      ".page-break": {
        display: "none",
      },
    },

    "@media print": {
      "html, body": {
        height: "initial !important",
        overflow: "initial !important",
        WebkitPrintColorAdjust: "exact",
      },

      ".page-break": {
        marginTop: "1rem",
        display: "block",
        pageBreakBefore: "auto",
      },

      "table, tr, td, th": {
        pageBreakInside: "avoid !important",
      },
      "div, p, section, article, header, footer, main": {
        pageBreakInside: "avoid !important",
      },

      ".MuiGrid-container": {
        pageBreakInside: "avoid !important",
      },

      ".MuiTable-root": {
        pageBreakInside: "avoid !important",
      },

      "@page": {
        size: "auto",
        margin: "20mm",
      },
    },
  },

  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "scroll",
  },
  modalContent: {
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    padding: "16px",
    width: "90%",
    maxWidth: "210mm",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  printControls: {
    textAlign: "right",
    marginBottom: "16px",
    paddingRight: "16px",
  },
  paper: {
    fontFamily: "'Siyam Rupali', Arial, sans-serif",
    padding: "32px",
    color: "#000",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
  headerContainer: {
    marginBottom: "16px",
    position: "relative",
  },
  logo: {
    maxWidth: "70px",
    maxHeight: "70px",
  },
  headerText: {
    textAlign: "center",
  },
  title: {
    fontSize: "small",
    fontWeight: "bold",
    textAlign: "center",
    margin: "8px 0 5px 0",
    textDecoration: "underline",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: "small",
    marginTop: "8px",
    marginBottom: "4px",
    borderBottom: "1px solid #000",
    paddingBottom: "4px",
  },
  fieldValue: {
    borderBottom: "1px dotted #000",
    minHeight: "20px",
    paddingLeft: "8px",
    width: "100%",
    display: "block",
    fontSize: "0.9rem",
  },
  fieldLabel: {
    textAlign: "left",
    fontSize: "0.9rem",
    paddingRight: "8px",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: "16px",
  },
  checkbox: {
    width: "15px",
    height: "15px",
    border: "1px solid #000",
    marginRight: "4px",
    display: "inline-block",
    backgroundColor: "transparent",
  },
  checked: {
    backgroundColor: "#000",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "black",
    marginTop: "8px",
    "& th, & td": {
      border: "1px solid #000",
      padding: "8px",
      textAlign: "left",
      verticalAlign: "top",
    },
    "& th": {
      fontWeight: "bold",
      backgroundColor: "#f0f0f0",
      textAlign: "center",
    },
  },
  signatureBox: {
    marginTop: "40px",
    paddingTop: "8px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  signatureItem: {
    width: "30%",
    textAlign: "center",
    borderTop: "1px solid #000",
    paddingTop: "8px",
    fontSize: "0.8rem",
  },
  photoBox: {
    border: "1px solid #000",
    width: "120px",
    height: "140px",
    textAlign: "center",
    padding: "8px",
    fontSize: "12px",
    lineHeight: "1.2",
    position: "absolute",
    right: 0,
    top: "60px",
  },
  note: {
    fontSize: "0.85rem",
    marginTop: "8px",
    marginBottom: "8px",
  },
  list: {
    listStyleType: "disc",
    paddingLeft: "24px",
    "& li": {
      marginBottom: "4px",
      fontSize: "0.9rem",
    },
  },
  documentPage: {
    textAlign: "center",
  },
  documentTitle: {
    marginBottom: "16px",
    textDecoration: "underline",
  },
  documentImage: {
    maxWidth: "100%",
    height: "auto",
    maxHeight: "900px",
  },
});

// --- HELPER FUNCTIONS ---
const safeJsonParse = (str) => {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (e) {
    return {};
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString;
  }
};

const formatAddress = (locationData, addressInput) => {
  let address = {};
  if (typeof addressInput === 'string') {
     address = safeJsonParse(addressInput);
  } else if (typeof addressInput === 'object' && addressInput !== null) {
     address = addressInput;
  }

  const postOffice = address?.postOffice?.nameBn || address?.postOffice?.nameEn;
  const village = [address?.houseName, address?.paraMahalla, address?.villageRoad].filter(Boolean).join(", ") || locationData?.name;
  const thana = locationData?.parent?.name;
  const district = locationData?.parent?.parent?.name;

  return {
    village: village || "N/A",
    postOffice: postOffice || "N/A",
    thana: thana || "N/A",
    district: district || "N/A",
  };
};

const translateRelation = (relationKey) => {
    const map = {
        "workforce.relation.father": "পিতা",
        "workforce.relation.mother": "মাতা",
        "workforce.relation.wife": "স্ত্রী",
        "workforce.relation.husband": "স্বামী",
        "workforce.relation.son": "পুত্র",
        "workforce.relation.daughter": "কন্যা",
        "workforce.relation.brother": "ভাই",
        "workforce.relation.sister": "বোন"
    };
    return map[relationKey] || relationKey;
};

export function DeathApplicationPrint({ printRef, data, documents, logoLeftUrl, logoLeft }) {
  const classes = useStyles();
  
  if (!data) return <p>আবেদনের কোনো তথ্য পাওয়া যায়নি।</p>;

  const { workforceEmployee, employeeBankInfo, employeeFactory, dateCreated, applicantInfo, deceasedWorkerInfo, metadata, movementLogs = [] } = data;

  // --- 1. APPLICANT INFO ---
  const applicantName = applicantInfo?.nameBn || applicantInfo?.nameEn || "N/A";
  const applicantRelation = translateRelation(applicantInfo?.relationWithApplicant) || "N/A";
  const applicantNid = applicantInfo?.nid || "N/A";
  const applicantDOB = applicantInfo?.birthDate || "N/A";
  const applicantMobile = applicantInfo?.phoneNumber || "N/A";

  const appPermLoc = applicantInfo?.permanentLocation;
  const appPermAddrObj = applicantInfo?.permanentAddress;
  const applicantPermanentAddress = formatAddress(appPermLoc, appPermAddrObj);

  const appPresLoc = applicantInfo?.presentLocation;
  const appPresAddrObj = applicantInfo?.presentAddress;
  const applicantPresentAddress = formatAddress(appPresLoc, appPresAddrObj);

  // --- 3. DECEASED WORKER INFO ---
  const deceasedName = deceasedWorkerInfo?.nameBn || deceasedWorkerInfo?.nameEn || "N/A";
  const deceasedFatherName = deceasedWorkerInfo?.fatherNameBn || deceasedWorkerInfo?.fatherNameEn || "N/A";
  const deceasedMotherName = deceasedWorkerInfo?.motherNameBn || deceasedWorkerInfo?.motherNameEn || "N/A";
  const deceasedPosition = workforceEmployee?.position || "N/A"; 
  const deceasedNid = deceasedWorkerInfo?.nid || "N/A";
  
  const deathDate = metadata?.deathDate || data?.employeeAccidentInfo?.dateOfDeath || "N/A";
  const gender = workforceEmployee?.gender; 

  const decPermLoc = deceasedWorkerInfo?.permanentLocation;
  const decPermAddrObj = deceasedWorkerInfo?.permanentAddress;
  const deceasedPermanentAddress = formatAddress(decPermLoc, decPermAddrObj);

  // Checkbox logic based on metadata
  const isNormalDeath = metadata?.deathType === "normalDeath";

  const createdDate = formatDate(dateCreated);

  const requiredAttachments = [
    { label: "রেজিস্টার্ড চিকিৎসক/ ইউনিয়ন পরিষদ / পৌরসভা বা সিটি কর্পোরেশন কর্তৃক প্রদত্ত মৃত্যু সনদ (মূলকপি)", checked: true },
    { label: "মৃত শ্রমিকের নিয়োগপত্র", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত আইডি কার্ড", checked: true },
    { label: "ইউনিয়ন পরিষদ / পৌরসভা বা সিটি কর্পোরেশন হতে ওয়ারিশান সনদ (মূলকপি)", checked: true },
    { label: "মৃত শ্রমিকের জাতীয় পরিচয়পত্র এবং ছবি", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত প্রত্যয়ন পত্র (শ্রমিকের সকল তথ্যসহ)", checked: true },
    { label: "নমিনীর জাতীয় পরিচয়পত্র/ জন্মসনদ এবং ছবি", checked: true },
    { label: "মৃত শ্রমিকের শেষ ছয় মাসের বেতন শীটের কপি", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত প্রত্যয়ন পত্র (নমিনীর সকল তথ্যসহ)", checked: true },
    { label: "নমিনীর ব্যাংক হিসাবের চেক বা স্টেটমেন্টের কপি", checked: true },
    { label: "প্রতিষ্ঠানের মেম্বারশীপ সনদপত্র", checked: true },
    { label: "মৃত শ্রমিকের অনলাইন ডেটাবেজের কপি", checked: true },
  ];

  return (
    <>
      <Paper id="print-container" className={`${classes.paper} printable-paper`}>
        <Box position="relative">
          {/* Header */}
          <Grid container alignItems="center" className={classes.headerContainer}>
            <Grid item xs={2} style={{ textAlign: "left" }}>
              {logoLeft && <img src={logoLeft} alt="Govt Logo" className={classes.logo} />}
            </Grid>
            <Grid item xs={8} className={classes.headerText}>
              {logoLeftUrl && <img src={logoLeftUrl} alt="Govt Logo" className={classes.logo} />}
              <Typography variant="body1" style={{ marginTop: "4px" }}>
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
              </Typography>
              <Typography variant="body1">{data?.organizationType ==="cf"?"কেন্দ্রীয় তহবিল":data?.organizationType==="eis"?"ই.আই.এস.":"বাংলাদেশ শ্রমিক কল্যাণ ফাউন্ডেশন"}</Typography>
              <Typography variant="body1">শ্রম ও কর্মসংস্থান মন্ত্রণালয়</Typography>
              <Typography variant="body2">২১ তলা, ভবন নং: ৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০।</Typography>
              <Typography variant="body2" style={{ color: "blue" }}>
                www.centralfund.gov.bd
              </Typography>
            </Grid>
            <Grid item xs={2}>
              {/* Photo Box */}
              <Box className={classes.photoBox}>
                শ্রমিক ও তার <br /> ওয়ারিশাণের পাসপোর্ট <br /> সাইজের ১ (এক) কপি <br /> করে ছবি
              </Box>
            </Grid>
          </Grid>

          {/* Title */}
          <Typography className={classes.title}>মৃত্যুজনিত কারণে আর্থিক সহায়তার আবেদন ফরম</Typography>
          <Typography variant="body2" style={{ textAlign: "center" }}>
            (শতভাগ রপ্তানিমুখি শিল্প কারখানায় কর্মরত শ্রমিকের ওয়ারিশান/ওয়ারিশানদের জন্য)
          </Typography>
          <Typography variant="body1" style={{ textAlign: "left" }}>
            বরাবর
          </Typography>
          <Typography variant="body1" style={{ textAlign: "left" }}>
            মহাপরিচালক
          </Typography>
          <Typography variant="body1" style={{ textAlign: "left" }}>
            কেন্দ্রীয় তহবিল
          </Typography>

          {/* Financial Assistance Reason - MODIFIED SECTION */}
          <Typography className={classes.sectionTitle}>আর্থিক সহায়তা চাওয়ার কারণঃ- সংশ্লিষ্ট ক্ষেত্রে টিক চিহ্ন (✓) দিন</Typography>
          <Box display="flex" style={{ marginBottom: "8px" }}>
            <Box className={classes.checkboxContainer}>
              <Checkbox
                checked={!isNormalDeath}
                color="default"
                size="small"
                style={{ padding: 0, paddingRight: "4px", color: "black" }} 
              />
              <Typography variant="body1">(খ) দুর্ঘটনাজনিত কারণে মৃত্যু</Typography>
            </Box>
            <Box className={classes.checkboxContainer}>
              <Checkbox
                checked={isNormalDeath}
                color="default"
                size="small"
                style={{ padding: 0, paddingRight: "4px", color: "black" }}
              />
              <Typography variant="body1">(ক) স্বাভাবিক মৃত্যু</Typography>
            </Box>
          </Box>
          <Typography className={classes.note} style={{ marginTop: 0 }}>
            বিঃদ্রঃ আবেদনের সময়সীমা মৃত্যুর ১২০ দিনের মধ্যে হতে হবে।
          </Typography>

          {/* Section 1: Applicant/Warishan Info */}
          <Typography className={classes.sectionTitle}>১। আবেদনকারী ব্যক্তিগত তথ্যবলীঃ-</Typography>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>নামঃ</Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography className={classes.fieldValue}>{applicantName}</Typography>
            </Grid>

            <Grid item xs={3}>
              <Typography className={classes.fieldLabel}>মৃত শ্রমিকের সাথে সম্পর্কঃ</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
            </Grid>

            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>জন্ম তারিখঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{formatDate(applicantDOB)}</Typography>
            </Grid>

            <Grid item xs={5}>
              <Typography className={classes.fieldLabel}>জাতীয় পরিচয়পত্র/ জন্ম সনদ নাম্বারঃ</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography className={classes.fieldValue}>{applicantNid}</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography className={classes.fieldLabel}>মোবাইল নাম্বর (আবশ্যিক):-</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography className={classes.fieldValue}>{applicantMobile}</Typography>
            </Grid>
          </Grid>

          <Typography style={{ marginTop: "8px", fontWeight: "bold" }}>স্থায়ী ঠিকানাঃ</Typography>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>গ্রাম/মহল্লাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPermanentAddress.village}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>ডাকঘরঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPermanentAddress.postOffice}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>থানা/উপজেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPermanentAddress.thana}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>জেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPermanentAddress.district}</Typography>
            </Grid>
          </Grid>

          <Typography style={{ marginTop: "8px", fontWeight: "bold" }}>বর্তমান ঠিকানাঃ-</Typography>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>গ্রাম/মহল্লাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPresentAddress.village}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>ডাকঘরঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPresentAddress.postOffice}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>থানা/উপজেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPresentAddress.thana}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>জেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{applicantPresentAddress.district}</Typography>
            </Grid>
          </Grid>

          {/* Section 2: Factory Info */}
          <Typography className={classes.sectionTitle}>২। মৃত শ্রমিকের কর্মরত প্রতিষ্ঠানের / কারখানার নাম ও ঠিকানা (স্পষ্ট অক্ষরে) লিখুনঃ-</Typography>
          <Typography className={classes.fieldValue}>{employeeFactory?.nameBn || employeeFactory?.nameEn || "N/A"}</Typography>
          <Typography className={classes.fieldValue} style={{ marginTop: "5px" }}>
            {/* Factory Address */}
          </Typography>

          {/* Section 3: Deceased Worker's Info */}
          <Typography className={classes.sectionTitle}>৩। মৃত শ্রমিকের বিবরণঃ-</Typography>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>নামঃ</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography className={classes.fieldValue}>{deceasedName}</Typography>
            </Grid>
            <Grid item xs={3} container alignItems="center">
              <Box className={classes.checkboxContainer}>
                <Box className={`${classes.checkbox} ${gender === "M" || gender === "workforce.gender.male" ? classes.checked : ""}`} />
                পুরুষ
              </Box>
              <Box className={classes.checkboxContainer}>
                <Box className={`${classes.checkbox} ${gender === "F" || gender === "workforce.gender.female" ? classes.checked : ""}`} style={{ marginLeft: "8px" }} />
                নারী
              </Box>
            </Grid>

            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>পিতার নামঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{deceasedFatherName}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>মাতার নামঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{deceasedMotherName}</Typography>
            </Grid>

            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>পদবিঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{deceasedPosition}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>মৃত্যুর তারিখঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{formatDate(deathDate)}</Typography>
            </Grid>

            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>মৃত্যুর কারণঃ</Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography className={classes.fieldValue}>
                  {isNormalDeath ? "স্বাভাবিক মৃত্যু" : "দুর্ঘটনা"} (প্রাসঙ্গিক প্রমাণপত্র অনুযায়ী)
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography className={classes.fieldLabel}>জাতীয় পরিচয় পত্র/জন্ম সনদ পত্রের নাম্বারঃ</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography className={classes.fieldValue}>{deceasedNid}</Typography>
            </Grid>
          </Grid>

          <Typography style={{ marginTop: "8px" }}>স্থায়ী ঠিকানাঃ</Typography>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>গ্রাম/মহল্লাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{deceasedPermanentAddress.village}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>ডাকঘরঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{deceasedPermanentAddress.postOffice}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>থানা/উপজেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{deceasedPermanentAddress.thana}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>জেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{deceasedPermanentAddress.district}</Typography>
            </Grid>
          </Grid>

          {/* Section 4: Bank Info - Start of Page 2 (implicit page break) */}
          <div className="page-break-before">
            <Typography className={classes.sectionTitle}>৪। মৃত শ্রমিকের ওয়ারিশ / ওয়ারিশানের ব্যাংক হিসাবের বিবরণীঃ-</Typography>
            <Typography variant="body2" style={{ marginBottom: "8px" }}>
              (একাধিক ওয়ারিশানের ক্ষেত্রে প্রাপ্যতা (%) উল্লেখ করতে হবে)
            </Typography>

            <TableContainer component={Box}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>ক্রম</TableCell>
                    <TableCell>মৃত শ্রমিকের ওয়ারিশ / ওয়ারিশানের নাম</TableCell>
                    <TableCell>সম্পর্ক</TableCell>
                    <TableCell>ব্যাংক হিসাব নাম্বার, শাখার নাম</TableCell>
                    <TableCell>ব্যাংকের রাউটিং নাম্বার</TableCell>
                    <TableCell>প্রাপ্যতা (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeBankInfo?.map((bankInfo, index) => {
                    const bankName = bankInfo?.bank?.nameBn || "N/A";
                    const branchName = bankInfo?.branch?.nameBn || "N/A";
                    const accountHolderName = bankInfo?.accountHolderName || "N/A";
                    const accountNumber = bankInfo?.accountNumber || "N/A";
                    const routingNumber = bankInfo?.branch?.routingNumber || "N/A";
                    const relation = bankInfo?.relationshipWithAccountHolder || "N/A"; 

                    return (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{accountHolderName}</TableCell>
                        <TableCell>{translateRelation(relation)}</TableCell>
                        <TableCell>
                          {accountNumber}, {branchName}, {bankName}
                        </TableCell>
                        <TableCell>{routingNumber}</TableCell>
                        <TableCell>100% (উদাহরণ)</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Section 5 & 6: Other Info and Attachments */}
          <Typography className={classes.sectionTitle}>৫। অন্য কোনো তথ্য (যদি থাকে):-</Typography>
          <Typography className={classes.fieldValue} style={{ minHeight: "40px" }}>
            {/* Empty field */}
          </Typography>

          <Typography className={classes.sectionTitle}>৬। সংযুক্তিঃ- (আবেদন দাখিলের পূর্ব নিম্নোক্ত দলিলাদি সংযুক্ত করতে হবে)</Typography>
          <Grid container spacing={1}>
            {requiredAttachments.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" alignItems="center">
                  <Box className={`${classes.checkbox} ${item.checked ? classes.checked : ""}`} />
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box mt={4}>
            <Typography variant="h6">৭। মুভমেন্ট লগ / Movement Log</Typography>
            <Divider />
            {movementLogs.length > 0 ? (
              <Table style={{ marginTop: 8 }} size="small" className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>তারিখ / Date</b>
                    </TableCell>
                    <TableCell>
                      <b>অফিসারের নাম / Action Taken</b>
                    </TableCell>
                    <TableCell>
                      <b>দায়িত্বপ্রাপ্ত পদবী / Officer</b>
                    </TableCell>
                    <TableCell>
                      <b>মন্তব্য / Remarks</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movementLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.date || "-"}</TableCell>
                      <TableCell>{log.name || "-"}</TableCell>
                      <TableCell>{log.role || "-"}</TableCell>
                      <TableCell>{log.revertNote || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="textSecondary" style={{ marginTop: 8 }}>
                No movement data found.
              </Typography>
            )}
          </Box>

          <Typography variant="body2" className={classes.note} style={{ textAlign: "center", marginTop: "15px" }}>
            (বিঃদ্রঃ- অসম্পূর্ণ ও ভুল আবেদন বাতিলের ক্ষেত্রে কেন্দ্রীয় তহবিলের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।)
          </Typography>
        </Box>
      </Paper>

      {/* Attached Documents Section */}
      {documents &&
        documents.length > 0 &&
        documents.map((doc, index) => (
          <Paper key={doc?.id || index} className={`${classes.paper} printable-paper page-break-before`}>
            <Box className={classes.documentPage}>
              <Typography className={classes.documentTitle} variant="h6">
                সংযুক্তি: {doc?.workforceDocumentType?.nameBn || `দলিলাদি ${index + 1}`}
              </Typography>
              <img src={doc?.url} alt={doc?.workforceDocumentType?.nameBn} className={classes.documentImage} />
            </Box>
          </Paper>
        ))}
    </>
  );
}