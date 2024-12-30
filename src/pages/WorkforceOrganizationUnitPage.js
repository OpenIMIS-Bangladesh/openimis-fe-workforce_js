import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  formatMessageWithValues, withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import OrganizationForm from "../components/OrganizationForm";
import { updateOrganization, createOrganization } from "../actions";
import { RIGHT_ORGANIZATION_CREATE, RIGHT_ORGANIZATION_EDIT } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class WorkforceOrganizationPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "grievance.route.ticket");
  };

  save = (ticket) => {
    if (!ticket.id) {
      this.props.createOrganization(
        this.props.modulesManager,
        ticket,
        // formatMessageWithValues(
        //   this.props.intl,
        //   "ticket",
        //   "createTicket.mutationLabel",
        //   { label: ticket.code ? ticket.code : "" },
        // ),
        "Create",
      );
    } else {
      this.props.updateOrganization(
        this.props.modulesManager,
        ticket,
        // formatMessageWithValues(
        //   this.props.intl,
        //   "ticket",
        //   "updateTicket.mutationLabel",
        //   { label: ticket.code ? ticket.code : "" },
        // ),
        "Update",
      );
    }
  };

  render() {
    const {
      classes, modulesManager, history, rights, organizationUuid, overview, organization, ticketVersion,
    } = this.props;
    // const readOnly = ticket?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <OrganizationForm
          overview={overview}
          organizationUuid={organizationUuid}
          ticketVersion={ticketVersion}
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
  ticketVersion: props.match.params.version,
  organization: state.workforce.organization,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createOrganization, updateOrganization }, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  withTheme(withStyles(styles)(WorkforceOrganizationPage))),
));
