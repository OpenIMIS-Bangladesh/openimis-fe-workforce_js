import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchOrganization,
} from "../../actions";
import EditWorkforceOrganizationPage from "../../pages/organization/EditWorkforceOrganizationPage";
import AddWorkforceOrganizationPage from "../../pages/organization/AddWorkforceOrganizationPage";
import { MODULE_NAME } from "../../constants";
import EditWorkforceBankPage from "../../pages/workforce-banks/EditWorkforceBankPage";
import AddWorkforceBankPage from "../../pages/workforce-banks/AddWorkforceBankPage";

class BanksForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      organizationUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    // this.props.fetchGrievanceConfiguration();
    if (this.props.organizationUuid) {
      this.setState((state, props) => ({ organizationUuid: props.organizationUuid }));
    }
  }

  // eslint-disable-next-line react/sort-comp
  componentWillUnmount() {
    // this.props.clearTicket();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedOrganization !== this.props.fetchedOrganization
      && !!this.props.fetchedOrganization
      && !!this.props.ticket) {
      this.setState((state, props) => ({
        ticket: { ...props.ticket },
        organizationUuid: props.ticket.id,
        lockNew: false,
      }));
    } else if (prevState.organizationUuid !== this.state.organizationUuid) {
      const filters = [`id: "${this.state.organizationUuid}"`];
      if (this.props.ticketVersion) filters.push(`ticketVersion: ${this.props.ticketVersion}`);
      this.props.fetchOrganization(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.organizationUuid && !this.props.organizationUuid) {
      this.setState({ ticket: this._newTicket(), lockNew: false, organizationUuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.ticket?.id) {
        this.props.fetchOrganization(
          this.props.modulesManager,
          [`id: "${this.state.organizationUuid}"`],
        );
      }
    }
  }

  // eslint-disable-next-line react/sort-comp
  _newTicket() {
    return {};
  }

  reload = () => {
    this.props.fetchComments(
      this.state.ticket,
    );
  };

  canSave = () => {
    if (!this.state.ticket.reporter) return false;
    if (!this.state.ticket.category) return false;
    return true;
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
      fetchingOrganization,
      fetchedOrganization,
      errorOrganization,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      organizationUuid,
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

    return (
      <>
        <ProgressOrError progress={fetchingOrganization} error={errorOrganization} />
        {(!!fetchedOrganization || !organizationUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={organizationUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="workforce"
            // titleParams={{ label: ticketLabel(this.state.ticket) }}
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(organizationUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={organizationUuid ? [EditWorkforceBankPage] : [AddWorkforceBankPage]}
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
  fetchingOrganization: state.workforce.fetchingOrganization,
  errorOrganization: state.workforce.errorOrganization,
  fetchedOrganization: state.workforce.organization,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchOrganization,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  BanksForm,
));
