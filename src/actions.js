import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString, formatPageQuery,
  baseApiUrl, decodeId, openBlob, formatQuery,
} from "@openimis/fe-core";

export function fetchOrganizationsSummary(mm, filters) {
  const projections = [
    "id", "nameBn", "nameBn", "workforceRepresentative { id,nameBn,nameEn,position,email,nid}",
    "location{name,type,parent{name,type,parent{name,type,parent{name,type}}}}",
    "address",
  ];
  const payload = formatPageQueryWithCount(
    "workforceOrganizations",
    filters,
    projections,
  );
  return graphql(payload, "WORKFORCE_ORGANIZATIONS");
}
