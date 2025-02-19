import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import OrganizationEmployeeForm from "../../components/organization-employee/OrganizationEmployeeForm";
import { createOrganizationEmployee, updateOrganizationEmployee } from "../../actions";
import { RIGHT_ORGANIZATION_CREATE, RIGHT_ORGANIZATION_EDIT } from "../../permission-rights";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class OrganizationEmployeePage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "grievance.route.ticket");
  };

  save = (employee) => {
    if (!employee.id) {
      this.props.createOrganizationEmployee(
        this.props.modulesManager,
        employee,
        "Create",
      );
    } else {
      this.props.updateOrganizationEmployee(
        this.props.modulesManager,
        employee,
        "Update",
      );
    }
  };

  render() {
    const {
      classes, modulesManager, history, rights, organizationEmployeeUuid, overview, organizationVersion,
    } = this.props;
    // const readOnly = organization?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <OrganizationEmployeeForm
          overview={overview}
          organizationEmployeeUuid={organizationEmployeeUuid}
          organizationVersion={organizationVersion}
          readOnly={readOnly}
          back={() => historyPush(modulesManager, history, "workforce.route.organizations.employees")}
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  organizationEmployeeUuid: props.match.params.organization_employee_uuid,
  organizationVersion: props.match.params.version,
  employee: state.workforce.employee,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  createOrganizationEmployee,
  updateOrganizationEmployee,
}, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  withTheme(withStyles(styles)(OrganizationEmployeePage))),
));
