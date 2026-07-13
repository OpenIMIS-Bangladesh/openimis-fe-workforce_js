import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, CircularProgress, Box, TextField, MenuItem, Grid, Button, Chip
} from "@material-ui/core";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@material-ui/core";
import ClearAllIcon from '@material-ui/icons/ClearAll';
import SearchIcon from '@material-ui/icons/Search';
import EmailIcon from '@material-ui/icons/Email';

import {
  fetchWorkforceEisPaymentDisbursementStage,
  createWorkforceEisPaymentDisbursement,
  deleteWorkforceEisPaymentStage,
  fetchWorkforceFactoriesSummary,
  fetchWorkforceAllAssociationSummary,
  fetchWorkforceCommittees,
  userPaymentConfirmation,
  sendSmsNotification,
} from "../../../actions";
import { useModulesManager, PublishedComponent } from "@openimis/fe-core";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";
import GenerateBeneficiaryAdvice from "./GenerateBeneficiaryAdvice";
import { shortenUrl } from "../../../utils/verificationHelper";



const BeneficiaryDisbursedPayments = () => {
  const dispatch = useDispatch();
  // Generate years dynamically (previous year to 10 years back)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


  const modulesManager = useModulesManager();
  const [openGenerateBeneficiaryAdvice, setOpenGenerateBeneficiaryAdvice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingApproveIds, setPendingApproveIds] = useState([]);
  const [factories, setFactories] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [committees, setCommittees] = useState([]);


    const handleSendSms = async (row, name) => {
      try {
        const longUrl= window.location.origin+`/front/workforce/confirmation?disbursement_id=${safeDecodeId(row.id)}`;
        const link = longUrl;
        // const link = await shortenUrl(longUrl);
        const month= monthNames[Number(row?.monthIndex)-1];
        const year= row?.year;
  
        const message = `Dear beneficiary, Please confirm your payment of ${month}, ${year} From EIS-PILOT With the following link. Please Contact: 01886921030 For any query. ${link}`;
  
        await dispatch(sendSmsNotification(row.phoneNumber, message));
        alert("Message Sent!");
        loadData();
      } catch (error) {
        console.error(error);
        alert("Failed to send SMS");
      }
    };


  const openApproveConfirm = (ids) => {
    setPendingApproveIds(ids);
    setConfirmOpen(true);
  };

  const closeApproveConfirm = () => {
    setConfirmOpen(false);
    setPendingApproveIds([]);
  };



  const [filters, setFilters] = useState({
    month: currentMonth,
    year: currentYear,
    isDisbursed: "all",
    factory: "",
    association: "",
    committee: "",
  });


  const loadData = async () => {
    setLoading(true);
    try {
      dispatch(fetchWorkforceFactoriesSummary(modulesManager, [])).then(res => setFactories(res?.payload?.data?.workforceEmployerFactories?.edges || []));
      dispatch(fetchWorkforceAllAssociationSummary([])).then(res => setAssociations(res?.payload?.data?.workforceAllAssociation?.edges || []));
      const [processRes] = await Promise.all([
        dispatch(fetchWorkforceEisPaymentDisbursementStage({
          month: filters.month,
          year: filters.year,
          isDisbursed: true, // Only fetch disbursed payments
          workforceFactoryId: safeDecodeId(filters.factory) ?? "",
          allAssociationId: safeDecodeId(filters.association) ?? "",
          // notInDisburse: "yes"
        }, modulesManager)),
      ]);

      const allData = processRes?.payload?.data?.workforceEisPaymentDisbursementStage || [];
      const filteredData = filters.committee
        ? allData.filter((row) =>
          safeDecodeId(row?.workforceApplication?.committeeId) === safeDecodeId(filters.committee)
        )
        : allData;

      setData(filteredData);

    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchWorkforceCommittees()).then((res) => {
      setCommittees(res?.payload?.data?.workforceCommittees || []);
    });
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [dispatch, modulesManager, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ month: currentMonth, year: currentYear, isDisbursed: "all", factory: "", association: "" });
  };

  const getStatusChip = (row) => {
    if (row?.isDisbursed || row?.workforceEisBankAdvice?.isConfirmed) return (<Chip label="Disbursed" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />);
    return <Chip label={"Processed"} size="small" variant="outlined" />;
  };

  const getUserConfirmationStatusChip = (row) => {
    if (row?.userConfirmed) return (<Chip label="User Confirmed" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />);
    return <Chip label={"Not Confirmed"} size="small" variant="outlined" />;
  };


  const handleRowSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(data.map(row => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleApprove = async (id) => {
    if (!id) return;
    await dispatch(userPaymentConfirmation(safeDecodeId(id), true)); // Assuming single approval for now
    loadData();
  };



  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 4 }}>
            List of Disbursed Payments
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Confirmed disbursements for beneficiaries. Send confirmation SMS to beneficiaries and receive confirmation from them.
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} style={{ padding: '24px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #eceff1' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth select label="Factory" name="factory" variant="outlined" size="small"
              value={filters.factory} onChange={handleFilterChange}
            >
              <MenuItem value=""><em>All Factories</em></MenuItem>
              {factories.map(f => (
                <MenuItem key={f.node.id} value={f.node.id}>{f.node.nameBn || f.node.nameEn}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth select label="Association" name="association" variant="outlined" size="small"
              value={filters.association} onChange={handleFilterChange}
            >
              <MenuItem value=""><em>All Associations</em></MenuItem>
              {associations.map(a => (
                <MenuItem key={a.node.id} value={a.node.id}>{a.node.shortNameBn || a.node.nameEn}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth select label="Committee" name="committee" variant="outlined" size="small"
              value={filters.committee} onChange={handleFilterChange}
            >
              <MenuItem value=""><em>All Committees</em></MenuItem>
              {committees.map((committee) => (
                <MenuItem key={committee.id} value={committee.id}>
                  {committee.nameBn || committee.nameEn || committee.id}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Month"
              name="month"
              variant="outlined"
              size="small"
              value={filters.month || currentMonth}
              onChange={handleFilterChange}
            >
              <MenuItem value=""><em>All Months</em></MenuItem>
              {monthOptions.map(month => (
                <MenuItem key={month} value={month}>{monthNames[month - 1]}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Year"
              name="year"
              variant="outlined"
              size="small"
              value={filters.year || currentYear}
              onChange={handleFilterChange}
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box display="flex" gap="8px">
              <Button onClick={loadData} fullWidth variant="contained" color="primary" startIcon={<SearchIcon />}>
                Search
              </Button>
              <Button onClick={clearFilters} fullWidth variant="text" color="default" startIcon={<ClearAllIcon />}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead style={{ backgroundColor: '#f8fafd' }}>
              <TableRow>
                {/* <TableCell padding="checkbox" align="center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell> */}
                <TableCell style={{ fontWeight: 600 }}>Beneficiary Details</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Worker, Factory & Association</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Payment Method</TableCell>
                <TableCell align="right" style={{ fontWeight: 600 }}>Amounts</TableCell>
                <TableCell align="center" style={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" style={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => {
                const dep = row?.workforceEmployeeDependent?.[0] || {};
                const worker = row?.workforceApplication?.applicationType === "financialAssistance" ||
                  row?.workforceApplication?.applicationType === "deadlyGrant"
                  ? safeParse(row?.workforceApplication?.deceasedWorkerInfo)?.nameBn
                  : row?.workforceApplication?.workforceEmployee?.firstNameBn;

                return (
                  <TableRow key={row.id} hover>
                    {/* <TableCell padding="checkbox" align="center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                      // disabled={row?.isDisbursed}
                      />
                    </TableCell> */}

                    <TableCell>
                      <Typography variant="subtitle2" style={{ fontWeight: 600 }}>{dep?.nameEn || dep?.nameBn || row?.workforceApplication?.workforceEmployee?.firstNameBn || "—"}</Typography>
                      <Typography variant="caption" color="primary">{getRelationString(dep)}</Typography>
                      <Box mt={0.5} mb={0.5}><Chip label={row.beneficiaryId} variant="outlined" style={{ height: 20 }} /></Box>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {"ATN: " + row?.workforceApplication?.trackingNumber || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>{worker}</Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {row?.workforceApplication?.employeeFactory?.nameBn}
                      </Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        {row?.workforceApplication?.employeeFactory?.allAssociation?.shortNameBn || row?.workforceApplication?.employeeFactory?.allAssociation?.nameEn || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{row.bank?.parent?.nameEn || "N/A"}</Typography>
                      <Typography variant="body2">{row.bank?.nameEn + " (Routing #" + (row?.bank?.routingNumber=='0' || row?.bank?.routingNumber==null ? row?.routingNumber : row?.bank?.routingNumber) + ")" || "N/A"}</Typography>
                      <Typography variant="caption" color="textSecondary">{"A/C: " + row.bankAccountNo}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(row?.paidAmount).toLocaleString("en-BD") ?? Number(row?.paidAmount).toLocaleString("en-BD")}</Typography>
                      <Typography variant="caption" color="textSecondary">{"Total: " + (Number(row?.eisApprovedAmount).toLocaleString("en-BD") ?? "--")}</Typography>
                      <Typography variant="body2" style={{ fontWeight: 700 }}>{getPaymentTypeString(row.eisPaymentType)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      {getStatusChip(row)}
                      <Box mt={2}>
                        <Typography variant="caption" style={{ display: "block" }} color="textSecondary">
                          {(row?.isDisbursed && row?.disbursementDate) || (row?.workforceEisBankAdvice?.isConfirmed && row?.workforceEisBankAdvice?.confirmationDate)
                            ? `Disbursed on: ${new Date(row?.disbursementDate || row?.workforceEisBankAdvice?.confirmationDate).toLocaleDateString("en-GB")}`
                            : ``}
                        </Typography>

                        <Typography variant="caption" style={{ display: "block" }} color="textSecondary">
                          {row?.processingDate
                            ? `Payment Processed on: ${new Date(row?.processingDate).toLocaleDateString("en-GB")}`
                            : ``}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {row?.userConfirmed ? (
                        <>
                          {getUserConfirmationStatusChip(row)}
                        </>
                      ) : (
                        <>
                          {getUserConfirmationStatusChip(row)}
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleApprove(row.id)}
                            style={{ marginLeft: 6 }}
                          >
                            Confirm Manually
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<EmailIcon />}
                            onClick={() =>
                              handleSendSms(
                                row,
                                dep?.nameEn ||
                                dep?.nameBn ||
                                row?.workforceApplication?.workforceEmployee?.firstNameBn ||
                                "—"
                              )
                            }
                            style={{ margin: "5px" }}
                          >
                            Send SMS Again
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {data.length === 0 && (
            <Box p={5} textAlign="center">
              <Typography color="textSecondary">No data found matching current filters.</Typography>
            </Box>
          )}
        </TableContainer>
      )}
    </Box>
  );

};

export default BeneficiaryDisbursedPayments;
