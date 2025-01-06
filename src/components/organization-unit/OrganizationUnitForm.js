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
import EditWorkforceOrganizationUnitPage from "../../pages/organization-unit/EditWorkforceOrganizationUnitPage";
import AddWorkforceOrganizationUnitPage from "../../pages/organization-unit/AddWorkforceOrganizationUnitPage";
import { MODULE_NAME } from "../../constants";

class OrganizationUnitForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      organizationUnitUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.organizationUnitUuid) {
      this.setState((state, props) => ({ organizationUnitUuid: props.organizationUnitUuid }));
    }
  }

  componentWillUnmount() {
    // this.props.clearTicket();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedOrganizationUnit !== this.props.fetchedOrganizationUnit
      && !!this.props.fetchedOrganizationUnit
      && !!this.props.organizationUnit) {
      this.setState((state, props) => ({
        organizationUnit: { ...props.organizationUnit },
        organizationUnitUuid: props.organizationUnit.id,
        lockNew: false,
      }));
    } else if (prevState.organizationUnitUuid !== this.state.organizationUnitUuid) {
      const filters = [`id: "${this.state.organizationUnitUuid}"`];
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
          [`id: "${this.state.organizationUnitUuid}"`],
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
      fetchedOrganizationUnit,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      organizationUnitUuid,
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

    console.log({ organizationUnitUuid });

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedOrganizationUnit || !organizationUnitUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={organizationUnitUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Workforce Organizations Unit"
            // titleParams={{ label: ticketLabel(this.state.ticket) }}
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(organizationUnitUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={organizationUnitUuid ? [EditWorkforceOrganizationUnitPage] : [AddWorkforceOrganizationUnitPage]}
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
  fetchedOrganizationUnit: state.workforce.fetchedOrganizationUnit,
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
  OrganizationUnitForm,
));
