import React, { useState, useEffect } from "react";
import { Button, Box, Grid, LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TextInput } from "@openimis/fe-core";
import { useAuthentication, useHistory } from "@openimis/fe-core";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SharedTabPanel from "../../components/shared/TabPanel";

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
}));

const errorMessages = {
    INVALID_PHONE_NUMBER: "মোবাইল নম্বর ভুল দিয়েছেন। পুনরায় চেষ্টা করুন।",
    INCORRECT_CREDENTIALS: "তথ্য ভুল দিয়েছেন। পুনরায় চেষ্টা করুন।",
    GENERAL: "যান্ত্রিক ত্রুটি হয়েছে।",
};

const getErrorMessage = (messageKey) => {
    return errorMessages[messageKey] || messageKey;
};
export default function LoginForm() {
    const classes = useStyles();
    const [credentials, setCredentials] = useState({});
    const [mobileNumber, setMobileNumber] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const auth = useAuthentication();
    const [isAuthenticating, setAuthenticating] = useState(false);
    const [serverResponse, setServerResponse] = useState({ loginStatus: "", message: null });
    const history = useHistory();
    const [loginType, setLoginType] = useState(0);

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
        setAuthenticating(true);

        try {
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

    const sendOtp = async () => {
        const formData = new FormData();
        formData.append("phone_number", mobileNumber);

        try {
            const response = await fetch("/api/workforce/send/otp", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: responseData.message });
            } else {
                if (responseData.status == 'success') {
                    setCredentials({ ...credentials, username: responseData.username })
                    setIsOtpSent(true);
                } else {
                    setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: responseData.message });
                }
            }
        } catch (error) {
            console.log(error);
            setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: errorMessages.GENERAL });
        }

    };

    const setInput = (type, value) => {
        if (type == "mobile_number")
            setMobileNumber(value);
        if (type == "otp")
            setCredentials({ ...credentials, password: value })
    };

    return (
        <>
            {isAuthenticating && (
                <Box position="absolute" top={0} left={0} right={0}>
                    <LinearProgress className="bootstrap" />
                </Box>
            )}

            <Tabs
                value={loginType}
                onChange={(e, value) => setLoginType(value)}
                aria-label="Login type"
                TabIndicatorProps={{ style: { backgroundColor: "#006273" } }}
            >
                <Tab label="সাধারণ লগইন" {...loginTypeTabChange(0)} />
                <Tab label="এডমিন লগইন" {...loginTypeTabChange(1)} />
            </Tabs>
            <SharedTabPanel value={loginType} index={0}>
                <>
                    <Grid item style={{ marginTop: "1rem" }}>
                        <TextInput
                            required
                            label="মোবাইল নাম্বার"
                            fullWidth
                            defaultValue=""
                            onChange={(mobileNumber) => setInput('mobile_number', mobileNumber)}
                        />
                    </Grid>

                    {serverResponse?.message && (
                        <Grid item style={{ marginTop: "1rem" }}>
                            <Box color="error.main">{getErrorMessage(serverResponse.message)}</Box>
                        </Grid>
                    )}

                    {isOtpSent && (
                        <>
                            <Grid item style={{ marginTop: "1rem" }}>
                                <TextInput
                                    required
                                    label="ওটিপি"
                                    fullWidth
                                    defaultValue=""
                                    onChange={(otp) => setInput('otp', otp)}
                                />
                            </Grid>

                            <Grid item style={{ marginTop: "1rem" }}>
                                <Button
                                    fullWidth
                                    type="button"
                                    disabled={!(credentials.username && credentials.password)}
                                    color="primary"
                                    variant="contained"
                                    onClick={() => onSubmit()}
                                >
                                    লগইন
                                </Button>
                            </Grid>
                        </>
                    )}

                    {!isOtpSent && (
                        <Grid item style={{ marginTop: "1rem" }}>
                            <Button
                                fullWidth
                                type="button"
                                disabled={mobileNumber.length !== 11}
                                color="primary"
                                variant="contained"
                                onClick={() => sendOtp()}
                            >
                                ওটিপি প্রেরণ করুন
                            </Button>
                        </Grid>
                    )}
                </>
            </SharedTabPanel>
            <SharedTabPanel value={loginType} index={1}>
                <>
                    <Grid item style={{ marginTop: "1rem" }}>
                        <TextInput
                            required
                            label="ইউজারনেম"
                            fullWidth
                            defaultValue={credentials.username}
                            onChange={(username) => setCredentials({ ...credentials, username })}
                        />
                    </Grid>
                    <Grid item style={{ marginTop: "1rem" }}>
                        <TextInput
                            required
                            type="password"
                            label="পাসওয়ার্ড"
                            fullWidth
                            onChange={(password) => setCredentials({ ...credentials, password })}
                        />
                    </Grid>
                    {serverResponse?.message && (
                        <Grid item style={{ marginTop: "1rem" }}>
                            <Box color="error.main">{getErrorMessage(serverResponse.message)}</Box>
                        </Grid>
                    )}
                    <Grid item style={{ marginTop: "1rem" }}>
                        <Button
                            fullWidth
                            type="button"
                            disabled={!(credentials.username && credentials.password)}
                            color="primary"
                            variant="contained"
                            onClick={() => onSubmit()}
                        >
                            লগইন
                        </Button>
                    </Grid>
                </>
            </SharedTabPanel>
        </>
    )
}