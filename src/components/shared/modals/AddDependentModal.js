import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  makeStyles,
} from "@material-ui/core";
import { FormattedMessage } from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import { updateApplication } from "../../../actions";
import EmployeeDependentForm from "../../../pages/application/EmployeeDependentForm";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 500,
  },
  input: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
}));

const AddDependentModal = ({ open, onClose, application }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const stepRef = useRef(null);
  
  const [expanded, setExpanded] = useState(0);
  const [errors, setErrors] = useState({});

  // 1. FIX INITIALIZATION: 
  // We must parse the stringified JSON from props into a real Array immediately.
  const [formData, setFormData] = useState(() => {
    let parsedDependents = [];
    
    if (application?.employeeDependentInfo) {
      try {
        // Check if it's a string, if so, parse it. If it's already an object/array, use it.
        parsedDependents = typeof application.employeeDependentInfo === "string"
          ? JSON.parse(application.employeeDependentInfo)
          : application.employeeDependentInfo;
      } catch (error) {
        console.error("Error parsing dependents:", error);
        parsedDependents = [];
      }
    }

    // Ensure it is always an array
    if (!Array.isArray(parsedDependents)) parsedDependents = [];

    return {
      ...application,
      employeeDependentInfo: application?.workforceEmployeeDependentApplication, 
    };
  });

  const handleArrayFieldChange = (fieldKey, index, key, value) => {
    setFormData((prev) => {
      // Create a shallow copy of the array to ensure immutability
      const items = prev[fieldKey] ? [...prev[fieldKey]] : [];
      // Update the specific field
      items[index] = { ...items[index], [key]: value };
      return { ...prev, [fieldKey]: items };
    });
  };

  const addArrayFieldItem = (fieldKey, defaultItem = {}) => {
    setFormData((prev) => {
      const items = prev[fieldKey] ? [...prev[fieldKey]] : [];
      const updated = [...items, defaultItem];
      setExpanded(updated.length - 1); 
      return { ...prev, [fieldKey]: updated };
    });
  };

  const removeArrayFieldItem = (fieldKey, index) => {
    setFormData((prev) => {
      const items = prev[fieldKey] ? [...prev[fieldKey]] : [];
      const updated = items.filter((_, i) => i !== index);
      return { ...prev, [fieldKey]: updated };
    });
  };

  const handleSubmit = () => {
    // 2. FIX SUBMIT LOGIC:
    // formData.employeeDependentInfo contains the FULL list (edited old items + new items).
    // We do NOT need to merge it with `currentDependents` again, and we must NOT spread it into an object.
    
    const finalDependentList = formData.employeeDependentInfo || [];

    const payload = {
      id: application.id,
      // Simply stringify the final array. 
      // This results in "[{...}, {...}]" instead of "{0:{...}, 1:{...}}"
      employeeDependentInfo: JSON.stringify(finalDependentList).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") 
    };

    // Dispatch Action
    dispatch(updateApplication(payload, "update dependent info"));

    // Close & Reset
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <FormattedMessage id="workforce.application.steps.dependentAdd" defaultMessage="Add New Dependent" />
      </DialogTitle>
      <DialogContent>
        <Box mt={0} ref={stepRef}>
          <EmployeeDependentForm
            applicationType={formData.applicationType}
            dependents={formData.workforceEmployeeDependentApplication} // Pass the Array directly
            handleChange={(index, key, value) =>
              handleArrayFieldChange("employeeDependentInfo", index, key, value)
            }
            addItem={() =>
              addArrayFieldItem("employeeDependentInfo", { fullName: "", relationship: "" })
            }
            removeItem={(index) => removeArrayFieldItem("employeeDependentInfo", index)}
            expanded={expanded}
            setExpanded={setExpanded}
            formdata={formData}
            errors={errors}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          <FormattedMessage id="workforce.cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          <FormattedMessage id="workforce.save" defaultMessage="Save" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDependentModal;