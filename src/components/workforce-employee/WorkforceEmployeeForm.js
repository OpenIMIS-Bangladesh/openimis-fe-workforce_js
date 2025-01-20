import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, formatMessageWithValues, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchWorkforceOffice,
} from "../../actions";
import EditWorkforceEmployeePage from "../../pages/workforce-employee/EditWorkforceEmployeePage";
import AddWorkforceEmployeePage from "../../pages/workforce-employee/AddWorkforceEmployeePage";
import { MODULE_NAME } from "../../constants";

class WorkforceEmployeeForm extends Component {
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
    if (prevProps.fetchedWorkforceOffice !== this.props.fetchedWorkforceOffice
      && !!this.props.fetchedWorkforceOffice
      && !!this.props.workforceOffice) {
      this.setState((state, props) => ({
        workforceOffice: { ...props.workforceOffice },
        workforceEmployeeUuid: props.workforceOffice.id,
        lockNew: false,
      }));
    } else if (prevState.workforceEmployeeUuid !== this.state.workforceEmployeeUuid) {
      const filters = [`id: "${this.state.workforceEmployeeUuid}"`];
      this.props.fetchWorkforceOffice(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.workforceOffice?.id) {
        this.props.fetchWorkforceOffice(
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
      fetchedWorkforceOffice,
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

    console.log({ workforceEmployeeUuid });

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedWorkforceOffice || !workforceEmployeeUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={workforceEmployeeUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Workforce Employee"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(workforceEmployeeUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={workforceEmployeeUuid ? [EditWorkforceEmployeePage] : [AddWorkforceEmployeePage]}
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
  fetchedWorkforceOffice: state.workforce.fetchedWorkforceOffice,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkforceOffice,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  WorkforceEmployeeForm,
));
