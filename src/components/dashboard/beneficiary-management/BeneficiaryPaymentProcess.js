import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, CircularProgress, Box, TextField, MenuItem, Grid, Button, Chip
} from "@material-ui/core";
import ClearAllIcon from '@material-ui/icons/ClearAll';
import SearchIcon from '@material-ui/icons/Search';

import {
  fetchEisPaymentProcessWithFilters,
  createWorkforceEisPaymentStage
} from "../../../actions";
import { useModulesManager, PublishedComponent } from "@openimis/fe-core";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";
import BeneficiaryManageModal from "../modals/BeneficiaryManageModal";


const BeneficiaryPaymentProcess = () => {
  const dispatch = useDispatch();
    // Generate years dynamically (previous year to 10 years back)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


  const modulesManager = useModulesManager();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
    month: currentMonth,
    year: currentYear
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  const handleOpenModal = (row) => {
    setSelectedBeneficiary(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBeneficiary(null);
  };



  const loadData = async () => {
    setLoading(true);
    try {
      const [processRes] = await Promise.all([
        dispatch(fetchEisPaymentProcessWithFilters({
          month: filters.month,
          year: filters.year,
          status: "active",
          beneficiaryStatus: "eligible",
          approved: "yes",
          notInStage: "yes"
        }, modulesManager)),

      ]);

      setData(processRes?.payload?.data?.workforceEisPaymentProcess || []);

    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch, modulesManager, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ month: currentMonth, year: currentYear });
  };

    const getStatusChip = (row) => {
      if (row?.beneficiaryStatus ==="eligible") return <Chip label="Eligible" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />;
      if (row?.beneficiaryStatus ==="closed") return <Chip label="Closed" size="small" style={{ backgroundColor: '#f5e8e8ff', color: '#7d2e2eff' }}/>;
      if (row?.beneficiaryStatus ==="hold") return <Chip label="On Hold" size="small" style={{ backgroundColor: '#f5f4e8ff', color: '#787d2eff' }} />;
      return <Chip label={row?.beneficiaryStatus} size="small" variant="outlined" />;
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

  const handleApprove = async (ids) => {
    if (!ids?.length) return;
    console.log("Approving IDs:", ids);
    console.log("month IDs:", filters.month);
    console.log("year IDs:", filters.year);
    await dispatch(createWorkforceEisPaymentStage(ids, filters.month, filters.year));
    loadData();
  };
  

  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 4 }}>
            Beneficiary Payment Processing
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Beneficary payment processing, and related details.
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} style={{ padding: '24px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #eceff1' }}>
        <Grid container spacing={3} alignItems="center">
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
              value={filters.year || currentYear }
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
                <TableCell padding="checkbox" align="center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
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
                    <TableCell padding="checkbox" align="center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                      />
                    </TableCell>

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
                      <Typography variant="body2">{row.bank?.nameEn + " (Routing #" + row.bank?.routingNumber + ")" || "N/A"}</Typography>
                      <Typography variant="caption" color="textSecondary">{"A/C: "+row.bankAccountNo}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(row?.payableAmount).toLocaleString("en-BD") ?? Number(row?.payableAmount).toLocaleString("en-BD")}</Typography>
                      <Typography variant="caption" color="textSecondary">{"Total: "+ (Number(row?.eisApprovedAmount).toLocaleString("en-BD") ?? "--")}</Typography>
                      <Typography variant="body2" style={{ fontWeight: 700 }}>{getPaymentTypeString(row.eisPaymentType)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      {getStatusChip(row)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleApprove([row.id])}
                        style={{ marginLeft: 6 }}
                      >
                        Process
                      </Button>
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
        <Box mt={2} display="flex" justifyContent="flex-end" alignItems="center" gap="8px">
          {selectedIds.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedIds.length}
              onClick={() => handleApprove(selectedIds)}
            >
              Approve Selected
            </Button>
          )}
        </Box>

      <BeneficiaryManageModal
        open={openModal}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          loadData(); // Re-fetch table data after modal action
        }}
        beneficiary={selectedBeneficiary}
      />
    </Box>
  );
};

export default BeneficiaryPaymentProcess;
