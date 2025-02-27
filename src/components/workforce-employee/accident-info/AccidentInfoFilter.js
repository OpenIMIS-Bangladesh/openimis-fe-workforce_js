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
import EmployeeLifeStatusPicker from "../../../pickers/EmployeeLifeStatusPicker";
import RelationPicker from "../../../pickers/RelationPicker";
// import { FormattedMessage } from "../../../../../openimis-fe-core_js/src";

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

const WORKFORCE_ORGANIZATION_EMPLOYEE_FILTER_CONTRIBUTION_KEY =
  "workforce.organization.employee.Filter";

class DependentFilter extends Component {
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
          id="workforce.organization.name.employee.en"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.organization.employee.name.en"
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
          id="workforce.organization.employee.name.bn"
          field={
            <Grid item xs={3} className={classes.item}>
              {/* <TextInput
                module={MODULE_NAME}
                label="workforce.organization.employee.name.bn"
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
              /> */}
               <RelationPicker
                module={MODULE_NAME}
                value={this._filterValue("relation")}
                label={
                  <FormattedMessage
                    id="workforce.employee.relation.picker"
                    module="workforce"
                  />
                }
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "relation",
                      value: v,
                      filter: `relation_Icontains: "${v}"`,
                    },
                  ])
                }
                // onChange={(v) => this.updateAttribute("lifeStatus", v)}
                // readOnly={isSaved}
              />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.organization.employee.phone"
          field={
            <Grid item xs={3} className={classes.item}>
              {/* <TextInput
                module={MODULE_NAME}
                label="workforce.organization.employee.phone"
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
              /> */}
              <EmployeeLifeStatusPicker
                module={MODULE_NAME}
                value={this._filterValue("lifeStatus")}
                label={
                  <FormattedMessage
                    id="workforce.employee.lifeStatus"
                    module="workforce"
                  />
                }
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "lifeStatus",
                      value: v,
                      filter: `lifeStatus_Icontains: "${v}"`,
                    },
                  ])
                }
                // onChange={(v) => this.updateAttribute("lifeStatus", v)}
                // readOnly={isSaved}
              />
            </Grid>
          }
        />

        <Contributions
          filters={filters}
          onChangeFilters={onChangeFilters}
          contributionKey={
            WORKFORCE_ORGANIZATION_EMPLOYEE_FILTER_CONTRIBUTION_KEY
          }
        />
      </Grid>
    );
  }
}

export default withModulesManager(
  withTheme(withStyles(styles)(DependentFilter))
);
