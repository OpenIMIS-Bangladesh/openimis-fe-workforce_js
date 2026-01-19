import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, CircularProgress, Box, TextField, MenuItem, Grid, Button, Chip
} from "@material-ui/core";
import ClearAllIcon from '@material-ui/icons/ClearAll';
import SearchIcon from '@material-ui/icons/Search';

import { 
  fetchEisPaymentProcess, 
  fetchWorkforceFactoriesSummary, 
  fetchWorkforceAllAssociationSummary, 
  fetchEisPaymentProcessWithFilters
} from "../../../actions";
import { useModulesManager } from "@openimis/fe-core";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";


const BeneficiaryManagement = () => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [factories, setFactories] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);

  const [filters, setFilters] = useState({
    trackingNo: "",
    factory: "",
    association: "",
    beneficiaryId: ""
  });

  // 1. Updated Fetching Logic to accept filter parameters
  const loadData = async () => {
    setLoading(true);
    try {
        console.log("Applying Filters:", filters);
      // Pass the filter state directly to the backend action
      const [processRes, factoryRes, assocRes] = await Promise.all([
        dispatch(fetchEisPaymentProcessWithFilters({
            workforceApplicationTrackingNumber: filters.trackingNo,
            workforceFactoryId: safeDecodeId(filters.factory)??"",
            allAssociationId: safeDecodeId(filters.association)??"",
            beneficiaryId: filters.beneficiaryId
        }, modulesManager)),
        dispatch(fetchWorkforceFactoriesSummary(modulesManager, [])),
        dispatch(fetchWorkforceAllAssociationSummary(modulesManager, []))
      ]);

      setData(processRes?.payload?.data?.workforceEisPaymentProcess || []);
      setFactories(factoryRes?.payload?.data?.workforceEmployerFactories?.edges || []);
      setAssociations(assocRes?.payload?.data?.workforceAllAssociation?.edges || []);
      
    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
    // Dependency includes filters so it updates when they change
  };

  useEffect(() => {
    loadData();
  }, [dispatch, modulesManager]);

  // 2. Filter Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ trackingNo: "", factory: "", association: "", beneficiaryId: "" });
  };

  // 3. Status Chip Helper
  const getStatusChip = (row) => {
    if (row?.beneficiaryStatus ==="eligible") return <Chip label="Eligible" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />;
    if (row?.beneficiaryStatus ==="closed") return <Chip label="Closed" size="small" style={{ backgroundColor: '#f5e8e8ff', color: '#7d2e2eff' }}/>;
    if (row?.beneficiaryStatus ==="hold") return <Chip label="On Hold" size="small" style={{ backgroundColor: '#f5f4e8ff', color: '#787d2eff' }} />;
    return <Chip label={row?.beneficiaryStatus} size="small" variant="outlined" />;
  };

  const handleSearchClick = () => {
    loadData();
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
        <CircularProgress size={30} />
        <Box mt={2}><Typography variant="caption">Loading Report Data...</Typography></Box>
      </Box>
    );
  }

  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      {/* Header Area */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 4 }}>
            Beneficiary Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage and track beneficiaries, their payment statuses, and related details.
          </Typography>
        </Box>
      </Box>

      {/* Filter Card */}
      <Paper elevation={0} style={{ padding: '24px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #eceff1' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth label="Tracking No" name="trackingNo" variant="outlined" size="small"
              value={filters.trackingNo} onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth label="Beneficiary ID" name="beneficiaryId" variant="outlined" size="small"
              value={filters.beneficiaryId} onChange={handleFilterChange}
            />
          </Grid>
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
          <Grid item xs={12} md={2}>
            <Box display="flex" gap="8px">
            
              <Button onClick={handleSearchClick} fullWidth variant="primary" color="default" startIcon={<SearchIcon />}>
                Search
              </Button>
              <Button onClick={clearFilters} fullWidth variant="text" color="default" startIcon={<ClearAllIcon />}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Card */}
      <TableContainer component={Paper} elevation={0} style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead style={{ backgroundColor: '#f8fafd' }}>
            <TableRow>
              <TableCell style={{ fontWeight: 600 }}>Beneficiary Details</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Worker, Factory & Association</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Payment Method</TableCell>
              <TableCell align="right" style={{ fontWeight: 600 }}>Amounts</TableCell>
              <TableCell align="center" style={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="center" style={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Using raw data directly as it's now filtered by the backend */}
            {data.map((row) => {
              const dep = row?.workforceEmployeeDependent?.[0] || {};
              const worker = row?.workforceApplication?.applicationType === "financialAssistance" || 
                             row?.workforceApplication?.applicationType === "deadlyGrant" 
                             ? safeParse(row?.workforceApplication?.deceasedWorkerInfo)?.nameBn 
                             : row?.workforceApplication?.workforceEmployee?.firstNameBn+ " " + row?.workforceApplication?.workforceEmployee?.lastNameBn;

              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" style={{ fontWeight: 600 }}>{dep?.nameEn || dep?.nameBn || row?.workforceApplication?.workforceEmployee?.firstNameBn+ " " + row?.workforceApplication?.workforceEmployee?.lastNameBn || "—"}</Typography>
                    <Typography variant="caption" color="primary">{getRelationString(dep)}</Typography>
                    <Box mt={0.5}><Chip label={row.beneficiaryId} size="small" variant="outlined" style={{ height: 20, fontSize: 10 }} /></Box>
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
                    <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(row.eisInitialMonthlyAmount).toLocaleString("en-BD") ?? Number(row.eisMonthlyAmount).toLocaleString("en-BD")}</Typography>
                    <Typography variant="caption" color="textSecondary">{"Total: "+ (Number(row?.eisApprovedAmount).toLocaleString("en-BD") ?? "--")}</Typography>
                    <Typography variant="body2" style={{ fontWeight: 700 }}>{getPaymentTypeString(row.eisPaymentType)}</Typography>
                  </TableCell>

                  <TableCell align="center">
                    {getStatusChip(row)}
                  </TableCell>

                  <TableCell>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => {
                            // Implement view details action
                            alert(`open beneficiary management modal with the beneficiary ID: ${row.beneficiaryId}`);
                        }}
                    >
                      Manage Beneficiary
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
    </Box>
  );
};

export default BeneficiaryManagement;