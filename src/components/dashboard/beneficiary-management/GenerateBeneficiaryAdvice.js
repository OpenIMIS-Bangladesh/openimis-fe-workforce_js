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

import React, { useState, useEffect } from "react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  FormattedMessage,
  useModulesManager
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { createWorkforceEisBankAdvice, fetchWorkforceEisPaymentDisbursementStage } from '../../../actions';
import { useDispatch } from "react-redux";
import { safeDecodeId } from '../../../utils/utils';

const useStyles = makeStyles((theme) => ({
  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  dialogPaper: {
    minWidth: "90vw",
    "@media print": {
      boxShadow: "none",
      border: "none",
      minWidth: "100%",
      margin: 0,
      maxWidth: "100% !important",
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
      "html, body": {
        height: "100%",
        overflow: "hidden",
      },
    },
  },
}));

const GenerateBeneficiaryAdvice = ({ open, onClose, paymentData, month, year, fromAdviceList=false}) => {
  const dispatch= useDispatch();
  const modulesManager= useModulesManager();
  const classes = useStyles();
  const [eisPayments, setEisPayments] = useState([]);

  const getTotalAmount = () => {
    return eisPayments
      .reduce((sum, item) => sum + (parseFloat(item.paidAmount) || 0), 0)
      .toFixed(2);
  };

  useEffect(() => {
    const loadData= async ()=>{
      setEisPayments(paymentData);
    };

    loadData();
  }, [open]);

  // -----------------------------
  // Date values for ref (same as Excel)
  // -----------------------------
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
        { text: "EIS Pilot top-up benefits are required to be disbursed to the beneficiaries through bank transfer from your branch of EIS Pilot bank account," },
        { text: " Account Title: EMPLOYMENT INJURY SCHEME EIS", font: { bold: true } },
        { text: ", Account Number: 4426302003729", font: { bold: true } },
        { text: ". The validated list of account holders with their respective Account Titles, Bank Account Numbers, Bank Names, Branch info, Routing Numbers including Payment amounts have been mentioned below." },
      ],
    };

    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([]);

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

    eisPayments.forEach((row, index) => {
      let year = row?.year || "";
      let monthIndex = row?.monthIndex || "";
      let monthFormatted = String(monthIndex).padStart(2, "0");

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
        row?.paidAmount || 0,
        row?.beneficiaryId || "",
        payFrom,
        payTo,
      ]);
    });

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

    closingLines.forEach((line) => {
      const row = sheet.addRow([line]);
      sheet.mergeCells(`A${row.number}:J${row.number}`);
      row.getCell(1).alignment = {
        horizontal: "left",
        vertical: "top",
        wrapText: true,
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "BA-Advice.xlsx");
  };

  const handleDialogPrint = () => {
    window.print();
  };


  const handleSaveAdvice = () => {
    if(window.confirm("Are You sure you want to save this Bank Advice?"))
    {
      let ids= [];
      paymentData.forEach(data =>{
        ids.push(data.id);
      })
      try{
        dispatch(createWorkforceEisBankAdvice(ids, month, year)).then((response) => {
          onClose();
        });
      }
      catch(e) {
        alert("Bank Advice Creation Failed!")
      }
    }
    else
    {
      alert("Bank Advice Creation Failed!")
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
      PaperProps={{ id: "printable-content" }}
    >
      <DialogTitle disableTypography className={classes.noPrint}>
        <Typography variant="h6">
          <FormattedMessage id="EIS Bank Payment Advice (BEFTN)" />
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {/* Letter Header */}
        <Typography align="right" paragraph>
          Ref No: EIS.Bank Advice.Benefit.{excelyear}.{excelmonthFormatted}
        </Typography>

        <Typography align="left" variant="subtitle1" paragraph>Manager</Typography>
        <Typography align="left" paragraph>Sonali Bank Limited</Typography>
        <Typography align="left" paragraph>Ramna Corporate Branch</Typography>
        <Typography align="left" paragraph>1, Topkhana Road, Ramna, Dhaka, 1000</Typography>

        <Typography
          variant="subtitle1"
          style={{ fontWeight: "bold", textDecoration: "underline" }}
          paragraph
        >
          <strong>Subject:</strong> Bank Advice Letter (EIS Top-up Benefit)
        </Typography>

        <Typography paragraph>Dear Sir:</Typography>

        <Typography paragraph>Greetings from EIS Pilot!</Typography>

        <Typography paragraph>
          EIS Pilot top-up benefits are required to be disbursed to the beneficiaries through bank transfer from your branch of EIS Pilot bank account,{" "}
          <strong>Account Title: EMPLOYMENT INJURY SCHEME EIS</strong>,{" "}
          <strong>Account Number: 4426302003729</strong>.
          {" "}The validated list of account holders with their respective Account Titles, Bank Account Numbers, Bank Names, Branch info, Routing Numbers including Payment amounts have been mentioned below.
        </Typography>

        {/* Table */}
        <Table size="small">
          <TableHead>
            <TableRow>
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
            {eisPayments.map((row, index) => {
              const year = row?.year || "";
              const monthIndex = row?.monthIndex || "";
              const monthFormatted = String(monthIndex).padStart(2, "0");
              const lastDay = new Date(year, monthIndex, 0).getDate();

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row?.bankAccountHolderName}</TableCell>
                  <TableCell>{row?.bankAccountNo}</TableCell>
                  <TableCell>{row?.bank?.parent?.nameEn}</TableCell>
                  <TableCell>{row?.bank?.nameEn}</TableCell>
                  <TableCell>{row?.bank?.districtNameEn}</TableCell>
                  <TableCell>{row?.bank?.routingNumber}</TableCell>
                  <TableCell align="right">{row?.paidAmount}</TableCell>
                  <TableCell align="right">{row?.beneficiaryId}</TableCell>
                  <TableCell align="right">01.{monthFormatted}.{year}</TableCell>
                  <TableCell align="right">{lastDay}.{monthFormatted}.{year}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Total Amount */}
        <Typography align="right" variant="subtitle1" style={{ fontWeight: "bold", marginTop: "20px" }} paragraph>
          Total Amount (BDT): {getTotalAmount()}
        </Typography>

        {/* Closing */}
        <Typography paragraph>
          Your prompt necessary steps in this matter will be highly appreciated.
        </Typography>

        <Typography paragraph>With warm regards</Typography>

        <Typography paragraph>
          <strong>Director General,</strong><br />
          Central Fund, Ministry of Labor and Employment &<br />
          Member Secretary, EIS Pilot Governance Board<br />
          Bangladesh Secretariat, Dhaka-1000
        </Typography>

        <Typography paragraph>
          Copy to (Not in order of seniority):
        </Typography>
        <Typography paragraph style={{ marginLeft: "20px" }}>
          1. PS to State Minister, Ministry of Labour and Employment, Bangladesh Secretariat, Dhaka-1000.<br />
          2. PS to Secretary, Ministry of Labour and Employment, Bangladesh Secretariat, Dhaka-1000.<br />
          3. Special Advisor, EIS Pilot Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka-1000.<br />
          4. PA to Director General, Central Fund, Bangladesh Secretariat, Dhaka-1000.<br />
          5. Assistant Director, Welfare-2 and Development, Central Fund, Bangladesh Secretariat, Dhaka-1000.<br />
          6. Assistant Director, Finance Department, Central Fund, Bangladesh Secretariat, Dhaka-1000.
        </Typography>
      </DialogContent>

      <Divider className={classes.noPrint} />

      <DialogActions className={classes.noPrint}>
        <Button onClick={onClose} variant="outlined" color="primary">
          <FormattedMessage id="workforce.modal.close" />
        </Button>
        {fromAdviceList? (
          <>
            <Button onClick={handleDialogPrint} variant="contained" color="primary">
              <FormattedMessage id="workforce.modal.print.advice" />
            </Button>
            <Button onClick={exportToExcel} variant="contained" color="secondary">
              <FormattedMessage id="workforce.modal.excel" />
            </Button>
          </>
        ):
        (
          <Button onClick={handleSaveAdvice} variant="contained" color="primary">
            <FormattedMessage id="workforce.modal.save.advice" />
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenerateBeneficiaryAdvice;