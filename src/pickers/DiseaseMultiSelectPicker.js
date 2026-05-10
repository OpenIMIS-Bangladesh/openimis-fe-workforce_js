import React, { useEffect,useRef,useState } from "react";
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText,
  TextField,
  IconButton
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";   // ← Add this import
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
  handleChange,
}) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const selectRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDiseases(modulesManager, ""));
  }, [dispatch, modulesManager]);

  const diseaseList = useSelector((state) => state.workforce["diseases"] ?? []);

  const handleSelectChange = (event) => {
    const selectedIds = Array.from(new Set(event.target.value));

    const selectedObjects = selectedIds.map((id) => {
      if (id === OTHER_ID) {
        return { id: OTHER_ID, diseaseName: "অন্যান্য" };
      }
      return diseaseList.find((d) => d.id === id) || { id };
    });

    onChange(selectedObjects);

    const totalAmount = selectedObjects
      .filter((d) => d.id !== OTHER_ID)
      .map((d) => d.minimumDonationAmount || 0)
      .reduce((sum, val) => sum + val, 0);

    if (handleChange) {
      handleChange("grantAmount", totalAmount);
    }
  };

  const handleClose = () => {
  setOpen(false); // Manually close the menu
};

const handleOpen = () => {
  setOpen(true); // Manually open the menu
};

  return (
    <>
      <FormControl fullWidth>
        <InputLabel required>
          <FormattedMessage id="workforce.application.disease.name" defaultMessage="রোগের নাম" module="workforce" />
        </InputLabel>
        
        <Select
          ref={selectRef}
          open={open}             // Controlled state
  onOpen={handleOpen}     // Sync state when opened
  onClose={handleClose}
          multiple
          value={selectedDiseases.map((d) => d.id)}
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
          
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 450,
                width: 360,
                marginTop: 8,
              },
            },
            anchorOrigin: { vertical: "bottom", horizontal: "left" },
            transformOrigin: { vertical: "top", horizontal: "left" },
            getContentAnchorEl: null,
          }}
        >
          {/* Close Icon - Always Visible at Top Right */}
          <div style={{
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            zIndex: 20,
            display: "flex",
            justifyContent: "flex-end",
            padding: "4px 8px",
            borderBottom: "1px solid #eee"
          }}>
            <IconButton size="small" onClick={(e) => {
    e.stopPropagation();handleClose()}}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Disease Items */}
          {diseaseList.map((disease) => (
            <MenuItem key={disease.id} value={disease.id} dense>
              <Checkbox
                checked={selectedDiseases.some((d) => d.id === disease.id)}
                color="primary"
              />
              <ListItemText primary={disease.diseaseName} />
            </MenuItem>
          ))}

          <MenuItem key={OTHER_ID} value={OTHER_ID} dense>
            <Checkbox
              checked={selectedDiseases.some((d) => d.id === OTHER_ID)}
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