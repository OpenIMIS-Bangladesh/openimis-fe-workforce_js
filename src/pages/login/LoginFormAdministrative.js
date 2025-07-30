import React, { useState, useEffect } from "react";
import { Button, Box, Grid, LinearProgress, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TextInput } from "@openimis/fe-core";
import { useAuthentication, useHistory, Helmet, useModulesManager, useTranslations } from "@openimis/fe-core";
import LoginHeader from "./LoginHeader";

const useStyles = makeStyles((theme) => ({
    container: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    paper: theme.paper.paper,
    logo: {
        width: "45%",
        padding: theme.spacing(2),
    },
    otpInput: {
        width: "100% !important",
        height: "2.2rem",
        margin: "0 .8rem",
        fontSize: "2rem",
        borderRadius: 8,
        border: "1px solid #006273",
        color: "#00668f",
        background: "transparent !important",
        textAlign: "center",
        outline: "none",
        fontSize: "inherit",
        transition: "border-color 0.2s ease-in-out",
        "&:focus": {
            borderColor: "#1976d2", // MUI primary color
        },
    }
}));

const errorMessages = {
    INVALID_PHONE_NUMBER: "মোবাইল নম্বর ভুল দিয়েছেন। পুনরায় চেষ্টা করুন।",
    INCORRECT_CREDENTIALS: "তথ্য ভুল দিয়েছেন। পুনরায় চেষ্টা করুন।",
    GENERAL: "যান্ত্রিক ত্রুটি হয়েছে।",
};

const getErrorMessage = (messageKey) => {
    return errorMessages[messageKey] || messageKey;
};
const redirectToForgotPassword = (e) => {
    e.preventDefault();
    history.push("/forgot_password");
};

const getMyCookie= (name) =>{
  return document.cookie.split("; ").reduce((prev, current) => {
    const [key, value] = current.split("=");
    return key === name ? decodeURIComponent(value) : prev;
  }, null);
};

export default function LoginFormAdministrative() {
    const classes = useStyles();
    const modulesManager = useModulesManager();
    const { formatMessage } = useTranslations("core.LoginPage", modulesManager);
    const [credentials, setCredentials] = useState({});
    const auth = useAuthentication();
    const [isAuthenticating, setAuthenticating] = useState(false);
    const [serverResponse, setServerResponse] = useState({ loginStatus: "", message: null });
    const history = useHistory();

    




    const handleLoginError = (errorMessage) => {
        setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: errorMessage });
        setAuthenticating(false);
    };

    const loginTypeTabChange = (index) => {
        return {
            id: `login-type-${index}`,
            "aria-controls": `login-type-${index}`,
        };
    };


    const onSubmit = async (e) => {
        e.preventDefault();
        setAuthenticating(true);

        try {
            const cookieexpires = `; expires=${new Date(Date.now() + 864e5).toUTCString()}`;
            document.cookie = `userType=${encodeURIComponent('administrative')}${cookieexpires}; path=/`;
            const response = await auth.login(credentials);

            if (response.payload?.errors?.length) {
                handleLoginError(response.payload.errors[0].message);
                return;
            }
            const { loginStatus, message } = response;
            setServerResponse({ loginStatus, message });

            if (loginStatus === "CORE_AUTH_ERR") {
                setAuthenticating(false);
            } else {
                history.push("/");
            }
        } catch (error) {
            setAuthenticating(false);
        }
    };

    return (
        <>
            {isAuthenticating && (
                <Box position="absolute" top={0} left={0} right={0}>
                    <LinearProgress className="bootstrap" />
                </Box>
            )}
            <div className={classes.container}>
                <Helmet title={formatMessage("pageTitle")} />
                <Paper className={classes.paper} elevation={2}>
                    <form onSubmit={onSubmit}>
                        <Box p={6} width={380}>
                            <Grid container spacing={2} direction="column" alignItems="stretch">
                                <LoginHeader />
                                <>
                                    <Grid item>
                                        <TextInput
                                            required
                                            readOnly={isAuthenticating}
                                            label="ইউজারনেম"
                                            fullWidth
                                            defaultValue={credentials.username}
                                            onChange={(username) => setCredentials({ ...credentials, username })}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextInput
                                            required
                                            readOnly={isAuthenticating}
                                            type="password"
                                            label="পাসওয়ার্ড"
                                            fullWidth
                                            onChange={(password) => setCredentials({ ...credentials, password })}
                                        />
                                    </Grid>

                                    {serverResponse?.message && (
                                        <Grid item>
                                            <Box color="error.main">{getErrorMessage(serverResponse.message)}</Box>
                                        </Grid>
                                    )}
                                    <Grid item>
                                        <Button
                                            fullWidth
                                            type="submit"
                                            disabled={isAuthenticating || !(credentials.username && credentials.password)}
                                            color="primary"
                                            variant="contained"
                                        >
                                            {formatMessage("loginBtn")}
                                        </Button>
                                    </Grid>

                                    <Grid item>
                                        <Button onClick={redirectToForgotPassword}>{formatMessage("forgotPassword")}</Button>
                                    </Grid>
                                </>
                            </Grid>
                        </Box>
                    </form>
                </Paper>
            </div>
        </>
    )
}