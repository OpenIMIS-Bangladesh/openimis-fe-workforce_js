import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Typography, Grid, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { decodeId } from "@openimis/fe-core";
import { fetchWorkforceSignatures } from "../../../actions";
import { WORKFORCE_USER_TYPE, RELATION_LABEL_MAP } from "../../../constants";
import { getUserTypeFromRights } from "../../../utils/utils";

const MedicalMaternityView = ({ classes, applications, getTotalAmount }) => {
  const stats = { TA: 0, MA: 0, Total: applications.length };

  applications.forEach((app) => {
    if (app.applicationType === "maternityGrant") stats.MA += 1;
    else stats.TA += 1;
  });

  const getRows = () => {
    let rows = [];
    applications.forEach((app, appIndex) => {
      let bankInfos = [];
      try {
        const parsed = JSON.parse(app.employeeBankInfo);
        bankInfos = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
      } catch (e) {}

      // Extract specific disease name if medical, otherwise fallback
      let diseaseType = app.applicationType === "maternityGrant" ? "Maternity" : "Treatment";
      try {
        const info = JSON.parse(JSON.parse(app.employeeAccidentInfo || "{}"));
        if (info.diseaseName) diseaseType = info.diseaseName;
      } catch (e) {}

      bankInfos.forEach((bankInfo, bankIndex) => {
        rows.push({
          sl: appIndex + 1 + bankIndex,
          mainListNo: app.dateCreated.split("T")[0] || "",
          applicantName: bankInfo?.accountHolderName || app.workforceEmployee?.firstNameEn || "",
          nid: app.workforceEmployee?.nid || "",
          mobile: app.workforceEmployee?.phoneNumber || "",
          factoryName: app.employeeFactory?.nameEn || "",
          relation: "Self", 
          disease: diseaseType,
          routingNo: bankInfo?.branch?.routingNumber || "",
          accountNo: bankInfo?.accountNumber || "",
          amount: app.grantAmount || "",
        });
      });
    });
    return rows;
  };

  const rows = getRows();
  console.log(rows)
  console.log({applications})
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
                  <tr><td style={{ border: "none", borderBottom: "1px solid #000" }}>Treatment Assistance (TA)</td><td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.TA}</td></tr>
                  <tr><td style={{ border: "none", borderBottom: "1px solid #000" }}>Maternity Assistance (MA)</td><td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.MA}</td></tr>
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
            <th>SL No</th>
            <th>M:SL</th>
            <th>Applicant Name</th>
            <th>NID/Birth Certificate</th>
            <th>Mobile</th>
            <th>Factory Name</th>
            <th>Relation</th>
            <th>Type of Disease</th>
            <th>Routing Number</th>
            <th>Account No</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td style={{ textAlign: "center" }}>{row.sl}</td>
              <td style={{ textAlign: "center" }}>{row.mainListNo}</td>
              <td>{row.applicantName}</td>
              <td>{row.nid}</td>
              <td>{row.mobile}</td>
              <td>{row.factoryName}</td>
              <td>{row.relation}</td>
              <td>{row.disease}</td>
              <td>{row.routingNo}</td>
              <td>{row.accountNo}</td>
              <td style={{ textAlign: "right" }}>{Number(row.amount).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default MedicalMaternityView;