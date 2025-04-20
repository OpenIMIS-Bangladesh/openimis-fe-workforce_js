import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Button,
  Box,
  Paper,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import {
  TextInput,
  useTranslations,
  useModulesManager,
  useHistory,
  FormattedMessage,
} from "@openimis/fe-core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

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
  paper: {
    padding: theme.spacing(4),
    width: 600,
    textAlign: "center",
    borderRadius: 12,
    background: "#d9e9eb",
  },
  inputContainer: {
    textAlign: "left",
  },
}));

const RegistrationPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    NID: "",
    mobile: "",
    firstNameBn: "",
    firstNameEn: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState({ status: "", message: null });

  // Fix: Get value directly, not e.target.value
  const handleInputChange = (key) => (val) => {
    setFormData({ ...formData, [key]: val });
  };

  const validateStep1 = () =>
    formData.NID && formData.mobile && formData.firstNameBn && formData.firstNameEn;

  const validateStep2 = () => formData.otp === "1234";

  const validateStep3 = () =>
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleNext = () => {
    setServerResponse({ status: "", message: null });

    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      handleSubmit();
    } else {
      setServerResponse({
        status: "ERROR",
        message:
          step === 2
            ? "ভুল OTP. দয়া করে আবার চেষ্টা করুন।"
            : "সমস্ত ঘর পূরণ করুন।",
      });
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setServerResponse({ status: "SUCCESS", message: "নিবন্ধন সফল হয়েছে!" });
    }, 2000);
  };

  return (
    <>
      {isSubmitting && <LinearProgress />}
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h5" color="primary">
            <FormattedMessage module="workforce" id="workforce.registration.title" />
          </Typography>
          <form onSubmit={(e) => e.preventDefault()}>
            <Box mt={2} className={classes.inputContainer}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <>
                  <TextInput
                    required
                    label="নাম (বাংলা)"
                    fullWidth
                    value={formData.firstNameBn}
                    onChange={handleInputChange("firstNameBn")}
                  />
                  <TextInput
                    required
                    label="নাম (ইংরেজি)"
                    fullWidth
                    value={formData.firstNameEn}
                    onChange={handleInputChange("firstNameEn")}
                  />
                  <TextInput
                    required
                    label="জাতীয় পরিচয়পত্র (এনআইডি)"
                    fullWidth
                    value={formData.NID}
                    onChange={handleInputChange("NID")}
                  />
                  <TextInput
                    required
                    label="মোবাইল নম্বর"
                    fullWidth
                    value={formData.mobile}
                    onChange={handleInputChange("mobile")}
                  />
                </>
              )}

              {/* Step 2: OTP */}
              {step === 2 && (
                <TextInput
                  required
                  label="OTP দিন (ডেমো: 1234)"
                  fullWidth
                  value={formData.otp}
                  onChange={handleInputChange("otp")}
                />
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <>
                  <TextInput
                    required
                    type="password"
                    label="পাসওয়ার্ড"
                    fullWidth
                    value={formData.password}
                    onChange={handleInputChange("password")}
                  />
                  <TextInput
                    required
                    type="password"
                    label="পাসওয়ার্ড নিশ্চিত করুন"
                    fullWidth
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                  />
                </>
              )}

              {/* Server Response */}
              {serverResponse?.message && (
                <Box
                  color={serverResponse.status === "ERROR" ? "error.main" : "success.main"}
                  mt={2}
                >
                  {serverResponse.message}
                </Box>
              )}

              {/* Main Button */}
              <Button
                fullWidth
                onClick={handleNext}
                disabled={isSubmitting}
                color="primary"
                variant="contained"
                style={{ marginTop: 16 }}
              >
                {step === 3 ? "সাবমিট করুন" : "পরবর্তী"}
              </Button>

              {/* Back Button */}
              <Button
                fullWidth
                onClick={() => history.push("/")}
                startIcon={<ArrowBackIcon />}
                color="primary"
                variant="text"
                style={{ marginTop: 8 }}
              >
                পিছনে
              </Button>
            </Box>
          </form>
        </Paper>
      </div>
    </>
  );
};

export default RegistrationPage;
