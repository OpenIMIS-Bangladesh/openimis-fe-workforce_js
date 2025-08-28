import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete,decodeId } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchFactoriesPick } from "../actions";

const FactoryPicker = ({
  id,
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
  companyId
}) => {
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("workforce");

  const dispatch = useDispatch();
  const locale = useSelector(
      (state) => state.core?.user?.i_user?.language || "en"
    );

  useEffect(() => {
    return dispatch(fetchFactoriesPick(modulesManager, []));
  }, []);

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingWorkforceFactoriesPick`],
  );
  const data = useSelector(
    (state) => state.workforce[`workforceFactoriesPick`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorWorkforceFactoriesPick"]
  );

  // const data = useMemo(() => {
  //   return data.filter(factory => decodeId(factory.workforceEmployer.id) === companyId);
  // }, [data, companyId]);

  
   const selectedOption = useMemo(
      () => data.find((option) => option.id === value) || null,
      [value]
    )
console.log("murad fake",value)
  return (
    <Autocomplete
    id={id}
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.organization.parent")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data}
      isLoading={isLoading}
      value={selectedOption}
      getOptionLabel={(option) =>locale === "en" ? `${option.nameEn}`:`${option.nameBn}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default FactoryPicker;
