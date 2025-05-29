import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { createEmployeeService, fetchEmployeePick, fetchOrganizationEmployee } from "../actions";

const EmployeePicker = ({
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
  userName
}) => {
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("workforce");

  const dispatch = useDispatch();

  useEffect(() => {
    // return dispatch(fetchEmployeePick(modulesManager, []));
    if (userName) {
      return dispatch(fetchOrganizationEmployee(modulesManager, [`username:"${userName}"`]));
    }else {
      return dispatch(fetchOrganizationEmployee(modulesManager, []));
    }
  }, []);

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingOrganizationEmployees`]
  );
  const data = useSelector(
    (state) => state.workforce[`organizationEmployees`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorOrganizationEmployees"]
  );

  const selectedOption = useMemo(
      () => data.find((option) => option.id === value) || null,
      [value]
    )

console.log({userName})
console.log('organizationEmployees',data)
  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.organization.parent")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data}
      isLoading={false}
      value={selectedOption}
      getOptionLabel={(option) => `${option.nameEn}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeePicker;