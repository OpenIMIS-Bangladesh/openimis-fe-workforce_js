import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Button,
  Box,
  Paper,
  Typography,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import {
  TextInput,
  useTranslations,
  useModulesManager,
  useHistory,
  FormattedMessage,
} from "@openimis/fe-core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import OtpInput from "react-otp-input";
import {
  createWorkforceOtp,
  createWorkforceUser,
  fetchWorkforceOtp,
} from "../../actions";
import { useSelector, useDispatch } from "react-redux";

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
  otpInput: {
    width: "30rem",
    height: "3rem",
    margin: "0 2rem",
    fontSize: "2rem",
    borderRadius: 8,
    border: "1px solid #ccc",
    textAlign: "center",
    outline: "none",
    transition: "border-color 0.2s ease-in-out",
    "&:focus": {
      borderColor: "#1976d2", // MUI primary color
    },
  },
}));

const RegistrationPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );
  const [otp, setOtp] = useState("");

  const internalId = useSelector((state) => state.workforce?.mutation?.id);

  const otpStatus = useSelector((state) => state.workforce["workforceOtp"]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    NID_BirthCertificate: "",
    birthCertificate: "",
    mobile: "",
    firstNameBn: "",
    firstNameEn: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState({
    status: "",
    message: null,
  });

  // Fix: Get value directly, not e.target.value
  const handleInputChange = (key) => (val) => {
    setFormData({ ...formData, [key]: val });
  };

  useEffect(() => {
    if (step === 2 && otpStatus) {
      if (otpStatus.status === "active") {
        setStep(3);
      } else if (otpStatus.status === "invalid") {
        setServerResponse({
          status: "ERROR",
          message: "ভুল OTP. দয়া করে আবার চেষ্টা করুন।",
        });
      }
    }
  }, [otpStatus]);

  useEffect(() => {
    if (isSubmitting && step === 3 && internalId) {
      setServerResponse({
        status: "SUCCESS",
        message: "নিবন্ধন সফল হয়েছে!",
      });

      setTimeout(() => {
        setSubmitting(false);
        history.push("/login");
      }, 2000);
    }
  }, [internalId]);

  const validateStep1 = () =>
    formData.NID_BirthCertificate &&
    formData.mobile &&
    formData.firstNameBn &&
    formData.firstNameEn;

  const validateStep3 = () =>
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleNext = async () => {
    setServerResponse({ status: "", message: null });

    if (step === 1 && validateStep1()) {
      const cleanedInput = (formData.NID_BirthCertificate || "")
        .toString()
        .trim();
      if (cleanedInput.length === 17) {
        const createOtpData = {
          birthCertificateNo: formData.NID_BirthCertificate,
          firstNameBn: formData.firstNameBn,
          firstNameEn: formData.firstNameEn,
          mobile: formData.mobile,
        };
        await dispatch(
          createWorkforceOtp(
            createOtpData,
            `Created Workforce Office ${createOtpData.firstNameEn}`
          )
        );
      } else if (cleanedInput.length === 10) {
        const createOtpData = {
          NID: formData.NID_BirthCertificate,
          firstNameBn: formData.firstNameBn,
          firstNameEn: formData.firstNameEn,
          mobile: formData.mobile,
        };
        await dispatch(
          createWorkforceOtp(
            createOtpData,
            `Created Workforce Office ${createOtpData.firstNameEn}`
          )
        );
      } else {
        setServerResponse({
          status: "ERROR",
          message: "দয়া করে সঠিক এনআইডি বা জন্ম সনদ নম্বর প্রদান করুন।",
        });
        return;
      }

      if (internalId !== "") {
        setStep(2);
      }
    } else if (step === 2 ) {
      if (formData.otp === "12345") {
        // Bypass OTP verification for default test OTP
        // setStep(3);
        await handleSubmit();
        history.push("/");
      }
      // await dispatch(
      //   fetchWorkforceOtp(modulesManager, [
      //     `id:"${internalId}",otp:"${formData.otp}"`,
      //   ])
      // );
    } else if (step === 3) {
      await handleSubmit();
      history.push("/");
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

  const handleSubmit = async () => {
    const cleanedInput = (formData.NID_BirthCertificate || "")
      .toString()
      .trim();
    if (cleanedInput.length === 17) {
      const createUserData = {
        birthCertificateNo: formData.NID_BirthCertificate,
        firstNameBn: formData.firstNameBn,
        firstNameEn: formData.firstNameEn,
        mobile: formData.mobile,
        password: formData.password,
      };
      await dispatch(
        createWorkforceUser(
          createUserData,
          `Created Workforce User ${createUserData.firstNameEn}`
        )
      );
    } else {
      const createUserData = {
        NID: formData.NID_BirthCertificate,
        firstNameBn: formData.firstNameBn,
        firstNameEn: formData.firstNameEn,
        mobile: formData.mobile,
        password: formData.password,
      };
      await dispatch(
        createWorkforceUser(
          createUserData,
          `Created Workforce User ${createUserData.firstNameEn}`
        )
      );
    }
    setSubmitting(true);
  };

  console.log({ formData });
  // console.log({otpStatus})

  return (
    <>
      {isSubmitting && <LinearProgress />}
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
      <Box display="flex" justifyContent="flex-start" >
                      <Button startIcon={<ArrowBackIcon />} href={"https://eis-site-stage.skydigitalbd.com/"} variant="text" color="primary" style={{padding:"3px"}}>
                        Back
                      </Button>
                    </Box>
          <Typography variant="h5" color="primary">
            <FormattedMessage
              module="workforce"
              id="workforce.registration.title"
            />
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
                    label="জাতীয় পরিচয়পত্র (এনআইডি) / জন্ম সনদ নম্বর (ইউজারনেম)"
                    fullWidth
                    onChange={(value) =>
                      setFormData({ ...formData, NID_BirthCertificate: value })
                    }
                    formatInput={(val) =>
                      (val || "").toString().replace(/\D/g, "").slice(0, 17)
                    }
                    type="number"
                    inputProps={{ maxLength: 17 }}

                    // onChange={(v) => {
                    //   const cleaned = String(v).trim();
                    //   if (cleaned.length === 10) {
                    //     setFormData({...formData,NID: cleaned,birthCertificate: ""});
                    //   } else if (cleaned.length === 17) {
                    //     setFormData({...formData,birthCertificate: cleaned,NID: "",});
                    //   } else {
                    //     setFormData({...formData,NID: "",birthCertificate: "",});
                    //   }
                    // }}
                  />
                  <TextInput
                    required
                    label="মোবাইল নম্বর"
                    fullWidth
                    value={formData.mobile}
                    onChange={handleInputChange("mobile")}
                    type="number"
                  />
                </>
              )}

              {/* Step 2: OTP */}
              {step === 2 && (
                  <OtpInput
                    value={formData.otp}
                    onChange={handleInputChange("otp")}
                    numInputs={5}
                    renderSeparator={<span>-</span>}
                    inputStyle={classes.otpInput}
                    renderInput={(props) => <input {...props} />}
                  />
               
              )}

              {/* Step 3: Password */}
              {/* {step === 3 && (
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
              )} */}

              {/* Server Response */}
              {serverResponse?.message && (
                <Box
                  color={
                    serverResponse.status === "ERROR"
                      ? "error.main"
                      : "success.main"
                  }
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
                {step === 1 ? "সাবমিট করুন" : "পরবর্তী"}
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
