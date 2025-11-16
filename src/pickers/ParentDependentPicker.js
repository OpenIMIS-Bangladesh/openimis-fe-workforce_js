import React, { useMemo } from "react";
import { Autocomplete, useTranslations } from "@openimis/fe-core";
import { useSelector } from "react-redux";

const ParentDependentPicker = ({
  id = "parentDependent",
  label,
  placeholder,
  withLabel = true,
  withPlaceholder = true,
  required = false,
  readOnly = false,
  value,
  onChange,
  options = [],
  filterOptions,
  filterSelectedOptions,
  multiple = false,
}) => {
  const { formatMessage } = useTranslations("workforce");

  // Detect current language (en/bn)
  const locale = useSelector(
    (state) => state.core?.user?.i_user?.language || "en"
  );

  // Memoize selected option
  const selectedOption = useMemo(
    () => options.find((opt) => opt.id === value) || null,
    [value, options]
  );

  return (
    <Autocomplete
      id={id}
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("Select Parent Dependent")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={options}
      value={selectedOption}
      getOptionLabel={(option) =>
        locale === "en"
          ? option?.nameEn || option?.nameBn || ""
          : option?.nameBn || option?.nameEn || ""
      }
      onChange={(option) => {
        // send the selected object and ID
        onChange(option, option ? option.id : null);
      }}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={() => {}}
    />
  );
};

export default ParentDependentPicker;
