import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const EmployeeMaritalStatusPicker = ({
  modulesManager,
  onChange,
  readOnly,
  required,
  withLabel = true,
  withPlaceholder,
  value,
  label,
  placeholder,
  filterOptions,
  filterSelectedOptions,
  multiple,
}) => {
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("workforce");

  // Adjust the options to match the EMPLOYEE_MARITAL_STATUS format
  const EMPLOYEE_MARITAL_STATUS = [
    "workforce.marital_status.single", 
    "workforce.marital_status.married", 
    "workforce.marital_status.widow", 
    // "workforce.marital_status.widower", 
    "workforce.marital_status.remarried"
  ];

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_MARITAL_STATUS.includes(value) ? value : null),
    [value]
  );

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.employee.marital_status")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={EMPLOYEE_MARITAL_STATUS}
      value={selectedOption}
      getOptionLabel={(option) => formatMessage(option) } // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeeMaritalStatusPicker;
