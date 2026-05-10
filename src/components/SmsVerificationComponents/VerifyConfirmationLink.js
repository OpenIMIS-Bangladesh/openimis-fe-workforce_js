import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  makeStyles,
} from "@material-ui/core";

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
}));

const VerifyConfirmationLink = () => {
  const classes = useStyles();
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <Box className={classes.root}>
      <Paper elevation={3} className={classes.card}>
        <Typography variant="h5" className={classes.title}>
          Did you receive any disbursed amount?
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
              label="Yes"
            />

            <FormControlLabel
              value="no"
              control={<Radio color="primary" />}
              label="No"
            />
          </RadioGroup>
        </FormControl>
      </Paper>
    </Box>
  );
};

export default VerifyConfirmationLink;