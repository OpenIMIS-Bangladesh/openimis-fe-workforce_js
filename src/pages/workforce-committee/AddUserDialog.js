import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    makeStyles
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { isBlwfPath } from '../../utils/utils';

const useStyles = makeStyles((theme) => ({
    dialogForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    dialogActions: {
        padding: theme.spacing(2),
        gap: theme.spacing(1),
    },
}));

const AddUserDialog = ({
    open,
    onClose,
    onSave,
    user,
    setUser,
    locale
}) => {
    const classes = useStyles();

    const handleSave = () => {
        if (!user.loginName || !user.representativeName || !user.representativeNameBn || !user.organizationName || !user.representativeType) {
            alert('Please fill in all required fields');
            return;
        }
        onSave();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {locale === 'fr' ? "নতুন ব্যবহারকারী যোগ করুন" : "Add New User"}
            </DialogTitle>
            <DialogContent className={classes.dialogForm}>
                <TextField
                    label={locale === 'fr' ? "লগইন আইডি" : "Login ID"}
                    value={user.loginName}
                    onChange={(e) => setUser({ ...user, loginName: e.target.value })}
                    fullWidth
                    variant="outlined"
                    required
                />
                <TextField
                    label={locale === 'fr' ? "প্রতিনিধির নাম (ইংরেজিতে)" : "Name of the Representative (English)"}
                    value={user.representativeName}
                    onChange={(e) => setUser({ ...user, representativeName: e.target.value })}
                    fullWidth
                    variant="outlined"
                    required
                />
                <TextField
                    label={locale === 'fr' ? "প্রতিনিধির নাম (বাংলায়)" : "Name of the Representative (Bengali)"}
                    value={user.representativeNameBn}
                    onChange={(e) => setUser({ ...user, representativeNameBn: e.target.value })}
                    fullWidth
                    variant="outlined"
                    required
                />
                <TextField
                    label={locale === 'fr' ? "সংস্থার নাম" : "Name of the Organization"}
                    value={user.organizationName}
                    onChange={(e) => setUser({ ...user, organizationName: e.target.value })}
                    fullWidth
                    variant="outlined"
                    required
                />
                <TextField
                    label={locale === 'fr' ? "বর্তমান সংস্থায় পদবি" : "Designation on Current Organization"}
                    value={user.designation}
                    onChange={(e) => setUser({ ...user, designation: e.target.value })}
                    fullWidth
                    variant="outlined"
                />
                <TextField
                    select
                    label={locale === 'fr' ? "প্রতিনিধির ধরন" : "Type of Representative"}
                    value={user.representativeType}
                    onChange={(e) => setUser({ ...user, representativeType: e.target.value })}
                    fullWidth
                    variant="outlined"
                    required
                >
                    <MenuItem value="">
                        {locale === 'fr' ? "নির্বাচন করুন" : "Select"}
                    </MenuItem>
                    {isBlwfPath()?(
                        <MenuItem value="Employer">
                        {locale === 'fr' ? "মালিক" : "Employer"}
                    </MenuItem>
                    ):(
                    <MenuItem value="Employer">
                        {locale === 'fr' ? "নিয়োগকর্তা" : "Employer"}
                    </MenuItem>
                    )}
                    <MenuItem value="Worker">
                        {locale === 'fr' ? "শ্রমিক" : "Worker"}
                    </MenuItem>
                    <MenuItem value="Government">
                        {locale === 'fr' ? "সরকার" : "Government"}
                    </MenuItem>
                </TextField>
                <TextField
                    label={locale === 'fr' ? "ফোন নম্বর" : "Phone Number"}
                    value={user.phoneNumber}
                    onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                    fullWidth
                    variant="outlined"
                    type="tel"
                />
                <TextField
                    label={locale === 'fr' ? "ইমেইল ঠিকানা" : "Email Address"}
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    fullWidth
                    variant="outlined"
                    type="email"
                />
                <TextField
                    label={locale === 'fr' ? "অফিস ঠিকানা" : "Office Address"}
                    value={user.officeAddress}
                    onChange={(e) => setUser({ ...user, officeAddress: e.target.value })}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={2}
                />
                <TextField
                    label={locale === 'fr' ? "বর্তমান ঠিকানা" : "Current Address"}
                    value={user.currentAddress}
                    onChange={(e) => setUser({ ...user, currentAddress: e.target.value })}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={2}
                />
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button onClick={onClose} color="default">
                    {locale === 'fr' ? "বাতিল" : "Cancel"}
                </Button>
                <Button 
                    onClick={handleSave} 
                    color="primary" 
                    variant="contained"
                    startIcon={<SaveIcon />}
                >
                    {locale === 'fr' ? "সংরক্ষণ করুন" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddUserDialog;
