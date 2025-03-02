/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid, Checkbox, FormControlLabel } from "@material-ui/core";
import {
  withModulesManager,
  Contributions,
  ControlledField,
  TextInput,
  PublishedComponent,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { MODULE_NAME } from "../../../constants";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

const WORKFORCE_EMPLOYEE_AACIDENT_INFO_FILTER_CONTRIBUTION_KEY =
  "workforce.employee.accident.info.Filter";

class AccidentInfoFilter extends Component {
  debouncedOnChangeFilter = _debounce(this.props.onChangeFilters, 800);

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _onChangeReporter = (k, v) => {
    this.props.onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}: "${decodeId(v?.id)}"`,
      },
    ]);
  };

  _onChangeCheckbox = (key, value) => {
    const filters = [
      {
        id: key,
        value,
        filter: `${key}: ${value}`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.props.setShowHistoryFilter(value);
  };

  render() {
    const { classes, filters, onChangeFilters } = this.props;
    return (
      <Grid container className={classes.form}>
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.accident.info.injuryType"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.accident.info.injuryType"
                name="nameEn"
                value={this._filterValue("nameEn")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "nameEn",
                      value: v,
                      filter: `nameEn_Icontains: "${v}"`,
                    },
                  ])
                }
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.accident.info.typeOfAccient"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.accident.info.typeOfAccient"
                name="nameEn"
                value={this._filterValue("nameEn")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "nameEn",
                      value: v,
                      filter: `nameEn_Icontains: "${v}"`,
                    },
                  ])
                }
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.accident.info.insideOutsideFactory"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.accident.info.insideOutsideFactory"
                name="nameEn"
                value={this._filterValue("nameEn")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "nameEn",
                      value: v,
                      filter: `nameEn_Icontains: "${v}"`,
                    },
                  ])
                }
              />
            </Grid>
          }
        />

        <Contributions
          filters={filters}
          onChangeFilters={onChangeFilters}
          contributionKey={
          WORKFORCE_EMPLOYEE_AACIDENT_INFO_FILTER_CONTRIBUTION_KEY
          }
        />
      </Grid>
    );
  }
}

export default withModulesManager(
  withTheme(withStyles(styles)(AccidentInfoFilter))
);
