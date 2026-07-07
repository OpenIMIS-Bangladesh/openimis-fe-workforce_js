import React from "react";
import { decodeId } from "@openimis/fe-core";
import { RELATION_LABEL_MAP } from "../../../constants";
import { safeParse, isBlwfPath, formatAddress } from "../../../utils/utils";

const getIncidentDetails = (rawInfo) => {
  let type = "ND";
  let date = "";
  try {
    const parsed = typeof rawInfo === "string" ? JSON.parse(rawInfo) : rawInfo;
    const info = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    date = info?.accidentDate || info?.dateOfDeath || "";

    if (info?.accidentMainType === "workforce.accident.mainType.workplace") type = "WAD";
    else if (info?.accidentMainType === "workforce.accident.mainType.onDutyRTA") type = "OAD";
    else if (info?.accidentMainType === "workforce.accident.mainType.commuting") type = "OAD";
  } catch (e) {}
  return { type, date };
};

const DeathDisabilityView = ({ classes, applications, dependentData, getTotalAmount }) => {
  const isFinancialAssistance = applications[0]?.applicationType === "financialAssistance";
  const stats = { ND: 0, OAD: 0, WAD: 0, WOD: 0, WPD: 0, WTD: 0, OTD: 0, Total: applications.length };

  applications.forEach((app) => {
    const { type } = getIncidentDetails(app.employeeAccidentInfo);
    if (stats[type] !== undefined) stats[type] += 1;
    else stats.ND += 1;
  });

  const getRows = () => {
    let rows = [];
    if (isFinancialAssistance) {
      dependentData.forEach((dep, index) => {
        const app = applications.find((a) => decodeId(a.id) === dep.workforceApplicationId) || applications[0];
        const { type, date } = getIncidentDetails(app?.employeeAccidentInfo);
        const metadata = safeParse(app?.metadata);
        const parsedAddress = safeParse(app?.workforceEmployee?.presentAddress) || {};
        const approvedAmount = ((parseFloat(dep.percentageOfCfGrant) || 0) / 100) * (getTotalAmount() || 200000);
        const deceasedWorkerInfo= safeParse(app?.deceasedWorkerInfo) || {};

        rows.push({
          sl: index + 1,
          mainListNo: app?.trackingNumber || "",
          workerName: deceasedWorkerInfo?.nameBn || deceasedWorkerInfo?.nameEn || "",
          fatherName: deceasedWorkerInfo?.fatherNameBn || deceasedWorkerInfo?.fatherNameEn || "",
          factoryName: app?.employeeFactory?.nameBn || app?.employeeFactory?.nameEn || "",
          workerNid: deceasedWorkerInfo?.nid || "",
          workerMobile: deceasedWorkerInfo?.mobile || deceasedWorkerInfo?.phoneNumber || "",
          incidentDate: date || metadata?.deathDate,
          incidentType: type || metadata?.deathType,
          nomineeName: dep?.nameBn || dep?.nameEn || dep?.bankAccountHolderName || "",
          nomineeNid: dep?.nid || "",
          nomineeMobile: dep?.mobile || dep?.phoneNumber || "",
          relation: RELATION_LABEL_MAP[dep?.relationWithWorker] || dep?.relationWithWorker || "",
          details: `আবেদনকারী একজন শ্রমিক ছিলেন। তিনি ${date || metadata?.deathDate || ""} তারিখে মৃত্যুবরণ করেন।`,
          profession: app?.employeeFactory?.nameBn || "গৃহ শ্রমিক",
          remarks: "শ্রম অধিদপ্তর",
          bankName: dep?.bank?.parent?.nameEn || dep?.bank?.nameEn || "",
          bankAc: dep?.bankAccountNo || "",
          amount: approvedAmount,
          routingNo: dep?.bank?.routingNumber || "",
          mobile: dep?.phoneNumber || deceasedWorkerInfo?.phoneNumber || "",
          unitNo: app?.workforceEmployee?.phoneNumber || "",
        });
      });
    } else {
      applications.forEach((app, appIndex) => {
        let bankInfos = [];
        try {
          const parsed = JSON.parse(app.employeeBankInfo);
          bankInfos = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
        } catch (e) {}

        const { type, date } = getIncidentDetails(app.employeeAccidentInfo);
        const deceasedWorkerInfo = safeParse(app?.deceasedWorkerInfo) || {};
        const parsedAddress = safeParse(deceasedWorkerInfo?.presentAddress) || {};
        const formattedAddress = formatAddress(
          deceasedWorkerInfo?.presentLocation, // Make sure this matches your actual location key
          deceasedWorkerInfo?.presentAddress,
        );

        bankInfos.forEach((bankInfo, bankIndex) => {
          rows.push({
            sl: appIndex + 1 + bankIndex,
            mainListNo: app.id || "",
            workerName: deceasedWorkerInfo?.nameBn || deceasedWorkerInfo?.nameEn || "",
            fatherName: deceasedWorkerInfo?.fatherNameBn || deceasedWorkerInfo?.fatherNameEn || "",
            factoryName: app.employeeFactory?.nameBn || app.employeeFactory?.nameEn || "",
            workerNid: deceasedWorkerInfo?.nid || "",
            workerMobile: deceasedWorkerInfo?.phoneNumber || "",
            address: `গ্রাম-${formattedAddress.village || ""}\nডাক-${formattedAddress.postOffice || ""}\nউপজেলা-${formattedAddress.thana || ""}\nজেলা-${formattedAddress.district || ""}`,
            district: formattedAddress.district || "",
            incidentDate: date,
            incidentType: type,
            nomineeName: bankInfo?.accountHolderName || deceasedWorkerInfo?.nameBn || deceasedWorkerInfo?.nameEn || "",
            nomineeNid: bankInfo.dependentNid || "",
            nomineeMobile: app.workforceEmployee?.phoneNumber || deceasedWorkerInfo?.phoneNumber || "",
            relation: "নিজ",
            details: `আবেদনকারী নিজে একজন শ্রমিক। তিনি দুর্ঘটনার শিকার হয়েছেন।`,
            profession: app.employeeFactory?.nameBn || "গৃহ শ্রমিক",
            remarks: "শ্রম অধিদপ্তর",
            bankName: bankInfo?.bank?.nameEn || "",
            bankAc: bankInfo?.accountNumber || "",
            amount: app.grantAmount || "",
            routingNo: bankInfo?.branch?.routingNumber || "",
            mobile: app.workforceEmployee?.phoneNumber || deceasedWorkerInfo?.phoneNumber || "",
            unitNo: app?.workforceEmployee?.phoneNumber || "",
          });
        });
      });
    }
    return rows;
  };

  const rows = getRows();

  return (
    <>
      <table className={classes.summaryTable}>
        <tbody>
          <tr>
            <td style={{ width: "50%" }}>
              <strong>Board Meeting:</strong> 26th
              <br />
              <strong>Fiscal Year:</strong> 2025-2026
              <br />
              <strong>Number of Application:</strong> {stats.Total}
              <br />
              <strong>Number of Nominees/Accounts:</strong> {rows.length}
              <br />
              <strong>Total Amount:</strong> {Number(getTotalAmount()).toLocaleString("en-IN")}
              <br />
              <strong>In Words:</strong>
            </td>
            <td style={{ width: "50%", padding: 0 }}>
              <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Natural Death (ND)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.ND}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Outside Accidental Death (OAD)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.OAD}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Workplace Accidental Death (WAD)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.WAD}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Workplace Occupational Death (WOD)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.WOD}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Workplace Partial Disability (WPD)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.WPD}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Workplace Total Disability (WTD)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.WTD}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Outside Total Disability (OTD)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.OTD}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", fontWeight: "bold" }}>Total</td>
                    <td style={{ border: "none", borderLeft: "1px solid #000", fontWeight: "bold" }}>{stats.Total}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {isBlwfPath() ? (
        <table className={classes.excelTable}>
          <thead>
            <tr>
              <th>ক্রমিক নং</th>
              <th>আবেদনকারী শ্রমিকের নাম/পিতা/এনআইডি/মোবা-</th>
              <th>ঠিকানা</th>
              <th>যার জন্য আবেদন /যে আবেদন করেছেন নাম/এনআইডি/মোবা-</th>
              <th>বিবরণ</th>
              <th>অনুদান পরিমান</th>
              <th>পেশা/প্রতিষ্ঠান</th>
              <th>জেলা</th>
              <th>মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td>
                  {row.workerName}
                  <br />
                  পিতা-{row.fatherName}
                  <br />
                  এনআইডি-{row.workerNid}
                  <br />
                  মোবা-{row.workerMobile}
                </td>
                <td style={{ whiteSpace: "pre-line" }}>{row.address}</td>
                <td>
                  {row.nomineeName} ({row.relation})<br />
                  এনআইডি-{row.nomineeNid}
                  <br />
                  মোবা-{row.nomineeMobile}
                </td>
                <td>{row.details}</td>
                <td style={{ textAlign: "right" }}>{Number(row.amount).toLocaleString("en-IN")}</td>
                <td style={{ textAlign: "center" }}>{row.profession}</td>
                <td style={{ textAlign: "center" }}>{row.district}</td>
                <td>{row.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className={classes.excelTable}>
          <thead>
            <tr>
              <th>Sl</th>
              <th>Main List No</th>
              <th>Deceased Worker's Name</th>
              <th>Factory Name</th>
              <th>Deceased Worker's NID/BC</th>
              <th>Date of Incident</th>
              <th>Type of Incident</th>
              <th>Nominee's Name</th>
              <th>Nominee's NID/BC</th>
              <th>Relation</th>
              <th>Nominee's Bank name</th>
              <th>Nominee's Bank A/C</th>
              <th>Amount</th>
              <th>Routing No</th>
              <th>Nominee's Mobile No.</th>
              <th>Unit/No</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{row.sl}</td>
                <td style={{ textAlign: "center" }}>{row.mainListNo}</td>
                <td>{row.workerName}</td>
                <td>{row.factoryName}</td>
                <td>{row.workerNid}</td>
                <td>{row.incidentDate}</td>
                <td style={{ textAlign: "center" }}>{row.incidentType}</td>
                <td>{row.nomineeName}</td>
                <td>{row.nomineeNid}</td>
                <td>{row.relation}</td>
                <td>{row.bankName}</td>
                <td>{row.bankAc}</td>
                <td style={{ textAlign: "right" }}>{Number(row.amount).toLocaleString("en-IN")}</td>
                <td>{row.routingNo}</td>
                <td>{row.mobile}</td>
                <td>{row.unitNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default DeathDisabilityView;
