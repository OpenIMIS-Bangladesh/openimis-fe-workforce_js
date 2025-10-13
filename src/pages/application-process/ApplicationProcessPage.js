import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager,
  withHistory,
  historyPush,
} from "@openimis/fe-core";
import WorkforceCompanyForm from "../../components/workforce-company/WorkforceCompanyForm";
import { createApplication, updateApplication } from "../../actions";
import {
  RIGHT_ORGANIZATION_CREATE,
  RIGHT_ORGANIZATION_EDIT,
} from "../../permission-rights";
import ApplicationProcessForm from "../../components/application-process/ApplicationProcessForm";
import { getUserTypeFromRights } from "../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../constants";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class ApplicationProcessPage extends Component {
  add = () => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "grievance.route.ticket"
    );
  };

  save = (application) => {
    if (!application.id) {
      this.props.createWorkforceCompany(
        this.props.modulesManager,
        application,
        "Create"
      );
    } else {
      this.props.updateWorkforceCompany(
        this.props.modulesManager,
        application,
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
      applicationUuid,
      overview,
      organizationVersion,
      user_rights 
    } = this.props;
    const readOnly = false;
    const path = this.props.history.location.pathname;
    const isVerify =  path.includes("verify");
    const isApprove =  path.includes("approve");
    const isActions =  path.includes("actions");
    const user_type = getUserTypeFromRights(user_rights);

    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <ApplicationProcessForm
          overview={overview}
          applicationUuid={applicationUuid}
          organizationVersion={organizationVersion}
          readOnly={readOnly}
          back={() =>
           user_type === WORKFORCE_USER_TYPE.ADMIN ? historyPush(modulesManager, history,"workforce.route.applications.process") :
           historyPush(modulesManager, history,"route.home")
          }
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
          isVerify={isVerify}
          isActions={isActions}
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
  applicationUuid: props.match.params.application_uuid,
  organizationVersion: props.match.params.version,
  user_rights: state.core?.user?.i_user?.rights || {},
  application: state.workforce.application,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createApplication,
      updateApplication,
    },
    dispatch
  );

export default withHistory(
  withModulesManager(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withTheme(withStyles(styles)(ApplicationProcessPage)))
  )
);
