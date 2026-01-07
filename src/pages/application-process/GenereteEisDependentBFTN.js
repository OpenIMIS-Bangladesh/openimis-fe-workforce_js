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
} from '@material-ui/core';
import { EIS_PAYMENT_TYPES, RELATION_LABEL_MAP, WORKFORCE_USER_TYPE } from "../../constants";
import { getApprovalStatus, getUserType, getUserTypeFromRights, isBase64Encoded } from "../../utils/utils";
import ForwardIcon from "@material-ui/icons/Forward";
import { WORKFORCE_STATUS } from "../../constants";
import { createApplicationSummary, testWorkforcePayment, updateApplication, updateApplicationSummary, updateWorkforceEisPaymentProcessApproval, updateWorkforceEisPaymentProcessPaymentType } from "../../actions";
import { useDispatch, useSelector } from "react-redux";
import React, { Component, useState, useEffect } from "react";
import { enToBn } from '../../utils/utils';
import { CircularProgress } from "@material-ui/core";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  useModulesManager,
  decodeId,
  FormattedMessage,
  parseData
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  dialogPaper: {
    '@media print': {
      boxShadow: 'none',
      border: 'none',
    },
  },
  dialogContent: {
    '@media print': {
      padding: 0,
    },
  },
}));
import { fetchEisPaymentProcess, eisPaymentProcessWithoutDate } from "../../actions";

const GenereteEisDependentBFTN = ({ open, onClose, userRights, status, summary_Id, selectedApplicationIds }) => {
  const reduxState = useSelector((state) => state);
  const [eisPayments, setEisPayments] = useState([]);
  const fetchedEisPayments = useSelector((state) => state?.worforce?.eisPayments) || [];
  const locale = reduxState?.core?.user?.i_user?.language || 'en';
  const classes = useStyles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [paymentTypeMap, setPaymentTypeMap] = useState([]);
  const [appType, setAppType] = useState("");
  const [benefitDate, setBenefitDate] = useState("");

  const getTotalAmount = () => {
    return eisPayments
      .reduce((sum, item) => sum + (parseFloat(item.eisMonthlyAmount) || 0), 0)
      .toFixed(2);
  };



  useEffect(async () => {
    if (selectedApplicationIds?.length > 0) {
      setLoading(true);
      // setDataCreated(false);

      for (const encodedId of selectedApplicationIds) {
        const eisPaymentData = {
          workforceApplicationId: isBase64Encoded(encodedId?.id) ? decodeId(encodedId?.id) : encodedId?.id,
        };

        await dispatch(
          eisPaymentProcessWithoutDate(eisPaymentData, "Create Payment Process")
        );
      }

      // setDataCreated(true);
      setLoading(false);

      const applicationIds = selectedApplicationIds.map(x =>
        isBase64Encoded(x.id) ? decodeId(x.id) : x.id
      );

      await dispatch(fetchEisPaymentProcess(applicationIds)).then((res) => {
        const fetchedData = res?.payload?.data?.workforceEisPaymentProcess;
        setEisPayments(fetchedData);
        setPaymentTypeMap(fetchedData);
        const first = fetchedData?.[0];
        if (first?.workforceApplication?.applicationType == 'disabilityAssistance') {
          setAppType("Disability");
        } else if (first?.workforceApplication?.applicationType == 'financialAssistance') {
          setAppType("Death");
        }
        console.log("fetchedEisPayments", fetchedData);
        setBenefitDate(first?.workforceApplication?.dateCreated ? first?.workforceApplication?.dateCreated.split("T")[0] : "fg");
        // setBenefitDate(first?.workforceApplication?.dateCreated ? new Date(first?.workforceApplication?.dateCreated).toLocaleDateString("en-BD", {
        //   timeZone: "Asia/Dhaka",
        // }) : "fg");
      })
    }
  }, [open]);



  // -----------------------------
  // Excel generator (unchanged)
  // -----------------------------
  const exportToExcel = async () => {
    const first = eisPayments?.[0];

    if (!first) {
      alert("No data found!");
      return;
    }

    const organizationType = first?.workforceApplication?.organizationType;
    const applicationType = first?.workforceApplication?.applicationType;

    // ==========================
    //  DISABILITY EXCEL
    // ==========================
    if (
      organizationType === "eis" &&
      applicationType === "disabilityAssistance"
    ) {
      return exportDisabilityExcel(eisPayments);
    }

    // ==========================
    //  FINANCIAL ASSISTANCE EXCEL
    // ==========================
    if (
      organizationType === "eis" &&
      applicationType === "financialAssistance"
    ) {
      return exportDeathExcel(eisPayments);
    }

    // DEFAULT
    alert("Unsupported applicationType or organizationType");
  };

  const exportDisabilityExcel = async (eisPayments) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Benefit Approval Note");


    // ==========================
    // Set column widths (first table + spacing)
    // ==========================
    sheet.columns = [
      { width: 20 }, // A
      { width: 25 }, // B
      { width: 15 },  // C (gap)
      { width: 25 }, // D
      { width: 25 }, // E
      { width: 15 },  // F (gap)
      { width: 20 }, // G - last table columns
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
    sheet.getCell("A3").value =
      "EIS PILOT Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka, 1000";
    sheet.getCell("A3").alignment = { horizontal: "center" };

    sheet.mergeCells("A4:I4");
    sheet.getCell("A4").value =
      "Email: specialunit@eis-pilot-bd.org, Phone: 01886-921030, Website: eis-pilot-bd.org";
    sheet.getCell("A4").alignment = { horizontal: "center" };

    // ==========================
    // Meeting Info + Worker Info (no gap)
    // ==========================
    // Meeting Info
    sheet.mergeCells("A6:F6");
    sheet.getCell("A6").value = "EIS-GB Sub Committee Meeting No:16";
    sheet.getCell("A6").font = { bold: true };
    sheet.getCell("A6").alignment = { horizontal: "left" };

    sheet.mergeCells("G6:I6");
    sheet.getCell("G6").value = "Date: " + benefitDate;
    sheet.getCell("G6").font = { bold: true };
    sheet.getCell("G6").alignment = { horizontal: "right" };

    // Worker, Factory & Accident Information
    const data = eisPayments?.[0] || {};
    const parsingAccidentInfo = JSON.parse(data.workforceApplication?.employeeAccidentInfo);
    const parsedAccidentInfo = JSON.parse(parsingAccidentInfo);
    const parsingDoctorEntry = JSON.parse(data.workforceApplication?.doctorsEntry);
    const parsedDoctorEntry = JSON.parse(parsingDoctorEntry);

    const dateOfRejoining = parsedAccidentInfo?.dateOfRejoining || "";
    const dateOfAssessment = parsedDoctorEntry?.dateOfAssessment || "";
    const accidentDate = parsedAccidentInfo?.accidentDate || "";
    const effectiveDate = benefitDate || "";

    const leftItems = [
      ["EIS Worker ID", data?.beneficiaryId || ""],
      ["Date of Accident", accidentDate || ""],
      ["Date of Rejoining", dateOfRejoining],
      ["Date of Disability Assessment", dateOfAssessment],
      ["Effective date of Benefit", effectiveDate],
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
    sheet.getCell(`A${titleRow.number}`).value =
      "Worker, Factory & Accident Information:";
    sheet.getCell(`A${titleRow.number}`).font = { bold: true };
    sheet.getCell(`A${titleRow.number}`).alignment = { horizontal: "left" };

    // Add combined rows (Left + Right)
    for (let i = 0; i < 5; i++) {
      const row = sheet.addRow([
        leftItems[i][0],
        leftItems[i][1],
        "", // gap
        rightItems[i][0],
        rightItems[i][1],
        "", // gap
      ]);

      ["A", "B", "D", "E"].forEach((col) => {
        const cell = sheet.getCell(`${col}${row.number}`);
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        if (col === "A" || col === "D") cell.font = { bold: true };
      });
    }

    // ==========================
    // Separate EIS Payments Table
    // ==========================
    // Small space before table
    sheet.addRow([]);

    // Benefit Information Title
    const benefitTitle = sheet.addRow(["Benefit Information:"]);
    benefitTitle.font = { bold: true, size: 12 };
    benefitTitle.alignment = { horizontal: "left" };

    // Space before header
    sheet.addRow([]);

    // TABLE HEADER
    const tableHeader = [
      "Sl #",
      "EIS Worker ID",
      "NID/Birth Certificate of Worker",
      "Benefit Rate (%) of Gross Salary",
      "Monthly Payable Benefit (BDT)",
      "Net Monthly Payable After Adjustment (BDT)",
      "Total time amount (individual)",
      "After adjustment (individual)",
      "Type of Payment",
      "Approval Status",
      "Remarks",
    ];

    const headerRow = sheet.addRow(tableHeader);

    // Style header
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: "white",
      };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ==================================
    // ADD PAYMENT ROWS
    // ==================================
    let totalMonthly = 0;
    let totalNet = 0;
    let benefitRateTotal = null;

    eisPayments.forEach((row, index) => {
      const benefitRate = Number(row?.eisInitialReplacementRate) || 0;

      if (benefitRateTotal === null) {
        benefitRateTotal = benefitRate;
      }

      const excelRow = sheet.addRow([
        index + 1,
        row?.beneficiaryId || "",
        row?.workforceApplication?.workforceEmployee?.nid || "",
        `${benefitRate * 100}%`,
        row?.eisInitialMonthlyAmount || 0,
        row?.eisMonthlyAmount || 0,
        row?.eisCalculatedAmount || 0,
        row?.eisApprovedAmount || 0,
        row?.eisPaymentType || "",
        row?.approvalStatus || "",
        "",
      ]);

      totalMonthly += Number(row?.eisMonthlyAmount || 0);
      totalNet += Number(row?.eisApprovedAmount || 0);

      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
      });
    });

    // ==================================
    // TOTAL ROW (WITH BENEFIT RATE TOTAL)
    // ==================================
    const totalRow = sheet.addRow([
      "Total",    // Sl
      "",         // EIS Worker ID
      "",         // NID
      ``, // benefit rate total
      totalMonthly,
      totalNet,
      "",
      "",
      "",
      "",
      "",
    ]);

    totalRow.eachCell((cell, col) => {
      if (col === 1 || col === 4) cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });


    // footer start

    // Spacing before footer
    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([]);

    // Title
    const footerHeader = sheet.addRow(["Signature of EIS-GB Sub Committee Members:"]);
    footerHeader.font = { bold: true, size: 13 };
    footerHeader.alignment = { horizontal: "left" };

    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([]);

    const signatureBlocks = [
      [
        "President-BAWF &\nExecutive Member,\nIBC\nMember\nEIS-GB Sub\nCommittee"
      ],
      [
        "President-SLF\n& Member- NCCWE\nMember\nEIS-GB Sub\nCommittee"
      ],
      [
        "Director\nBKMEA\nMember\nEIS-GB Sub\nCommittee"
      ],
      [
        "Chairman,\nLabour & ILO Standing\nCommittee\nBGMEA\nMember\nEIS-GB Sub Committee"
      ],
      [
        "Inspector General,\nDIFE\nMember\nEIS-GB Sub\nCommittee"
      ],
      [
        "Director General,\nDepartment of Labour\nMember\nEIS-GB Sub Committee"
      ],
      [
        "Director General,\nCentral Fund\nMember Secretary\nEIS-GB Sub Committee"
      ],
      [
        "Additional Secretary,\nI.O. Wing, MoLE\nChairman\nEIS-GB Sub Committee"
      ],
    ];

    const underlineRow = sheet.addRow(
      signatureBlocks.map(() => "__________________")
    );

    underlineRow.height = 20;

    underlineRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "left", vertical: "bottom" };
    });

    // Create text row
    const textRow = sheet.addRow(signatureBlocks.map((sig) => sig[0]));

    textRow.height = 70;

    textRow.eachCell((cell) => {
      cell.alignment = {
        horizontal: "left",
        vertical: "top",
        wrapText: true,
      };
    });

    sheet.addRow([]);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Benefit Approval Note-Disability.xlsx");
  };

  const exportDeathExcel = async (eisPayments) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Benefit Approval Note");


    // ==========================
    // Set column widths (first table + spacing)
    // ==========================
    sheet.columns = [
      { width: 20 }, // A
      { width: 25 }, // B
      { width: 15 },  // C (gap)
      { width: 25 }, // D
      { width: 25 }, // E
      { width: 15 },  // F (gap)
      { width: 20 }, // G - last table columns
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
    sheet.getCell("A3").value =
      "EIS PILOT Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka, 1000";
    sheet.getCell("A3").alignment = { horizontal: "center" };

    sheet.mergeCells("A4:I4");
    sheet.getCell("A4").value =
      "Email: specialunit@eis-pilot-bd.org, Phone: 01886-921030, Website: eis-pilot-bd.org";
    sheet.getCell("A4").alignment = { horizontal: "center" };

    // ==========================
    // Meeting Info + Worker Info (no gap)
    // ==========================
    // Meeting Info
    sheet.mergeCells("A6:F6");
    sheet.getCell("A6").value = "EIS-GB Sub Committee Meeting No:16";
    sheet.getCell("A6").font = { bold: true };
    sheet.getCell("A6").alignment = { horizontal: "left" };

    sheet.mergeCells("G6:I6");
    sheet.getCell("G6").value = "Date: 10/15/2025";
    sheet.getCell("G6").font = { bold: true };
    sheet.getCell("G6").alignment = { horizontal: "right" };

    // Worker, Factory & Accident Information
    const data = eisPayments?.[0] || {};
    const parsingAccidentInfo = JSON.parse(data.workforceApplication?.employeeAccidentInfo);
    const parsedAccidentInfo = JSON.parse(parsingAccidentInfo);
    const parsingDoctorEntry = JSON.parse(data.workforceApplication?.doctorsEntry);
    const parsedDoctorEntry = JSON.parse(parsingDoctorEntry);

    const dateOfRejoining = parsedAccidentInfo?.dateOfRejoining || "";
    const dateOfAssessment = parsedDoctorEntry?.dateOfAssessment || "";
    const effectiveDate = dateOfRejoining || dateOfAssessment || "";
    const accidentDate = parsedAccidentInfo?.accidentDate || "";
    const dateOfDeath= parsedAccidentInfo?.dateOfDeath || "";


    const leftItems = [
      ["EIS Worker ID", data?.beneficiaryId || ""],
      ["Date of Death", dateOfDeath || ""],
      ["Date of Accident", accidentDate || ""],
      // ["Date of Rejoining", dateOfRejoining],
      // ["Date of Disability Assessment", dateOfAssessment],
      ["Effective date of Benefit", effectiveDate],
    ];

    const rightItems = [
      ["Name of the Factory", data.workforceApplication?.employeeFactory?.nameEn || ""],
      ["Name of Association", data.workforceApplication?.associationType || ""],
      ["Gross Salary (BDT)", data.workforceApplication?.lastBaseSalary || ""],
      // ["Percentage of Disability", parsedDoctorEntry?.disabilityPerSchedule || ""],
      ["Type of Accident", (parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.workplace" ? "Workplace Accident" : parsedAccidentInfo?.accidentMainType === "workforce.accident.mainType.onDutyRTA" ? "On Duty RTA" : "Commuting") || ""],
    ];

    // Section Title
    const titleRow = sheet.addRow([]);
    sheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
    sheet.getCell(`A${titleRow.number}`).value =
      "Worker, Factory & Accident Information:";
    sheet.getCell(`A${titleRow.number}`).font = { bold: true };
    sheet.getCell(`A${titleRow.number}`).alignment = { horizontal: "left" };

    // Add combined rows (Left + Right)
    for (let i = 0; i < 5; i++) {
      const row = sheet.addRow([
        leftItems[i][0],
        leftItems[i][1],
        "", // gap
        rightItems[i][0],
        rightItems[i][1],
        "", // gap
      ]);

      ["A", "B", "D", "E"].forEach((col) => {
        const cell = sheet.getCell(`${col}${row.number}`);
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        if (col === "A" || col === "D") cell.font = { bold: true };
      });
    }

    // ==========================
    // Separate EIS Payments Table
    // ==========================
    // Small space before table
    sheet.addRow([]);

    // Benefit Information Title
    const benefitTitle = sheet.addRow(["Benefit Information:"]);
    benefitTitle.font = { bold: true, size: 12 };
    benefitTitle.alignment = { horizontal: "left" };

    // Space before header
    sheet.addRow([]);

    // TABLE HEADER
    const tableHeader = [
      "Sl #",
      "EIS Beneficiary ID",
      "NID/Birth Certificate of Worker",
      "Relationship with worker",
      "Benefit Rate (%) of Gross Salary",
      "Monthly Payable Benefit (BDT)",
      "Net Monthly Payable After Adjustment (BDT)",
      "Total time amount (individual)",
      "After adjustment (individual)",
      "Type of Payment",
      "Approval Status",
      "Remarks",
    ];

    const headerRow = sheet.addRow(tableHeader);

    // Style header
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: "white",
      };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ==================================
    // ADD PAYMENT ROWS
    // ==================================
    let totalMonthly = 0;
    let totalNet = 0;
    let benefitRateTotal = null;


    eisPayments.forEach((row, index) => {
      const benefitRate = Number(row?.eisInitialReplacementRate) || 0;
      if (benefitRateTotal === null) { benefitRateTotal = benefitRate; }
      const excelRow = sheet.addRow([index + 1,
      row?.beneficiaryId,
      row?.workforceApplication?.workforceEmployee?.nid || "",
      RELATION_LABEL_MAP[row?.workforceEmployeeDependent?.[0]?.relationWithWorker] || "",
      `${benefitRate * 100}%`,
      row?.eisInitialMonthlyAmount || 0,
      row?.eisMonthlyAmount || 0,
      row?.eisCalculatedAmount || 0,
      row?.eisApprovedAmount || 0,
      row?.eisPaymentType || "",
      row?.approvalStatus || "",
        "",]);
      totalMonthly += Number(row?.eisMonthlyAmount || 0); totalNet += Number(row?.eisCalculatedAmount || 0);
      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" },
          right: { style: "thin" },
        }; cell.alignment = {
          vertical: "middle",
          horizontal: "center", wrapText: true,
        };
      });
    });

    // ==================================
    // TOTAL ROW (WITH BENEFIT RATE TOTAL)
    // ==================================
    const totalRow = sheet.addRow([
      "Total",    // Sl
      "",         // EIS Worker ID
      "",         // NID
      "",
      "", // benefit rate total
      "",
      totalMonthly,
      "",
      totalNet,
      "",
      "",
      "",
    ]);

    totalRow.eachCell((cell, col) => {
      if (col === 1 || col === 4) cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });


    // footer start

    // Spacing before footer
    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([]);

    // Title
    const footerHeader = sheet.addRow(["Signature of EIS-GB Sub Committee Members:"]);
    footerHeader.font = { bold: true, size: 13 };
    footerHeader.alignment = { horizontal: "left" };

    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([]);

    const signatureBlocks = [
      [
        "Executive Member\nIBC\nMember.\nEIS-GB Sub Committee"
      ],
      [
        "Member,\nNCCWE.\nMember.\nEIS-GB Sub Committee"
      ],
      [
        "Vice President\nBKMEA\nMember.\nEIS-GB Sub Committee"
      ],
      [
        "Chairman,\nLabour & ILO Standing Committee\nBGMEA\nMember.\nEIS-GB Sub Committee"
      ],
      [
        "Director General,\nDepartment of Labour\nMember Secretary.\nEIS-GB Sub Committee"
      ],
      [
        "Director General,\nCentral Fund\nMember Secretary.\nEIS-GB Sub Committee"
      ],
      [
        "Additional Secretary,\nI.O. Wing, MoLE\nChairman.\nEIS-GB Sub Committee"
      ]
    ];


    const underlineRow = sheet.addRow(
      signatureBlocks.map(() => "__________________")
    );

    underlineRow.height = 20;

    underlineRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "left", vertical: "bottom" };
    });

    // Create text row
    const textRow = sheet.addRow(signatureBlocks.map((sig) => sig[0]));

    textRow.height = 70;

    textRow.eachCell((cell) => {
      cell.alignment = {
        horizontal: "left",
        vertical: "top",
        wrapText: true,
      };
    });

    sheet.addRow([]);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Benefit Approval Note-Death.xlsx");
  };





  // -----------------------------------
  // UI: Render all eisPayments (no filter)
  // -----------------------------------


  const first = eisPayments?.[0] || {};
  let parsedAccidentInfo = {};
  let parsedDoctorEntry = {};

  try {
    parsedAccidentInfo = JSON.parse(JSON.parse(first?.workforceApplication?.employeeAccidentInfo));
  } catch (e) { }

  try {
    parsedDoctorEntry = JSON.parse(JSON.parse(first?.workforceApplication?.doctorsEntry));
  } catch (e) { }

  const dateOfRejoining = parsedAccidentInfo?.dateOfRejoining || "";
  const accidentDate = parsedAccidentInfo?.accidentDate || "";
  const dateOfDeath= parsedAccidentInfo?.dateOfDeath || "";
  const dateOfAssessment = parsedDoctorEntry?.dateOfAssessment || "";
  const effectiveDate = benefitDate || "";

  const handlePaymentTypeChange = async (paymentType, beneficiaryId, rowId) => {

    setPaymentTypeMap((prev) => ({
      ...prev,
      [rowId]: paymentType,
    }));

    const data = {
      beneficiaryId,
      eisPaymentType: paymentType,
    };

    try {
      await dispatch(updateWorkforceEisPaymentProcessPaymentType(data));
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprovalChange = async (value, beneficiaryId, rowId) => {
    setPaymentTypeMap((prev) => ({
      ...prev,
      [rowId]: value,
    }));

    const data = {
      beneficiaryId,
      approved: value,
    };

    try {
      await dispatch(updateWorkforceEisPaymentProcessApproval(data));
    } catch (error) {
      console.error(error);
    }
  };
  const user_type = getUserTypeFromRights(userRights)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h6">
          {loading ? (
            <p style={{ width: '100%', textAlign: 'center' }}>
              <CircularProgress /> Loading....
            </p>
          ) : (
            <FormattedMessage id="EIS-Pilot Benefit Approval Note (Disability/Death)" />
          )}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {!loading && (
          <div style={{ marginBottom: 24 }}>

            <Typography variant="h5" align="center" gutterBottom>
              Employment Injury Scheme-Pilot
            </Typography>

            <Typography variant="h6" align="center" gutterBottom>
              Benefit Approval Note ({appType})
            </Typography>

            <Typography variant="body2" align="center">
              EIS PILOT Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka, 1000
            </Typography>

            <Typography variant="body2" align="center" gutterBottom>
              Email: specialunit@eis-pilot-bd.org, Phone: 01886-921030, Website: eis-pilot-bd.org
            </Typography>

            <Divider style={{ margin: "16px 0" }} />

            {/* Meeting Info */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                EIS-GB Sub Committee Meeting No: 16
              </Typography>
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                Date: {benefitDate}
              </Typography>
            </div>

            <Divider style={{ margin: "16px 0" }} />

            {/* Worker / Factory / Accident Info */}
            <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: 8 }}>
              Worker, Factory & Accident Information:
            </Typography>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* LEFT COLUMN */}
              <div>
                <Typography><strong>EIS Worker ID:</strong> {first?.beneficiaryId}</Typography>
                {
                  selectedApplicationIds.length == 1  ? (
                    <Typography><strong>Worker Name:</strong> {first?.workforceApplication?.workforceEmployee?.firstNameEn} {first?.workforceApplication?.workforceEmployee?.lastNameEn}</Typography>
                  ): null
                }
                <Typography><strong>Date of Accident:</strong> {accidentDate}</Typography>
                {appType === "Death" ? (
                  <>
                    <Typography><strong>Date of Death:</strong> {dateOfDeath}</Typography>
                  </>
                ):(
                  <>
                    <Typography><strong>Date of Rejoining:</strong> {dateOfRejoining}</Typography>
                    <Typography><strong>Date of Disability Assessment:</strong> {dateOfAssessment}</Typography>
                  </>
                )}
                <Typography><strong>Effective Date of Benefit:</strong> {effectiveDate}</Typography>
              </div>

              {/* RIGHT COLUMN */}
              <div>
                <Typography>
                  <strong>Name of the Factory:</strong>{" "}
                  {first?.workforceApplication?.employeeFactory?.nameEn}
                </Typography>
                <Typography>
                  <strong>Name of Association:</strong>{" "}
                  {first?.workforceApplication?.associationType}
                </Typography>
                <Typography>
                  <strong>Gross Salary (BDT):</strong>{" "}
                  {first?.workforceApplication?.lastBaseSalary? first?.workforceApplication?.lastBaseSalary.toLocaleString('en-BD') : ''}
                </Typography>
                {
                  appType === "Death" ? null : (
                    <Typography>
                      <strong>Percentage of Disability:</strong>{" "}
                      {parsedDoctorEntry?.disabilityPerSchedule}
                    </Typography>
                  )
                }
                <Typography>
                  <strong>Type of Accident:</strong>{" "}
                  {parsedAccidentInfo?.accidentMainType ===
                    "workforce.accident.mainType.workplace"
                    ? "Workplace Accident"
                    : parsedAccidentInfo?.accidentMainType ===
                      "workforce.accident.mainType.onDutyRTA"
                      ? "On Duty RTA"
                      : "Commuting"}
                </Typography>
              </div>
            </div>

            <Divider style={{ margin: "16px 0" }} />
          </div>

        )}

        {!loading && (
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                <TableCell><FormattedMessage id="SL #" /></TableCell>
                <TableCell><FormattedMessage id="EIS Worker ID" /></TableCell>
                <TableCell><FormattedMessage id="Worker Name" /></TableCell>
                <TableCell><FormattedMessage id="Dependent Name" /></TableCell>
                <TableCell><FormattedMessage id="NID/Birth Certificate of Worker" /></TableCell>
                <TableCell><FormattedMessage id="Benefit Rate (%) of Gross Salary" /></TableCell>
                <TableCell><FormattedMessage id="Total time amount (individual)" /></TableCell>
                <TableCell><FormattedMessage id="After adjustment (individual)" /></TableCell>
                <TableCell><FormattedMessage id="Monthly Payable Benefit (BDT)" /></TableCell>
                <TableCell><FormattedMessage id="Net Monthly Payable After Adjustment (BDT)" /></TableCell>
                <TableCell><FormattedMessage id="Type of Payment" /></TableCell>
                <TableCell><FormattedMessage id="Approval Status" /></TableCell>
                <TableCell><FormattedMessage id="Remarks" /></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {eisPayments.map((row, index) => {
                let bankInfo = {};
                try {
                  bankInfo = JSON.parse(JSON.parse(row.employeeBankInfo));
                } catch (e) { }

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row?.beneficiaryId}</TableCell>
                    <TableCell>{row?.workforceApplication?.workforceEmployee?.firstNameEn}</TableCell>
                    <TableCell>
                      {row?.workforceEmployeeDependent?.length > 0
                        ? row.workforceEmployeeDependent[0].nameEn + (" (" + RELATION_LABEL_MAP[row.workforceEmployeeDependent[0].relationWithWorker] + ") ")
                        : ""}
                    </TableCell>
                    <TableCell>{row?.workforceApplication?.workforceEmployee?.nid}</TableCell>
                    <TableCell>{row?.eisInitialReplacementRate ? Number(row.eisInitialReplacementRate) * 100 + "%" : ""}</TableCell>
                    <TableCell>{row?.eisCalculatedAmount}</TableCell>
                    <TableCell>{row?.eisApprovedAmount}</TableCell>
                    <TableCell>{row?.eisInitialMonthlyAmount}</TableCell>
                    <TableCell>{row?.eisMonthlyAmount}</TableCell>
                    <TableCell>
                      {
                        user_type == WORKFORCE_USER_TYPE.EIS_COORDINATOR || user_type == WORKFORCE_USER_TYPE.EIS_ADVISOR || user_type == WORKFORCE_USER_TYPE.EIS_COMMITTEE || user_type == WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE ? (
                          <>
                            <select
                              value={
                                paymentTypeMap[index] !== undefined
                                  ? paymentTypeMap[index]?.eisPaymentType
                                  : row?.eisPaymentType || ""
                              }
                              onChange={(e) =>
                                handlePaymentTypeChange(e.target.value, row?.beneficiaryId, index)
                              }
                            >
                              <option value="" disabled>Select</option>
                              <option value="monthly">Monthly</option>
                              <option value="onetime">One-time</option>
                              <option value="installment">Tri Monthly Installment</option>
                            </select>
                          </>
                        ) :
                          EIS_PAYMENT_TYPES[row?.eisPaymentType]
                      }
                    </TableCell>
                    <TableCell>
                      {
                        user_type == WORKFORCE_USER_TYPE.EIS_COMMITTEE || user_type == WORKFORCE_USER_TYPE.EIS_ASSOCIATION_COMMITTEE ? (
                          <>
                            <select
                              value={
                                paymentTypeMap[index] !== undefined ? paymentTypeMap[index]?.approved : ""
                              }
                              onChange={(e) =>
                                handleApprovalChange(e.target.value, row?.beneficiaryId, index)
                              }
                            >
                              <option value="">Not Approved</option>
                              <option value="yes">Approved</option>
                            </select>
                          </>

                        ) : getApprovalStatus(row?.isApproved)
                      }
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                );
              })}
              <TableRow>
                <TableCell colSpan={7}><strong><FormattedMessage id="Total Amount (Monthly)" /></strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <Divider />

      <DialogActions className={classes.noPrint}>
        {!loading && (
          <>
            <Button onClick={onClose} variant="outlined" color="primary">
              <FormattedMessage id="workforce.modal.close" />
            </Button>
            {
              user_type == WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
                <Button onClick={onClose} variant="contained" color="primary">
                  <FormattedMessage id="ক্যালকুলেশন সেভ করুন" />
                </Button>
              )
            }

            <Button onClick={() => window.print()} variant="contained" color="primary">
              <FormattedMessage id="workforce.modal.print.advice" />
            </Button>

            <Button onClick={exportToExcel} variant="contained" color="success">
              <FormattedMessage id="workforce.modal.excel" />
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};


export default GenereteEisDependentBFTN;