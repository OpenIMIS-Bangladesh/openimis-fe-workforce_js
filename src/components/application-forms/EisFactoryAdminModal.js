import React, { useRef, useState } from "react";
import {
  Modal,
  Backdrop,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { useSelector, useDispatch } from "react-redux";
import { createWorkforceDocument, updateApplication, testWorkforcePayment } from "../../actions";
import { validateRequiredFields, getUserType, validateMandatoryDocuments } from "../../utils/utils";
import { FormattedMessage, useTranslations } from "@openimis/fe-core";
import FactoryAdminAccidentForm from "../../pages/application/FactoryAdminAccidentForm";
import EisDoctorEntries from "../../pages/application/EisDoctorEntries";
import { WORKFORCE_USER_TYPE } from "../../constants";
import CustomSnackbar from "../shared/CustomSnackbar";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    width: "90vw",
    maxWidth: (props) => props.maxWidth || 850,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    outline: "none",
    overflow: "hidden",
    position: "relative",
    // 1. Let the paper flow downwards freely
    "@media print": {
      display: "block !important",
      position: "static !important", 
      width: "100% !important",
      maxWidth: "100% !important",
      height: "auto !important",
      maxHeight: "none !important",
      overflow: "visible !important",
      boxShadow: "none !important",
      background: "white !important",
      margin: "0 !important",
      padding: "20px !important", 
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    "@media print": { display: "none !important" },
  },
  content: {
    flex: 1,
    overflowY: "auto", 
    overflowX: "hidden",
    marginBottom: theme.spacing(2),
    paddingRight: theme.spacing(1),
    boxSizing: "border-box",
    // 2. Remove scrolling constraints so it can overflow onto Page 2
    "@media print": {
      overflow: "visible !important",
      height: "auto !important",
      maxHeight: "none !important",
      display: "block !important",
    },
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    "@media print": { display: "none !important" },
  },
  loaderOverlay: {
    /* keep your existing loaderOverlay styles */
  },
  "@global": {
    "@media print": {
      "html, body": {
        height: "auto !important",
        minHeight: "100% !important",
        overflow: "visible !important",
        backgroundColor: "white !important",
      },
      // 3. Hide the background application safely
      // MUI Modals get appended to the body with role="presentation"
      "body > *:not([role='presentation'])": {
        display: "none !important",
      },
      // 4. Kill the Flexbox centering and Fixed positioning on the Modal wrapper!
      "body > [role='presentation'], .MuiModal-root": {
        display: "block !important",   // Kills the flex centering (fixes the top gap)
        position: "static !important", // Kills fixed position (fixes the pagination issue)
        height: "auto !important",
        overflow: "visible !important",
        inset: "auto !important",
      },
      // Ensure intermediate wrappers flow properly
      "body > [role='presentation'] > div": {
        display: "block !important",
        position: "static !important",
        height: "auto !important",
        overflow: "visible !important",
      },
      ".MuiBackdrop-root": {
        display: "none !important",
      },
    },
  },
}));

const EisFactoryAdminModal = ({ open, onClose, application, showActions = true, maxWidth,viewType }) => {
  const classes = useStyles({ maxWidth });
  const [formData, setFormData] = useState(application || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(false);
  const [deathAlertMessage, setDeathAlertMessage] = useState(false);
  const [accidentDateAlertMessage, setAccidentDateAlertMessage] = useState(false);

  const { formatMessage } = useTranslations("workforce");
  const documentType = useSelector((state) => state.workforce.documentType);
  const uploadFile = useSelector((state) => state.workforce.uploadFile);
  const dispatch = useDispatch();
  const stepRef = useRef(null);
  const user_type = getUserType();

  // 1. Identify if the current user is a Doctor (Reused logic)
  const isDoctor =
    application?.organizationType === "eis" &&
    (user_type === WORKFORCE_USER_TYPE.DOCTOR ||
      user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR ||
      user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR);

  const renderDoctorEntries = viewType === "doctorEntries" || isDoctor;

  const handleChange = (key, value, parent = null) => {
    setFormData((prev) => {
      if (parent) {
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [key]: value,
          },
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSubmit = async () => {
    // 2. Validate Required Fields
    const newErrors = validateRequiredFields(stepRef, formatMessage,formData);
    delete newErrors.documents;
    let documentValidation = validateMandatoryDocuments(documentType, uploadFile);
    if (!documentValidation?.isValid) {
      newErrors.documents = documentValidation?.errors
    }
    setErrors(newErrors);
    console.log({newErrors})
    console.log({documentValidation})
    if (Object.keys(newErrors).length > 0) return;

    // 3. Date Validation (Only for Factory Admin)
    if (!isDoctor) {
      const allAssociationDate = new Date(formData?.employeeFactory?.allAssociation?.startDate);
      const accidentDate = new Date(formData?.employeeAccidentInfo?.accidentDate);
      const deathDate = new Date(formData?.employeeAccidentInfo?.dateOfDeath);
      const joiningDate = new Date(formData?.employeeAccidentInfo?.joiningDate);

      if (allAssociationDate > accidentDate) {
        setAlertMessage(true);
        return; // Stop execution
      }

      if (accidentDate>deathDate) {
        setDeathAlertMessage(true)
        return
      }

      if (joiningDate>accidentDate) {
        setAccidentDateAlertMessage(true)
        return
      }
    }

    // 4. Unified Submission Logic
    setLoading(true);
    try {
      if (uploadFile && uploadFile.length > 0) {
        const uploadPromises = uploadFile.map((file) =>
          dispatch(createWorkforceDocument({ ...file,status:"verified", workforceApplicationId: application?.id }, `Created workforce document`))
        );
        await Promise.all(uploadPromises);
      }

      const updateApplicationData = {
        id: application?.id,
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
        doctorEntries: JSON.stringify(formData?.doctorEntries),
      };
      console.log({updateApplicationData})
      await dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
      await dispatch(testWorkforcePayment({ id: application?.id }, "create test payment"));
      
      window.location.reload();
    } catch (error) {
      console.error("Submission failed:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={loading ? null : onClose}
        className={classes.modal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 300 }}
      >    
        <Box className={classes.paper} id="print-paper">
          {loading && (
            <div className={classes.loaderOverlay}>
              <CircularProgress />
              <Typography variant="body2" style={{ marginTop: 10 }}>
                <FormattedMessage id="workforce.processing" defaultMessage="Processing..." />
              </Typography>
            </div>
          )}

          <div className={classes.header}>
            <Typography variant="h6" style={{ textAlign: "center", fontWeight: "bold" }}>
              <FormattedMessage id="workforce.eis.factory.admin.accidentInfo.button" module="workforce" />
            </Typography>
            <IconButton onClick={onClose} size="small" style={{ color: "black" }} disabled={loading}>
              <CloseIcon />
            </IconButton>
          </div>
          <Divider />

          {/* Render based on isDoctor flag */}
          {renderDoctorEntries ? (
            <Box className={classes.content} ref={stepRef} id="printable-content">
              <EisDoctorEntries
                handleChange={(key, value) => handleChange(key, value, "doctorEntries")}
                formData={formData}
                setFormData={setFormData}
                applicationType="disabilityAssistance"
                errors={errors}
              />
            </Box>
          ) : (
            <Box className={classes.content} ref={stepRef}>
              <FactoryAdminAccidentForm
                handleChange={(key, value) => handleChange(key, value, "employeeAccidentInfo")}
                formData={formData}
                setFormData={setFormData}
                applicationType={formData?.applicationType}
                errors={errors}
              />
            </Box>
          )}

          {showActions && (
            <div className={classes.actions}>
              <Button onClick={onClose} variant="outlined" disabled={loading}>
                <FormattedMessage id="workforce.confirm.modal.cancel" />
              </Button>
              <Button
                onClick={handleSubmit}
                color="primary"
                variant="contained"
                disabled={loading || user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR}
              >
                <FormattedMessage id="workforce.submit" />
              </Button>
              {user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR && (
                <Button onClick={()=>window.print()} variant="outlined" disabled={loading}>
                <FormattedMessage id="workforce.modal.print" />
              </Button>
              )}
            </div>
          )}
        </Box>
      </Modal>
      <CustomSnackbar
        open={alertMessage}
        onClose={() => setAlertMessage(false)}
        type="error"
        message={<FormattedMessage id="workforce.application.before.association.startDate.error" module="workforce" />}
      />
      <CustomSnackbar
        open={deathAlertMessage}
        onClose={() => setDeathAlertMessage(false)}
        type="error"
        message={<FormattedMessage id="workforce.application.before.deathDate.error" module="workforce" />}
      />
      <CustomSnackbar
        open={accidentDateAlertMessage}
        onClose={() => setAccidentDateAlertMessage(false)}
        type="error"
        message={<FormattedMessage id="workforce.application.before.joiningDate.error" module="workforce" />}
      />
    </>
  );
};

export default EisFactoryAdminModal;