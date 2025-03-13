import React, { useEffect, useMemo } from "react";
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

  useEffect(() => {
    if (bankId) {
      dispatch(fetchBanksPick(modulesManager, [], bankId)); // Fetch branches for selected bank
    }
  }, [bankId]); // Fetch only when bankId changes

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingBranchesPick`]
  );
  const allBranches = useSelector(
    (state) => state.workforce[`branchesPick`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorBranchesPick"]
  );

  // Filter branches based on selected bank
  const filteredBranches = useMemo(() => {
    return allBranches.filter(branch => branch.bankId === bankId);
  }, [allBranches, bankId]);

  const selectedOption = useMemo(
    () => filteredBranches.find((option) => option.id === value) || null,
    [value, filteredBranches]
  );

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
      options={filteredBranches}
      isLoading={isLoading}
      value={selectedOption}
      getOptionLabel={(option) => `${option.nameEn}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
    />
  );
};

export default BranchPicker;
