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
import React, { Component, useState } from "react";
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

const GenereteEisDependentBFTN = ({ open, onClose, eisPayments = [], userRights, status, summary_Id }) => {
const classes = useStyles();
console.log("eisPayments", eisPayments);
const getTotalAmount = () => {
  return eisPayments
    .reduce((sum, item) => sum + (parseFloat(item.eisMonthlyAmount) || 0), 0)
    .toFixed(2);
};

const year = eisPayments[0]?.year;
const monthIndex = eisPayments[0]?.monthIndex;

// Format month as 01..12
const monthFormatted = String(monthIndex + 1).padStart(2, "0");


  // -----------------------------
  // Excel generator (unchanged)
  // -----------------------------
  const exportToExcel = async () => {
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
    sheet.getCell("G6").value = "Date: 10/15/2025";
    sheet.getCell("G6").font = { bold: true };
    sheet.getCell("G6").alignment = { horizontal: "right" };
  
    // Worker, Factory & Accident Information
    const data = eisPayments?.[0] || {};
  
    const leftItems = [
      ["EIS Worker ID", data.eisWorkerId || ""],
      ["Date of Accident", data.dateOfAccident || ""],
      ["Date of Rejoining", data.dateOfRejoining || ""],
      ["Date of Disability Assessment", data.disabilityAssessmentDate || ""],
      ["Effective date of Benefit", data.effectiveDateOfBenefit || ""],
    ];
  
    const rightItems = [
      ["Name of the Factory", data.workforceApplication?.employeeFactory?.nameEn || ""],
      ["Name of Association", data.workforceApplication?.associationType || ""],
      ["Gross Salary (BDT)", data.workforceApplication?.lastBaseSalary || ""],
      ["Percentage of Disability", data.percentageOfDisability || ""],
      ["Type of Accident", data.typeOfAccident || ""],
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
    sheet.addRow([]); // small spacing before table
  
    const tableHeader = [
      "Sl #",
      "EIS Worker ID",
      "NID/Birth Certificate of Worker",
      "Benefit Rate (%) of Gross Salary",
      "Monthly Payable Benefit (BDT)",
      "Net Monthly Payable After Adjustment (BDT)",
      "Type of Payment",
      "Approval Status",
      "Remarks",
    ];
  
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
  
    // Add payment rows
    eisPayments.forEach((row, index) => {
      sheet.addRow([
        index + 1,
        "",
        row?.workforceApplication?.workforceEmployee?.nid || "",
        "",
        row?.eisMonthlyAmount || 0,
        row?.eisMonthlyAmount || 0,
        row?.eisPaymentType || "",
        "",
        row?.eisApprovedAmount,
      ]);
    });
  
    // Apply borders to payment rows
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
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      });
    }
  
    // ==========================
    // Download Excel
    // ==========================
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    saveAs(blob, "Benefit-Approval.xlsx");
  };
  


  // -----------------------------------
  // UI: Render all eisPayments (no filter)
  // -----------------------------------

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h6">
          <FormattedMessage id="EIS-Pilot Benefit Approval Note (Disability)" />
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><FormattedMessage id="SL #" /></TableCell>
              <TableCell><FormattedMessage id="EIS Worker ID" /></TableCell>
              <TableCell><FormattedMessage id="NID/Birth Certificate of Worker" /></TableCell>
              <TableCell><FormattedMessage id="Benefit Rate (%) of Gross Salary" /></TableCell>
              <TableCell><FormattedMessage id="Monthly Payable Benefit (BDT)" /></TableCell>
              <TableCell><FormattedMessage id="Net Monthly Payable After Adjustment (BDT" /></TableCell>
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
              } catch (e) {}

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>EIS.2025.SP.000045</TableCell>
                  <TableCell>{row?.workforceApplication?.workforceEmployee?.nid}</TableCell>
                  <TableCell>5.20%</TableCell>
                  <TableCell>{row?.eisMonthlyAmount}</TableCell>
                  <TableCell>{row?.eisMonthlyAmount}</TableCell>
                  <TableCell>{row?.eisPaymentType}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{row?.eisApprovedAmount}</TableCell>
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


export default GenereteEisDependentBFTN;
