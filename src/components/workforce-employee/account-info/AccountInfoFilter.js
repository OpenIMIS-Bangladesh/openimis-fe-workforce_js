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
import BanksPicker from "../../../pickers/BanksPicker";

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

const WORKFORCE_EMPLOYEE_ACCOUNT_INFO_FILTER_CONTRIBUTION_KEY =
  "workforce.employee.account.info.Filter";

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
          id="workforce.employee.account.info.bankName"
          field={
            <Grid item xs={3} className={classes.item}>
              <BanksPicker
                    value={this._filterValue("bank")}
                    label={
                      <FormattedMessage
                        id="workforce.employee.account.info.bankName"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.debouncedOnChangeFilter([
                      {
                        id: 'bank',
                        value: v,
                        filter: `bank: "${v}"`,
                      },
                    ])}
                    readOnly={false}
                  />
            </Grid>
          }
        />
        <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.account.info.branchName"
          field={
            <Grid item xs={3} className={classes.item}>
               <BanksPicker
                    value={this._filterValue("bank")}
                    label={
                      <FormattedMessage
                        id="workforce.employee.account.info.branchName"
                        module="workforce"
                      />
                    }
                    onChange={(v) => this.debouncedOnChangeFilter([
                      {
                        id: 'bank',
                        value: v,
                        filter: `bank: "${v}"`,
                      },
                    ])}
                    readOnly={false}
                  />
            </Grid>
          }
        />
         <ControlledField
          module={MODULE_NAME}
          id="workforce.employee.account.info.accountHolderName"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module={MODULE_NAME}
                label="workforce.employee.account.info.accountHolderName"
                name="firstNameBn"
                value={this._filterValue("firstNameBn")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "firstNameBn",
                      value: v,
                      filter: `firstNameBn_Icontains: "${v}"`,
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
          WORKFORCE_EMPLOYEE_ACCOUNT_INFO_FILTER_CONTRIBUTION_KEY
          }
        />
      </Grid>
    );
  }
}

export default withModulesManager(
  withTheme(withStyles(styles)(AccidentInfoFilter))
);
