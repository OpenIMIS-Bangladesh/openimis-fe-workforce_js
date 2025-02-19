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
import { createWorkforceCompany, updateWorkforceCompany } from "../../actions";
import {
  RIGHT_ORGANIZATION_CREATE,
  RIGHT_ORGANIZATION_EDIT,
} from "../../permission-rights";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class WorkforceCompanyPage extends Component {
  add = () => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "grievance.route.ticket"
    );
  };

  save = (company) => {
    if (!company.id) {
      this.props.createWorkforceCompany(
        this.props.modulesManager,
        company,
        "Create"
      );
    } else {
      this.props.updateWorkforceCompany(
        this.props.modulesManager,
        company,
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
      workforceCompanyUuid,
      overview,
      organizationVersion,
    } = this.props;
    // const readOnly = organization?.status === TICKET_STATUSES.CLOSED || ticket?.isHistory;
    const readOnly = false;
    const path = this.props.history.location.pathname;
    const isEdit =  path.includes("edit");
    const isApprove =  path.includes("approve");

    // if (!(rights.includes(RIGHT_ORGANIZATION_CREATE) || rights.includes(RIGHT_ORGANIZATION_EDIT))) return null;
    return (
      <div
        className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}
      >
        <WorkforceCompanyForm
          overview={overview}
          workforceCompanyUuid={workforceCompanyUuid}
          organizationVersion={organizationVersion}
          readOnly={readOnly}
          back={() =>
            historyPush(modulesManager, history,isApprove?"workforce.route.approve.companies": "workforce.route.companies")
          }
          add={rights.includes(RIGHT_ORGANIZATION_CREATE) ? this.add : null}
          save={rights.includes(RIGHT_ORGANIZATION_EDIT) ? this.save : null}
          isEdit={isEdit}
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
  workforceCompanyUuid: props.match.params.workforce_company_uuid,
  organizationVersion: props.match.params.version,
  company: state.workforce.company,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createWorkforceCompany,
      updateWorkforceCompany,
    },
    dispatch
  );

export default withHistory(
  withModulesManager(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(withTheme(withStyles(styles)(WorkforceCompanyPage)))
  )
);
