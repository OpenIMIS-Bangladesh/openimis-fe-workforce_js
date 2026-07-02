import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Grid,
  IconButton,
  Typography,
  makeStyles,
  MenuItem,
  Paper,
  Fade,
  Backdrop,
  TextField,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import CloseIcon from "@material-ui/icons/Close";
import { TextInput, PublishedComponent, FormattedMessage, useModulesManager, parseData, useTranslations } from "@openimis/fe-core";
import { getUserType, safeDecodeId, validateRequiredFields } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { createWorkforceOtherCompensation, fetchWorkforceOtherCompensation, updateWorkforceOtherCompensation } from "../../actions";
import CustomSnackbar from "../shared/CustomSnackbar";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPaper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(0),
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    height: "70vh",
    display: "flex",
    flexDirection: "column",
    outline: "none",
    borderRadius: theme.shape.borderRadius,
  },
  modalHeader: {
    padding: theme.spacing(2, 3),
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalBody: {
    padding: theme.spacing(3),
    overflowY: "auto",
    flex: 1,
  },
  modalFooter: {
    padding: theme.spacing(2),
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
  entryBox: {
    backgroundColor: "#f9f9f9",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
    border: "1px solid #e0e0e0",
    position: "relative",
  },
  deleteBtn: {
    position: "absolute",
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
    color: theme.palette.error.main,
  },
  sectionHeader: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
}));

const initialEntry = {
  id: null, // Track ID for updates
  receivedFrom: "",
  dateOfCompensation: null,
  amount: "",
  paymentStatus: "",
  eisBenefitAdjustment: "",
  remarks: "",
};

const CompensationFormModal = ({ application, open, onClose, onSubmit, entryType = "factory" }) => {
  const classes = useStyles();
  const { formatMessage } = useTranslations("workforce");
  const formRef = useRef(null);
  const [formData, setFormData] = useState([initialEntry]);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const user_type = getUserType();

  useEffect(() => {
    // Only fetch if modal is open and we have an application ID
    setLoader(true);
    if (open && application?.id) {
      dispatch(fetchWorkforceOtherCompensation(modulesManager, [`workforceApplicationId:"${application?.id}"`]))
        .then((res) => {
          const fetchOtherCompensation = parseData(res?.payload?.data?.workforceOtherCompensationInfo);
          console.log(fetchOtherCompensation);
          const formattedData = fetchOtherCompensation.map((item) => ({
            ...item,
            amount: item.amount !== null && item.amount !== undefined ? Number(item.amount).toFixed(2) : "",
          }));
          if (fetchOtherCompensation && fetchOtherCompensation.length > 0) {
            setFormData(formattedData);
          } else {
            // If empty array or null, reset to initial entry
            setFormData([{ ...initialEntry }]);
          }
        })
        .catch((err) => {
          console.error("Error fetching compensation:", err);
          setFormData([{ ...initialEntry }]);
        })
        .finally(() => {
          setLoader(false);
        });
    } else if (open) {
      // If opening without an ID (new application context), reset form
      setFormData([{ ...initialEntry }]);
    }
  }, [open, application?.id, dispatch, modulesManager]); // Added proper dependencies

  const handleChange = (index, key) => (eventOrValue) => {
    let value = eventOrValue;
    if (eventOrValue && eventOrValue.target) {
      value = eventOrValue.target.value;
    }
    setFormData((prev) => {
      const newArray = [...prev];
      newArray[index] = { ...newArray[index], [key]: value };
      return newArray;
    });
  };

  const handleAddEntry = () => {
    setFormData([...formData, { ...initialEntry }]);
  };

  const handleRemoveEntry = (index) => {
    const values = [...formData];
    // If deleting an item that exists in DB (has ID), you might need a delete API call here.
    // For now, we just remove it from the UI list.
    if (values.length > 1) {
      values.splice(index, 1);
      setFormData(values);
    }
  };

  const handleFormSubmit = () => {
    const validationErrors = validateRequiredFields(formRef, formatMessage, formData);
    if (user_type === WORKFORCE_USER_TYPE.EIS_OFFICER) {
      formData?.forEach((item, index) => {
        const isSelected =
          item.eisBenefitAdjustment === true ||
          item.eisBenefitAdjustment === false ||
          item.isEisBenefitAdjustmentEligible === true ||
          item.isEisBenefitAdjustmentEligible === false;

        if (!isSelected) {
          // Track the error using a dynamic key unique to this row item
          validationErrors[`eisBenefitAdjustment-${index}`] = formatMessage("core.error.required");
        }
      });
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // Save to state if you want to display them
      setShowErrorSnackbar(true);
      console.error("Validation failed:", validationErrors);
      return; // STOP SUBMISSION HERE
    }

    // Clear previous errors if validation passes
    setErrors({});
    formData?.forEach((item) => {
      const payload = {
        workforceApplicationId: safeDecodeId(application?.id),
        entryBy: user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? "factory" : "officer",
        dateOfCompensation: item.dateOfCompensation,
        amount: item.amount,
        receivedFromOrganization: item?.receivedFrom,
        statusOfPayment: item.paymentStatus, // Map State -> API
        // Map String "Yes"/"No" -> Boolean
        isEisBenefitAdjustmentEligible: item.eisBenefitAdjustment ?? item.isEisBenefitAdjustmentEligible,
        remarks: item.remarks,
        // Optional: Map receivedFrom to paymentType if that's the intention
        // paymentType: item.receivedFrom
      };

      console.log("SENDING TO DATABASE:", payload);

      if (item.id) {
        // UPDATE: Include the ID in the payload for the update action
        const updatePayload = { ...payload, id: safeDecodeId(item.id) };
        console.log("Updating Payload:", updatePayload);
        dispatch(updateWorkforceOtherCompensation(updatePayload, "update other compensation info"));
      } else {
        // CREATE
        console.log("Creating Payload:", payload);
        dispatch(createWorkforceOtherCompensation(payload, "create other compensation info"));
      }
    });

    onClose();
  };

  const isOfficer = entryType === "officer";

  console.log({fahimFarooq:formData})

  if (loader) {
    return (
      <Modal
        className={classes.modal}
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Paper className={classes.modalPaper}>
            <div className={classes.modalHeader}>
              <Typography variant="h6">{isOfficer ? "Officer Compensation Entry" : "Factory Compensation Entry"}</Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </div>
            <Typography variant="h4">Loading ...</Typography>
          </Paper>
        </Fade>
      </Modal>
    );
  }

  return (
    <Modal
      className={classes.modal}
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Paper className={classes.modalPaper}>
          <div className={classes.modalHeader}>
            <Typography variant="h6">{isOfficer ? "Officer Compensation Entry" : "Factory Compensation Entry"}</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>

          <div className={classes.modalBody} ref={formRef}>
            {Array.isArray(formData) &&
              formData.map((entry, index) => (
                <div key={index} className={classes.entryBox}>
                  <Grid container justify="space-between" alignItems="center">
                    <Typography variant="subtitle1" className={classes.sectionHeader}>
                      Entry #{index + 1}
                    </Typography>
                    {formData.length > 1 && (
                      <IconButton size="small" className={classes.deleteBtn} onClick={() => handleRemoveEntry(index)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={"workforce.compensation.recievedFrom"}
                        fullWidth
                        value={entry.receivedFrom || entry?.receivedFromOrganization || " "}
                        onChange={handleChange(index, "receivedFrom")}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <PublishedComponent
                        pubRef="workforce.DatePicker"
                        label="workforce.compensation.date"
                        value={entry.dateOfCompensation}
                        onChange={handleChange(index, "dateOfCompensation")}
                        readOnly={false}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label="workforce.employee.application.moneyAmount"
                        type="number"
                        fullWidth
                        value={entry?.amount ?? ""}
                        // onBlur={() => {
                        //   if (entry?.amount !== "" && entry?.amount !== null && !isNaN(entry?.amount)) {
                        //     handleChange(index, "amount")(Number(entry?.amount).toFixed(2));
                        //   }
                        // }}
                        onChange={handleChange(index, "amount")}
                        inputProps={{ step: "0.01" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label={<FormattedMessage id="workforce.compensation.paymentStatus" defaultMessage="Status of Payment" />}
                        fullWidth
                        value={entry.paymentStatus || entry.statusOfPayment || ""}
                        onChange={handleChange(index, "paymentStatus")}
                      >
                        <MenuItem value="Paid">
                          <FormattedMessage id="workforce.paid" defaultMessage="Paid" />
                        </MenuItem>
                        <MenuItem value="unPaid">
                          <FormattedMessage id="workforce.unpaid" defaultMessage="Not paid yet" />
                        </MenuItem>
                      </TextField>
                    </Grid>

                    {(user_type === WORKFORCE_USER_TYPE.EIS_OFFICER||user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR) && (
                      <>
                        <Grid item xs={12}>
                          <FormControl component="fieldset" error={!!errors[`eisBenefitAdjustment-${index}`]}>
                            <FormLabel component="legend" required={user_type === WORKFORCE_USER_TYPE.EIS_OFFICER}>
                              <FormattedMessage id="workforce.compensation.eligible.ForEISAdjustment" />
                            </FormLabel>
                            <RadioGroup
                              row
                              // This logic ensures that if the DB sends true/false, the radio stays checked
                              value={
                                entry.eisBenefitAdjustment === true || entry.isEisBenefitAdjustmentEligible === "true"
                                  ? "true"
                                  : entry.eisBenefitAdjustment === false || entry.isEisBenefitAdjustmentEligible === "false"
                                    ? "false"
                                    : ""
                              }
                              onChange={(e) => {
                                // Convert the string "true"/"false" from the radio back into a real boolean immediately
                                const val = e.target.value === "true";
                                handleChange(index, "eisBenefitAdjustment")(val);

                                // Optional: Clear this field's error immediately when a user clicks an option
                                if (errors[`eisBenefitAdjustment-${index}`]) {
                                  setErrors((prev) => {
                                    const updated = { ...prev };
                                    delete updated[`eisBenefitAdjustment-${index}`];
                                    return updated;
                                  });
                                }
                              }}
                            >
                              <FormControlLabel value="true" control={<Radio color="primary" />} label="Yes" />
                              <FormControlLabel value="false" control={<Radio color="primary" />} label="No" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextInput label="workforce.compensation.remarks" fullWidth value={entry.remarks} onChange={handleChange(index, "remarks")} />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </div>
              ))}

            <Button startIcon={<AddCircleOutlineIcon />} color="primary" onClick={handleAddEntry} style={{ marginTop: "8px" }}>
              <FormattedMessage id="workforce.compensation.add" />
            </Button>
          </div>

          <div className={classes.modalFooter}>
            <Button onClick={onClose} color="secondary">
              <FormattedMessage id="workforce.confirm.modal.cancel" />
            </Button>
            <Button onClick={handleFormSubmit} color="primary" variant="contained">
              <FormattedMessage id="workforce.submit" />
            </Button>
          </div>
          <CustomSnackbar
            open={showErrorSnackbar} // Use the new state
            onClose={() => setShowErrorSnackbar(false)} // Allow it to close
            type="error"
            message={<FormattedMessage id="core.error.generel" module="workforce" />}
            duration={4000}
          />
        </Paper>
      </Fade>
    </Modal>
  );
};

export default CompensationFormModal;
