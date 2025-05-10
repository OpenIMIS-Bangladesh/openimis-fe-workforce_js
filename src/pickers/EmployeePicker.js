import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployeePick } from "../actions";

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
}) => {
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("workforce");

  const dispatch = useDispatch();

  // useEffect(() => {
  //   return dispatch(fetchEmployeePick(modulesManager, []));
  // }, []);

  // const isLoading = useSelector(
  //   (state) => state.workforce[`fetchingEmployeePick`]
  // );
  // const data = useSelector(
  //   (state) => state.workforce[`employeePick`] ?? []
  // );
  // const error = useSelector(
  //   (state) => state.workforce["errorEmployeePick"]
  // );
 
  const EMPLOYEE_NAME_DESIGNATION = ["Admin - Md. Ataullah", "Register - Nurul Islam","Accountant - Ashfaq uddin","Verifier - Mahmud Raju"];

  // const selectedOption = useMemo(
  //     () => EMPLOYEE_NAME_DESIGNATION.find((option) => option.id === value) || null,
  //     [value]
  //   )
  const selectedOption = useMemo(
      () => (EMPLOYEE_NAME_DESIGNATION.includes(value) ? value : null),
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

export default EmployeePicker;