export function cacheFilters(key, filters) {
  return (dispatch) => {
    dispatch({ type: "CORE_CACHE_FILTER", payload: { [key]: filters } });
  };
}

export function resetCacheFilters(key) {
  return (dispatch) => {
    dispatch({ type: "CORE_CACHE_FILTER_RESET", payload: key });
  };
}

export function saveCurrentPaginationPage(page, afterCursor, beforeCursor, module) {
  return (dispatch) => {
    dispatch({ type: "CORE_PAGINATION_PAGE", payload: { page, afterCursor, beforeCursor, module } });
  };
}