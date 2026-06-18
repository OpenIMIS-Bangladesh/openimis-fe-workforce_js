import React from "react";
import { decodeId } from "@openimis/fe-core";
import { RELATION_LABEL_MAP } from "../../../constants";
import { safeParse, isBlwfPath, formatAddress } from "../../../utils/utils";

const EducationScholarshipView = ({ classes, applications, dependentData, getTotalAmount }) => {
  const stats = { self: 0, son: 0, daughter: 0, Total: applications.length };

  applications.forEach((app) => {
    const dep = dependentData?.find((d) => decodeId(d.workforceApplicationId) === decodeId(app.id));
    const rel = (dep ? dep.relationWithWorker : "self").toLowerCase();

    if (rel.includes("son")) stats.son += 1;
    else if (rel.includes("daughter")) stats.daughter += 1;
    else stats.self += 1;
  });

  const getRows = () => {
    let rows = [];
    applications.forEach((app, appIndex) => {
      let bankInfos = [];
      try {
        const parsed = JSON.parse(app.employeeBankInfo);
        bankInfos = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
      } catch (e) {}

      const dep = dependentData?.find((d) => decodeId(d.workforceApplicationId) === decodeId(app.id));
      const relation = dep ? RELATION_LABEL_MAP[dep.relationWithWorker] || dep.relationWithWorker : "Self";

      let gpa = "";
      try {
        const eduInfo = JSON.parse(app.educationInfo || "{}");
        gpa = eduInfo.gpa || dep?.gpa || "";
      } catch (e) {}

      const parsedAddress = safeParse(app?.workforceEmployee?.presentAddress) || {};
      const formattedAddress = formatAddress(
        app?.workforceEmployee?.presentLocation, // Make sure this matches your actual location key
        app?.workforceEmployee?.presentAddress,
      );

      bankInfos.forEach((bankInfo, bankIndex) => {
        rows.push({
          sl: app.trackingNumber || `${appIndex + 1 + bankIndex}`,
          workerName: app.workforceEmployee?.firstNameBn || app.workforceEmployee?.firstNameEn || "",
          fatherName: app.workforceEmployee?.fatherNameBn || app.workforceEmployee?.fatherNameEn || "",
          factoryName: app.employeeFactory?.nameBn || app.employeeFactory?.nameEn || "",
          workerNid: app.workforceEmployee?.nid || "",
          workerMobile: app.workforceEmployee?.mobile || app.workforceEmployee?.phoneNumber || "",
          address: `গ্রাম-${formattedAddress.village || ""}\nডাক-${formattedAddress.postOffice || ""}\nউপজেলা-${formattedAddress.thana || ""}\nজেলা-${formattedAddress.district || ""}`,
          district: formattedAddress.district || "",
          nomineeName: dep?.nameBn || dep?.nameEn || bankInfo?.accountHolderName || app.workforceEmployee?.firstNameEn || "",
          nomineeNid: dep?.nid || app.workforceEmployee?.nid || "",
          nomineeMobile: dep?.mobile || app.workforceEmployee?.mobile || app.workforceEmployee?.phoneNumber || "",
          relation: relation,
          details: `আবেদনকারীর সন্তান ${gpa} পেয়ে উত্তীর্ণ হয়েছেন।`,
          profession: app.employeeFactory?.nameBn || "গৃহ শ্রমিক",
          remarks: "শ্রম অধিদপ্তর",
          gpa: gpa,
          routing: bankInfo?.branch?.routingNumber || "",
          accountNo: bankInfo?.accountNumber || "",
          amount: app.grantAmount || "",
        });
      });
    });
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
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Application Type</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>Total</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Labour Self-Education/Skill</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.self}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Son (Education Support)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.son}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Daughter (Education Support)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.daughter}</td>
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
              <th>Sl.no</th>
              <th>Applicant Name</th>
              <th>NID Card/Birth Certificate Number</th>
              <th>Applicant Mobile</th>
              <th>Unit Name</th>
              <th>Candidate Name</th>
              <th>Relation</th>
              <th>GPA</th>
              <th>Routing</th>
              <th>Account NO</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{row.sl}</td>
                <td>{row.workerName}</td>
                <td>{row.workerNid}</td>
                <td>{row.workerMobile}</td>
                <td>{row.factoryName}</td>
                <td>{row.nomineeName}</td>
                <td>{row.relation}</td>
                <td style={{ textAlign: "center" }}>{row.gpa}</td>
                <td style={{ textAlign: "center" }}>{row.routing}</td>
                <td style={{ textAlign: "center" }}>{row.accountNo}</td>
                <td style={{ textAlign: "right" }}>{Number(row.amount).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default EducationScholarshipView;
