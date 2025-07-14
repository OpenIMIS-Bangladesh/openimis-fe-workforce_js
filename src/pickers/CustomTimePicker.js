import React, { useState, useEffect, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Typography,
  makeStyles,
  FormHelperText
} from "@material-ui/core";
import { FormattedMessage } from "@openimis/fe-core";
import { useSelector } from "react-redux";

// Bangla digit mapping
const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBanglaDigit = (number) =>
  number
    .toString()
    .split("")
    .map((d) => banglaDigits[d] || d)
    .join("");

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 80,
    marginRight: theme.spacing(1),
  },
  label: {
    fontSize: "13px",
    color: "#0e6c6f",
    fontWeight: 500,
    marginBottom: "4px",
  },
}));

const CustomTimePicker = ({ label = "সময়", value, onChange }) => {
  const classes = useStyles();
  const language = useSelector((state) => state?.core?.user?.i_user?.language ?? "en");

  const parseTime = () => {
    if (!value) return { hour: "", minute: "", period: "" };
    const [t, p] = value.split(" ");
    const [h, m] = t.split(":");
    return { hour: h, minute: m, period: p || "AM" };
  };

  const [time, setTime] = useState(parseTime());

  useEffect(() => {
    if (time.hour && time.minute && time.period) {
      onChange(`${time.hour}:${time.minute} ${time.period}`);
    }
  }, [time]);

  // Dynamically format hours/minutes based on language
  const displayHours = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const val = String(i + 1).padStart(2, "0");
        return { value: val, label: language === "fr" ? toBanglaDigit(val) : val };
      }),
    [language]
  );

  const displayMinutes = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const val = String(i).padStart(2, "0");
        return { value: val, label: language === "fr" ? toBanglaDigit(val) : val };
      }),
    [language]
  );

  const handleChange = (key) => (event) => {
    setTime((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div>
      {label && (
        <Typography className={classes.label}>
          <FormattedMessage module="workforce" id={label} />
        </Typography>
      )}
      <Grid container alignItems="center">
        <FormControl className={classes.formControl}>
          {/* <InputLabel>
            <FormattedMessage module="workforce" id="workforce.timePicker.hour" />
          </InputLabel> */}
          <Select value={time.hour} onChange={handleChange("hour")} inputProps={{ 'aria-label': 'Without label' }} displayEmpty>
            <MenuItem value="" disabled>
            <FormattedMessage module="workforce" id="workforce.timePicker.hour" />
          </MenuItem>
            {displayHours.map((h) => (
              <MenuItem key={h.value} value={h.value}>
                {h.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText><FormattedMessage module="workforce" id="workforce.timePicker.hour" /></FormHelperText>

        </FormControl>

        <FormControl className={classes.formControl}>
          {/* <InputLabel>
            <FormattedMessage module="workforce" id="workforce.timePicker.minute" />
          </InputLabel> */}
          <Select value={time.minute} inputProps={{ 'aria-label': 'Without label' }} displayEmpty onChange={handleChange("minute")}>
            <MenuItem value="" disabled>
            <FormattedMessage module="workforce" id="workforce.timePicker.minute" />
          </MenuItem>
            {displayMinutes.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText><FormattedMessage module="workforce" id="workforce.timePicker.minute" /></FormHelperText>
        </FormControl>

        <FormControl className={classes.formControl}>
          {/* <InputLabel>AM/PM</InputLabel> */}
          <Select value={time.period} onChange={handleChange("period")} inputProps={{ 'aria-label': 'Without label' }} displayEmpty>
            <MenuItem value="" disabled>
            <FormattedMessage module="workforce" id="AM/PM" />
          </MenuItem>
            <MenuItem value="AM">AM</MenuItem>
            <MenuItem value="PM">PM</MenuItem>
          </Select>
          <FormHelperText>AM/PM</FormHelperText>

        </FormControl>
      </Grid>
    </div>
  );
};

export default CustomTimePicker;
