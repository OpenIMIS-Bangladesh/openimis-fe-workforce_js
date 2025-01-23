import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchOfficesPick } from "../actions";

const OfficePicker = ({
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

  const dispatch = useDispatch();

  useEffect(() => {
    return dispatch(fetchOfficesPick(modulesManager, []));
  }, []);

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingWorkforceOfficesPick`],
  );
  const data = useSelector(
    (state) => state.workforce[`workforceOfficesPick`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorWorkforceOfficesPick"]
  );

   const selectedOption = useMemo(
      () => data.find((option) => option.id === value) || null,
      [value]
    )
  
  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.organization.parent")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data}
      isLoading={isLoading}
      value={selectedOption}
      getOptionLabel={(option) => `${option.nameEn}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default OfficePicker;
