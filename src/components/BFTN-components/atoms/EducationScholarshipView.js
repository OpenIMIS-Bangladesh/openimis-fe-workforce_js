import React from "react";
import { decodeId } from "@openimis/fe-core";
import { RELATION_LABEL_MAP } from "../../../constants";

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
      const relation = dep ? (RELATION_LABEL_MAP[dep.relationWithWorker] || dep.relationWithWorker) : "Self";

      // Attempt to safely parse GPA if available in standard formats
      let gpa = "";
      try {
        const eduInfo = JSON.parse(app.educationInfo || "{}");
        gpa = eduInfo.gpa || dep?.gpa || "";
      } catch (e) {}

      bankInfos.forEach((bankInfo, bankIndex) => {
        rows.push({
          sl: app.trackingNumber || `${appIndex + 1 + bankIndex}`,
          applicantName: app.workforceEmployee?.firstNameEn || "",
          nid: app.workforceEmployee?.nid || "",
          mobile: app.workforceEmployee?.phoneNumber || "",
          unitName: app.employeeFactory?.nameEn || "",
          candidateName: dep?.nameEn || app.workforceEmployee?.firstNameEn || "",
          relation: relation,
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
              <strong>Board Meeting:</strong> 26th<br />
              <strong>Fiscal Year:</strong> 2025-2026<br />
              <strong>Number of Application:</strong> {stats.Total}<br />
              <strong>Number of Nominees/Accounts:</strong> {rows.length}<br />
              <strong>Total Amount:</strong> {Number(getTotalAmount()).toLocaleString("en-IN")}<br />
              <strong>In Words:</strong>
            </td>
            <td style={{ width: "50%", padding: 0 }}>
              <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td style={{ border: "none", borderBottom: "1px solid #000" }}>Application Type</td><td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>Total</td></tr>
                  <tr><td style={{ border: "none", borderBottom: "1px solid #000" }}>Labour Self-Education/Skill</td><td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.self}</td></tr>
                  <tr><td style={{ border: "none", borderBottom: "1px solid #000" }}>Son (Education Support)</td><td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.son}</td></tr>
                  <tr><td style={{ border: "none", borderBottom: "1px solid #000" }}>Daughter (Education Support)</td><td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.daughter}</td></tr>
                  <tr><td style={{ border: "none", fontWeight: "bold" }}>Total</td><td style={{ border: "none", borderLeft: "1px solid #000", fontWeight: "bold" }}>{stats.Total}</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

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
              <td>{row.applicantName}</td>
              <td>{row.nid}</td>
              <td>{row.mobile}</td>
              <td>{row.unitName}</td>
              <td>{row.candidateName}</td>
              <td>{row.relation}</td>
              <td style={{ textAlign: "center" }}>{row.gpa}</td>
              <td style={{ textAlign: "center" }}>{row.routing}</td>
              <td style={{ textAlign: "center" }}>{row.accountNo}</td>
              <td style={{ textAlign: "right" }}>{Number(row.amount).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default EducationScholarshipView;