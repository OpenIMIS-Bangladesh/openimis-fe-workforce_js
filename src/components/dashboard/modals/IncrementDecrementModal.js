import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Box,
    Typography,
    TextField,
    MenuItem,
    Button,
    Chip,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress,
    Grid
} from "@material-ui/core";
import { PublishedComponent } from "@openimis/fe-core";
import { useModulesManager } from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import { fetchEisPaymentProcessWithFilters, updateWorkforceEisBeneficiary, updateWorkforceEisPaymentByAssociation } from "../../../actions";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";


const IncrementDecrementModal = ({ open, onClose, onSuccess, association, selectedIds }) => {
    console.log("IncrementDecrementModal Props:", { open, onClose, onSuccess, selectedIds });
    const INITIAL_STATE = {
        associationId: association?.id,
        // Main Beneficiary Adjustments
        increment: "",
        incrementDate: null,
        decrement: "",
        decrementDate: null,
    };
    
    const dispatch = useDispatch();
    const modulesManager = useModulesManager();
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);


    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
        [field]: value
        }));
    };





    /* -------------------- SAVE -------------------- */
    const handleSave = () => {
        setLoading(true);
        if(formData.increment > 0 || formData.decrement > 0){
            const payload = {
                associationId: association?.id || null,
                selectedIds: selectedIds || null,
                increment: formData.increment || null,
                incrementDate: formData.incrementDate || null,
                decrement: formData.decrement || null,
                decrementDate: formData.decrementDate || null,
            };
    
            console.log("Payload to submit:", payload);
    
            dispatch(updateWorkforceEisPaymentByAssociation(payload)).then(() => {
                onSuccess();
                formData.increment = "";
                formData.decrement = "";
                formData.incrementDate = "";
                formData.decrementDate = "";
                setLoading(false);
            });
        }
        else{
            return alert("Please provide at least one change (Increment or Decrement) to save.");
        }

    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth style={{ overflow: "visible" }}
        PaperProps={{
                style: { overflow: "visible" }
            }}
        >
            <DialogTitle>Increase or Decrease Amounts for Selected Beneficiaries for <strong>{association?.nameEn} ({association?.shortNameEn})</strong></DialogTitle>
            <Divider />
            <DialogContent style={{ overflow: "visible" }}>
                <Grid container spacing={2} style={{ marginBottom: 16 }}>
                    <Grid item xs={12}>
                        <Typography variant="body1" style={{ color: "#555" }}>
                            Use the options below to apply a percentage increase or decrease to the payments of all beneficiaries associated with <strong>{association?.nameEn}</strong>. You can specify either an increment, a decrement, or both. Changes will be effective immediately.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Box p={2} borderRadius={8} bgcolor="#f1f8e9" border="1px solid #dcedc8">
                            <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8, color: "#558b2f" }}>Increment Percentage</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth type="number" variant="outlined" label="Percent (%)" size="small"
                                        inputProps={{
                                            max: 100,
                                        }}
                                        onChange={(e) => handleChange('increment', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <PublishedComponent
                                        pubRef="workforce.DatePicker"
                                        label="Effective Date"
                                        // value={formData.incrementDate || null}
                                        PopperProps={{
                                            container: document.body,
                                            style: { zIndex: 2000 }
                                        }}
                                        onChange={(date) => handleDateChange('incrementDate', date)}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <Box p={2} borderRadius={8} bgcolor="#fdecea" border="1px solid #f5c6cb">
                            <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8, color: "#c62828" }}>Decrement Percentage</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth type="number" variant="outlined" label="Percent (%)" size="small"
                                        onChange={(e) => handleChange('decrement', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <PublishedComponent
                                        pubRef="workforce.DatePicker"
                                        label="Effective Date"
                                        PopperProps={{
                                            container: document.body,
                                            style: { zIndex: 2000 }
                                        }}
                                        // value={formData.decrementDate || null}
                                        onChange={(date) => handleDateChange('decrementDate', date)}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

            </DialogContent>
            <Divider />
            <DialogActions>
                <Button onClick={onClose} color="default">Cancel</Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    onClick={() => {
                        handleSave();
                    }}
                >
                    {loading?(
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                    ):
                    (
                    "Save Changes"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IncrementDecrementModal;