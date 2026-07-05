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

import React, { useState, useEffect, useRef } from "react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  FormattedMessage,
  useModulesManager,
  parseData
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import {
  createWorkforceEisBankAdvice,
  fetchWorkforceEisPaymentDisbursementStage,
  fetchCommitteeBankAdviceMap,
  fetchWorkforceOtherCompensation,
  fetchWorkforceNoaSignatureByApprovers,
  fetchWorkforceNoaSignerUserByApprovers
} from '../../../actions';
import { useDispatch, useSelector } from "react-redux";
import { calculateAge, getFooterContentNew, safeDecodeId, safeParse, toBanglaNumber } from '../../../utils/utils';
import {
  generateBankAdviceTemplate,
  generateBankAdviceContent
} from '../../../utils/bankAdviceContent';
import { RELATION_LABEL_BANGLA_MAP } from '../../../constants';

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
    padding: theme.spacing(2),

    "@media print": {
      padding: "0 !important",
      overflow: "visible !important",
    },
  },

  "@global": {
    ".noa-page": {
      width: "100%",
      fontFamily: "Arial, Helvetica, sans-serif",
      color: "#000",
      fontSize: "12px",
      position: "relative",
      background: "#fff",
    },

    ".noa-header": {
      textAlign: "center",
      marginBottom: "10px",
      position: "relative",
    },

    ".noa-header h3": {
      margin: "4px 0",
      fontSize: "18px",
      fontWeight: 700,
    },

    ".noa-header h4": {
      margin: "8px 0",
      fontSize: "15px",
      fontWeight: 700,
    },

    ".noa-body": {
      marginTop: "10px",
    },

    ".noa-table": {
      width: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed",
      border: "1px solid #000",
      fontSize: "12px",
    },

    ".noa-table tbody tr": {
      pageBreakInside: "avoid",
    },

    ".noa-table td": {
      border: "1px solid #000",
      padding: "3px 6px",
      verticalAlign: "middle",
      lineHeight: "1.25",
      wordBreak: "break-word",
    },

    ".noa-label": {
      width: "50%",
      fontWeight: 600,
      textAlign: "left",
    },

    ".noa-value": {
      width: "50%",
      textAlign: "left",
    },

    ".noa-section": {
      textAlign: "center",
      fontWeight: "bold",
      backgroundColor: "#f5f5f5",
      fontSize: "12px",
      padding: "5px",
    },

    ".noa-additional-info": {
      marginTop: "12px",
      fontSize: "12px",
      lineHeight: "1.5",
    },

    ".noa-additional-info ol": {
      marginTop: "5px",
      paddingLeft: "20px",
    },

    ".noa-additional-info li": {
      marginBottom: "4px",
    },

    ".noa-footer": {
      marginTop: "35px",
      textAlign: "right",
    },

    ".noa-signature": {
      display: "inline-block",
      minWidth: "250px",
      textAlign: "center",
    },

    ".noa-signature img": {
      maxHeight: "70px",
      marginBottom: "4px",
    },

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

      ".noa-page": {
        width: "100%",
        margin: 0,
        padding: 0,
      },

      ".noa-table": {
        width: "100%",
        borderCollapse: "collapse",
      },

      ".noa-table td": {
        border: "1px solid #000 !important",
        padding: "3px 6px !important",
      }
    }
  }
}));

const GenerateNoaView = ({ open, onClose, onSuccess, row }) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const [eisPayments, setEisPayments] = useState([]);
  const [topHtml, setTopHtml] = useState("");
  const [bottomHtml, setBottomHtml] = useState("");
  const [rawTemplate, setRawTemplate] = useState("");
  const [otherCompAmount, setOtherCompAmount] = useState(0);
  const [noaSignerInfo, setNoaSignerInfo] = useState({ noaSigner: null, noaSignature: null });
  const [noaSignature, setNoaSignature]= useState(null);
  const [noaSigner, setNoaSigner]= useState(null);
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || "en";

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

  const getRoleInCommitteeLabel = (role="Member", locale) => {
    switch (role) {
      case "Member":
        return locale === "fr" ? "সদস্য" : "Member";
      case "Member Secretary":
        return locale === "fr" ? "সদস্য সচিব" : "Member Secretary";
      case "Chairman":
        return locale === "fr" ? "চেয়ারম্যান" : "Chairman";
      default:
        return role;
    }
  };

  const employeePresentAddress = formatAddress(
    row?.workforceApplication?.workforceEmployee?.presentLocation,
    row?.workforceEmployee?.presentAddress
  );

  const depentPresentAddress = formatAddress(
    row?.workforceEmployeeDependent?.[0]?.presentLocation,
    row?.workforceEmployeeDependent?.[0]?.presentAddress
  );

  useEffect(async() => {
    if (row?.workforceApplicationId) {
      dispatch(fetchWorkforceOtherCompensation(modulesManager, [`workforceApplicationId: "${safeDecodeId(row?.workforceApplicationId)}"`])).then((res) => {
        const fetchOtherCompensation = parseData(res?.payload?.data?.workforceOtherCompensationInfo);
        let amount = 0;
        fetchOtherCompensation.forEach(element => {
          amount += Number(element?.amount ?? 0)
        });
        setOtherCompAmount(amount);
      });
    }
    console.log("Working Row", row);
    const eisApprovedByIds = safeParse(row?.workforceApplication?.eisApprovedByIds) || [];
    console.log(eisApprovedByIds, "eisApprovedByIds");
    if (eisApprovedByIds.length > 0) {
      const [signatureResult, signerResult] = await Promise.all([
        dispatch(fetchWorkforceNoaSignatureByApprovers(eisApprovedByIds)),
        dispatch(fetchWorkforceNoaSignerUserByApprovers(eisApprovedByIds)),
      ]);

      setNoaSignature(signatureResult.payload?.data?.fetchNoaSignatureByApprovers || null);
      setNoaSigner(signerResult.payload?.data?.fetchWorkforceNoaSignerUserByApprovers || null);

    } else {
      setNoaSignature(null);
      setNoaSigner(null);
    }
  }, [open, dispatch, modulesManager]);

  const handleDialogPrint = () => {
    window.print();
  };





  const cfAndEisAmount = (parseFloat(row?.eisMonthlyAmount) || 0) + (parseFloat(otherCompAmount) || 0);

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

  const deceasedEmployeePresentAddress = formatAddress(
    deceasedWorkerInfo?.presentLocation,
    deceasedWorkerInfo?.presentAddress
  );


  let noaSignatureLogo = <img src={window.location.origin + (noaSignature?.url ?? "")} alt="Central Fund Logo" style={{ height: "70px" }} />;

  if(!row || row==null || row=='undefined')
    return (<></>);
  else
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
            <FormattedMessage id="EIS Notice of Award Certificate for Beneficary" />
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>

          {topHtml ? (
            <div dangerouslySetInnerHTML={{ __html: topHtml }} />
          ) : (
            <>
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
                    <colgroup>
                      <col style={{ width: "50%" }} />
                      <col style={{ width: "50%" }} />
                    </colgroup>
                    <tbody>
                      {/* Section 1 */}
                      <tr>
                        <td colSpan={2} className="noa-section">
                          {applicationType === "financialAssistance" ? "মৃত" : "অক্ষম"} শ্রমিকের তথ্য:
                        </td>
                      </tr>

                      <tr>
                        <td className="noa-label">শ্রমিকের নাম:</td>
                        {
                          row?.workforceApplication?.applicationType === "financialAssistance" ? (
                            <td className="noa-value">{deceasedWorkerInfo?.nameBn || ""}</td>
                          ):
                          (
                            <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.firstNameBn || ""}</td>
                          )
                        }
                      </tr>

                      <tr>
                        <td className="noa-label">শ্রমিকের জাতীয় পরিচয়পত্র নম্বর:</td>
                        {
                          row?.workforceApplication?.applicationType === "financialAssistance" ? (
                            <td className="noa-value">{deceasedWorkerInfo?.nid ? toBanglaNumber(deceasedWorkerInfo?.nid) : ""}</td>
                          ) : (
                            <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.nid ? toBanglaNumber(row?.workforceApplication?.workforceEmployee?.nid) : ""}</td>
                          )
                        }
                      </tr>
                      {applicationType === "disabilityAssistance" && (
                        <>
                          <tr>
                            <td className="noa-label">শ্রমিকের জন্ম তারিখ:</td>
                            {
                              row?.workforceApplication?.applicationType === "financialAssistance" ? (
                                <td className="noa-value">{deceasedWorkerInfo?.birthDate ? new Date(deceasedWorkerInfo?.birthDate).toLocaleDateString("bn-BD") : ""}</td>
                              ):(
                                <td className="noa-value">{row?.workforceApplication?.workforceEmployee?.birthDate ? new Date(row?.workforceApplication?.workforceEmployee?.birthDate).toLocaleDateString("bn-BD") : ""}</td>
                              )
                            }
                          </tr>
                        </>
                      )}

                      <tr>
                        <td className="noa-label">ঠিকানা:</td>
                        {
                          row?.workforceApplication?.applicationType === "financialAssistance" ? (
                            <td className="noa-value">
                              <b>গ্রামঃ</b> {deceasedEmployeePresentAddress?.village || ""}, <b>ডাকঘরঃ</b> {deceasedEmployeePresentAddress?.postOffice || ""} , <br />
                              <b>উপজেলা/থানাঃ</b> {deceasedEmployeePresentAddress?.thana || ""}, <b>জেলাঃ</b>  {deceasedEmployeePresentAddress?.district || ""}
                            </td>
                          ):(
                            <td className="noa-value">
                              <b>গ্রামঃ</b> {employeePresentAddress?.village || ""}, <b>ডাকঘরঃ</b> {employeePresentAddress?.postOffice || ""} , <br />
                              <b>উপজেলা/থানাঃ</b> {employeePresentAddress?.thana || ""}, <b>জেলাঃ</b>  {employeePresentAddress?.district || ""}
                            </td>
                          )
                        }
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
                            <td className="noa-value">  {otherCompAmount ? Number(otherCompAmount).toLocaleString("bn-BD", {
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
                            calculateAge(row?.workforceEmployeeDependent?.[0]?.birthDate) < 18 ?
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
                            <td className="noa-value">{otherCompAmount ? Number(otherCompAmount).toLocaleString("bn-BD", {
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
                    <p style={{ margin: "2px 0" }}>{getRoleInCommitteeLabel(noaSigner?.roleInCommittee || "Member", locale)}, {locale === "fr" ? noaSigner?.committee?.nameBn : noaSigner?.committee?.nameEn}</p>

                    {/* <p style={{ margin: "2px 0" }}>মহাপরিচালক</p>
                        <p style={{ margin: "2px 0" }}>কেন্দ্রীয় তহবিল</p>
                        <p style={{ margin: "2px 0" }}>ও</p>
                        <p style={{ margin: "2px 0" }}>সদস্য সচিব-ইআইএস গভর্নেন্স বোর্ড</p> */}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>

        <Divider className={classes.noPrint} />

        <DialogActions className={classes.noPrint}>
          <Button onClick={onClose} variant="outlined" color="primary">
            <FormattedMessage id="workforce.modal.close" />
          </Button>
          <Button onClick={handleDialogPrint} variant="contained" color="primary">
            <FormattedMessage id="workforce.modal.print.noa" />
          </Button>
        </DialogActions>
      </Dialog>
    );
};

export default GenerateNoaView;