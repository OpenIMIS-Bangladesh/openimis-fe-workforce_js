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
import { validateRequiredFields, getUserType } from "../../utils/utils";
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
    // Remove background/shadows when printing
    "@media print": {
      boxShadow: "none",
      background: "none",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  content: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    marginBottom: theme.spacing(2),
    paddingRight: theme.spacing(1),
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  "@global": {
    "@media print": {
      // 1. Reset Body/HTML to allow full scrolling
      "html, body": {
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "visible !important",
      },
      // 2. Hide EVERYTHING by default
      "body *": {
        visibility: "hidden",
      },
      // 3. Hide the Modal Backdrop specifically (grey overlay)
      ".MuiBackdrop-root": {
        display: "none !important",
      },
      // 4. Style the specific printable area
      "#printable-content": {
        visibility: "visible !important",
        // FIXED position breaks it out of the Modal's Flexbox/Scroll container
        position: "fixed !important", 
        left: 0,
        top: 0,
        width: "100vw !important",
        height: "auto !important",
        margin: 0,
        padding: "20px",
        zIndex: 99999, // Ensure it is on top
        backgroundColor: "white",
        overflow: "visible !important", // CRITICAL: Allows content to expand
        display: "block !important",
      },
      // 5. Ensure all children of the printable area are visible
      "#printable-content *": {
        visibility: "visible !important",
        overflow: "visible !important",
      },
      // 6. Hide scrollbars to prevent ugly print lines
      "::-webkit-scrollbar": {
        display: "none",
      },
    },
  },
}));

const EisFactoryAdminModal = ({ open, onClose, application, showActions = true, maxWidth }) => {
  const classes = useStyles({ maxWidth });
  const [formData, setFormData] = useState(application || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(false);

  const { formatMessage } = useTranslations("workforce");
  const uploadFile = useSelector((state) => state.workforce.uploadFile);
  const dispatch = useDispatch();
  const stepRef = useRef(null);
  const user_type = getUserType();

  // 1. Identify if the current user is a Doctor (Reused logic)
  const isDoctor =
    application?.organizationType === "eis" &&
    (user_type === WORKFORCE_USER_TYPE.DOCTOR ||
      user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR ||
      user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR ||
      (user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR && application?.applicationType === "disabilityAssistance"));

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
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // 3. Date Validation (Only for Factory Admin)
    if (!isDoctor) {
      const allAssociationDate = new Date(formData?.employeeFactory?.allAssociation?.startDate);
      const accidentDate = new Date(formData?.employeeAccidentInfo?.accidentDate);

      if (allAssociationDate > accidentDate) {
        setAlertMessage(true);
        return; // Stop execution
      }
    }

    // 4. Unified Submission Logic
    setLoading(true);
    try {
      if (uploadFile && uploadFile.length > 0) {
        const uploadPromises = uploadFile.map((file) =>
          dispatch(createWorkforceDocument({ ...file, workforceApplicationId: application?.id }, `Created workforce document`))
        );
        await Promise.all(uploadPromises);
      }

      const updateApplicationData = {
        id: application?.id,
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
        doctorEntries: JSON.stringify(formData?.doctorEntries),
      };

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
        <Box className={classes.paper}>
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
          {isDoctor ? (
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
    </>
  );
};

export default EisFactoryAdminModal;