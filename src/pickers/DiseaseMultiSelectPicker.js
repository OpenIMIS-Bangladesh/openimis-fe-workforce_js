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

const diseaseOptions = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Kidney Disease",
  "Cancer",
  "Tuberculosis",
  "Arthritis",
  "Stroke",
  "Others",
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
        <InputLabel>রোগের নাম</InputLabel>
        <Select
          multiple
          value={selectedDiseases}
          onChange={onChange}
          renderValue={(selected) => selected.join(", ")}
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
