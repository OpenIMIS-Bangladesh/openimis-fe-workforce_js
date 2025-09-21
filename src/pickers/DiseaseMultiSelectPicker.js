import React, { useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, TextField } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { useModulesManager, FormattedMessage } from "@openimis/fe-core";
import { fetchDiseases } from "../actions";

const OTHER_ID = "OTHER_OPTION";

const DiseaseMultiSelectPicker = ({
  id,
  selectedDiseases = [],
  onChange,
  onOtherDiseaseChange,
  required,
  otherDiseaseValue,
  handleChange, // ✅ handleChange(key, value, parent)
}) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  useEffect(() => {
    dispatch(fetchDiseases(modulesManager, ""));
  }, [dispatch, modulesManager]);

  const diseaseList = useSelector((state) => state.workforce["diseases"] ?? []);

  const renderSelectedValues = (selected) => {
    const selectedNames = selected.map((id) => {
      if (id === OTHER_ID) return "অন্যান্য";
      const match = diseaseList.find((d) => d.id === id);
      return match ? match.diseaseName : id;
    });
    return selectedNames.join(", ");
  };

  const handleSelectChange = (event) => {
    const selectedIds = Array.from(new Set(event.target.value));

    // Build full objects instead of just IDs
    const selectedObjects = selectedIds.map((id) => {
      if (id === OTHER_ID) {
        return { id: OTHER_ID, diseaseName: "অন্যান্য" }; // Special case for Other
      }
      return diseaseList.find((d) => d.id === id) || { id };
    });

    onChange(selectedObjects); // 🔄 send back objects instead of IDs

    // Compute totalAmount only from real diseases (not OTHER)
    const totalAmount = selectedObjects
      .filter((d) => d.id !== OTHER_ID)
      .map((d) => d.minimumDonationAmount || 0)
      .reduce((sum, val) => sum + val, 0);

    if (handleChange) {
      handleChange("grantAmount", totalAmount);
    }
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel required>
          <FormattedMessage id="workforce.application.disease.name" defaultMessage="রোগের নাম" module="workforce" />
        </InputLabel>
        <Select
          multiple
          value={selectedDiseases.map((d) => d.id)} // extract ids for MUI
          onChange={handleSelectChange}
          renderValue={(selectedIds) =>
            selectedIds
              .map((id) => {
                if (id === OTHER_ID) return "অন্যান্য";
                const match = diseaseList.find((d) => d.id === id);
                return match ? match.diseaseName : id;
              })
              .join(", ")
          }
          required={required}
          inputProps={{ id }}
        >
          {diseaseList.map((disease) => (
            <MenuItem key={disease.id} value={disease.id}>
              <Checkbox
                checked={selectedDiseases.some((d) => d.id === disease.id)} // ✅ FIX
                color="primary"
              />
              <ListItemText primary={disease.diseaseName} />
            </MenuItem>
          ))}

          <MenuItem key={OTHER_ID} value={OTHER_ID}>
            <Checkbox
              checked={selectedDiseases.some((d) => d.id === OTHER_ID)} // ✅ FIX
              color="primary"
            />
            <ListItemText primary="অন্যান্য" />
          </MenuItem>
        </Select>
      </FormControl>

      {selectedDiseases.some((d) => d.id === OTHER_ID) && (
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
