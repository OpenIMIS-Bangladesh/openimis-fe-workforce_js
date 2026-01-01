import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, Divider, TableRow, Checkbox } from "@material-ui/core";
import { FormattedMessage } from "@openimis/fe-core"; 

// --- Styles ---
const useStyles = makeStyles({
  "@global": {
    "@media print": {
      html: { overflow: "initial !important" },
      body: { overflow: "initial !important" },
      "*": {
        color: "#000 !important",
      },
      ".page-break": { display: "block", pageBreakBefore: "auto" },
      "table, tr, td, th": { pageBreakInside: "avoid !important" },
    },
  },
  paper: { padding: 32, fontFamily: "'Siyam Rupali', Arial, sans-serif", color: "black" },
  headerContainer: { marginBottom: 16, position: "relative", color: "black" },
  logo: { maxWidth: 70, maxHeight: 70 },
  headerText: { textAlign: "center", color: "black" },
  title: {
    fontSize: "small",
    fontWeight: "bold",
    textAlign: "center",
    margin: "8px 0 5px 0",
    textDecoration: "underline",
    color: "black",
  },
  sectionTitle: { fontWeight: "bold", fontSize: "small", marginTop: 8, marginBottom: 4, borderBottom: "1px solid #000", paddingBottom: 4, color: "black" },
  fieldLabel: { textAlign: "left", fontSize: "0.9rem", paddingRight: 8, color: "black" },
  fieldValue: { borderBottom: "1px dotted #000", minHeight: 20, paddingLeft: 8, display: "block", fontSize: "0.9rem", color: "black" },
  checkboxContainer: { display: "flex", alignItems: "center", marginRight: 16, color: "black" },
  checked: { backgroundColor: "#000" },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "24px", 
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
    "& th, & td": { border: "1px solid #000", padding: 8 },
    "& th": { fontWeight: "bold", textAlign: "center", color: "black" },
  },
  photoBox: {
    border: "1px solid #000",
    width: 120,
    height: 140,
    textAlign: "center",
    padding: 8,
    fontSize: 12,
    lineHeight: 1.2,
    position: "absolute",
    right: 0,
    top: 60,
    color: "black",
  },
  note: { fontSize: "0.85rem", marginTop: 8, marginBottom: 8, color: "black" },
});

// --- Helpers ---
const safeJsonParse = (str) => {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
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
    district: district || "N/A" 
  };
};

// --- Component ---
export function MedicalAssistancePrint({ printRef, data, documents, logoLeftUrl, logoLeft }) {
  const classes = useStyles();
  if (!data) return <p>আবেদনের কোনো তথ্য পাওয়া যায়নি।</p>;

  const { workforceEmployee, dateCreated, movementLogs } = data;

  // --- 1. APPLICANT INFO ---
  const applicantName = workforceEmployee?.firstNameBn || workforceEmployee?.firstNameEn || "N/A";
  const applicantRelation = "নিজ"; 
  const applicantNid = workforceEmployee?.nid || "N/A";
  const applicantDOB = workforceEmployee?.birthDate || "N/A";
  const applicantMobile = workforceEmployee?.phoneNumber || "N/A";

  const permanentAddress = formatAddress(workforceEmployee?.permanentLocation, workforceEmployee?.permanentAddress);
  const presentAddress = formatAddress(workforceEmployee?.presentLocation, workforceEmployee?.presentAddress);

  // --- 2. ACCIDENT/DISEASE INFO ---
  // Ensure accidentInfo is at least an empty object to avoid crashes
  const accidentInfo = data?.employeeAccidentInfo || {};
  
  // Decide whether to show Disease Table or Accident Grid.
  // Default to Accident Grid if type is 'accident' OR null/undefined (to ensure fields show)
  const isDisease = accidentInfo?.aidReasonType === "disease";

  const createdDate = formatDate(dateCreated);

  const requiredAttachments = [
    { label: "শ্রমিকের নিয়োগপত্র", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত আইডি কার্ড", checked: true },
    { label: "ইউনিয়ন পরিষদ / পৌরসভা বা সিটি কর্পোরেশন হতে ওয়ারিশান সনদ (মূলকপি)", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত প্রত্যয়ন পত্র (শ্রমিকের সকল তথ্যসহ)", checked: true },
    { label: "নমিনীর জাতীয় পরিচয়পত্র/ জন্মসনদ এবং ছবি", checked: true },
    { label: "শ্রমিকের শেষ ছয় মাসের বেতন শীটের কপি", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত প্রত্যয়ন পত্র (নমিনীর সকল তথ্যসহ)", checked: true },
    { label: "নমিনীর ব্যাংক হিসাবের চেক বা স্টেটমেন্টের কপি", checked: true },
    { label: "প্রতিষ্ঠানের মেম্বারশীপ সনদপত্র", checked: true },
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
              <Typography variant="body1">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</Typography>
              <Typography variant="body1">কেন্দ্রীয় তহবিল</Typography>
              <Typography variant="body1">শ্রম ও কর্মসংস্থান মন্ত্রণালয়</Typography>
              <Typography variant="body2">২১ তলা, ভবন নং: ৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০।</Typography>
              <Typography variant="body2" style={{ color: "blue" }}>
                www.centralfund.gov.bd
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Box className={classes.photoBox}>
                শ্রমিক ও তার <br /> ওয়ারিশাণের পাসপোর্ট <br /> সাইজের ১ (এক) কপি <br /> করে ছবি
              </Box>
            </Grid>
          </Grid>

          {/* Title */}
          <Typography className={classes.title}>চিকিৎসা অনুদান আবেদন ফরম</Typography>
          <Typography variant="body2" style={{ textAlign: "center" }}>
            (শতভাগ রপ্তানিমুখি শিল্প কারখানায় কর্মরত শ্রমিকের ওয়ারিশান/ওয়ারিশানদের জন্য)
          </Typography>

          {/* Applicant Info */}
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

          {/* Permanent & Present Addresses */}
          <Typography style={{ marginTop: 8, fontWeight: "bold" }}>স্থায়ী ঠিকানাঃ</Typography>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>গ্রাম/মহল্লাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{permanentAddress.village}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>ডাকঘরঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{permanentAddress.postOffice}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>থানা/উপজেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{permanentAddress.thana}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>জেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{permanentAddress.district}</Typography>
            </Grid>
          </Grid>

          <Typography style={{ marginTop: 8, fontWeight: "bold" }}>বর্তমান ঠিকানাঃ-</Typography>
          <Grid container spacing={1}>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>গ্রাম/মহল্লাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{presentAddress.village}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>ডাকঘরঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{presentAddress.postOffice}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>থানা/উপজেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{presentAddress.thana}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography className={classes.fieldLabel}>জেলাঃ</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography className={classes.fieldValue}>{presentAddress.district}</Typography>
            </Grid>
          </Grid>

          {/* Section 3: Disease Info or Accident Info (Always Shown) */}
          <Typography className={classes.sectionTitle}>৩। রোগের তথ্য </Typography>
          
          {isDisease ? (
            // DISEASE LAYOUT
            <TableContainer component={Box}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>ক্রম</TableCell>
                    <TableCell>রোগের নাম</TableCell>
                    <TableCell>রোগের গ্রেড</TableCell>
                    <TableCell>নির্ণয়ের তারিখ</TableCell>
                    <TableCell>সর্বনিম্ন অনুদান</TableCell>
                    <TableCell>সর্বোচ্চ অনুদান</TableCell>
                    <TableCell>প্রস্তাবিত অনুদান</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accidentInfo?.cronicDiseaseType?.map((disease, index) => (
                    <TableRow key={disease.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{disease.diseaseName || "N/A"}</TableCell>
                      <TableCell>{disease.grade || "N/A"}</TableCell>
                      <TableCell>{formatDate(accidentInfo?.diagnosisDate)}</TableCell>
                      <TableCell>{disease.minimumDonationAmount || 0}</TableCell>
                      <TableCell>{disease.maximumDonationAmount || 0}</TableCell>
                      <TableCell>{accidentInfo?.grantAmount || 0}</TableCell>
                    </TableRow>
                  ))}

                  {/* Fallback if no disease data */}
                  {(!accidentInfo?.cronicDiseaseType || accidentInfo?.cronicDiseaseType.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        কোনো রোগ সম্পর্কিত তথ্য পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // ACCIDENT LAYOUT (Default)
            <Grid container spacing={1}>
              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>দুর্ঘটনার ধরন:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{accidentInfo?.accidentSpecificType || "N/A"}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>দুর্ঘটনার স্থান:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{accidentInfo?.accidentPlace || "N/A"}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>দুর্ঘটনার তারিখ:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{formatDate(accidentInfo?.accidentDate)}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>দুর্ঘটনার সময়:</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{accidentInfo?.accidentTime || "N/A"}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>কোন পরিস্থিতিতে দুর্ঘটনা হয়েছে?</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{accidentInfo?.inOutsideFactory || "N/A"}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography className={classes.fieldLabel}>আপনি কি সুস্থ হওয়ার পরে পুনরায় কর্মস্থলে যোগদান করেছেন?</Typography>

                <Box className={classes.checkboxGroup}>
                  <Box className={classes.checkboxContainer}>
                    <Checkbox
                      checked={accidentInfo?.hasRejoined === "yes"}
                      color="default"
                      size="small"
                      style={{ padding: 0, paddingRight: "4px", color: "black" }} 
                    />
                    <Typography variant="body2">হ্যাঁ</Typography>
                  </Box>
                  <Box className={classes.checkboxContainer}>
                    <Checkbox
                      checked={accidentInfo?.hasRejoined === "no"}
                      color="default"
                      size="small"
                      style={{ padding: 0, paddingRight: "4px", color: "black" }} 
                    />
                    <Typography variant="body2">না</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>সুস্থ হওয়ার পরে পুনরায় কর্মস্থলে যোগদানের তারিখ</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{formatDate(accidentInfo?.dateOfRejoining)}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography className={classes.fieldLabel}>হাসপাতালে ভর্তি হয়েছিলেন?</Typography>
                <Box className={classes.checkboxGroup}>
                  <Box className={classes.checkboxContainer}>
                    <Checkbox
                      checked={accidentInfo?.admitted === "yes"}
                      color="default"
                      size="small"
                      style={{ padding: 0, paddingRight: "4px", color: "black" }} 
                    />
                    <Typography variant="body2">হ্যাঁ</Typography>
                  </Box>
                  <Box className={classes.checkboxContainer}>
                    <Checkbox
                      checked={accidentInfo?.admitted === "no"}
                      color="default"
                      size="small"
                      style={{ padding: 0, paddingRight: "4px", color: "black" }} 
                    />
                    <Typography variant="body2">না</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>হাসপাতালের নাম</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{accidentInfo?.hospitalName || "N/A"}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>ভর্তির তারিখ</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{formatDate(accidentInfo?.admitDate)}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>রিলিজের তারিখ</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{formatDate(accidentInfo?.releaseDate)}</Typography>
              </Grid>

              <Grid item xs={3}>
                <Typography className={classes.fieldLabel}>ডাক্তারের নাম</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.fieldValue}>{accidentInfo?.hospitalDoctorName || "N/A"}</Typography>
              </Grid>
            </Grid>
          )}

          {/* Section 4 was removed as per request */}

          {/* Section 5: Other Info (Numbering adjusted to match previous logic or kept as 5/6/7) */}
          <Typography className={classes.sectionTitle}>৫। অন্য কোনো তথ্য (যদি থাকে):-</Typography>
          <Typography className={classes.fieldValue} style={{ minHeight: "40px" }}>
            {/* Empty field */}
          </Typography>

          <Typography className={classes.sectionTitle}>৬। সংযুক্তিঃ- (আবেদন দাখিলের পূর্ব নিম্নোক্ত দলিলাদি সংযুক্ত করতে হবে)</Typography>
          <Grid container spacing={1}>
            {requiredAttachments.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Box display="flex" alignItems="center">
                  <Checkbox
                    checked={item.checked}
                    color="default"
                    size="small"
                    style={{ padding: 0, paddingRight: "8px", color: "black" }} 
                  />
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Movement Logs */}
          <Box mt={4}>
            <Typography variant="h6">৭। মুভমেন্ট লগ / Movement Log</Typography>
            <Divider />
            {movementLogs?.length > 0 ? (
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
                  {movementLogs?.map((log, index) => (
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
        documents?.length > 0 &&
        documents?.map((doc, index) => (
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