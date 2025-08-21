import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { FormattedMessage } from "@openimis/fe-core";

const OTHER_ID = "OTHER_OPTION";

// ✅ List of translation keys as plain strings
const deathReasonKeys = [
  "heart_disease",
  "stroke",
  "old_age",
  "cancer",
  "diabetes",
  "liver_failure",
  "kidney_failure",
  "asthma",
  "pneumonia",
  "chronic",
  OTHER_ID,
];

const DeathReasonPicker = ({
  id,
  selectedReason = "",
  handleChange, // handleChange(key, value, parent)
  onOtherDiseaseChange,
  required=true,
  otherDiseaseValue,
}) => {
  const handleSelectChange = (event) => {
    const value = event.target.value;
    handleChange("deathReason", value); // You can change "deathReason" to a prop if needed
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel required>
          <FormattedMessage
            id="workforce.application.death.reason"
            defaultMessage="মৃত্যুর কারণ"
            module="workforce"
          />
        </InputLabel>
        <Select
          value={selectedReason}
          onChange={handleSelectChange}
          required={required}
          inputProps={{id}}
        >
          {deathReasonKeys.map((key) => (
            <MenuItem key={key} value={key}>
              <FormattedMessage id={`workforce.application.deathReason.${key}`} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedReason === OTHER_ID && (
        <TextField
          fullWidth
          label={
            <FormattedMessage
              module="workforce"
              id="workforce.application.other.death.reason"
              defaultMessage="মৃত্যুর কারণ নির্দিষ্ট করুন"
            />
          }
          value={otherDiseaseValue || ""}
          onChange={(e) => onOtherDiseaseChange(e.target.value)}
          margin="normal"
        />
      )}
    </>
  );
};

export default DeathReasonPicker;
