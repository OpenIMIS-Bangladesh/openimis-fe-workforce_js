import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslations, Autocomplete, decodeId } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchPostOfficesPick } from "../actions";
import { fixBrokenUnicode } from "../utils/utils";

// Custom debounce hook
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

const PostOfficePicker = ({
  id="postOffice",
  locationId,
  modulesManager,
  onChange,
  readOnly,
  required =true,
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
  const locale = useSelector(
    (state) => state.core?.user?.i_user?.language || "en"
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (locationId) {
      dispatch(fetchPostOfficesPick(modulesManager, decodeId(locationId)));
    }
  }, [locationId]);

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingPostOfficesPick`]
  );
  const fetchedData = useSelector(
    (state) => state.workforce[`postOfficesPick`] ?? []
  );
  const error = useSelector((state) => state.workforce["errorPostOfficesPick"]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    // if (typeof value === "string" || typeof value === "number") {
    //   return fetchedData.find((option) => option.id === value) || null;
    // }
   return value || null; 
  }, [value, fetchedData]);


  const options = useMemo(() => {
    let opts = [...fetchedData];

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
        { id: '', nameEn: searchString, nameBn: searchString },
      ];
    }

    return opts;
  }, [fetchedData, selectedOption, searchString]);


  const debouncedHandleType = useDebounce((name) => {
    if (!name) return;

    const exists =
      fetchedData.find(
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
      label={label ?? formatMessage("workforce.postOffice.picker")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={options}  
      isLoading={isLoading}
      value={fixBrokenUnicode(selectedOption)}
      getOptionLabel={(option) =>
        fixBrokenUnicode(locale === "en" ? option?.nameEn || "" : option?.nameBn || "")
      }
      onChange={(option) => onChange(option)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(val) => setSearchString(val)}
    />
  );
};

export default PostOfficePicker;
