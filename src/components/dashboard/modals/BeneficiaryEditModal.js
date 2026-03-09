import React, { useState, useEffect, useCallback } from "react";
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
    Grid
} from "@material-ui/core";

import { PublishedComponent, useModulesManager, useHistory, FormattedMessage, TextInput } from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import { fetchEisPaymentProcessWithFilters, updateWorkforceEisBeneficiary, updateWorkforceEisBeneficiaryBank } from "../../../actions";
import { getPaymentTypeString, safeDecodeId, safeParse } from "../../../utils/utils";
import DistrictBanks from "../../../pickers/DistrictBanks";
import BranchPicker from "../../../pickers/BranchPicker";
import { makeStyles } from "@material-ui/core/styles";

const INITIAL_STATE = {
    bank: null,
    districtBank: null,
    branch: null,
    accountHolderName: "",
    routingNumber: "",
    accountNumber: "",
    phoneNumber: ""
};

const useStyles = makeStyles((theme) => ({
    item: {
        marginBottom: theme.spacing(2),
    }
}));

const BeneficiaryEditModal = ({ open, onClose, onSuccess, beneficiary }) => {

    const classes = useStyles();
    const dispatch = useDispatch();
    const modulesManager = useModulesManager();

    const dep = beneficiary?.workforceEmployeeDependent?.[0];

    const [formData, setFormData] = useState(INITIAL_STATE);


    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAccountChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === "bank") {
                updated.bank= value?.id??null;
            }

            return updated;
        });
    };

    // const handleAccountChange= useCallback(()=>{
    //     setFormData((prev)=>({
    //         ...prev,
    //         branch:null,
    //         districtBank:null
    //     }))
    // },[formData.bank])

    useEffect(() => {
        if (open && beneficiary) {
            setFormData({
                ...INITIAL_STATE,
                bank: beneficiary?.bank?.parent?.id || null,
                districtBank: beneficiary?.bank || null,
                branch: beneficiary?.bank || null,
                accountHolderName: beneficiary?.bankAccountHolderName || "",
                routingNumber: beneficiary?.bank?.routingNumber || "",
                accountNumber: beneficiary?.bankAccountNo || "",
                phoneNumber: beneficiary?.phoneNumber || ""
            });
        }
    }, [open, beneficiary]);


    const handleSave = () => {

        const payload = {
            beneficiaryId: beneficiary.beneficiaryId || null,
            bank: formData.bank,
            districtBank: formData.districtBank,
            branch: formData.branch,
            bankAccountHolderName: formData.accountHolderName,
            routingNumber: formData.routingNumber,
            bankAccountNo: formData.accountNumber,
            phoneNumber: formData.phoneNumber,
        };

        dispatch(updateWorkforceEisBeneficiaryBank(payload))
            .then(() => onSuccess());
    };

    const worker =
        beneficiary?.workforceApplication?.applicationType === "financialAssistance" ||
            beneficiary?.workforceApplication?.applicationType === "deadlyGrant"
            ? safeParse(beneficiary?.workforceApplication?.deceasedWorkerInfo)?.nameBn
            : beneficiary?.workforceApplication?.workforceEmployee?.firstNameBn;

    if (!beneficiary) return null;


    console.log({formData});

    return (

        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>

            <DialogTitle>Edit Beneficiary Information</DialogTitle>

            <Divider />

            <DialogContent>

                {/* Beneficiary Info */}

                <Grid container spacing={2}>
                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Beneficiary ID</strong></Typography>
                            <Typography>{beneficiary.beneficiaryId}</Typography>
                        </Box>
                    </Grid>

                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Name</strong></Typography>
                            <Typography>{dep?.nameBn || dep?.nameEn || "N/A"}</Typography>
                        </Box>
                    </Grid>

                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Worker's Detail</strong></Typography>

                            <Typography variant="body2" style={{ fontWeight: 500 }}>
                                {worker}
                            </Typography>

                            <Typography variant="caption" display="block" color="textSecondary">
                                {beneficiary?.workforceApplication?.employeeFactory?.nameBn}
                            </Typography>

                            <Typography variant="caption" display="block" color="textSecondary">
                                {beneficiary?.workforceApplication?.employeeFactory?.allAssociation?.shortNameBn ||
                                    beneficiary?.workforceApplication?.employeeFactory?.allAssociation?.nameEn ||
                                    "N/A"}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Current Status</strong></Typography>

                            <Chip
                                label={beneficiary.beneficiaryStatus}
                                size="small"
                                color="primary"
                            />

                            {beneficiary.remarriageOrDeathDate && (
                                <Typography variant="caption" display="block" color="textSecondary">

                                    {beneficiary.reason === "remarried"
                                        ? "Beneficiary Remarried on: "
                                        : beneficiary.reason === "died"
                                            ? "Beneficiary Died on: "
                                            : "Beneficiary Denied Last Live Check on: "}

                                    {beneficiary.remarriageOrDeathDate
                                        ? new Date(beneficiary.remarriageOrDeathDate)
                                            .toLocaleDateString("en-BD")
                                        : "N/A"}
                                </Typography>
                            )}

                            <Typography variant="caption" style={{ fontWeight: 700 }}>
                                {beneficiary?.remarks ?? ""}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Payment Detail:</strong></Typography>

                            <Typography variant="body2" style={{ fontWeight: 700 }}>
                                {Number(beneficiary?.payableAmount)
                                    .toLocaleString("en-BD")}
                            </Typography>

                            <Typography variant="caption" color="textSecondary">
                                {"Total: " +
                                    (Number(beneficiary?.eisApprovedAmount)
                                        .toLocaleString("en-BD") ?? "--")}
                            </Typography>

                            <Typography variant="body2" style={{ fontWeight: 700 }}>
                                {getPaymentTypeString(beneficiary.eisPaymentType)}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Last Changes</strong></Typography>

                            <Typography variant="caption" display="block" color="textSecondary">
                                <strong>Last Increment: </strong>
                                {Number(beneficiary?.incrementAmount ?? 0)
                                    .toLocaleString("en-BD")}{" "}
                                (
                                {beneficiary?.incrementDate
                                    ? new Date(beneficiary.incrementDate)
                                        .toLocaleDateString("en-BD")
                                    : "N/A"}
                                )
                            </Typography>

                            <Typography variant="caption" display="block" color="textSecondary">
                                <strong>Last Decrement: </strong>
                                {Number(beneficiary?.decrementAmount ?? 0)
                                    .toLocaleString("en-BD")}{" "}

                                <strong>Decrement End Date: </strong>
                                (
                                {beneficiary?.decrementEndDate
                                    ? new Date(beneficiary.decrementEndDate)
                                        .toLocaleDateString("en-BD")
                                    : "N/A"}
                                )
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>

                    <Grid item xs={6} className={classes.item}>
                        <PublishedComponent
                            pubRef="workforce.BanksPicker"
                            value={formData.bank}
                            label={<FormattedMessage id="workforce.bank.picker" />}
                            onChange={(v) => handleAccountChange("bank", v)}
                            required
                        />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                        <DistrictBanks
                            id={"districtBank"}
                            value={formData.districtBank}
                            label={<FormattedMessage id="workforce.district.branch.picker" />}
                            bankId={formData.bank?.bankCode || formData.bank}
                            onChange={(v) => handleAccountChange("districtBank", v)}
                            required
                        />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                        <BranchPicker
                            id={"branch"}
                            value={formData.branch}
                            label={<FormattedMessage id="workforce.branch.picker" />}
                            bankId={formData.bank?.bankCode || formData.bank}
                            districtName={formData.districtBank?.districtNameBn}
                            onChange={(v) => handleAccountChange("branch", v)}
                            required
                        />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="accountHolderName"
                            label="workforce.employee.account.info.accountHolderName"
                            value={formData.accountHolderName}
                            onChange={(v) => handleAccountChange("accountHolderName", v)}
                            required
                        />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="routingNumber"
                            label="workforce.employee.account.info.routingNumber"
                            value={formData.routingNumber}
                            onChange={(v) => handleAccountChange("routingNumber", v)}
                            required
                        />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="accountNumber"
                            label="workforce.employee.account.info.accountNumber"
                            value={formData.accountNumber}
                            onChange={(v) => handleAccountChange("accountNumber", v)}
                            required
                        />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="phoneNumber"
                            label="workforce.employee.phone"
                            value={formData.phoneNumber}
                            onChange={(v) => handleAccountChange("phoneNumber", v)}
                            required
                        />
                    </Grid>

                </Grid>

            </DialogContent>

            <Divider />

            <DialogActions>

                <Button onClick={onClose} color="default">
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                >
                    Save Changes
                </Button>

            </DialogActions>

        </Dialog>
    );
};

export default BeneficiaryEditModal;