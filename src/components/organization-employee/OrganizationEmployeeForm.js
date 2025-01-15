import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, formatMessageWithValues, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchOrganizationEmployee,
} from "../../actions";
import EditOrganizationEmployeePage from "../../pages/organization-employee/EditOrganizationEmployeePage";
import AddOrganizationEmployeePage from "../../pages/organization-employee/AddOrganizationEmployeePage";
import { MODULE_NAME } from "../../constants";

class OrganizationEmployeeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      organizationEmployeeUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.organizationEmployeeUuid) {
      this.setState((state, props) => ({ organizationEmployeeUuid: props.organizationEmployeeUuid }));
    }
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedOrganizationEmployee !== this.props.fetchedOrganizationEmployee
      && !!this.props.fetchedOrganizationEmployee
      && !!this.props.organizationEmployee) {
      this.setState((state, props) => ({
        organizationEmployee: { ...props.organizationEmployee },
        organizationEmployeeUuid: props.organizationEmployee.id,
        lockNew: false,
      }));
    } else if (prevState.organizationEmployeeUuid !== this.state.organizationEmployeeUuid) {
      const filters = [`id: "${this.state.organizationEmployeeUuid}"`];
      this.props.fetchOrganizationEmployee(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.organizationEmployee?.id) {
        this.props.fetchOrganizationEmployee(
          this.props.modulesManager,
          [`id: "${this.state.organizationEmployeeUuid}"`],
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
      fetchedOrganizationEmployee,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      organizationEmployeeUuid,
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
        {(!!fetchedOrganizationEmployee || !organizationEmployeeUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={organizationEmployeeUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Organizations Employee"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(organizationEmployeeUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={organizationEmployeeUuid ? [EditOrganizationEmployeePage] : [AddOrganizationEmployeePage]}
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
  fetchedOrganizationEmployee: state.workforce.fetchedOrganizationEmployee,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchOrganizationEmployee,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  OrganizationEmployeeForm,
));
