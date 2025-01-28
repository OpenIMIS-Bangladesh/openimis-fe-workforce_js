import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import OrganizationUnitForm from "../../components/organization-unit/OrganizationUnitForm";
import { RIGHT_ORGANIZATION_CREATE, RIGHT_ORGANIZATION_EDIT } from "../../constants";
import { createWorkforceOrganizationUnit, updateWorkforceOrganizationUnit } from "../../actions";


const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class WorkforceOrganizationUnitPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "grievance.route.ticket");
  };

  save = (ticket) => {
    if (!ticket.id) {
      this.props.createWorkforceOrganizationUnit(
        this.props.modulesManager,
        ticket,
        "Create",
      );
    } else {
      this.props.updateWorkforceOrganizationUnit(
        this.props.modulesManager,
        ticket,
        "Update",
      );
    }
  };

  render() {
    const {
      classes, modulesManager, history, rights, organizationUnitUuid, overview, organization, ticketVersion,
    } = this.props;
    // const readOnly = ticket?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <OrganizationUnitForm
          overview={overview}
          organizationUnitUuid={organizationUnitUuid}
          ticketVersion={ticketVersion}
          readOnly={readOnly}
          back={() => historyPush(modulesManager, history, "workforce.route.organizations.units")}
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  organizationUnitUuid: props.match.params.organization_unit_uuid,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  createWorkforceOrganizationUnit,
  updateWorkforceOrganizationUnit,
}, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  withTheme(withStyles(styles)(WorkforceOrganizationUnitPage))),
));
