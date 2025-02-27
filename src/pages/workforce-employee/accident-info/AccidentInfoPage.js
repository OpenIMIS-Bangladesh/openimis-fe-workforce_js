import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import AccidentInfoForm from "../../../components/workforce-employee/accident-info/AccidentInfoForm";
import { RIGHT_ORGANIZATION_CREATE, RIGHT_ORGANIZATION_EDIT } from "../../../permission-rights";
import { createAccidentInfo, updateAccidentInfo } from "../../../actions";

const styles = (theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
});

class AccidentInfoPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "grievance.route.ticket");
  };

  save = (accidentinfo) => {
    if (!accidentinfo.id) {
      this.props.createAccidentInfo(
        this.props.modulesManager,
        accidentinfo,
        "Create",
      );
    } else {
      this.props.updateAccidentInfo(
        this.props.modulesManager,
        accidentinfo,
        "Update",
      );
    }
  };

  render() {
    const {
      classes, modulesManager, history, rights, workforceEmployeeUuid, overview, organizationVersion,
    } = this.props;
    const readOnly = false;
    return (
      <div className={`${readOnly ? classes.lockedPage : null} ${classes.page}`}>
        <AccidentInfoForm
          overview={overview}
          workforceEmployeeUuid={workforceEmployeeUuid}
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
  workforceEmployeeUuid: props.match.params.workforce_employee_uuid,
  organizationVersion: props.match.params.version,
  accidentinfo: state.workforce.accidentinfo,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  createAccidentInfo,
  updateAccidentInfo,
}, dispatch);

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  withTheme(withStyles(styles)(AccidentInfoPage))),
));
