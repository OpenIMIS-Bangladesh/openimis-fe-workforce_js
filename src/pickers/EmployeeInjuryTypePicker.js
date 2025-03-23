import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const EmployeeInjuryTypePicker = ({
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

  // Adjust the options to match the EMPLOYEE_INJURY_TYPE format
  // const EMPLOYEE_INJURY_TYPE = ["Disabled", "Deceased"];
  const EMPLOYEE_INJURY_TYPE = ["অক্ষম", "মৃত"];

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_INJURY_TYPE.includes(value) ? value : null),
    [value]
  );

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.employee.injuryType")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={EMPLOYEE_INJURY_TYPE}
      value={selectedOption}
      getOptionLabel={(option) => option} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeeInjuryTypePicker;
