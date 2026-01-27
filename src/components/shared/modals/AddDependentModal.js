import React, { useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, makeStyles } from "@material-ui/core";
import { FormattedMessage,useModulesManager } from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import { fetchEmployeeDependent, updateApplication } from "../../../actions";
import EmployeeDependentForm from "../../../pages/application/EmployeeDependentForm";
import EmployeeDeathAccountInfoForm from "../../../pages/application/EmployeeDeathAccountInfoForm"; 
import { safeDecodeId } from "../../../utils/utils";

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
  const modulesManager = useModulesManager()
  const dispatch = useDispatch();
  const stepRef = useRef(null);

  // 0 = Dependents, 1 = Bank Info
  const [activeStep, setActiveStep] = useState(0); 
  const [expanded, setExpanded] = useState(0);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(() => {
    return {
      ...application,
      employeeDependentInfo: application?.workforceEmployeeDependentApplication,
      employeeBankInfo: application?.employeeBankingInfoApplication,
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

  const formatPayloadJson = (data) => 
    JSON.stringify(data).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}");

  const handleSaveDependents = () => {
    const finalDependentList = formData.employeeDependentInfo || [];
    const payload = {
      id: application.id,
      employeeDependentInfo: formatPayloadJson(finalDependentList),
    };
    // 1. Call Mutation
    dispatch(updateApplication(payload, "update dependent info")).then((res)=>{
      dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${safeDecodeId(application?.id)}"`])).then((res) =>
              console.log("from account dependent", res)
            );
    })
    // 2. Move to Next Step
    setActiveStep(1);
    setExpanded(0); 
  };

  const handleSaveBankInfo = () => {
    const finalBankList = formData.employeeBankInfo || [];
    const payload = {
      id: application.id,
      employeeBankInfo: formatPayloadJson(finalBankList),
    };

    dispatch(updateApplication(payload, "update bank info")).then((res)=>onClose())
    // 2. Close Modal
    // onClose();
  };

  // --- Navigation: Back Button ---
  const handleBack = () => {
    setActiveStep(0);
    setExpanded(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {activeStep === 0 ? (
          <FormattedMessage id="workforce.application.steps.dependentAdd" defaultMessage="Add New Dependent" />
        ) : (
          <FormattedMessage id="workforce.application.steps.bankInfo" defaultMessage="Bank Account Info" />
        )}
      </DialogTitle>
      
      <DialogContent>
        <Box mt={0} ref={stepRef}>
          
          {/* STEP 1: DEPENDENT FORM */}
          {activeStep === 0 && (
            <EmployeeDependentForm
              applicationType={formData.applicationType}
              dependents={formData?.employeeDependentInfo}
              handleChange={(index, key, value) => handleArrayFieldChange("employeeDependentInfo", index, key, value)}
              addItem={() => addArrayFieldItem("employeeDependentInfo", { 
                  fullName: "", 
                  relationship: "", 
                  isDisabled: "no" 
              })}
              removeItem={(index) => removeArrayFieldItem("employeeDependentInfo", index)}
              expanded={expanded}
              setExpanded={setExpanded}
              formdata={formData}
              errors={errors}
            />
          )}

          {/* STEP 2: BANK INFO FORM */}
          {activeStep === 1 && (
            <EmployeeDeathAccountInfoForm
              formdata={formData}
              accounts={formData.employeeBankInfo}
              handleChange={(index, key, value) => handleArrayFieldChange("employeeBankInfo", index, key, value)}
              addItem={() =>
                addArrayFieldItem("employeeBankInfo", {
                  accountHolderName: "",
                  bankName: "",
                  accountNumber: "",
                  branchName: "",
                })
              }
              removeItem={(index) => removeArrayFieldItem("employeeBankInfo", index)}
              expanded={expanded}
              setExpanded={setExpanded}
              applicationId={application?.id}
              errors={errors}
            />
          )}

        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          <FormattedMessage id="workforce.cancel" defaultMessage="Cancel" />
        </Button>

        {/* BUTTON LOGIC */}
        {activeStep === 0 ? (
          // STEP 1: Calls handleSaveDependents (Mutation + Next)
          <Button onClick={handleSaveDependents} color="primary" variant="contained">
            <FormattedMessage id="workforce.next" defaultMessage="Next" />
          </Button>
        ) : (
          // STEP 2: Calls handleSaveBankInfo (Mutation + Close)
          <>
            <Button onClick={handleBack} color="primary" variant="outlined">
              <FormattedMessage id="workforce.back" defaultMessage="Back" />
            </Button>
            <Button onClick={handleSaveBankInfo} color="primary" variant="contained">
              <FormattedMessage id="workforce.save" defaultMessage="Save" />
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddDependentModal;