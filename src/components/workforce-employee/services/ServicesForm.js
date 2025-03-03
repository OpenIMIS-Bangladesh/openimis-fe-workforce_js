import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchService
} from "../../../actions";
import { MODULE_NAME } from "../../../constants";
import EditServicesPage from "../../../pages/workforce-employee/services/EditServicesPage";
import AddServicesPage from "../../../pages/workforce-employee/services/AddServicesPage";

class ServicesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      serviceUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.serviceUuid) {
      this.setState((state, props) => ({ serviceUuid: props.serviceUuid }));
    }
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedEmployeeService !== this.props.fetchedEmployeeService
      && !!this.props.fetchedEmployeeService
      && !!this.props.employeeService) {
      this.setState((state, props) => ({
        employeeService: { ...props.employeeService },
        serviceUuid: props.employeeService.id,
        lockNew: false,
      }));
    } else if (prevState.serviceUuid !== this.state.serviceUuid) {
      const filters = [`id: "${this.state.serviceUuid}"`];
      this.props.fetchService(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.employeeService?.id) {
        this.props.fetchService(
          this.props.modulesManager,
          [`id: "${this.state.serviceUuid}"`],
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
      fetchedEmployeeService,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      serviceUuid,
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
        {(!!fetchedEmployeeService || !serviceUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={serviceUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Employee Service"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(serviceUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={serviceUuid ? [EditServicesPage] : [AddServicesPage]}
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
  fetchedEmployeeService: state.workforce.fetchedEmployeeService,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchService,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  ServicesForm,
));
