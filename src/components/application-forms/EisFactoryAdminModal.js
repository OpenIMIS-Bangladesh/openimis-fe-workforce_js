import React, { useRef, useState } from "react";
import {
  Modal,
  Backdrop,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  CircularProgress, // Import Loader
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import EmployeeAccidentInfoForm from "../../pages/application/EmployeeAccidentInfoForm";
import { useSelector, useDispatch } from "react-redux";
import { createWorkforceDocument, updateApplication } from "../../actions";
import { validateRequiredFields } from "../../utils/utils";
import { FormattedMessage, useTranslations } from "@openimis/fe-core";
import FactoryAdminAccidentForm from "../../pages/application/FactoryAdminAccidentForm";
import EisDoctorEntries from "../../pages/application/EisDoctorEntries";
import { testWorkforcePayment } from "../../actions";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserType } from "../../utils/utils";

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
    position: "relative", // Needed for absolute positioning of loader
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
}));

const EisFactoryAdminModal = ({ open, onClose, application, showActions = true, maxWidth }) => {
  const classes = useStyles({ maxWidth });
  const [formData, setFormData] = useState(application || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // ✅ Added Loading State

  const { formatMessage } = useTranslations("workforce");
  const uploadFile = useSelector((state) => state.workforce.uploadFile);
  const dispatch = useDispatch();
  const stepRef = useRef(null);
  const user_type = getUserType();

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
    // 1. Validate Fields
    const newErrors = validateRequiredFields(stepRef, formatMessage);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // Stop if there are validation errors
    }
    setLoading(true); // ✅ Start Loading
    try {
      // 2. Upload Files Concurrently (Wait for all to finish)
      if (uploadFile && uploadFile.length > 0) {
        const uploadPromises = uploadFile.map((file) =>
          dispatch(createWorkforceDocument({ ...file, workforceApplicationId: application?.id }, `Created workforce document`))
        );
        await Promise.all(uploadPromises);
      }

      // 3. Prepare Update Data
      const updateApplicationData = {
        id: application?.id,
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
        doctorEntries: JSON.stringify(formData?.doctorEntries),
      };

      console.log({ updateApplicationData });
      const testPaymentData = {
        id: application?.id,
      };

      // 4. Update Application (Wait for completion)
      await dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));

      await dispatch(testWorkforcePayment(testPaymentData, "create test payment")).then(() => {
        // 5. Success & Reload
        window.location.reload();
      });
    } catch (error) {
      console.error("Submission failed:", error);
      setLoading(false); // ✅ Stop loading only on error (on success page reloads)
      // You might want to show a snackbar/toast error here
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? null : onClose} // Prevent closing while loading
      className={classes.modal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Box className={classes.paper}>
        {/* ✅ Loading Overlay */}
        {loading && (
          <div className={classes.loaderOverlay}>
            <CircularProgress />
            <Typography variant="body2" style={{ marginTop: 10 }}>
              <FormattedMessage id="workforce.processing" defaultMessage="Processing..." />
            </Typography>
          </div>
        )}

        {/* Header */}
        <div className={classes.header}>
          <Typography variant="h6" style={{ textAlign: "center", fontWeight: "bold" }}>
            <FormattedMessage id="workforce.eis.factory.admin.accidentInfo.button" module="workforce" />
          </Typography>
          <IconButton onClick={onClose} size="small" style={{ color: "black" }} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />

        {/* Scrollable Form Content */}
        {application?.organizationType === "eis" &&
        (user_type === WORKFORCE_USER_TYPE.DOCTOR || user_type === WORKFORCE_USER_TYPE.BLWF_DOCTOR || user_type === WORKFORCE_USER_TYPE.EIS_DOCTOR) ? (
          <Box className={classes.content} ref={stepRef}>
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

        {/* Footer Actions */}
        {showActions && (
          <div className={classes.actions}>
            <Button onClick={onClose} variant="outlined" disabled={loading}>
              <FormattedMessage id="workforce.confirm.modal.cancel" />
            </Button>
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={loading} // ✅ Disable button while loading
            >
              <FormattedMessage id="workforce.submit" />
            </Button>
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default EisFactoryAdminModal;
