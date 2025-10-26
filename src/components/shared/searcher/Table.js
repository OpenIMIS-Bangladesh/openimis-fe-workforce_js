import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import _ from "lodash";
import DeleteIcon from "@material-ui/icons/Delete";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Divider,
  Box,
  IconButton,
  Table as MUITable,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  Grid,
  TablePagination,
  Checkbox,
} from "@material-ui/core";
import {
  withModulesManager,
  withHistory,
  historyPush,
  coreConfirm,
  journalize,
  FormattedMessage,
  useTranslations,
  ProgressOrError,
} from "@openimis/fe-core";

import { getUserType } from "../../../utils/utils";
import {roleMaxDayCount} from "../../../constants";
import {colorCode} from "../../../constants";
import ColoredRowLegends from "./ColoredRowLegends";

const styles = (theme) => ({
  table: theme.table,
  tableTitle: theme.table.title,
  tableHeader: {
    paddingTop: "10px",
    paddingBottom: "10px",
    fontWeight: "bold",
  },
  tableRow: {
    backgroundColor: "#edf6f6",
  },
  tableLockedRow: theme.table.lockedRow,
  tableLockedCell: theme.table.lockedCell,
  tableHighlightedRow: theme.table.highlightedRow,
  tableHighlightedCell: theme.table.highlightedCell,
  tableHighlightedAltRow: theme.table.highlightedAltRow,
  tableSecondaryHighlightedRow: theme.table.secondaryHighlightedRow,
  tableSecondaryHighlightedCell: theme.table.secondaryHighlightedCell,
  tableHighlightedAltCell: theme.table.highlightedAltCell,
  tableDisabledRow: theme.table.disabledRow,
  tableDisabledCell: theme.table.disabledCell,
  tableFooter: theme.table.footer,
  pager: theme.table.pager,
  left: { textAlign: "left" },
  right: { textAlign: "right" },
  center: { textAlign: "center" },
  clickable: { cursor: "pointer" },
  loader: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0, 0, 0, 0.12)",
  },
});

function Table({
  modulesManager,
  classes,
  module,
  header,
  preHeaders,
  headers,
  aligns = [],
  headerSpans = [],
  headerActions = [],
  colSpans = [],
  items = [],
  itemFormatters = [],
  rowHighlighted = null,
  rowHighlightedAlt = null,
  rowSecondaryHighlighted = null,
  rowDisabled = null,
  rowLocked = null,
  withPagination = false,
  page = 0,
  pageSize,
  count,
  size,
  rowsPerPageOptions = [10, 20, 50],
  onChangeRowsPerPage,
  onChangePage,
  onDoubleClick,
  onDelete = null,
  fetching = null,
  error = null,
  showOrdinalNumber = false,
  extendHeader,
  disableDeleteOnEmptyRow = false,
  selectWithCheckbox = false,
  withSelection = false,
  itemIdentifier: itemIdentifierProp,
  selectAll: selectAllSignal,
  clearAll: clearAllSignal,
  selection: initialSelection = [],
  onChangeSelection,
  onChangeSelectionIds, // optional: receives array of ids
  coloredRow = false,
}) {
  const { formatMessage, formatMessageWithValues } = useTranslations(
    "workforce" || "core"
  );

  // Use selection from props directly instead of maintaining separate state
  const [ordinalNumberFrom, setOrdinalNumberFrom] = useState(null);

  const prevSelectAllRef = useRef(selectAllSignal);
  const prevClearAllRef = useRef(clearAllSignal);

  // Normalize itemIdentifierProp to accept (item, idx)
  const itemIdentifier = useCallback(
    (item, idx) => {
      if (typeof itemIdentifierProp === "function") return itemIdentifierProp(item, idx);
      return item?.uuid ?? item?.id ?? item?.code ?? item?.nid ?? `idx-${idx}`;
    },
    [itemIdentifierProp]
  );

  // Convert array to map for O(1) lookups
  const selectionMap = useMemo(() => {
    if (!Array.isArray(initialSelection)) return {};
    return (initialSelection || []).reduce((m, it, idx) => {
      const id = itemIdentifier(it, idx);
      m[id] = it;
      return m;
    }, {});
  }, [initialSelection, itemIdentifier]);

  const atom = useCallback(
    (arr) =>
      (arr || []).reduce((m, it, idx) => {
        m[itemIdentifier(it, idx)] = it;
        return m;
      }, {}),
    [itemIdentifier]
  );

  // Normalize selection mode:
  // - false => no selection
  // - "multiple" => multi-selection (checkboxes)
  // - "single" => single-selection (row click)
  const selectionMode = useMemo(() => {
    if (!withSelection) return false;
    if (withSelection === "multiple") return "multiple";
    // if user passed boolean true and uses checkboxes -> treat as multiple
    if (withSelection === true && selectWithCheckbox) return "multiple";
    // boolean true + no checkbox => single selection
    if (withSelection === true) return "single";
    // any other truthy value -> single
    return "single";
  }, [withSelection, selectWithCheckbox]);

  // Handle selectAll signal (merge page items)
  useEffect(() => {
    if (!selectionMode) return;
    if (prevSelectAllRef.current !== selectAllSignal && selectAllSignal > 0) {
      const currentSelectionArray = Array.isArray(initialSelection) ? initialSelection : [];
      const merged = [...currentSelectionArray, ...items.filter(item => 
        !currentSelectionArray.find(selected => 
          itemIdentifier(selected) === itemIdentifier(item)
        )
      )];
      
      onChangeSelection?.(merged);
      onChangeSelectionIds?.(merged.map(item => itemIdentifier(item)));
      prevSelectAllRef.current = selectAllSignal;
    }
  }, [selectAllSignal, selectionMode, items, initialSelection, itemIdentifier, onChangeSelection, onChangeSelectionIds]);

  // Handle clearAll signal
  useEffect(() => {
    if (!selectionMode) return;
    if (prevClearAllRef.current !== clearAllSignal && clearAllSignal > 0) {
      onChangeSelection?.([]);
      onChangeSelectionIds?.([]);
      prevClearAllRef.current = clearAllSignal;
    }
  }, [clearAllSignal, selectionMode, onChangeSelection, onChangeSelectionIds]);

  const isSelected = useCallback(
    (item, idx) => {
      if (!selectionMode) return false;
      const id = itemIdentifier(item, idx);
      return !!selectionMap[id];
    },
    [selectionMap, selectionMode, itemIdentifier]
  );

  const select = useCallback(
    (item, idx) => {
      if (!selectionMode || !onChangeSelection) return;
      
      const currentSelection = Array.isArray(initialSelection) ? [...initialSelection] : [];
      const id = itemIdentifier(item, idx);
      const existingIndex = currentSelection.findIndex(selected => 
        itemIdentifier(selected) === id
      );

      let newSelection;
      if (existingIndex >= 0) {
        // Item is selected, remove it
        newSelection = currentSelection.filter((_, index) => index !== existingIndex);
      } else if (selectionMode === "multiple") {
        // Add item to selection
        newSelection = [...currentSelection, item];
      } else {
        // Single selection: replace
        newSelection = [item];
      }

      onChangeSelection(newSelection);
      onChangeSelectionIds?.(newSelection.map(it => itemIdentifier(it)));
    },
    [selectionMode, itemIdentifier, onChangeSelection, onChangeSelectionIds, initialSelection]
  );

  const toggleSelectAllOnPage = useCallback(() => {
    if (!selectionMode || !onChangeSelection) return;
    
    const currentSelection = Array.isArray(initialSelection) ? [...initialSelection] : [];
    const pageIds = items.map(item => itemIdentifier(item));
    const allOnPageSelected = items.length > 0 && items.every(item => 
      currentSelection.find(selected => itemIdentifier(selected) === itemIdentifier(item))
    );

    let newSelection;
    if (allOnPageSelected) {
      // Remove all page items from selection
      newSelection = currentSelection.filter(selected => 
        !pageIds.includes(itemIdentifier(selected))
      );
    } else {
      // Add all page items to selection (avoid duplicates)
      const itemsToAdd = items.filter(item => 
        !currentSelection.find(selected => itemIdentifier(selected) === itemIdentifier(item))
      );
      newSelection = [...currentSelection, ...itemsToAdd];
    }

    onChangeSelection(newSelection);
    onChangeSelectionIds?.(newSelection.map(item => itemIdentifier(item)));
  }, [selectionMode, items, initialSelection, itemIdentifier, onChangeSelection, onChangeSelectionIds]);

  const { selectedOnPageCount, allOnPageSelected } = useMemo(() => {
    if (!Array.isArray(initialSelection)) {
      return { selectedOnPageCount: 0, allOnPageSelected: false };
    }
    
    const selectedCount = items.reduce((acc, item) => {
      const isItemSelected = initialSelection.find(selected => 
        itemIdentifier(selected) === itemIdentifier(item)
      );
      return acc + (isItemSelected ? 1 : 0);
    }, 0);
    
    return {
      selectedOnPageCount: selectedCount,
      allOnPageSelected: items.length > 0 && selectedCount === items.length,
    };
  }, [items, initialSelection, itemIdentifier]);

  const headerAction = (a) => (
    <Box flexGrow={1}>
      <Box display="flex" justifyContent="flex-end">
        {a?.()}
      </Box>
    </Box>
  );

  const calculateOrdinalNumber = useCallback(
    (iidx, isPaginationEnabled) => {
      if (isPaginationEnabled) {
        const from = Number(ordinalNumberFrom);
        return (isNaN(from) ? 0 : from) + iidx;
      }
      return iidx + 1;
    },
    [ordinalNumberFrom]
  );

  const {
    localHeaders,
    localPreHeaders,
    localItemFormatters,
    localAligns,
    localHeaderSpans,
    localHeaderActions,
    localColSpans,
  } = useMemo(() => {
    const _headers = headers ? [...headers] : [];
    const _preHeaders = preHeaders ? [...preHeaders] : null;
    const _formatters = itemFormatters ? [...itemFormatters] : [];
    const _aligns = aligns ? [...aligns] : [];
    const _hSpans = headerSpans ? [...headerSpans] : [];
    const _hActions = headerActions ? [...headerActions] : [];
    const _cSpans = colSpans ? [...colSpans] : [];

    let i = _headers.length;
    while (i--) {
      if (modulesManager?.hideField(module, _headers[i])) {
        if (_preHeaders) _preHeaders.splice(i, 1);
        if (_aligns && _aligns.length > i) _aligns.splice(i, 1);
        if (_hSpans && _hSpans.length > i) _hSpans.splice(i, 1);
        if (_hActions && _hActions.length > i) _hActions.splice(i, 1);
        if (_cSpans && _cSpans.length > i) _cSpans.splice(i, 1);
        _headers.splice(i, 1);
        _formatters.splice(i, 1);
      }
    }

    if (!!onDelete) {
      if (_preHeaders) _preHeaders.push("");
      _headers.push("");
      _formatters.push((row, idx) => {
        const isEmpty = disableDeleteOnEmptyRow ? _.isEmpty(row) : false;
        return (
          <IconButton disabled={isEmpty} onClick={() => onDelete(idx)}>
            <DeleteIcon />
          </IconButton>
        );
      });
    }

    return {
      localHeaders: _headers,
      localPreHeaders: _preHeaders,
      localItemFormatters: _formatters,
      localAligns: _aligns,
      localHeaderSpans: _hSpans,
      localHeaderActions: _hActions,
      localColSpans: _cSpans,
    };
  }, [
    headers,
    preHeaders,
    itemFormatters,
    aligns,
    headerSpans,
    headerActions,
    colSpans,
    modulesManager,
    module,
    onDelete,
    disableDeleteOnEmptyRow,
  ]);

  const rowsPerPage = pageSize || rowsPerPageOptions[0];

  const finalHeaders = useMemo(() => {
    const arr = [...localHeaders];
    if (showOrdinalNumber) arr.unshift("core.Table.ordinalNumberHeader");
    return arr;
  }, [localHeaders, showOrdinalNumber]);

  // compute footer colSpan more accurately
  const totalColumns = useMemo(() => {
    const base = localItemFormatters.length;
    const checkboxCol = selectWithCheckbox && selectionMode === "multiple" ? 1 : 0;
    const ordinalCol = showOrdinalNumber ? 1 : 0;
    return base + checkboxCol + ordinalCol;
  }, [localItemFormatters.length, selectWithCheckbox, selectionMode, showOrdinalNumber]);


  const user_type = getUserType();

  items.forEach(item => {
    if(item?.trackingNumber && item?.dateUpdated){
      const currentDate= new Date();
      const updatedDate= new Date(item?.dateUpdated);
      const timeDiff= currentDate.getTime() - updatedDate.getTime();
      const dayCount= Math.floor(timeDiff / (1000 * 3600 * 24));
      let duePercentage= dayCount*100/roleMaxDayCount[user_type];
      item.dueDayCount= dayCount;
      if(duePercentage>=0 && duePercentage<=20){
        item.rowColorCode= colorCode[0];
      }
      else if(duePercentage>20 && duePercentage<=40){
        item.rowColorCode= colorCode[20];
      }
      else if(duePercentage>40 && duePercentage<=60){
        item.rowColorCode= colorCode[40];
      }
      else if(duePercentage>60 && duePercentage<=80){
        item.rowColorCode= colorCode[60];
      }
      else if(duePercentage>80 && duePercentage<=100){
        item.rowColorCode= colorCode[80];
      }
      else if(duePercentage>100){
        item.rowColorCode= colorCode[100];
      }
    }
  });

  return (
    <Box position="relative" overflow="auto">
        {coloredRow? (
          <div style={{marginLeft: '10px'}}>
            <ColoredRowLegends/>
          </div>
          ) : null
        }
      {header && (
        <Grid container alignItems="center" justify="space-between" className={classes.tableTitle}>
          {extendHeader ? (
            <>
              <Grid item xs={6}>
                <Typography variant="h6">{header}</Typography>
              </Grid>
              <Grid item container direction="row" alignItems="center" justify="space-between" xs={6}>
                {extendHeader && extendHeader()}
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6">{header}</Typography>
            </Grid>
          )}
        </Grid>
      )}
      <Divider />

      <MUITable className={classes.table} size={size}>
        {!!localPreHeaders && localPreHeaders.length > 0 && (
          <TableHead>
            <TableRow>
              {localPreHeaders.map((h, idx) => {
                if (localHeaderSpans.length > idx && !localHeaderSpans[idx]) return null;
                return (
                  <TableCell
                    key={`preh-${idx}`}
                    colSpan={localHeaderSpans.length > idx ? localHeaderSpans[idx] : 1}
                    className={clsx(classes.tableHeader, localAligns.length > idx && classes[localAligns[idx]])}
                  >
                    {!!h && h}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
        )}

        {!!finalHeaders && finalHeaders.length > 0 && (
          <TableHead style={{ backgroundColor: "#d7eceb" }}>
            <TableRow>
              {selectWithCheckbox && selectionMode === "multiple" && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedOnPageCount > 0 && !allOnPageSelected}
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                  />
                </TableCell>
              )}
              {finalHeaders.map((h, idx) => {
                if (localHeaderSpans.length > idx && !localHeaderSpans[idx]) return null;
                return (
                  <TableCell colSpan={localHeaderSpans.length > idx ? localHeaderSpans[idx] : 1} key={`h-${idx}`}>
                    {!!h && (
                      <Box
                        style={{
                          width: "100%",
                          cursor: localHeaderActions.length > idx && !!localHeaderActions[idx][0] ? "pointer" : "",
                        }}
                        onClick={localHeaderActions.length > idx ? localHeaderActions[idx][0] : null}
                        display="flex"
                        className={classes.tableHeader}
                        alignItems="center"
                        justifyContent={localAligns.length > idx ? localAligns[idx] : "left"}
                      >
                        <Box>
                          {typeof h === "function" ? (
                            <Box>{h({ state: { selection: selectionMap, ordinalNumberFrom }, props: {} })}</Box>
                          ) : (
                            <FormattedMessage module={module} id={h} />
                          )}
                        </Box>
                        {localHeaderActions.length > idx ? headerAction(localHeaderActions[idx][1]) : null}
                      </Box>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
        )}

        <TableBody>
          {items &&
            items.length > 0 &&
            items.map((row, iidx) => (
              <TableRow
                key={iidx}
                selected={isSelected(row, iidx)}
                onClick={() => !selectWithCheckbox && select(row, iidx)}
                onContextMenu={onDoubleClick ? () => onDoubleClick(row, true) : undefined}
                onDoubleClick={onDoubleClick ? () => onDoubleClick(row) : undefined}
                className={clsx(
                  classes.tableRow,
                  !!rowLocked && rowLocked(row) ? classes.tableLockedRow : null,
                  !!rowHighlighted && rowHighlighted(row) ? classes.tableHighlightedRow : null,
                  !!rowHighlightedAlt && rowHighlightedAlt(row) ? classes.tableHighlightedAltRow : null,
                  !!rowSecondaryHighlighted && rowSecondaryHighlighted(row) ? classes.tableSecondaryHighlightedRow : null,
                  !!rowDisabled && rowDisabled(row) ? classes.tableDisabledRow : null,
                  !!onDoubleClick && classes.clickable,
                )}
                style={coloredRow && row?.rowColorCode ? {backgroundColor: row.rowColorCode} : null}
              >
                {selectWithCheckbox && selectionMode === "multiple" && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(row, iidx)}
                      onChange={() => select(row, iidx)}
                      color="primary"
                    />
                  </TableCell>
                )}

                {showOrdinalNumber && (
                  <TableCell
                    className={clsx(
                      !!rowLocked && rowLocked(row) ? classes.tableLockedCell : null,
                      !!rowHighlighted && rowHighlighted(row) ? classes.tableHighlightedCell : null,
                      !!rowHighlightedAlt && rowHighlightedAlt(row) ? classes.tableHighlightedAltCell : null,
                      !!rowSecondaryHighlighted && rowSecondaryHighlighted(row)
                        ? classes.tableSecondaryHighlightedCell
                        : null,
                      !!rowDisabled && rowDisabled(row) ? classes.tableDisabledCell : null,
                      localAligns.length > 0 && classes[localAligns[0]],
                    )}
                    key={`v-${calculateOrdinalNumber(iidx, withPagination)}-0`}
                  >
                    <span>{calculateOrdinalNumber(iidx, withPagination)}</span>
                  </TableCell>
                )}

                {localItemFormatters &&
                  localItemFormatters.map((f, fidx) => {
                    if (localColSpans.length > fidx && !localColSpans[fidx]) return null;
                    if (f === null) return null;
                    return (
                      <TableCell
                        colSpan={localColSpans.length > fidx ? localColSpans[fidx] : 1}
                        className={clsx(
                          !!rowLocked && rowLocked(row) ? classes.tableLockedCell : null,
                          !!rowHighlighted && rowHighlighted(row) ? classes.tableHighlightedCell : null,
                          !!rowHighlightedAlt && rowHighlightedAlt(row) ? classes.tableHighlightedAltCell : null,
                          !!rowSecondaryHighlighted && rowSecondaryHighlighted(row)
                            ? classes.tableSecondaryHighlightedCell
                            : null,
                          !!rowDisabled && rowDisabled(row) ? classes.tableDisabledCell : null,
                          localAligns.length > fidx && classes[localAligns[fidx]],
                        )}
                        key={`v-${iidx}-${fidx}`}
                      >
                        {f(row, iidx)}
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
        </TableBody>

        {!!withPagination && !!count && (
          <TableFooter className={classes.tableFooter}>
            <TableRow>
              <TablePagination
                className={classes.pager}
                colSpan={totalColumns}
                labelRowsPerPage={formatMessage("rowsPerPage")}
                labelDisplayedRows={({ from, to, count }) => {
                  setOrdinalNumberFrom((prev) => (prev !== from ? from : prev));
                  return `${from}-${to} ${formatMessageWithValues("ofPages")} ${count}`;
                }}
                count={count}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
                onRowsPerPageChange={(e) => onChangeRowsPerPage(e.target.value)}
                onPageChange={onChangePage}
                nextIconButtonText={formatMessage("Table.nextPage")}
                backIconButtonText={formatMessage("Table.previousPage")}
              />
            </TableRow>
          </TableFooter>
        )}
      </MUITable>

      {(fetching || error) && (
        <Grid className={classes.loader} container justifyContent="center" alignItems="center">
          <ProgressOrError progress={items?.length && fetching} error={error} />
        </Grid>
      )}
    </Box>
  );
}

export default withModulesManager(withTheme(withStyles(styles)(Table)));

