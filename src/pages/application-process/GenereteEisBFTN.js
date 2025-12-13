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
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights } from "../../utils/utils";
import ForwardIcon from "@material-ui/icons/Forward";
import { WORKFORCE_STATUS } from "../../constants";
import { createApplicationSummary, updateApplication, updateApplicationSummary } from "../../actions";
import { useDispatch } from "react-redux";
import React, { Component, useState ,useEffect} from "react";
import { enToBn } from '../../utils/utils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  useModulesManager,
  decodeId,
  FormattedMessage,
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
import { fetchEisPaymentProcess } from "../../actions";

const GenerateEisBFTN = ({ open, onClose, eisPayments = [], userRights, status, summary_Id, selectedApplicationIds }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const getTotalAmount = () => {
    return eisPayments
      .reduce((sum, item) => sum + (parseFloat(item.eisMonthlyAmount) || 0), 0)
      .toFixed(2);
  };

  console.log("eisPayments", eisPayments);

useEffect(() => {
  if (selectedApplicationIds?.length > 0) {

    const applicationIds = selectedApplicationIds.map(x =>
      decodeId(x.id)
    );

    console.log("IDs:", applicationIds);

    dispatch(fetchEisPaymentProcess(applicationIds));
  }
}, [selectedApplicationIds]);



const year = eisPayments?.[0]?.year || "";
const monthIndex = eisPayments?.[0]?.monthIndex || "";


// Format month as 01..12
const monthFormatted = String(monthIndex + 1).padStart(2, "0");

// Pay period values
const payFrom = `01.${monthFormatted}.${year}`;
const lastDay = new Date(year, monthIndex + 1, 0).getDate();
const payTo = `${lastDay}.${monthFormatted}.${year}`;

  // -----------------------------
  // Excel generator (unchanged)
  // -----------------------------
 const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Bank Advice", {
  });

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
  sheet.getCell("A1").value = `Ref No: EIS.Bank Advice.Benefit.${year}.${monthFormatted}`;
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
    { text: "EIS Pilot top-up benefits are required to be disbursed to the beneficiaries through bank transfer from your branch of EIS Pilot bank account," },
    { text: " Account Title: EMPLOYMENT INJURY SCHEME EIS", font: { bold: true } },
    { text: ", Account Number: 4426302003729", font: { bold: true } },
    { text: ". The validated list of account holders with their respective Account Titles, Bank Account Numbers, Bank Names, Branch info, Routing Numbers including Payment amounts have been mentioned below." }
  ]
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
    "Pay To"
  ];

  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);

  const headerRow = sheet.addRow(tableHeader);

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "92D050" }
    };
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });
   
    const data = eisPayments?.[0] || {};
    const parsingBankInfo = JSON.parse(data.workforceApplication?.employeeBankInfo); 
    const parsedBankInfo = JSON.parse(parsingBankInfo);
    console.log("parsedBankInfo",parsedBankInfo)
  // -----------------------------
  // REAL DATA FROM eisPayments
  // -----------------------------
  eisPayments.forEach((row, index) => {
    let bankInfo = {};
    try {
      bankInfo = JSON.parse(JSON.parse(row.employeeBankInfo));
    } catch (e) {}

    sheet.addRow([
      index + 1,
      row?.bankAccountHolderName || "",
      row?.bankAccountNo || "",
      parsedBankInfo[0]?.bank?.nameEn || "",
      parsedBankInfo[0]?.branch?.nameEn || "",
      parsedBankInfo[0]?.district?.nameEn || "",
      parsedBankInfo[0]?.branch?.routingNumber || "",
      row?.eisMonthlyAmount || 0,
      row?.beneficiaryId,
      payFrom,
      payTo
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
      right: { style: "thin" }
    };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
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
  "6. Assistant Director, Finance Department, Central Fund, Bangladesh Secretariat, Dhaka-1000."
];

// Loop through lines and merge across all 10 columns
closingLines.forEach((line) => {
  const row = sheet.addRow([line]);
  sheet.mergeCells(`A${row.number}:J${row.number}`);
  row.getCell(1).alignment = { horizontal: "left", vertical: "top", wrapText: true };
});


  // -----------------------------
  // Download Excel File
  // -----------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  saveAs(blob, "BA-Advice.xlsx");
};


  // -----------------------------------
  // UI: Render all eisPayments (no filter)
  // -----------------------------------

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h6">
          <FormattedMessage id="Eis Bank Payment Advice (BEFTN)" />
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><FormattedMessage id="SL #" /></TableCell>
              <TableCell><FormattedMessage id="Account Title" /></TableCell>
              <TableCell><FormattedMessage id="Bank Account Number" /></TableCell>
              <TableCell><FormattedMessage id="Bank" /></TableCell>
              <TableCell><FormattedMessage id="Branch" /></TableCell>
              <TableCell><FormattedMessage id="District" /></TableCell>
              <TableCell><FormattedMessage id="Routing No" /></TableCell>
              <TableCell><FormattedMessage id="Amount (BDT)" /></TableCell>
              <TableCell align="right"><FormattedMessage id="BeneficiaryID" /></TableCell>
              <TableCell align="right"><FormattedMessage id="Pay From" /></TableCell>
              <TableCell align="right"><FormattedMessage id="Pay To" /></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {eisPayments.map((row, index) => {
              let bankInfo = {};
              try {
                bankInfo = JSON.parse(JSON.parse(row.employeeBankInfo));
              } catch (e) {}

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row?.bankAccountHolderName}</TableCell>
                  <TableCell>{row?.bankAccountNo}</TableCell>
                  <TableCell>{bankInfo?.nameEn || ""}</TableCell>
                  <TableCell>{bankInfo?.branch?.nameEn || ""}</TableCell>
                  <TableCell>{bankInfo?.branch?.district || ""}</TableCell>
                  <TableCell>{bankInfo?.branch?.routingNumber || ""}</TableCell>
                  <TableCell align="right">{row?.eisMonthlyAmount}</TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right">{payFrom}</TableCell>
                  <TableCell align="right">{payTo}</TableCell>
                </TableRow>
              );
            })}

            <TableRow>
              <TableCell colSpan={8}><strong><FormattedMessage id="Total Amount" /></strong></TableCell>
              <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
              <TableCell colSpan={3} />
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>

      <Divider />

      <DialogActions className={classes.noPrint}>
        <Button onClick={onClose} variant="outlined" color="primary">
          <FormattedMessage id="workforce.modal.close" />
        </Button>

        <Button onClick={() => window.print()} variant="contained" color="primary">
          <FormattedMessage id="workforce.modal.print.advice" />
        </Button>

        <Button onClick={exportToExcel} variant="contained" color="success">
          <FormattedMessage id="workforce.modal.excel" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default GenerateEisBFTN;
