import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  formatMessageWithValues, withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import OrganizationForm from "../components/OrganizationForm";
import { updateOrganization, createWorkforceOrganization } from "../actions";
import { RIGHT_ORGANIZATION_CREATE, RIGHT_ORGANIZATION_EDIT } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class WorkforceOrganizationPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "grievance.route.ticket");
  };

  save = (organization) => {
    if (!organization.id) {
      this.props.createWorkforceOrganization(
        this.props.modulesManager,
        organization,
        // formatMessageWithValues(
        //   this.props.intl,
        //   "organization",
        //   "createorganization.mutationLabel",
        //   { label: organization.code ? organization.code : "" },
        // ),
        "Create",
      );
    } else {
      this.props.updateOrganization(
        this.props.modulesManager,
        organization,
        // formatMessageWithValues(
        //   this.props.intl,
        //   "organization",
        //   "updateorganization.mutationLabel",
        //   { label: organization.code ? organization.code : "" },
        // ),
        "Update",
      );
    }
  };

  render() {
    const {
      classes, modulesManager, history, rights, organizationUuid, overview, organization, organizationVersion,
    } = this.props;
    // const readOnly = organization?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <OrganizationForm
          overview={overview}
          organizationUuid={organizationUuid}
          organizationVersion={organizationVersion}
          readOnly={readOnly}
          back={() => historyPush(modulesManager, history, "grievanceSocialProtection.route.tickets")}
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  organizationUuid: props.match.params.organization_uuid,
  organizationVersion: props.match.params.version,
  organization: state.workforce.organization,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createWorkforceOrganization, updateOrganization }, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  withTheme(withStyles(styles)(WorkforceOrganizationPage))),
));
