import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Grid,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useModulesManager, FormattedMessage } from "@openimis/fe-core";
import { createBank } from "../../../actions";
import BanksPicker from "../../../pickers/BanksPicker";
import { MODULE_NAME } from "../../../constants";

const BankBranchModal = ({
    open,
    onClose,
    onSuccess,
    mode, // "bank" or "branch"
    districts,
    banks,
}) => {
    const dispatch = useDispatch();
    const modulesManager = useModulesManager();
    const [loading, setLoading] = useState(false);

    // Bank form fields
    const [nameEn, setNameEn] = useState("");
    const [nameBn, setNameBn] = useState("");
    const [bankCode, setBankCode] = useState("");

    // Branch form fields
    const [parentId, setParentId] = useState(null);
    const [districtCode, setDistrictCode] = useState("");
    const [branchCode, setBranchCode] = useState("");
    const [routingNumber, setRoutingNumber] = useState("");
    const [contactNumber, setContactNumber] = useState("");

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setNameEn("");
        setNameBn("");
        setBankCode("");
        setParentId(null);
        setDistrictCode("");
        setBranchCode("");
        setRoutingNumber("");
        setContactNumber("");
    };

    const validateBankForm = () => {
        return nameEn.trim() && nameBn.trim() && bankCode.trim();
    };

    const validateBranchForm = () => {
        return parentId && districtCode.trim() && branchCode.trim() && routingNumber.trim();
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let bankData = {};

            if (mode === "bank") {
                if (!validateBankForm()) {
                    alert("Please fill in all required fields for Bank");
                    setLoading(false);
                    return;
                }
                bankData = {
                    nameEn: nameEn.trim(),
                    nameBn: nameBn.trim(),
                    bankCode: bankCode.trim(),
                    type: "main",
                    status: "active",
                };
            } else if (mode === "branch") {
                if (!validateBranchForm()) {
                    alert("Please fill in all required fields for Branch");
                    setLoading(false);
                    return;
                }

                // Find district details
                const selectedDistrict = districts.find(d => d.districtCode === districtCode);

                bankData = {
                    nameEn: nameEn.trim(),
                    nameBn: nameBn.trim(),
                    parentId: parentId.id,
                    branchCode: branchCode.trim(),
                    districtCode: districtCode,
                    districtNameEn: selectedDistrict?.districtNameEn || "",
                    districtNameBn: selectedDistrict?.districtNameBn || "",
                    routingNumber: routingNumber.trim(),
                    contactNumber: contactNumber.trim(),
                    type: "branch",
                    status: "active",
                };
            }

            await dispatch(createBank(bankData, `${mode === "bank" ? "Create Bank" : "Create Branch"}`));
            handleClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Error submitting. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getUniqueDistricts = () => {
        const districtMap = {};
        districts.forEach((item) => {
            if (item.districtCode && item.districtNameEn) {
                districtMap[item.districtCode] = {
                    districtCode: item.districtCode,
                    districtNameEn: item.districtNameEn,
                    districtNameBn: item.districtNameBn,
                };
            }
        });
        return Object.values(districtMap);
    };

    const uniqueDistricts = getUniqueDistricts();

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {mode === "bank" ? "Add New Bank" : "Add New Branch"}
            </DialogTitle>
            <DialogContent style={{ marginTop: "16px" }}>
                {mode === "bank" ? (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="nameEn"
                                label="Bank Name (English)"
                                type="text"
                                fullWidth
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                id="nameBn"
                                label="Bank Name (Bengali)"
                                type="text"
                                fullWidth
                                value={nameBn}
                                onChange={(e) => setNameBn(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                id="bankCode"
                                label="Bank Code"
                                type="text"
                                fullWidth
                                value={bankCode}
                                onChange={(e) => setBankCode(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="nameEn"
                                label="Branch Name (English)"
                                type="text"
                                fullWidth
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                id="nameBn"
                                label="Branch Name (Bengali)"
                                type="text"
                                fullWidth
                                value={nameBn}
                                onChange={(e) => setNameBn(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <BanksPicker
                                modulesManager={modulesManager}
                                value={parentId}
                                onChange={(e) => setParentId(e)}
                                required
                                withLabel
                                label="Select Bank"
                                readOnly={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                margin="dense"
                                id="districtCode"
                                label="Select District"
                                type="text"
                                fullWidth
                                value={districtCode}
                                onChange={(e) => setDistrictCode(e.target.value)}
                                disabled={loading}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="">-- Select District --</option>
                                {uniqueDistricts?.map((district) => (
                                    <option key={district.districtCode} value={district.districtCode}>
                                        {district.districtNameEn} - {district.districtNameBn}
                                    </option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                id="branchCode"
                                label="Branch Code"
                                type="text"
                                fullWidth
                                value={branchCode}
                                onChange={(e) => setBranchCode(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                id="routingNumber"
                                label="Routing Number"
                                type="text"
                                fullWidth
                                value={routingNumber}
                                onChange={(e) => setRoutingNumber(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                id="contactNumber"
                                label="Contact Number (Optional)"
                                type="text"
                                fullWidth
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={
                        loading ||
                        (mode === "bank" && !validateBankForm()) ||
                        (mode === "branch" && !validateBranchForm())
                    }
                >
                    {loading ? <CircularProgress size={24} /> : "Submit"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BankBranchModal;
