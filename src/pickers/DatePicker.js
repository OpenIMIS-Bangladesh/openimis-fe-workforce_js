import React, { useMemo } from "react";
import { PublishedComponent } from "@openimis/fe-core";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  modernWrapper: {
    "& .MuiFormControl-root": {
      marginTop: 4,
      width: "100%",
    },

    "& .MuiInputBase-root": {
      borderRadius: 12,
      transition: "all 0.3s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      minHeight: 56,
      fontSize: "16px",
      lineHeight: "33px",
      fontFamily: "'Nikosh', sans-serif",
    },

    "& .MuiOutlinedInput-root": {
      minHeight: 56,
      fontFamily: "'Nikosh', sans-serif",
    },

    "& .MuiInputBase-input": {
      padding: "16.5px 14px",
      fontSize: "16px",
      lineHeight: "33px",
      fontFamily: "'Nikosh', sans-serif",
      boxSizing: "border-box",
    },

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#e5e7eb",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#6366f1",
    },

    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#4f46e5",
      borderWidth: 2,
    },

    "& .MuiInputLabel-root": {
      fontWeight: 500,
      fontSize: "16px",
      fontFamily: "'Nikosh', sans-serif",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#4f46e5",
    },

    "& .MuiSvgIcon-root": {
      fontSize: "1.5rem",
    },

    "& .MuiIconButton-root": {
      padding: 8,
    },
  },
}));

const DatePicker = ({
  intl,
  classes,
  disablePast,
  module,
  label,
  readOnly = false,
  required = false,
  fullWidth = true,
  format = "DD-MM-YYYY",
  reset,
  modulesManager,
  minDate,
  maxDate,
  value,
  onChange,
  secondaryCalendarEnabled,
  secondaryCalendarType = "default",
  secondaryCalendarLocale = "bengali_en",
}) => {
  const styles = useStyles();

  const userLanguage = useSelector(
    (state) => state.core?.user?.i_user?.language || "en"
  );

  const isSecondaryCalendarEnabled = useMemo(() => {
    if (secondaryCalendarEnabled) {
      return secondaryCalendarEnabled;
    }
    return userLanguage !== "en";
  }, [secondaryCalendarEnabled, userLanguage]);

  const dateValue = useMemo(() => {
    if (reset) return null;

    const original = typeof value === "string" ? new Date(value) : value;
    if (!original || isNaN(original)) return value;

    const adjusted = new Date(original);
    adjusted.setDate(adjusted.getDate() - 1);
    return adjusted;
  }, [reset, value]);

  return (
    <div className={styles.modernWrapper}>
      <PublishedComponent
        pubRef="core.DatePicker"
        label={label}
        value={dateValue}
        onChange={(val) => {
            if (val === null || val === "" || val === undefined) {
                onChange(null);
            } else {
                onChange(val);
            }
        }}
        editable={false}
        readOnly={readOnly}
        required={required}
        fullWidth={fullWidth}
        minDate={minDate}
        maxDate={maxDate}
        format={format}
        secondaryCalendarEnabled={isSecondaryCalendarEnabled}
        secondCalendarType={secondaryCalendarType}
        secondCalendarLocale={secondaryCalendarLocale}
        inputProps={{ readOnly: true }}
      />
    </div>
  );
};

export default DatePicker;