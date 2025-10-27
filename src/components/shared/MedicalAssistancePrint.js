import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, Divider, TableRow } from "@material-ui/core";

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
  checkbox: { width: 15, height: 15, border: "1px solid #000", marginRight: 4, display: "inline-block", backgroundColor: "transparent", color: "black" },
  checked: { backgroundColor: "#000" },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "24px", // spacing between the two options
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
const formatAddress = (locationData, addressJsonString) => {
  const address = safeJsonParse(addressJsonString);
  const postOffice = address?.postOffice?.nameBn;
  const village = [address.houseName, address.paraMahalla, address.villageRoad].filter(Boolean).join(", ");
  const thana = locationData?.parent?.name;
  const district = locationData?.parent?.parent?.name;
  return { village, postOffice, thana, district };
};

// --- Component ---
export function MedicalAssistancePrint({ printRef, data, documents, logoLeftUrl, logoLeft }) {
  const classes = useStyles();
  if (!data || !data.workforceEmployee) return <p>আবেদনের কোনো তথ্য পাওয়া যায়নি।</p>;

  const { workforceEmployee, employeeBankInfo, employeeFactory, dateCreated, applicantInfo, movementLogs } = data;

  const deceased = workforceEmployee;
  const applicantName = deceased.spouseNameBn || "N/A";
  const applicantRelation = "স্ত্রী";
  const applicantNid = applicantInfo?.nid || "N/A";
  const applicantDOB = deceased.birthDate || "N/A";
  const applicantMobile = applicantInfo?.phoneNumber || deceased.phoneNumber;

  const permanentAddress = formatAddress(deceased.permanentLocation, deceased.permanentAddress);
  const presentAddress = formatAddress(deceased.presentLocation, deceased.presentAddress);

  const bankInfo = employeeBankInfo && employeeBankInfo?.length > 0 ? employeeBankInfo[0] : {};
  const bankName = bankInfo.bank?.nameBn || "N/A";
  const branchName = bankInfo.branch?.nameBn || "N/A";
  const accountHolderName = bankInfo.accountHolderName || "N/A";
  const accountNumber = bankInfo.accountNumber || "N/A";
  const routingNumber = bankInfo.branch?.routingNumber || "N/A";

  const createdDate = formatDate(dateCreated);
  const isNormalDeath = true;

  const requiredAttachments = [
    // { label: "রেজিস্টার্ড চিকিৎসক/ ইউনিয়ন পরিষদ / পৌরসভা বা সিটি কর্পোরেশন কর্তৃক প্রদত্ত মৃত্যু সনদ (মূলকপি)", checked: true },
    { label: "শ্রমিকের নিয়োগপত্র", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত আইডি কার্ড", checked: true },
    { label: "ইউনিয়ন পরিষদ / পৌরসভা বা সিটি কর্পোরেশন হতে ওয়ারিশান সনদ (মূলকপি)", checked: true },
    // { label: "মৃত শ্রমিকের জাতীয় পরিচয়পত্র এবং ছবি", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত প্রত্যয়ন পত্র (শ্রমিকের সকল তথ্যসহ)", checked: true },
    { label: "নমিনীর জাতীয় পরিচয়পত্র/ জন্মসনদ এবং ছবি", checked: true },
    { label: "শ্রমিকের শেষ ছয় মাসের বেতন শীটের কপি", checked: true },
    { label: "প্রতিষ্ঠান কর্তৃক প্রদত্ত প্রত্যয়ন পত্র (নমিনীর সকল তথ্যসহ)", checked: true },
    { label: "নমিনীর ব্যাংক হিসাবের চেক বা স্টেটমেন্টের কপি", checked: true },
    { label: "প্রতিষ্ঠানের মেম্বারশীপ সনদপত্র", checked: true },
    // { label: "মৃত শ্রমিকের অনলাইন ডেটাবেজের কপি", checked: true },
  ];

  console.log({ medicalAssistancePrintData: data });

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

          {/* Section 3: Disease Info */}
          {data?.employeeAccidentInfo && (
            <>
              <Typography className={classes.sectionTitle}>৩। রোগের তথ্য </Typography>

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
                    {data?.employeeAccidentInfo?.cronicDiseaseType?.map((disease, index) => (
                      <TableRow key={disease.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{disease.diseaseName || "N/A"}</TableCell>
                        <TableCell>{disease.grade || "N/A"}</TableCell>
                        <TableCell>{formatDate(data?.employeeAccidentInfo?.diagnosisDate)}</TableCell>
                        <TableCell>{disease.minimumDonationAmount || 0}</TableCell>
                        <TableCell>{disease.maximumDonationAmount || 0}</TableCell>
                        <TableCell>{data?.employeeAccidentInfo?.grantAmount || 0}</TableCell>
                      </TableRow>
                    ))}

                    {/* Fallback if no disease data */}
                    {(!data?.employeeAccidentInfo?.cronicDiseaseType || data?.employeeAccidentInfo?.cronicDiseaseType.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          কোনো রোগ সম্পর্কিত তথ্য পাওয়া যায়নি।
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {(data?.employeeAccidentInfo?.accidentType !== "accident" || data?.employeeAccidentInfo) && (
            <>
              <Typography className={classes.sectionTitle}>৩। রোগের তথ্য </Typography>
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>দুর্ঘটনার ধরন:</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>দুর্ঘটনার স্থান:</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>দুর্ঘটনার তারিখ:</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>দুর্ঘটনার সময়:</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>কোন পরিস্থিতিতে দুর্ঘটনা হয়েছে?</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography className={classes.fieldLabel}>আপনি কি সুস্থ হওয়ার পরে পুনরায় কর্মস্থলে যোগদান করেছেন?</Typography>

                  <Box className={classes.checkboxGroup}>
                    <Box className={classes.checkboxContainer}>
                      <Box className={`${classes.checkbox} ${true ? classes.checked : ""}`} />
                      <Typography variant="body2">হ্যাঁ</Typography>
                    </Box>
                    <Box className={classes.checkboxContainer}>
                      <Box className={`${classes.checkbox} ${false ? classes.checked : ""}`} />
                      <Typography variant="body2">না</Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* <Grid item xs={3}>
                </Grid> */}

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>সুস্থ হওয়ার পরে পুনরায় কর্মস্থলে যোগদানের তারিখ</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography className={classes.fieldLabel}>হাসপাতালে ভর্তি হয়েছিলেন?</Typography>
                  <Box className={classes.checkboxGroup}>
                    <Box className={classes.checkboxContainer}>
                      <Box className={`${classes.checkbox} ${true ? classes.checked : ""}`} />
                      <Typography variant="body2">হ্যাঁ</Typography>
                    </Box>
                    <Box className={classes.checkboxContainer}>
                      <Box className={`${classes.checkbox} ${false ? classes.checked : ""}`} />
                      <Typography variant="body2">না</Typography>
                    </Box>
                  </Box>
                </Grid>
                

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>হাসপাতালের নাম</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>ভর্তির তারিখ</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>রিলিজের তারিখ</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>

                <Grid item xs={3}>
                  <Typography className={classes.fieldLabel}>ডাক্তারের নাম</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography className={classes.fieldValue}>{applicantRelation}</Typography>
                </Grid>
              </Grid>
            </>
          )}

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
                  {/* Row A: Example with applicant data */}
                  {employeeBankInfo?.map((bankInfo, index) => {
                    const bankName = bankInfo?.bank?.nameBn || "N/A";
                    const branchName = bankInfo?.branch?.nameBn || "N/A";
                    const accountHolderName = bankInfo?.accountHolderName || "N/A";
                    const accountNumber = bankInfo?.accountNumber || "N/A";
                    const routingNumber = bankInfo?.branch?.routingNumber || "N/A";
                    return (
                      <TableRow key={index}>
                        <TableCell>ক</TableCell>
                        <TableCell>{accountHolderName}</TableCell>
                        <TableCell>{applicantRelation}</TableCell>
                        <TableCell>
                          {accountNumber}, {branchName}, {bankName}
                        </TableCell>
                        <TableCell>{routingNumber}</TableCell>
                        <TableCell>১০০% (উদাহরণ)</TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Rows for others (b, c, d) - empty as per data */}
                  {/* {["খ", "গ", "ঘ"].map((item) => (
                              <TableRow key={item}>
                                <TableCell>{item}</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            ))} */}
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

          {/* Keep Movement Logs & Documents section untouched */}
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

          {/* <Divider style={{ margin: "10px 0" }} /> */}

          {/* Section 7 & 8: Declaration and Recommendation */}
          {/* <Typography className={classes.sectionTitle}>৭। ঘোষণা</Typography>
                  <Typography variant="body2" style={{ lineHeight: 1.5 }}>
                    আমি ঘোষণা করতেছি যে, এই আবেদন পত্রে বর্ণিত সকল তথ্য আমার জ্ঞান ও বিশ্বাস মতে সত্য এবং আমি কোনো তথ্য গোপন করি নাই।
                  </Typography> */}

          {/* <Box className={classes.signatureBox}>
                    <Box className={classes.signatureItem}>
                      আবেদনকারীর নাম, স্বাক্ষর ও তারিখ
                      <br />({applicantName})<br />({createdDate})
                    </Box>
                    <Box className={classes.signatureItem}>কারখানা কর্তৃপক্ষের স্বাক্ষর, সীল এবং মোবাইল নাম্বার</Box>
                    <Box className={classes.signatureItem}>মালিকপক্ষের প্রতিনিধি সংস্থার দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর, সীল এবং মোবাইল নাম্বার</Box>
                  </Box> */}

          <Typography variant="body2" className={classes.note} style={{ textAlign: "center", marginTop: "15px" }}>
            (বিঃদ্রঃ- অসম্পূর্ণ ও ভুল আবেদন বাতিলের ক্ষেত্রে কেন্দ্রীয় তহবিলের সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।)
          </Typography>
        </Box>
      </Paper>

      {/* Attached Documents Section (optional) */}
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
