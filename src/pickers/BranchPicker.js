import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchBanksPick, fetchBranchPick } from "../actions";

const useDebounce = (callback, delay) => {
  const timer = useRef(null);

  const debouncedFn = useCallback(
    (...args) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedFn;
};

const BranchPicker = ({
  id="branch",
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
  districtName
}) => {
  const { formatMessage } = useTranslations("workforce");
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState(null);
  const locale = useSelector((state) => state.core?.user?.i_user?.language || "en");

  useEffect(() => {
    if (bankId && districtName) {
      dispatch(fetchBranchPick(modulesManager, [`type:"branch",bankCode: "${bankId}",orderBy: "districtNameBn", districtNameBn: "${districtName}"`])); // Fetching branches
    }
  }, [bankId,districtName]); // Runs only when bankId changes

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
    () => {
      if (!value) return null;
      if (typeof value === "string") {
      return allData.find((option) => option.id === value) || null
      }
      return value
    },
    [value, allData]
  );

  console.log({allData})
  
  const options = useMemo(() => {
      let opts = [...allData];
  
      if (selectedOption && !opts.find((o) => o.id === selectedOption.id)) {
        opts = [...opts, selectedOption];
      }
  
      if (
        searchString &&
        !opts.find(
          (o) =>
            o.nameEn?.toLowerCase() === searchString.toLowerCase() ||
            o.nameBn?.toLowerCase() === searchString.toLowerCase()
        )
      ) {
        opts = [
          ...opts,
          { id: null, nameEn: searchString, nameBn: searchString },
        ];
      }
  
      return opts;
    }, [allData, selectedOption, searchString]);

    const debouncedHandleType = useDebounce((name) => {
    if (!name) return;

    const exists =
      allData.find(
        (d) => d.nameEn?.toLowerCase() === name.toLowerCase() ||
               d.nameBn?.toLowerCase() === name.toLowerCase()
      ) || null;

    if (exists) {
      if (!selectedOption || selectedOption.id !== exists.id) {
        onChange(exists);
      }
    } else {
      if (!selectedOption || selectedOption.nameEn !== name) {
        const newOption = { id: null, nameEn: name, nameBn: name };
        onChange(newOption);
      }
    }
  }, 800);

  useEffect(() => {
      if (searchString) {
        debouncedHandleType(searchString);
      }
    }, [searchString, debouncedHandleType]);

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
      options={options} // Using filtered branches
      isLoading={isLoading}
      value={selectedOption}
      // getOptionLabel={(option) => `${option.nameEn}`}
      getOptionLabel={(option) => locale === "en" ? option?.nameEn : option?.nameBn }
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default BranchPicker;
