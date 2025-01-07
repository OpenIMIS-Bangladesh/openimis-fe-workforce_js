import React, { useState, useEffect } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrganizationsPick, fetchOrganizationUnitsPick } from "../actions";

const OrganizationUnitPicker = ({
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
    return dispatch(fetchOrganizationUnitsPick(modulesManager, []));
  }, []);

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingOrganizationUnitsPick`]
  );
  const data = useSelector(
    (state) => state.workforce[`organizationUnitsPick`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorOrganizationUnitsPick"]
  );

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
      value={value}
      getOptionLabel={(option) => `${option.nameEn}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default OrganizationUnitPicker;
