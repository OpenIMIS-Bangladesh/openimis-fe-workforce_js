import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchPostOfficesPick, createPostOffice } from "../actions"; // you'll need a create mutation action
import debounce from "lodash/debounce";

const PostOfficePicker = ({
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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPostOfficesPick(modulesManager));
  }, [dispatch, modulesManager]);

  const isLoading = useSelector((state) => state.workforce[`fetchingPostOfficesPick`]);
  const data = useSelector((state) => state.workforce[`postOfficesPick`] ?? []);
  const error = useSelector((state) => state.workforce["errorPostOfficesPick"]);
  const locale = useSelector((state) => state.core?.user?.i_user?.language || "en");

  const selectedOption = useMemo(
    () => data.find((option) => option.id === value) || null,
    [value, data]
  );

  const debouncedCreate = useCallback(
    debounce((name) => {
      if (!name || data.find((d) => d.nameEn === name || d.nameBn === name)) return;

      dispatch(
        createPostOffice(modulesManager, { nameEn: name, nameBn: name })
      );
    }, 1000),
    [dispatch, data]
  );


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
      getOptionLabel={(option) =>
        locale === "en"
          ? option?.nameEn || option?.nameBn || ""
          : option?.nameBn || option?.nameEn || ""
      }
      onChange={(option) => onChange(option, option ? option.id : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(val) => setSearchString(val)}
      onOpen={() => dispatch(fetchPostOfficesPick(modulesManager))}
    />
  );
};

export default PostOfficePicker;
