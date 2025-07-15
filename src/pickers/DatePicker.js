import React, { useMemo } from "react";
import { PublishedComponent } from "@openimis/fe-core";
import { useSelector } from "react-redux";

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
    const userLanguage = useSelector(
        (state) => state.core?.user?.i_user?.language || 'en'
    );

    const isSecondaryCalendarEnabled = useMemo(() => {
        if (secondaryCalendarEnabled) {
            return secondaryCalendarEnabled;
        }
        return userLanguage !== 'en';
    }, [secondaryCalendarEnabled, userLanguage]);

    const dateValue = useMemo(() => {
        if (reset) return null;

        const original = typeof value === 'string' ? new Date(value) : value;
        if (!original || isNaN(original)) return value;

        const adjusted = new Date(original);
        adjusted.setDate(adjusted.getDate() - 1);
        return adjusted;
    }, [reset, value]);

    return (
        <PublishedComponent
            pubRef="core.DatePicker"
            label={label}
            value={dateValue}
            onChange={onChange}
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
    );
};

export default DatePicker;
