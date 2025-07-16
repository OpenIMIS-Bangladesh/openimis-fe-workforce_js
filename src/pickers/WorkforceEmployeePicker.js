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
  filterSelectedOptions,
  multiple,
}) => {
  const [searchString, setSearchString] = useState("");
  const { formatMessage } = useTranslations("workforce");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchWorkforceEmployeesSummary(modulesManager, ""));
  }, []);

  const fetchEmployees = () => {
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
    [value, data]
  );

  const locale = useSelector(
    (state) => state.core?.user?.i_user?.language || "en"
  );

  const customFilterOptions = (options, { inputValue }) => {
    const lowerInput = inputValue.toLowerCase();
    return options.filter((opt) => {
      return (
        opt.nid?.toLowerCase().includes(lowerInput) ||
        opt.phoneNumber?.toLowerCase().includes(lowerInput) ||
        opt.firstNameBn?.toLowerCase().includes(lowerInput) ||
        opt.firstNameEn?.toLowerCase().includes(lowerInput)
      );
    });
  };

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
      getOptionLabel={(option) =>
        locale === "en" ? option.firstNameEn : option.firstNameBn
      }
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={customFilterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(text) => setSearchString(text)}
      onOpen={fetchEmployees}
    />
  );
};

export default WorkforceEmployeePicker;
