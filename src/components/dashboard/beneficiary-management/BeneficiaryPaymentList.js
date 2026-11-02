import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import SearchIcon from "@material-ui/icons/Search";

import {
  fetchWorkforceEisBeneficiaries,
  fetchWorkforceEisBeneficiaryPayments,
} from "../../../actions";
import { getPaymentTypeString } from "../../../utils/utils";

const BeneficiaryPaymentList = () => {
  const dispatch = useDispatch();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const [filters, setFilters] = useState({ year: "", month: "" });
  const [beneficiaryInput, setBeneficiaryInput] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const beneficiaryRequest = useRef(0);
  const paymentRequest = useRef(0);

  const handleBeneficiaryInputChange = async (event, value, reason) => {
    setBeneficiaryInput(value);
    if (reason === "reset") return;

    setSelectedBeneficiary(null);
    const requestId = ++beneficiaryRequest.current;
    setError("");
    if (!value.trim()) {
      setBeneficiaries([]);
      setLoadingBeneficiaries(false);
      return;
    }
    if (reason !== "input") return;

    setLoadingBeneficiaries(true);
    try {
      const response = await dispatch(fetchWorkforceEisBeneficiaries({
        beneficiaryId: value.trim(),
      }));
      if (requestId !== beneficiaryRequest.current) return;
      if (response?.error || response?.payload?.errors) {
        throw new Error("Unable to load beneficiary IDs.");
      }
      setBeneficiaries(response?.payload?.data?.workforceEisBeneficiaries || []);
    } catch (loadError) {
      if (requestId !== beneficiaryRequest.current) return;
      setBeneficiaries([]);
      setError(loadError.message || "Unable to load beneficiary IDs.");
    } finally {
      if (requestId === beneficiaryRequest.current) {
        setLoadingBeneficiaries(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!selectedBeneficiary?.beneficiaryId) {
      setError("Select a beneficiary ID before searching.");
      return;
    }

    const requestId = ++paymentRequest.current;
    setLoading(true);
    setError("");
    try {
      const response = await dispatch(fetchWorkforceEisBeneficiaryPayments({
        beneficiaryId: selectedBeneficiary.beneficiaryId,
        year: filters.year,
        month: filters.month,
      }));
      if (response?.error || response?.payload?.errors) {
        throw new Error("Unable to load beneficiary payments.");
      }
      if (requestId !== paymentRequest.current) return;
      setData(response?.payload?.data?.workforceEisBeneficiaryPayments || []);
    } catch (loadError) {
      if (requestId !== paymentRequest.current) return;
      setData([]);
      setError(loadError.message || "Unable to load beneficiary payments.");
    } finally {
      if (requestId === paymentRequest.current) setLoading(false);
    }
  };

  const clearFilters = () => {
    beneficiaryRequest.current += 1;
    paymentRequest.current += 1;
    setFilters({ year: "", month: "" });
    setBeneficiaryInput("");
    setSelectedBeneficiary(null);
    setBeneficiaries([]);
    setLoadingBeneficiaries(false);
    setLoading(false);
    setData([]);
    setError("");
  };

  const totalPaidAmount = data.reduce(
    (total, row) => total + (Number(row?.paidAmount) || 0),
    0,
  );
  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB");
  };

  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      <Box mb={2}>
        <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 4 }}>
          Beneficiary Payment Report
        </Typography>
      </Box>

      <Paper
        elevation={0}
        style={{
          padding: 24,
          marginBottom: 24,
          borderRadius: 12,
          border: "1px solid #eceff1",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              options={beneficiaries}
              value={selectedBeneficiary}
              inputValue={beneficiaryInput}
              loading={loadingBeneficiaries}
              getOptionLabel={(option) => option?.beneficiaryId || ""}
              getOptionSelected={(option, value) => option?.id === value?.id}
              onInputChange={handleBeneficiaryInputChange}
              onChange={(event, beneficiary) => {
                setSelectedBeneficiary(beneficiary);
                setBeneficiaryInput(beneficiary?.beneficiaryId || "");
                setError("");
              }}
              noOptionsText={beneficiaryInput ? "No beneficiary IDs found" : "Enter a beneficiary ID"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Beneficiary ID"
                  variant="outlined"
                  size="small"
                  error={!selectedBeneficiary && Boolean(error)}
                  helperText={!selectedBeneficiary && error ? error : ""}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingBeneficiaries ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Year"
              name="year"
              variant="outlined"
              size="small"
              value={filters.year}
              onChange={(event) => setFilters((prev) => ({ ...prev, year: event.target.value }))}
            >
              <MenuItem value=""><em>All Years</em></MenuItem>
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
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
              value={filters.month}
              onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
            >
              <MenuItem value=""><em>All Months</em></MenuItem>
              {monthOptions.map((month) => (
                <MenuItem key={month} value={month}>{monthNames[month - 1]}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box display="flex" gridGap={8}>
              <Button
                onClick={handleSearch}
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                disabled={loading}
              >
                Search
              </Button>
              <Button
                onClick={clearFilters}
                fullWidth
                variant="text"
                color="default"
                startIcon={<ClearAllIcon />}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && selectedBeneficiary && (
        <Box mb={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          style={{ borderRadius: 12, border: "1px solid #e0e0e0" }}
        >
          <Table>
            <TableHead style={{ backgroundColor: "#f8fafd" }}>
              <TableRow>
                <TableCell style={{ fontWeight: 600 }}>Beneficiary ID</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Year</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Month</TableCell>
                <TableCell align="right" style={{ fontWeight: 600 }}>Paid Amount</TableCell>
                <TableCell style={{ fontWeight: 600 }}>EIS Payment Type</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Installment Number</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Processing Date</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Disbursement Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id || `${row.beneficiaryId}-${row.year}-${row.monthIndex}-${row.installmentNumber}`}>
                  <TableCell>{row.beneficiaryId || "—"}</TableCell>
                  <TableCell>{row.year || "—"}</TableCell>
                  <TableCell>
                    {monthNames[Number(row.monthIndex) - 1] || row.monthIndex || "—"}
                  </TableCell>
                  <TableCell align="right">
                    {(Number(row.paidAmount) || 0).toLocaleString("en-BD")}
                  </TableCell>
                  <TableCell>{getPaymentTypeString(row.eisPaymentType) || row.eisPaymentType || "—"}</TableCell>
                  <TableCell>{row.installmentNumber || "—"}</TableCell>
                  <TableCell>{formatDate(row.processingDate)}</TableCell>
                  <TableCell>{formatDate(row.disbursementDate)}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">
                      {selectedBeneficiary ? "No payments found." : "Select a beneficiary ID to search for payments."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} style={{ fontWeight: 700 }}>
                  Total ({data.length} {data.length === 1 ? "row" : "rows"})
                </TableCell>
                <TableCell align="right" style={{ fontWeight: 700 }}>
                  {totalPaidAmount.toLocaleString("en-BD")}
                </TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BeneficiaryPaymentList;
