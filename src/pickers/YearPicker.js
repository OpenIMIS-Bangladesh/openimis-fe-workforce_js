import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";

// Generate years from 2000 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i);

const YearPicker = ({ value, onChange, label, required = false }) => {
  return (
    <FormControl fullWidth required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default YearPicker;
