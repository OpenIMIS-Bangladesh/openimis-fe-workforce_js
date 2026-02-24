import React, { useState, useEffect, useMemo } from "react";
import { useTranslations, Autocomplete,decodeId } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchFactoriesPick, fetchWorkforceAllAssociation, fetchWorkforceEmployee, fetchWorkforceEmployeeWithoutProjection } from "../actions";
import {encodeId, useModulesManager } from "@openimis/fe-core";
import { safeDecodeId } from "../utils/utils";
const AssociationPicker = ({
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
  const loggedInUserId= useSelector((state) => state.core?.user?.i_user?.id);
  const mm= useModulesManager();

  const dispatch = useDispatch();
  const locale = useSelector(
      (state) => state.core?.user?.i_user?.language || "en"
    );

  useEffect(async () => {
      const response = await dispatch(fetchWorkforceEmployee(mm, [`relatedUserId: "${encodeId(mm, "InteractiveUserGQLType", loggedInUserId)}"`]));
      const edges = response?.payload?.data?.workforceEmployerEmployees?.edges || [];
      const node = edges[0]?.node || {};
      const associationId = safeDecodeId(node?.allAssociation?.id) || null;
      return dispatch(fetchWorkforceAllAssociation(mm, associationId!=null?[`id: "${associationId}"`]:[]));
  }, []);

  const isLoading = useSelector(
    (state) => state.workforce[`fetchingWorkforceAllAssociations`],
  );
  const data = useSelector(
    (state) => state.workforce[`workforceAllAssociations`] ?? []
  );
  const error = useSelector(
    (state) => state.workforce["errorWorkforceAllAssociations"]
  );

  // const data = useMemo(() => {
  //   return data.filter(factory => decodeId(factory.workforceEmployer.id) === companyId);
  // }, [data, companyId]);

  
   const selectedOption = useMemo(
      () => data.find((option) => option.id === value) || null,
      [value,data]
    )
  console.log("association data", data);
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
      getOptionLabel={(option) =>locale === "en" ? `${option.nameEn} (${option.shortNameEn})`:`${option.nameBn} (${option.shortNameEn})`}
      onChange={(option) => onChange(option, option ? `${option}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default AssociationPicker;
