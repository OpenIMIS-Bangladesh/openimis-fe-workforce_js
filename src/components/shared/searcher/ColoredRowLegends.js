import React from "react";
import { colorCode, WORKFORCE_USER_TYPE } from "../../../constants"; 
import { useSelector } from "react-redux";
import { getUserType } from "../../../utils/utils";

const ColoredRowLegends = () => {
  const userType = getUserType();
  const locale = useSelector((state) => state.core?.user?.i_user?.language  ?? "en");
  // প্রতিটি শতাংশের সঙ্গে টেক্সট মেপ করছি
  const legends = userType === WORKFORCE_USER_TYPE.EIS_COMMITTEE
    ? [
        { percent: 0, label: locale === "fr" ? "সম্প্রতি প্রাপ্ত" : "Recently Received" },
        { percent: 20, label: locale === "fr" ? "অনুমোদিত" : "Approved" },
        { percent: 40, label: locale === "fr" ? "পুন নিরীক্ষণ" : "Review" },
        { percent: 60, label: locale === "fr" ? "রিজেক্টেড" : "Rejected" },
      ]
    : [
        { percent: 0, label: locale === "fr" ? "সম্প্রতি প্রাপ্ত" : "Recently Received" },
        { percent: 20, label: locale === "fr" ? "পর্যাপ্ত সময়" : "Sufficient Time" },
        { percent: 40, label: locale === "fr" ? "জরুরী" : "Urgent" },
        { percent: 60, label: locale === "fr" ? "অগ্রাধিকার" : "Priority" },
        { percent: 80, label: locale === "fr" ? "সর্বোচ্চ অগ্রাধিকার" : "Highest Priority" },
        { percent: 100, label: locale === "fr" ? "সময় শেষ" : "Time Expired" },
      ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "18px",
        margin: "10px 0",
      }}
    >
      {legends.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: colorCode[item.percent],
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          ></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ColoredRowLegends;
