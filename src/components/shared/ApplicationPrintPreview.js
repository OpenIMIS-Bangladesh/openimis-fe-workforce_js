// ApplicationPrintView.jsx
import React from "react";
import { Grid, Box, Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 16,
    background: "#fff",
    color: "#000",
    fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
  },
  page: {
    width: "210mm", // A4 width for screen preview
    minHeight: "297mm",
    margin: "0 auto",
    padding: 24,
    boxSizing: "border-box",
    background: "#fff",
  },
  headerTop: {
    textAlign: "center",
    marginBottom: 8,
  },
  headerLogoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logoPlaceholder: {
    width: 120,
    height: 80,
    border: "1px dashed #ccc",
    display: "inline-block",
  },
  sectionTitle: {
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 8,
  },
  fieldRow: {
    padding: "6px 0",
  },
  fieldLabel: {
    fontWeight: 600,
    marginRight: 8,
  },
  boxed: {
    border: "1px solid #444",
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  smallText: {
    fontSize: 12,
  },
  docPreview: {
    border: "1px solid #ddd",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  docIframe: {
    width: "100%",
    height: 500,
    border: 0,
  },

  // Print styles
  "@media print": {
    root: {
      padding: 0,
      background: "#fff",
    },
    page: {
      boxShadow: "none",
      margin: 0,
      width: "auto",
      minHeight: "auto",
      padding: 8,
    },
    headerLogoRow: {
      marginBottom: 4,
    },
    docIframe: {
      height: 600,
    },
    // Avoid breaking important elements
    noBreakBefore: {
      breakBefore: "avoid",
      breakInside: "avoid",
    },
    noBreakInside: {
      breakInside: "avoid",
    },
  },
}));

// helper: determine file type (same logic you used)
const getFileType = (url = "") => {
  if (!url) return "unsupported";
  const lowerUrl = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif)$/i.test(lowerUrl)) return "image";
  if (lowerUrl.endsWith(".pdf")) return "pdf";
  if (lowerUrl.endsWith(".docx")) return "docx";
  return "unsupported";
};

// helper: get full location name from nested presentLocation/permanentLocation
const getLocationFullName = (loc) => {
  if (!loc) return "";
  const names = [];
  let node = loc;
  // traverse upward to collect names
  while (node) {
    if (node.name) names.unshift(node.name); // push to front to get top-down
    node = node.parent;
  }
  return names.join(" / ");
};

// helper: safely parse address JSON strings
const parseAddress = (addrStr) => {
  if (!addrStr) return {};
  try {
    const obj = JSON.parse(addrStr);
    return obj;
  } catch (e) {
    return { raw: addrStr };
  }
};

const ApplicationPrintView = ({
  applicationData = {},
  documents = null, // optional: if null we'll try applicationData.documents or applicationData.files
  logoLeft = null, // logo url for left
  logoRight = null, // logo url for right
}) => {
  const classes = useStyles();

  const data = applicationData || {};
  const employee = data.workforceEmployee || {};
  const presentAddr = parseAddress(employee.presentAddress);
  const permanentAddr = parseAddress(employee.permanentAddress);

  const files = documents || data.documents || data.files || [];

  // convenience getters
  const fullPresentLocation = getLocationFullName(employee.presentLocation);
  const fullPermanentLocation = getLocationFullName(employee.permanentLocation);

  return (
    <div className={classes.root}>
      <div className={classes.page}>

        {/* Header (logo placeholders + title lines from Death.pdf) */}
        <div className={classes.headerLogoRow}>
          <div>
            {logoLeft ? (
              <img src={logoLeft} alt="logo-left" style={{ height: 80 }} />
            ) : (
              <div className={classes.logoPlaceholder} />
            )}
          </div>

          <div style={{ textAlign: "center", flex: 1 }}>
            <Typography variant="h6" className={classes.smallText}>
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </Typography>
            <Typography variant="h6" className={classes.smallText}>
              কেন্দ্রীয় তহবিল
            </Typography>
            <Typography variant="h6" className={classes.smallText}>
              শ্রম ও কর্মসংস্থান মন্ত্রণালয়
            </Typography>
            <Typography variant="body2" className={classes.smallText}>
              ২১ তলা, ভবন নং: ৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০।
            </Typography>
          </div>

          <div>
            {logoRight ? (
              <img src={logoRight} alt="logo-right" style={{ height: 80 }} />
            ) : (
              <div className={classes.logoPlaceholder} />
            )}
          </div>
        </div>

        <Divider style={{ margin: "8px 0 12px 0" }} />

        {/* Title */}
        <Box textAlign="center" mb={1}>
          <Typography variant="h6" style={{ fontWeight: 800 }}>
            মৃত্যুজনিত কারনে আর্থিক সহায়তার আবেদন ফরম
          </Typography>
          <Typography variant="body2" className={classes.smallText}>
            (শতভাগ রপ্তানিমূখী কর্মচারীর ক্ষেত্রে প্রয়োগযোগ্য)
          </Typography>
        </Box>

        {/* Section ১ : আবেদনকারী ব্যক্তিগত তথ্য (we keep same labels as PDF) */}
        <Box className={classes.boxed}>
          <Typography className={classes.sectionTitle}>১। আবেদনকারী ব্যক্তিগত তথ্যঃ</Typography>

          <Grid container spacing={1}>
            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>নামঃ</span> {employee.firstNameBn || employee.firstNameEn || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>পিতার নামঃ</span> {employee.fatherNameBn || employee.fatherNameEn || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>মাতার নামঃ</span> {employee.motherNameBn || employee.motherNameEn || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>জন্ম তারিখঃ</span> {employee.birthDate || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>জাতীয় পরিচয়পত্র/জন্ম সনঃ</span> {employee.nid || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>বর্তমান ঠিকানাঃ</span> {presentAddr.raw ? presentAddr.raw : (
                <>
                  {presentAddr.houseName ? presentAddr.houseName + ", " : ""}
                  {presentAddr.paraMahalla ? presentAddr.paraMahalla + ", " : ""}
                  {presentAddr.roadName ? presentAddr.roadName + ", " : ""}
                  {presentAddr.postOffice?.nameBn || presentAddr.postOffice?.nameEn || ""} {presentAddr.postOffice?.postCode ? `(${presentAddr.postOffice.postCode})` : ""}
                </>
              )}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>স্থায়ী ঠিকানাঃ</span> {permanentAddr.raw ? permanentAddr.raw : (
                <>
                  {permanentAddr.houseName ? permanentAddr.houseName + ", " : ""}
                  {permanentAddr.paraMahalla ? permanentAddr.paraMahalla + ", " : ""}
                  {permanentAddr.roadName ? permanentAddr.roadName + ", " : ""}
                  {permanentAddr.postOffice?.nameBn || permanentAddr.postOffice?.nameEn || ""} {permanentAddr.postOffice?.postCode ? `(${permanentAddr.postOffice.postCode})` : ""}
                </>
              )}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>মোবাইল নম্বরঃ</span> {employee.phoneNumber || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>ইমেইলঃ</span> {employee.email || "-"}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Section ২ : মৃত/অসুস্থ শ্রমিকের তথ্য (KEEPING SAME LABELS FROM PDF) */}
        <Box className={classes.boxed}>
          <Typography className={classes.sectionTitle}>২। মৃত শ্রমিকের সম্পর্কে তথ্যঃ</Typography>

          <Grid container spacing={1}>
            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>নামঃ</span> {employee.firstNameBn || employee.firstNameEn || "-"}</Typography>
            </Grid>
            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>পেশা/পদবীঃ</span> {employee.position || "-"}</Typography>
            </Grid>
            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>জাতীয় পরিচয়পত্র/জন্ম সনঃ</span> {employee.nid || "-"}</Typography>
            </Grid>
            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>লিঙ্গঃ</span> {employee.gender || "-"}</Typography>
            </Grid>

            <Grid item xs={12} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>স্থায়ী ঠিকানা (লোকেশন):</span> {fullPermanentLocation || "-"}</Typography>
            </Grid>

            <Grid item xs={12} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>বর্তমান ঠিকানা (লোকেশন):</span> {fullPresentLocation || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>জন্ম তারিখ/বয়েসঃ</span> {employee.birthDate || "-"}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Section ৩ : প্রতিষ্ঠান/কর্মস্থল তথ্য */}
        <Box className={classes.boxed}>
          <Typography className={classes.sectionTitle}>৩। প্রতিষ্ঠান/কর্মস্থল সংক্রান্ত তথ্যঃ</Typography>

          <Grid container spacing={1}>
            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>প্রতিষ্ঠানের নাম (বাংলা):</span> {data.employeeFactory?.nameBn || data.employeeFactory?.nameEn || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>প্রতিষ্ঠানের আইডি:</span> {data.employeeFactory?.id || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>আবেদনের ধরণঃ</span> {data.applicationType || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>ট্র্যাকিং নাম্বারঃ</span> {data.trackingNumber || "-"}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Section ৪ : ব্যাংক তথ্য (employeeBankInfo array) */}
        <Box className={classes.boxed}>
          <Typography className={classes.sectionTitle}>৪। ব্যাংক/অ্যাকাউন্ট তথ্যঃ</Typography>
          {Array.isArray(data.employeeBankInfo) && data.employeeBankInfo.length > 0 ? (
            data.employeeBankInfo.map((b, idx) => (
              <Box key={idx} mb={1}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography><span className={classes.fieldLabel}>ব্যাংক নামঃ</span> {b.bank?.nameBn || b.bank?.nameEn || "-"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><span className={classes.fieldLabel}>ব্রাঞ্চঃ</span> {b.branch?.nameBn || b.branch?.nameEn || "-"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><span className={classes.fieldLabel}>অ্যাকাউন্ট হোল্ডারের নামঃ</span> {b.accountHolderName || "-"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography><span className={classes.fieldLabel}>অ্যাকাউন্ট নাম্বারঃ</span> {b.accountNumber || "-"}</Typography>
                  </Grid>
                </Grid>
              </Box>
            ))
          ) : (
            <Typography>-</Typography>
          )}
        </Box>

        {/* Section ৫ : রোগ/দুর্ঘটনা (employeeAccidentInfo) */}
        <Box className={classes.boxed}>
          <Typography className={classes.sectionTitle}>৫। চিকিৎসা/রোগ সংক্রান্ত তথ্যঃ</Typography>

          <Grid container spacing={1}>
            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>রোগের নাম/ধরণঃ</span> {Array.isArray(data.employeeAccidentInfo?.cronicDiseaseType) && data.employeeAccidentInfo.cronicDiseaseType.length > 0 ? data.employeeAccidentInfo.cronicDiseaseType.map(d => d.diseaseName).join(", ") : "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>ডাক্তারের নামঃ</span> {data.employeeAccidentInfo?.doctorName || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>ডায়াগনোসিস তারিখঃ</span> {data.employeeAccidentInfo?.diagnosisDate || "-"}</Typography>
            </Grid>

            <Grid item xs={6} className={classes.fieldRow}>
              <Typography><span className={classes.fieldLabel}>অনুমানিত অনুদানঃ</span> {data.grantAmount || data.grantMoney?.grantMoney || "-"}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Section ৬ : অন্যান্য / মন্তব্য */}
        <Box className={classes.boxed}>
          <Typography className={classes.sectionTitle}>৬। অন্যান্য তথ্য (যদি থাকে):</Typography>
          <Typography>{data.metadata && Object.keys(data.metadata).length ? JSON.stringify(data.metadata) : "-"}</Typography>
        </Box>

        {/* Section ৭ : দস্তাবেজসমূহ (documents) */}
        <Box className={classes.boxed}>
          <Typography className={classes.sectionTitle}>৭। দস্তাবেজসমূহ (দাখিলকৃত কপি)</Typography>

          {Array.isArray(files) && files.length > 0 ? (
            files.map((file, idx) => {
              const url = file?.url || file?.fileUrl || file?.value || "";
              const type = getFileType(url);
              const docTitle = (file?.workforceDocumentType?.nameBn || file?.workforceDocumentType?.nameEn || file?.name || file?.documentType || `Document ${idx + 1}`);

              return (
                <Box key={idx} className={classes.noBreakInside} mb={2}>
                  <Typography style={{ fontWeight: 700, marginBottom: 6 }}>{`${idx + 1}. ${docTitle} ${file?.status ? `(${file.status})` : ""}`}</Typography>

                  <div className={classes.docPreview}>
                    {type === "image" && (
                      <img src={url} alt={docTitle} style={{ width: "100%", maxHeight: 500, objectFit: "contain" }} />
                    )}

                    {type === "pdf" && (
                      <iframe title={`pdf-${idx}`} src={url} className={classes.docIframe} />
                    )}

                    {type === "docx" && (
                      <iframe
                        title={`docx-${idx}`}
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                        className={classes.docIframe}
                      />
                    )}

                    {type === "unsupported" && (
                      <Box p={2}>
                        <Typography color="error">Unsupported file type</Typography>
                        <Typography variant="body2">{url}</Typography>
                      </Box>
                    )}
                  </div>
                </Box>
              );
            })
          ) : (
            <Typography>- কোন দস্তাবেজ পাওয়া যায়নি -</Typography>
          )}
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography className={classes.smallText}>সাইন: ____________________________</Typography>
          <Typography className={classes.smallText}>তারিখ: {data.dateCreated ? data.dateCreated.split("T")[0] : "-"}</Typography>
        </Box>
      </div>
    </div>
  );
};

export default ApplicationPrintView;
