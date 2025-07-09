import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const EmployeeAccidentTypePicker = ({
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

  // Adjust the options to match the EMPLOYEE_ACCIDENT_TYPE format
  // const EMPLOYEE_ACCIDENT_TYPE = ["Fire Accident", "Boiler Explosion","Burn Injury","Machinery","Electric Shock","Heavy Weight Fall","Commuting RTA","RTA","Others"];
  const EMPLOYEE_ACCIDENT_TYPE = ["অগ্নি দুর্ঘটনা", "বয়লার বিস্ফোরণ","পোড়া আঘাত","যন্ত্রপাতি","বৈদ্যুতিক শক","ভারী ওজন পতন","সড়ক যাতায়াত","অন্যান্য"];

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_ACCIDENT_TYPE.includes(value) ? value : null),
    [value]
  );

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.employee.accident.info.typeOfAccient")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={EMPLOYEE_ACCIDENT_TYPE}
      value={selectedOption}
      getOptionLabel={(option) => option} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeeAccidentTypePicker;
