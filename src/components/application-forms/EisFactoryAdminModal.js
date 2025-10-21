import React, { useRef, useState } from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import EmployeeAccidentInfoForm from "../../pages/application/EmployeeAccidentInfoForm";
import { useSelector, useDispatch } from "react-redux";
import { updateApplication } from "../../actions";
import { validateRequiredFields } from "../../utils/utils";
import { useModulesManager, formatMutation, decodeId, FormattedMessage,useTranslations } from "@openimis/fe-core";


const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // ✅ prevent global modal scrollbars
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    width: "90vw", // ✅ responsive width instead of fixed pixel
    maxWidth: (props) => props.maxWidth || 850,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    outline: "none",
    overflow: "hidden", // ✅ ensure horizontal overflow is hidden
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  content: {
    flex: 1,
    overflowY: "auto", // ✅ only vertical scroll
    overflowX: "hidden", // ✅ hide horizontal scroll
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
}));


const EisFactoryAdminModal = ({
  open,
  onClose,
  title,
  application,
  onSubmit, // ✅ Function to trigger on submit
  confirmText = "Submit", // ✅ Label for submit
  cancelText = "Cancel",
  maxWidth,
  showActions = true,
}) => {
  const classes = useStyles({ maxWidth });
  const [formData, setFormData] = useState(application || {});
  const [errors,setErrors] = useState()
  const { formatMessage } = useTranslations("workforce");
  const dispatch = useDispatch()
  const stepRef =useRef(null)

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

  const handleSubmit = () => {
    const newErrors = validateRequiredFields(stepRef, formatMessage);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0 ){
      const updateApplicationData = {
              id: application?.id,
              // ...application,
              employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
            };
            console.log({ updateApplicationData });
            dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`))
            .then(()=>{
              window.location.reload()
            })
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={classes.modal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >

        <Box className={classes.paper}>
          {/* Header */}
          <div className={classes.header}>
            <Typography variant="h6" style={{textAlign:"center",fontWeight:"bold"}}>{<FormattedMessage id="workforce.eis.factory.admin.accidentInfo.button" module="workforce" />}</Typography>
            {/* Top-right close icon */}
            <IconButton onClick={onClose} size="small" style={{color:'black'}}>
              <CloseIcon />
            </IconButton>
          </div>
          <Divider />

          {/* Scrollable Form Content */}
          <Box className={classes.content} ref={stepRef}>
            <EmployeeAccidentInfoForm
              handleChange={(key, value) =>
                handleChange(key, value, "employeeAccidentInfo")
              }
              formData={formData}
              setFormData={setFormData}
              applicationType="disabilityAssistance"
              errors={errors}
            />
          </Box>

          {/* Footer Actions */}
          {showActions && (
            <div className={classes.actions}>
              <Button onClick={onClose} variant="outlined">
                {cancelText}
              </Button>
              <Button
                onClick={handleSubmit}
                color="primary"
                variant="contained"
              >
                {confirmText}
              </Button>
            </div>
          )}
        </Box>
    </Modal>
  );
};

export default EisFactoryAdminModal;
