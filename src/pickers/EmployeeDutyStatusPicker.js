import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const EmployeeDutyStatusPicker = ({
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

  // Adjust the options to match the EMPLOYEE_DUTY_STATUS format
  // const EMPLOYEE_DUTY_STATUS = ["On Duty", "Off Duty","Commuting","Others"];
  const EMPLOYEE_DUTY_STATUS = ["অন ​​ডিউটি", "অফ ডিউটি","যাতায়াত","অন্যান্য"];

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_DUTY_STATUS.includes(value) ? value : null),
    [value]
  );

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.employee.accident.info.dutyStatus")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={EMPLOYEE_DUTY_STATUS}
      value={selectedOption}
      getOptionLabel={(option) => option} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeeDutyStatusPicker;
