import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, CircularProgress, Box, TextField, MenuItem, Grid, Button, Chip
} from "@material-ui/core";
import ClearAllIcon from '@material-ui/icons/ClearAll';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';
import EmailIcon from '@material-ui/icons/Email';
import BlockIcon from '@material-ui/icons/Block';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ListIcon from '@material-ui/icons/List';

import {
  fetchEisPaymentProcess,
  fetchWorkforceFactoriesSummary,
  fetchWorkforceAllAssociationSummary,
  fetchEisPaymentProcessWithFilters,
  sendSmsNotification,
  confirmNoa,
  blockNoa
} from "../../../actions";
import { useModulesManager, PublishedComponent } from "@openimis/fe-core";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";
import BeneficiaryManageModal from "../modals/BeneficiaryManageModal";
import BeneficiaryEditModal from "../modals/BeneficiaryEditModal";
import AssociationManageModal from "../modals/AssociationManageModal";
import IncrementDecrementModal from "../modals/IncrementDecrementModal";
import GenerateNoaView from "./GenerateNoaView";
import { shortenUrl } from "../../../utils/verificationHelper";


const BeneficiaryNoaConfirmation = () => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [factories, setFactories] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [searchBtnClicked, setSearchBtnClicked] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
    trackingNo: "",
    factory: "",
    association: "",
    beneficiaryId: "",
    approvalDateFrom: "",
    approvalDateTo: "",
    accidentDateFrom: "",
    accidentDateTo: ""
  });

  const [openNoaModal, setOpenNoaModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedAssiciation, setSelectedAssociation] = useState(null);



  const handleSendSms = async (row, name) => {
    try {
      const longUrl= window.location.origin+`/front/noa/confirmation?process_id=${safeDecodeId(row.id)}`;
      const link = longUrl;
      // const link = await shortenUrl(longUrl);

      const message = `Hi, ${name}, Please Download EIS NOA From ${link}`;

      await dispatch(sendSmsNotification(row.phoneNumber, message));

      await dispatch(confirmNoa(safeDecodeId(row.id), true, false));

      alert("Message Sent!");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to send SMS");
    }
  };

  const handleOpenNoaModal = (row) => {
    setSelectedBeneficiary(row);
    setOpenNoaModal(true);
  };

  const handleCloseNoaModal = () => {
    setOpenNoaModal(false);
    setSelectedBeneficiary(null);
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


  // 1. Updated Fetching Logic to accept filter parameters
  const loadData = async () => {
    setLoading(true);
    try {
      // Pass the filter state directly to the backend action
      dispatch(fetchWorkforceFactoriesSummary(modulesManager, [])).then(factoryRes => {
        setFactories(factoryRes?.payload?.data?.workforceEmployerFactories?.edges || []);
      });
      dispatch(fetchWorkforceAllAssociationSummary([])).then(assocRes => {
        setAssociations(assocRes?.payload?.data?.workforceAllAssociation?.edges || []);
      });
      const [processRes] = await Promise.all([
        dispatch(fetchEisPaymentProcessWithFilters({
          workforceApplicationTrackingNumber: filters.trackingNo,
          workforceFactoryId: safeDecodeId(filters.factory) ?? "",
          allAssociationId: safeDecodeId(filters.association) ?? "",
          beneficiaryId: filters.beneficiaryId,
          status: "active",
          approved: "yes",
          approvalDateFrom: filters.approvalDateFrom ?? "",
          approvalDateTo: filters.approvalDateTo ?? "",
          accidentDateFrom: filters.accidentDateFrom ?? "",
          accidentDateTo: filters.accidentDateTo ?? "",
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
    if (name !== "approvalDateFrom" && name !== "approvalDateTo" && name !== "accidentDateFrom" && name !== "accidentDateTo") {
      loadData(); // Trigger data reload on filter change
    }
    // loadData(); // Trigger data reload on filter change
  };

  const handleDateChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    // loadData(); // Trigger data reload on date change
  };


  const clearFilters = () => {
    setFilters({ trackingNo: "", factory: "", association: "", beneficiaryId: "", approvalDateFrom: "", approvalDateTo: "", accidentDateFrom: "", accidentDateTo: "" });
  };

  // 3. Status Chip Helper
  const getStatusChip = (row) => {
    if (row?.beneficiaryStatus === "eligible") return <Chip label="Eligible" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />;
    if (row?.beneficiaryStatus === "closed") return <Chip label="Closed" size="small" style={{ backgroundColor: '#f5e8e8ff', color: '#7d2e2eff' }} />;
    if (row?.beneficiaryStatus === "hold") return <Chip label="On Hold" size="small" style={{ backgroundColor: '#f5f4e8ff', color: '#787d2eff' }} />;
    return <Chip label={row?.beneficiaryStatus} size="small" variant="outlined" />;
  };
  const getNoaStatusChip = (row) => {
    if (row?.noaBlocked) return <Chip label="NOA Blocked" size="small" style={{ backgroundColor: '#f5e8e8', color: '#7d2e2e' }} />;
    if (row?.noaConfirmed) return <Chip label="Noa Confirmed" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />;
    if (row?.noaSmsSent) return <Chip label="NOA SMS Sent" size="small" style={{ backgroundColor: 'rgb(242, 245, 232)', color: 'rgb(113, 125, 46)' }} />;
    return <Chip label={"NOA Not Confirmed Yet"} size="small" style={{ backgroundColor: '#f5e8e8ff', color: '#7d2e2eff' }} />;
  };

  const handleSearchClick = () => {
    loadData();
  };

  const handleConfirmNoa = (row) => {
    dispatch(confirmNoa(safeDecodeId(row.id), true, true)).then(response => {
      alert("NOA for selected user was confirmed Manually!");
      loadData();
    });
  };

  const handleBlockNoa = (row, isBlocked) => {
    dispatch(blockNoa(safeDecodeId(row.id), isBlocked)).then(response => {
      if (isBlocked) {
        alert("NOA Downloading for selected user is BLOCKED!");
      }
      else {
        alert("NOA Downloading for selected user is UNBLOCKED!");
      }
      loadData();
    });
  };


  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      {/* Header Area */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 4 }}>
            Beneficiary NOA Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage NOA of beneficiaries, confirm NOA details, and perform necessary actions for each beneficiary.
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
          <Grid item xs={12} md={6}>
            <Box display="flex" gap="8px">
              <Button onClick={handleSearchClick} fullWidth variant="contained" color="primary" startIcon={<SearchIcon />}>
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
      ) :
        (
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
                  <TableCell align="center" style={{ fontWeight: 600 }}>NOA Status</TableCell>
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
                      <TableCell padding="checkbox" align="center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleRowSelect(row.id)}
                        // disabled={row?.isDisbursed}
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
                        <Typography variant="caption" color="textSecondary">{"A/C: " + row.bankAccountNo}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" style={{ fontWeight: 700 }}>{Number(row.payableAmount).toLocaleString("en-BD") ?? Number(row.payableAmount).toLocaleString("en-BD")}</Typography>
                        <Typography variant="caption" color="textSecondary">{"Total: " + (Number(row?.eisApprovedAmount).toLocaleString("en-BD") ?? "--")}</Typography>
                        <Typography variant="body2" style={{ fontWeight: 700 }}>{getPaymentTypeString(row.eisPaymentType)}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        {getStatusChip(row)}
                      </TableCell>
                      <TableCell align="center">
                        {getNoaStatusChip(row)}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          title="View NOA"
                          onClick={() => handleOpenNoaModal(row)}
                          style={{ margin: "5px" }}
                        >
                          View NOA
                        </Button>
                        {row.noaBlocked ? (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<LockOpenIcon />}
                            onClick={() => handleBlockNoa(row, false)}
                            style={{ margin: "5px" }}
                          >
                            Unblock NOA Download
                          </Button>
                        ) : (
                          <>
                            {!row.noaSmsSent ? (
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
                                Send Confirmation SMS
                              </Button>
                            ) : !row.noaConfirmed ? (
                              <>
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
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleConfirmNoa(row)}
                                  style={{ margin: "5px" }}
                                >
                                  Confirm NOA Manually
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                startIcon={<BlockIcon />}
                                onClick={() => handleBlockNoa(row, true)}
                                style={{ margin: "5px" }}
                              >
                                Block NOA Download
                              </Button>
                            )}
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


      {selectedBeneficiary != null &&
        (
          <GenerateNoaView
            open={openNoaModal}
            onClose={handleCloseNoaModal}
            onSuccess={() => {
              handleCloseNoaModal();
              loadData();
            }}
            row={selectedBeneficiary}
          />

        )}
    </Box>
  );
};

export default BeneficiaryNoaConfirmation;