import React, { useMemo } from "react";
import { PublishedComponent } from "@openimis/fe-core";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  modernWrapper: {
    "& .MuiFormControl-root": {
      marginTop: 4,
    },

    "& .MuiInputBase-root": {
      borderRadius: 12,
      backgroundColor: "#f9fafb",
      transition: "all 0.3s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
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
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#4f46e5",
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
        readOnly={readOnly}
        required={required}
        fullWidth={fullWidth}
        minDate={minDate}
        maxDate={maxDate}
        format={format}
        secondaryCalendarEnabled={isSecondaryCalendarEnabled}
        secondCalendarType={secondaryCalendarType}
        secondCalendarLocale={secondaryCalendarLocale}
      />
    </div>
  );
};

export default DatePicker;