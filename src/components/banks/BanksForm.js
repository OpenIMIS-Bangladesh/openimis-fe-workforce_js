import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchBank,
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
      bankUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    // this.props.fetchGrievanceConfiguration();
    if (this.props.bankUuid) {
      this.setState((state, props) => ({ bankUuid: props.bankUuid }));
    }
  }

  // eslint-disable-next-line react/sort-comp
  componentWillUnmount() {
    // this.props.clearTicket();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedBank !== this.props.fetchedBank
      && !!this.props.fetchedBank
      && !!this.props.ticket) {
      this.setState((state, props) => ({
        ticket: { ...props.ticket },
        bankUuid: props.ticket.id,
        lockNew: false,
      }));
    } else if (prevState.bankUuid !== this.state.bankUuid) {
      const filters = [`id: "${this.state.bankUuid}"`];
      if (this.props.ticketVersion) filters.push(`ticketVersion: ${this.props.ticketVersion}`);
      this.props.fetchBank(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.bankUuid && !this.props.bankUuid) {
      this.setState({ ticket: this._newTicket(), lockNew: false, bankUuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.ticket?.id) {
        this.props.fetchBank(
          this.props.modulesManager,
          [`id: "${this.state.bankUuid}"`],
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
      fetchingBank,
      fetchedBank,
      errorBank,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      bankUuid,
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
        <ProgressOrError progress={fetchingBank} error={errorBank} />
        {(!!fetchedBank || !bankUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={bankUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="workforce"
            // titleParams={{ label: ticketLabel(this.state.ticket) }}
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(bankUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={bankUuid ? [EditWorkforceBankPage] : [AddWorkforceBankPage]}
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
  fetchingBank: state.workforce.fetchingBank,
  fetchedBank: state.workforce.fetchedBank,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBank,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  BanksForm,
));
