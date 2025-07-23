import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";

const BoardPicker = ({
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

  // Adjust the options to match the BOARDS format
  const BOARDS = [
    "workforce.application.educationInfo.boards.barisal",
    "workforce.application.educationInfo.boards.chattogram",
    "workforce.application.educationInfo.boards.cumilla",
    "workforce.application.educationInfo.boards.dhaka",
    "workforce.application.educationInfo.boards.rajshahi",
    "workforce.application.educationInfo.boards.dinajpur",
    "workforce.application.educationInfo.boards.sylhet",
    "workforce.application.educationInfo.boards.jashore",
    "workforce.application.educationInfo.boards.mymensingh",
    "workforce.application.educationInfo.boards.madrasha_board",
    "workforce.application.educationInfo.boards.technical_board",
    "workforce.application.educationInfo.boards.open_board",
];

  // Find the selected option
  const selectedOption = useMemo(
    () => (BOARDS.includes(value) ? value : null),
    [value]
  );

  return (
    <Autocomplete
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.application.educationInfo.board")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={BOARDS}
      value={selectedOption}
      getOptionLabel={(option) => formatMessage(option)} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default BoardPicker;
