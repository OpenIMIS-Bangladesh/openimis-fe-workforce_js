/* eslint-disable react/destructuring-assignment */
import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {
  historyPush, withModulesManager, withHistory, withTooltip, formatMessage, decodeId,
} from "@openimis/fe-core";
import OrganizationSearcher from "../components/OrganizationSearcher";

import { MODULE_NAME } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

const WorkforceOrganizationsPage = () => {
  return (
    <div>
      Workforce
    </div>
  );
};

export default WorkforceOrganizationsPage;