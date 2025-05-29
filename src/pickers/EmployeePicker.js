import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete,decodeId } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchOrganizationEmployee,
  fetchOrganizationEmployeesSummary,
} from "../actions";

const EmployeePicker = ({
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
  organizationEmployee,
}) => {
  const [searchString, setSearchString] = useState(null);

  const organizationId =
    organizationEmployee?.designations?.[0]?.designation?.unit?.organization?.id;

  const { formatMessage } = useTranslations("workforce");
  const dispatch = useDispatch();

  const employeeData = useSelector(
    (state) => state.workforce["organizationEmployees"] ?? []
  );

  const isLoading = useSelector(
    (state) => state.workforce["fetchingOrganizationEmployees"]
  );

  const error = useSelector(
    (state) => state.workforce["errorOrganizationEmployees"]
  );

  useEffect(() => {
    if (organizationId) {
      dispatch(
        fetchOrganizationEmployeesSummary(modulesManager, [
          `designations_Designation_Organization_Id:"${decodeId(organizationId)}"`,
        ])
      );
    } else {
      dispatch(fetchOrganizationEmployee(modulesManager, []));
    }
  }, [dispatch, modulesManager, organizationId]);

  const selectedOption = useMemo(
    () => employeeData?.find((option) => option.id === value) || null,
    [value, employeeData]
  );

  console.log("OrganizationEmployeeData",employeeData)

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? ""}
      label={label ?? formatMessage("workforce.organization.parent")}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={employeeData}
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

export default EmployeePicker;
