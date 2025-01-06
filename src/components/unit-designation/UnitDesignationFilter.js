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

const WORKFORCE_ORGANIZATION_FILTER_CONTRIBUTION_KEY =
  "workforce.organization.Filter";

class UnitDesignationFilter extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    800,
  );

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
          id="workforce.organization.name.en"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.organization.name.en"
                name="nameEn"
                value={this._filterValue("nameEn")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'nameEn',
                    value: v,
                    filter: `nameEn_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.organization.name.bn"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.organization.name.bn"
                name="nameBn"
                value={this._filterValue("nameBn")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'nameBn',
                    value: v,
                    filter: `nameBn_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.organization.address"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.organization.address"
                name="address"
                value={this._filterValue("address")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'address',
                    value: v,
                    filter: `address_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.organization.phone"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.organization.phone"
                name="phoneNumber"
                value={this._filterValue("phoneNumber")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'phoneNumber',
                    value: v,
                    filter: `phoneNumber_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.representative.name.en"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.representative.name.en"
                name="workforceRepresentative__nameEn"
                value={this._filterValue("workforceRepresentative__nameEn")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'workforceRepresentative__nameEn',
                    value: v,
                    filter: `workforceRepresentative__nameEn_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.representative.name.bn"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.representative.name.bn"
                name="workforceRepresentative__nameBn"
                value={this._filterValue("workforceRepresentative__nameBn")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'workforceRepresentative__nameBn',
                    value: v,
                    filter: `workforceRepresentative__nameBn_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.representative.address"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.representative.address"
                name="workforceRepresentative__address"
                value={this._filterValue("workforceRepresentative__address")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'workforceRepresentative__address',
                    value: v,
                    filter: `workforceRepresentative__address_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.representative.phone"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.representative.phone"
                name="workforceRepresentative__phone"
                value={this._filterValue("workforceRepresentative__phone")}
                onChange={(v) => this.debouncedOnChangeFilter([
                  {
                    id: 'workforceRepresentative__phone',
                    value: v,
                    filter: `workforceRepresentative__phone_Icontains: "${v}"`,
                  },
                ])}
              />
            </Grid>
          }
        />
        {/* <Grid>
          <ControlledField
            module={MODULE_NAME}
            id="TicketFilter.showHistory"
            field={
              <Grid item xs={2} className={classes.item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={!!this._filterValue("showHistory")}
                      onChange={(event) =>
                        this._onChangeCheckbox(
                          "showHistory",
                          event.target.checked
                        )
                      }
                    />
                  }
                  label={formatMessage(
                    this.props.intl,
                    MODULE_NAME,
                    "showHistory"
                  )}
                />
              </Grid>
            }
          />
        </Grid> */}

        <Contributions
          filters={filters}
          onChangeFilters={onChangeFilters}
          contributionKey={WORKFORCE_ORGANIZATION_FILTER_CONTRIBUTION_KEY}
        />
      </Grid>
    );
  }
}

export default withModulesManager(
  withTheme(withStyles(styles)(UnitDesignationFilter)),
);
