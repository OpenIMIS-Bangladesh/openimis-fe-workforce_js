import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchWorkforceAllAssociation,
} from "../../actions";
import EditWorkforceAssociationPage from "../../pages/workforce-association/EditWorkforceAssociationPage";
import AddWorkforceAssociationPage from "../../pages/workforce-association/AddWorkforceAssociationPage";
import { MODULE_NAME } from "../../constants";

class WorkforceAssociationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      workforceAssociationUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.workforceAssociationUuid) {
      this.setState((state, props) => ({ workforceAssociationUuid: props.workforceAssociationUuid }));
    }
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedWorkforceAllAssociation !== this.props.fetchedWorkforceAllAssociation
      && !!this.props.fetchedWorkforceAllAssociation
      && !!this.props.workforceAssociation) {
      this.setState((state, props) => ({
        workforceAssociation: { ...props.workforceAssociation },
        workforceAssociationUuid: props.workforceAssociation.id,
        lockNew: false,
      }));
    } else if (prevState.workforceAssociationUuid !== this.state.workforceAssociationUuid) {
      const filters = [`id: "${this.state.workforceAssociationUuid}"`];
      this.props.fetchWorkforceAllAssociation(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.workforceAssociation?.id) {
        this.props.fetchWorkforceAllAssociation(
          this.props.modulesManager,
          [`id: "${this.state.workforceAssociationUuid}"`],
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
      fetchedWorkforceAllAssociation,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      workforceAssociationUuid,
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
        {(!!fetchedWorkforceAllAssociation || !workforceAssociationUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={workforceAssociationUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Workforce Association"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(workforceAssociationUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={workforceAssociationUuid ? [EditWorkforceAssociationPage] : [AddWorkforceAssociationPage]}
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
  fetchedWorkforceAllAssociation: state.workforce.fetchedWorkforceAllAssociation,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkforceAllAssociation,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  WorkforceAssociationForm,
));
