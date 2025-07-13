import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslations, useModulesManager, TextInput, useHistory, FormattedMessage, PublishedComponent } from "@openimis/fe-core";

const diseaseOptions = [
"ডায়াবেটিস",
"উচ্চ রক্তচাপ",
"হাঁপানি",
"হৃদরোগ",
"কিডনি রোগ",
"ক্যান্সার",
"যক্ষ্মা",
"স্ট্রোক",
"অন্যান্য"
];

const DiseaseMultiSelectPicker = ({ value = [], onChange, selectedDiseases, onOtherDiseaseChange,otherDiseaseValue }) => {
  const handleSelectChange = (event) => {
    const selected = event.target.value;

    // Only allow unique values
    const uniqueSelected = Array.from(new Set(selected));
    onChange(uniqueSelected);
  };

  return (
    <>
      <FormControl fullWidth>
      <InputLabel required>
        <FormattedMessage
          id="workforce.application.disease.name"
          defaultMessage="রোগের নাম"
          module="workforce"
        />
      </InputLabel>
        <Select
          multiple
          value={selectedDiseases}
          onChange={onChange}
          renderValue={(selected) => selected.join(", ")}
          required={true}
        >
          {diseaseOptions.map((disease) => (
            <MenuItem key={disease} value={disease}>
              <Checkbox checked={selectedDiseases.indexOf(disease) > -1} color="primary"/>
              <ListItemText primary={disease} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* {selectedDiseases.includes("Others") && (
        <TextField
          fullWidth
          label="Specify Other Disease"
          value={otherDiseaseValue || ""}
          onChange={(e) => onOtherDiseaseChange(e.target.value)}
          margin="normal"
        />
      )} */}
    </>
  );
};

export default DiseaseMultiSelectPicker;
