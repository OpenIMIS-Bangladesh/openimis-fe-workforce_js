import React from "react";
import { colorCode } from "../../../constants"; 

const ColoredRowLegends = () => {
  // প্রতিটি শতাংশের সঙ্গে টেক্সট মেপ করছি
  const legends = [
    { percent: 0, label: "সম্প্রতি প্রাপ্ত" },
    { percent: 20, label: "পর্যাপ্ত সময়" },
    { percent: 40, label: "জরুরী" },
    { percent: 60, label: "অগ্রাধিকার" },
    { percent: 80, label: "সর্বোচ্চ অগ্রাধিকার" },
    { percent: 100, label: "সময় শেষ" },
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
