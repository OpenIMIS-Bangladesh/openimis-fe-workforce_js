import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import WorkforceFactoryForm from "../../components/workforce-factory/WorkforceFactoryForm";
import { createWorkforceEmployee, updateWorkforceEmployee } from "../../actions";
import { RIGHT_ORGANIZATION_CREATE, RIGHT_ORGANIZATION_EDIT } from "../../permission-rights";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class WorkforceFactoryPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "grievance.route.ticket");
  };

  save = (workforceFactory) => {
    if (!workforceFactory.id) {
      this.props.createWorkforceEmployee(
        this.props.modulesManager,
        workforceFactory,
        "Create",
      );
    } else {
      this.props.updateWorkforceEmployee(
        this.props.modulesManager,
        workforceFactory,
        "Update",
      );
    }
  };

  render() {
    const {
      classes, modulesManager, history, rights, workforceFactoryUuid, overview, organizationVersion,
    } = this.props;
    // const readOnly = organization?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <WorkforceFactoryForm
          overview={overview}
          workforceFactoryUuid={workforceFactoryUuid}
          organizationVersion={organizationVersion}
          readOnly={readOnly}
          back={() => historyPush(modulesManager, history, "workforce.route.factories")}
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  workforceFactoryUuid: props.match.params.workforce_factory_uuid,
  organizationVersion: props.match.params.version,
  workforceFactory: state.workforce.workforceFactory,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  createWorkforceEmployee,
  updateWorkforceEmployee,
}, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  withTheme(withStyles(styles)(WorkforceFactoryPage))),
));
