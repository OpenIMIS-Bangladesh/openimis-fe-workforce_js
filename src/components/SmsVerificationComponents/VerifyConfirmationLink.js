import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  makeStyles,
  Button,
  CircularProgress,
  Fade
} from "@material-ui/core";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import { userPaymentConfirmation } from "../../actions";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    padding: theme.spacing(4),
    borderRadius: 12,
    textAlign: "center",
  },
  title: {
    fontWeight: 600,
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
    },
  },
  radioGroup: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing(3),

    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "center",
      gap: theme.spacing(1),
    },
  },
  successCard: {
    width: "100%",
    maxWidth: 500,
    padding: theme.spacing(6),
    borderRadius: 12,
    textAlign: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
  },
  successIcon: {
    fontSize: 80,
    marginBottom: theme.spacing(2),
    color: "#4caf50",
    animation: "$checkAnimation 0.6s ease-in-out",
  },
  "@keyframes checkAnimation": {
    "0%": {
      transform: "scale(0) rotate(-45deg)",
      opacity: 0,
    },
    "50%": {
      transform: "scale(1.2) rotate(10deg)",
    },
    "100%": {
      transform: "scale(1) rotate(0deg)",
      opacity: 1,
    },
  },
  successTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    fontSize: "1.5rem",
  },
  successMessage: {
    fontWeight: 500,
    fontSize: "1.1rem",
    lineHeight: 1.6,
    marginBottom: theme.spacing(3),
  },
  redirectText: {
    fontSize: "0.9rem",
    marginTop: theme.spacing(2),
    opacity: 0.9,
  },
}));

const VerifyConfirmationLink = () => {
  const classes = useStyles();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  // Extract disbursement_id from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const disbursementId = searchParams.get("disbursement_id");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleConfirm = () => {
    setIsLoading(true);
    const isConfirmed = value === "yes";
    dispatch(userPaymentConfirmation(disbursementId, isConfirmed));
    
    // Show success message after a brief delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  // Redirect to login after showing success message
  useEffect(() => {
    if (isSuccess) {
      const redirectTimer = setTimeout(() => {
        window.location.href = "/"; // Redirect to home page
      }, 3000); // Show success message for 3 seconds before redirecting
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isSuccess, history]);

  if (isSuccess) {
    return (
      <Box className={classes.root}>
        <Fade in={isSuccess} timeout={800}>
          <Paper elevation={8} className={classes.successCard}>
            <CheckCircleOutlineIcon className={classes.successIcon} />
            <Typography variant="h5" className={classes.successTitle}>
              Confirmation Successful
            </Typography>
            <Typography className={classes.successMessage}>
              Your Confirmation has been recorded sucessfully
            </Typography>
            <Typography className={classes.successMessage}>
              আপনার টাকা প্রাপ্তি নিশ্চিতকরণ প্রক্রিয়া সম্পন্ন হয়েছে।
            </Typography>
            <Typography className={classes.redirectText}>
              Redirecting to home page...
            </Typography>
            <Box mt={2}>
              <CircularProgress size={30} style={{ color: "white" }} />
            </Box>
          </Paper>
        </Fade>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Paper elevation={3} className={classes.card}>
        <Typography variant="h5" className={classes.title}>
          Did you receive any disbursed amount? / আপনি কি টাকা পেয়েছেন?
        </Typography>

        <FormControl component="fieldset">
          <RadioGroup
            value={value}
            onChange={handleChange}
            className={classes.radioGroup}
          >
            <FormControlLabel
              value="yes"
              control={<Radio color="primary" />}
              label="Yes / হ্যাঁ"
            />

            <FormControlLabel
              value="no"
              control={<Radio color="primary" />}
              label="No / না"
            />
          </RadioGroup>
        </FormControl>
        <Box mt={3}>
          <Button 
            variant="contained" 
            color="primary" 
            disabled={!value || isLoading} 
            onClick={handleConfirm} 
            style={{ minWidth: 140, height: 44, fontSize: "1rem" }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} style={{ color: "white", marginRight: 8 }} />
                Processing...
              </>
            ) : (
              "Confirm / নিশ্চিত করুন"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default VerifyConfirmationLink;