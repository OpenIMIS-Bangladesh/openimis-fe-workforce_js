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
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Grid
} from "@material-ui/core";
import { PublishedComponent } from "@openimis/fe-core";
import { useModulesManager } from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import { fetchEisPaymentProcessWithFilters, updateWorkforceEisBeneficiary } from "../../../actions";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";
import DistrictBanks from "../../../pickers/DistrictBanks";
import BranchPicker from "../../../pickers/BranchPicker";
import { makeStyles } from "@material-ui/core/styles";
import {
  useHistory,FormattedMessage, TextInput
} from "@openimis/fe-core";
const INITIAL_STATE = {
    reason: "",
    remarriageOrDeathDate: null,
    status: "",
    remarks: "",
    // Main Beneficiary Adjustments
    incrementAmount: "",
    incrementDate: null,
    decrementAmount: "",
    decrementDate: null,
    // Other Beneficiaries Adjustments (Nested Object)
    adjustments: {}
};

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
    },
    item: {
        marginBottom: theme.spacing(2),
    },
    buttonContainer: {
        marginTop: theme.spacing(2),
    },
}));


const BeneficiaryEditModal = ({ open, onClose, onSuccess, beneficiary }) => {
    const classes = useStyles();

    const dispatch = useDispatch();
    const modulesManager = useModulesManager();
    const dep = beneficiary?.workforceEmployeeDependent?.[0];

    // 1. Single State Variable for all form data
    const [formData, setFormData] = useState(INITIAL_STATE);

    // API Data state (kept separate from form state as per best practice)
    const [otherBeneficiaries, setOtherBeneficiaries] = useState([]);

    /* -------------------- DERIVED STATE (Calculated on render) -------------------- */
    // Instead of storing these in state, we calculate them based on the current 'reason'.
    // This prevents state desync issues.
    const isClosedStatus = formData.reason === "remarried" || formData.reason === "died";
    const statusSelectable = formData.reason === "live_check_denial";

    let dateFieldLabel = "";
    if (formData.reason === "remarried") dateFieldLabel = "Date of Remarriage";
    else if (formData.reason === "died") dateFieldLabel = "Date of Death";
    else if (formData.reason === "live_check_denial") dateFieldLabel = "Date of Hold/Closure";

    /* -------------------- HANDLERS -------------------- */

    // Helper for updating flat fields
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Helper for updating nested adjustments for other beneficiaries
    const updateAdjustment = (beneficiaryId, field, value) => {
        setFormData(prev => ({
            ...prev,
            adjustments: {
                ...prev.adjustments,
                [beneficiaryId]: {
                    ...prev.adjustments[beneficiaryId],
                    [field]: value
                }
            }
        }));
    };

    /* -------------------- RESET ON OPEN -------------------- */
    useEffect(() => {
        if (open) {
            setFormData(INITIAL_STATE);
            setOtherBeneficiaries([]);
        }
    }, [open]);

    /* -------------------- REASON CHANGE -------------------- */
    const handleReasonChange = (e) => {
        const value = e.target.value;
        let newStatus = "";

        // Determine status based on reason logic
        if (value === "remarried" || value === "died") {
            newStatus = "closed";
        } else if (value === "live_check_denial") {
            newStatus = ""; // User must select
        }

        // Update State
        setFormData(prev => ({
            ...prev,
            reason: value,
            status: newStatus
        }));

        // Fetch Logic
        if (value === 'remarried' || value === 'died' || formData.status === "closed") {
            dispatch(fetchEisPaymentProcessWithFilters({
                workforceApplicationId: safeDecodeId(beneficiary?.workforceApplication.id) ?? "",
                status: "active"
            }, modulesManager)).then(res => {
                const data = res.payload.data.workforceEisPaymentProcess;
                const eligibleOthers = data.filter(
                    b => b.beneficiaryStatus === 'eligible' && b.beneficiaryId !== beneficiary.beneficiaryId
                );
                setOtherBeneficiaries(eligibleOthers);
            });
        }
    };

    /* -------------------- SAVE -------------------- */
    const handleSave = () => {
        // You can now access all data from 'formData'
        console.log("Submitting Complete Form Data:", formData);
        if (formData.incrementAmount > 0 || formData.decrementAmount > 0 || (formData.reason && formData.status)) {
            const payload = {
                beneficiaryId: beneficiary.beneficiaryId || null,
                reason: formData.reason || null,
                beneficiaryStatus: formData.status || null,
                remarks: formData.remarks || null,
                remarriageOrDeathDate: formData.remarriageOrDeathDate || null,
                incrementAmount: formData.incrementAmount || null,
                incrementDate: formData.incrementDate || null,
                decrementAmount: formData.decrementAmount || null,
                decrementDate: formData.decrementDate || null,
                otherBeneficiaryData: JSON.stringify(formData.adjustments),
                // Include other fields if your API needs them
            };

            console.log("Payload to submit:", payload);

            dispatch(updateWorkforceEisBeneficiary(payload)).then(() => {
                onSuccess();
            });
        }
        else {
            return alert("Please provide at least one change (Increment/Decrement/Status Change) to save.");
        }

    };

    const worker = beneficiary?.workforceApplication?.applicationType === "financialAssistance" ||
        beneficiary?.workforceApplication?.applicationType === "deadlyGrant"
        ? safeParse(beneficiary?.workforceApplication?.deceasedWorkerInfo)?.nameBn
        : beneficiary?.workforceApplication?.workforceEmployee?.firstNameBn;


    if (!beneficiary) return null;

    /* -------------------- RENDER -------------------- */
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Manage Beneficiary</DialogTitle>
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
                            <Typography variant="body2" style={{ fontWeight: 500 }}>{worker}</Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                                {beneficiary?.workforceApplication?.employeeFactory?.nameBn}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                                {beneficiary?.workforceApplication?.employeeFactory?.allAssociation?.shortNameBn || beneficiary?.workforceApplication?.employeeFactory?.allAssociation?.nameEn || "N/A"}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Current Status</strong></Typography>
                            <Chip label={beneficiary.beneficiaryStatus} size="small" color="primary" />
                            {beneficiary.remarriageOrDeathDate && (
                                <Typography variant="caption" display="block" color="textSecondary">
                                    {beneficiary.reason === "remarried" ? "Beneficiary Remarried on: " : beneficiary.reason === "died" ? "Beneficiary Died on: " : "Beneficiary Denied Last Live Check on: "}
                                    {beneficiary.remarriageOrDeathDate ? new Date(beneficiary.remarriageOrDeathDate).toLocaleDateString("en-BD") : "N/A"}
                                </Typography>
                            )}
                            <Typography variant="caption" style={{ fontWeight: 700 }}>{beneficiary?.remarks ?? ""}</Typography>
                        </Box>
                    </Grid>
                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Payment Detail:</strong></Typography>
                            <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(beneficiary?.payableAmount).toLocaleString("en-BD") ?? Number(beneficiary?.payableAmount).toLocaleString("en-BD")}</Typography>
                            <Typography variant="caption" color="textSecondary">{"Total: " + (Number(beneficiary?.eisApprovedAmount).toLocaleString("en-BD") ?? "--")}</Typography>
                            <Typography variant="body2" style={{ fontWeight: 700 }}>{getPaymentTypeString(beneficiary.eisPaymentType)}</Typography>
                        </Box>
                    </Grid>
                    <Grid item md={3}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Last Changes</strong></Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                                <strong>Last Increment: </strong> {Number(beneficiary?.incrementAmount ?? 0).toLocaleString("en-BD")} {" "}
                                ({beneficiary?.incrementDate ? new Date(beneficiary.incrementDate).toLocaleDateString("en-BD") : "N/A"})
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                                <strong>Last Decrement: </strong> {Number(beneficiary?.decrementAmount ?? 0).toLocaleString("en-BD")}{" "}
                                <strong>Decrement End Date: </strong>({beneficiary?.decrementEndDate ? new Date(beneficiary.decrementEndDate).toLocaleDateString("en-BD") : "N/A"})
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid item xs={6} className={classes.item}>
                        <PublishedComponent
                            pubRef="workforce.BanksPicker"
                            value={beneficiary?.bank?.parent?.id || null}
                            label={<FormattedMessage id="workforce.bank.picker" />}
                            // onChange={(v) => handleAccountChange(index, "bank", v)}
                            required
                            readOnly={false}
                        />
                        {/* {errors.bank && <FormHelperText error>{errors.bank}</FormHelperText>} */}
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                        <DistrictBanks
                            id={"districtBank"}
                            value={beneficiary?.bank?.id || null} // Pass the whole object, not just id
                            label={<FormattedMessage id="workforce.district.branch.picker" />}
                            bankId={beneficiary?.bank?.bankCode}
                            // onChange={(v) => handleAccountChange(index, "district", v)} // Save full object
                            required
                            readOnly={false}
                        />
                        {/* {errors.districtBank && <FormHelperText error>{errors.districtBank}</FormHelperText>} */}
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                        <BranchPicker
                            id={"branch"}
                            value={beneficiary?.bank || ""}
                            label={<FormattedMessage id="workforce.branch.picker" />}
                            bankId={beneficiary?.bank?.bankCode}
                            districtName={beneficiary?.bank?.districtNameBn}
                            // onChange={(v) => handleAccountChange(index, "branch", v)}
                            required
                            readOnly={false}
                        />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="accountHolderName"
                            label="workforce.employee.account.info.accountHolderName"
                            value={beneficiary?.bankAccountHolderName || ""}
                            // onChange={(v) => handleAccountChange(index, "accountHolderName", v)}
                            required
                            readOnly={false}
                        />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="routingNumber"
                            label="workforce.employee.account.info.routingNumber"
                            value={beneficiary?.bank?.routingNumber || ""}
                            // onChange={(v) => handleAccountChange(index, "routingNumber", v)}
                            readOnly={false}
                            required
                        />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                        <TextInput
                            id="accountNumber"
                            label="workforce.employee.account.info.accountNumber"
                            value={beneficiary?.bankAccountNo || ""}
                            // onChange={(v) => handleAccountChange(index, "accountNumber", v)}
                            required
                            readOnly={false}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <Divider />
            <DialogActions>
                <Button onClick={onClose} color="default">Cancel</Button>
                <Button
                    variant="contained"
                    color="primary"
                    // disabled={!formData.reason || !formData.status ||!formData.incrementAmount <= 0 || formData.incrementAmount <= 0}
                    onClick={() => {
                        handleSave();
                        // onClose();
                    }}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BeneficiaryEditModal;