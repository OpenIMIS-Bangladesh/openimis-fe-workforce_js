import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
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
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createWorkforceCommittee, createWorkforceCommitteeUserMap, fetchWorkforceAllAssociation, fetchWorkforceCommittees, fetchInteractiveUsers, fetchWorkforceCommitteeUserMap, updateWorkforceCommitteeUserMapNoaSignature, deleteWorkforceCommitteeUserMap, deleteWorkforceCommittee, createWorkforceCommitteeUser, fetchWorkforceCommitteeUser, fetchWorkforceInteractiveUsers } from '../../actions';
import { fixBrokenUnicode, safeDecodeId } from '../../utils/utils';
import AddCommitteeDialog from './AddCommitteeDialog';
import AddUserDialog from './AddUserDialog';

const useStyles = makeStyles((theme) => ({
    pageContainer: {
        width: "90%",
        margin: "auto",
        marginTop: "40px",
        marginBottom: "40px"
    },
    card: {
        marginBottom: theme.spacing(3),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: '100%',
    },
    submitButton: {
        marginTop: theme.spacing(2),
        height: '56px',
    },
    addButton: {
        marginBottom: theme.spacing(2),
    },
    tableHeader: {
        backgroundColor: theme.palette.grey[100],
        fontWeight: 'bold',
    },
    actionButtons: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    emptyState: {
        textAlign: 'center',
        padding: theme.spacing(3),
    },
    sectionTitle: {
        marginBottom: theme.spacing(2),
        fontWeight: 'bold',
        color: theme.palette.primary.main,
    },
    statusChip: {
        marginRight: theme.spacing(1),
    },
    formGrid: {
        marginBottom: theme.spacing(2),
    },
    dialogForm: {
        display: 'flex',
        flexDirection: 'column',
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
    }
}));

const CommitteeManagementPage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    // ==================== STATE MANAGEMENT ====================
    const [committees, setCommittees] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [committeeUsers, setCommitteeUsers] = useState([]); // For Map User to Committee dropdown
    const [associations, setAssociations] = useState([]); // For Included Sectors

    const [selectedCommittee, setSelectedCommittee] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const [openAddCommitteeDialog, setOpenAddCommitteeDialog] = useState(false);
    const [openEditCommitteeDialog, setOpenEditCommitteeDialog] = useState(false);
    const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

    const [newCommittee, setNewCommittee] = useState({
        nameEn: '',
        nameBn: '',
        description: '',
        status: 'ACTIVE',
        includedSectors: []
    });

    const [newUser, setNewUser] = useState({
        loginName: '',
        representativeName: '',
        representativeNameBn: '',
        organizationName: '',
        designation: '',
        representativeType: '',
        phoneNumber: '',
        email: '',
        officeAddress: '',
        currentAddress: ''
    });

    const [editingCommittee, setEditingCommittee] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [mainDataLoaded, setMainDataLoaded] = useState(false);

    const currentUserId = useSelector((state) => state.core?.user?.i_user?.id);
    const userRights = useSelector((state) => state.core?.user?.i_user?.rights || []);
    const reduxState = useSelector((state) => state);
    const locale = reduxState?.core?.user?.i_user?.language || 'en';

    // ==================== API PLACEHOLDER FUNCTIONS ====================
    // These are placeholders. User will replace with actual API calls

    /**
     * TODO: Replace with actual fetchCommittees API
     * Expected response: { committees: [...], total: number }
     */
    const fetchCommittees = async (filters = []) => {
        try {
            // PLACEHOLDER: Replace with actual API call
            // Example: dispatch(fetchWorkforceCommittees(filters))
            console.log('Fetching committees with filters:', filters);
            // For now, return empty or mock data
            return { committees: [], total: 0 };
        } catch (error) {
            console.error('Failed to fetch committees:', error);
            return { committees: [], total: 0 };
        }
    };


    /**
     * TODO: Replace with actual deleteCommittee API
     */
    const deleteCommittee = async (committeeId) => {
        try {
            // PLACEHOLDER: Replace with actual API call
            // Example: dispatch(deleteWorkforceCommittee({ id: committeeId }))
            console.log('Deleting committee:', committeeId);
            // For now, just return success
            return { success: true };
        } catch (error) {
            console.error('Failed to delete committee:', error);
            throw error;
        }
    };



    /**
     * TODO: Replace with actual mapUserToCommittee API
     * Expected to create a mapping between committee and user
     */
    const mapUserToCommittee = async (committeeId, userId, roleInCommittee) => {
        try {
            const payload = {
                committeeId: safeDecodeId(committeeId),
                userId,
                roleInCommittee
            };
            console.log('Mapping user to committee:', { committeeId, userId, roleInCommittee });
            await dispatch(createWorkforceCommitteeUserMap(payload, "createWorkforceCommitteeUserMap"));
            setSuccessMessage("Committee Mapped with selected User successfully!");
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPreloadData(); // Refresh data after mapping
            // For now, just return success
            return { success: true };
        } catch (error) {
            console.error('Failed to map user to committee:', error);
            throw error;
        }
    };

    /**
     * TODO: Replace with actual deleteMappingAPI
     * Expected to delete a committee-user mapping
     */
    const deleteCommitteeMapping = async (mappingId) => {
        try {
            // PLACEHOLDER: Replace with actual API call
            await dispatch(deleteWorkforceCommitteeUserMap(safeDecodeId(mappingId)));
            console.log('Deleting committee-user mapping:', mappingId);
            fetchPreloadData(); // Refresh data after deletion
            setSuccessMessage("User Mapping deleted successfully!");
            setTimeout(() => setSuccessMessage(''), 3000);
            // For now, just return success
            return { success: true };
        } catch (error) {
            console.error('Failed to delete mapping:', error);
            throw error;
        }
    };

    // ==================== DATA LOADING ====================
    const fetchPreloadData = async () => {
        try {
            // Fetch committees
            const committeesData = await dispatch(fetchWorkforceCommittees([]));
            setCommittees(committeesData?.payload?.data?.workforceCommittees || []);

            // Fetch committee users for Map User to Committee dropdown
            const committeeUsersData = await dispatch(fetchWorkforceCommitteeUser([]));
            setCommitteeUsers(committeeUsersData?.payload?.data?.workforceCommitteeUsers || []);

            // Fetch associations
            const associationsData = await dispatch(fetchWorkforceAllAssociation([]));
            setAssociations(associationsData?.payload?.data?.workforceAllAssociation?.edges || []);

            // Fetch mappings
            const mappingsData = await dispatch(fetchWorkforceCommitteeUserMap({}));
            setMappings(mappingsData?.payload?.data?.workforceCommitteeUserMaps || []);
        } catch (error) {
            console.error('Failed to fetch preload data:', error);
        }
    };

    // ==================== LOGIN NAME VALIDATION ====================
    /**
     * Check if a loginName already exists using the fetchInteractiveUsers API
     * instead of checking against a preloaded array
     */
    const checkLoginNameExists = async (loginName) => {
        try {
            const result = await dispatch(fetchWorkforceInteractiveUsers({ loginName }));
            const users = result?.payload?.data?.workforceInteractiveUsers || [];
            return users.length > 0;
        } catch (error) {
            console.error('Error checking login name:', error);
            // If there's an error checking, we'll allow the user to proceed
            // and let the backend handle any duplicate key constraints
            return false;
        }
    };

    useEffect(() => {
        fetchPreloadData();
    }, [dispatch]);

    // ==================== HANDLER FUNCTIONS ====================

    const handleOpenAddCommitteeDialog = () => {
        setNewCommittee({
            nameEn: '',
            nameBn: '',
            description: '',
            status: 'ACTIVE',
            includedSectors: []
        });
        setOpenAddCommitteeDialog(true);
    };

    const handleCloseAddCommitteeDialog = () => {
        setOpenAddCommitteeDialog(false);
        setNewCommittee({
            nameEn: '',
            nameBn: '',
            description: '',
            status: 'ACTIVE',
            includedSectors: []
        });
    };

    const handleAddCommittee = async () => {
        if (!newCommittee.nameEn || !newCommittee.nameBn) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const payload = {
                nameEn: newCommittee.nameEn,
                nameBn: newCommittee.nameBn,
                associations: JSON.stringify(newCommittee.includedSectors),
            };
            await dispatch(createWorkforceCommittee(payload, "createWorkforceCommittee"));
            setSuccessMessage("Committee created successfully!");
            setOpenAddCommitteeDialog(false);
            setTimeout(() => setSuccessMessage(''), 3000);
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
            nameEn: '',
            nameBn: '',
            description: '',
            status: 'ACTIVE',
            includedSectors: []
        });
    };

    const handleUpdateCommittee = async () => {
        if (!newCommittee.nameEn || !newCommittee.nameBn) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await dispatch(createWorkforceCommittee(newCommittee, "updateWorkforceCommittee"));
            setSuccessMessage('Committee updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            handleCloseEditCommitteeDialog();
            fetchPreloadData();
        } catch (error) {
            alert('Failed to update committee: ' + error.message);
        }
    };

    const handleDeleteCommittee = async (committeeId) => {
        if (!window.confirm('Are you sure you want to delete this committee?')) {
            return;
        }

        try {
            await dispatch(deleteWorkforceCommittee(safeDecodeId(committeeId)));
            setSuccessMessage('Committee deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPreloadData();
        } catch (error) {
            alert('Failed to delete committee: ' + error.message);
        }
    };

    const handleSaveMapping = async () => {
        if (!selectedCommittee || !selectedUser || !selectedRole) {
            alert('Please select committee, user, and role');
            return;
        }

        try {
            await mapUserToCommittee(selectedCommittee, safeDecodeId(selectedUser), selectedRole);
            // Reset form fields after successful mapping
            setSelectedCommittee('');
            setSelectedUser('');
            setSelectedRole('');
        } catch (error) {
            alert('Failed to map user to committee: ' + error.message);
        }
    };

    const handleDeleteMapping = async (mappingId) => {
        if (!window.confirm('Are you sure you want to delete this mapping?')) {
            return;
        }

        try {
            await dispatch(deleteCommitteeMapping(mappingId));
            setSuccessMessage('Mapping deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPreloadData();
        } catch (error) {
            alert('Failed to delete mapping: ' + error.message);
        }
    };

    const handleSetNoaSignatureUser = async (committeeId, mapId) => {
        try {
            await dispatch(updateWorkforceCommitteeUserMapNoaSignature(
                safeDecodeId(committeeId), 
                safeDecodeId(mapId), 
                true, 
                "setNoaSignatureUser"
            ));
            setSuccessMessage('NOA Signature User set successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPreloadData(); // Refresh data
        } catch (error) {
            alert('Failed to set NOA Signature User: ' + error.message);
        }
    };

    const handleRemoveNoaSignatureUser = async (committeeId, mapId) => {
        try {
            await dispatch(updateWorkforceCommitteeUserMapNoaSignature(committeeId, mapId, false, "removeNoaSignatureUser"));
            setSuccessMessage('NOA Signature User removed successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPreloadData(); // Refresh data
        } catch (error) {
            alert('Failed to remove NOA Signature User: ' + error.message);
        }
    };

    // ==================== USER HANDLER FUNCTIONS ====================

    const handleOpenAddUserDialog = () => {
        setNewUser({
            loginName: '',
            representativeName: '',
            representativeNameBn: '',
            organizationName: '',
            designation: '',
            representativeType: '',
            phoneNumber: '',
            email: '',
            officeAddress: '',
            currentAddress: ''
        });
        setOpenAddUserDialog(true);
    };

    const handleCloseAddUserDialog = () => {
        setOpenAddUserDialog(false);
        setNewUser({
            loginName: '',
            representativeName: '',
            representativeNameBn: '',
            organizationName: '',
            designation: '',
            representativeType: '',
            phoneNumber: '',
            email: '',
            officeAddress: '',
            currentAddress: ''
        });
    };

    const handleAddUser = async () => {
        if (!newUser.loginName || !newUser.representativeName || !newUser.representativeNameBn || !newUser.organizationName || !newUser.representativeType) {
            alert('Please fill in all required fields');
            return;
        }

        // Check if loginName already exists by querying the API
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
                currentAddress: newUser.currentAddress
            };
            await dispatch(createWorkforceCommitteeUser(payload, "createWorkforceCommitteeUser"));
            setSuccessMessage("User created successfully!");
            setOpenAddUserDialog(false);
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPreloadData();
        } catch (error) {
            console.error("Error creating user:", error);
            alert('Failed to create user: ' + error.message);
        }
    };


    // ==================== FETCH ASSOCIATIONS ====================
    const fetchAssociations = async () => {
        try {
            const response = await dispatch(fetchWorkforceAllAssociation([]));
            setAssociations(response?.payload?.data?.workforceAllAssociation?.edges || []);
        } catch (error) {
            console.error('Failed to fetch associations:', error);
        }
    };

    useEffect(() => {
        fetchAssociations();
    }, [dispatch]);

    // ==================== RENDER ====================

    return (
        <div className={classes.pageContainer}>
            {/* Success Message Alert */}
            {successMessage && (
                <Alert severity="success" onClose={() => setSuccessMessage('')} className={classes.successMessage}>
                    {successMessage}
                </Alert>
            )}

            {/* ==================== ADD COMMITTEE SECTION ==================== */}
            <Grid container spacing={2}>
              <Grid item md={3}>
                <Card className={classes.card} elevation={2} style={{ height: '89%' }}>
                    <CardHeader
                        title={locale === 'fr' ? "কমিটি যোগ করুন" : "Add Committee"}
                        subheader={locale === 'fr' ? "নতুন কমিটি তৈরি করুন" : "Create a new committee"}
                        // action={
                        //     <Button
                        //         variant="contained"
                        //         color="primary"
                        //         startIcon={<AddIcon />}
                        //         onClick={handleOpenAddCommitteeDialog}
                        //         className={classes.addButton}
                        //     >
                        //         {locale === 'fr' ? "যোগ করুন" : "Add"}
                        //     </Button>
                        // }
                    />
                    <CardContent>
                        <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddCommitteeDialog}
                                className={classes.addButton}
                            >
                                {locale === 'fr' ? "যোগ করুন" : "Add"}
                            </Button>
                    </CardContent>
                </Card>

                {/* Add Committee Dialog */}
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
                <Card className={classes.card} elevation={2} style={{ height: '89%' }}>
                    <CardHeader
                        title={locale === 'fr' ? "নতুন ইউজার" : "Create User"}
                        subheader={locale === 'fr' ? "কমিটির জন্য নতুন ইউজার যোগ করুন" : "Create a new user for committee"}
                    />
                    <CardContent>
                        <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddUserDialog}
                                className={classes.addButton}
                            >
                                {locale === 'fr' ? "যোগ করুন" : "Add"}
                            </Button>
                    </CardContent>
                </Card>

                {/* Add User Dialog */}
                <AddUserDialog
                    open={openAddUserDialog}
                    onClose={handleCloseAddUserDialog}
                    onSave={handleAddUser}
                    user={newUser}
                    setUser={setNewUser}
                    // users={users}
                    locale={locale}
                />
              </Grid>
              <Grid item md={6}>
                {/* ==================== MAP USER TO COMMITTEE SECTION ==================== */}
                <Card className={classes.card} elevation={2}>
                    <CardHeader
                        title={locale === 'fr' ? "ব্যবহারকারীকে কমিটিতে ম্যাপ করুন" : "Map User to Committee"}
                        subheader={locale === 'fr' ? "একজন ব্যবহারকারীকে একটি কমিটিতে অ্যাসাইন করুন" : "Assign a user to a committee"}
                    />
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">

                            {/* Committee Dropdown */}
                            <Grid item xs={12} md={5} className={classes.formGrid}>
                                <Autocomplete
                                    id="committee-select-autocomplete"
                                    options={committees}
                                    getOptionLabel={(option) => locale === 'fr' ? option.nameBn : option.nameEn}
                                    getOptionSelected={(option, value) => option.id === value.id}
                                    value={committees.find(c => c.id === selectedCommittee) || null}
                                    onChange={(event, newValue) => {
                                        setSelectedCommittee(newValue ? newValue.id : "");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={locale === 'fr' ? "কমিটি নির্বাচন করুন" : "Select Committee"}
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>

                            {/* User Dropdown */}
                            <Grid item xs={12} md={5} className={classes.formGrid}>
                                <Autocomplete
                                    id="user-select-autocomplete"
                                    options={committeeUsers}
                                    getOptionLabel={(option) => locale === 'fr' ? `${option.loginName} (${fixBrokenUnicode(option.representativeNameBn)})` : `${option.loginName} (${fixBrokenUnicode(option.representativeName)})`}
                                    getOptionSelected={(option, value) => option.relatedUser.id === value.relatedUser.id}
                                    value={committeeUsers.find((user) => user.relatedUser.id === selectedUser) || null}
                                    onChange={(event, newValue) => {
                                        setSelectedUser(newValue ? newValue.relatedUser.id : "");
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={locale === 'fr' ? "ব্যবহারকারী নির্বাচন করুন" : "Select User"}
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Role Dropdown */}
                            <Grid item xs={12} md={5} className={classes.formGrid}>
                                <TextField
                                    select
                                    label={locale === 'fr' ? "কমিটিতে ভূমিকা *" : "Role in Committee *"}
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    required
                                >
                                    <MenuItem value="">
                                        {locale === 'fr' ? "নির্বাচন করুন" : "Select"}
                                    </MenuItem>
                                    <MenuItem value="Chairman">
                                        {locale === 'fr' ? "চেয়ারম্যান" : "Chairman"}
                                    </MenuItem>
                                    <MenuItem value="Member Secretary">
                                        {locale === 'fr' ? "সদস্য সচিব" : "Member Secretary"}
                                    </MenuItem>
                                    <MenuItem value="Member">
                                        {locale === 'fr' ? "সদস্য" : "Member"}
                                    </MenuItem>
                                </TextField>
                            </Grid>

                            {/* Submit Button */}
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
                                    {locale === 'fr' ? "সংরক্ষণ করুন" : "Save"}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

              </Grid>
            </Grid>

            {/* ==================== EXISTING COMMITTEES WITH USER MAPPINGS */}
            <Card className={classes.card} elevation={2}>
                <CardHeader
                    title={locale === 'fr' ? "বিদ্যমান কমিটি এবং ব্যবহারকারী ম্যাপিং" : "Existing Committees and User Mappings"}
                    subheader={locale === 'fr' ? "কমিটি এবং তাদের ব্যবহারকারীদের দেখুন" : "View committees and their users"}
                />
                <CardContent>
                    {committees.length === 0 ? (
                        <div className={classes.emptyState}>
                            <Typography color="textSecondary">
                                {locale === 'fr' ? "কোন কমিটি পাওয়া যায়নি।" : "No committees found."}
                            </Typography>
                        </div>
                    ) : (
                        committees.map((committee) => {
                            const committeeHasUsers = mappings.filter(mapping => mapping.committee.id === committee.id).length > 0;
                            
                            return (
                            <Accordion key={committee.id}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={`panel-${committee.id}-content`}
                                    id={`panel-${committee.id}-header`}
                                >
                                    <Typography style={{ flex: 1 }}>{locale === 'fr' ? committee.nameBn : committee.nameEn}</Typography>
                                    <IconButton 
                                        color="error"
                                        size="small"
                                        disabled={committeeHasUsers}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCommittee(committee.id);
                                        }}
                                        title={committeeHasUsers ? (locale === 'fr' ? "কমিটিতে ব্যবহারকারী থাকায় মুছে ফেলা সম্ভব হচ্ছে না" : "Cannot delete committee with mapped users") : locale === 'fr' ? "কমিটি সরান" : "Delete Committee"}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {mappings.filter(mapping => mapping.committee.id === committee.id).length === 0 ? (
                                        <Typography color="textSecondary">
                                            {locale === 'fr' ? "কোন ব্যবহারকারী ম্যাপ করা হয়নি।" : "No users mapped."}
                                        </Typography>
                                    ) : (
                                        <TableContainer component={Paper} elevation={0} variant="outlined">
                                            <Table aria-label="user mappings table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "ব্যবহারকারী" : "User"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "ভূমিকা" : "Role"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "প্রতিষ্ঠান" : "Organization"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "পদবী" : "Designation"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "প্রতিনিধির ধরণ" : "Representative Type"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "ফোন" : "Phone Number"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "ইমেইল" : "Email"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader}>
                                                            {locale === 'fr' ? "ঠিকানা" : "Addresses"}
                                                        </TableCell>
                                                        <TableCell className={classes.tableHeader} align="right">
                                                            {locale === 'fr' ? "একশন" : "Actions"}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {mappings.filter(mapping => mapping.committee.id === committee.id).map((mapping) => (
                                                        <TableRow key={mapping.id}>
                                                            <TableCell>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <span>{mapping.user?.loginName} ({locale === 'fr' ? mapping.user?.lastName : mapping.user?.lastName})</span>
                                                                    {mapping.isNoaSignatureUser && (
                                                                        <Chip
                                                                            label={locale === 'fr' ? "NOA স্বাক্ষর ব্যবহারকারী" : "NOA Signature User"}
                                                                            className={classes.noaSignatureChip}
                                                                            size="small"
                                                                            style={{ marginLeft: '10px' }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {mapping.role || 'Member'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {mapping.workforceCommitteeUser?.organizationName || ''}
                                                            </TableCell>
                                                            <TableCell>
                                                                {mapping.workforceCommitteeUser?.designation || ''}
                                                            </TableCell>
                                                            <TableCell>
                                                                {mapping.workforceCommitteeUser?.representativeType || ''}
                                                            </TableCell>
                                                            <TableCell>
                                                                {mapping.workforceCommitteeUser?.phoneNumber || ''}
                                                            </TableCell>
                                                            <TableCell>
                                                                {mapping.workforceCommitteeUser?.email || ''}
                                                            </TableCell>
                                                            <TableCell>
                                                                {locale === 'fr' ? "অফিসের ঠিকানা" : "Office Address"}: {mapping.workforceCommitteeUser?.officeAddress || ''}
                                                                <br/>
                                                                {locale === 'fr' ? "বর্তমান ঠিকানা" : "Current Address"}: {mapping.workforceCommitteeUser?.currentAddress || ''}
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                                    {!mapping.isNoaSignatureUser ? (
                                                                        <Button
                                                                            variant="outlined"
                                                                            color="primary"
                                                                            size="small"
                                                                            onClick={() => handleSetNoaSignatureUser(committee.id, mapping.id)}
                                                                            className={classes.noaButton}
                                                                        >
                                                                            {locale === 'fr' ? "NOA স্বাক্ষরকারী করুন" : "Set as NOA Signer"}
                                                                        </Button>
                                                                    ) : (
                                                                        <></>
                                                                        // <Button
                                                                        //     variant="contained"
                                                                        //     color="primary"
                                                                        //     size="small"
                                                                        //     onClick={() => handleRemoveNoaSignatureUser(committee.id, mapping.id)}
                                                                        //     className={classes.noaButton}
                                                                        // >
                                                                        //     {locale === 'fr' ? "NOA স্বাক্ষরকারী সরান" : "Remove NOA Signer"}
                                                                        // </Button>
                                                                    )}
                                                                    <IconButton 
                                                                        color="error" 
                                                                        onClick={() => handleDeleteMapping(mapping.id)}
                                                                        size="small"
                                                                    >
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
        </div>
    );
};

export default CommitteeManagementPage;