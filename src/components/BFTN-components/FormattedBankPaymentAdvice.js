import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Typography, Grid, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { decodeId } from "@openimis/fe-core";
import { fetchWorkforceSignatures } from "../../actions";
import { WORKFORCE_USER_TYPE, RELATION_LABEL_MAP } from "../../constants";
import { getUserTypeFromRights } from "../../utils/utils";
import MedicalMaternityView from "./atoms/MedicalMaternityView";
import DeathDisabilityView from "./atoms/DeathDisabilityView";
import EducationScholarshipView from "./atoms/EducationScholarshipView";
import BLWFView from "./atoms/BLWFView";

const useStyles = makeStyles((theme) => ({
  docTitle: {
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "left",
    color: "#4a76a8",
    textDecoration: "underline",
    marginBottom: theme.spacing(2),
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center",
    color: "#000",
  },
  docSubTitle: {
    fontWeight: "bold",
    fontSize: "16px",
    textAlign: "center",
    marginBottom: "4px",
    color: "#000",
  },
  docText: {
    fontSize: "12px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    color: "#000",
  },
  summaryTable: {
    width: "100%",
    maxWidth: "800px",
    borderCollapse: "collapse",
    marginBottom: theme.spacing(3),
    fontFamily: "Arial, sans-serif",
    "& td": {
      border: "1px solid #000",
      padding: "4px 8px",
      fontSize: "12px",
      color: "#000",
      verticalAlign: "top",
    },
  },
  excelTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    tableLayout: "auto",
    "& th, & td": {
      border: "1px solid #000",
      padding: "4px",
      fontSize: "11px",
      fontFamily: "Arial, sans-serif",
      verticalAlign: "middle",
      color: "#000",
      wordWrap: "break-word",
    },
    "& th": {
      backgroundColor: "#2e528e",
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      "-webkit-print-color-adjust": "exact",
      "print-color-adjust": "exact",
    },
    "@media print": {
      "& th, & td": {
        fontSize: "8.5px",
        padding: "2px",
      },
    },
  },
  signatureContainer: {
    marginTop: "60px",
    width: "100%",
  },
  signatureBlock: {
    marginTop: "40px",
    borderTop: "1px solid #000",
    paddingTop: "5px",
    fontSize: "11px",
    whiteSpace: "pre-line",
    lineHeight: 1.2,
    color: "#000",
  },
  "@global": {
    "@media print": {
      "#root, #__next": { display: "none !important" },
      "body *": { visibility: "hidden" },
      "#printable-content, #printable-content *": { visibility: "visible" },
      "#printable-content": {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        margin: 0,
        padding: 0,
      },
      "html, body": {
        height: "max-content !important",
        minHeight: "0 !important",
        margin: 0,
        padding: 0,
        overflow: "hidden !important",
      },
      ".MuiDialog-root, .MuiDialog-container, .MuiDialog-paper": {
        height: "auto !important",
        minHeight: "0 !important",
        boxShadow: "none !important",
        border: "none !important",
        overflow: "visible !important",
        position: "static !important",
        transform: "none !important",
      },
      "@page": {
        size: "landscape",
        margin: "5mm",
      },
    },
  },
}));

// --- HELPER FUNCTIONS ---
const getIncidentDetails = (rawInfo) => {
  let type = "ND";
  let date = "";
  try {
    const parsed = typeof rawInfo === "string" ? JSON.parse(rawInfo) : rawInfo;
    const info = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    date = info?.accidentDate || info?.dateOfDeath || "";

    if (info?.accidentMainType === "workforce.accident.mainType.workplace") type = "WAD";
    else if (info?.accidentMainType === "workforce.accident.mainType.onDutyRTA") type = "OAD";
    else if (info?.accidentMainType === "workforce.accident.mainType.commuting") type = "OAD";
  } catch (e) {}
  return { type, date };
};



// ============================================================================
// MAIN PARENT COMPONENT
// ============================================================================
const FormattedBankPaymentAdvice = ({ applications, dependentData, getTotalAmount, userRights, status, movements }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [signatures, setSignatures] = useState([]);
  console.log({fromBankAdvice:applications})

  useEffect(() => {
    const getSignatures = async () => {
      if (movements && movements.length > 0) {
        const senderIds = [
          ...new Set(
            movements
              .filter((item) => item?.status === "forward_to_comiitee" || item?.status === "approved_by_committee")
              .map((item) => (item?.applicationTo?.id ? decodeId(item.applicationTo.id) : null))
              .filter((id) => id !== null)
          ),
        ];
        if (senderIds.length > 0) {
          const res = await dispatch(fetchWorkforceSignatures(senderIds));
          setSignatures(res?.payload?.data?.workforceSignatures || []);
        }
      }
    };
    getSignatures();
  }, [movements, dispatch]);

  let organization = "কেন্দ্রীয় তহবিল";
  let address = "২১ তলা, ভবন#৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০";
  let web = "www.centralfund.gov.bd";
  let logoSrc = "workforce_assets/centralfund.png";

  if (
    [
      WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN,
      WORKFORCE_USER_TYPE.BLWF_DIRECTOR,
      WORKFORCE_USER_TYPE.BLWF_APPROVER,
      WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR,
    ].includes(getUserTypeFromRights(userRights))
  ) {
    organization = "বাংলাদেশ শ্রমিক কল্যাণ ফাউন্ডেশন";
    address = "১৮ তলা, ভবন#৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০";
    web = "www.blwf.gov.bd";
    logoSrc = "workforce_assets/blwf.png";
  }

  // Determine App Category to render respective tables
  const filteredApplications = applications.filter((item) => item.status === status);
  console.log({fromBankAdvice:filteredApplications})

  const appType = applications?.[0]?.applicationType;
  console.log({fromBankAdvice:appType})

  const isMedicalOrMaternity = ["medicalAssistance", "maternityGrant","medicalDonation"]?.includes(appType);
  const isEducationOrScholarship = ["scholarship", "educationGrant"].includes(appType);
  console.log({fromBankAdvice:isMedicalOrMaternity})


  // Dynamic Title based on App Category
  const documentTitle =applications?.[0]?.organizationType==="blwf"?
  "বিএলডাব্লিউএফ এর আবেদন অনুযায়ী আর্থিক সহায়তা তালিকা"
  : isEducationOrScholarship
    ? "বিজিএমইএ - এর শিক্ষা আর্থিক সহায়তার তালিকা"
    : isMedicalOrMaternity
    ? "বিজিএমইএ - এর চিকিৎসা ও মাতৃত্বকালীন আর্থিক সহায়তার তালিকা"
    : "বিজিএমইএ - এর মৃত্যু ও দুর্ঘটনাজনিত আর্থিক সহায়তার তালিকা";

  return (
    <div id="printable-content">
      {/* HEADER SECTION (Universal) */}
      <Grid container alignItems="center" justify="space-between" style={{ paddingBottom: "16px", borderBottom: "1px solid #e0e0e0", marginBottom: "24px" }}>
        <Grid item xs={3} style={{ textAlign: "left" }}>
          <img src={logoSrc} alt="Logo" style={{ width: "120px", objectFit: "contain" }} />
        </Grid>
        <Grid item xs={6} style={{ textAlign: "center" }}>
          <Typography className={classes.headerTitle}>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</Typography>
          <Typography className={classes.docSubTitle}>শ্রম ও কর্মসংস্থান মন্ত্রণালয়</Typography>
          <Typography className={classes.docText}>{organization}</Typography>
          <Typography className={classes.docText}>{address}</Typography>
          <Typography className={classes.docText}>{web}</Typography>
        </Grid>
        <Grid item xs={3} style={{ textAlign: "right" }}>
          <img src="workforce_assets/bdgov.png" alt="BD Gov Logo" style={{ width: "120px", objectFit: "contain" }} />
        </Grid>
      </Grid>

      <Typography className={classes.docTitle}>{documentTitle}</Typography>

      {["blwf"].includes(applications[0]?.organizationType) ? (
        <BLWFView classes={classes} applications={applications} getTotalAmount={getTotalAmount} />
      ) : isEducationOrScholarship ? (
        <EducationScholarshipView 
          classes={classes} 
          applications={applications} 
          dependentData={dependentData}
          getTotalAmount={getTotalAmount} 
        />
      ) : isMedicalOrMaternity ? (
        <MedicalMaternityView 
          classes={classes} 
          applications={applications} 
          getTotalAmount={getTotalAmount} 
        />
      ) : (
        <DeathDisabilityView 
          classes={classes} 
          applications={applications} 
          dependentData={dependentData} 
          getTotalAmount={getTotalAmount} 
        />
      )}

      {/* FOOTER SIGNATURE SECTION (Universal) */}
      <Box mt={4}>
        <Typography style={{ fontWeight: "bold", textDecoration: "underline", color: "#000" }}>
          Signature of Members:
        </Typography>
        <Grid container spacing={2} className={classes.signatureContainer}>
          {signatures?.map((sig, i) => (
            <Grid item xs={3} key={sig?.user_id || i}>
              {sig?.workforce_document?.url ? (
                <img src={sig.workforce_document.url} alt="signature" style={{ width: "100%", maxHeight: 80, objectFit: "contain" }} />
              ) : (
                <Typography variant="caption" style={{ fontStyle: "italic", color: "#999" }}>
                  Signature not available
                </Typography>
              )}
              <div className={classes.signatureBlock}>
                <p style={{ margin: 0, fontWeight: "bold" }}>{sig?.last_name}</p>
                <p style={{ margin: 0 }}>{sig?.role?.name}</p>
              </div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};

export default FormattedBankPaymentAdvice;