import React, { useEffect, useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchBanksPick, fetchBranchPick } from "../actions";

const DistrictBanks = ({
  id="districtBank",
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
      dispatch(fetchBranchPick(modulesManager, [`type:"branch",bankCode: "${bankId}",orderBy: "districtNameBn", getUnique: "true"`])); // Fetching branches
    }
  }, [bankId]); // Runs only when bankId changes

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingBranchPick`]
  );
  const allData = useSelector(
    (state) => state.workforce[`branchPick`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorBranchPick"]
  );

  // Filtering branches that belong to the selected bank
  // const branches = useMemo(() => {
  //   return allData.filter((branch) => branch?.parent?.id === bankId); // Assuming `parentBankId` links branches to banks
  // }, [allData, bankId]);

  const selectedOption = useMemo(
    () => allData.find((option) => option.id === value) || null,
    [value, allData]
  );

  console.log({allData})
  const locale = useSelector((state) => state.core?.user?.i_user?.language || "en");

  return (
    <Autocomplete
      id={id}
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.branch.picker")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={allData} // Using filtered branches
      isLoading={isLoading}
      value={selectedOption}
      // getOptionLabel={(option) => `${option.nameEn}`}
      getOptionLabel={(option) => locale === "en" ? option?.districtNameEn : option?.districtNameBn}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default DistrictBanks;
