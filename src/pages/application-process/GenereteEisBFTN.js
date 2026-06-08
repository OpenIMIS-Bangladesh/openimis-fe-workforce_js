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
  Paper,
  Grid
} from "@material-ui/core";
import { RELATION_LABEL_BANGLA_MAP, WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights, safeDecodeId, getFooterContent, safeParse, getFooterContentNew, toBanglaNumber, calculateAge } from "../../utils/utils";
import ForwardIcon from "@material-ui/icons/Forward";
import { WORKFORCE_STATUS, RELATION_LABEL_MAP } from "../../constants";
import { createApplicationSummary, fetchWorkforceNoaSignatureByApprovers, updateApplication, updateApplicationSummary, fetchWorkforceNoaSignerUserByApprovers } from "../../actions";
import { useDispatch } from "react-redux";
import React, { Component, useState, useEffect, useRef } from "react";
import { enToBn } from "../../utils/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useModulesManager, decodeId, FormattedMessage, parseData } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { useReactToPrint } from "react-to-print";
import { fetchEisPaymentProcess, fetchWorkforceOtherCompensation } from "../../actions";

const useStyles = makeStyles(() => ({
  printContainer: {
    display: "none",
  },
}));

const GenerateEisBFTN = ({ open, onClose, userRights, status, summary_Id, selectedApplicationIds, OtherCompensationAmount = [] }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  const [selectedRow, setSelectedRow] = useState(null);
  const [printReady, setPrintReady] = useState(false);
  const [printWindow, setPrintWindow] = useState(null);
  const [noaSignerInfo, setNoaSignerInfo] = useState({ noaSigner: null, noaSignature: null });
  const [otherCompAmount, setOtherCompAmount] = useState(0);
  const [eisPayments, setEisPayments] = useState([]);

  console.log({ selectedApplicationIds });

  const handleRowPrint = async (row) => {
    const year = row?.year || "";
    const monthIndex = row?.monthIndex || "";
    const monthFormatted = String(monthIndex).padStart(2, "0");
    const lastDay = new Date(year, monthIndex, 0).getDate();

    const selected = {
      ...row,
      payFrom: `01.${monthFormatted}.${year}`,
      payTo: `${lastDay}.${monthFormatted}.${year}`,
    };

    const popup = window.open("", "_blank", "width=1000,height=800,scrollbars=yes,resizable=yes");
    if (popup) {
      popup.document.write("<html><body><p>Preparing print preview...</p></body></html>");
      popup.document.close();
      popup.focus();
    }
    setPrintWindow(popup);
    setPrintReady(false);
    setSelectedRow(selected);

    const eisApprovedByIds = safeParse(row?.workforceApplication?.eisApprovedByIds) || [];
    if (eisApprovedByIds.length > 0) {
      const [signatureResult, signerResult] = await Promise.all([
        dispatch(fetchWorkforceNoaSignatureByApprovers(eisApprovedByIds)),
        dispatch(fetchWorkforceNoaSignerUserByApprovers(eisApprovedByIds)),
      ]);

      setNoaSignerInfo({
        noaSignature: signatureResult.payload?.data?.fetchNoaSignatureByApprovers || null,
        noaSigner: signerResult.payload?.data?.fetchWorkforceNoaSignerUserByApprovers || null,
      });
    } else {
      setNoaSignerInfo({ noaSignature: null, noaSigner: null });
    }

    setPrintReady(true);
  };

  // New tab print logic (opens formatted preview in new tab)
  useEffect(() => {
    if (selectedRow && printReady && printWindow) {
      // Give React time to render the hidden template
      const timer = setTimeout(() => {
        const container = document.getElementById("print-area-container");
        if (container && container.innerHTML.trim()) {
          const content = container.innerHTML;

          const popup = printWindow;
          if (!popup.closed) {
            popup.document.open();
            popup.document.write(`
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>নোটিশ অফ অ্যাওয়ার্ড</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap">
  <style type="text/css">
    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans Bengali', sans-serif;
      background: #fff;
      color: #000;
    }
    body {
      padding: 8mm 10mm;
    }
    @media print {
      body {
        padding: 5mm 8mm;
      }
      @page {
        size: A4 portrait;
        margin: 8mm 8mm 8mm 8mm;
      }
    }
    .noa-page {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      font-size: 12px;
      page-break-inside: avoid;
    }
    .noa-header {
      position: relative;
      text-align: center;
      margin-bottom: 4mm;
    }
    .noa-header h3, .noa-header h4, .noa-header p {
      margin: 1px 0;
      line-height: 1.2;
    }
    .noa-header h3 {
      font-size: 12px;
    }
    .noa-header h4 {
      font-size: 12px;
      margin: 3px 0 2px 0;
    }
    .noa-body {
      margin-top: 0;
    }
    .noa-additional-info{
      position: relative;
      margin-top: 3mm;
      page-break-inside: avoid;
      font-size: 12px;
    }
    .noa-footer {
      position: relative;
      margin-top: 3mm;
      page-break-inside: avoid;
      font-size: 12px;
    }
    .noa-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2px;
      table-layout: fixed;
    }
    .noa-table td {
      border: 1px solid #000;
      padding: 2px 4px;
      vertical-align: top;
      word-wrap: break-word;
      font-size: 12px;
    }
    .noa-label {
      width: 35%;
      font-weight: bold;
      background-color: #f5f5f5;
    }
    .noa-value {
      width: 65%;
    }
    .noa-section {
      font-weight: bold;
      text-align: center;
      background-color: #e0e0e0;
      padding: 2px 2px;
      font-size: 12px;
    }
    .noa-signature {
      text-align: right;
      font-weight: bold;
      font-size: 12px;
    }
    .noa-signature p {
      margin: 1px 0;
      line-height: 1.1;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  </style>
</head>
<body>
  ${content}
</body>
<script>
    window.onload = function () {
        window.print();
      };
</script>
</html>
            `);
            popup.document.close();
            popup.focus();
            // Uncomment the line below if you want auto-print (print dialog opens immediately)
            // popup.print();
          }
        }
        // Reset so next row can be printed
        setSelectedRow(null);
        setPrintWindow(null);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [selectedRow, printReady, printWindow]);

  useEffect(() => {
    if (selectedApplicationIds.length > 0) {
      const applicationIds = selectedApplicationIds.map((x) => safeDecodeId(x?.id));
      dispatch(fetchEisPaymentProcess(applicationIds, modulesManager)).then((res) => {
        const fetchedData = res?.payload?.data?.workforceEisPaymentProcess;
        setEisPayments(fetchedData);
      });

      dispatch(fetchWorkforceOtherCompensation(modulesManager, [`workforceApplicationId: "${applicationIds}"`])).then((res) => {
        const fetchOtherCompensation = parseData(res?.payload?.data?.workforceOtherCompensationInfo);
        const amount = fetchOtherCompensation?.[0]?.amount || 0;
        setOtherCompAmount(amount);
      });
    }
  }, [open, selectedApplicationIds, dispatch, modulesManager]);

  const getTotalAmount = () => {
    return eisPayments
      .reduce((sum, item) => sum + (parseFloat(item.eisMonthlyAmount) || 0), 0)
      .toFixed(2);
  };

  const handleDialogPrint = () => {
    window.print();
  };

  const printYear = new Date().getFullYear();
  const printMonth = new Date().getMonth();
  const excelmonthFormatted = String(printMonth + 1).padStart(2, "0");
  const excelyear = printYear;

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

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6"><FormattedMessage id="Eis Bank Payment Advice (BEFTN)" /></Typography>
        </DialogTitle>
        <DialogContent dividers>

          {/* ================= EMPLOYEE SUMMARY SECTION ================= */}
          {eisPayments.length > 0 && (() => {
            const firstRow = eisPayments[0];
            const employeeInfo =
              firstRow?.workforceApplication.applicationType === "financialAssistance"
                ? safeParse(firstRow?.workforceApplication?.deceasedWorkerInfo)
                : firstRow?.workforceApplication?.workforceEmployee;

            const accidentInfo = safeParse(firstRow?.workforceApplication.employeeAccidentInfo);
            const applicationType = firstRow?.workforceApplication.applicationType;
            const lastSalary = Number(firstRow?.workforceApplication?.lastBaseSalary || 0);

            return (
              <Paper elevation={2} style={{ padding: 16, marginBottom: 20 }}>
                <Grid container spacing={2}>

                  <Grid item xs={12}>
                    <Typography variant="h6">
                      Worker Information
                    </Typography>
                    <Divider style={{ marginTop: 8, marginBottom: 16 }} />
                  </Grid>

                  <Grid item xs={6}>
                    <strong>Name of Worker:</strong>{" "}
                    {applicationType === "financialAssistance"
                      ? employeeInfo?.nameEn
                      : employeeInfo?.firstNameEn}
                  </Grid>

                  <Grid item xs={6}>
                    <strong>Application Type:</strong>{" "}
                    {applicationType === "financialAssistance" ? "Death" : "Disability"}
                  </Grid>

                  <Grid item xs={6}>
                    {applicationType === "financialAssistance" ? (
                      <>
                        <strong>Date of Death:</strong>{" "}
                        {new Date(accidentInfo?.dateOfDeath).toLocaleDateString("BD-en")}
                      </>
                    ) : (
                      <>
                        <strong>Date of Accident:</strong>{" "}
                        {new Date(accidentInfo?.accidentDate).toLocaleDateString("BD-en")}
                        <br />
                        <strong>Date of Rejoining:</strong>{" "}
                        {new Date(accidentInfo?.dateOfRejoining).toLocaleDateString("BD-en")}
                      </>
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <strong>Last Salary:</strong>{" "}
                    {lastSalary.toLocaleString("BD-en", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Grid>

                </Grid>
              </Paper>
            );
          })()}


          {/* ================= BENEFICIARY TABLE ================= */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>NOA Print</TableCell>
                <TableCell>SL</TableCell>
                <TableCell>Beneficiary ID</TableCell>
                <TableCell>Dependent Info</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {eisPayments.map((row, index) => {
                const dependent = row?.workforceEmployeeDependent?.[0] ?? null;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleRowPrint(row)}
                      >
                        Print
                      </Button>
                    </TableCell>

                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row?.beneficiaryId}</TableCell>

                    <TableCell>
                      {dependent ? (
                        <>
                          <Typography variant="subtitle2">
                            <strong>{dependent.nameEn}</strong>
                          </Typography>
                          <Typography variant="body2">
                            {RELATION_LABEL_BANGLA_MAP[dependent.relationWithWorker]}
                          </Typography>
                          <Typography variant="body2">
                            Age: {calculateAge(dependent.birthDate)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No Dependent
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="primary">
            <FormattedMessage id="workforce.modal.close" />
          </Button>
          {/* <Button onClick={handleDialogPrint} variant="contained" color="primary">
            <FormattedMessage id="workforce.modal.print.advice" />
          </Button> */}
          <Button onClick={exportToExcel} variant="contained" color="success">
            <FormattedMessage id="workforce.modal.excel" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden container used only to render the NOA template for copying */}
      <div id="print-area-container" className={classes.printContainer}>
        {selectedRow && printReady && (
          <NOAPrintTemplate
            row={selectedRow}
            payFrom={selectedRow.payFrom}
            payTo={selectedRow.payTo}
            OtherCompensationAmount={otherCompAmount}
            noaSigner={noaSignerInfo.noaSigner}
            noaSignature={noaSignerInfo.noaSignature}
          />
        )}
      </div>
    </>
  );
};

const NOAPrintTemplate = ({ row, payFrom, payTo, OtherCompensationAmount, noaSigner, noaSignature }) => {
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
    const address = tryParse(addressData) || {};
    const location = tryParse(locationData) || {};

    const postOffice = address?.postOffice?.nameBn || address?.postOffice;
    const village = [address.houseName, address.paraMahalla, address.villageRoad]
      .filter(Boolean)
      .join(", ");

    const thana = location?.parent?.name || location?.name;
    const district = location?.parent?.parent?.name || location?.parent?.name;

    return { village, postOffice, thana, district };
  };

  const employeePresentAddress = formatAddress(
    row?.workforceApplication?.workforceEmployee?.presentLocation,
    row?.workforceEmployee?.employeePresentAddress
  );

  const depentPresentAddress = formatAddress(
    row?.workforceEmployeeDependent?.[0]?.presentLocation,
    row?.workforceEmployeeDependent?.[0]?.depentPresentAddress
  );

  const cfAndEisAmount = (parseFloat(row?.eisMonthlyAmount) || 0) + (parseFloat(OtherCompensationAmount) || 0);

  const applicationType = row?.workforceApplication?.applicationType;
  const jsonEmployeeAccidentInfo = safeParse(row?.workforceApplication?.employeeAccidentInfo || "{}");
  console.log({ jsonEmployeeAccidentInfo });
  const employeeAccidentInfo = jsonEmployeeAccidentInfo;
  const jsonDoctorEntryInfo = safeParse(row?.workforceApplication?.doctorsEntry || "{}");
  console.log({ jsonDoctorEntryInfo });
  const doctorEntryInfo = jsonDoctorEntryInfo;

  // Use absolute paths for assets (adjust if your public folder path is different)
  let logo = <img src={window.location.origin + "/front/workforce_assets/centralfund.png"} alt="Central Fund Logo" style={{ width: "70px", position: "absolute", top: "0", right: "0" }} />;
  let eisLogo = <img src={window.location.origin + "/front/workforce_assets/eis.png"} alt="EIS Logo" style={{ width: "80px", position: "absolute", top: "8pt", left: "0" }} />;

  const deceasedWorkerInfo = safeParse(row?.workforceApplication?.deceasedWorkerInfo);
  const workerBirthDate = deceasedWorkerInfo?.birthDate ?? row?.workforceApplication?.workforceEmployee?.birthDate ?? "2026-01-01";
  const paymentType = row?.eisPaymentType;
  console.log("noa signature", noaSignature)


  let noaSignatureLogo = <img src={window.location.origin + (noaSignature?.url ?? "")} alt="Central Fund Logo" style={{ height: "70px" }} />;




  return (
    <div className="noa-page">
      <div className="noa-header">
        <div>
          {eisLogo}
          <p style={{ margin: 0 }}>ব্যক্তিগত</p>
          <h3 style={{ margin: "5px 0" }}>এমপ্লয়মেন্ট ইনজুরি স্কীম-(ই.আই.এস) পাইলট</h3>
          <p style={{ margin: "2px 0" }}>
            ১৯৬, ১০ম তলা, শ্রম ভবন, শহীদ সৈয়দ নজরুল ইসলাম সরনী, বিজয়নগর,
            ঢাকা-১০০০
          </p>
          {logo}
          <p style={{ margin: "2px 0" }}>
            মোবাইল: ০১৮৮৬-৯২১০৩০ | ই-মেইল: verification@eis-pilot-bd.org |
            ওয়েবসাইট: eis-pilot-bd.org
          </p>
          <h4 style={{ margin: "10px 0" }}>
            {applicationType === "financialAssistance"
              ? "নোটিশ অফ অ্যাওয়ার্ড- কর্মরত অবস্থায় দুর্ঘটনাজনিত মৃত্যু"
              : applicationType === "disabilityAssistance"
                ? "নোটিশ অফ অ্যাওয়ার্ড- কর্মরত অবস্থায় দুর্ঘটনাজনিত স্থায়ী আংশিক/সম্পূর্ণ অক্ষমতা"
                : ""}
          </h4>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 25mm", marginTop: "10px" }}>
            <span>সূত্র: {row?.beneficiaryId || ""}</span>
            <span>তারিখ: {new Date().toLocaleDateString("bn-BD")}</span>
          </div>
        </div>
      </div>

      <div className="noa-body">
        <table className="noa-table">
          <tbody>
            {/* Section 1 */}
            <tr>
              <td colSpan={2} className="noa-section">
                {applicationType === "financialAssistance" ? "মৃত" : "অক্ষম"} শ্রমিকের তথ্য:
              </td>
            </tr>

            <tr>
              <td className="noa-label">শ্রমিকের নাম:</td>
              <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.firstNameBn || ""}</td>
            </tr>

            <tr>
              <td className="noa-label">শ্রমিকের জাতীয় পরিচয়পত্র নম্বর:</td>
              <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.nid ? toBanglaNumber(row?.workforceApplication?.workforceEmployee?.nid) : ""}</td>
            </tr>
            {applicationType === "disabilityAssistance" && (
              <>
                <tr>
                  <td className="noa-label">শ্রমিকের জন্ম তারিখ:</td>
                  <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.birthDate ? new Date(row?.workforceApplication?.workforceEmployee?.birthDate).toLocaleDateString("bn-BD") : ""}</td>
                </tr>
              </>
            )}

            <tr>
              <td className="noa-label">ঠিকানা:</td>
              <td className="noa-value">
                গ্রামঃ {employeePresentAddress?.village || ""}, ডাকঘরঃ {employeePresentAddress?.postOffice || ""} , <br />
                উপজেলা/থানাঃ {employeePresentAddress?.thana || ""}, জেলাঃ  {employeePresentAddress?.district || ""}
              </td>
            </tr>
            <tr>
              <td className="noa-label">কর্মস্থলে দুর্ঘটনার তারিখ:</td>
              <td className="noa-value">{employeeAccidentInfo?.accidentDate ? new Date(employeeAccidentInfo?.accidentDate).toLocaleDateString("bn-BD") : ""}</td>
            </tr>
            <tr>
              <td className="noa-label">যে কারখানায় দুর্ঘটনা ঘটেছে তার নাম:</td>
              <td className="noa-value">{row?.workforceApplication?.employeeFactory?.nameBn || ""}</td>
            </tr>
            <tr>
              <td className="noa-label">দুর্ঘটনা ঘটার সময়কালীন শ্রমিকের মাসিক মজুরি:</td>
              <td className="noa-value">{Number(row?.workforceApplication?.lastBaseSalary).toLocaleString("bn-BD") || ""}</td>
            </tr>
            {applicationType === "disabilityAssistance" && (
              <>
                <tr>
                  <td className="noa-label">পুনরায় কর্মস্থলে যোগদানের তারিখ: (মাস/দিন/বছর)</td>
                  <td className="noa-value">{employeeAccidentInfo?.dateOfRejoining ? new Date(employeeAccidentInfo?.dateOfRejoining).toLocaleDateString("bn-BD") : ""}</td>
                </tr>
                <tr>
                  <td className="noa-label">স্থায়ী অক্ষমতার (উপার্জনক্ষমতা হ্রাস) হার:</td>
                  <td className="noa-value">{Number(doctorEntryInfo?.disabilityPerSchedule).toLocaleString("bn-BD") || "0"}{"%"}</td>
                </tr>
                <tr>
                  <td className="noa-label">স্থায়ী অক্ষমতা নিরীক্ষণের তারিখ:</td>
                  <td className="noa-value">{doctorEntryInfo?.dateOfAssessment ? new Date(doctorEntryInfo?.dateOfAssessment).toLocaleDateString("bn-BD") : ""}</td>
                </tr>
                <tr>
                  <td className="noa-label">শ্রমিকের এম.আই.এস আইডি নম্বর:</td>
                  <td className="noa-value">{row?.beneficiaryId || ""}</td>
                </tr>
                <tr>
                  <td className="noa-label">কেন্দ্রীয় তহবিল থেকে প্রদত্ত অর্থের পরিমাণ:</td>
                  <td className="noa-value">  {OtherCompensationAmount ? Number(OtherCompensationAmount).toLocaleString("bn-BD", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) : ""}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="noa-section">
                    মাসিক প্রদেয় টপ-আপ বেনেফিটের তথ্য:
                  </td>
                </tr>
                {(paymentType === "onetime" || paymentType === "installment") && (
                  <>
                    <tr>
                      <td className="noa-label">
                        সর্বমোট প্রদেয় ই.আই.এস টপ-আপ বেনেফিটের পরিমাণ:
                      </td>
                      <td className="noa-value"> {cfAndEisAmount ? Number(cfAndEisAmount).toLocaleString("bn-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                        : ""}</td>
                    </tr>
                    <tr>
                      <td className="noa-label">
                        মাসিক ই.আই.এস টপ-আপ বেনিফিটের কার্যকরী তারিখ:
                      </td>
                      <td className="noa-value">{row?.processingDate ? new Date(row?.processingDate).toLocaleDateString("bn-BD") : ""}</td>
                    </tr>
                  </>
                )}
                {(paymentType === "monthly") && (
                  <>
                    <tr>
                      <td className="noa-label">
                        মাসিক প্রদেয় ই.আই.এস টপ-আপ বেনেফিটের পরিমাণ:
                      </td>
                      <td className="noa-value">
                        {row?.eisMonthlyAmount
                          ? Number(row.eisMonthlyAmount).toLocaleString("bn-BD", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                          : ""}
                      </td>
                    </tr>
                    <tr>
                      <td className="noa-label">
                        মাসিক ই.আই.এস টপ-আপ বেনিফিটের কার্যকরী তারিখ:
                      </td>
                      <td className="noa-value">{row?.processingDate ? new Date(row?.processingDate).toLocaleDateString("bn-BD") : ""}</td>
                    </tr>
                  </>
                )}
              </>
            )}

            {/* Section 2 */}
            {applicationType === "financialAssistance" && (
              <>
                <tr>
                  <td className="noa-label">মৃত্যুর তারিখ:</td>
                  <td className="noa-value">{employeeAccidentInfo?.dateOfDeath ? new Date(employeeAccidentInfo?.dateOfDeath).toLocaleDateString("bn-BD") : ""}</td>
                </tr>
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
                  <td className="noa-value">{RELATION_LABEL_BANGLA_MAP[row?.workforceEmployeeDependent?.[0]?.relationWithWorker || ""]}</td>
                </tr>

                <tr>
                  <td className="noa-label">
                    নির্ভরশীল ব্যক্তির জাতীয় পরিচয়পত্র / জন্মসনদ নম্বর:
                  </td>
                  <td className="noa-value">{row?.workforceEmployeeDependent?.[0]?.nid ? toBanglaNumber(row?.workforceEmployeeDependent?.[0]?.nid) : ""}</td>
                </tr>

                <tr>
                  <td className="noa-label">
                    নির্ভরশীল ব্যক্তির জন্ম তারিখ: <br /> (মাস/দিন/বছর)
                  </td>
                  <td className="noa-value">{row?.workforceEmployeeDependent?.[0]?.birthDate ? new Date(row?.workforceEmployeeDependent?.[0]?.birthDate).toLocaleDateString("bn-BD") : ""}</td>
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
                {
                  calculateAge(row?.workforceEmployeeDependent?.[0]?.birthDate) >= 18 ?
                    (
                      <tr>
                        <td className="noa-label">অপ্রাপ্ত বয়স্ক নির্ভরশীল ব্যক্তির আইনগত অভিভাবক:</td>
                        <td className="noa-value"></td>
                      </tr>

                    ) : null
                }
                <tr>
                  <td className="noa-label">এম.আই.এস বেনিফিশিয়ারি নম্বর:</td>
                  <td className="noa-value">{row?.beneficiaryId || ""}</td>
                </tr>

                <tr>
                  <td className="noa-label">
                    কেন্দ্রীয় তহবিল থেকে প্রদত্ত অর্থের পরিমাণ:
                  </td>
                  <td className="noa-value">{OtherCompensationAmount ? Number(OtherCompensationAmount).toLocaleString("bn-BD", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) : ""}</td>
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
                  <td className="noa-value">
                    {row.eisInitialMonthlyAmount ?
                      Number(row.eisInitialMonthlyAmount).toLocaleString("bn-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      : ""}
                  </td>
                </tr>

                <tr>
                  <td className="noa-label">
                    কেন্দ্রীয় তহবিল প্রদত্ত অর্থ সমন্নয়ের পর প্রদেয়
                    <br />
                    মাসিক ই.আই.এস টপ-আপ বেনেফিটের পরিমাণ:
                  </td>
                  <td className="noa-value">
                    {row?.eisMonthlyAmount
                      ? Number(row.eisMonthlyAmount).toLocaleString("bn-BD", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                      : ""}
                  </td>
                </tr>

                <tr>
                  <td className="noa-label">
                    মাসিক ই.আই.এস টপ-আপ বেনিফিটের কার্যকরী তারিখ:
                  </td>
                  {/* <td className="noa-value">{row?.processingDate ? new Date(row?.processingDate).toLocaleDateString("bn-BD") : ""}</td> */}
                  <td className="noa-value">{applicationType == 'financialAssistance' ? new Date(employeeAccidentInfo.dateOfDeath).toLocaleDateString("bn-BD") :
                    employeeAccidentInfo.dateOfRejoining ? new Date(employeeAccidentInfo.dateOfRejoining).toLocaleDateString("bn-BD") : new Date(employeeAccidentInfo.accidentDate).toLocaleDateString("bn-BD")}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <div className="noa-additional-info">
          {getFooterContentNew(row?.workforceEmployeeDependent?.[0], workerBirthDate, applicationType, paymentType)}
        </div>
      </div>

      <div className="noa-footer">
        <div className="noa-signature">
          {noaSignatureLogo}
          <p style={{ margin: "2px 0" }}>{noaSigner?.workforceCommitteeUser?.designation}</p>
          <p style={{ margin: "2px 0" }}>{noaSigner?.workforceCommitteeUser?.organizationName}</p>
          <p style={{ margin: "2px 0" }}>ও</p>
          <p style={{ margin: "2px 0" }}>{noaSigner?.roleInCommittee}, {noaSigner?.committee?.nameBn}</p>

          {/* <p style={{ margin: "2px 0" }}>মহাপরিচালক</p>
          <p style={{ margin: "2px 0" }}>কেন্দ্রীয় তহবিল</p>
          <p style={{ margin: "2px 0" }}>ও</p>
          <p style={{ margin: "2px 0" }}>সদস্য সচিব-ইআইএস গভর্নেন্স বোর্ড</p> */}
        </div>
      </div>
    </div>
  );
};

export default GenerateEisBFTN;
