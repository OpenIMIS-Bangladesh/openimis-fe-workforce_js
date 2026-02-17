import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {
    Card,
    CardHeader,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { createWorkforceAssociationUserMap, fetchInteractiveUsers, fetchWorkforceAllAssociationSummary, fetchWorkforceAssociationUserMaps } from '../../actions';
import { safeDecodeId } from '../../utils/utils';



const useStyles = makeStyles((theme) => ({
    card: {
        marginBottom: theme.spacing(3),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: '100%',
    },
    submitButton: {
        marginTop: theme.spacing(2),
        height: '56px', // Matches standard MUI input height
    },
    tableHeader: {
        backgroundColor: theme.palette.grey[100],
        fontWeight: 'bold',
    }
}));

const AssociationUserMappingPage = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    // Local State for form selections
    const [selectedAssociation, setSelectedAssociation] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    // Redux Selectors - IMPORTANT: Adjust these paths to match your actual Redux store
    const [associations, setAssociations] = useState([]);
    const [users, setUsers] = useState([]);
    const [mappings, setMappings] = useState([]);

    // Fetch initial data on component mount
    useEffect(() => {
        const filters = []; // Add default filters if your API requires them
        dispatch(fetchWorkforceAllAssociationSummary(filters)).then((response) => {
            setAssociations(response?.payload?.data?.workforceAllAssociation?.edges || []);
        });
        dispatch(fetchInteractiveUsers(filters)).then((response) => {
            setUsers(response?.payload?.data?.interactiveUsers?.edges || []);
        });
        dispatch(fetchWorkforceAssociationUserMaps(filters)).then((response) => {
            setMappings(response?.payload?.data?.workforceAssociationUserMap?.edges || []);
        });
    }, [dispatch]);

    // Handle Form Submission
    const handleSaveMapping = () => {
        if (!selectedAssociation || !selectedUser) return;

        const payload = {
            associationId: safeDecodeId(selectedAssociation),
            userId: safeDecodeId(selectedUser),
        };

        dispatch(createWorkforceAssociationUserMap(payload, "createWorkforceAssociationUserMap"))
            .then(() => {
                // Clear form after successful creation
                setSelectedAssociation('');
                setSelectedUser('');
                // Re-fetch the mappings to update the table below
                dispatch(fetchWorkforceAssociationUserMaps([])).then((response) => {
                    setMappings(response?.payload?.data?.workforceAssociationUserMap?.edges || []);
                });
            })
            .catch((error) => {
                console.error("Failed to map association to user:", error);
                // Add toast/snackbar error handling here if needed
            });
    };

    return (
        <div>
            {/* MAPPING FORM CARD */}
            <Card className={classes.card} elevation={2}>
                <CardHeader
                    title="Map Association to User"
                    subheader="Select an association and a user to link them together."
                />
                <CardContent>
                    <Grid container spacing={3} alignItems="center">

                        {/* Association Dropdown */}
                        <Grid item xs={12} md={5}>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <InputLabel id="association-select-label">Association</InputLabel>
                                <Select
                                    labelId="association-select-label"
                                    value={selectedAssociation}
                                    onChange={(e) => setSelectedAssociation(e.target.value)}
                                    label="Association"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {associations.map((assoc) => (
                                        <MenuItem key={assoc.node.id} value={assoc.node.id}>
                                            {assoc.node.nameEn} ({assoc.node.shortNameEn}) {/* Adjust property based on API */}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* User Dropdown */}
                        <Grid item xs={12} md={5}>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <InputLabel id="user-select-label">Interactive User</InputLabel>
                                <Select
                                    labelId="user-select-label"
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    label="Interactive User"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user.node.id} value={user.node.id}>
                                            {user.node.loginName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                                disabled={!selectedAssociation || !selectedUser}
                            >
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* EXISTING MAPPINGS TABLE CARD */}
            <Card elevation={2}>
                <CardHeader title="Existing Mappings" />
                <CardContent>
                    {mappings.length === 0 ? (
                        <Typography color="textSecondary">No mappings found.</Typography>
                    ) : (
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table aria-label="mappings table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.tableHeader}>Association</TableCell>
                                        <TableCell className={classes.tableHeader}>User</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mappings.map((row) => (
                                        <TableRow key={row.node.id}>
                                            {/* Adjust these properties to match your actual payload response */}
                                            <TableCell>{row.node.allAssociation?.nameEn?? ""}</TableCell>
                                            <TableCell>{row.node.user?.loginName || row.node.userId}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AssociationUserMappingPage;