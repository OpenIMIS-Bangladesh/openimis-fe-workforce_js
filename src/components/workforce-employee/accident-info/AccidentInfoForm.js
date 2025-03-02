import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, formatMessageWithValues, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchAccidentInfo,
} from "../../../actions";
import { MODULE_NAME } from "../../../constants";
import EditAccidentInfoPage from "../../../pages/workforce-employee/accident-info/EditAccidentInfoPage";
import AddAccidentInfoPage from "../../../pages/workforce-employee/accident-info/AddAccidentInfoPage";

class AccidentInfoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      workforceEmployeeUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.workforceEmployeeUuid) {
      this.setState((state, props) => ({ workforceEmployeeUuid: props.workforceEmployeeUuid }));
    }
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedEmployeeAccident !== this.props.fetchedEmployeeAccident
      && !!this.props.fetchedEmployeeAccident
      && !!this.props.organizationEmployee) {
      this.setState((state, props) => ({
        organizationEmployee: { ...props.organizationEmployee },
        workforceEmployeeUuid: props.organizationEmployee.id,
        lockNew: false,
      }));
    } else if (prevState.workforceEmployeeUuid !== this.state.workforceEmployeeUuid) {
      const filters = [`id: "${this.state.workforceEmployeeUuid}"`];
      this.props.fetchAccidentInfo(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.organizationEmployee?.id) {
        this.props.fetchAccidentInfo(
          this.props.modulesManager,
          [`id: "${this.state.workforceEmployeeUuid}"`],
        );
      }
    }
  }

  _newTicket() {
    return {};
  }

  reload = () => {

  };

  canSave = () => {

  };

  _save = (ticket) => {
    this.setState(
      { lockNew: !ticket.uuid },
      () => this.props.save(ticket),
    );
  };

  onEditedChanged = (ticket) => {
    this.setState({ ticket });
  };

  reopenTicket = () => {
    const { intl, ticket } = this.props;
    this.props.reopenTicket(
      ticket.id,
      formatMessage(intl, MODULE_NAME, "reopenTicket.mutation.label"),
    );
  };

  render() {
    const {
      fetchingTicket,
      fetchedEmployeeAccident,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      workforceEmployeeUuid,
      ticket,
    } = this.state;

    const readOnly = lockNew || !!ticket.validityTo || this.props.readOnly;
    const actions = [
      {
        doIt: this.reopenTicket,
        icon: <LockOpenIcon />,
        disabled: ticket.isHistory,
      },
    ];

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedEmployeeAccident || !workforceEmployeeUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={workforceEmployeeUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Accident Info"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(workforceEmployeeUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={workforceEmployeeUuid ? [EditAccidentInfoPage] : [AddAccidentInfoPage]}
            onEditedChanged={this.onEditedChanged}
          />
        )}
      </>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingTicket: state.workforce.fetchingTicket,
  errorTicket: state.workforce.errorTicket,
  fetchedEmployeeAccident: state.workforce.fetchedEmployeeAccident,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchAccidentInfo,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  AccidentInfoForm,
));
