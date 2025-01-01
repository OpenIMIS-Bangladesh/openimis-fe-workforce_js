import React, { useState } from "react";
import {
  useTranslations,
  Autocomplete,
  useGraphqlQuery,
} from "@openimis/fe-core";

const OrganizationPicker = ({
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

  const { isLoading, data, error } = useGraphqlQuery(
    `query ChannelPicker {
          grievanceConfig{
            grievanceFlags
          }
      }`,
    { searchString, first: 20 },
    { skip: true },
  );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.organization.parent")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.grievanceConfig?.grievanceFlags.map((flag) => flag) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option}`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default OrganizationPicker;
