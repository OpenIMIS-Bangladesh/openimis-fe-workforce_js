import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const RelationWithWorkerPicker = ({
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

  // Adjust the options to match the EMPLOYEE_RELATION format
  const EMPLOYEE_RELATION = [
  "workforce.relation.father",
  "workforce.relation.mother",
  "workforce.relation.wife",
  "workforce.relation.husband",
  "workforce.relation.son",
  "workforce.relation.daughter",
  "workforce.relation.brother",
  "workforce.relation.sister",
  "workforce.relation.grand_daughter",
  "workforce.relation.grand_son",
  "workforce.relation.grand_father",
  "workforce.relation.grand_mother"
  ];

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_RELATION.includes(value) ? value : null),
    [value]
  );
  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.employee.relation.picker")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={EMPLOYEE_RELATION}
      value={selectedOption}
      getOptionLabel={(option) => formatMessage(option)} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default RelationWithWorkerPicker;
