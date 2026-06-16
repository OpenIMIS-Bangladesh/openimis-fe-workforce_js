import React, { useState, useEffect, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab, Grid, Typography, Divider, IconButton, Button, Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush,
  withModulesManager,
  withHistory,
  withTooltip,
  FormattedMessage,
} from "@openimis/fe-core";
import { MODULE_NAME } from "../../constants";
import { fetchWorkforceBankManagement } from "../../actions";
import { Searcher } from "@openimis/fe-core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { makeStyles } from "@material-ui/core/styles";
import { safeDecodeId } from "../../utils/utils";
import BankBranchModal from "../../components/shared/modals/BankBranchModal";

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
  tableTitle: theme.table.title,
  filterContainer: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  filterField: {
    marginRight: theme.spacing(2),
    minWidth: 200,
  },
}));

const WorkforceBanksPage = () => {

  const dispatch = useDispatch();
  const [banks, setBanks] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const classes = useStyles();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // "bank" or "branch"

  // State
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");

  // Instance variables configuration
  const rowsPerPageOptions = [10, 20, 50, 100];
  const defaultPageSize = 10;

  // Actions / Methods
  const fetchBanks = () => {
    dispatch(fetchWorkforceBankManagement({ banksOnly: true })).then(response => {
      setBanks(response?.payload?.data?.workforceBankManagement || []);
    });
  };

  const fetchDistricts = () => {
    dispatch(fetchWorkforceBankManagement({ districtsOnly: true })).then(response => {
      setDistricts(response?.payload?.data?.workforceBankManagement || []);
    });
  };

  const fetchBranches = (bankId = null, districtCode = null) => {
    dispatch(fetchWorkforceBankManagement({
      banksOnly: false,
      districtsOnly: false,
      bankId: bankId || "",
      districtCode: districtCode || "",
    })).then(response => {
      setBranches(response?.payload?.data?.workforceBankManagement || []);
    });
  };

  // Lifecycle emulation (componentDidMount)
  useEffect(() => {
    fetchBanks();
    fetchDistricts();
  }, [dispatch]);


  // Handlers
  const handleDistrictChange = (event) => {
    const value = event.target.value;
    setSelectedDistrictCode(value);
    fetchBranches(safeDecodeId(selectedBankId), value);
  };

  const handleBankChange = (event) => {
    const value = event.target.value;
    setSelectedBankId(value);
    fetchBranches(safeDecodeId(value), selectedDistrictCode);
  };

  const handleOpenModal = (mode) => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalMode(null);
  };

  const handleModalSuccess = () => {
    // Refresh data after successful submission
    fetchBanks();
    fetchDistricts();
    fetchBranches(safeDecodeId(selectedBankId), selectedDistrictCode);
  };

  const rowIdentifier = (r) => r.id || r.bankCode || Math.random();


  const getUniqueDistricts = (data) => {
    const districtMap = {};
    data.forEach((item) => {
      if (item.districtCode && item.districtNameEn) {
        districtMap[item.districtCode] = {
          districtCode: item.districtCode,
          districtNameEn: item.districtNameEn,
          districtNameBn: item.districtNameBn,
        };
      }
    });
    return Object.values(districtMap);
  };


  const uniqueDistricts = getUniqueDistricts(districts);

  return (
    <div className={classes.page}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal("bank")}
            >
              Add Bank
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal("branch")}
              style={{marginLeft:"15px"}}
            >
              Add Branch
            </Button>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" className={classes.tableTitle}>
            <FormattedMessage module={MODULE_NAME} id="workforce.banks.title" />
          </Typography>
          <Divider />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name (EN)</TableCell>
                  <TableCell>Name (BN)</TableCell>
                  <TableCell>Bank Code</TableCell>
                  <TableCell>Routing Number</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banks?.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell>{bank.nameEn}</TableCell>
                    <TableCell>{bank.nameBn}</TableCell>
                    <TableCell>{bank.bankCode}</TableCell>
                    <TableCell>{bank.routingNumber}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedBankId(safeDecodeId(bank.id));
                          fetchBranches(safeDecodeId(bank.id), selectedDistrictCode);
                        }}
                        style={{
                          backgroundColor:
                            selectedBankId === bank.id ? "#1976d2" : "transparent",
                          color:
                            selectedBankId === bank.id ? "#fff" : "#1976d2",
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" className={classes.tableTitle}>
            <FormattedMessage module={MODULE_NAME} id="workforce.banks.branches.title" />
          </Typography>
          <Divider />
          <div className={classes.filterContainer}>
            <select
              className={classes.filterField}
              value={selectedBankId || ""}
              onChange={handleBankChange}
              style={{ padding: "8px", marginRight: "16px" }}
            >
              <option value="">All Banks</option>
              {banks?.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.nameEn} - {bank.nameBn}
                </option>
              ))}
            </select>
            <select
              className={classes.filterField}
              value={selectedDistrictCode || ""}
              onChange={handleDistrictChange}
              style={{ padding: "8px" }}
            >
              <option value="">All Districts</option>
              {uniqueDistricts?.map((district) => (
                <option key={district.districtCode} value={district.districtCode}>
                  {district.districtNameEn} - {district.districtNameBn}
                </option>
              ))}
            </select>
          </div>
          <Divider />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name (EN)</TableCell>
                  <TableCell>Name (BN)</TableCell>
                  <TableCell>Routing Number</TableCell>
                  <TableCell>Contact Number</TableCell>
                  <TableCell>District</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches?.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>{branch.nameEn}</TableCell>
                    <TableCell>{branch.nameBn}</TableCell>
                    <TableCell>{branch.routingNumber}</TableCell>
                    <TableCell>{branch.contactNumber}</TableCell>
                    <TableCell>
                      {branch.districtNameEn} / {branch.districtNameBn}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      {/* {withTooltip(
        <div className={classes.fab}>
          <Fab color="primary" onClick={() => historyPush(modulesManager, history, "workforce.route.banks.bank")}>
            <AddIcon />
          </Fab>
        </div>,
        <FormattedMessage module={MODULE_NAME} id="workforce.banks.addNewTooltip" />
      )} */}

      <BankBranchModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        districts={districts}
        banks={banks}
      />
    </div>
  );
};


export default WorkforceBanksPage;