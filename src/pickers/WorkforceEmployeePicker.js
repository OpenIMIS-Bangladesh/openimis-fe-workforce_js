import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchWorkforceEmployeesSummary } from "../actions";

const WorkforceEmployeePicker = ({
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
    return dispatch(fetchWorkforceEmployeesSummary(modulesManager, ""));
  }, []);

  const fetchBanks = () => {
    dispatch(fetchWorkforceEmployeesSummary(modulesManager, ""));
  };

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingWorkforceEmployees`]
  );
  const data = useSelector(
    (state) => state.workforce[`workforceEmployees`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorWorkforceEmployees"]
  );

  const selectedOption = useMemo(
        () => data.find((option) => option.id === value) || null,
        [value]
      )
  console.log({selectedOption})
  const locale = useSelector((state) => state.core?.user?.i_user?.language || "en");

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.bank.picker")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data}
      isLoading={isLoading}
      value={selectedOption}
      getOptionLabel={(option) => locale === "en" ? option.nameEn : option.nameBn}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
      onOpen={fetchBanks}
    />
  );
};

export default WorkforceEmployeePicker;
