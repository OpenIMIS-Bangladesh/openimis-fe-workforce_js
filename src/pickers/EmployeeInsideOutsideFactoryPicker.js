import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const EmployeeInsideOutsideFactoryPicker = ({
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

  // Adjust the options to match the EMPLOYEE_INSIDE_OUTSIDE_FACTORY format
  // const EMPLOYEE_INSIDE_OUTSIDE_FACTORY = ["Inside Factory", "Outside Factory"];
  const EMPLOYEE_INSIDE_OUTSIDE_FACTORY = ["কারখানার ভিতরে", "অফিস থেকে বাসায় যাওয়ার সময়","বাসা থেকে অফিসে যাওয়ার সময়","অফিসার-এর কাজে বাইরে যাওয়ার সময়","অন্যান্য"];

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_INSIDE_OUTSIDE_FACTORY.includes(value) ? value : null),
    [value]
  );

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.employee.accident.info.insideOutsideFactory")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={EMPLOYEE_INSIDE_OUTSIDE_FACTORY}
      value={selectedOption}
      getOptionLabel={(option) => option} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeeInsideOutsideFactoryPicker;
