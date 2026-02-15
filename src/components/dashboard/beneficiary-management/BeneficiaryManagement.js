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
import { useModulesManager, PublishedComponent } from "@openimis/fe-core";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";
import BeneficiaryManageModal from "../modals/BeneficiaryManageModal";
import AssociationManageModal from "../modals/AssociationManageModal";


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
    beneficiaryId: "",
    approvalDateFrom: "",
    approvalDateTo: ""
  });

  const [openModal, setOpenModal] = useState(false);
  const [openAssociationModal, setOpenAssociationModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedAssiciation, setSelectedAssociation] = useState(null);

  const handleOpenModal = (row) => {
    setSelectedBeneficiary(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBeneficiary(null);
  };

  const handleOpenAssociationModal = () => {
    setSelectedAssociation(filters.association);
    setOpenAssociationModal(true);
  };

  const handleCloseAssociationModal = () => {
    setOpenAssociationModal(false);
    setSelectedAssociation(null);
  };


  // 1. Updated Fetching Logic to accept filter parameters
  const loadData = async () => {
    setLoading(true);
    try {
      // Pass the filter state directly to the backend action
      dispatch(fetchWorkforceFactoriesSummary(modulesManager, [])).then(factoryRes => {
        setFactories(factoryRes?.payload?.data?.workforceEmployerFactories?.edges || []);
      });
      dispatch(fetchWorkforceAllAssociationSummary(modulesManager, [])).then(assocRes => {
        setAssociations(assocRes?.payload?.data?.workforceAllAssociation?.edges || []);
      });
      const [processRes] = await Promise.all([
        dispatch(fetchEisPaymentProcessWithFilters({
            workforceApplicationTrackingNumber: filters.trackingNo,
            workforceFactoryId: safeDecodeId(filters.factory)??"",
            allAssociationId: safeDecodeId(filters.association)??"",
            beneficiaryId: filters.beneficiaryId,
            status: "active",
            approved: "yes",
            approvalDateFrom: filters.approvalDateFrom,
            approvalDateTo: filters.approvalDateTo
        }, modulesManager)),
      ]);

      setData(processRes?.payload?.data?.workforceEisPaymentProcess || []);
      
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
    loadData(); // Trigger data reload on filter change
  };

  const handleDateChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        loadData(); // Trigger data reload on date change
    };


  const clearFilters = () => {
    setFilters({ trackingNo: "", factory: "", association: "", beneficiaryId: "", approvalDateFrom: "", approvalDateTo: "" });
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


  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      {/* Header Area */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-end">
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth label="Application Tracking No" name="trackingNo" variant="outlined" size="small"
              value={filters.trackingNo} onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <Box mb style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px 12px'}} display="flex" alignItems="center">
              <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label="Approval Date From"
                  value={filters.approvalDateFrom}
                  onChange={(date) => handleDateChange("approvalDateFrom", date)}
                  required
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px 12px'}} display="flex" alignItems="center">
              <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label="Approval Date To"
                  value={filters.approvalDateTo}
                  onChange={(date) => handleDateChange("approvalDateTo", date)}
                  required
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap="8px">
              <Button onClick={handleSearchClick} fullWidth variant="contained" color="primary" startIcon={<SearchIcon />}>
                Search
              </Button>
              <Button onClick={clearFilters} fullWidth variant="text" color="default" startIcon={<ClearAllIcon />}>
                Reset
              </Button>
              {filters.association != "" && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAssociationModal}
                >
                  Manage Association
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {loading?(
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ):
      (
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
                              : row?.workforceApplication?.workforceEmployee?.firstNameBn;

                return (
                  <TableRow key={row.id} hover>
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
                      <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(row.payableAmount).toLocaleString("en-BD") ?? Number(row.payableAmount).toLocaleString("en-BD")}</Typography>
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
                        onClick={() => handleOpenModal(row)}
                      >
                        Manage
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

      <BeneficiaryManageModal
        open={openModal}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
          loadData(); // 👈 re-fetch table data
        }}
        beneficiary={selectedBeneficiary}
      />
      <AssociationManageModal
        open={openAssociationModal}
        onClose={handleCloseAssociationModal}
        onSuccess={() => {
          handleCloseAssociationModal();
          loadData();
        }}
        association={associations.find(a => a.node.id === filters.association)?.node}
      />
    </Box>
  );
};

export default BeneficiaryManagement;