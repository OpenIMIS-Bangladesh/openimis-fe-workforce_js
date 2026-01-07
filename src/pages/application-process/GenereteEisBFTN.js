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
import { getUserTypeFromRights } from "../../utils/utils";
import ForwardIcon from "@material-ui/icons/Forward";
import { WORKFORCE_STATUS, RELATION_LABEL_MAP } from "../../constants";
import {
  createApplicationSummary,
  updateApplication,
  updateApplicationSummary,
} from "../../actions";
import { useDispatch } from "react-redux";
import React, { Component, useState, useEffect, useRef } from "react";
import { enToBn } from "../../utils/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  useModulesManager,
  decodeId,
  FormattedMessage,
  parseData
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { useReactToPrint } from "react-to-print";
import { fetchEisPaymentProcess, fetchWorkforceOtherCompensation } from "../../actions";
const useStyles = makeStyles(() => ({
  "@global": {
    /* ===== PRINT ROOT ===== */
    ".printArea": {
        display: "none",
    },

    "@media print": {
      ".printArea": {
        display: "block",
        width: "100%",
        color: "#000",
      },

      ".noaPage": {
        fontFamily: '"Noto Sans Bengali","SolaimanLipi",sans-serif',
        paddingTop: "50mm",
        paddingBottom: "50mm",
        paddingLeft: "25mm",
        paddingRight: "25mm",
        pageBreakAfter: "always",
        fontSize: "10px",
        color: "#000",
      },

      /* ===== HEADER ===== */
      ".header": {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "55mm",
        padding: "5mm 10mm",
        textAlign: "center",
        background: "#fff",
      },

      ".headerText": {
        lineHeight: 1.1,
      },

      /* ===== BODY ===== */
      ".body": {
        width: "100%",
      },

      ".table": {
        width: "100%",
        borderCollapse: "collapse",
      },

      ".td": {
        border: "1px solid #000",
        padding: "6px 8px",
        verticalAlign: "top",
      },

      ".label": {
        width: "35%",
        fontWeight: 500,
      },

      ".value": {
        width: "65%",
      },

      ".section": {
        fontWeight: 600,
        background: "#f5f5f5",
      },

      /* ===== FOOTER ===== */
      ".footer": {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40mm",
        padding: "5mm 10mm",
        fontSize: "12px",
        fontWeight: "bold",
        background: "#fff",
      },

      ".signature": {
        textAlign: "right",
      },

      /* Hide dialog/UI */
      ".MuiDialog-root": {
        display: "none !important",
      },
    },
  },
}));


const GenerateEisBFTN = ({
  open,
  onClose,
  eisPayments = [],
  userRights,
  status,
  summary_Id,
  selectedApplicationIds,
  OtherCompensationAmount = []
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(null);
  const [printMode, setPrintMode] = useState(null);
  const modulesManager = useModulesManager();
  const getTotalAmount = () => {
    return eisPayments
      .reduce((sum, item) => sum + (parseFloat(item.eisMonthlyAmount) || 0), 0)
      .toFixed(2);
  };

  console.log("eisPayments", eisPayments);
  //  const data = eisPayments?.[0] || {};
  // const parsingBankInfo = JSON.parse(data.workforceApplication?.employeeBankInfo);
  // const parsedBankInfo = JSON.parse(parsingBankInfo);
  // const parsingEmployeeAccidentInfo = JSON.parse(data.workforceApplication?.employeeAccidentInfo);
  // const parsedEmployeeAccidentInfo = JSON.parse(parsingEmployeeAccidentInfo);
  // console.log("parsedEmployeeAccidentInfo",parsedEmployeeAccidentInfo)
  /* -----------------------------
     ROW-WISE PRINT HANDLER
  ----------------------------- */

const handleRowPrint = (row) => {
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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
    });
  });
};

useEffect(() => {
  const afterPrint = () => {
    setPrintMode(null);
    setSelectedRow(null);
  };

  window.addEventListener("afterprint", afterPrint);
  return () => window.removeEventListener("afterprint", afterPrint);
}, []);



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
const [otherCompAmount, setOtherCompAmount] = useState(0);

  useEffect(() => {
    if (selectedApplicationIds?.length > 0) {
      const applicationIds = selectedApplicationIds.map((x) => decodeId(x.id));

      console.log("IDs:", applicationIds);

      dispatch(fetchEisPaymentProcess(applicationIds,modulesManager));
      dispatch(fetchWorkforceOtherCompensation(modulesManager,[`workforceApplicationId: "${applicationIds}"`])).then((res) => {
                const fetchOtherCompensation = parseData(res?.payload?.data?.workforceOtherCompensationInfo);
                const amount = fetchOtherCompensation?.[0]?.amount || 0;
                setOtherCompAmount(amount);               
                console.log("OtherCompensation",OtherCompensationAmount);
              });
    }
  }, [selectedApplicationIds]);

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
    sheet.getCell(
      "A1"
    ).value = `Ref No: EIS.Bank Advice.Benefit.${excelyear}.${excelmonthFormatted}`;
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
    sheet.getCell("A8").value =
      "Subject: Bank Advice Letter (EIS Top-up Benefit)";
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
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        className={printMode === "NOA" ? classes.noPrintDialog : ""}
      >
        <DialogTitle disableTypography>
          <Typography variant="h6">
            <FormattedMessage id="Eis Bank Payment Advice (BEFTN)" />
          </Typography>
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
              {eisPayments.map((row, index) => {
                const year = row?.year || "";
                const monthIndex = row?.monthIndex || "";
                const monthFormatted = String(monthIndex).padStart(2, "0");
                const lastDay = new Date(year, monthIndex, 0).getDate();

                return (
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
                );
              })}

              <TableRow>
                <TableCell colSpan={8}>
                  <strong>Total Amount</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{getTotalAmount()}</strong>
                </TableCell>
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

      {/* ================= PRINT AREA ================= */}
      {/* Place this somewhere in your component */}
      <div id="print-area" className="printArea">
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

const NOAPrintTemplate = ({ row, payFrom, payTo, OtherCompensationAmount }) => {
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
  // const employeePresentAddress = formatAddress(
  //   row?.workforceApplication?.workforceEmployee?.presentLocation, row?.workforceEmployee[0]?.employeePresentAddress
  // );
  const depentPresentAddress = formatAddress(
    row?.workforceEmployeeDependent[0]?.presentLocation, row?.workforceEmployeeDependent[0]?.depentPresentAddress
  );
const cfAndEisAmount = (parseFloat(row?.eisMonthlyAmount) || 0) + (parseFloat(OtherCompensationAmount) || 0);
     console.log("cfAndEisAmount",cfAndEisAmount)

  return (
    <div className="noaPage">
      {/* ===== HEADER ===== */}
      <div className="header">
        <div className="headerText">
          <p>ব্যক্তিগত</p>
          <h3>এমপ্লয়মেন্ট ইনজুরি স্কীম-(ই.আই.এস) পাইলট</h3>
          <p>
            ১৯৬, ১০ম তলা, শ্রম ভবন, শহীদ সৈয়দ নজরুল ইসলাম সরনী, বিজয়নগর,
            ঢাকা-১০০০
          </p>
          <p>
            মোবাইল: ০১৮৮৬-৯২১০৩০ | ই-মেইল: verification@eis-pilot-bd.org |
            ওয়েবসাইট: eis-pilot-bd.org
          </p>
          <h4>নোটিশ অফ অ্যাওয়ার্ড- কর্মরত অবস্থায় দুর্ঘটনাজনিত মৃত্যু</h4>
          <p>সূত্র: {row?.beneficiaryId || ""}</p>
          <p style={{ textAlign: "right" }}>
            তারিখ: {new Date().toLocaleDateString("bn-BD")}
          </p>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="body">
        <table className="table">
          <tbody>
            <tr>
              <td colSpan={2} className="td section">
                মৃত শ্রমিকের তথ্য:
              </td>
            </tr>

            <tr>
              <td className="td label">শ্রমিকের নাম:</td>
              <td className="td value">{row?.workforceApplication?.workforceEmployee?.firstNameBn || ""}</td>
            </tr>

            <tr>
              <td className="td label">শ্রমিকের জাতীয় পরিচয়পত্র নম্বর:</td>
              <td className="td value">{row?.workforceApplication?.workforceEmployee?.nid || ""}</td>
            </tr>

            <tr>
              <td className="td label">ঠিকানা:</td>
              <td className="td value">
                {/* গ্রামঃ {employeePresentAddress?.village || ""}, ডাকঘরঃ {employeePresentAddress?.postOffice || ""} , <br />
                উপজেলা/থানাঃ {employeePresentAddress?.thana || ""}, জেলাঃ  {employeePresentAddress?.district || ""} */}
              </td>
            </tr>

            <tr>
              <td colSpan={2} className="td section">
                উপযুক্ত নির্ভরশীল ব্যক্তির তথ্য:
              </td>
            </tr>

            <tr>
              <td className="td label">উপযুক্ত নির্ভরশীলের নাম:</td>
              <td className="td value">{row?.workforceEmployeeDependent[0]?.nameBn || ""}</td>
            </tr>

            <tr>
              <td className="td label">মৃত শ্রমিকের সাথে সম্পর্ক:</td>
              <td className="td value">{RELATION_LABEL_MAP[row?.workforceEmployeeDependent?.[0]?.relationWithWorker || ""]}</td>              
            </tr>

            <tr>
              <td className="td label">
                নির্ভরশীল ব্যক্তির জাতীয় পরিচয়পত্র / জন্মসনদ নম্বর:
              </td>
              <td className="td value">{row?.workforceEmployeeDependent[0]?.nid || ""}</td>
            </tr>

            <tr>
              <td className="td label">
                নির্ভরশীল ব্যক্তির জন্ম তারিখ:
                <br />
                (মাস/দিন/বছর)
              </td>
              <td className="td value">{row?.workforceEmployeeDependent[0]?.birthDate || ""}</td>
            </tr>

           <tr>
              <td className="td label">ঠিকানা:</td>
              <td className="td value">
                {depentPresentAddress?.village || ""}, {depentPresentAddress?.postOffice || ""},{" "}
                {depentPresentAddress?.thana || ""}, {depentPresentAddress?.district || ""}
              </td>
            </tr>

            <tr>
              <td className="td label">এম.আই.এস বেনিফিশিয়ারি নম্বর:</td>
              <td className="td value">{row?.beneficiaryId || ""}</td>
            </tr>

            <tr>
              <td className="td label">
                কেন্দ্রীয় তহবিল থেকে প্রদত্ত অর্থের পরিমাণ:
              </td>
              <td className="td value">{OtherCompensationAmount}</td>
            </tr>

            {/* ===== SECTION TITLE ===== */}
            <tr>
              <td colSpan={2} className="td section">
                মাসিক প্রদেয় টপ-আপ বেনেফিটের তথ্য:
              </td>
            </tr>

            <tr>
              <td className="td label">
                মাসিক প্রদেয় ই.আই.এস টপ-আপ বেনেফিটের পরিমাণ:
              </td>
              <td className="td value">{row?.eisMonthlyAmount || ""}</td>
            </tr>

            <tr>
              <td className="td label">
                কেন্দ্রীয় তহবিল প্রদত্ত অর্থ সমন্নয়ের পর প্রদেয়
                <br />
                মাসিক ই.আই.এস টপ-আপ বেনেফিটের পরিমাণ:
              </td>
              <td className="td value">{cfAndEisAmount || ""}</td>
            </tr>

            <tr>
              <td className="td label">
                মাসিক ই.আই.এস টপ-আপ বেনিফিটের কার্যকরী তারিখ:
              </td>
              <td className="td value">{row?.processingDate || ""}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <strong>
            মাসিক টপ-আপ বেনিফিট ও ই.আই.এস পাইলট সম্পর্কে গুরুত্বপূর্ণ তথ্য:
          </strong>
          <ol>
            <li>টপ-আপ বেনিফিট মাসিকভিত্তিতে প্রদান করা হবে।</li>
            <li>নির্ভরশীল সদস্য পরিবর্তন হলে অবহিত করতে হবে।</li>
            <li>প্রমাণপত্র প্রতি বছর প্রদান করতে হবে।</li>
            <li>ক্রেতা/ব্র্যান্ডদের অর্থায়নে টপ-আপ প্রদান করা হয়।</li>
          </ol>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="footer">
        <div className="signature">
          <p>মহাপরিচালক</p>
          <p>কেন্দ্রীয় তহবিল</p>
          <p>ও</p>
          <p>সদস্য সচিব-ইআইএস গভর্নেন্স বোর্ড</p>
        </div>
      </div>
    </div>
  );
};

export default GenerateEisBFTN;
