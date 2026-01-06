import React, { useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, makeStyles } from "@material-ui/core";
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

  const [formData, setFormData] = useState(() => {
    let parsedDependents = [];

    // Prioritize existing array, otherwise parse string
    if (Array.isArray(application?.workforceEmployeeDependentApplication)) {
      parsedDependents = application.workforceEmployeeDependentApplication;
    } else if (application?.employeeDependentInfo) {
      try {
        parsedDependents =
          typeof application.employeeDependentInfo === "string"
            ? JSON.parse(application.employeeDependentInfo)
            : application.employeeDependentInfo;
      } catch (error) {
        console.error("Error parsing dependents:", error);
        parsedDependents = [];
      }
    }

    if (!Array.isArray(parsedDependents)) parsedDependents = [];

    return {
      ...application,
      // FIX 1: Assign the parsed array to the key we will be editing
      employeeDependentInfo: parsedDependents, 
    };
  });

  const handleArrayFieldChange = (fieldKey, index, key, value) => {
    setFormData((prev) => {
      const items = prev[fieldKey] ? [...prev[fieldKey]] : [];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, [fieldKey]: items };
    });
  };

  const addArrayFieldItem = (fieldKey, defaultItem = {}) => {
    setFormData((prev) => {
      const items = prev[fieldKey] ? [...prev[fieldKey]] : [];
      const updated = [...items, defaultItem];
      // Auto-expand the new item
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
    const finalDependentList = formData.employeeDependentInfo || [];
    const payload = {
      id: application.id,
      employeeDependentInfo: JSON.stringify(finalDependentList).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
    };

    dispatch(updateApplication(payload, "update dependent info"));
    onClose();
  };
console.log("tazwer",application)
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <FormattedMessage id="workforce.application.steps.dependentAdd" defaultMessage="Add New Dependent" />
      </DialogTitle>
      <DialogContent>
        <Box mt={0} ref={stepRef}>
          <EmployeeDependentForm
            applicationType={formData.applicationType}
            // FIX 2: Point to the variable that is actually being updated (employeeDependentInfo)
            dependents={formData.employeeDependentInfo} 
            handleChange={(index, key, value) => handleArrayFieldChange("employeeDependentInfo", index, key, value)}
            // Ensure default values are provided so the form doesn't crash on render
            addItem={() => addArrayFieldItem("employeeDependentInfo", { 
                fullName: "", 
                relationship: "", 
                // Initialize boolean fields to avoid controlled/uncontrolled warnings
                isDisabled: "no" 
            })}
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