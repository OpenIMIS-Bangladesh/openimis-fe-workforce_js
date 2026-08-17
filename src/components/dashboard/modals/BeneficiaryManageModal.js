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
import { PublishedComponent,parseData } from "@openimis/fe-core";
import { useModulesManager } from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import { fetchEisPaymentProcessWithFilters, fetchWorkforceEisLastPaymentDate, sendSmsNotification, updateWorkforceEisBeneficiary } from "../../../actions";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";

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

const PHOTO_TYPES = [
    "nominee's photo",
    "nominee photo",
    "employee photo",
    "workers photo",
    "photo of worker"
];

const BeneficiaryManageModal = ({ open, onClose, onSuccess, beneficiary }) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    });
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


    useEffect(() => {
        const lastPayment = dispatch(fetchWorkforceEisLastPaymentDate({
            beneficiaryId: beneficiary?.beneficiaryId ?? ""})).then(res => {
            const data = res.payload.data.workforceEisLastPaymentDate;
            let responseMonth= data?.monthIndex;
            let responseYear= data?.year;
            if (data) {
                const lastPaymentDate = new Date(responseYear, responseMonth, 0);
                console.log("Last Payment Date:", lastPaymentDate);
                const selectedDate = formData.remarriageOrDeathDate!==null ? new Date(formData.remarriageOrDeathDate) : null;
                if (selectedDate!==null && selectedDate < lastPaymentDate) {
                    alert(`Selected date (${selectedDate.toLocaleDateString("en-BD")}) cannot be earlier than the last payment month (${formatter.format(lastPaymentDate)}).`);
                    setFormData(prev => ({
                        ...prev,
                        remarriageOrDeathDate: null
                    }));
                }
            }
        });
    }, [formData.remarriageOrDeathDate]);

    // Helper for updating nested adjustments for other beneficiaries
   const updateAdjustment = (beneficiaryId, field, value) => {
    setFormData(prev => {

        const numericValue = Number(value) || 0;
        const maxAllowed = Number(beneficiary?.payableAmount) || 0;

        // Create a copy of adjustments with updated value
        const updatedAdjustments = {
            ...prev.adjustments,
            [beneficiaryId]: {
                ...prev.adjustments[beneficiaryId],
                [field]: numericValue
            }
        };

        // Only validate for incrementAmount fields
        if (field === "incrementAmount") {

            // Calculate total of all incrementAmount fields
            const totalIncrement = Object.values(updatedAdjustments)
                .reduce((sum, adj) => {
                    return sum + (Number(adj?.incrementAmount) || 0);
                }, 0);

            if (totalIncrement > maxAllowed) {
                alert(
                    `Total increment amount (${totalIncrement.toLocaleString("en-BD")}) 
                     cannot exceed payable amount (${maxAllowed.toLocaleString("en-BD")})`
                );

                // Revert only current field to 0
                updatedAdjustments[beneficiaryId].incrementAmount = 0;
            }
        }

        return {
            ...prev,
            adjustments: updatedAdjustments
        };
    });
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

    /*---------------------SEND SMS---------------*/
    const handleSendSms = async () => {
        try {
            console.log("hello")
            const appType = beneficiary?.workforceApplication?.applicationType;
            const docs = parseData(beneficiary?.workforceApplication?.workforceDocumentApplication) || [];
            console.log("handle send sms",appType)
            console.log("handle send sms",docs)
            let targetDoc = null;

            if (appType === "financialAssistance") {
                targetDoc = docs.find(d => 
                    PHOTO_TYPES.includes(d.documentType) && 
                    d.workforceDependent?.id === dep?.id // Adjust dependent ID field based on your schema
                );
            } else if (appType === "disabilityAssistance") {
                targetDoc = docs.find(d => 
                    PHOTO_TYPES.includes(d.documentType)
                );
            }

            if (!targetDoc?.id) return alert("No matching photo document found.");

            const docId = safeDecodeId(targetDoc.id);
            const link = `${window.location.origin}/front/biometric/verify/${docId}`;
            const name = dep?.nameBn || dep?.nameEn || "Beneficiary";
            const message = `Hi, ${name}, Please verify your identity at ${link}`;
            console.log({targetDoc})
            console.log({message})
            // Ensure sendSmsNotification is imported at the top
            // await dispatch(sendSmsNotification("01537457083", message)); 
            await dispatch(sendSmsNotification(beneficiary?.phoneNumber, message)); 
            alert("Message Sent!");
        } catch (error) {
            console.error(error);
            alert("Failed to send SMS");
        }
    };
    console.log({beneficiary})
    /* -------------------- SAVE -------------------- */
    const handleSave =async () => {
        // You can now access all data from 'formData'
        console.log("Submitting Complete Form Data:", formData);
        if (formData.incrementAmount > 0 || formData.decrementAmount > 0 || (formData.reason && formData.status)) {
            // --- ADDED LOGIC HERE ---
            if (formData.reason === "live_check_denial" && formData.status === "hold") {
                await handleSendSms();
            }
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

    /* -------------------- RENDER -------------------- */
    if (!beneficiary) return null;
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

                    {/* Main Beneficiary Adjustments */}
                    <Grid item md={3}>
                        <Box p={2} borderRadius={8} bgcolor="#f1f8e9" border="1px solid #dcedc8">
                            <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8, color: "#558b2f" }}>
                                Increment
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        variant="outlined"
                                        label="Amount"
                                        size="small"
                                        value={formData.incrementAmount}
                                        onChange={(e) => handleChange("incrementAmount", e.target.value)}
                                    />
                                </Grid>
                                {/* <Grid item xs={12}>
                                    <PublishedComponent
                                        pubRef="workforce.DatePicker"
                                        label="Effective Date"
                                        value={formData.incrementDate}
                                        onChange={(date) => handleChange("incrementDate", date)}
                                        required
                                    />
                                </Grid> */}
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid item md={3}>
                        <Box p={2} borderRadius={8} bgcolor="#fdecea" border="1px solid #f5c6cb">
                            <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8, color: "#c62828" }}>
                                Decrement
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        variant="outlined"
                                        label="Amount"
                                        size="small"
                                        value={formData.decrementAmount}
                                        onChange={(e) => handleChange("decrementAmount", e.target.value)}
                                    />
                                </Grid>
                                {/* <Grid item xs={12}>
                                    <PublishedComponent
                                        pubRef="workforce.DatePicker"
                                        label="Effective Date"
                                        value={formData.decrementDate}
                                        onChange={(date) => handleChange("decrementDate", date)}
                                        required
                                    />
                                </Grid> */}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

                {/* Reason */}
                <Box mt={3}>
                    <TextField
                        select
                        fullWidth
                        required
                        label="Update Status of Beneficiary"
                        variant="outlined"
                        size="small"
                        value={formData.reason}
                        onChange={handleReasonChange}
                        disabled={beneficiary.beneficiaryStatus === "closed"}
                    >
                        <MenuItem value=""><em>Select status</em></MenuItem>
                        <MenuItem value="remarried">Beneficiary Remarried</MenuItem>
                        <MenuItem value="died">Beneficiary Died</MenuItem>
                        <MenuItem value="live_check_denial">Beneficiary has not confirmed live check</MenuItem>
                    </TextField>
                </Box>

                {/* Resulting Status */}
                {formData.reason && (
                    <Box mt={2}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Resulting Status"
                            variant="outlined"
                            size="small"
                            value={formData.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                            disabled={!statusSelectable}
                        >
                            {!statusSelectable && (
                                <MenuItem value={formData.status}>
                                    {formData.status.toUpperCase()}
                                </MenuItem>
                            )}
                            {statusSelectable && [
                                <MenuItem key="empty" value=""><em>Select status</em></MenuItem>,
                                <MenuItem key="hold" value="hold">Hold</MenuItem>,
                                <MenuItem key="closed" value="closed">Closed</MenuItem>
                            ]}
                        </TextField>
                    </Box>
                )}

                {/* Date */}
                {dateFieldLabel && (
                    <Box mt={2}>
                        <PublishedComponent
                            pubRef="workforce.DatePicker"
                            label={dateFieldLabel}
                            value={formData.remarriageOrDeathDate}
                            onChange={(date) => handleChange("remarriageOrDeathDate", date)}
                            required
                        />
                    </Box>
                )}

                {/* Remarks */}
                <Box mt={2}>
                    <TextField
                        fullWidth
                        label="Remarks / Notes"
                        variant="outlined"
                        size="small"
                        multiline
                        rows={3}
                        value={formData.remarks}
                        onChange={(e) => handleChange("remarks", e.target.value)}
                    />
                </Box>

                {/* Other Beneficiaries Table */}
                {(formData.status === 'closed') && otherBeneficiaries.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} style={{ borderRadius: '12px', border: '1px solid #e0e0e0', marginTop: '24px' }}>
                        <Table>
                            <TableHead style={{ backgroundColor: '#f8fafd' }}>
                                <TableRow>
                                    <TableCell colspan={5}>
                                        <strong>Other Beneficiaries</strong>
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            Adjust increments/decrements for other beneficiaries linked to the same worker.
                                            <span style={{ display: 'block', marginTop: 4, color: '#c90000' }}>
                                                Note: Decrements are automatically calculated based on the main beneficiary's changes.
                                            </span>
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 600 }}>Beneficiary Details</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Payment Method</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 600 }}>Amounts</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 600 }}>Increment</TableCell>
                                    {/* <TableCell align="right" style={{ fontWeight: 600 }}>Decrement</TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {otherBeneficiaries.map((row) => {
                                    const dep = row?.workforceEmployeeDependent?.[0] || {};
                                    // Safely access nested adjustments
                                    const currentAdjustment = formData.adjustments[row.beneficiaryId] || {};

                                    return (
                                        <TableRow key={row.id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2" style={{ fontWeight: 600 }}>{dep?.nameEn || dep?.nameBn || row?.workforceApplication?.workforceEmployee?.firstNameBn || "—"}</Typography>
                                                <Typography variant="caption" color="primary">{getRelationString(dep)}</Typography>
                                                <Box mt={0.5}><Chip label={row.beneficiaryId} size="small" variant="outlined" style={{ height: 20, fontSize: 10 }} /></Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{row.bank?.parent?.nameEn || "N/A"}</Typography>
                                                <Typography variant="body2">{row.bank?.nameEn + " (Routing #" + row.bank?.routingNumber + ")" || "N/A"}</Typography>
                                                <Typography variant="caption" color="textSecondary">{"A/C: " + row.bankAccountNo}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(row?.payableAmount).toLocaleString("en-BD") ?? Number(row?.payableAmount).toLocaleString("en-BD")}</Typography>
                                                <Typography variant="caption" color="textSecondary">{"Total: " + (Number(row?.eisApprovedAmount).toLocaleString("en-BD") ?? "--")}</Typography>
                                                <Typography variant="body2" style={{ fontWeight: 700 }}>{getPaymentTypeString(row.eisPaymentType)}</Typography>
                                            </TableCell>
                                            {/* Other Beneficiary Increment */}
                                            <TableCell>
                                                <Box p={2} borderRadius={8} bgcolor="#f1f8e9" border="1px solid #dcedc8">
                                                    <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8, color: "#558b2f" }}>Increment</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                fullWidth type="number" variant="outlined" label="Amount" size="small"
                                                                value={currentAdjustment.incrementAmount || ''}
                                                                onChange={(e) => updateAdjustment(row.beneficiaryId, 'incrementAmount', e.target.value)}
                                                            />
                                                        </Grid>
                                                        {/* <Grid item xs={12}>
                                                            <PublishedComponent
                                                                pubRef="workforce.DatePicker"
                                                                label="Effective Date"
                                                                value={currentAdjustment.incrementDate || null}
                                                                onChange={(date) => updateAdjustment(row.beneficiaryId, 'incrementDate', date)}
                                                                required
                                                            />
                                                        </Grid> */}
                                                    </Grid>
                                                </Box>
                                            </TableCell>
                                            {/* Other Beneficiary Decrement */}
                                            {/* <TableCell>
                                                <Box p={2} borderRadius={8} bgcolor="#fdecea" border="1px solid #f5c6cb">
                                                    <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8, color: "#c62828" }}>Decrement</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                fullWidth type="number" variant="outlined" label="Amount" size="small"
                                                                value={currentAdjustment.decrementAmount || ''}
                                                                onChange={(e) => updateAdjustment(row.beneficiaryId, 'decrementAmount', e.target.value)}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <PublishedComponent
                                                                pubRef="workforce.DatePicker"
                                                                label="Effective Date"
                                                                value={currentAdjustment.decrementDate || null}
                                                                onChange={(date) => updateAdjustment(row.beneficiaryId, 'decrementDate', date)}
                                                                required
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </TableCell> */}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : null}
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

export default BeneficiaryManageModal;