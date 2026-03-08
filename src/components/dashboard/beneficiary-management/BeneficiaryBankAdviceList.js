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

import {
  fetchWorkforceEisPaymentDisbursementStage,
  createWorkforceEisPaymentDisbursement,
  deleteWorkforceEisPaymentStage,
  fetchWorkforceFactoriesSummary,
  fetchWorkforceAllAssociationSummary,
  fetchWorkforceEisBankAdvice,
  updateWorkforceEisBankAdvice
} from "../../../actions";
import { useModulesManager, PublishedComponent } from "@openimis/fe-core";
import { getPaymentTypeString, getRelationString, safeDecodeId, safeParse } from "../../../utils/utils";
import GenerateBeneficiaryAdvice from "./GenerateBeneficiaryAdvice";


const BeneficiaryBankAdviceList = () => {
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
  const [pendingAdviceId, setpendingAdviceId] = useState(null);
  const [factories, setFactories] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [disableApproval, setDisableApproval]= useState(false);
  const [selectedAdviceId, setSelectedAdviceId]= useState(null);
  const [paymentData, setPaymentData]= useState([]);

  const [btnLoading, setBtnLoading]= useState(false);


  const openApproveConfirm = (id) => {
    setpendingAdviceId(id);
    setConfirmOpen(true);
  };

  const closeApproveConfirm = () => {
    setConfirmOpen(false);
    setpendingAdviceId([]);
  };

  const handleApprove = async (id) => {
    try {
      await dispatch(updateWorkforceEisBankAdvice(safeDecodeId(id)));
      loadData();
    } catch (error) {
      loadData();
    }
  }



  const [filters, setFilters] = useState({
    month: currentMonth,
    year: currentYear,
    isConfirmed: null,
  });


  const loadData = async () => {
    setLoading(true);
    try {
      const [processRes] = await Promise.all([
        dispatch(fetchWorkforceEisBankAdvice({
          month: filters.month,
          year: filters.year,
          isConfirmed: filters.isConfirmed,
        }, modulesManager)),

      ]);

      setData(processRes?.payload?.data?.workforceEisBankAdvice || []);

    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    let confirmedExists= data.filter(d=> d.isConfirmed==true);
    if (confirmedExists.length>0)
    {
      setDisableApproval(true);
    }
  }, [dispatch, modulesManager, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ month: currentMonth, year: currentYear, isConfirmed: null});
  };

  const getStatusChip = (isConfirmed) => {
    if (isConfirmed) return (<Chip label="Confirmed" size="small" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />);
    return <Chip label={"Not Confirmed Yet"} size="small"  style={{ backgroundColor: '#f5d5d5', color: '#7d2e2e' }} />;
  };


  const handleAdviceView = async (adviceId) =>{
    setBtnLoading(true);
    const response = await dispatch(fetchWorkforceEisPaymentDisbursementStage({workforceEisBankAdviceId: safeDecodeId(adviceId)}, modulesManager))
    const dataList= response?.payload?.data?.workforceEisPaymentDisbursementStage?? [];
    setPaymentData(dataList)
    setBtnLoading(false);
  };



  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 4 }}>
            List of Processed Bank Advice
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Confirm Bank Advice that are approved
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
              value={filters.year || currentYear}
              onChange={handleFilterChange}
            >
              {yearOptions.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              name="isConfirmed"
              variant="outlined"
              size="small"
              value={filters.isConfirmed || null}
              onChange={handleFilterChange}
            >
              <MenuItem key={null} value={null}>All</MenuItem>
              <MenuItem key={true} value={true}>Confirmed</MenuItem>
              <MenuItem key={false} value={false}>Not Confirmed</MenuItem>
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
                <TableCell align="center" style={{ fontWeight: 600 }}>
                  Serial
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>Advice Date</TableCell>
                <TableCell align="center" style={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" style={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {


                return (
                  <TableRow key={row.id} hover>
                    <TableCell align="center">
                      {index+1}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(row?.adviceDate).toLocaleDateString("BD-en")|| "N/A"}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" style={{ fontWeight: 700 }}>{getStatusChip(row?.isConfirmed)}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => 
                          {
                            await handleAdviceView(row?.id);
                            // setSelectedAdviceId(row?.id);
                            // if (selectedAdviceId && selectedAdviceId !==null)
                            // {
                              setOpenGenerateBeneficiaryAdvice(true);
                            // }

                            // setTimeout(() => {
                            //   setOpenGenerateBeneficiaryAdvice(true);
                            // }, 800);
                          }
                        }
                      >
                        {btnLoading? "Loading...": "View Advice"}
                      </Button>
                      {!row?.isConfirmed ? (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openApproveConfirm(row.id)}
                            style={{ marginLeft: 6 }}
                          >
                            Confirm Now
                          </Button>
                        </>
                      ):(
                        <>
                          {/* <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleRevert(row.id)}
                            style={{ marginLeft: 6 }}
                          >
                            Revert
                          </Button> */}
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

      <Dialog open={confirmOpen} onClose={closeApproveConfirm}>
        <DialogTitle>Confirm Selected Bank Advice</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to Confirm the selected bank advice?

          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeApproveConfirm} color="default">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await handleApprove(pendingAdviceId);
              closeApproveConfirm();
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>


      <GenerateBeneficiaryAdvice
        open={openGenerateBeneficiaryAdvice}
        onClose={() => setOpenGenerateBeneficiaryAdvice(false)}
        paymentData={paymentData}
        month= {filters.month}
        year={filters.year}
        fromAdviceList= {true}
      />
    </Box>


  );

};

export default BeneficiaryBankAdviceList;
