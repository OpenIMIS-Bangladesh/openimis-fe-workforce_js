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

   const [searchString, setSearchString] = useState(null);
  
    useEffect(() => {
      return dispatch(fetchBanksPick(modulesManager, [`type:"branch"`]));
    }, []);
  
    const isLoading = useSelector(
      (state) => state.workforce[`fetchingBanksPick`]
    );
    const data = useSelector(
      (state) => state.workforce[`banksPick`] ?? []
    );
    const error = useSelector(
      (state) => state.workforce["errorBanksPick"]
    );
  
    const selectedOption = useMemo(
          () => data.find((option) => option.id === value) || null,
          [value]
        )
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
        getOptionLabel={(option) => `${option.nameEn}`}
        onChange={(option) => onChange(option, option ? `${option}` : null)}
        filterOptions={filterOptions}
        filterSelectedOptions={filterSelectedOptions}
        onInputChange={setSearchString}
      />
    );
  };

export default BranchPicker;
