import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    makeStyles
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';

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

const AddCommitteeDialog = ({
    open,
    onClose,
    onSave,
    committee,
    setCommittee,
    associations,
    locale
}) => {
    const classes = useStyles();

    const handleSave = () => {
        if (!committee.nameEn || !committee.nameBn) {
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
                {locale === 'fr' ? "নতুন কমিটি যোগ করুন" : "Add New Committee"}
            </DialogTitle>
            <DialogContent className={classes.dialogForm}>
                <TextField
                    label={locale === 'fr' ? "কমিটির নাম (ইংরেজি) *" : "Committee Name (English) *"}
                    value={committee.nameEn}
                    onChange={(e) => setCommittee({ ...committee, nameEn: e.target.value })}
                    fullWidth
                    variant="outlined"
                    required
                />
                <TextField
                    label={locale === 'fr' ? "কমিটির নাম (বাংলা) *" : "Committee Name (Bangla) *"}
                    value={committee.nameBn}
                    onChange={(e) => setCommittee({ ...committee, nameBn: e.target.value })}
                    fullWidth
                    variant="outlined"
                    required
                />
                <TextField
                    label={locale === 'fr' ? "বিবরণ" : "Description"}
                    value={committee.description}
                    onChange={(e) => setCommittee({ ...committee, description: e.target.value })}
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
                    value={committee.includedSectors || []}
                    onChange={(event, newValue) => {
                        setCommittee({ ...committee, includedSectors: newValue });
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

export default AddCommitteeDialog;
