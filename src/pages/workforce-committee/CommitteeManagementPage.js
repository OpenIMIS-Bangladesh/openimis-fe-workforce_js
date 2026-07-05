import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  IconButton,
  Chip,
  Checkbox,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Alert from "@material-ui/lab/Alert";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  createWorkforceCommittee,
  createWorkforceCommitteeUserMap,
  fetchWorkforceAllAssociation,
  fetchWorkforceCommittees,
  fetchInteractiveUsers,
  fetchWorkforceCommitteeUserMap,
  updateWorkforceCommitteeUserMap,
  updateWorkforceCommitteeUserMapNoaSignature,
  deleteWorkforceCommitteeUserMap,
  deleteWorkforceCommittee,
  createWorkforceCommitteeUser,
  fetchWorkforceCommitteeUser,
  fetchWorkforceInteractiveUsers,
  updateWorkforceCommittee,
} from "../../actions";
import { fixBrokenUnicode, isBlwfPath, isEisPath, safeDecodeId } from "../../utils/utils";
import AddCommitteeDialog from "./AddCommitteeDialog";
import AddUserDialog from "./AddUserDialog";
import BankAdviceEditModal from "./BankAdviceEditModal";

const useStyles = makeStyles((theme) => ({
  pageContainer: {
    width: "90%",
    margin: "auto",
    marginTop: "40px",
    marginBottom: "40px",
  },
  card: {
    marginBottom: theme.spacing(3),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: "100%",
  },
  submitButton: {
    marginTop: theme.spacing(2),
    height: "56px",
  },
  addButton: {
    marginBottom: theme.spacing(2),
  },
  tableHeader: {
    backgroundColor: theme.palette.grey[100],
    fontWeight: "bold",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  statusChip: {
    marginRight: theme.spacing(1),
  },
  formGrid: {
    marginBottom: theme.spacing(2),
  },
  dialogForm: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  successMessage: {
    marginBottom: theme.spacing(2),
  },
  dialogActions: {
    padding: theme.spacing(2),
    gap: theme.spacing(1),
  },
  noaButton: {
    marginLeft: theme.spacing(1),
  },
  noaSignatureChip: {
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  radioGroupContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    padding: "0 10px",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const CommitteeManagementPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [committees, setCommittees] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [committeeUsers, setCommitteeUsers] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [openAdviceEditModal, setOpenAdviceEditModal] = useState(false);

  const [selectedCommittee, setSelectedCommittee] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [openAddCommitteeDialog, setOpenAddCommitteeDialog] = useState(false);
  const [openEditCommitteeDialog, setOpenEditCommitteeDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

  const [newCommittee, setNewCommittee] = useState({
    nameEn: "",
    nameBn: "",
    description: "",
    status: "ACTIVE",
    includedSectors: [],
  });

  const [newUser, setNewUser] = useState({
    loginName: "",
    representativeName: "",
    representativeNameBn: "",
    organizationName: "",
    designation: "",
    representativeType: "",
    phoneNumber: "",
    email: "",
    officeAddress: "",
    currentAddress: "",
  });

  const [editingCommittee, setEditingCommittee] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [mainDataLoaded, setMainDataLoaded] = useState(false);
  const [committee, setCommittee] = useState(null);

  const currentUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const userRights = useSelector((state) => state.core?.user?.i_user?.rights || []);
  const reduxState = useSelector((state) => state);
  const locale = reduxState?.core?.user?.i_user?.language || "en";

  const fetchCommittees = async (filters = []) => {
    try {
      console.log("Fetching committees with filters:", filters);
      return { committees: [], total: 0 };
    } catch (error) {
      console.error("Failed to fetch committees:", error);
      return { committees: [], total: 0 };
    }
  };

  const deleteCommittee = async (committeeId) => {
    try {
      console.log("Deleting committee:", committeeId);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete committee:", error);
      throw error;
    }
  };

  const mapUserToCommittee = async (committeeId, userId, roleInCommittee) => {
    try {
      const payload = {
        committeeId: safeDecodeId(committeeId),
        userId,
        roleInCommittee,
      };
      console.log("Mapping user to committee:", { committeeId, userId, roleInCommittee });
      await dispatch(createWorkforceCommitteeUserMap(payload, "createWorkforceCommitteeUserMap"));
      setSuccessMessage("Committee Mapped with selected User successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
      return { success: true };
    } catch (error) {
      console.error("Failed to map user to committee:", error);
      throw error;
    }
  };

  const deleteCommitteeMapping = async (mappingId) => {
    try {
      await dispatch(deleteWorkforceCommitteeUserMap(safeDecodeId(mappingId)));
      console.log("Deleting committee-user mapping:", mappingId);
      fetchPreloadData();
      setSuccessMessage("User Mapping deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete mapping:", error);
      throw error;
    }
  };

  const handleRepresentativeToggle = async (mapping) => {
    try {
      const payload = {
        id: safeDecodeId(mapping.id),
        committeeId: safeDecodeId(mapping.committee?.id),
        userId: safeDecodeId(mapping.user?.id),
        isRepresentative: !mapping.isRepresentative,
      };
      await dispatch(updateWorkforceCommitteeUserMap(payload, "updateWorkforceCommitteeUserMap"));
      setSuccessMessage("Representative status updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      console.error("Failed to update representative status:", error);
      alert("Failed to update representative status: " + error.message);
    }
  };

  const fetchPreloadData = async () => {
    try {
      const committeesData = await dispatch(fetchWorkforceCommittees([]));
      setCommittees(committeesData?.payload?.data?.workforceCommittees || []);

      const committeeUsersData = await dispatch(fetchWorkforceCommitteeUser([]));
      setCommitteeUsers(committeeUsersData?.payload?.data?.workforceCommitteeUsers || []);

      const associationsData = await dispatch(fetchWorkforceAllAssociation([]));
      setAssociations(associationsData?.payload?.data?.workforceAllAssociation?.edges || []);

      const mappingsData = await dispatch(fetchWorkforceCommitteeUserMap({}));
      setMappings(mappingsData?.payload?.data?.workforceCommitteeUserMaps || []);
    } catch (error) {
      console.error("Failed to fetch preload data:", error);
    }
  };

  const checkLoginNameExists = async (loginName) => {
    try {
      const result = await dispatch(fetchWorkforceInteractiveUsers({ loginName }));
      const users = result?.payload?.data?.workforceInteractiveUsers || [];
      return users.length > 0;
    } catch (error) {
      console.error("Error checking login name:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchPreloadData();
  }, [dispatch]);

  const handleOpenAddCommitteeDialog = () => {
    setNewCommittee({
      nameEn: "",
      nameBn: "",
      description: "",
      status: "ACTIVE",
      includedSectors: [],
    });
    setOpenAddCommitteeDialog(true);
  };

  const handleCloseAddCommitteeDialog = () => {
    setOpenAddCommitteeDialog(false);
    setNewCommittee({
      nameEn: "",
      nameBn: "",
      description: "",
      status: "ACTIVE",
      includedSectors: [],
    });
  };

  const handleAddCommittee = async () => {
    if (!newCommittee.nameEn || !newCommittee.nameBn) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        nameEn: newCommittee.nameEn,
        nameBn: newCommittee.nameBn,
        organizationType: isEisPath() ? "eis" : !isEisPath() && isBlwfPath() ? "blwf" : "cf",
        associations: JSON.stringify(newCommittee.includedSectors),
      };
      await dispatch(createWorkforceCommittee(payload, "createWorkforceCommittee"));
      setSuccessMessage("Committee created successfully!");
      setOpenAddCommitteeDialog(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      console.error("Error creating committee:", error);
    }
  };

  const handleEditCommittee = (committee) => {
    setEditingCommittee(committee);
    setNewCommittee(committee);
    setOpenEditCommitteeDialog(true);
  };

  const handleCloseEditCommitteeDialog = () => {
    setOpenEditCommitteeDialog(false);
    setEditingCommittee(null);
    setNewCommittee({
      nameEn: "",
      nameBn: "",
      description: "",
      status: "ACTIVE",
      includedSectors: [],
    });
  };

  const handleUpdateCommittee = async () => {
    if (!newCommittee.nameEn || !newCommittee.nameBn) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await dispatch(createWorkforceCommittee(newCommittee, "updateWorkforceCommittee"));
      setSuccessMessage("Committee updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseEditCommitteeDialog();
      fetchPreloadData();
    } catch (error) {
      alert("Failed to update committee: " + error.message);
    }
  };

  const handleDeleteCommittee = async (committeeId) => {
    if (!window.confirm("Are you sure you want to delete this committee?")) {
      return;
    }

    try {
      await dispatch(deleteWorkforceCommittee(safeDecodeId(committeeId)));
      setSuccessMessage("Committee deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      alert("Failed to delete committee: " + error.message);
    }
  };

  const handleSaveMapping = async () => {
    if (!selectedCommittee || !selectedUser || !selectedRole) {
      alert("Please select committee, user, and role");
      return;
    }

    try {
      await mapUserToCommittee(selectedCommittee, safeDecodeId(selectedUser), selectedRole);
      setSelectedCommittee("");
      setSelectedUser("");
      setSelectedRole("");
    } catch (error) {
      alert("Failed to map user to committee: " + error.message);
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    if (!window.confirm("Are you sure you want to delete this mapping?")) {
      return;
    }

    try {
      await dispatch(deleteCommitteeMapping(mappingId));
      setSuccessMessage("Mapping deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      alert("Failed to delete mapping: " + error.message);
    }
  };

  const handleSetNoaSignatureUser = async (committeeId, mapId) => {
    try {
      await dispatch(updateWorkforceCommitteeUserMapNoaSignature(safeDecodeId(committeeId), safeDecodeId(mapId), true, "setNoaSignatureUser"));
      setSuccessMessage("NOA Signature User set successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      alert("Failed to set NOA Signature User: " + error.message);
    }
  };

  const handleRemoveNoaSignatureUser = async (committeeId, mapId) => {
    try {
      await dispatch(updateWorkforceCommitteeUserMapNoaSignature(committeeId, mapId, false, "removeNoaSignatureUser"));
      setSuccessMessage("NOA Signature User removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      alert("Failed to remove NOA Signature User: " + error.message);
    }
  };

  const handleOpenAddUserDialog = () => {
    setNewUser({
      loginName: "",
      representativeName: "",
      representativeNameBn: "",
      organizationName: "",
      designation: "",
      representativeType: "",
      phoneNumber: "",
      email: "",
      officeAddress: "",
      currentAddress: "",
    });
    setOpenAddUserDialog(true);
  };

  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
    setNewUser({
      loginName: "",
      representativeName: "",
      representativeNameBn: "",
      organizationName: "",
      designation: "",
      representativeType: "",
      phoneNumber: "",
      email: "",
      officeAddress: "",
      currentAddress: "",
    });
  };

  const handleAddUser = async () => {
    if (!newUser.loginName || !newUser.representativeName || !newUser.representativeNameBn || !newUser.organizationName || !newUser.representativeType) {
      alert("Please fill in all required fields");
      return;
    }

    const loginNameExists = await checkLoginNameExists(newUser.loginName);
    if (loginNameExists) {
      alert(`Login ID "${newUser.loginName}" already exists. Please use a different Login ID.`);
      return;
    }

    try {
      const payload = {
        loginName: newUser.loginName,
        representativeName: newUser.representativeName,
        representativeNameBn: newUser.representativeNameBn,
        organizationName: newUser.organizationName,
        designation: newUser.designation,
        representativeType: newUser.representativeType,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        officeAddress: newUser.officeAddress,
        currentAddress: newUser.currentAddress,
      };
      await dispatch(createWorkforceCommitteeUser(payload, "createWorkforceCommitteeUser"));
      setSuccessMessage("User created successfully!");
      setOpenAddUserDialog(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user: " + error.message);
    }
  };

  const fetchAssociations = async () => {
    try {
      const response = await dispatch(fetchWorkforceAllAssociation([]));
      setAssociations(response?.payload?.data?.workforceAllAssociation?.edges || []);
    } catch (error) {
      console.error("Failed to fetch associations:", error);
    }
  };

  const handleApprovalProcessChange = async (event, currentCommittee) => {
    event.stopPropagation();
    const newApprovalProcess = event.target.value;

    setCommittees((prevCommittees) => prevCommittees.map((c) => (c.id === currentCommittee.id ? { ...c, approvalType: newApprovalProcess } : c)));

    try {
      const payload = {
        ...currentCommittee,
        id: safeDecodeId(currentCommittee?.id),
        approvalType: newApprovalProcess,
        associations: JSON.stringify(currentCommittee.includedSectors || []),
      };
      await dispatch(updateWorkforceCommittee(payload, "updateWorkforceCommittee"));
      setSuccessMessage("Approval process updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPreloadData();
    } catch (error) {
      alert("Failed to update approval process: " + error.message);
      fetchPreloadData();
    }
  };

  useEffect(() => {
    fetchAssociations();
  }, [dispatch]);

  return (
    <div className={classes.pageContainer}>
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage("")} className={classes.successMessage}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item md={3}>
          <Card className={classes.card} elevation={2} style={{ height: "89%" }}>
            <CardHeader
              title={locale === "fr" ? "কমিটি যোগ করুন" : "Add Committee"}
              subheader={locale === "fr" ? "নতুন কমিটি তৈরি করুন" : "Create a new committee"}
            />
            <CardContent>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddCommitteeDialog} className={classes.addButton}>
                {locale === "fr" ? "যোগ করুন" : "Add"}
              </Button>
            </CardContent>
          </Card>

          <AddCommitteeDialog
            open={openAddCommitteeDialog}
            onClose={handleCloseAddCommitteeDialog}
            onSave={handleAddCommittee}
            committee={newCommittee}
            setCommittee={setNewCommittee}
            associations={associations}
            locale={locale}
          />
        </Grid>
        <Grid item md={3}>
          <Card className={classes.card} elevation={2} style={{ height: "89%" }}>
            <CardHeader
              title={locale === "fr" ? "নতুন ইউজার" : "Create User"}
              subheader={locale === "fr" ? "কমিটির জন্য নতুন ইউজার যোগ করুন" : "Create a new user for committee"}
            />
            <CardContent>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddUserDialog} className={classes.addButton}>
                {locale === "fr" ? "যোগ করুন" : "Add"}
              </Button>
            </CardContent>
          </Card>

          <AddUserDialog
            open={openAddUserDialog}
            onClose={handleCloseAddUserDialog}
            onSave={handleAddUser}
            user={newUser}
            setUser={setNewUser}
            locale={locale}
          />
        </Grid>
        <Grid item md={6}>
          <Card className={classes.card} elevation={2}>
            <CardHeader
              title={locale === "fr" ? "ব্যবহারকারীকে কমিটিতে ম্যাপ করুন" : "Map User to Committee"}
              subheader={locale === "fr" ? "একজন ব্যবহারকারীকে একটি কমিটিতে অ্যাসাইন করুন" : "Assign a user to a committee"}
            />
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={5} className={classes.formGrid}>
                  <Autocomplete
                    id="committee-select-autocomplete"
                    options={committees}
                    getOptionLabel={(option) => (locale === "fr" ? option.nameBn : option.nameEn)}
                    getOptionSelected={(option, value) => option.id === value.id}
                    value={committees.find((c) => c.id === selectedCommittee) || null}
                    onChange={(event, newValue) => {
                      setSelectedCommittee(newValue ? newValue.id : "");
                    }}
                    renderInput={(params) => <TextField {...params} label={locale === "fr" ? "কমিটি নির্বাচন করুন" : "Select Committee"} variant="outlined" />}
                  />
                </Grid>

                <Grid item xs={12} md={5} className={classes.formGrid}>
                  <Autocomplete
                    id="user-select-autocomplete"
                    options={committeeUsers}
                    getOptionLabel={(option) =>
                      locale === "fr"
                        ? `${option.loginName} (${fixBrokenUnicode(option.representativeNameBn)})`
                        : `${option.loginName} (${fixBrokenUnicode(option.representativeName)})`
                    }
                    getOptionSelected={(option, value) => option.relatedUser.id === value.relatedUser.id}
                    value={committeeUsers.find((user) => user.relatedUser.id === selectedUser) || null}
                    onChange={(event, newValue) => {
                      setSelectedUser(newValue ? newValue.relatedUser.id : "");
                    }}
                    renderInput={(params) => <TextField {...params} label={locale === "fr" ? "ব্যবহারকারী নির্বাচন করুন" : "Select User"} variant="outlined" />}
                  />
                </Grid>

                <Grid item xs={12} md={5} className={classes.formGrid}>
                  {isEisPath() ? (
                    <TextField
                      select
                      label={locale === "fr" ? "কমিটিতে ভূমিকা" : "Role in Committee"}
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      fullWidth
                      variant="outlined"
                      required
                      placeholder={locale === "fr" ? "ভূমিকা লিখুন" : "Enter role"}
                    >
                      <MenuItem value="">{locale === "fr" ? "নির্বাচন করুন" : "Select"}</MenuItem>
                      <MenuItem value="Member">{locale === "fr" ? "সদস্য" : "Member"}</MenuItem>
                      <MenuItem value="Member Secretary">{locale === "fr" ? "সদস্য-সচিব" : "Member Secretary"}</MenuItem>
                      <MenuItem value="Chairman">{locale === "fr" ? "চেয়ারম্যান" : "Chairman"}</MenuItem>
                    </TextField>
                  ) : (
                    <TextField
                      select
                      label={locale === "fr" ? "কমিটিতে ভূমিকা" : "Role in Committee"}
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      fullWidth
                      variant="outlined"
                      required
                      placeholder={locale === "fr" ? "ভূমিকা লিখুন" : "Enter role"}
                      // SelectProps={{
                      //   native: true,
                      // }}
                    >
                      <MenuItem value="">{locale === "fr" ?"নির্বাচন করুন" : "Select"}</MenuItem>
                      <MenuItem value="Member">{locale === "fr" ? "সদস্য" : "Member"}</MenuItem>
                      <MenuItem value="President">{locale === "fr" ? "সভাপতি" : "President"}</MenuItem>
                      <MenuItem value="Secretary General">{locale === "fr" ? "সাধারণ সম্পাদক" : "Secretary General"}</MenuItem>
                    </TextField>
                  )}
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    className={classes.submitButton}
                    startIcon={<SaveIcon />}
                    onClick={handleSaveMapping}
                    disabled={!selectedCommittee || !selectedUser || !selectedRole}
                    style={{ marginTop: "-10px" }}
                  >
                    {locale === "fr" ? "সংরক্ষণ করুন" : "Save"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card className={classes.card} elevation={2}>
        <CardHeader
          title={locale === "fr" ? "বিদ্যমান কমিটি এবং ব্যবহারকারী ম্যাপিং" : "Existing Committees and User Mappings"}
          subheader={locale === "fr" ? "কমিটি এবং তাদের ব্যবহারকারীদের দেখুন" : "View committees and their users"}
        />
        <CardContent>
          {committees.length === 0 ? (
            <div className={classes.emptyState}>
              <Typography color="textSecondary">{locale === "fr" ? "কোন কমিটি পাওয়া যায়নি।" : "No committees found."}</Typography>
            </div>
          ) : (
            committees.map((committee) => {
              const committeeHasUsers = mappings.filter((mapping) => mapping.committee.id === committee.id).length > 0;

              return (
                <Accordion key={committee.id}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${committee.id}-content`}
                    id={`panel-${committee.id}-header`}
                    style={{ justifyContent: "space-around" }}
                  >
                    <Typography style={{ flex: 1, alignSelf: "center" }}>{locale === "fr" ? committee.nameBn : committee.nameEn}</Typography>

                    <div className={classes.radioGroupContainer} onClick={(e) => e.stopPropagation()}>
                      <Typography variant="body2" color="textSecondary" style={{ marginRight: 10 }}>
                        {locale === "fr" ? "অনুমোদন প্রক্রিয়া:" : "Approval Process:"}
                      </Typography>
                      <RadioGroup
                        row
                        value={committee.approvalType || (isEisPath() ? "quorum" : "representative")}
                        onChange={(e) => handleApprovalProcessChange(e, committee)}
                      >
                        <FormControlLabel
                          value="quorum"
                          control={<Radio size="small" color="primary" />}
                          label={<Typography variant="body2">{locale === "fr" ? "কোরাম" : "Quorum"}</Typography>}
                          style={{ marginRight: 15 }}
                        />
                        <FormControlLabel
                          value="representative"
                          control={<Radio size="small" color="primary" />}
                          label={<Typography variant="body2">{locale === "fr" ? "প্রতিনিধি" : "Representative"}</Typography>}
                          style={{ marginRight: 0 }}
                        />
                      </RadioGroup>
                    </div>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdviceEditModal(true);
                        setCommittee(committee);
                      }}
                      style={{ marginRight: 5, alignSelf: "center" }}
                    >
                      Edit Bank Advice Template
                    </Button>
                    <IconButton
                      color="error"
                      size="small"
                      disabled={committeeHasUsers}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCommittee(committee.id);
                      }}
                      title={
                        committeeHasUsers
                          ? locale === "fr"
                            ? "কমিটিতে ব্যবহারকারী থাকায় মুছে ফেলা সম্ভব হচ্ছে না"
                            : "Cannot delete committee with mapped users"
                          : locale === "fr"
                            ? "কমিটি সরান"
                            : "Delete Committee"
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </AccordionSummary>
                  <AccordionDetails>
                    {mappings.filter((mapping) => mapping.committee.id === committee.id).length === 0 ? (
                      <Typography color="textSecondary">{locale === "fr" ? "কোন ব্যবহারকারী ম্যাপ করা হয়নি।" : "No users mapped."}</Typography>
                    ) : (
                      <TableContainer component={Paper} elevation={0} variant="outlined">
                        <Table aria-label="user mappings table">
                          <TableHead>
                            <TableRow>
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "ব্যবহারকারী" : "User"}</TableCell>
                              {/* <TableCell className={classes.tableHeader}>{locale === "fr" ? "প্রতিনিধি" : "Representative"}</TableCell> */}
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "ভূমিকা" : "Role"}</TableCell>
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "প্রতিষ্ঠান" : "Organization"}</TableCell>
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "পদবী" : "Designation"}</TableCell>
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "প্রতিনিধির ধরণ" : "Representative Type"}</TableCell>
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "ফোন" : "Phone Number"}</TableCell>
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "ইমেইল" : "Email"}</TableCell>
                              <TableCell className={classes.tableHeader}>{locale === "fr" ? "ইমেইল" : "Email"}</TableCell>
                              <TableCell className={classes.tableHeader} align="right">
                                {locale === "fr" ? "একশন" : "Actions"}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mappings
                              .filter((mapping) => mapping.committee.id === committee.id)
                              .map((mapping) => (
                                <TableRow key={mapping.id}>
                                  <TableCell>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      <span>
                                        {mapping.user?.loginName} ({locale === "fr" ? mapping.user?.lastName : mapping.user?.lastName})
                                      </span>
                                      {mapping.isNoaSignatureUser && (
                                        <Chip
                                          label={locale === "fr" ? "NOA স্বাক্ষর ব্যবহারকারী" : "NOA Signature User"}
                                          className={classes.noaSignatureChip}
                                          size="small"
                                          style={{ marginLeft: "10px" }}
                                        />
                                      )}
                                    </div>
                                  </TableCell>

                                  <TableCell>{mapping.role || "Member"}</TableCell>
                                  <TableCell>{mapping.workforceCommitteeUser?.organizationName || ""}</TableCell>
                                  <TableCell>{mapping.workforceCommitteeUser?.designation || ""}</TableCell>
                                  <TableCell>{mapping.workforceCommitteeUser?.representativeType || ""}</TableCell>
                                  <TableCell>{mapping.workforceCommitteeUser?.phoneNumber || ""}</TableCell>
                                  <TableCell>{mapping.workforceCommitteeUser?.email || ""}</TableCell>
                                  <TableCell>
                                    {locale === "fr" ? "অফিসের ঠিকানা" : "Office Address"}: {mapping.workforceCommitteeUser?.officeAddress || ""}
                                    <br />
                                    {locale === "fr" ? "বর্তমান ঠিকানা" : "Current Address"}: {mapping.workforceCommitteeUser?.currentAddress || ""}
                                  </TableCell>

                                  <TableCell align="right">
                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={Boolean(mapping.isRepresentative)}
                                            onChange={() => handleRepresentativeToggle(mapping)}
                                            color="primary"
                                          />
                                        }
                                        label={locale === "fr" ? "আবেদন অনুমোদনের প্রতিনিধি" : "Application approval representative"}
                                      />
                                      {!mapping.isNoaSignatureUser ? (
                                        <Button
                                          variant="outlined"
                                          color="primary"
                                          size="small"
                                          onClick={() => handleSetNoaSignatureUser(committee.id, mapping.id)}
                                          className={classes.noaButton}
                                        >
                                          {locale === "fr" ? "NOA স্বাক্ষরকারী করুন" : "Set as NOA Signer"}
                                        </Button>
                                      ) : (
                                        <></>
                                      )}
                                      <IconButton color="error" onClick={() => handleDeleteMapping(mapping.id)} size="small">
                                        <DeleteIcon />
                                      </IconButton>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </CardContent>
      </Card>
      <BankAdviceEditModal open={openAdviceEditModal} onClose={() => setOpenAdviceEditModal(false)} committee={committee} />
    </div>
  );
};

export default CommitteeManagementPage;
