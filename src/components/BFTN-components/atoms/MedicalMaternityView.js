import React from "react";
import { safeParse, isBlwfPath, formatAddress } from "../../../utils/utils";

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

      let diseaseType = app.applicationType === "maternityGrant" ? "Maternity" : "Treatment";
      try {
        const info = JSON.parse(JSON.parse(app.employeeAccidentInfo || "{}"));
        if (info.diseaseName) diseaseType = info.diseaseName;
      } catch (e) {}

      const parsedAddress = safeParse(app?.workforceEmployee?.presentAddress) || {};
      const formattedAddress = formatAddress(
        app?.workforceEmployee?.presentLocation, // Make sure this matches your actual location key
        app?.workforceEmployee?.presentAddress,
      );

      bankInfos.forEach((bankInfo, bankIndex) => {
        rows.push({
          sl: appIndex + 1 + bankIndex,
          mainListNo: app.dateCreated.split("T")[0] || "",
          workerName: app.workforceEmployee?.firstNameBn || app.workforceEmployee?.firstNameEn || "",
          fatherName: app.workforceEmployee?.fatherNameBn || app.workforceEmployee?.fatherNameEn || "",
          factoryName: app.employeeFactory?.nameBn || app.employeeFactory?.nameEn || "",
          workerNid: app.workforceEmployee?.nid || "",
          workerMobile: app.workforceEmployee?.mobile || app.workforceEmployee?.phoneNumber || "",
          address: `গ্রাম-${formattedAddress.village || ""}\nডাক-${formattedAddress.postOffice || ""}\nউপজেলা-${formattedAddress.thana || ""}\nজেলা-${formattedAddress.district || ""}`,
          district: formattedAddress.district || "",
          nomineeName: bankInfo?.accountHolderName || app.workforceEmployee?.firstNameBn || app.workforceEmployee?.firstNameEn || "",
          nomineeNid: app.workforceEmployee?.nid || "",
          nomineeMobile: app.workforceEmployee?.mobile || app.workforceEmployee?.phoneNumber || "",
          relation: "নিজ",
          disease: diseaseType,
          details: `আবেদনকারী ${diseaseType} এর জন্য চিকিৎসা সহায়তা চেয়েছেন।`,
          profession: app.employeeFactory?.nameBn || "গৃহ শ্রমিক",
          remarks: "শ্রম অধিদপ্তর",
          routingNo: bankInfo?.branch?.routingNumber || "",
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
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Treatment Assistance (TA)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.TA}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Maternity Assistance (MA)</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.MA}</td>
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
                <td>{row.workerName}</td>
                <td>{row.workerNid}</td>
                <td>{row.workerMobile}</td>
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
      )}
    </>
  );
};

export default MedicalMaternityView;
