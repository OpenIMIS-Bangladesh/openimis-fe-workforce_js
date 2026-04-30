export const generateTopText = () => {
  const printYear = new Date().getFullYear();
  const printMonth = new Date().getMonth();
  const excelmonthFormatted = String(printMonth + 1).padStart(2, "0");
  const excelyear = printYear;

  return `
    <p style="text-align: right;">Ref No: EIS.Bank Advice.Benefit.${excelyear}.${excelmonthFormatted}</p>
    <p><strong>Manager</strong></p>
    <p>Sonali Bank Limited</p>
    <p>Ramna Corporate Branch</p>
    <p>1, Topkhana Road, Ramna, Dhaka, 1000</p>
    <p><br></p>
    <p><strong><u>Subject: Bank Advice Letter (EIS Top-up Benefit)</u></strong></p>
    <p><br></p>
    <p>Dear Sir:</p>
    <p>Greetings from EIS Pilot!</p>
    <p>EIS Pilot top-up benefits are required to be disbursed to the beneficiaries through bank transfer from your branch of EIS Pilot bank account, <strong>Account Title: EMPLOYMENT INJURY SCHEME EIS</strong>, <strong>Account Number: 4426302003729</strong>. The validated list of account holders with their respective Account Titles, Bank Account Numbers, Bank Names, Branch info, Routing Numbers including Payment amounts have been mentioned below.</p>
  `;
};

export const generateBottomText = () => {
  return `
    <p>Your prompt necessary steps in this matter will be highly appreciated.</p>
    <p><br></p>
    <p>With warm regards</p>
    <p><br></p>
    <p><strong>Director General,</strong></p>
    <p>Central Fund, Ministry of Labor and Employment &amp;</p>
    <p>Member Secretary, EIS Pilot Governance Board</p>
    <p>Bangladesh Secretariat, Dhaka-1000</p>
    <p><br></p>
    <p>Copy to (Not in order of seniority):</p>
    <p style="margin-left: 20px;">1. PS to State Minister, Ministry of Labour and Employment, Bangladesh Secretariat, Dhaka-1000.</p>
    <p style="margin-left: 20px;">2. PS to Secretary, Ministry of Labour and Employment, Bangladesh Secretariat, Dhaka-1000.</p>
    <p style="margin-left: 20px;">3. Special Advisor, EIS Pilot Special Unit, 196, Sromo Bhaban (9th Floor), Bijoynagar, Dhaka-1000.</p>
    <p style="margin-left: 20px;">4. PA to Director General, Central Fund, Bangladesh Secretariat, Dhaka-1000.</p>
    <p style="margin-left: 20px;">5. Assistant Director, Welfare-2 and Development, Central Fund, Bangladesh Secretariat, Dhaka-1000.</p>
    <p style="margin-left: 20px;">6. Assistant Director, Finance Department, Central Fund, Bangladesh Secretariat, Dhaka-1000.</p>
  `;
};

export const generateBankAdviceContent = (paymentData, month, year) => {
  const eisPayments = paymentData || [];

  const getTotalAmount = () => {
    return eisPayments
      .reduce((sum, item) => sum + (parseFloat(item.paidAmount) || 0), 0)
      .toFixed(2);
  };

  const generateTableHTML = () => {
    let tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; color:"black";">
        <thead>
          <tr style="background-color: #92D050;">
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">SL</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Account Title</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Account No</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Bank</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Branch</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">District</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Routing</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Amount</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Beneficiary ID</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Pay From</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: center;">Pay To</th>
          </tr>
        </thead>
        <tbody>
    `;

    eisPayments.forEach((row, index) => {
      const year = row?.year || "";
      const monthIndex = row?.monthIndex || "";
      const monthFormatted = String(monthIndex).padStart(2, "0");
      const lastDay = new Date(year, monthIndex, 0).getDate();

      tableHTML += `
        <tr>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 8px;">${row?.bankAccountHolderName || ""}</td>
          <td style="border: 1px solid #000; padding: 8px;">${row?.bankAccountNo || ""}</td>
          <td style="border: 1px solid #000; padding: 8px;">${row?.bank?.parent?.nameEn || ""}</td>
          <td style="border: 1px solid #000; padding: 8px;">${row?.bank?.nameEn || ""}</td>
          <td style="border: 1px solid #000; padding: 8px;">${row?.bank?.districtNameEn || ""}</td>
          <td style="border: 1px solid #000; padding: 8px;">${row?.bank?.routingNumber || ""}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">${row?.paidAmount || 0}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">${row?.beneficiaryId || ""}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">01.${monthFormatted}.${year}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">${lastDay}.${monthFormatted}.${year}</td>
        </tr>
      `;
    });

    tableHTML += `
        </tbody>
      </table>
    `;

    return tableHTML;
  };

  const topText = generateTopText();
  const tableHTML = generateTableHTML();
  const totalHTML = `
    <p style="text-align: right; font-weight: bold;">Total Amount (BDT): ${getTotalAmount()}</p>
  `;
  const bottomText = generateBottomText();

  return `
    <div style="color: #000;">
      ${topText}
      ${tableHTML}
      ${totalHTML}
      ${bottomText}
    </div>
  `;
};