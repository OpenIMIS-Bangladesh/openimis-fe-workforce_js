import React, { useEffect, useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchBanksPick } from "../actions";

const BranchPicker = ({
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
  bankId, // Receiving selected bank ID
}) => {
  const { formatMessage } = useTranslations("workforce");
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState(null);

  useEffect(() => {
    if (bankId) {
      dispatch(fetchBanksPick(modulesManager, [`type:"branch"`])); // Fetching branches
    }
  }, [bankId]); // Runs only when bankId changes

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingBanksPick`]
  );
  const allData = useSelector(
    (state) => state.workforce[`banksPick`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorBanksPick"]
  );

  // Filtering branches that belong to the selected bank
  const branches = useMemo(() => {
    return allData.filter((branch) => branch?.parent?.id === bankId); // Assuming `parentBankId` links branches to banks
  }, [allData, bankId]);

  const selectedOption = useMemo(
    () => branches.find((option) => option.id === value) || null,
    [value, branches]
  );

  console.log({allData})

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.branch.picker")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={branches} // Using filtered branches
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

export default BranchPicker;
