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
    Typography,
    TextField,
    IconButton
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import { createWorkforceAssociationUserMap, deleteWorkforceAssociationUserMap, fetchInteractiveUsers, fetchWorkforceAllAssociationSummary, fetchWorkforceAssociationUserMaps, fetchWorkforceInteractiveUsers } from '../../actions';
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
        dispatch(fetchWorkforceInteractiveUsers(filters)).then((response) => {
            setUsers(response?.payload?.data?.workforceInteractiveUsers || []);
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

    const handleDelete = (mappingId) => {
        if (!confirm("Are you sure you want to delete this mapping?")) {
            return;
        }
        console.log("Attempting to delete mapping with ID:", safeDecodeId(mappingId));
        dispatch(deleteWorkforceAssociationUserMap({id: safeDecodeId(mappingId)}, "deleteWorkforceAssociationUserMap"))
        .then(() => {
            setSelectedAssociation('');
            setSelectedUser('');
            dispatch(fetchWorkforceAssociationUserMaps([])).then((response) => {
                setMappings(response?.payload?.data?.workforceAssociationUserMap?.edges || []);
            });
        })
        .catch((error) => {
            console.error("Failed to delete association user mapping:", error);
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
                             <Autocomplete
                                id="association-select-autocomplete"
                                options={associations}
                                getOptionLabel={(option) => `${option.node.nameEn} (${option.node.shortNameEn})`}

                                // IMPORTANT FOR MUI v4: This prevents warnings when React compares the selected object to the options array
                                getOptionSelected={(option, value) => option.node.id === value.node.id}

                                value={selectedAssociation ? associations.find(assoc => assoc.node.id === selectedAssociation) || null : null}

                                onChange={(event, newValue) => {
                                    setSelectedAssociation(newValue ? newValue.node.id : "");
                                }}

                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Association"
                                        variant="outlined"
                                        // Apply your existing class here to maintain spacing/styling
                                        className={classes.formControl}
                                    />
                                )}
                            />
                        </Grid>

                        {/* User Dropdown */}
                        <Grid item xs={12} md={5}>
                            <Autocomplete
                                id="user-select-autocomplete"
                                options={users}
                                getOptionLabel={(option) => `${option.loginName} (${option.lastName})`}

                                // IMPORTANT FOR MUI v4: This prevents warnings when React compares the selected object to the options array
                                getOptionSelected={(option, value) => option.id === value.id}

                                value={users.find((user) => user.id === selectedUser) || null}

                                onChange={(event, newValue) => {
                                    setSelectedUser(newValue ? newValue.id : "");
                                }}

                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Interactive User"
                                        variant="outlined"
                                        // Apply your existing class here to maintain spacing/styling
                                        className={classes.formControl}
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
                                disabled={!selectedAssociation || !selectedUser}
                                style={{marginTop:"-7px"}}
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
                                        <TableCell className={classes.tableHeader}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mappings.map((row) => (
                                        <TableRow key={row.node.id}>
                                            {/* Adjust these properties to match your actual payload response */}
                                            <TableCell>{row.node.allAssociation?.nameEn ?? ""}</TableCell>
                                            <TableCell>{row.node.user?.loginName || row.node.userId}</TableCell>
                                            <TableCell>
                                                <IconButton color="error" onClick={() => handleDelete(row.node.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
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