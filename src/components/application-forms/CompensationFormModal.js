import React, { useState, useEffect } from "react";
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
  TextField // Imported standard MUI TextField
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import CloseIcon from "@material-ui/icons/Close";
import { TextInput, PublishedComponent, FormattedMessage,useModulesManager } from "@openimis/fe-core";
import { getUserType } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { createWorkforceOtherCompensation, fetchWorkforceOtherCompensation, updateWorkforceOtherCompensation } from "../../actions";


const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPaper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(0),
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
    borderRadius: theme.shape.borderRadius,
  },
  modalHeader: {
    padding: theme.spacing(2, 3),
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    padding: theme.spacing(3),
    overflowY: 'auto',
    flex: 1,
  },
  modalFooter: {
    padding: theme.spacing(2),
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
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
  receivedFrom: "",
  dateOfCompensation: null,
  amount: "",
  paymentStatus: "",
  eisBenefitAdjustment: "",
  remarks: "",
};

const CompensationFormModal = ({ application,open, onClose, onSubmit, entryType = "factory" }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState([initialEntry]);
  const dispatch = useDispatch()
  const modulesManager= useModulesManager()
  const user_type= getUserType()

  useEffect(() => {
    if (application?.id) {
        return dispatch(fetchWorkforceOtherCompensation(modulesManager, [`workforceApplicationId:"${application?.id}"`]))
                .then(res =>console.log(res))
    }
    if (open) {
      setFormData([{ ...initialEntry }]);
    }
  }, [open, entryType]);

  const handleChange = (index, key) => (eventOrValue) => {
    let value = eventOrValue;
    // Standardize value extraction: if it's an event, get target.value
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
    if (values.length > 1) {
      values.splice(index, 1);
      setFormData(values);
    }
  };

  const handleFormSubmit = () => {
    formData?.map((item,idx)=>{
        const payload = {
          entryBy: user_type===WORKFORCE_USER_TYPE.FACTORY_ADMIN?"factory":"officer",
          dateOfCompensation: item.dateOfCompensation,
          amount: item.amount,
          statusOfPayment: item.paymentStatus,
          isEisBenefitAdjustmentEligible: item.eisBenefitAdjustment ==="Yes"?true:false,
          remarks: item.remarks,
        };
        console.log("Submitting Payload:", payload); // This will now show the correct values
        if (item?.id) {
            dispatch(createWorkforceOtherCompensation(payload,"create other compensation info"))
        }else{
            dispatch(updateWorkforceOtherCompensation(payload,"create other compensation info"))
        }
    })
    // if (onSubmit) onSubmit(payload);
    onClose();
  };

  const isOfficer = entryType === "officer";

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
          {/* --- HEADER --- */}
          <div className={classes.modalHeader}>
            <Typography variant="h6">
              {isOfficer ? "Officer Compensation Entry" : "Factory Compensation Entry"}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>

          {/* --- BODY --- */}
          <div className={classes.modalBody}>
            {Array.isArray(formData) && formData.map((entry, index) => (
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
                  {/* 1. Received From */}
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label={"workforce.compensation.recievedFrom"}
                      fullWidth
                      value={entry.receivedFrom}
                      onChange={handleChange(index, "receivedFrom")}
                    />
                  </Grid>

                  {/* 2. Date Picker */}
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

                  {/* 3. Amount */}
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label="workforce.employee.application.moneyAmount"
                      type="number"
                      fullWidth
                      value={entry.amount}
                      onChange={handleChange(index, "amount")}
                    />
                  </Grid>

                  {/* 4. Status (CHANGED TO STANDARD TextField) */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label={<FormattedMessage id="workforce.compensation.paymentStatus" defaultMessage="Status of Payment" />}
                      fullWidth
                      value={entry.paymentStatus}
                      onChange={handleChange(index, "paymentStatus")}
                      // Make sure margin matches TextInput if needed, or remove variant if using standard
                    >
                      <MenuItem value="Paid"><FormattedMessage id="workforce.paid" defaultMessage="Paid" /></MenuItem>
                      <MenuItem value="unPaid"><FormattedMessage id="workforce.unpaid" defaultMessage="Not paid yet" /></MenuItem>
                    </TextField>
                  </Grid>

                  {/* OFFICER ONLY FIELDS */}
                  {user_type=== WORKFORCE_USER_TYPE.EIS_OFFICER && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="workforce.compensation.eligible.ForEISAdjustment"
                          fullWidth
                          value={entry.eisBenefitAdjustment}
                          onChange={handleChange(index, "eisBenefitAdjustment")}
                          helperText="If Yes, value passes to VBA"
                        >
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextInput
                          label="workforce.compensation.remarks"
                          fullWidth
                          value={entry.remarks}
                          onChange={handleChange(index, "remarks")}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </div>
            ))}

            <Button
              startIcon={<AddCircleOutlineIcon />}
              color="primary"
              onClick={handleAddEntry}
              style={{ marginTop: "8px" }}
            >
              <FormattedMessage id="workforce.compensation.add"/>
            </Button>
          </div>

          {/* --- FOOTER --- */}
          <div className={classes.modalFooter}>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} color="primary" variant="contained">
              Submit
            </Button>
          </div>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default CompensationFormModal;