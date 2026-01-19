import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Box, Paper, Typography, LinearProgress, FormHelperText } from "@material-ui/core";
import { TextInput, useTranslations, useModulesManager, useHistory, FormattedMessage } from "@openimis/fe-core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import OtpInput from "react-otp-input";
import { createWorkforceOtp, createWorkforceUser, fetchWorkforceOtp } from "../../actions";
import { useSelector, useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
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
    background: "#d9e9eb", // Original background
  },
  inputContainer: {
    textAlign: "left",
  },
  otpInput: {
    width: "30rem", // Original size
    height: "3rem",
    margin: "0 2rem",
    fontSize: "2rem",
    borderRadius: 8,
    border: "1px solid #ccc",
    textAlign: "center",
    outline: "none",
    transition: "border-color 0.2s ease-in-out",
    "&:focus": {
      borderColor: "#1976d2",
    },
  },
}));

const RegistrationPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const internalId = useSelector((state) => state.workforce?.mutation?.id);

  const [formData, setFormData] = useState({
    NID_BirthCertificate: "",
    mobile: "",
    firstNameBn: "",
    firstNameEn: "",
    otp: "",
    password: "Password123", // Step 3 bypassed for now
    confirmPassword: "Password123",
  });

  const [serverResponse, setServerResponse] = useState({ status: "", message: null });

  const handleInputChange = (key) => (val) => {
    setErrors({ ...errors, [key]: null });
    setFormData({ ...formData, [key]: val });
  };

  const validateStep1 = () => {
    let newErrors = {};
    const idVal = (formData.NID_BirthCertificate || "").toString().trim();
    const mobVal = (formData.mobile || "").toString().trim();

    if (!formData.firstNameBn) newErrors.firstNameBn = "নাম (বাংলা) আবশ্যক";
    if (!formData.firstNameEn) newErrors.firstNameEn = "Name (English) is required";
    
    if (![10, 13, 17].includes(idVal.length)) {
      newErrors.nid = "এনআইডি অথবা জন্ম নিবন্ধন ১০, ১৩ অথবা ১৭ ডিজিট হতে হবে";
    }
    
    if (mobVal.length !== 11) {
      newErrors.phoneNumber = "মোবাইল নম্বর ১১ ডিজিট হতে হবে";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    setServerResponse({ status: "", message: null });
    if (step === 1 && validateStep1()) {
      setSubmitting(true);
      const payload = {
        [formData.NID_BirthCertificate.length === 17 ? "birthCertificateNo" : "NID"]: formData.NID_BirthCertificate,
        firstNameBn: formData.firstNameBn,
        firstNameEn: formData.firstNameEn,
        mobile: formData.mobile,
      };
      
      try {
        dispatch(createWorkforceOtp(payload, `Created Workforce Office ${payload.firstNameEn}`)).then((res)=>console.log("hello",res)).catch((err)=>console.log("hello2",err))
        setStep(2);
      } catch (e) {
        setServerResponse({ status: "ERROR", message: "OTP পাঠাতে সমস্যা হয়েছে" });
      } finally {
        setSubmitting(false);
      }
    } else if (step === 2) {
      setSubmitting(true);
      // Original OTP verification call
      await dispatch(fetchWorkforceOtp(modulesManager, [`id:"${internalId}",otp:"${formData.otp}"`]))
        .then(() => handleSubmit())
        .catch(() => {
          setServerResponse({ status: "ERROR", message: "ভুল OTP. দয়া করে আবার চেষ্টা করুন।" });
          setSubmitting(false);
        });
    }
  };

  const handleSubmit = async () => {
    const payload = {
      [formData.NID_BirthCertificate.length === 17 ? "birthCertificateNo" : "NID"]: formData.NID_BirthCertificate,
      firstNameBn: formData.firstNameBn,
      firstNameEn: formData.firstNameEn,
      mobile: formData.mobile,
      password: formData.password,
    };
    await dispatch(createWorkforceUser(payload)).then(() => {
      window.location.href = "/";
    });
  };

  return (
    <>
      {isSubmitting && <LinearProgress />}
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          {/* Original Back Button Layout */}
          <Box display="flex" justifyContent="flex-start">
            <Button 
              startIcon={<ArrowBackIcon />} 
              href={"https://eis-site-stage.skydigitalbd.com/"} 
              variant="text" 
              color="primary" 
              style={{ padding: "3px" }}
            >
              Back
            </Button>
          </Box>

          <Typography variant="h5" color="primary">
            <FormattedMessage module="workforce" id="workforce.registration.title" />
          </Typography>

          <form onSubmit={(e) => e.preventDefault()}>
            <Box mt={2} className={classes.inputContainer}>
              
              {step === 1 && (
                <>
                  <Box style={{ padding: 2 }}>
                    <TextInput
                      id="nameBn"
                      required
                      label="নাম (বাংলা)"
                      fullWidth
                      value={formData.firstNameBn}
                      onChange={handleInputChange("firstNameBn")}
                      error={!!errors.firstNameBn}
                    />
                    {errors.firstNameBn && <FormHelperText error>{errors.firstNameBn}</FormHelperText>}
                  </Box>

                  <Box style={{ padding: 2 }}>
                    <TextInput
                      id="nameEn"
                      required
                      label="নাম (ইংরেজি)"
                      fullWidth
                      value={formData.firstNameEn}
                      onChange={handleInputChange("firstNameEn")}
                      error={!!errors.firstNameEn}
                    />
                    {errors.firstNameEn && <FormHelperText error>{errors.firstNameEn}</FormHelperText>}
                  </Box>

                  <Box style={{ padding: 2 }}>
                    <TextInput
                      id="nid"
                      required
                      label="জাতীয় পরিচয়পত্র (এনআইডি) / জন্ম সনদ নম্বর (ইউজারনেম)"
                      fullWidth
                      value={formData.NID_BirthCertificate}
                      onChange={(value) => handleInputChange("NID_BirthCertificate")(value.replace(/\D/g, ""))}
                      error={!!errors.nid}
                    />
                    {errors.nid && <FormHelperText error>{errors.nid}</FormHelperText>}
                  </Box>

                  <Box style={{ padding: 2 }}>
                    <TextInput
                      id="phoneNumber"
                      required
                      label="মোবাইল নম্বর"
                      fullWidth
                      value={formData.mobile}
                      onChange={(value) => handleInputChange("mobile")(value.replace(/\D/g, ""))}
                      error={!!errors.phoneNumber}
                    />
                    {errors.phoneNumber && <FormHelperText error>{errors.phoneNumber}</FormHelperText>}
                  </Box>
                </>
              )}

              {step === 2 && (
                <Box display="flex" justifyContent="center" my={3}>
                  <OtpInput
                    value={formData.otp}
                    onChange={(val) => setFormData({ ...formData, otp: val })}
                    numInputs={5}
                    renderSeparator={<span>-</span>}
                    inputStyle={classes.otpInput}
                    renderInput={(props) => <input {...props} />}
                  />
                </Box>
              )}

              {/* Step 3 (Password) is currently commented out as requested */}

              {serverResponse?.message && (
                <Box color={serverResponse.status === "ERROR" ? "error.main" : "success.main"} mt={2} textAlign="center">
                  {serverResponse.message}
                </Box>
              )}

              <Button fullWidth onClick={handleNext} disabled={isSubmitting} color="primary" variant="contained" style={{ marginTop: 16 }}>
                {step === 1 ? "পরবর্তী" : "সাবমিট করুন"}
              </Button>

              <Button
                fullWidth
                onClick={() => (window.location.href = "/")}
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