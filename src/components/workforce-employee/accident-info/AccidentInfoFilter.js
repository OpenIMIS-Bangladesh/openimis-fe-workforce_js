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
import EmployeeInjuryTypePicker from "../../../pickers/EmployeeInjuryTypePicker";
import EmployeeAccidentTypePicker from "../../../pickers/EmployeeAccidentTypePicker";
import EmployeeInsideOutsideFactoryPicker from "../../../pickers/EmployeeInsideOutsideFactoryPicker";

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
              <EmployeeInjuryTypePicker
                    value={this._filterValue("injuryType")}
                    label={
                      <FormattedMessage
                        id="workforce.employee.accident.info.injuryType"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.debouncedOnChangeFilter([
                      {
                        id: 'injuryType',
                        value: v,
                        filter: `injuryType: "${v}"`,
                      },
                    ])}
                    readOnly={false}
                  />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.accident.info.typeOfAccident"
          field={
            <Grid item xs={3} className={classes.item}>
              <EmployeeAccidentTypePicker
                    value={this._filterValue("accidentType")}
                    label={
                      <FormattedMessage
                        id="workforce.employee.accident.info.typeOfAccident"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.debouncedOnChangeFilter([
                      {
                        id: 'accidentType',
                        value: v,
                        filter: `accidentType: "${v}"`,
                      },
                    ])}
                    readOnly={false}
                  />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.accident.info.insideOutsideFactory"
          field={
            <Grid item xs={3} className={classes.item}>
              <EmployeeInsideOutsideFactoryPicker
                    value={this._filterValue("inOutsideFactory")}
                    label={
                      <FormattedMessage
                        id="workforce.employee.accident.info.insideOutsideFactory"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.debouncedOnChangeFilter([
                      {
                        id: 'inOutsideFactory',
                        value: v,
                        filter: `inOutsideFactory: "${v}"`,
                      },
                    ])}
                    readOnly={false}
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
