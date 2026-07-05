import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchWorkforceEmployeesSummary } from "../actions";

const WorkforceEmployeePicker = ({
  modulesManager,
  workforceFactoryId,
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
  const user = useSelector((state) => state.core?.user);
  console.log("user infos", user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchWorkforceEmployeesSummary(modulesManager, [`workforceFactoryId:"${workforceFactoryId}"`]));
  }, []);

  const fetchEmployees = () => {
    dispatch(fetchWorkforceEmployeesSummary(modulesManager, ""));
  };

  const isLoading = useSelector((state) => state.workforce[`fetchingWorkforceEmployees`]);
  const data = useSelector((state) => state.workforce[`workforceEmployees`] ?? []);
  const error = useSelector((state) => state.workforce["errorWorkforceEmployees"]);

  const selectedOption = useMemo(() => data.find((option) => option.id === value) || null, [value, data]);

  const locale = useSelector((state) => state.core?.user?.i_user?.language || "en");

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

  console.log({selectedOption})

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
      getOptionLabel={(option) => (locale === "en" ? option.firstNameEn : option.firstNameBn)}
      onChange={(option) => {
        console.log("WorkforceEmployeePicker selected:", option);
        onChange(option, option ? option.id : null);
      }}
      filterOptions={customFilterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(text) => setSearchString(text)}
      textFieldProps={{
        inputProps: {
          inputMode: "numeric",
          pattern: "[0-9০-৯]*", // allow English + Bangla numbers
        },
      }}
      // onOpen={fetchEmployees}
    />
  );
};

export default WorkforceEmployeePicker;
