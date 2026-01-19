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
import { fetchEisPaymentProcessWithFilters } from "../../../actions";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";

const BeneficiaryManageModal = ({ open, onClose, beneficiary }) => {
    if (!beneficiary) return null;
    const dispatch = useDispatch();
    const modulesManager = useModulesManager();
    const dep = beneficiary?.workforceEmployeeDependent?.[0];

    /* -------------------- STATE -------------------- */
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState("");
    const [statusSelectable, setStatusSelectable] = useState(false);
    const [dateFieldLabel, setDateFieldLabel] = useState("");
    const [remarks, setRemarks] = useState("");
    const [otherBeneficiaries, setOtherBeneficiaries] = useState([]);

    /* -------------------- RESET ON OPEN -------------------- */
    useEffect(() => {
        if (open) {
            setReason("");
            setStatus("");
            setStatusSelectable(false);
            setDateFieldLabel("");
            setRemarks("");
        }
    }, [open]);

    /* -------------------- REASON CHANGE -------------------- */
    const handleReasonChange = (e) => {
        const value = e.target.value;
        setReason(value);

        if (value === "remarried") {
            setStatus("closed");
            setStatusSelectable(false);
            setDateFieldLabel("Date of Remarriage");
        }
        else if (value === "died") {
            setStatus("closed");
            setStatusSelectable(false);
            setDateFieldLabel("Date of Death");
        }
        else if (value === "live_check_denial") {
            setStatus("");
            setStatusSelectable(true);
            setDateFieldLabel("Date of Hold/Closure");
        }
        else {
            setStatus("");
            setStatusSelectable(false);
            setDateFieldLabel("");
        }

        if (value === 'remarried' || value === 'died' || status === "closed") {
            dispatch(fetchEisPaymentProcessWithFilters({
                workforceApplicationId: safeDecodeId(beneficiary?.workforceApplication.id) ?? "",
                status: "active"
            }, modulesManager)).then(res => {
                const data = res.payload.data.workforceEisPaymentProcess;
                console.log("Fetched beneficiaries:", data);
                const eligibleOthers = data.filter(
                    b => b.beneficiaryStatus === 'eligible' && b.beneficiaryId !== beneficiary.beneficiaryId
                );
                setOtherBeneficiaries(eligibleOthers);
            });
        }
    };

    /* -------------------- SAVE -------------------- */
    const handleSave = () => {
        const payload = {
            beneficiaryId: beneficiary.beneficiaryId,
            reason,
            status,
            remarks
            // effectiveDate from DatePicker
        };

        console.log("Submitting payload:", payload);
        // dispatch(updateBeneficiaryStatus(payload))
        onClose();
    };

    const worker = beneficiary?.workforceApplication?.applicationType === "financialAssistance" ||
        beneficiary?.workforceApplication?.applicationType === "deadlyGrant"
        ? safeParse(beneficiary?.workforceApplication?.deceasedWorkerInfo)?.nameBn
        : beneficiary?.workforceApplication?.workforceEmployee?.firstNameBn;

    /* -------------------- RENDER -------------------- */
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Manage Beneficiary</DialogTitle>

            <Divider />

            <DialogContent>
                {/* Beneficiary Info */}
                <Grid container spacing={2}>
                    <Grid item md={6}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Beneficiary ID</strong></Typography>
                            <Typography>{beneficiary.beneficiaryId}</Typography>
                        </Box>
                    </Grid>
                    <Grid item md={6}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Name</strong></Typography>
                            <Typography>{dep?.nameBn || dep?.nameEn || "N/A"}</Typography>
                        </Box>
                    </Grid>
                    <Grid item md={6}>
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
                    <Grid item md={6}>
                        <Box mb={2}>
                            <Typography variant="subtitle2"><strong>Current Status</strong></Typography>
                            <Chip label={beneficiary.beneficiaryStatus} size="small" color="primary" />
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
                        value={reason}
                        onChange={handleReasonChange}
                    >
                        <MenuItem value="">
                            <em>Select status</em>
                        </MenuItem>
                        <MenuItem value="remarried">Beneficiary Remarried</MenuItem>
                        <MenuItem value="died">Beneficiary Died</MenuItem>
                        <MenuItem value="live_check_denial">Beneficiary has not confirmed live check</MenuItem>
                    </TextField>
                </Box>

                {/* Resulting Status */}
                {reason && (
                    <Box mt={2}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Resulting Status"
                            variant="outlined"
                            size="small"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={!statusSelectable}
                        >
                            {!statusSelectable && (
                                <MenuItem value={status}>
                                    {status.toUpperCase()}
                                </MenuItem>
                            )}
                            {statusSelectable && [
                                <MenuItem key="empty" value="">
                                    <em>Select status</em>
                                </MenuItem>,
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
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </Box>

                {(reason === 'remarried' || reason === 'died' || status === 'closed') && otherBeneficiaries.length > 0 ? (
                    <TableContainer component={Paper} elevation={0} style={{ borderRadius: '12px', border: '1px solid #e0e0e0', marginTop: '24px' }}>
                        <Table>
                            <TableHead style={{ backgroundColor: '#f8fafd' }}>
                                <TableRow>
                                    <TableCell colspan={5}>Other Beneficiaries</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 600 }}>Beneficiary Details</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Payment Method</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 600 }}>Amounts</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 600 }}>Increment</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 600 }}>Decrement</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Using raw data directly as it's now filtered by the backend */}
                                {otherBeneficiaries.map((row) => {
                                    const dep = row?.workforceEmployeeDependent?.[0] || {};


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
                                                <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(row.eisInitialMonthlyAmount).toLocaleString("en-BD") ?? Number(row.eisMonthlyAmount).toLocaleString("en-BD")}</Typography>
                                                <Typography variant="caption" color="textSecondary">{"Total: " + (Number(row?.eisApprovedAmount).toLocaleString("en-BD") ?? "--")}</Typography>
                                                <Typography variant="body2" style={{ fontWeight: 700 }}>{getPaymentTypeString(row.eisPaymentType)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    p={2}
                                                    borderRadius={8}
                                                    bgcolor="#f1f8e9"
                                                    border="1px solid #dcedc8"
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        style={{ fontWeight: 600, marginBottom: 8, color: "#558b2f" }}
                                                    >
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
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12}>
                                                            <PublishedComponent
                                                                pubRef="workforce.DatePicker"
                                                                label="Effective Date"
                                                                required
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Box
                                                    p={2}
                                                    borderRadius={8}
                                                    bgcolor="#fdecea"
                                                    border="1px solid #f5c6cb"
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        style={{ fontWeight: 600, marginBottom: 8, color: "#c62828" }}
                                                    >
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
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12}>
                                                            <PublishedComponent
                                                                pubRef="workforce.DatePicker"
                                                                label="Effective Date"
                                                                required
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </TableCell>

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
                <Button onClick={onClose} color="default">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!reason || !status}
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BeneficiaryManageModal;
