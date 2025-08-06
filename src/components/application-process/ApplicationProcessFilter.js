/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid, Checkbox, FormControlLabel ,Select,FormControl,InputLabel,MenuItem } from "@material-ui/core";
import {
  withModulesManager,
  Contributions,
  ControlledField,
  TextInput,
  PublishedComponent,
  decodeId,
  formatMessage,
  FormattedMessage
} from "@openimis/fe-core";
import { MODULE_NAME, statusOptions,applicationTypeOptions,submittedByOptions } from "../../constants";
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

const APPLICATION_PROCESS_FILTER_CONTRIBUTION_KEY =
  "application.process.Filter";

class ApplicationProcessFilter extends Component {
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
        id="workforce.employee.application.status"
        field={
          <Grid item xs={3} className={classes.item}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>
                <FormattedMessage
                  id="workforce.employee.application.status"
                  defaultMessage="Status"
                />
              </InputLabel>
              <Select
                label="workforce.employee.application.status"
                value={this._filterValue("status") || ""}
                onChange={(e) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "status",
                      value: e.target.value,
                      filter: `statusIn: ["${e.target.value}"]`,
                    },
                  ])
                }
              >             
                {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        }
      />

      <ControlledField
        module={MODULE_NAME}
        id="workforce.employee.application.applicationType"
        field={
          <Grid item xs={3} className={classes.item}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>
                <FormattedMessage
                  id="workforce.employee.application.applicationType"
                  defaultMessage="Application Type"
                />
              </InputLabel>
              <Select
                label="workforce.employee.application.applicationType"
                value={this._filterValue("applicationType") || ""}
                onChange={(e) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "applicationType",
                      value: e.target.value,
                      filter: `applicationTypeIn: ["${e.target.value}"]`,
                    },
                  ])
                }
              >
                {applicationTypeOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        }
      />

     <ControlledField mt={3}
          module={MODULE_NAME}
          id="workforce.application.submittedBy"
          field={
            <Grid item xs={3} className={classes.item}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel><FormattedMessage id="workforce.application.submittedBy" defaultMessage="Submitted By" /></InputLabel>
                <Select
                  label="workforce.application.submittedBy"
                  value={this._filterValue("submittedBy") || ""}
                  onChange={(e) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: "submittedBy",
                        value: e.target.value,
                        filter: `submittedBy: "${e.target.value}"`,
                      },
                    ])
                  }
                >
                  {submittedByOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          }
        />
        <Contributions
          filters={filters}
          onChangeFilters={onChangeFilters}
          contributionKey={APPLICATION_PROCESS_FILTER_CONTRIBUTION_KEY}
        />
      </Grid>
    );
  }
}

export default withModulesManager(
  withTheme(withStyles(styles)(ApplicationProcessFilter)),
);
