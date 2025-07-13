import React, { useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import {
  useModulesManager,
  FormattedMessage,
} from "@openimis/fe-core";
import { fetchDiseases } from "../actions";

const OTHER_ID = "OTHER_OPTION";

const DiseaseMultiSelectPicker = ({
  selectedDiseases = [],
  onChange,
  onOtherDiseaseChange,
  otherDiseaseValue,
  handleChange, // ✅ handleChange(key, value, parent)
}) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  useEffect(() => {
    dispatch(fetchDiseases(modulesManager, ""));
  }, [dispatch, modulesManager]);

  const diseaseList = useSelector(
    (state) => state.workforce["diseases"] ?? []
  );

  const renderSelectedValues = (selected) => {
    const selectedNames = selected.map((id) => {
      if (id === OTHER_ID) return "অন্যান্য";
      const match = diseaseList.find((d) => d.id === id);
      return match ? match.diseaseName : id;
    });
    return selectedNames.join(", ");
  };

  const handleSelectChange = (event) => {
    const selected = Array.from(new Set(event.target.value));
    onChange(selected);

    // ✅ Calculate total minimumDonationAmount
    const totalAmount = selected
      .filter((id) => id !== OTHER_ID)
      .map((id) => {
        const found = diseaseList.find((d) => d.id === id);
        return found?.minimumDonationAmount || 0;
      })
      .reduce((sum, val) => sum + val, 0);

    // ✅ Update grantAmount using handleChange
    if (handleChange) {
      handleChange("grantAmount", totalAmount);
    }
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
          required
        >
          {diseaseList.map((disease) => (
            <MenuItem key={disease.id} value={disease.id}>
              <Checkbox
                checked={selectedDiseases.includes(disease.id)}
                color="primary"
              />
              <ListItemText primary={disease.diseaseName} />
            </MenuItem>
          ))}
          <MenuItem key={OTHER_ID} value={OTHER_ID}>
            <Checkbox checked={selectedDiseases.includes(OTHER_ID)} color="primary" />
            <ListItemText primary="অন্যান্য" />
          </MenuItem>
        </Select>
      </FormControl>

      {selectedDiseases.includes(OTHER_ID) && (
        <TextField
          fullWidth
          label="অন্যান্য রোগ নির্দিষ্ট করুন"
          value={otherDiseaseValue || ""}
          onChange={(e) => onOtherDiseaseChange(e.target.value)}
          margin="normal"
        />
      )}
    </>
  );
};

export default DiseaseMultiSelectPicker;
