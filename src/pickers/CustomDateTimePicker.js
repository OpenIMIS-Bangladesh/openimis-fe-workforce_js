import React from "react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import "react-multi-date-picker/styles/colors/teal.css";

// Default Bangla digits and months
const defaultDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const defaultMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const CustomDateTimePicker = ({
  value,
  onChange,
  isDateTime = false,
  digits = defaultDigits,
  months = defaultMonths,
  format = "YYYY-MM-DD",
  placeholder = "তারিখ নির্বাচন করুন",
  ...props
}) => {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      format={format}
      calendarPosition="bottom-center"
      weekDays={["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"]}
      months={months}
      digits={digits}
      plugins={isDateTime ? [<TimePicker key="time" position="bottom" />] : []}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default CustomDateTimePicker;
