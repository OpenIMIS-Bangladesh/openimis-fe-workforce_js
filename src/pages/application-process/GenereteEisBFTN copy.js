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
} from "@material-ui/core";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights, safeDecodeId, getFooterContent  } from "../../utils/utils";
import ForwardIcon from "@material-ui/icons/Forward";
import { WORKFORCE_STATUS, RELATION_LABEL_MAP } from "../../constants";
import { createApplicationSummary, updateApplication, updateApplicationSummary } from "../../actions";
import { useDispatch } from "react-redux";
import React, { Component, useState, useEffect, useRef } from "react";
import { enToBn } from "../../utils/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useModulesManager, decodeId, FormattedMessage, parseData } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { useReactToPrint } from "react-to-print";
import { fetchEisPaymentProcess, fetchWorkforceOtherCompensation } from "../../actions";
// import NOAPrintTemplate from "./NOAPrintTemplate";

const useStyles = makeStyles(() => ({
  printContainer: {
    display: "none",
  },

  "@global": {
    "@media print": {
      // 1. Only apply this aggressive hiding if the BODY has our specific class
      "body.printing-eis-bftn *": {
        visibility: "hidden",
      },

      // 2. Make the print container visible ONLY when our class is present
      "body.printing-eis-bftn #print-area-container": {
        visibility: "visible !important",
        display: "block !important",
        position: "fixed !important",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        backgroundColor: "#fff",
        overflow: "visible !important",
      },

      "body.printing-eis-bftn #print-area-container *": {
        visibility: "visible !important",
      },

      // 3. Hide the Dialog (specific to this print mode)
      "body.printing-eis-bftn .MuiDialog-root": {
        display: "none !important",
      },

      // --- NOA TEMPLATE STYLES (Keep these global as they have unique names) ---
      ".noa-page": {
        fontFamily: '"Noto Sans Bengali", "SolaimanLipi", sans-serif',
        width: "100%",
        paddingTop: "40mm",
        paddingBottom: "30mm",
        paddingLeft: "25mm",
        paddingRight: "25mm",
        boxSizing: "border-box",
        fontSize: "12px",
        color: "#000 !important",
      },
      // ... (Rest of the styles remain the same: .noa-header, .noa-table, etc.)
      ".noa-header": {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "50mm",
        textAlign: "center",
        backgroundColor: "#fff",
        zIndex: 1000,
        paddingTop: "1mm",
      },
      ".noa-header h3, .noa-header h4, .noa-header p": {
        margin: "2px 0",
        color: "#000",
      },
      ".noa-body": { width: "100%", marginTop: "10mm" },
      ".noa-footer": {
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "40mm",
        paddingLeft: "25mm",
        paddingRight: "25mm",
        boxSizing: "border-box",
        backgroundColor: "#fff",
      },
      ".noa-table": {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "15px",
        tableLayout: "fixed",
      },
      ".noa-table td": {
        border: "1px solid #000 !important",
        padding: "4px 8px",
        verticalAlign: "top",
        color: "#000 !important",
      },
      ".noa-label": {
        width: "35%",
        fontWeight: "bold",
        backgroundColor: "#f5f5f5 !important",
        "-webkit-print-color-adjust": "exact",
      },
      ".noa-value": { width: "65%" },
      ".noa-section": {
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#e0e0e0 !important",
        "-webkit-print-color-adjust": "exact",
        padding: "5px",
      },
      ".noa-signature": {
        marginTop: "15mm",
        textAlign: "right",
        fontWeight: "bold",
      },
    },
  },
}));

const GenerateEisBFTN = ({ open, onClose, userRights, status, summary_Id, selectedApplicationIds, OtherCompensationAmount = [] }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  
  const [selectedRow, setSelectedRow] = useState(null);
  const [printMode, setPrintMode] = useState(null);
  const [otherCompAmount, setOtherCompAmount] = useState(0);
  const [eisPayments, setEisPayments] = useState([])
  console.log({selectedApplicationIds})

  // ... (Data Fetching useEffects remain the same) ...

  const handleRowPrint = (row) => {
    // ... (Date formatting logic remains the same) ...
    const year = row?.year || "";
    const monthIndex = row?.monthIndex || "";
    const monthFormatted = String(monthIndex).padStart(2, "0");
    const lastDay = new Date(year, monthIndex, 0).getDate();

    setSelectedRow({
      ...row,
      payFrom: `01.${monthFormatted}.${year}`,
      payTo: `${lastDay}.${monthFormatted}.${year}`,
    });

    setPrintMode("NOA");
  };

  // --- TRIGGER PRINT LOGIC (UPDATED) ---
  useEffect(() => {
    if (printMode === "NOA" && selectedRow) {
      // 1. Add the unique class to body so OUR styles take over
      document.body.classList.add("printing-eis-bftn");

      const timer = setTimeout(() => {
        window.print();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [printMode, selectedRow]);

  useEffect(async()=>{
    if (selectedApplicationIds.length >0) {
      const applicationIds = selectedApplicationIds.map(x =>
            safeDecodeId(x?.id)
          );
      await dispatch(fetchEisPaymentProcess(applicationIds, modulesManager)).then((res) => {
        const fetchedData = res?.payload?.data?.workforceEisPaymentProcess;
        setEisPayments(fetchedData);})

      await dispatch(fetchWorkforceOtherCompensation(modulesManager,[`workforceApplicationId: "${applicationIds}"`])).then((res) => {
        const fetchOtherCompensation = parseData(res?.payload?.data?.workforceOtherCompensationInfo);
        const amount = fetchOtherCompensation?.[0]?.amount || 0;
        setOtherCompAmount(amount);               
        console.log("OtherCompensation",OtherCompensationAmount);
      });
    }
  },[open])

  // --- CLEANUP LOGIC (UPDATED) ---
  useEffect(async() => {


    const afterPrint = () => {
      setPrintMode(null);
      setSelectedRow(null);
      // 2. Remove the class so other components can print normally
      document.body.classList.remove("printing-eis-bftn");
    };

    window.addEventListener("afterprint", afterPrint);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener("afterprint", afterPrint);
      document.body.classList.remove("printing-eis-bftn");
    };
  }, []);

  const getTotalAmount = () => {
    return eisPayments
      .reduce((sum, item) => sum + (parseFloat(item.eisMonthlyAmount) || 0), 0)
      .toFixed(2);
  };

  const handleDialogPrint = () => {
    setPrintMode("DIALOG");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  };

  // useEffect(() => {
  //   const afterPrint = () => setPrintMode("");
  //   window.addEventListener("afterprint", afterPrint);
  //   return () => window.removeEventListener("afterprint", afterPrint);
  // }, []);

  

  const printYear = new Date().getFullYear();
  const printMonth = new Date().getMonth();
  const excelmonthFormatted = String(printMonth + 1).padStart(2, "0");
  const excelyear = printYear;

  // -----------------------------
  // Excel generator (unchanged)
  // -----------------------------
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bank Advice", {});

    // Set column widths
    sheet.columns = [
      { width: 5 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
    ];

    // -----------------------------
    // Header (same as before)
    // -----------------------------
    sheet.mergeCells("A1:K1");
    sheet.getCell("A1").value = `Ref No: EIS.Bank Advice.Benefit.${excelyear}.${excelmonthFormatted}`;
    sheet.getCell("A1").font = { bold: true };

    sheet.mergeCells("A3:K3");
    sheet.getCell("A3").value = "Manager";

    sheet.mergeCells("A4:K4");
    sheet.getCell("A4").value = "Sonali Bank Limited";

    sheet.mergeCells("A5:K5");
    sheet.getCell("A5").value = "Ramna Corporate Branch";

    sheet.mergeCells("A6:K6");
    sheet.getCell("A6").value = "1, Topkhana Road, Ramna, Dhaka, 1000";

    sheet.mergeCells("A8:K8");
    sheet.getCell("A8").value = "Subject: Bank Advice Letter (EIS Top-up Benefit)";
    sheet.getCell("A8").font = { bold: true, underline: true };

    sheet.mergeCells("A10:K10");
    sheet.getCell("A10").value = "Dear Sir:";

    sheet.mergeCells("A12:K12");
    sheet.getCell("A12").value = "Greetings from EIS Pilot!";

    sheet.mergeCells("A14:K14");

    sheet.getCell("A14").value = {
      richText: [
        {
          text: "EIS Pilot top-up benefits are required to be disbursed to the beneficiaries through bank transfer from your branch of EIS Pilot bank account,",
        },
        {
          text: " Account Title: EMPLOYMENT INJURY SCHEME EIS",
          font: { bold: true },
        },
        { text: ", Account Number: 4426302003729", font: { bold: true } },
        {
          text: ". The validated list of account holders with their respective Account Titles, Bank Account Numbers, Bank Names, Branch info, Routing Numbers including Payment amounts have been mentioned below.",
        },
      ],
    };

    // -----------------------------
    // Table Header
    // -----------------------------
    const tableHeader = [
      "Sl #",
      "Account Title",
      "Bank Account Number",
      "Bank",
      "Branch",
      "District",
      "Routing No.",
      "Amount (BDT)",
      "Beneficiary ID",
      "Pay From",
      "Pay To",
    ];

    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([]);

    const headerRow = sheet.addRow(tableHeader);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "92D050" },
      };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // const data = eisPayments?.[0] || {};
    // const parsingBankInfo = JSON.parse(data.workforceApplication?.);
    // const parsedBankInfo = JSON.parse(parsingBankInfo);
    // -----------------------------
    // REAL DATA FROM eisPayments
    // -----------------------------
    eisPayments.forEach((row, index) => {
      // Format month as 01..12
      let year = row?.year || "";
      let monthIndex = row?.monthIndex || "";
      let monthFormatted = String(monthIndex).padStart(2, "0");

      // Pay period values
      let payFrom = `01.${monthFormatted}.${year}`;
      let lastDay = new Date(year, monthIndex, 0).getDate();
      let payTo = `${lastDay}.${monthFormatted}.${year}`;

      sheet.addRow([
        index + 1,
        row?.bankAccountHolderName || "",
        row?.bankAccountNo || "",
        row?.bank?.parent?.nameEn || "",
        row?.bank?.nameEn || "",
        row?.bank?.districtNameEn || "",
        row?.bank?.routingNumber || "",
        row?.eisMonthlyAmount || 0,
        row?.beneficiaryId || "",
        payFrom,
        payTo,
      ]);
    });

    // -----------------------------
    // Apply border to all data rows
    // -----------------------------
    // Apply border only to table rows (after headerRow)
    const firstDataRow = headerRow.number + 1;
    const lastDataRow = firstDataRow + eisPayments.length - 1;

    for (let i = firstDataRow; i <= lastDataRow; i++) {
      const row = sheet.getRow(i);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
      });
    }

    // -----------------------------
    // Add Closing / Signature Section
    // -----------------------------
    sheet.addRow([]);
    sheet.addRow([]);

    const closingLines = [
      "Your prompt necessary steps in this matter will be highly appreciated.",
      "",
      "With warm regards",
      "",
      "Director General,",
      "Central Fund, Ministry of Labor and Employment &",
      "Member Secretary, EIS Pilot Governance Board",
      "Bangladesh Secretariat, Dhaka-1000",
      "",
      "Copy to (Not in order of seniority):",
      "1. PS to State Minister, Ministry of Labour and Employment, Bangladesh Secretariat, Dhaka-1000.",
      "2. PS to Secretary, Ministry of Labour and Employment, Bangladesh Secretariat, Dhaka-1000.",
      "3. Special Advisor, EIS Pilot Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka-1000.",
      "4. PA to Director General, Central Fund, Bangladesh Secretariat, Dhaka-1000.",
      "5. Assistant Director, Welfare-2 and Development, Central Fund, Bangladesh Secretariat, Dhaka-1000.",
      "6. Assistant Director, Finance Department, Central Fund, Bangladesh Secretariat, Dhaka-1000.",
    ];

    // Loop through lines and merge across all 10 columns
    closingLines.forEach((line) => {
      const row = sheet.addRow([line]);
      sheet.mergeCells(`A${row.number}:J${row.number}`);
      row.getCell(1).alignment = {
        horizontal: "left",
        vertical: "top",
        wrapText: true,
      };
    });

    // -----------------------------
    // Download Excel File
    // -----------------------------
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "BA-Advice.xlsx");
  };

  // -----------------------------------
  // UI: Render all eisPayments (no filter)
  // -----------------------------------

  return (
    <>
      {/* ================= DIALOG UI ================= */}
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6"><FormattedMessage id="Eis Bank Payment Advice (BEFTN)" /></Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
             <TableHead>
              <TableRow>
                <TableCell>NOA Print</TableCell>
                <TableCell>SL</TableCell>
                <TableCell>Account Title</TableCell>
                <TableCell>Account No</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>District</TableCell>
                <TableCell>Routing</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Beneficiary ID</TableCell>
                <TableCell align="right">Pay From</TableCell>
                <TableCell align="right">Pay To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eisPayments.map((row, index) =>{ 
                const year = row?.year || "";
                const monthIndex = row?.monthIndex || "";
                const monthFormatted = String(monthIndex).padStart(2, "0");
                const lastDay = new Date(year, monthIndex, 0).getDate();
 
                return(
                <TableRow key={index}>
                  <TableCell>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleRowPrint(row)}
                    >
                      Print
                    </Button>
                  </TableCell>
                   <TableCell>{index + 1}</TableCell>
                    <TableCell>{row?.bankAccountHolderName}</TableCell>
                    <TableCell>{row?.bankAccountNo}</TableCell>
                    <TableCell>{row?.bank?.parent?.nameEn}</TableCell>
                    <TableCell>{row?.bank?.nameEn}</TableCell>
                    <TableCell>{row?.bank?.districtNameEn}</TableCell>
                    <TableCell>{row?.bank?.routingNumber}</TableCell>
                    <TableCell align="right">{row?.eisMonthlyAmount}</TableCell>
                    <TableCell align="right">{row?.beneficiaryId}</TableCell>
                    <TableCell align="right">
                      01.{monthFormatted}.{year}
                    </TableCell>
                    <TableCell align="right">
                      {lastDay}.{monthFormatted}.{year}
                    </TableCell>
                </TableRow>
              )})}
              <TableRow>
                <TableCell colSpan={4}><strong>Total Amount</strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <Divider />
        <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
            <FormattedMessage id="workforce.modal.close" />
          </Button>

          <Button
            onClick={handleDialogPrint}
            variant="contained"
            color="primary"
          >
            <FormattedMessage id="workforce.modal.print.advice" />
          </Button>

          <Button onClick={exportToExcel} variant="contained" color="success">
            <FormattedMessage id="workforce.modal.excel" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== PRINT TEMPLATE CONTAINER ===== */}
      {/* IMPORTANT: The class 'printContainer' hides this in normal view. 
          The ID 'print-area-container' is targeted by @media print to force it visible.
      */}
      <div id="print-area-container" className={classes.printContainer}>
        {printMode === "NOA" && selectedRow && (
          <NOAPrintTemplate
            row={selectedRow}
            payFrom={selectedRow.payFrom}
            payTo={selectedRow.payTo}
            OtherCompensationAmount={otherCompAmount}
          />
        )}
      </div>
    </>
  );
};

// --- FULLY RESTORED NOA TEMPLATE WITH FIXED CSS ---
// --- NOA TEMPLATE COMPONENT (Updated with Global Classes) ---
const NOAPrintTemplate = ({ row, payFrom, payTo, OtherCompensationAmount }) => {
  
  // --- Original Logic Starts ---
  const tryParse = (value) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      } catch {
        return value;
      }
    }
    return value;
  };

  const formatAddress = (locationData, addressData) => {
    // TryParse handles both JSON strings and objects
    const address = tryParse(addressData) || {};
    const location = tryParse(locationData) || {};

    const postOffice = address?.postOffice?.nameBn || address?.postOffice;
    const village = [
      address.houseName,
      address.paraMahalla,
      address.villageRoad,
    ]
      .filter(Boolean)
      .join(", ");

    // Navigate location parents for Thana/District
    const thana = location?.parent?.name || location?.name; // Fallback if structure varies
    const district = location?.parent?.parent?.name || location?.parent?.name;

    return {
      village,
      postOffice,
      thana,
      district,
    };
  };

  const employeePresentAddress = formatAddress(
    row?.workforceApplication?.workforceEmployee?.presentLocation, row?.workforceEmployee?.employeePresentAddress
  );
  
  const depentPresentAddress = formatAddress(
    row?.workforceEmployeeDependent?.[0]?.presentLocation, 
    row?.workforceEmployeeDependent?.[0]?.depentPresentAddress
  );

  const cfAndEisAmount = (parseFloat(row?.eisMonthlyAmount) || 0) + (parseFloat(OtherCompensationAmount) || 0);
  console.log("cfAndEisAmount", cfAndEisAmount);
  console.log(row)

  const relation =
  row?.workforceEmployeeDependent?.[0]?.relationWithWorker;

  const applicationType =
  row?.workforceApplication?.applicationType;
  // --- Original Logic Ends ---

  // NOTE: We do NOT use 'useStyles()' here anymore because classes are global strings.
  // Instead of {classes.noaPage}, we use className="noa-page"

  return (
    <div className="noa-page">
      {/* ===== HEADER ===== */}
      <div className="noa-header">
        {/* We can use standard HTML tags since styling is handled by global CSS targeting .noa-header children */}
        <div>
          <p style={{ margin: 0 }}>ব্যক্তিগত</p>
          <h3 style={{ margin: "5px 0" }}>এমপ্লয়মেন্ট ইনজুরি স্কীম-(ই.আই.এস) পাইলট</h3>
          <p style={{ margin: "2px 0" }}>
            ১৯৬, ১০ম তলা, শ্রম ভবন, শহীদ সৈয়দ নজরুল ইসলাম সরনী, বিজয়নগর,
            ঢাকা-১০০০
          </p>
          <p style={{ margin: "2px 0" }}>
            মোবাইল: ০১৮৮৬-৯২১০৩০ | ই-মেইল: verification@eis-pilot-bd.org |
            ওয়েবসাইট: eis-pilot-bd.org
          </p>
          <h4 style={{ margin: "10px 0"}}>
             <h4 style={{ margin: "10px 0" }}>
              {applicationType === "financialAssistance"
              ? "নোটিশ অফ অ্যাওয়ার্ড- কর্মরত অবস্থায় দুর্ঘটনাজনিত মৃত্যু"
              : applicationType === "disabilityAssistance"
              ? "নোটিশ অফ অ্যাওয়ার্ড- কর্মরত অবস্থায় দুর্ঘটনাজনিত স্থায়ী আংশিক/সম্পূর্ণ অক্ষমতা"
              : ""}
          </h4>
          </h4>
          
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 25mm", marginTop: "10px" }}>
             <span>সূত্র: {row?.beneficiaryId || ""}</span>
             <span>তারিখ: {new Date().toLocaleDateString("bn-BD")}</span>
          </div>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="noa-body">
        <table className="noa-table">
          <tbody>
            {/* Section 1 */}
            <tr>
              <td colSpan={2} className="noa-section">
                মৃত শ্রমিকের তথ্য:
              </td>
            </tr>

            <tr>
              <td className="noa-label">শ্রমিকের নাম:</td>
              <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.firstNameBn || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">শ্রমিকের জাতীয় পরিচয়পত্র নম্বর:</td>
              <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.nid || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">ঠিকানা:</td>
              <td className="noa-value">
                {/* গ্রামঃ {employeePresentAddress?.village || ""}, ডাকঘরঃ {employeePresentAddress?.postOffice || ""} , <br />
                উপজেলা/থানাঃ {employeePresentAddress?.thana || ""}, জেলাঃ  {employeePresentAddress?.district || ""} */}
              </td>
            </tr>

            {/* Section 2 */}
            <tr>
              <td colSpan={2} className="noa-section">
                উপযুক্ত নির্ভরশীল ব্যক্তির তথ্য:
              </td>
            </tr>

            <tr>
              <td className="noa-label">উপযুক্ত নির্ভরশীলের নাম:</td>
              <td className="noa-value">{row?.workforceEmployeeDependent?.[0]?.nameBn || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">মৃত শ্রমিকের সাথে সম্পর্ক:</td>
              <td className="noa-value">{RELATION_LABEL_MAP[row?.workforceEmployeeDependent?.[0]?.relationWithWorker || ""]}</td>
            </tr>

            <tr>
              <td className="noa-label">
                নির্ভরশীল ব্যক্তির জাতীয় পরিচয়পত্র / জন্মসনদ নম্বর:
              </td>
              <td className="noa-value">{row?.workforceEmployeeDependent?.[0]?.nid || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">
                নির্ভরশীল ব্যক্তির জন্ম তারিখ: <br /> (মাস/দিন/বছর)
              </td>
              <td className="noa-value">{row?.workforceEmployeeDependent?.[0]?.birthDate || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">ঠিকানা:</td>
              <td className="noa-value">
                {depentPresentAddress?.village ? `${depentPresentAddress.village}, ` : ""} 
                {depentPresentAddress?.postOffice ? `${depentPresentAddress.postOffice}, ` : ""}
                {depentPresentAddress?.thana ? `${depentPresentAddress.thana}, ` : ""} 
                {depentPresentAddress?.district || ""}
              </td>
            </tr>

            <tr>
              <td className="noa-label">এম.আই.এস বেনিফিশিয়ারি নম্বর:</td>
              <td className="noa-value">{row?.beneficiaryId || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">
                কেন্দ্রীয় তহবিল থেকে প্রদত্ত অর্থের পরিমাণ:
              </td>
              <td className="noa-value">{OtherCompensationAmount}</td>
            </tr>

            {/* Section 3 */}
            <tr>
              <td colSpan={2} className="noa-section">
                মাসিক প্রদেয় টপ-আপ বেনেফিটের তথ্য:
              </td>
            </tr>

            <tr>
              <td className="noa-label">
                মাসিক প্রদেয় ই.আই.এস টপ-আপ বেনেফিটের পরিমাণ:
              </td>
              <td className="noa-value">{row?.eisMonthlyAmount || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">
                কেন্দ্রীয় তহবিল প্রদত্ত অর্থ সমন্নয়ের পর প্রদেয়
                <br />
                মাসিক ই.আই.এস টপ-আপ বেনেফিটের পরিমাণ:
              </td>
              <td className="noa-value">{cfAndEisAmount || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">
                মাসিক ই.আই.এস টপ-আপ বেনিফিটের কার্যকরী তারিখ:
              </td>
              <td className="noa-value">{row?.processingDate || ""}</td>
            </tr>
          </tbody>
        </table>

       {getFooterContent(relation, applicationType)}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="noa-footer">
        <div className="noa-signature">
          <p style={{ margin: "2px 0" }}>মহাপরিচালক</p>
          <p style={{ margin: "2px 0" }}>কেন্দ্রীয় তহবিল</p>
          <p style={{ margin: "2px 0" }}>ও</p>
          <p style={{ margin: "2px 0" }}>সদস্য সচিব-ইআইএস গভর্নেন্স বোর্ড</p>
        </div>
      </div>
    </div>
  );
};
export default GenerateEisBFTN;
