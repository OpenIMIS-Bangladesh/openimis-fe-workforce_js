import React from "react";
import { useHistory } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Paper,
    Typography,
} from "@material-ui/core";
import { FormattedMessage } from "@openimis/fe-core";

const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    paper: {
        padding: theme.spacing(1),
        width: 700,
    },
    buttonContainer: {
        marginTop: theme.spacing(2),
        display: "flex",
        justifyContent: "flex-end",
        gap: theme.spacing(1),
    },
}));

export const ApplicationFormSubmitted = (form_type = '') => {
    const classes = useStyles();
    const history = useHistory();

    // setTimeout(() => {
    //     history.push("/home");
    //     window.location.reload();
    // }, 2000);

    return (
        <div className={classes.container}>
            <Paper className={classes.paper} elevation={0}>
                <Typography variant="h5" align="center" color="primary">
                    <FormattedMessage
                        module="workforce"
                        id="workforce.success.message"
                    />
                </Typography>
            </Paper>
        </div>
    );
};
