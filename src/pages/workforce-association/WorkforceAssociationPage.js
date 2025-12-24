import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager,
  withHistory,
  historyPush,
} from "@openimis/fe-core";
import {
  createWorkforceEmployee,
  updateWorkforceEmployee,
} from "../../actions";
import {
  RIGHT_ORGANIZATION_CREATE,
  RIGHT_ORGANIZATION_EDIT,
} from "../../permission-rights";
import { getUserTypeFromRights } from "../../utils/utils";
import WorkforceAssociationForm from "../../components/workforce-association/WorkforceAssociationForm";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class WorkforceAsociationPage extends Component {
  add = () => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "grievance.route.ticket"
    );
  };

  save = (employee) => {
    if (!employee.id) {
      this.props.createWorkforceEmployee(
        this.props.modulesManager,
        employee,
        "Create"
      );
    } else {
      this.props.updateWorkforceEmployee(
        this.props.modulesManager,
        employee,
        "Update"
      );
    }
  };

  render() {
    const {
      classes,
      modulesManager,
      history,
      rights,
      workforceAssociationUuid,
      overview,
      organizationVersion,
    } = this.props;
    // const readOnly = organization?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div
        className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}
      >
        <WorkforceAssociationForm
          overview={overview}
          workforceAssociationUuid={workforceAssociationUuid}
          organizationVersion={organizationVersion}
          readOnly={readOnly}
          back={() =>
            historyPush(modulesManager, history, "workforce.route.associations")
          }
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  workforceAssociationUuid: props.match.params.workforce_association_uuid,
  organizationVersion: props.match.params.version,
  employee: state.workforce.employee,
  userType: getUserTypeFromRights(state.core.user.i_user.rights),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createWorkforceEmployee,
      updateWorkforceEmployee,
    },
    dispatch
  );

export default withHistory(
  withModulesManager(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withTheme(withStyles(styles)(WorkforceAsociationPage)))
  )
);
