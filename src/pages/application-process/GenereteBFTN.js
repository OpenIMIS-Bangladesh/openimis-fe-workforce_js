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
import { WORKFORCE_USER_TYPE, RELATION_LABEL_MAP } from "../../constants";
import { getUserTypeFromRights, safeDecodeId, safeParse } from "../../utils/utils";
import ForwardIcon from "@material-ui/icons/Forward";
import { WORKFORCE_STATUS } from "../../constants";
import {
  createApplicationSummary,
  fetchApplicationWiseMovementList,
  updateApplication,
  updateApplicationSummary,
  fetchWorkforceEmployeeDependent,
  fetchWorkforceCommitteeUserMap,
} from "../../actions";
import { useDispatch,useSelector } from "react-redux";
import React, { Component, useEffect, useState } from "react";
import { enToBn } from "../../utils/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useModulesManager, decodeId, FormattedMessage, parseData } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import FormattedBankPaymentAdvice from "../../components/BFTN-components/FormattedBankPaymentAdvice";
const useStyles = makeStyles((theme) => ({
  noPrint: {
    "@media print": {
      display: "none !important",
    },
  },
  dialogPaper: {
    "@media print": {
      boxShadow: "none",
      border: "none",
      maxWidth: "100vw",
    },
  },
  dialogContent: {
    "@media print": {
      padding: 0,
    },
  },
}));

const GenerateBFTN = ({ open, onClose, applications = [], userRights, status, summary_Id, summaryData }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const [movements, setMovements] = useState([]);
  const [lastRevertMovement, setLastRevertMovement] = useState(null);
  const [revertNotes, setRevertNotes] = useState([]);
  const [serverResponse, setServerResponse] = useState(null);
  const [dependentData, setDependentData] = useState([]);
  const [mappings, setMappings] = useState([]);
  const userIds = safeParse(summaryData?.userIds);

  console.log({applications})

  const getTotalAmount = () => {
    return applications
      .filter((item) => String(item.status) === String(status))
      .reduce((sum, item) => sum + (parseFloat(item.grantAmount) || 0), 0)
      .toFixed(2);
  };

  console.log({ fromBFTN: applications });
  // console.log({ summary_Id: userIds });

  const handleForward = async () => {
    if (!window.confirm("আবেদনগুলো মহাপরিচালক কাছে অগ্রায়ন নিশ্চিত করছেন?")) return;

    const filteredApplications = applications.filter((item) => String(item.status) === String(status));

    if (filteredApplications.length === 0) {
      return setServerResponse({ status: "ERROR", message: "কোনো উপযুক্ত আবেদন পাওয়া যায়নি।" });
    }

    const isQuorum = mappings?.[0]?.committee?.approvalType === "quorum";
    const totalApprovers = mappings?.length || 1;
          console.log({filteredApplications})
    
    try {
      let allMajorityApproved = true;

      for (const item of filteredApplications) {
        const decodedId = safeDecodeId(item.id);
        let targetStatus = WORKFORCE_STATUS.FORWARD_TO_DIRECTOR;
        let updatePayload = { id: decodedId };

        if (isQuorum) {
          let approvedUserIds = item.eisApprovedByIds ? safeParse(item.eisApprovedByIds) : [];

          if (approvedUserIds.includes(loggedInUserId)) {
            return setServerResponse({ status: "ERROR", message: "আপনি ইতিমধ্যে অনুমোদন করেছেন!" });
          }

          approvedUserIds.push(loggedInUserId);
          const majorityApproved = approvedUserIds.length / totalApprovers >= 0.5;
          console.log({majorityApproved})

          targetStatus = majorityApproved ? WORKFORCE_STATUS.APPROVED_BY_DG : WORKFORCE_STATUS.FORWARD_TO_COMIITEE;

          updatePayload.eisApprovedByIds = JSON.stringify(approvedUserIds);

          if (!majorityApproved) {
            allMajorityApproved = false;
          }
        }

        updatePayload.status = targetStatus;
        await dispatch(updateApplication(updatePayload, "update workforce application"));
        await dispatch(updateApplicationSummary({ id: summary_Id, status: WORKFORCE_STATUS.APPROVED_BY_DG }, "update workforce application summary"));
      }

      if (!isQuorum || allMajorityApproved) {
        await dispatch(updateApplication(updatePayload, "update workforce application"));
        await dispatch(updateApplicationSummary({ id: summary_Id, status: WORKFORCE_STATUS.FORWARD_TO_DIRECTOR }, "update workforce application summary"));
      }

      setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
    } catch (error) {
      setServerResponse({ status: "ERROR", message: "সাবমিশন ব্যর্থ হয়েছে!" });
    } finally {
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1500);
    }
  };

  const fetchApplicationMovement = async () => {
    try {
      const mappingsData = await dispatch(fetchWorkforceCommitteeUserMap({ userIds: userIds || [`${loggedInUserId}`] }));
      setMappings(mappingsData?.payload?.data?.workforceCommitteeUserMaps || []);
      const response = await dispatch(fetchApplicationWiseMovementList(modulesManager, { applicationId: applications?.[0]?.id }));
      console.log("movement response", response);
      const movementsData = parseData(response?.payload?.data?.workforceApplicationMovement) || [];
      const senderObjects = movementsData
        .filter((m) => m.applicationFrom !== null)
        .map((m) => m.applicationFrom)
        .filter(
          (m) => m.userRoles?.[0]?.role?.name === "Doctor" || m.userRoles?.[0]?.role?.name === "Blwf Doctor" || m.userRoles?.[0]?.role?.name === "Eis Doctor",
        );
      console.log("movement senderData", senderObjects);

      const clean = (html) => html?.replace(/<\/?[^>]+(>|$)/g, "") || "";

      // Clone and find the last revert note
      const lastRevert = [...movementsData].reverse().find((m) => m.revertNote);

      if (lastRevert) {
        lastRevert.revertNote = clean(lastRevert.revertNote);
      }

      // Update State
      setMovements(movementsData);
      setLastRevertMovement(lastRevert);
      setRevertNotes(lastRevert ? [lastRevert.revertNote] : []);
    } catch (error) {
      console.error("Failed to load revert notes", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchApplicationMovement();
    }
  }, [open]);

  const fetchApplicationEmployeeDependent = async () => {
    const applicationId = safeDecodeId(applications?.[0]?.id);

    try {
      const response = await dispatch(fetchWorkforceEmployeeDependent(modulesManager, [`workforceApplication_Id: "${applicationId}"`]));
      const dependentData = parseData(response?.payload?.data?.workforceEmployeeDependent) || [];
      console.log("dependentData", dependentData);
      setDependentData(dependentData);
    } catch (error) {
      console.error("Failed to load dependent data", error);
    }
  };
  useEffect(() => {
    if (open) {
      fetchApplicationEmployeeDependent();
    }
  }, [open]);

  const loadImageAsBuffer = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
      return await response.arrayBuffer();
    } catch (error) {
      console.error("Error loading image:", error);
      return null;
    }
  };

  const exportToExcel = async () => {
    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Applications", {
        properties: { defaultColWidth: 15 },
      });

      // Load logos as buffers

      let logo = `/workforce_assets/centralfund.png`;
      let organization = "কেন্দ্রীয় তহবিল";
      let address = "২১ তলা, ভবন#৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০";
      let web = "www.centralfund.gov.bd";
      if (
        getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ||
        getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DIRECTOR ||
        getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_APPROVER ||
        getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR
      ) // if(getUserTypeFromRights(userRights).includes("blwf"))
      {
        logo = `/workforce_assets/blwf.png`;
        organization = "বাংলাদেশ শ্রমিক কল্যাণ ফাউন্ডেশন";
        address = "১৮ তলা, ভবন#৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০";
        web = "www.blwf.gov.bd";
      }
      // else if(getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_SECTION_ADMIN)
      // {
      //   logo= `workforce_assets/eis.png`;
      // }
      const renderLogo = await loadImageAsBuffer("/front" + logo);
      const bdGovLogo = await loadImageAsBuffer("/front/workforce_assets/bdgov.png");

      // Add logos to workbook
      if (renderLogo) {
        const imageId1 = workbook.addImage({
          buffer: renderLogo,
          extension: "png",
        });
        worksheet.addImage(imageId1, {
          tl: { col: 0, row: 0 },
          ext: { width: 120, height: 120 },
        });
      } else {
        worksheet.getCell("A1").value = "[Organization Logo]";
      }

      if (bdGovLogo) {
        const imageId2 = workbook.addImage({
          buffer: bdGovLogo,
          extension: "png",
        });
        worksheet.addImage(imageId2, {
          tl: { col: 7, row: 0 },
          ext: { width: 120, height: 120 },
        });
      } else {
        worksheet.getCell("I1").value = "[BD Government Logo]";
      }

      // Header information
      worksheet.mergeCells("D1:F1");
      worksheet.getCell("D1").value = "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার";
      worksheet.getCell("D1").alignment = { horizontal: "center" };
      worksheet.getCell("D1").font = { bold: true, size: 14 };

      worksheet.mergeCells("D2:F2");
      worksheet.getCell("D2").value = "শ্রম ও কর্মসংস্থান মন্ত্রণালয়";
      worksheet.getCell("D2").alignment = { horizontal: "center" };

      worksheet.mergeCells("D3:F3");
      worksheet.getCell("D3").value = organization;
      worksheet.getCell("D3").alignment = { horizontal: "center" };

      worksheet.mergeCells("D4:F4");
      worksheet.getCell("D4").value = address;
      worksheet.getCell("D4").alignment = { horizontal: "center" };

      worksheet.mergeCells("D5:F5");
      worksheet.getCell("D5").value = web;
      worksheet.getCell("D5").alignment = { horizontal: "center" };

      worksheet.mergeCells("A6:I6");
      worksheet.getCell("A6").value = "মৃত্যু ও দূর্ঘটনাজনিত আর্থিক সহায়তা তালিকা";
      worksheet.getCell("A6").alignment = { horizontal: "center" };
      worksheet.getCell("A6").font = { underline: true };

      worksheet.mergeCells("A7:I7");
      worksheet.getCell("A7").value = "সুবিধাভোগী কল্যাণ হিসাব (নং ৪৪২৬৩৩৬০০১০৩৪)";
      worksheet.getCell("A7").alignment = { horizontal: "center" };
      worksheet.getCell("A7").font = { underline: true };

      worksheet.getCell("A8").value = "বোর্ড সভাঃ";
      worksheet.getCell("A9").value = `আবেদনের সংখ্যাঃ ${enToBn(applications.length)}`;
      worksheet.getCell("A10").value = "নমিনী/ব্যাংক হিসাবের সংখ্যাঃ";
      worksheet.getCell("A11").value = `অর্থের পরিমাণঃ ${Number(getTotalAmount()).toLocaleString("bn-BD")}/-`;

      // Add a blank row
      worksheet.getRow(12).height = 15;

      // Table headers

      if (applications[0]?.applicationType === "financialAssistance") {
        /* ================= FINANCIAL ASSISTANCE ================= */

        const headers = [
          "SL No",
          "Date",
          "Sender A/C No",
          "Receiver's Routing Number",
          "Sender's Routing Number",
          "Dependent Account Name",
          "Dependent Account No",
          "Type(C/D)",
          "Approved Amount",
        ];
        worksheet.addRow(headers);
        worksheet.getRow(13).font = { bold: true };
        worksheet.getRow(13).alignment = { horizontal: "center" };

        dependentData.forEach((dep, index) => {
          const totalGrant = getTotalAmount() || 200000;
          const approvedAmount = ((parseFloat(dep.percentageOfCfGrant) || 0) / 100) * totalGrant;

          worksheet.addRow([
            index + 1,
            dep?.dateCreated?.split("T")[0] || "",
            "4426336001034",
            dep?.bank?.routingNumber || "",
            "200275714",
            dep?.bankAccountHolderName || "",
            dep?.bankAccountNo || "",
            "",
            approvedAmount,
          ]);
        });
      } else {
        /* ================= OTHER APPLICATION TYPE ================= */

        const headers = [
          "SL No",
          "Date",
          "Sender A/C No",
          "Receiver's Routing Number",
          "Sender's Routing Number",
          "Customer Account Name",
          "Customer Account No",
          "Type(C/D)",
          "Approved Amount",
        ];
        worksheet.addRow(headers);
        worksheet.getRow(13).font = { bold: true };
        worksheet.getRow(13).alignment = { horizontal: "center" };

        applications
          .filter((item) => item.status === status)
          .forEach((row, index) => {
            let bankInfo = {};
            const approvedAmount = row?.grantAmount || 0;
            
            try {
              bankInfo = JSON.parse(JSON.parse(row.employeeBankInfo))[0];
            } catch (e) {
              console.error("Failed to parse bankInfo for row", index, e);
            }

            worksheet.addRow([
              index + 1,
              row?.dateCreated?.split("T")[0] || "",
              "4426336001034",
              bankInfo?.branch?.routingNumber || "",
              "200275714",
              row?.workforceEmployee?.firstNameBn || "",
              bankInfo?.accountNumber || "",
              "",
              approvedAmount,
            ]);
          });
      }

      // Total amount row
      worksheet.addRow(["", "", "", "", "", "Total Amount", "", "", getTotalAmount() || 0]);
      worksheet.getRow(worksheet.rowCount).font = { bold: true };
      worksheet.getCell(`I${worksheet.rowCount}`).alignment = { horizontal: "right" };

      // Set column widths
      worksheet.columns = [
        { width: 10 }, // SL No
        { width: 15 }, // Date
        { width: 15 }, // Sender A/C No
        { width: 20 }, // Receiver's Routing Number
        { width: 20 }, // Sender's Routing Number
        { width: 25 }, // Customer Account Name
        { width: 20 }, // Customer Account No
        { width: 10 }, // Type(C/D)
        { width: 15 }, // Approved Amount
      ];

      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "Applications.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data to Excel. Please try again.");
    }
  };
  console.log({ mappingsData: mappings });

  if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_APPROVER) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6">
            <FormattedMessage module="workforce" id="workforce.application.modal.header" />
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {applications[0]?.applicationType === "financialAssistance" ? (
            /* ===== NEW BLOCK FOR FINANCIAL ASSISTANCE ===== */
            <div>
              <Typography variant="h6">Death grant</Typography>

              {/* OLD BLOCK INSIDE NEW BLOCK */}
              <Table>
                <TableHead>
                  <TableRow style={{ fontWeight: "bold" }}>
                    <TableCell>Dependent Name</TableCell>
                    <TableCell>Relation With Worker</TableCell>
                    <TableCell>Application Type</TableCell>
                    <TableCell align="right">Grant Amount</TableCell>
                    <TableCell>Account No</TableCell>
                    <TableCell>Bank Name</TableCell>
                    <TableCell>Branch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dependentData.map((dep, index) => {
                    const totalGrant = getTotalAmount();
                    const approvedAmount = ((parseFloat(dep.percentageOfCfGrant) || 0) / 100) * totalGrant;

                    return (
                      <TableRow key={index}>
                        <TableCell>{dep?.nameEn || ""}</TableCell>
                        <TableCell>{RELATION_LABEL_MAP[dep?.relationWithWorker || ""]}</TableCell>
                        <TableCell>Death grant</TableCell>
                        <TableCell align="right">{approvedAmount}</TableCell>
                        <TableCell>{dep?.bankAccountNo || ""}</TableCell>
                        <TableCell>{dep?.bank?.parent?.nameEn || ""}</TableCell>
                        <TableCell>{dep?.bank?.nameEn || ""}</TableCell>
                      </TableRow>
                    );
                  })}

                  <TableRow>
                    <TableCell colSpan={2}>
                      <strong>Total Grant</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{getTotalAmount()}</strong>
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            /* ===== OLD BLOCK ===== */
            <Table>
              <TableHead>
                <TableRow style={{ fontWeight: "bold" }}>
                  <TableCell>Applicant Name</TableCell>
                  <TableCell>Application Type</TableCell>
                  <TableCell align="right">Grant Amount</TableCell>
                  <TableCell>Account No</TableCell>
                  <TableCell>Bank Name</TableCell>
                  <TableCell>Branch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications
                  .filter((item) => item.status === status)
                  .map((row, index) => {
                    const parseBankInfo = JSON.parse(row.employeeBankInfo);
                    const bankInfo = JSON.parse(parseBankInfo);
                    return (
                      <TableRow key={index}>
                        <TableCell>{row.workforceEmployee?.firstNameEn}</TableCell>
                        <TableCell>{row.applicationType}</TableCell>
                        <TableCell align="right">{row.grantAmount}</TableCell>
                        <TableCell>{bankInfo.accountNumber}</TableCell>
                        <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                        <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
                      </TableRow>
                    );
                  })}

                <TableRow>
                  <TableCell colSpan={2}>
                    <strong>Total Grant</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{getTotalAmount()}</strong>
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <Divider />
        <DialogActions className={classes.noPrint}>
          <Button onClick={onClose} variant="outlined" color="primary">
            <FormattedMessage id="workforce.table.close" defaultMessage="বন্ধ করুন" />
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary">
            <FormattedMessage id="workforce.table.printSUmmary" defaultMessage="মুদ্রণের সারাংশ" />
          </Button>
          <Button onClick={() => handleForward()} variant="contained" color="primary">
            <FormattedMessage id="workforce.table.forwardToDirector" defaultMessage="মহাপরিচালক বরাবর অগ্রায়ন করুন" />
            <ForwardIcon />
          </Button>
        </DialogActions>
      </Dialog>
    );
  } else if (
    getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ADMIN ||
    getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SECTION_ADMIN ||
    getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ||
    getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ||
    getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_COORDINATOR ||
    getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_ADVISOR
  ) // else if (!getUserTypeFromRights(userRights).includes("blwf"))
  {
    let logo = <img src={`workforce_assets/centralfund.png`} alt="Logo" style={{ width: "120px" }} />;
    let organization = "কেন্দ্রীয় তহবিল";
    let address = "২১ তলা, ভবন#৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০";
    let web = "www.centralfund.gov.bd";
    // if(getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN)
    if (
      getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ||
      getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DIRECTOR ||
      getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_APPROVER ||
      getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR
    ) {
      logo = <img src={`workforce_assets/blwf.png`} alt="Logo" style={{ width: "120px" }} />;
      organization = "বাংলাদেশ শ্রমিক কল্যাণ ফাউন্ডেশন";
      address = "১৮ তলা, ভবন#৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০";
      web = "www.blwf.gov.bd";
    }
    // else if(getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.EIS_SECTION_ADMIN)
    // {
    //   logo= <img src={`workforce_assets/eis.png`} alt="Logo" style={{ width: "120px" }} />;
    // }
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6">
            {" "}
            <FormattedMessage id="Bank Payment Advice (BFTN)" />
          </Typography>
        </DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          {/* <Table>
            <TableHead style={{ fontWeight: "bold" }}>
              <TableRow>
                <TableCell colSpan={2} style={{ textAlign: "left" }}>
                  {logo}
                </TableCell>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  <h3 style={{ margin: 0 }}>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
                  <p style={{ margin: 0 }}>শ্রম ও কর্মসংস্থান মন্ত্রণালয়</p>
                  <p style={{ margin: 0 }}>{organization}</p>
                  <p style={{ margin: 0 }}>{address}</p>
                  <p style={{ margin: 0 }}>{web}</p>
                </TableCell>
                <TableCell colSpan={2} style={{ textAlign: "right" }}>
                  <img src={`workforce_assets/bdgov.png`} alt="Logo" style={{ width: "120px" }} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={9} style={{ textAlign: "center" }}>
                  <p style={{ textDecoration: "underline", margin: 0 }}>মৃত্যু ও দূর্ঘটনাজনিত আর্থিক সহায়তা তালিকা </p>
                  <p style={{ textDecoration: "underline", margin: 0 }}>সুবিধাভোগী কল্যাণ হিসাব (নং ৪৪২৬৩৩৬০০১০৩৪)</p>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={9} style={{ textAlign: "left" }}>
                  <p style={{ margin: 0 }}>বোর্ড সভাঃ</p>
                  <p style={{ margin: 0 }}>আবেদনের সংখ্যাঃ {enToBn(applications.length)}</p>
                  <p style={{ margin: 0 }}>নমিনী/ব্যাংক হিসাবের সংখ্যাঃ </p>
                  <p style={{ margin: 0 }}>অর্থের পরিমাণঃ {Number(getTotalAmount()).toLocaleString("bn-BD")}/-</p>
                </TableCell>
              </TableRow>
            </TableHead>
            {applications[0]?.applicationType === "financialAssistance" ? (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="SL No" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Date" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Sender A/C No" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Receiver's Routing Number " />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Sender's Routing Number " />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Dependent Account Name" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Dependent Account No" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Type(C/D)" />
                    </TableCell>
                    <TableCell style={{ textAlign: "right", fontWeight: "700" }}>
                      <FormattedMessage id="Approved Amount" />
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dependentData.map((dep, index) => {
                    const totalGrant = getTotalAmount() || 200000;
                    const approvedAmount = ((parseFloat(dep.percentageOfCfGrant) || 0) / 100) * totalGrant;

                    return (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{dep?.dateCreated?.split("T")[0]}</TableCell>
                        <TableCell>4426336001034</TableCell>
                        <TableCell>{dep?.bank?.routingNumber}</TableCell>
                        <TableCell>200275714</TableCell>
                        <TableCell>{dep?.bankAccountHolderName || ""}</TableCell>
                        <TableCell>{dep?.bankAccountNo || ""}</TableCell>
                        <TableCell></TableCell>
                        <TableCell align="right">{approvedAmount}</TableCell>
                      </TableRow>
                    );
                  })}

                  <TableRow>
                    <TableCell colSpan={8}>
                      <strong>
                        <FormattedMessage id="Total Amount" />
                      </strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{getTotalAmount()}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </>
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="SL No" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Date" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Sender A/C No" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Receiver's Routing Number " />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Sender's Routing Number " />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Customer Account Name" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Customer Account No" />
                    </TableCell>
                    <TableCell style={{ fontWeight: "700" }}>
                      <FormattedMessage id="Type(C/D)" />
                    </TableCell>
                    <TableCell style={{ textAlign: "right", fontWeight: "700" }}>
                      <FormattedMessage id="Approved Amount" />
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {applications
                    .filter((item) => item.status === status)
                    .flatMap((row) => {
                      let bankInfos = [];
                      try {
                        const parsed = JSON.parse(row.employeeBankInfo);
                        bankInfos = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
                      } catch (e) {
                        console.error("Bank info parse error", e);
                        return [];
                      }

                      return bankInfos.map((bankInfo, bankIndex) => (
                        <TableRow key={`${row.id}-${bankIndex}`}>
                          <TableCell>{bankIndex + 1}</TableCell>
                          <TableCell>{row?.dateCreated?.split("T")[0]}</TableCell>
                          <TableCell>4426336001034</TableCell>
                          <TableCell>{bankInfo?.branch?.routingNumber}</TableCell>
                          <TableCell>200275714</TableCell>
                          <TableCell>{bankInfo?.accountHolderName}</TableCell>
                          <TableCell>{bankInfo?.accountNumber}</TableCell>
                          <TableCell></TableCell>
                          <TableCell align="right">{row?.grantAmount}</TableCell>
                        </TableRow>
                      ));
                    })}

                  <TableRow>
                    <TableCell colSpan={8}>
                      <strong>
                        <FormattedMessage id="Total Amount" />
                      </strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{getTotalAmount()}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </>
            )}
          </Table> */}
          <FormattedBankPaymentAdvice 
             applications={applications}
             dependentData={dependentData}
             getTotalAmount={getTotalAmount}
             userRights={userRights}
             status={status}
             movements={movements}
          />
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
  } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DIRECTOR || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.BLWF_DIRECTOR) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6">
            {" "}
            <FormattedMessage id="workforce.table.bftn" />
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {applications[0]?.applicationType === "financialAssistance" ? (
            /* ===== NEW BLOCK FOR FINANCIAL ASSISTANCE ===== */
            <div>
              <Typography variant="h6">Death grant</Typography>

              {/* OLD BLOCK INSIDE NEW BLOCK */}
              <Table>
                <TableHead>
                  <TableRow style={{ fontWeight: "bold" }}>
                    <TableCell>Dependent Name</TableCell>
                    <TableCell>Relation With Worker</TableCell>
                    <TableCell>Application Type</TableCell>
                    <TableCell align="right">Grant Amount</TableCell>
                    <TableCell>Account No</TableCell>
                    <TableCell>Bank Name</TableCell>
                    <TableCell>Branch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dependentData.map((dep, index) => {
                    const totalGrant = getTotalAmount() || 200000;
                    const approvedAmount = ((parseFloat(dep.percentageOfCfGrant) || 0) / 100) * totalGrant;

                    return (
                      <TableRow key={index}>
                        <TableCell>{dep?.nameEn || ""}</TableCell>
                        <TableCell>{RELATION_LABEL_MAP[dep?.relationWithWorker || ""]}</TableCell>
                        <TableCell>Death grant</TableCell>
                        <TableCell align="right">{approvedAmount}</TableCell>
                        <TableCell>{dep?.bankAccountNo || ""}</TableCell>
                        <TableCell>{dep?.bank?.parent?.nameEn || ""}</TableCell>
                        <TableCell>{dep?.bank?.nameEn || ""}</TableCell>
                      </TableRow>
                    );
                  })}

                  <TableRow>
                    <TableCell colSpan={2}>
                      <strong>Total Grant</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{getTotalAmount()}</strong>
                    </TableCell>
                    <TableCell colSpan={3} />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            /* ===== OLD BLOCK ===== */
            <Table>
              <TableHead>
                <TableRow style={{ fontWeight: "bold" }}>
                  <TableCell>Applicant Name</TableCell>
                  <TableCell>Application Type</TableCell>
                  <TableCell align="right">Grant Amount</TableCell>
                  <TableCell>Account No</TableCell>
                  <TableCell>Bank Name</TableCell>
                  <TableCell>Branch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications
                  .filter((item) => item.status === status)
                  .map((row, index) => {
                    const parseBankInfo = JSON.parse(row.employeeBankInfo);
                    const bankInfo = JSON.parse(parseBankInfo);
                    return (
                      <TableRow key={index}>
                        <TableCell>{row.workforceEmployee?.firstNameEn}</TableCell>
                        <TableCell>{row.applicationType}</TableCell>
                        <TableCell align="right">{row.grantAmount}</TableCell>
                        <TableCell>{bankInfo.accountNumber}</TableCell>
                        <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                        <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
                      </TableRow>
                    );
                  })}

                <TableRow>
                  <TableCell colSpan={2}>
                    <strong>Total Grant</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{getTotalAmount()}</strong>
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <Divider />
        <DialogActions className={classes.noPrint}>
          <Button onClick={onClose} variant="outlined" color="primary">
            <FormattedMessage id="workforce.table.close" defaultMessage="বন্ধ করুন" />
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary">
            <FormattedMessage id="workforce.table.printAdvice" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

export default GenerateBFTN;
