import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslations, Autocomplete,decodeId } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchPostOfficesPick, 
  // createPostOffice 
} from "../actions"; // you'll need a create mutation action

// Custom debounce implementation
const useDebounce = (callback, delay) => {
  const timer = useRef(null);

  const debouncedFn = useCallback(
    (...args) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedFn;
};

const PostOfficePicker = ({
  locationId,
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
  const [searchString, setSearchString] = useState("");
  const { formatMessage } = useTranslations("workforce");
  const locale = useSelector((state) => state.core?.user?.i_user?.language || "en");
  const dispatch = useDispatch();
  const id=locationId

  useEffect(() => {
  if (locationId) {
    dispatch(fetchPostOfficesPick(modulesManager, decodeId(locationId)));
  }
}, [dispatch, modulesManager, locationId]);

  const isLoading = useSelector((state) => state.workforce[`fetchingPostOfficesPick`]);
  const data = useSelector((state) => state.workforce[`postOfficesPick`] ?? []);
  const error = useSelector((state) => state.workforce["errorPostOfficesPick"]);

  const selectedOption = useMemo(
    () => data.find((option) => option.id === value) || null,
    [value, data]
  );

  console.log("post office", data);
  console.log("locale", locale);

  const debouncedCreate = useDebounce((name) => {
    if (!name || data.find((d) => d.nameEn === name || d.nameBn === name)) return;

    // dispatch(createPostOffice(modulesManager, { nameEn: name, nameBn: name }));
  }, 1000);

  useEffect(() => {
    if (searchString && !data.find((d) => d.nameEn === searchString || d.nameBn === searchString)) {
      debouncedCreate(searchString);
    }
  }, [searchString, data, debouncedCreate]);

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.postOffice.picker")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data}
      isLoading={isLoading}
      value={selectedOption}
      getOptionLabel={(option) => (locale === "en" ? option?.nameEn : option?.nameBn)}
      onChange={(option) => onChange(option, option ? option.id : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(val) => setSearchString(val)}
      onOpen={() => {
    if (locationId) {
      dispatch(fetchPostOfficesPick(modulesManager, decodeId(locationId)));
    }
  }}
    />
  );
};

export default PostOfficePicker;
