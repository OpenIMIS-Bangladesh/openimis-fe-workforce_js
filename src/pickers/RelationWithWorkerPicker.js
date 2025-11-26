import React, { useMemo, useState } from "react";
import { useTranslations, Autocomplete } from "@openimis/fe-core";
import { getUserType } from "../utils/utils";
import { WORKFORCE_USER_TYPE } from "../constants";

const RelationWithWorkerPicker = ({
  id,
  applicantInfo ="",
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
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("workforce");
  const user_type = getUserType();

  // Adjust the options to match the EMPLOYEE_RELATION format
  const EMPLOYEE_RELATION = [
  "workforce.relation.father",
  "workforce.relation.mother",
  "workforce.relation.wife",
  "workforce.relation.husband",
  "workforce.relation.son",
  "workforce.relation.daughter",
  "workforce.relation.brother",
  "workforce.relation.sister",
  "workforce.relation.grand_daughter",
  "workforce.relation.grand_son",
  "workforce.relation.grand_father",
  "workforce.relation.grand_mother"
  ];

  const EMPLOYEE_RELATION_APPLICANT = [
    "workforce.user.role.factoryAdmin"
  ]

  // Find the selected option
  const selectedOption = useMemo(
    () => (EMPLOYEE_RELATION.includes(value) ? value : null),
    [value]
  );
  return (
    <Autocomplete
      id={id}
      multiple={false}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.employee.relation.picker")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      isLoading={false} // Set to false if not loading data dynamically
      options={(user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && applicantInfo ==="factory_admin")? EMPLOYEE_RELATION_APPLICANT : EMPLOYEE_RELATION}
      value={selectedOption}
      getOptionLabel={(option) => formatMessage(option)} // Since options are strings, return the string directly
      onChange={(option) => onChange(option, option ?? null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default RelationWithWorkerPicker;
