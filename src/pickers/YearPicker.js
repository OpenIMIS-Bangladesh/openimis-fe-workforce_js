import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { TextInput, useTranslations, FormattedMessage,PublishedComponent } from "@openimis/fe-core";


// Generate years from 2000 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => 1990 + i);

const YearPicker = ({id, value, onChange, label, required = false }) => {
  return (
    <FormControl fullWidth required={required}>
      <InputLabel><FormattedMessage id={label} module="workforce"/></InputLabel>
      <Select
        id={id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ id }}
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
