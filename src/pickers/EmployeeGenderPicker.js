import React, { useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { WORKFORCE_GENDER } from "../constants";

const EmployeeGenderPicker = ({
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

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.organization.employee.gender")}
     
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={true}
      options={WORKFORCE_GENDER}
      value={value}
      getOptionLabel={(option) => `${option.name}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeeGenderPicker;
