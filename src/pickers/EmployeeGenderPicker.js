import React, { useMemo, useState } from "react";
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

  const selectedOption = useMemo(
    () => WORKFORCE_GENDER.find((option) => option.id === value) || null,
    [value]
  )

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
      value={selectedOption}
      getOptionLabel={(option) => `${option.name}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeeGenderPicker;
