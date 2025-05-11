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
 
  const EMPLOYEE_NAME_DESIGNATION = ["প্রশাসক - মোঃ আতাউল্লাহ", "রেজিস্ট্রার - নুরুল ইসলাম", "হিসাবরক্ষক - আশফাক উদ্দিন", "যাচাইকরণকারী - মাহমুদ রাজু"]
;

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
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={EMPLOYEE_NAME_DESIGNATION}
      isLoading={false}
      value={selectedOption}
      getOptionLabel={(option) => option}
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default EmployeePicker;