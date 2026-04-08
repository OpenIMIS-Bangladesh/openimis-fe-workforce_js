import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Button,
  Divider,
  Grid,
  Box,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useModulesManager, decodeId, FormattedMessage } from "@openimis/fe-core";
import { EIS_PAYMENT_TYPES, RELATION_LABEL_MAP, WORKFORCE_USER_TYPE } from "../../constants";
import { getApprovalStatus, getUserTypeFromRights, safeParse } from "../../utils/utils";
import {
  fetchEisPaymentProcess,
  eisPaymentProcessWithoutDate,
  updateWorkforceEisPaymentProcessApproval,
  updateWorkforceEisPaymentProcessPaymentType,
  fetchApplicationWiseMovementList,
  fetchWorkforceSignatures,
} from "../../actions";

// --- STYLES ---
const useStyles = makeStyles((theme) => ({
  noPrint: {
    "@media print": {
      display: "none !important",
    },
  },
  dialogPaper: {
    minWidth: "90vw",
    "@media print": {
      boxShadow: "none",
      border: "none",
      minWidth: "100%",
      margin: 0,
      maxWidth: "100% !important", // Ensure full width print
    },
  },
  dialogContent: {
    backgroundColor: "#fff",
    padding: theme.spacing(4),
    "@media print": {
      padding: "0px !important",
      overflow: "visible !important",
    },
  },
  // --- DOCUMENT STYLES ---
  docTitle: {
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center",
    textTransform: "uppercase",
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
  sectionTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    textDecoration: "underline",
    color: "#000",
  },
  // --- EXCEL-LIKE TABLE ---
  excelTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    "& th, & td": {
      border: "1px solid #000",
      padding: "5px",
      fontSize: "11px",
      fontFamily: "Arial, sans-serif",
      verticalAlign: "middle",
      color: "#000",
    },
    "& th": {
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
      textAlign: "center",
      "-webkit-print-color-adjust": "exact", // Chrome/Safari
      "print-color-adjust": "exact", // Firefox
    },
  },
  // --- SIGNATURES ---
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
  // --- GLOBAL PRINT FIX ---
  // This ensures only the content div is visible when printing
  "@global": {
    "@media print": {
      "body *": {
        visibility: "hidden",
      },
      "#printable-content, #printable-content *": {
        visibility: "visible",
      },
      "#printable-content": {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
      },
      // Hide scrollbars in print
      "html, body": {
        height: "100%",
        overflow: "hidden",
      },
    },
  },
}));

const EisApprovalSignature = ({ open, onClose, userRights, selectedApplicationIds }) => {
  const reduxState = useSelector((state) => state);
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [loading, setLoading] = useState(true);
  const [dataCreated, setDataCreated] = useState(false);
  const [paymentTypeMap, setPaymentTypeMap] = useState({});
  const [movements, setMovements] = useState([]);
  const [lastRevertMovement, setLastRevertMovement] = useState(null);
  const [revertNotes, setRevertNotes] = useState([]);
  const [eisPayments, setEisPayments] = useState([]);
  const [eisApprovalSignature, setEisApprovalSignature] = useState([]);
  const [approvedByIds, setApprovedByIds] = useState([]);

  const user_type = getUserTypeFromRights(userRights);

  const fetchApplicationMovement = async () => {
    try {
      // 1. Get Application ID
      const firstAppId = selectedApplicationIds?.[0]?.id ? decodeId(selectedApplicationIds[0].id) : null;

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
        } catch (e) { }
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
      const senderIds = [
        ...new Set(
          actualNodes
            .filter((item) => item?.status === "forward_to_comiitee")
            .map((item) => {
              const node = item.node || item; // Handle if double nested
              return node?.applicationTo?.id
                ? decodeId(node.applicationTo.id)
                : null;
            })
            .filter((id) => id !== null)
        ),
      ];
      await dispatch(fetchWorkforceSignatures([...senderIds])).then((res) => {
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

  // --- 1. DATA FETCHING LOGIC ---
  useEffect(async () => {
    if (selectedApplicationIds?.length > 0) {
      // Initialize map with existing values
      const initialMap = {};
      eisPayments.forEach((p, idx) => {
        initialMap[idx] = {
          eisPaymentType: p.eisPaymentType,
          approved: p.isApproved ? "yes" : "",
        };
      });
      setPaymentTypeMap(initialMap);

      setLoading(true);
      // Create payment process if needed
      for (const encodedId of selectedApplicationIds) {
        const eisPaymentData = {
          workforceApplicationId: decodeId(encodedId?.id),
        };
        await dispatch(eisPaymentProcessWithoutDate(eisPaymentData, "Create Payment Process"));
      }
      setLoading(false);
      const applicationIds = selectedApplicationIds.map((x) => decodeId(x.id));
      await dispatch(fetchEisPaymentProcess(applicationIds, modulesManager)).then((res) => {
        const fetchedData = res?.payload?.data?.workforceEisPaymentProcess;
        setEisPayments(fetchedData);
        setPaymentTypeMap(eisPayments);
      });
    }
    fetchApplicationMovement();
  }, [open]);

  // --- 2. CALCULATIONS ---
  const getMonthlyTotalAmount = () => {
    return eisPayments.reduce((sum, item) => sum + (parseFloat(item.eisInitialMonthlyAmount) || 0), 0).toFixed(2);
  };
  const getNetMonthlyTotalAmount = () => {
    return eisPayments.reduce((sum, item) => sum + (parseFloat(item.eisMonthlyAmount) || 0), 0).toFixed(2);
  };
  const getNetTotal = () => {
    return eisPayments.reduce((sum, item) => sum + (parseFloat(item.eisCalculatedAmount) || 0), 0).toFixed(2);
  };

  // --- 3. HANDLERS ---
  const handlePaymentTypeChange = async (paymentType, beneficiaryId, rowId) => {
    setPaymentTypeMap((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], eisPaymentType: paymentType },
    }));
    try {
      await dispatch(
        updateWorkforceEisPaymentProcessPaymentType({
          beneficiaryId,
          eisPaymentType: paymentType,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprovalChange = async (value, beneficiaryId, rowId) => {
    setPaymentTypeMap((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], approved: value },
    }));
    try {
      await dispatch(
        updateWorkforceEisPaymentProcessApproval({
          beneficiaryId,
          approved: value,
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  // --- 4. EXCEL GENERATION LOGIC (Restored) ---
  const exportToExcel = async () => {
    const first = eisPayments?.[0];
    if (!first) {
      alert("No data found!");
      return;
    }
    const organizationType = first?.workforceApplication?.organizationType;
    const applicationType = first?.workforceApplication?.applicationType;

    if (organizationType === "eis" && applicationType === "disabilityAssistance") {
      return exportDisabilityExcel(eisPayments);
    }
    if (organizationType === "eis" && applicationType === "financialAssistance") {
      return exportDeathExcel(eisPayments);
    }
    alert("Unsupported applicationType or organizationType");
  };

  // --- Disability Excel ---
  const exportDisabilityExcel = async (eisPayments) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Benefit Approval Note");

    // ==========================
    // Set column widths
    // ==========================
    sheet.columns = [
      { width: 20 }, // A
      { width: 25 }, // B
      { width: 15 }, // C (gap)
      { width: 25 }, // D
      { width: 25 }, // E
      { width: 15 }, // F (gap)
      { width: 20 }, // G
      { width: 20 }, // H
      { width: 20 }, // I
    ];

    // ==========================
    // Top Headers
    // ==========================
    sheet.mergeCells("A1:I1");
    sheet.getCell("A1").value = "Employment Injury Scheme-Pilot";
    sheet.getCell("A1").font = { bold: true, size: 16 };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:I2");
    sheet.getCell("A2").value = "Benefit Approval Note (Disability)";
    sheet.getCell("A2").font = { bold: true, size: 14 };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.mergeCells("A3:I3");
    sheet.getCell("A3").value = "EIS PILOT Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka, 1000";
    sheet.getCell("A3").alignment = { horizontal: "center" };

    sheet.mergeCells("A4:I4");
    sheet.getCell("A4").value = "Email: specialunit@eis-pilot-bd.org, Phone: 01886-921030, Website: eis-pilot-bd.org";
    sheet.getCell("A4").alignment = { horizontal: "center" };

    // ==========================
    // Meeting Info
    // ==========================
    sheet.mergeCells("A6:F6");
    sheet.getCell("A6").value = "EIS-GB Sub Committee Meeting No:16";
    sheet.getCell("A6").font = { bold: true };
    sheet.getCell("A6").alignment = { horizontal: "left" };

    sheet.mergeCells("G6:I6");
    sheet.getCell("G6").value = "Date: " + (typeof benefitDate !== 'undefined' ? benefitDate : ""); // handling variable scope safety
    sheet.getCell("G6").font = { bold: true };
    sheet.getCell("G6").alignment = { horizontal: "right" };

    // ==========================
    // Worker, Factory & Accident Information
    // ==========================
    const data = eisPayments?.[0] || {};
    const parsingAccidentInfo = JSON.parse(data.workforceApplication?.employeeAccidentInfo || "{}");
    const parsedAccidentInfo = typeof parsingAccidentInfo === 'string' ? JSON.parse(parsingAccidentInfo) : parsingAccidentInfo;
    const parsingDoctorEntry = JSON.parse(data.workforceApplication?.doctorsEntry || "{}");
    const parsedDoctorEntry = typeof parsingDoctorEntry === 'string' ? JSON.parse(parsingDoctorEntry) : parsingDoctorEntry;

    const dateOfRejoining = parsedAccidentInfo?.dateOfRejoining || "";
    const dateOfAssessment = parsedDoctorEntry?.dateOfAssessment || "";
    const accidentDate = parsedAccidentInfo?.accidentDate || "";
    const effectiveDate = parsedAccidentInfo?.dateOfDeath || "";

    // LOGIC CHANGE: Exclude "Date of Death" for Disability Excel
    const leftItems = [
      ["EIS Worker ID", data?.beneficiaryId || ""],
      ["Date of Accident", accidentDate || ""],
      ["Date of Rejoining", dateOfRejoining],
      ["Date of Disability Assessment", dateOfAssessment],
      ["Effective date of Benefit", dateOfRejoining || dateOfAssessment || ""],
    ];

    const rightItems = [
      ["Name of the Factory", data.workforceApplication?.employeeFactory?.nameEn || ""],
      ["Name of Association", data.workforceApplication?.associationType || ""],
      ["Gross Salary (BDT)", data.workforceApplication?.lastBaseSalary || ""],
      ["Percentage of Disability", parsedDoctorEntry?.disabilityPerSchedule || ""],
      ["Type of Accident", (parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.workplace" ? "Workplace Accident" : parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.onDutyRTA" ? "On Duty RTA" : "Commuting") || ""],
    ];

    // Section Title
    const titleRow = sheet.addRow([]);
    sheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
    sheet.getCell(`A${titleRow.number}`).value = "Worker, Factory & Accident Information:";
    sheet.getCell(`A${titleRow.number}`).font = { bold: true };
    sheet.getCell(`A${titleRow.number}`).alignment = { horizontal: "left" };

    // Add combined rows (Left + Right)
    // LOGIC CHANGE: Dynamic loop length to handle array sizes safely
    const maxRows = Math.max(leftItems.length, rightItems.length);

    for (let i = 0; i < maxRows; i++) {
      const row = sheet.addRow([
        leftItems[i]?.[0] || "",
        leftItems[i]?.[1] || "",
        "", // gap
        rightItems[i]?.[0] || "",
        rightItems[i]?.[1] || "",
        "", // gap
      ]);

      ["A", "B", "D", "E"].forEach((col) => {
        const cell = sheet.getCell(`${col}${row.number}`);
        // Only draw border if there is content or it's within the valid list range
        if (i < leftItems.length && (col === 'A' || col === 'B')) {
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        }
        if (i < rightItems.length && (col === 'D' || col === 'E')) {
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        }

        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        if (col === "A" || col === "D") cell.font = { bold: true };
      });
    }

    // ==========================
    // Separate EIS Payments Table
    // ==========================
    sheet.addRow([]);
    const benefitTitle = sheet.addRow(["Benefit Information:"]);
    benefitTitle.font = { bold: true, size: 12 };
    benefitTitle.alignment = { horizontal: "left" };
    sheet.addRow([]);

    const tableHeader = [
      "Sl #", "EIS Worker ID", "NID/Birth Certificate of Worker", "Benefit Rate (%) of Gross Salary",
      "Monthly Payable Benefit (BDT)", "Net Monthly Payable After Adjustment (BDT)",
      // "Total time amount (individual)", "After adjustment (individual)",
      "Type of Payment", "Approval Status", "Remarks",
    ];

    const headerRow = sheet.addRow(tableHeader);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: "white" };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    let totalMonthly = 0;
    let totalNet = 0;
    let benefitRateTotal = null;

    eisPayments.forEach((row, index) => {
      const benefitRate = Number(row?.eisInitialReplacementRate) || 0;
      if (benefitRateTotal === null) benefitRateTotal = benefitRate;

      const excelRow = sheet.addRow([
        index + 1,
        row?.beneficiaryId || "",
        row?.workforceApplication?.applicationType === 'financialAssistance' ? row?.workforceEmployeeDependent?.[0]?.nid : row?.workforceApplication?.workforceEmployee?.nid || "",
        `${benefitRate * 100}%`,
        Number(row?.eisInitialMonthlyAmount || 0).toFixed(2),
        Number(row?.eisMonthlyAmount || 0).toFixed(2),
        // row?.eisCalculatedAmount || 0,
        // row?.eisApprovedAmount || 0,
        row?.eisPaymentType || "",
        row?.approvalStatus || "",
        "",
      ]);

      totalMonthly += Number(row?.eisInitialMonthlyAmount || 0);
      totalNet += Number(row?.eisMonthlyAmount || 0);

      excelRow.eachCell((cell) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      });
    });

    const totalRow = sheet.addRow(["Total", "", "", ``, Number(totalMonthly).toFixed(2), Number(totalNet).toFixed(2), "", "", "", "", ""]);
    totalRow.eachCell((cell, col) => {
      if (col === 1 || col === 4) cell.font = { bold: true };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // ==========================
    // Footer
    // ==========================
    sheet.addRow([]); sheet.addRow([]); sheet.addRow([]);
    const footerHeader = sheet.addRow(["Signature of EIS-GB Sub Committee Members:"]);
    footerHeader.font = { bold: true, size: 13 };
    footerHeader.alignment = { horizontal: "left" };
    sheet.addRow([]); sheet.addRow([]); sheet.addRow([]);

    const signatureBlocks = [
      ["President-BAWF &\nExecutive Member,\nIBC\nMember\nEIS-GB Sub\nCommittee"],
      ["President-SLF\n& Member- NCCWE\nMember\nEIS-GB Sub\nCommittee"],
      ["Director\nBKMEA\nMember\nEIS-GB Sub\nCommittee"],
      ["Chairman,\nLabour & ILO Standing\nCommittee\nBGMEA\nMember\nEIS-GB Sub Committee"],
      ["Inspector General,\nDIFE\nMember\nEIS-GB Sub\nCommittee"],
      ["Director General,\nDepartment of Labour\nMember\nEIS-GB Sub Committee"],
      ["Director General,\nCentral Fund\nMember Secretary\nEIS-GB Sub Committee"],
      ["Additional Secretary,\nI.O. Wing, MoLE\nChairman\nEIS-GB Sub Committee"],
    ];

    const underlineRow = sheet.addRow(signatureBlocks.map(() => "__________________"));
    underlineRow.height = 20;
    underlineRow.eachCell((cell) => { cell.font = { bold: true }; cell.alignment = { horizontal: "left", vertical: "bottom" }; });

    const textRow = sheet.addRow(signatureBlocks.map((sig) => sig[0]));
    textRow.height = 70;
    textRow.eachCell((cell) => { cell.alignment = { horizontal: "left", vertical: "top", wrapText: true }; });

    sheet.addRow([]);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "Benefit Approval Note-Disability.xlsx");
  };


  const exportDeathExcel = async (eisPayments) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Benefit Approval Note");

    // ==========================
    // Set column widths
    // ==========================
    sheet.columns = [
      { width: 20 }, // A
      { width: 25 }, // B
      { width: 15 }, // C (gap)
      { width: 25 }, // D
      { width: 25 }, // E
      { width: 15 }, // F (gap)
      { width: 20 }, // G
      { width: 20 }, // H
      { width: 20 }, // I
      { width: 20 }, // J
    ];

    // ==========================
    // Top Headers
    // ==========================
    sheet.mergeCells("A1:I1");
    sheet.getCell("A1").value = "Employment Injury Scheme-Pilot";
    sheet.getCell("A1").font = { bold: true, size: 16 };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:I2");
    sheet.getCell("A2").value = "Benefit Approval Note (Death)";
    sheet.getCell("A2").font = { bold: true, size: 14 };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.mergeCells("A3:I3");
    sheet.getCell("A3").value = "EIS PILOT Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka, 1000";
    sheet.getCell("A3").alignment = { horizontal: "center" };

    sheet.mergeCells("A4:I4");
    sheet.getCell("A4").value = "Email: specialunit@eis-pilot-bd.org, Phone: 01886-921030, Website: eis-pilot-bd.org";
    sheet.getCell("A4").alignment = { horizontal: "center" };

    // ==========================
    // Meeting Info
    // ==========================
    sheet.mergeCells("A6:F6");
    sheet.getCell("A6").value = "EIS-GB Sub Committee Meeting No:16";
    sheet.getCell("A6").font = { bold: true };
    sheet.getCell("A6").alignment = { horizontal: "left" };

    sheet.mergeCells("G6:I6");
    sheet.getCell("G6").value = "Date: 10/15/2025";
    sheet.getCell("G6").font = { bold: true };
    sheet.getCell("G6").alignment = { horizontal: "right" };

    // ==========================
    // Worker, Factory & Accident Information
    // ==========================
    const data = eisPayments?.[0] || {};
    const parsingAccidentInfo = JSON.parse(data.workforceApplication?.employeeAccidentInfo || "{}");
    const parsedAccidentInfo = typeof parsingAccidentInfo === 'string' ? JSON.parse(parsingAccidentInfo) : parsingAccidentInfo;
    const parsingDoctorEntry = JSON.parse(data.workforceApplication?.doctorsEntry || "{}");
    const parsedDoctorEntry = typeof parsingDoctorEntry === 'string' ? JSON.parse(parsingDoctorEntry) : parsingDoctorEntry;

    // We keep all variable extractions here as requested (don't remove fields)
    const dateOfRejoining = parsedAccidentInfo?.dateOfRejoining || "";
    const dateOfAssessment = parsedDoctorEntry?.dateOfAssessment || "";
    const effectiveDate = dateOfRejoining || dateOfAssessment || "";
    const accidentDate = parsedAccidentInfo?.accidentDate || "";
    const dateOfDeath = parsedAccidentInfo?.dateOfDeath || "";

    // LOGIC CHANGE: Exclude Rejoining, Assessment from Left
    // Items are now: Worker ID, Death Date, Accident Date, Effective Date
    const leftItems = [
      ["EIS Worker ID", data?.beneficiaryId || ""],
      ["Date of Death", dateOfDeath || ""],
      ["Date of Accident", accidentDate || ""],
      // Removed: ["Date of Rejoining", dateOfRejoining],
      // Removed: ["Date of Disability Assessment", dateOfAssessment],
      ["Effective date of Benefit", effectiveDate],
    ];

    // LOGIC CHANGE: Exclude Percentage of Disability from Right
    // Items are now: Factory, Association, Salary, Type of Accident
    const rightItems = [
      ["Name of the Factory", data.workforceApplication?.employeeFactory?.nameEn || ""],
      ["Name of Association", data.workforceApplication?.associationType || ""],
      ["Gross Salary (BDT)", data.workforceApplication?.lastBaseSalary || ""],
      // Removed: ["Percentage of Disability", parsedDoctorEntry?.disabilityPerSchedule || ""],
      ["Type of Accident", (parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.workplace" ? "Workplace Accident" : parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.onDutyRTA" ? "On Duty RTA" : "Commuting") || ""],
    ];

    // Section Title
    const titleRow = sheet.addRow([]);
    sheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
    sheet.getCell(`A${titleRow.number}`).value = "Worker, Factory & Accident Information:";
    sheet.getCell(`A${titleRow.number}`).font = { bold: true };
    sheet.getCell(`A${titleRow.number}`).alignment = { horizontal: "left" };

    // Add combined rows (Left + Right)
    // LOGIC CHANGE: Calculate loop length dynamically instead of fixed 5
    const maxRows = Math.max(leftItems.length, rightItems.length);

    for (let i = 0; i < maxRows; i++) {
      const row = sheet.addRow([
        leftItems[i]?.[0] || "",
        leftItems[i]?.[1] || "",
        "", // gap
        rightItems[i]?.[0] || "",
        rightItems[i]?.[1] || "",
        "", // gap
      ]);

      ["A", "B", "D", "E"].forEach((col) => {
        const cell = sheet.getCell(`${col}${row.number}`);

        // Only draw borders if content exists for this side
        if (i < leftItems.length && (col === 'A' || col === 'B')) {
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        }
        if (i < rightItems.length && (col === 'D' || col === 'E')) {
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        }

        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        if (col === "A" || col === "D") cell.font = { bold: true };
      });
    }

    // ==========================
    // Separate EIS Payments Table
    // ==========================
    sheet.addRow([]);
    const benefitTitle = sheet.addRow(["Benefit Information:"]);
    benefitTitle.font = { bold: true, size: 12 };
    benefitTitle.alignment = { horizontal: "left" };
    sheet.addRow([]);

    const tableHeader = [
      "Sl #", "EIS Beneficiary ID", "NID/Birth Certificate of Worker", "Relationship with worker",
      "Benefit Rate (%) of Gross Salary", "Monthly Payable Benefit (BDT)", "Net Monthly Payable After Adjustment (BDT)",
      // "Total time amount (individual)", "After adjustment (individual)",
      "Type of Payment", "Approval Status", "Remarks",
    ];

    const headerRow = sheet.addRow(tableHeader);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: "white" };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    let totalMonthly = 0;
    let totalNet = 0;
    let benefitRateTotal = null;

    eisPayments.forEach((row, index) => {
      const benefitRate = Number(row?.eisInitialReplacementRate) || 0;
      if (benefitRateTotal === null) { benefitRateTotal = benefitRate; }

      const excelRow = sheet.addRow([
        index + 1,
        row?.beneficiaryId,
        row?.workforceApplication?.applicationType === 'financialAssistance' ? row?.workforceEmployeeDependent?.[0]?.nid : row?.workforceApplication?.workforceEmployee?.nid || "",
        // Note: Ensure RELATION_LABEL_MAP is defined in your component scope
        (typeof RELATION_LABEL_MAP !== 'undefined' ? RELATION_LABEL_MAP[row?.workforceEmployeeDependent?.[0]?.relationWithWorker] : row?.workforceEmployeeDependent?.[0]?.relationWithWorker) || "",
        `${benefitRate * 100}%`,
        Number(row?.eisInitialMonthlyAmount || 0).toFixed(2),
        Number(row?.eisMonthlyAmount || 0).toFixed(2),
        // row?.eisCalculatedAmount || 0,
        // row?.eisApprovedAmount || 0,
        row?.eisPaymentType || "",
        row?.approvalStatus || "",
        "",
      ]);

      totalMonthly += Number(row?.eisInitialMonthlyAmount || 0);
      totalNet += Number(row?.eisMonthlyAmount || 0);

      excelRow.eachCell((cell) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      });
    });

    const totalRow = sheet.addRow(["Total", "", "", "", "", "", Number(totalMonthly).toFixed(2), "", Number(totalNet).toFixed(2), "", "", ""]);
    totalRow.eachCell((cell, col) => {
      if (col === 1 || col === 4) cell.font = { bold: true };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // ==========================
    // Footer
    // ==========================
    sheet.addRow([]); sheet.addRow([]); sheet.addRow([]);
    const footerHeader = sheet.addRow(["Signature of EIS-GB Sub Committee Members:"]);
    footerHeader.font = { bold: true, size: 13 };
    footerHeader.alignment = { horizontal: "left" };
    sheet.addRow([]); sheet.addRow([]); sheet.addRow([]);

    const signatureBlocks = [
      ["Executive Member\nIBC\nMember.\nEIS-GB Sub Committee"],
      ["Member,\nNCCWE.\nMember.\nEIS-GB Sub Committee"],
      ["Vice President\nBKMEA\nMember.\nEIS-GB Sub Committee"],
      ["Chairman,\nLabour & ILO Standing Committee\nBGMEA\nMember.\nEIS-GB Sub Committee"],
      ["Director General,\nDepartment of Labour\nMember Secretary.\nEIS-GB Sub Committee"],
      ["Director General,\nCentral Fund\nMember Secretary.\nEIS-GB Sub Committee"],
      ["Additional Secretary,\nI.O. Wing, MoLE\nChairman.\nEIS-GB Sub Committee"]
    ];

    const underlineRow = sheet.addRow(signatureBlocks.map(() => "__________________"));
    underlineRow.height = 20;
    underlineRow.eachCell((cell) => { cell.font = { bold: true }; cell.alignment = { horizontal: "left", vertical: "bottom" }; });

    const textRow = sheet.addRow(signatureBlocks.map((sig) => sig[0]));
    textRow.height = 70;
    textRow.eachCell((cell) => { cell.alignment = { horizontal: "left", vertical: "top", wrapText: true }; });

    sheet.addRow([]);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "Benefit Approval Note-Death.xlsx");
  };

  // --- 5. UI PREPARATION ---
  const firstData = eisPayments?.[0] || {};
  const appType = firstData?.workforceApplication?.applicationType;
  const isDeathCase = appType === "financialAssistance";


  // Parse JSONs for UI
  let parsedAccidentInfo = {};
  let parsedDoctorEntry = {};
  try {
    const rawAccident = firstData?.workforceApplication?.employeeAccidentInfo;
    if (rawAccident) parsedAccidentInfo = JSON.parse(JSON.parse(rawAccident));
    const rawDoctor = firstData?.workforceApplication?.doctorsEntry;
    if (rawDoctor) parsedDoctorEntry = JSON.parse(JSON.parse(rawDoctor));
  } catch (e) { }

  const dateOfRejoining = parsedAccidentInfo?.dateOfRejoining || "";
  const dateOfAssessment = parsedDoctorEntry?.dateOfAssessment || "";
  const effectiveDate = dateOfRejoining || dateOfAssessment || "";

  // Signature Blocks
  const signatureBlocks = [
    "President-BAWF & \n Executive Member, IBC \n Member \n EIS-GB Sub Committee",
    "President-SLF & \n Member- NCCWE \n Member \n EIS-GB Sub Committee",
    "Director \n BKMEA \n Member \n EIS-GB Sub Committee",
    "Chairman, \n Labour & ILO Standing Committee \n BGMEA \n Member \n EIS-GB Sub Committee",
    "Inspector General, \n DIFE \n Member \n EIS-GB Sub Committee",
    "Director General, \n Department of Labour \n Member Secretary \n EIS-GB Sub Committee",
    "Director General, \n Central Fund \n Member Secretary \n EIS-GB Sub Committee",
    "Additional Secretary, \n I.O. Wing, MoLE \n Chairman \n EIS-GB Sub Committee",
  ];

  // --- RENDER ---
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth classes={{ paper: classes.dialogPaper }}>
      <DialogTitle disableTypography className={classes.noPrint}>
        <Typography variant="h6">
          <FormattedMessage id="Preview & Print Approval Note" />
        </Typography>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress /> <span style={{ marginLeft: 10 }}>Loading...</span>
          </Box>
        ) : (
          /* THIS ID "printable-content" IS KEY FOR THE PRINT FIX */
          <div id="printable-content">
            {/* 1. HEADER */}
            <Typography className={classes.docTitle}>Employment Injury Scheme-Pilot</Typography>
            <Typography className={classes.docSubTitle}>Benefit Approval Note ({isDeathCase ? "Death" : "Disability"})</Typography>
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

            {/* 2. INFO GRIDS */}
            <Typography className={classes.sectionTitle}>Worker, Factory & Accident Information:</Typography>
            <table className={classes.excelTable} style={{ marginTop: 0 }}>
              <tbody>
                <tr>
                  <td style={{ width: "20%", fontWeight: "bold" }}>EIS Worker ID</td>
                  <td style={{ width: "25%" }}>{firstData?.beneficiaryId || ""}</td>
                  <td style={{ width: "5%", border: "none" }}></td>
                  <td style={{ width: "20%", fontWeight: "bold" }}>Name of the Factory</td>
                  <td style={{ width: "25%" }}>{firstData.workforceApplication?.employeeFactory?.nameEn || ""}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>Date of Accident</td>
                  <td>{parsedAccidentInfo?.accidentDate || ""}</td>
                  <td style={{ border: "none" }}></td>
                  <td style={{ fontWeight: "bold" }}>Name of Association</td>
                  <td>{firstData.workforceApplication?.associationType || ""}</td>
                </tr>
                {firstData.workforceApplication?.applicationType === "disabilityAssistance" && (
                  <>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Date of Rejoining</td>
                      <td>{dateOfRejoining}</td>
                      <td style={{ border: "none" }}></td>
                      <td style={{ fontWeight: "bold" }}>Gross Salary (BDT)</td>
                      <td>{firstData.workforceApplication?.lastBaseSalary || ""}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Date of Disability Assessment</td>
                      <td>{dateOfAssessment}</td>
                      <td style={{ border: "none" }}></td>
                      <td style={{ fontWeight: "bold" }}>Percentage of Disability</td>
                      <td>{parsedDoctorEntry?.disabilityPerSchedule || ""}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td style={{ fontWeight: "bold" }}>Effective date of Benefit</td>
                  <td>{firstData?.workforceApplication?.applicationType === "financialAssistance" ? parsedAccidentInfo?.dateOfDeath : dateOfRejoining || dateOfAssessment || parsedAccidentInfo?.accidentDate || ""}</td>
                  <td style={{ border: "none" }}></td>
                  <td style={{ fontWeight: "bold" }}>Type of Accident</td>
                  <td>
                    {parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.workplace"
                      ? "Workplace Accident"
                      : parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.onDutyRTA"
                        ? "On Duty RTA"
                        : "Commuting"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 3. MAIN TABLE */}
            <Typography className={classes.sectionTitle}>Benefit Information:</Typography>
            <table className={classes.excelTable}>
              <thead>
                <tr>
                  <th>Sl #</th>
                  <th>EIS Worker/Beneficiary ID</th>
                  {/* <th>Worker Name</th> */}
                  <th>NID/Birth Certificate of {isDeathCase ? " Beneficiary" : " Worker"}</th>
                  {isDeathCase ? <th>Relation with worker</th> : null}
                  <th>Benefit Rate (%)</th>
                  {[WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE, WORKFORCE_USER_TYPE.EIS_COMMITTEE].includes(user_type)
                    ? null
                    :
                    (
                      firstData?.workforceApplication?.status && firstData?.workforceApplication?.status != "approved_by_committee" ? (
                        <>
                          <th>Total Time Amount</th>
                          <th>After Adjustment</th>
                        </>
                      ) : null
                    )}
                  <th>Monthly Payable (BDT)</th>
                  <th>Net Payable (BDT)</th>
                  <th>Payment Type</th>
                  <th>Approval Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {eisPayments.map((row, index) => {
                  const benefitRate = row?.eisInitialReplacementRate ? Number(row.eisInitialReplacementRate) * 100 : 0;
                  const currentPaymentType = paymentTypeMap[index]?.eisPaymentType || row?.eisPaymentType || "";
                  const currentApproval = paymentTypeMap[index]?.approved || (row?.isApproved ? "yes" : "");

                  return (
                    <tr key={index}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{row?.beneficiaryId}</td>
                      {/* <td>{row?.workforceApplication?.workforceEmployee?.firstNameEn}</td> */}
                      <td>{row?.workforceApplication?.applicationType === 'financialAssistance' ? row?.workforceEmployeeDependent?.[0]?.nid : row?.workforceApplication?.workforceEmployee?.nid}</td>
                      {/* <td>
                        {row?.workforceEmployeeDependent?.length > 0
                          ? `${row.workforceEmployeeDependent[0].nameEn} (${RELATION_LABEL_MAP[row.workforceEmployeeDependent[0].relationWithWorker] || ""})`
                          : "N/A"}
                      </td> */}
                      {
                        isDeathCase ? (
                          <td>
                            {row?.workforceEmployeeDependent?.length > 0
                              ? (RELATION_LABEL_MAP[row.workforceEmployeeDependent[0].relationWithWorker] || row.workforceEmployeeDependent[0].relationWithWorker || "N/A")
                              : "N/A"}
                          </td>
                        ) : null
                      }
                      <td style={{ textAlign: "center" }}>{benefitRate}%</td>
                      {[WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE, WORKFORCE_USER_TYPE.EIS_COMMITTEE].includes(user_type)
                        ? null
                        : (
                          firstData?.workforceApplication?.status && firstData?.workforceApplication?.status != "approved_by_committee" ? (
                            <>
                              <td style={{ textAlign: "right" }}>{row?.eisCalculatedAmount}</td>
                              <td style={{ textAlign: "right" }}>{row?.eisApprovedAmount}</td>
                            </>
                          ) : null
                        )
                      }
                      <td style={{ textAlign: "right" }}>{Number(row?.eisInitialMonthlyAmount || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>{Number(row?.eisMonthlyAmount || 0).toFixed(2)}</td>

                      {/* Interactive Controls (Hidden in Print via text replacement logic or CSS) */}
                      <td style={{ textAlign: "center" }}>
                        <>
                          {/* Text for print */}
                          {EIS_PAYMENT_TYPES[row?.eisPaymentType]}
                          {/* <span style={{ display: "none" }} className="print-show">
                              {EIS_PAYMENT_TYPES[currentPaymentType] || currentPaymentType}
                            </span> */}
                          {/* Simple inline style hack for print text */}
                          <style>{`@media print { .print-show { display: block !important; } }`}</style>
                        </>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <>
                          {getApprovalStatus(row?.approved)}
                          {/* <span style={{ display: "none" }} className="print-show">
                              {getApprovalStatus(row?.isApproved)}
                            </span> */}
                        </>
                      </td>
                      <td>{row?.paymentTypeRemarks ?? ""}</td>
                    </tr>
                  );
                })}
                {/* Totals */}
                <tr>
                  <td colSpan={[
                    WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE, WORKFORCE_USER_TYPE.EIS_COMMITTEE].includes(user_type)
                    ?
                    (isDeathCase ? 5 : 4)
                    :
                    firstData?.workforceApplication?.status && firstData?.workforceApplication?.status != "approved_by_committee"
                      ?
                      (isDeathCase ? 7 : 6)
                      :
                      (isDeathCase ? 5 : 4)
                  } style={{ textAlign: "right", fontWeight: "bold" }}>
                    Total:
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>{Number(getMonthlyTotalAmount() || 0).toFixed(2)}</td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>{Number(getNetMonthlyTotalAmount() || 0).toFixed(2)}</td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>
            </table>

            {/* 4. FOOTER */}
            <Box mt={4}>
              <Typography style={{ fontWeight: "bold", textDecoration: "underline", color: "#000" }}>Signature of EIS-GB Sub Committee Members:</Typography>
              <Grid container spacing={2} className={classes.signatureContainer}>
                {eisApprovalSignature
                  ?.filter((sig) => ["eis committee", "eis association committee"].includes(sig?.role?.name?.toLowerCase()))
                  .map((sig, i) => {
                    const approvedByUserIds = safeParse(eisPayments[0]?.workforceApplication?.eisApprovedByIds)
                    const isSignatureAvailable = approvedByUserIds?.includes(Number(sig?.user_id));
                    if (isSignatureAvailable) {
                      return (
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
                      )
                    }
                  })}
              </Grid>
            </Box>
          </div>
        )}
      </DialogContent>

      <Divider />

      <DialogActions className={classes.noPrint}>
        <Button onClick={onClose} variant="outlined" color="primary">
          <FormattedMessage id="workforce.modal.close" />
        </Button>

        <Button onClick={() => window.print()} variant="contained" color="primary">
          <FormattedMessage id="workforce.modal.print" />
        </Button>

        <Button onClick={exportToExcel} variant="contained" style={{ backgroundColor: "#4caf50", color: "white" }}>
          <FormattedMessage id="workforce.modal.excel" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EisApprovalSignature;
