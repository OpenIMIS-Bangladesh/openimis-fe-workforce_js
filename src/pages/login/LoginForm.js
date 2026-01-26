import React, { useState, useEffect, useRef } from "react";
import { Button, Box, Grid, LinearProgress, InputLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TextInput } from "@openimis/fe-core";
import { useAuthentication, useHistory } from "@openimis/fe-core";
import OtpInput from "react-otp-input";

const RECAPTCHA_SITE_KEY = "6LetjAAsAAAAANxUe7M2ePfj_2Nxgkgn9xzlPFqd";

const useStyles = makeStyles((theme) => ({
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
    transition: "border-color 0.2s ease-in-out",
    "&:focus": { borderColor: "#1976d2" },
  },
}));

const errorMessages = {
  INVALID_PHONE_NUMBER: "মোবাইল নম্বর ভুল দিয়েছেন। পুনরায় চেষ্টা করুন।",
  INCORRECT_CREDENTIALS: "তথ্য ভুল দিয়েছেন। পুনরায় চেষ্টা করুন।",
  GENERAL: "যান্ত্রিক ত্রুটি হয়েছে।",
};

const getErrorMessage = (key) => errorMessages[key] || key;

const getMyCookie = (name) =>
  document.cookie.split("; ").reduce((prev, current) => {
    const [k, v] = current.split("=");
    return k === name ? decodeURIComponent(v) : prev;
  }, null);

export default function LoginForm() {
  const [lang, setLang] = useState("bn");
  const classes = useStyles();
  const [credentials, setCredentials] = useState({});
  const [mobileNumber, setMobileNumber] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isAuthenticating, setAuthenticating] = useState(false);
  const [serverResponse, setServerResponse] = useState({ loginStatus: "", message: null });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaId = useRef(null);
  const auth = useAuthentication();
  const history = useHistory();

    useEffect(() => {
    const userType = getMyCookie("userType");
    if (userType === "administrative") history.push("/administrative/login");

    const loadRecaptcha = () =>
        new Promise((resolve) => {
        if (window.grecaptcha) return resolve(window.grecaptcha);
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.grecaptcha);
        document.body.appendChild(script);
        });

    loadRecaptcha().then((grecaptcha) => {
        grecaptcha.ready(() => {
        const container = document.getElementById("recaptcha-container");
        if (!container) return;

        if (window.__recaptchaWidgetId !== undefined) {
            try {
            grecaptcha.reset(window.__recaptchaWidgetId);
            } catch (e) {
            console.warn("Error resetting reCAPTCHA:", e);
            }
            return;
        }

        const widgetId = grecaptcha.render("recaptcha-container", {
            sitekey: RECAPTCHA_SITE_KEY,
            size: "normal",
            callback: (token) => setRecaptchaToken(token),
            "expired-callback": () => setRecaptchaToken(null),
        });
        window.__recaptchaWidgetId = widgetId;
        });
    });
    }, [history]);


    const handleLoginError = (msg) => {
        setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: msg });
        setAuthenticating(false);
    };

    const onSubmit = async () => {
        setAuthenticating(true);
        try {
        const cookieexpires = `; expires=${-1}`;
        document.cookie = `userType=${encodeURIComponent("")}${cookieexpires}; path=/`;

        const response = await auth.login(credentials);
        if (response.payload?.errors?.length) {
            handleLoginError(response.payload.errors[0].message);
            return;
        }

        const { loginStatus, message } = response;
        setServerResponse({ loginStatus, message });

        if (loginStatus === "CORE_AUTH_ERR") setAuthenticating(false);
        else history.push("/");
        } catch (error) {
        setAuthenticating(false);
        }
    };

    // ✅ Only send OTP if user verified reCAPTCHA
    const sendOtp = async () => {
        if (!recaptchaToken) {
        alert(lang === "bn" ? "অনুগ্রহ করে 'আমি রোবট নই' চেকবক্সটি টিক দিন।" : "Please tick the 'I am not a robot' checkbox.");
        return;
        }

        const formData = new FormData();
        formData.append("phone_number", mobileNumber);
        formData.append("recaptcha_token", recaptchaToken);

        try {
        const response = await fetch("/api/workforce/send/otp", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: data.message });
        } else {
            setCredentials({ ...credentials, username: data.username });
            setIsOtpSent(true);
        }
        } catch (err) {
        console.error(err);
        setServerResponse({ loginStatus: "CORE_AUTH_ERR", message: errorMessages.GENERAL });
        }
    };

    const setInput = (type, value) => {
        if (type === "mobile_number") setMobileNumber(value);
        if (type === "otp") setCredentials({ ...credentials, password: value });
    };

  return (
    <>
      {isAuthenticating && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress className="bootstrap" />
        </Box>
      )}

      <div>
        

        <Grid item style={{ marginTop: "1rem" }}>
          <TextInput
            required
            label={lang === "bn" ? "মোবাইল নাম্বার" : "Mobile Number"}
            fullWidth
            defaultValue=""
            onChange={(mobileNumber) => setInput("mobile_number", mobileNumber)}
          />
        </Grid>

        <div id="recaptcha-container" style={{ marginTop: "1rem" }} />

        {serverResponse?.message && (
          <Grid item style={{ marginTop: "1rem" }}>
            <Box color="error.main">{getErrorMessage(serverResponse.message)}</Box>
          </Grid>
        )}

        {isOtpSent ? (
          <>
            <Grid item style={{ marginTop: "1rem" }}>
              <InputLabel required fullWidth shrink style={{ marginBottom: 8 }}>
                {lang === "bn" ? "ওটিপি কোড" : "OTP Code"}
              </InputLabel>
              <OtpInput
                value={credentials.password}
                onChange={(otp) => setInput("otp", otp)}
                numInputs={5}
                renderSeparator={<span>-</span>}
                inputStyle={classes.otpInput}
                renderInput={(props) => <input {...props} />}
              />
            </Grid>

            <Grid item style={{ marginTop: "1rem" }}>
              <Button
                fullWidth
                disabled={!(credentials.username && credentials.password)}
                color="primary"
                variant="contained"
                onClick={onSubmit}
              >
                {lang === "bn" ? "লগইন করুন" : "Login"}
              </Button>
            </Grid>
          </>
        ) : (
          <Grid item style={{ marginTop: "1rem" }}>
            <Button
              fullWidth
              disabled={mobileNumber.length !== 11}
              color="primary"
              variant="contained"
              onClick={sendOtp}
            >
              {lang === "bn" ? "ওটিপি পাঠান" : "Send OTP"}
            </Button>
          </Grid>
        )}
      </div>
    </>
  );
}
