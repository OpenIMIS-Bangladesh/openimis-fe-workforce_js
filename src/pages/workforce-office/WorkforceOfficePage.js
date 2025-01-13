import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import WorkforceOfficeForm from "../../components/workforce-office/WorkforceOfficeForm";
import { createWorkforceOffice, updateWorkforceOffice } from "../../actions";
import { RIGHT_ORGANIZATION_CREATE, RIGHT_ORGANIZATION_EDIT } from "../../constants";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class WorkforceOfficePage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "grievance.route.ticket");
  };

  save = (office) => {
    if (!office.id) {
      this.props.createWorkforceOffice(
        this.props.modulesManager,
        office,
        "Create",
      );
    } else {
      this.props.updateWorkforceOffice(
        this.props.modulesManager,
        office,
        "Update",
      );
    }
  };

  render() {
    const {
      classes, modulesManager, history, rights, workforceOfficeUuid, overview, organizationVersion,
    } = this.props;
    // const readOnly = organization?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <WorkforceOfficeForm
          overview={overview}
          workforceOfficeUuid={workforceOfficeUuid}
          organizationVersion={organizationVersion}
          readOnly={readOnly}
          back={() => historyPush(modulesManager, history, "workforce.route.offices")}
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  workforceOfficeUuid: props.match.params.workforce_office_uuid,
  organizationVersion: props.match.params.version,
  office: state.workforce.office,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  createWorkforceOffice,
  updateWorkforceOffice,
}, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  withTheme(withStyles(styles)(WorkforceOfficePage))),
));
