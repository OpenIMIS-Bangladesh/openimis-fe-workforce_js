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
  formatMessage,
} from "@openimis/fe-core";
import { MODULE_NAME } from "../../constants";

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

const WORKFORCE_EMPLOYEE_FILTER_CONTRIBUTION_KEY = "workforce.employee.Filter";

class WorkforceEmployeeFilter extends Component {
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
          id="workforce.employee.name.en"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.name.en"
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
          id="workforce.employee.name.bn"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.name.bn"
                name="nameBn"
                value={this._filterValue("nameBn")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "nameBn",
                      value: v,
                      filter: `nameBn_Icontains: "${v}"`,
                    },
                  ])
                }
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.phone"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.phone"
                name="address"
                value={this._filterValue("phoneNumber")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "phoneNumber",
                      value: v,
                      filter: `phoneNumber_Icontains: "${v}"`,
                    },
                  ])
                }
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.status"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.status"
                name="status"
                value={this._filterValue("status")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "status",
                      value: v,
                      filter: `status: "${v}"`,
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
          contributionKey={WORKFORCE_EMPLOYEE_FILTER_CONTRIBUTION_KEY}
        />
      </Grid>
    );
  }
}

export default withModulesManager(
  withTheme(withStyles(styles)(WorkforceEmployeeFilter))
);
