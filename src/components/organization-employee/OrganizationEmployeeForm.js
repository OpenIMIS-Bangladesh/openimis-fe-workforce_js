import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, formatMessageWithValues, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchOrganizationUnit,
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
    // this.props.clearTicket();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedOrganizationEmployees !== this.props.fetchedOrganizationEmployees
      && !!this.props.fetchedOrganizationEmployees
      && !!this.props.organizationUnit) {
      this.setState((state, props) => ({
        organizationUnit: { ...props.organizationUnit },
        organizationEmployeeUuid: props.organizationUnit.id,
        lockNew: false,
      }));
    } else if (prevState.organizationEmployeeUuid !== this.state.organizationEmployeeUuid) {
      const filters = [`id: "${this.state.organizationEmployeeUuid}"`];
      // if (this.props.ticketVersion) filters.push(`ticketVersion: ${this.props.ticketVersion}`);
      this.props.fetchOrganizationUnit(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.organizationUnit?.id) {
        this.props.fetchOrganizationUnit(
          this.props.modulesManager,
          [`id: "${this.state.organizationEmployeeUuid}"`],
        );
      }
    }
  }

  // eslint-disable-next-line react/sort-comp
  _newTicket() {
    return {};
  }

  reload = () => {
    // this.props.fetchComments(
    //   this.state.ticket,
    // );
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
      fetchedOrganizationEmployees,
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
        // onlyIfDirty: ticket.status !== TICKET_STATUSES.CLOSED,
        disabled: ticket.isHistory,
      },
    ];

    console.log({ organizationEmployeeUuid });

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedOrganizationEmployees || !organizationEmployeeUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={organizationEmployeeUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Organizations Employee"
            // titleParams={{ label: ticketLabel(this.state.ticket) }}
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(organizationEmployeeUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={organizationEmployeeUuid ? [EditOrganizationEmployeePage] : [AddOrganizationEmployeePage]}
            onEditedChanged={this.onEditedChanged}
            // actions={actions}
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
  fetchedOrganizationEmployees: state.workforce.fetchedOrganizationEmployees,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchOrganizationUnit,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  OrganizationEmployeeForm,
));
