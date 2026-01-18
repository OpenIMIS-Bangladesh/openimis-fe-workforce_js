import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  FormControl,
  FormLabel,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Button,
  IconButton,
  FormHelperText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import { useTranslations, useModulesManager, TextInput, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";
import { getUserType, safeDecodeId } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { fetchApplicationWiseMovementList, fetchWorkforceSignatures } from "../../actions";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    "@media print": {
      padding: 0,
      border: "none",
    },
  },
  item: {
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 800,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
  },
  doctorCard: {
    border: "1px solid #ddd",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 8,
  },
  removeBtn: {
    color: theme.palette.error.main,
  },
   docTitle: {
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center",
    textTransform: "uppercase",
    color: "#006273",
  },
  docSubTitle: {
    fontWeight: "bold",
    fontSize: "16px",
    textAlign: "center",
    marginBottom: "4px",
    color: "#006273",
  },
  docText: {
    fontSize: "12px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    color: "#006273",
  },
  signatureContainer: {
    marginTop: "60px",
    width: "100%",
    // Ensure the signature block doesn't break across pages awkwardly
    pageBreakInside: "avoid", 
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
  overrideReadOnly: {
    "& .MuiInputBase-root.Mui-disabled": {
      color: "#808080 !important",
    },
    "& .MuiFormLabel-root.Mui-disabled": {
      color: `${theme.palette.text.primary} !important`,
    },
  },
}));

const EisDoctorEntries = ({ handleChange, formData, setFormData, applicationType, errors }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const user_type = getUserType();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const [movements, setMovements] = useState([]);
  const [lastRevertMovement, setLastRevertMovement] = useState(null);
  const [revertNotes, setRevertNotes] = useState([]);
  const [eisApprovalSignature, setEisApprovalSignature] = useState([]);

  const [hasLimitations, setHasLimitations] = useState(formData?.employeeAccidentInfo?.hasLimitations || "no");

  console.log("eis doctors entry", formData);

  const fetchApplicationMovement = async () => {
    try {
      // 1. Get Application ID
      const firstAppId = formData?.id;

      if (!firstAppId) {
        console.log("No valid application ID found.");
        return;
      }

      // 2. Fetch Data
      const response = await dispatch(fetchApplicationWiseMovementList(modulesManager, { applicationId: firstAppId }));

      // 3. Parse Data
      let rawData = response?.payload?.data?.workforceApplicationMovement;
      let rawMovements = [];

      // Handle parsing if it's a string, or use directly if object
      if (typeof rawData === "string") {
        try {
          rawMovements = JSON.parse(rawData);
        } catch (e) {}
      } else {
        rawMovements = rawData || [];
      }

      // Ensure it is an array
      if (!Array.isArray(rawMovements)) rawMovements = [rawMovements];

      // 4. Extract Nodes from 'edges'
      let actualNodes = [];
      if (rawMovements.length > 0 && rawMovements[0]?.edges) {
        actualNodes = rawMovements[0].edges.map((edge) => edge.node);
      } else {
        actualNodes = rawMovements;
      }

      // 5. Extract IDs
      const senderIds = actualNodes
        .filter((item) => item?.status === "forward_to_doctor")
        .map((item) => {
          const node = item.node || item; // Handle if double nested
          return node?.applicationTo?.id ? safeDecodeId(node.applicationTo.id) : null;
        })
        .filter((id) => id !== null);

      console.log({ senderIds });

      console.log("Sender IDs List:", senderIds);
      await dispatch(fetchWorkforceSignatures([...senderIds])).then((res) => {
        console.log("signature response", res);
        setEisApprovalSignature(res?.payload?.data?.workforceSignatures);
      });

      // 6. Revert Note Logic
      const clean = (html) => html?.replace(/<\/?[^>]+(>|$)/g, "") || "";
      const lastRevert = [...actualNodes].reverse().find((m) => m.revertNote);
      if (lastRevert) lastRevert.revertNote = clean(lastRevert.revertNote);

      setMovements(actualNodes);
      setLastRevertMovement(lastRevert);
      setRevertNotes(lastRevert ? [lastRevert.revertNote] : []);
    } catch (error) {
      console.error("Failed to load application movements", error);
    }
  };

  useEffect(async () => {
    fetchApplicationMovement();
  }, []);

  const handleLimitationsChange = (event) => {
    const value = event.target.value;
    setHasLimitations(value);
    handleChange("hasLimitations", value);
  };

  console.log(eisApprovalSignature);
  return (
    <Box mt={2}>
      {user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
        <>
          <Typography className={classes.docTitle}>Employment Injury Scheme-Pilot</Typography>
          <Typography className={classes.docSubTitle}>Disability Assessment Meeting</Typography>
          <Typography className={classes.docText}>EIS PILOT Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka, 1000</Typography>
          <Typography className={classes.docText}>Email: specialunit@eis-pilot-bd.org, Phone: 01886-921030, Website: eis-pilot-bd.org</Typography>

          <Box mt={3} mb={1}>
            <Grid container justify="space-between">
              <Grid item>
                <Typography style={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Arial" }}>EIS-GB Sub Committee Meeting No: 16</Typography>
              </Grid>
              <Grid item>
                <Typography style={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Arial" }}>Date: {new Date().toLocaleDateString()}</Typography>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      <Paper className={classes.paper} elevation={0}>
        {/* <Typography mb={4} style={{ textAlign: "center", fontWeight: "bold", fontSize: "small", margin: "15px" }}>
          <FormattedMessage id="workforce.application.steps.treatment.info" module="workforce" />
        </Typography>

        <Divider style={{ margin: "16px 0" }} /> */}

        {/* Doctor Creation Section */}

        {/* Assessment Details */}
        <Typography variant="h6" className={classes.sectionTitle}>
          <FormattedMessage id="workforce.disability.assessmentDetails" defaultMessage="Assessment Details" />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <PublishedComponent
              pubRef="workforce.DatePicker"
              label="workforce.disability.dateOfAssessment"
              value={formData?.employeeAccidentInfo?.dateOfAssessment || formData?.doctorsEntry?.dateOfAssessment || ""}
              onChange={(v) => handleChange("dateOfAssessment", v)}
              required
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <TextInput
              label="workforce.disability.nameOfAssessmentMeeting"
              value={formData?.employeeAccidentInfo?.nameOfAssessmentMeeting || formData?.doctorsEntry?.nameOfAssessmentMeeting || ""}
              onChange={(v) => handleChange("nameOfAssessmentMeeting", v)}
              required
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <TextInput
              multiline
              rows={4}
              label="workforce.disability.briefInjuryDescription"
              value={formData?.employeeAccidentInfo?.briefInjuryDescription || formData?.doctorsEntry?.briefInjuryDescription || ""}
              onChange={(v) => handleChange("briefInjuryDescription", v)}
              required
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <TextInput
              multiline
              rows={4}
              label="workforce.disability.briefTreatmentDescription"
              value={formData?.employeeAccidentInfo?.briefTreatmentDescription || formData?.doctorsEntry?.briefTreatmentDescription || ""}
              onChange={(v) => handleChange("briefTreatmentDescription", v)}
              required
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              <FormattedMessage id="workforce.disability.physicalExamination" defaultMessage="Physical Examination Findings" />
            </Typography>
          </Grid>

          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <TextInput
              label="workforce.disability.injurySiteLocation"
              value={formData?.employeeAccidentInfo?.injurySiteLocation || formData?.doctorsEntry?.injurySiteLocation || ""}
              onChange={(v) => handleChange("injurySiteLocation", v)}
              required
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <TextInput
              //   multiline
              //   rows={4}
              label="workforce.disability.injuryDetailsDescription"
              value={formData?.employeeAccidentInfo?.injuryDetailsDescription || formData?.doctorsEntry?.injuryDetailsDescription || ""}
              onChange={(v) => handleChange("injuryDetailsDescription", v)}
              required
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={12} className={clsx(classes.item, classes.overrideReadOnly)}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              <FormattedMessage
                id="workforce.disability.observationCurrentCondition"
                defaultMessage="Observation After Evaluating the Current Condition of Employee"
              />
            </Typography>
          </Grid>
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <FormControl component="fieldset">
              <FormLabel>
                <FormattedMessage
                  id="workforce.disability.limitationsOccupationDailyLiving"
                  defaultMessage="Limitations in Occupation and Activities of Daily Living"
                />
              </FormLabel>
              <RadioGroup row value={hasLimitations || formData?.doctorsEntry?.hasLimitations} onChange={handleLimitationsChange}>
                <FormControlLabel value="yes" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.permission.yes" />} />
                <FormControlLabel value="no" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.application.permission.no" />} />
              </RadioGroup>
            </FormControl>
          </Grid>
          {/* <Grid item xs={6} className={classes.item}>
            <TextInput
              label="workforce.disability.lossOfEarningPercent"
              value={formData?.employeeAccidentInfo?.lossOfEarningPercent || ""}
              onChange={(v) => handleChange("lossOfEarningPercent", v)}
              type="number"
              required
            />
          </Grid> */}
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <TextInput
              label={"workforce.employee.accident.info.disabilityPerSchedule"}
              value={formData?.employeeAccidentInfo?.disabilityPerSchedule || formData?.doctorsEntry?.disabilityPerSchedule || ""}
              onChange={(v) => handleChange("disabilityPerSchedule", v)}
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
          <Grid item xs={6} className={clsx(classes.item, classes.overrideReadOnly)}>
            <TextInput
              label={"workforce.employee.accident.info.presentInjuryBLASchedule1"}
              value={formData?.employeeAccidentInfo?.presentInjuryBLASchedule1 || formData?.doctorsEntry?.presentInjuryBLASchedule1 || ""}
              onChange={(v) => handleChange("presentInjuryBLASchedule1", v)}
              readOnly={user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
            />
          </Grid>
        </Grid>
      </Paper>
      {user_type===WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
      <Box mt={4}>
        <Typography style={{ fontWeight: "bold", textDecoration: "underline", color: "#000" }}>Signature of EIS Doctors:</Typography>
        <Grid container spacing={2} className={classes.signatureContainer}>
          {eisApprovalSignature
            ?.filter((sig) => ["eis doctor"].includes(sig?.role?.name?.toLowerCase()))
            .map((sig, i) => (
              <Grid item xs={3} key={i}>
                {sig?.workforce_document?.url ? (
                  <img src={sig.workforce_document.url} alt="signature" style={{ width: "100%", maxHeight: 80, objectFit: "contain" }} />
                ) : (
                  <Typography variant="caption" style={{ fontStyle: "italic", color: "#999" }}>
                    Signature not available
                  </Typography>
                )}

                <div className={classes.signatureBlock}>
                  <p>{sig?.last_name}</p>
                  <p>{sig?.role?.name}</p>
                </div>
              </Grid>
            ))}
        </Grid>
      </Box>
      )}
    </Box>
  );
};

export default EisDoctorEntries;
