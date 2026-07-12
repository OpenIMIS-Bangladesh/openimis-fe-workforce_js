import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, makeStyles } from "@material-ui/core";
import { FormattedMessage, useModulesManager, useTranslations } from "@openimis/fe-core";
import { useDispatch, useSelector } from "react-redux";
import { createWorkforceDocument, fetchEmployeeDependent, setUploadedFiles, updateApplication } from "../../../actions";
import EmployeeDependentForm from "../../../pages/application/EmployeeDependentForm";
import EmployeeDeathAccountInfoForm from "../../../pages/application/EmployeeDeathAccountInfoForm";
import { getRelationForApi, isCfPath, isBlwfPath, safeDecodeId, validateRequiredFields } from "../../../utils/utils";
import CustomSnackbar from "../CustomSnackbar";

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
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations("workforce");
  const stepRef = useRef(null);
  console.log({ addDependentModal: application });
  // 0 = Dependents, 1 = Bank Info
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded] = useState(0);
  const [errors, setErrors] = useState({});
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [dependentErr, setDependentErr] = useState(false);
  const uploadDependentFile = useSelector((state) => state.workforce.uploadDependentFile);
  const uploadBankFile = useSelector((state) => state.workforce.uploadBankFile);

  const [formData, setFormData] = useState(() => {
    const fullyParsedDependentInfo = application?.workforceEmployeeDependentApplication?.map((dep) => {
      const parseAttachments = JSON.parse(dep?.attachments);
      return { ...dep, attachments: parseAttachments };
    });

    // Map over employeeBankInfo (the main DB table with bank/branch details)
    const fullyParsedBankInfo = application?.employeeBankInfo?.map((bank) => {
      
      // Match using the Account Number instead of NID!
      const matched = application?.employeeBankingInfoApplication?.find(
        (appBank) => String(appBank?.dependentNid) === String(bank?.dependentNid)
      );

      // Safely grab attachments from the matched object
      const rawAttachments = matched?.attachments || bank?.attachments;

      let parsedAttachments = [];
      if (rawAttachments) {
        parsedAttachments = typeof rawAttachments === "string" 
            ? JSON.parse(rawAttachments) 
            : rawAttachments;
      }

      return {
        ...bank,
        accountNumber: bank?.accountNumber, // Standardize key for the UI
        attachments: parsedAttachments,
      };
    });

    return {
      ...application,
      employeeDependentInfo: fullyParsedDependentInfo,
      employeeBankInfo: fullyParsedBankInfo,
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

  const formatPayloadJson = (data) => JSON.stringify(data).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}");

  const handleSaveDependents = async () => {
    const newErrors = validateRequiredFields(stepRef, formatMessage, formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShowErrorSnackbar(true);
      return; // Stop execution
    } else {
      setShowErrorSnackbar(false);
    }

    let workerBirthDate = formData?.deceasedWorkerInfo?.birthDate || formData?.workforceEmployee?.birthDate;
    const currentDependents = formData?.employeeDependentInfo || [{}];

    const validDependents = currentDependents?.filter((dep) => {
      return getRelationForApi(dep, workerBirthDate);
    });

    if (validDependents?.length !== currentDependents?.length) {
      setDependentErr(true);
      return;
    }

    const finalDependentList = formData.employeeDependentInfo || [];
    const payload = {
      id: application.id,
      employeeDependentInfo: formatPayloadJson(finalDependentList),
    };

    if (uploadDependentFile) {
      await Promise.all(
        uploadDependentFile.map((file) => {
          return dispatch(
            createWorkforceDocument({ ...file, status: "verified", workforceApplicationId: safeDecodeId(application?.id) }, `Created workforce document`),
          );
        })
      );
    }

    dispatch(updateApplication(payload, "update dependent info")).then((res) => {
      // 1. Wait for the fresh dependents to be fetched into Redux
      dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${safeDecodeId(application?.id)}"`])).then(() => {
        
        // 2. Extract all valid NIDs from the CURRENT dependent list
        const activeNids = finalDependentList.map((dep) => String(dep.nid));

        // 3. Filter out any bank info where the dependentNid no longer exists
        setFormData((prev) => {
          const cleansedBankInfo = (prev.employeeBankInfo || []).filter((bank) => {
            if (bank?.dependentNid) {
              return activeNids.includes(String(bank.dependentNid));
            }
            return true; // Keep it if it doesn't have a dependentNid (e.g., 'self' account)
          });

          return { ...prev, employeeBankInfo: cleansedBankInfo };
        });

        // 4. Move to next step only after state is perfectly clean
        setActiveStep(1);
        setExpanded(0);
      });
    });
  };

  const handleSaveBankInfo = async () => {
    if (uploadBankFile) {
      await uploadBankFile.map((file) => {
        return dispatch(
          createWorkforceDocument({ ...file, status: "verified", workforceApplicationId: safeDecodeId(application?.id) }, `Created workforce document`),
        );
      });
    }
    const finalBankList = formData.employeeBankInfo || [];
    const payload = {
      id: application.id,
      employeeBankInfo: formatPayloadJson(finalBankList),
    };

    dispatch(updateApplication(payload, "update bank info")).then((res) => {
      onClose();
    });
    // 2. Close Modal
    // onClose();
  };

  // --- Navigation: Back Button ---
  const handleBack = () => {
    setActiveStep(0);
    setExpanded(0);
  };

  useEffect(() => {
    const prefillReduxFiles = (dataArray) => {
      dataArray?.forEach((item) => {
        // Handle both parsed array (from stringified JSON) and direct array
        const attachments = typeof item?.attachments === "string" ? JSON.parse(item.attachments) : item?.attachments;

        attachments?.forEach((att) => {
          if (att?.files?.length > 0 && att?.fieldKey) {
            // Use the fieldKey exactly as it comes from the DB
            dispatch(setUploadedFiles(att.fieldKey, att.files));
          }
        });
      });
    };

    if (formData?.employeeDependentInfo?.length) {
      prefillReduxFiles(formData.employeeDependentInfo);
    }

    if (formData?.employeeBankInfo?.length) {
      prefillReduxFiles(formData.employeeBankInfo);
    }
  }, [dispatch]); // Removed formData from dependency to avoid infinite loops, runs once on mount
  console.log({ tazwer: formData });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {activeStep === 0 ? (
              isCfPath() || isBlwfPath() ? (
                <FormattedMessage id="workforce.application.steps.warishAdd" defaultMessage="Add Nominee" />
              ) : (
                <FormattedMessage id="workforce.application.steps.dependentAdd" defaultMessage="Add New Dependent" />
              )
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
                addItem={() =>
                  addArrayFieldItem("employeeDependentInfo", {
                    fullName: "",
                    relationship: "",
                    isDisabled: "no",
                  })
                }
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
      <CustomSnackbar
        open={showErrorSnackbar} // Use the new state
        onClose={() => setShowErrorSnackbar(false)} // Allow it to close
        type="error"
        message={<FormattedMessage id="core.error.generel" module="workforce" />}
        duration={4000}
      />
      <CustomSnackbar
        open={dependentErr}
        onClose={() => setDependentErr(false)}
        type="error"
        message={<FormattedMessage id={"core.error.inEligible.dependent"} />}
        duration={5000}
      />
    </>
  );
};

export default AddDependentModal;
