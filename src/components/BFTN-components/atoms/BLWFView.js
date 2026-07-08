import React from "react";
import { safeParse, formatAddress, isBlwfPath } from "../../../utils/utils";

const BLWFView = ({ classes, applications, getTotalAmount }) => {
  const stats = { MedicalDonation: 0, maternityGrant: 0, educationGrant: 0, deadlyGrant: 0, Total: applications.length };

  applications.forEach((app) => {
    const t = app?.applicationType || "";
    if (t === "medicalDonation") stats.MedicalDonation += 1;
    else if (t === "maternityGrant") stats.maternityGrant += 1;
    else if (t === "educationGrant") stats.educationGrant += 1;
    else if (t === "deadlyGrant") stats.deadlyGrant += 1;
  });

  const getRows = () => {
    const rows = [];
    applications.forEach((app, appIndex) => {
      let bankInfos = [];
      try {
        const parsed = JSON.parse(app.employeeBankInfo || "[]");
        bankInfos = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
      } catch (e) {
        bankInfos = [];
      }

      const parsedAddress = safeParse(app?.workforceEmployee?.presentAddress) || {};
      const formattedAddress = formatAddress(app?.workforceEmployee?.presentLocation, app?.workforceEmployee?.presentAddress);

      (bankInfos.length > 0 ? bankInfos : [{}]).forEach((bankInfo, bankIndex) => {
        rows.push({
          sl: appIndex + 1 + bankIndex,
          mainListNo: (app.dateCreated && app.dateCreated.split && app.dateCreated.split("T")[0]) || app.trackingNumber || "",
          workerName: app.workforceEmployee?.firstNameBn || app.workforceEmployee?.firstNameEn || "",
          fatherName: app.workforceEmployee?.fatherNameBn || app.workforceEmployee?.fatherNameEn || "",
          factoryName: app.employeeFactory?.nameBn || app.employeeFactory?.nameEn || "",
          workerNid: app.workforceEmployee?.nid || "",
          workerMobile: app.workforceEmployee?.phoneNumber || app.workforceEmployee?.mobile || "",
          address: `গ্রাম-${formattedAddress.village || ""}\nডাক-${formattedAddress.postOffice || ""}\nউপজেলা-${formattedAddress.thana || ""}\nজেলা-${formattedAddress.district || ""}`,
          district: formattedAddress.district || "",
          nomineeName: bankInfo?.accountHolderName || app.workforceEmployee?.firstNameBn || app.workforceEmployee?.firstNameEn || "",
          nomineeNid: bankInfo?.dependentNid || app.workforceEmployee?.nid || "",
          nomineeMobile: bankInfo?.phoneNumber || app.workforceEmployee?.phoneNumber || app.workforceEmployee?.mobile || "",
          relation: "নিজ",
          details: app.notes || "",
          profession: app.employeeFactory?.nameBn || "গৃহ শ্রমিক",
          remarks: "শ্রম অধিদপ্তর",
          routingNo: bankInfo?.branch?.routingNumber || bankInfo?.district?.routingNumber || "",
          accountNo: bankInfo?.accountNumber || "",
          amount: app.grantAmount || "",
        });
      });
    });
    return rows;
  };

  console.log({blwfView:applications})
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
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Medical Donation</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.MedicalDonation}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Maternity</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.maternityGrant}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Education Grant</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.educationGrant}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "none", borderBottom: "1px solid #000" }}>Deadly Grant</td>
                    <td style={{ border: "none", borderBottom: "1px solid #000", borderLeft: "1px solid #000" }}>{stats.deadlyGrant}</td>
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
                  {row.nomineeName} ({row.relation})
                  <br />
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
              <th>Type</th>
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
                <td>{row.details}</td>
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

export default BLWFView;
