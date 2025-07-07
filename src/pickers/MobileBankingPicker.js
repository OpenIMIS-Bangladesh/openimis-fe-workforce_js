import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const MobileBankingPicker = ({
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

  // Adjust the options to match the EMPLOYEE_LIFE_STATUS format
  const EMPLOYEE_LIFE_STATUS = ["BKash", "Nagad","Rocket"];

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_LIFE_STATUS.includes(value) ? value : null),
    [value]
  );

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? "Mobile Banking Options"}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={EMPLOYEE_LIFE_STATUS}
      value={selectedOption}
      getOptionLabel={(option) => option} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default MobileBankingPicker;
