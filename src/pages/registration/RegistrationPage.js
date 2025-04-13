import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Button,
  Box,
  Grid,
  Paper,
  LinearProgress,
  Typography,
  
} from "@material-ui/core";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  PublishedComponent,
  FormattedMessage
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
  logo: {
    width: 120,
    marginBottom: theme.spacing(2),
  },
  inputContainer: {
    textAlign: "left",
  },
}));

const RegistrationPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );

  const [formData, setFormData] = useState({
    NID: "",
    mobile: "",
    firstName: "",
    lastName: "",
    location: "",
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState({
    status: "",
    message: null,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

      await dispatch(
          createWorkforceEmployee(
            workforceEmployeeData,
            `Created Workforce Employee ${formData.NID}`
          )
        );

    try {
      setTimeout(() => {
        setServerResponse({
          status: "SUCCESS",
          message: "Registration successful!",
        });
        setSubmitting(false);
      }, 2000);
    } catch (error) {
      setServerResponse({
        status: "ERROR",
        message: "Registration failed. Please try again.",
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && <LinearProgress />}
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          {/* <img src="/mnt/data/image.png" alt="Logo" className={classes.logo} /> */}
          <Typography variant="h5" color="primary">
            <FormattedMessage module="workforce" id="workforce.registration.title" />
          </Typography>
          <form onSubmit={onSubmit}>
            <Box mt={2} className={classes.inputContainer}>
              <TextInput
                required
                readOnly={isSubmitting}
                label="জাতীয় পরিচয়পত্র (এনআইডি)"
                fullWidth
                value={formData.NID}
                onChange={(NID) => setFormData({ ...formData, NID })}
              />
              <TextInput
                required
                readOnly={isSubmitting}
                label="মোবাইল নম্বর"
                fullWidth
                value={formData.mobile}
                onChange={(mobile) => setFormData({ ...formData, mobile })}
              />
              <TextInput
                required
                readOnly={isSubmitting}
                label="প্রথম নাম"
                fullWidth
                value={formData.firstName}
                onChange={(firstName) =>
                  setFormData({ ...formData, firstName })
                }
              />
              <TextInput
                required
                readOnly={isSubmitting}
                label="শেষ নাম"
                fullWidth
                value={formData.lastName}
                onChange={(lastName) => setFormData({ ...formData, lastName })}
              />
             
              <TextInput
                required
                readOnly={isSubmitting}
                label="অবস্থান"
                fullWidth
                value={formData.location}
                onChange={(location) => setFormData({ ...formData, location })}
              />
              <PublishedComponent
                pubRef="location.DetailedLocation"
                withNull={true}
                label="অবস্থান"
                value={formData.location || null}
                onChange={(location) =>
                  setFormData({ ...formData, location })
                }
                readOnly={isSubmitting}
                required
                split={true}
              />
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
              <Button
                fullWidth
                type="submit"
                disabled={
                  isSubmitting || Object.values(formData).some((val) => !val)
                }
                color="primary"
                variant="contained"
                style={{ marginTop: 16 }}
              >
                নিবন্ধন করুন
              </Button>
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
