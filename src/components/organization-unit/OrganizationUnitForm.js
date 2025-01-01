import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, formatMessageWithValues, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchOrganization,
} from "../../actions";
import EditWorkforceOrganizationPage from "../../pages/organization/EditWorkforceOrganizationPage";
import AddWorkforceOrganizationUnitPage from "../../pages/organization-unit/AddWorkforceOrganizationUnitPage";
import { MODULE_NAME } from "../../constants";

class OrganizationUnitForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      ticketUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    // this.props.fetchGrievanceConfiguration();
    if (this.props.ticketUuid) {
      this.setState((state, props) => ({ ticketUuid: props.ticketUuid }));
    }
  }

  // eslint-disable-next-line react/sort-comp
  componentWillUnmount() {
    // this.props.clearTicket();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.ticket.ticketCode !== this.state.ticket.ticketCode) {
      document.title = formatMessageWithValues(
        this.props.intl,
        MODULE_NAME,
        "ticket.title.bar",
        // { label: ticketLabel(this.state.ticket) },
        { label: "Label" },
      );
    }
    if (prevProps.fetchedTicket !== this.props.fetchedTicket
      && !!this.props.fetchedTicket
      && !!this.props.ticket) {
      this.setState((state, props) => ({
        ticket: { ...props.ticket },
        ticketUuid: props.ticket.id,
        lockNew: false,
      }));
    } else if (prevState.ticketUuid !== this.state.ticketUuid) {
      const filters = [`id: "${this.state.ticketUuid}"`];
      if (this.props.ticketVersion) filters.push(`ticketVersion: ${this.props.ticketVersion}`);
      this.props.fetchOrganization(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.ticketUuid && !this.props.ticketUuid) {
      this.setState({ ticket: this._newTicket(), lockNew: false, ticketUuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.ticket?.id) {
        this.props.fetchOrganization(
          this.props.modulesManager,
          [`id: "${this.state.ticketUuid}"`],
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
      fetchingTicket,
      fetchedTicket,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      ticketUuid,
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

    console.log({ticketUuid})

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedTicket || !ticketUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={ticketUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Workforce Organizations Unit"
            // titleParams={{ label: ticketLabel(this.state.ticket) }}
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(ticketUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={ticketUuid ? [EditWorkforceOrganizationPage] : [AddWorkforceOrganizationUnitPage]}
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
  fetchedTicket: state.workforce.fetchedTicket,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchOrganization,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  OrganizationUnitForm,
));
