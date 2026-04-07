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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { createWorkforceCommittee, createWorkforceCommitteeUserMap, fetchWorkforceAllAssociation, fetchWorkforceCommittees, fetchWorkforceInteractiveUsers, fetchWorkforceCommitteeUserMap, updateWorkforceCommitteeUserMapNoaSignature, deleteWorkforceCommitteeUserMap, deleteWorkforceCommittee } from '../../actions';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { fixBrokenUnicode, safeDecodeId } from '../../utils/utils';

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
    const [users, setUsers] = useState([]);
    const [associations, setAssociations] = useState([]); // For Included Sectors

    const [selectedCommittee, setSelectedCommittee] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    const [openAddCommitteeDialog, setOpenAddCommitteeDialog] = useState(false);
    const [openEditCommitteeDialog, setOpenEditCommitteeDialog] = useState(false);

    const [newCommittee, setNewCommittee] = useState({
        nameEn: '',
        nameBn: '',
        description: '',
        status: 'ACTIVE',
        includedSectors: []
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
    const mapUserToCommittee = async (committeeId, userId) => {
        try {
            const payload = {
                committeeId: safeDecodeId(committeeId),
                userId
            };
            console.log('Mapping user to committee:', { committeeId, userId });
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

            // Fetch available users
            const usersData = await dispatch(fetchWorkforceInteractiveUsers([]));
            setUsers(usersData?.payload?.data?.workforceInteractiveUsers || []);

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
        if (!selectedCommittee || !selectedUser) {
            alert('Please select both committee and user');
            return;
        }

        try {
            await mapUserToCommittee(selectedCommittee, selectedUser);
            setSuccessMessage('User mapped to committee successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setSelectedCommittee('');
            setSelectedUser('');
            fetchPreloadData();
        } catch (error) {
            alert('Failed to map user to committee: ' + error.message);
        }
    };

    const handleDeleteMapping = async (mappingId) => {
        if (!window.confirm('Are you sure you want to delete this mapping?')) {
            return;
        }

        try {
            await deleteCommitteeMapping(mappingId);
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
                <Dialog 
                    open={openAddCommitteeDialog} 
                    onClose={handleCloseAddCommitteeDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {locale === 'fr' ? "নতুন কমিটি যোগ করুন" : "Add New Committee"}
                    </DialogTitle>
                    <DialogContent className={classes.dialogForm}>
                        <TextField
                            label={locale === 'fr' ? "কমিটির নাম (ইংরেজি) *" : "Committee Name (English) *"}
                            value={newCommittee.nameEn}
                            onChange={(e) => setNewCommittee({ ...newCommittee, nameEn: e.target.value })}
                            fullWidth
                            variant="outlined"
                            required
                        />
                        <TextField
                            label={locale === 'fr' ? "কমিটির নাম (বাংলা) *" : "Committee Name (Bangla) *"}
                            value={newCommittee.nameBn}
                            onChange={(e) => setNewCommittee({ ...newCommittee, nameBn: e.target.value })}
                            fullWidth
                            variant="outlined"
                            required
                        />
                        <TextField
                            label={locale === 'fr' ? "বিবরণ" : "Description"}
                            value={newCommittee.description}
                            onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                        />
                        <Autocomplete
                            multiple
                            id="included-sectors-autocomplete"
                            options={associations}
                            getOptionLabel={(option) => locale === 'fr' ? `${option.node.nameBn} (${option.node.shortNameBn})` : `${option.node.nameEn} (${option.node.shortNameEn})`}
                            getOptionSelected={(option, value) => option.node.id === value.node.id}
                            value={newCommittee.includedSectors || []}
                            onChange={(event, newValue) => {
                                setNewCommittee({ ...newCommittee, includedSectors: newValue });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={locale === 'fr' ? "অন্তর্ভুক্ত সেক্টর" : "Included Sectors"}
                                    variant="outlined"
                                    required
                                />
                            )}
                        />
                    </DialogContent>
                    <DialogActions className={classes.dialogActions}>
                        <Button onClick={handleCloseAddCommitteeDialog} color="default">
                            {locale === 'fr' ? "বাতিল" : "Cancel"}
                        </Button>
                        <Button 
                            onClick={handleAddCommittee} 
                            color="primary" 
                            variant="contained"
                            startIcon={<SaveIcon />}
                        >
                            {locale === 'fr' ? "সংরক্ষণ করুন" : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Committee Dialog */}
                <Dialog 
                    open={openEditCommitteeDialog} 
                    onClose={handleCloseEditCommitteeDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {locale === 'fr' ? "কমিটি সম্পাদনা করুন" : "Edit Committee"}
                    </DialogTitle>
                    <DialogContent className={classes.dialogForm}>
                        <TextField
                            label={locale === 'fr' ? "কমিটির নাম (ইংরেজি) *" : "Committee Name (English) *"}
                            value={newCommittee.nameEn}
                            onChange={(e) => setNewCommittee({ ...newCommittee, nameEn: e.target.value })}
                            fullWidth
                            variant="outlined"
                            required
                        />
                        <TextField
                            label={locale === 'fr' ? "কমিটির নাম (বাংলা) *" : "Committee Name (Bangla) *"}
                            value={newCommittee.nameBn}
                            onChange={(e) => setNewCommittee({ ...newCommittee, nameBn: e.target.value })}
                            fullWidth
                            variant="outlined"
                            required
                        />
                        <TextField
                            label={locale === 'fr' ? "বিবরণ" : "Description"}
                            value={newCommittee.description}
                            onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions className={classes.dialogActions}>
                        <Button onClick={handleCloseEditCommitteeDialog} color="default">
                            {locale === 'fr' ? "বাতিল" : "Cancel"}
                        </Button>
                        <Button 
                            onClick={handleUpdateCommittee} 
                            color="primary" 
                            variant="contained"
                            startIcon={<SaveIcon />}
                        >
                            {locale === 'fr' ? "আপডেট করুন" : "Update"}
                        </Button>
                    </DialogActions>
                </Dialog>
              </Grid>
              <Grid item md={9}>
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
                                    options={users}
                                    getOptionLabel={(option) => locale === 'fr' ? `${option.loginName} (${fixBrokenUnicode(option.otherNames)})` : `${option.loginName} (${fixBrokenUnicode(option.lastName)})`}
                                    getOptionSelected={(option, value) => option.id === value.id}
                                    value={users.find((user) => user.id === selectedUser) || null}
                                    onChange={(event, newValue) => {
                                        setSelectedUser(newValue ? newValue.id : "");
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

                            {/* Submit Button */}
                            <Grid item xs={12} md={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    className={classes.submitButton}
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveMapping}
                                    disabled={!selectedCommittee || !selectedUser}
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
                                                        <TableCell className={classes.tableHeader} align="right">
                                                            {locale === 'fr' ? "ক্রিয়া" : "Actions"}
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