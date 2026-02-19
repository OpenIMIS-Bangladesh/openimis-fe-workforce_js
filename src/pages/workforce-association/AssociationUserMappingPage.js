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
import { getUserTypeFromRights, safeDecodeId } from '../../utils/utils';
import { WORKFORCE_USER_TYPE } from '../../constants';



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
    const currentUserId = useSelector((state) => state.core?.user?.i_user?.id);
    const userRights = useSelector((state) => state.core.user.i_user.rights);
    const userType = getUserTypeFromRights(userRights);
    // Redux Selectors - IMPORTANT: Adjust these paths to match your actual Redux store
    const [associations, setAssociations] = useState([]);
    const [users, setUsers] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [currentUserAssociations, setCurrentUserAssociations] = useState([]);
    const [mainDataLoaded, setMainDataLoaded] = useState(false);

    // const loadAssociationData = async () => {
        
    //     const associationFilters = [];
    //     if (currentUserAssociations.length > 0) {
    //         const associationFilterString = currentUserAssociations.map(id => `"${id}"`).join(",");
    //         associationFilters.push(`idIn:[${associationFilterString}]`);
    //     }
    //     else{
    //     }
    //     dispatch(fetchWorkforceAllAssociationSummary(associationFilters))
    //         .then((response) => {
    //             setAssociations(response?.payload?.data?.workforceAllAssociation?.edges || []);
    //         });
    //     console.log("Association Filters for fetching associations:", associationFilters);
    // };


    // useEffect(() => {
    //     if (userType === WORKFORCE_USER_TYPE.ASSOCIATION) {
    //         loadAssociationData();
    //     }
    // }, [mainDataLoaded==true]);

    // Fetch initial data on component mount
    const loadData = async () => {
            setMainDataLoaded(false);
            const mapFilters = [];

            await dispatch(fetchWorkforceInteractiveUsers([])).then((response) => {
                setUsers(response?.payload?.data?.workforceInteractiveUsers || []);
            });

            if (currentUserId && userType === WORKFORCE_USER_TYPE.ASSOCIATION) {
                mapFilters.push(`userId:${currentUserId}`);
            }

            const mapResponse = await dispatch(fetchWorkforceAssociationUserMaps(mapFilters));
            const edges = mapResponse?.payload?.data?.workforceAssociationUserMap?.edges || [];

            setMappings(edges);

            // ✅ Use edges directly
            const associationIds = edges.map(mapping =>
                safeDecodeId(mapping.node.allAssociation.id)
            );

            setCurrentUserAssociations(associationIds);
            console.log("Current User Associations:", associationIds);

            const associationFilters = [];
            if (userType === WORKFORCE_USER_TYPE.ASSOCIATION && associationIds.length > 0) {
                const associationFilterString = associationIds.map(id => `"${id}"`).join(",");
                associationFilters.push(`idIn:[${associationFilterString}]`);
            }
            dispatch(fetchWorkforceAllAssociationSummary(associationFilters))
                .then((response) => {
                    setAssociations(response?.payload?.data?.workforceAllAssociation?.edges || []);
                });
            console.log("Association Filters for fetching associations:", associationFilters);
            setMainDataLoaded(true);

            

        };

    useEffect(() => {
        loadData();
    }, [dispatch, currentUserId, userType]);


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
                loadData();
                
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
        dispatch(deleteWorkforceAssociationUserMap({ id: safeDecodeId(mappingId) }, "deleteWorkforceAssociationUserMap"))
            .then(() => {
                setSelectedAssociation('');
                setSelectedUser('');
                loadData();
            })
            .catch((error) => {
                console.error("Failed to delete association user mapping:", error);
            });
    };

    const reduxState = useSelector((state) => state);
    const locale = reduxState?.core?.user?.i_user?.language || 'en';

    return (
        <div style={{width:"90%", margin:"auto", marginTop:"40px"}}>
            {/* MAPPING FORM CARD */}
            <Card className={classes.card} elevation={2}>
                <CardHeader
                    title= {locale === 'fr' ? "অ্যাসোসিএশনের ব্যবহারকারী ম্যাপিং" : "Association-User Mapping"}
                    subheader={locale === 'fr' ? "একটি অ্যাসোসিয়েশনকে একজন ব্যবহারকারীর সাথে ম্যাপ করুন" : "Map an association to a user"} 
                />
                <CardContent>
                    <Grid container spacing={3} alignItems="center">

                        {/* Association Dropdown */}
                        <Grid item xs={12} md={5}>
                            <Autocomplete
                                id="association-select-autocomplete"
                                options={associations}
                                getOptionLabel={(option) => locale === 'fr' ? `${option.node.nameBn} (${option.node.shortNameBn})` : `${option.node.nameEn} (${option.node.shortNameEn})`}

                                // IMPORTANT FOR MUI v4: This prevents warnings when React compares the selected object to the options array
                                getOptionSelected={(option, value) => option.node.id === value.node.id}

                                value={selectedAssociation ? associations.find(assoc => assoc.node.id === selectedAssociation) || null : null}

                                onChange={(event, newValue) => {
                                    setSelectedAssociation(newValue ? newValue.node.id : "");
                                }}

                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={locale === 'fr' ? "অ্যাসোসিয়েশন নির্বাচন করুন" : "Select Association"}
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
                                getOptionLabel={(option) => locale === 'fr' ? `${option.loginName} (${option.lastNameBn})` : `${option.loginName} (${option.lastNameEn})`}

                                // IMPORTANT FOR MUI v4: This prevents warnings when React compares the selected object to the options array
                                getOptionSelected={(option, value) => option.id === value.id}

                                value={users.find((user) => user.id === selectedUser) || null}

                                onChange={(event, newValue) => {
                                    setSelectedUser(newValue ? newValue.id : "");
                                }}

                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={locale === 'fr' ? "ব্যবহারকারী" : "User"}
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
                                style={{ marginTop: "-7px" }}
                            >
                                {locale === 'fr' ? "সংরক্ষণ করুন" : "Save"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* EXISTING MAPPINGS TABLE CARD */}
            <Card elevation={2}>
                <CardHeader title={locale === 'fr' ? "বিদ্যমান ম্যাপিং" : "Existing Mappings"} />
                <CardContent>
                    {mappings.length === 0 ? (
                        <Typography color="textSecondary">{locale === 'fr' ? "কোন ম্যাপিং পাওয়া যায়নি।" : "No mappings found."}</Typography>
                    ) : (
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table aria-label="mappings table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.tableHeader}>{locale === 'fr' ? "অ্যাসোসিএশন" : "Association"}</TableCell>
                                        <TableCell className={classes.tableHeader}>{locale === 'fr' ? "ব্যবহারকারী" : "User"}</TableCell>
                                        <TableCell className={classes.tableHeader}>{locale === 'fr' ? "ক্রিয়া" : "Actions"}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mappings.map((row) => (
                                        <TableRow key={row.node.id}>
                                            {/* Adjust these properties to match your actual payload response */}
                                            <TableCell>{locale === 'fr' ? row.node.allAssociation?.nameBn + " (" + row.node.allAssociation?.shortNameBn + ")" : row.node.allAssociation?.nameEn + " (" + row.node.allAssociation?.shortNameEn + ")"}</TableCell>
                                            <TableCell>{row.node.user?.loginName + "(" + (locale === 'fr' ? row.node.user?.lastNameBn : row.node.user?.lastNameEn) + ")" || row.node.userId}</TableCell>
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