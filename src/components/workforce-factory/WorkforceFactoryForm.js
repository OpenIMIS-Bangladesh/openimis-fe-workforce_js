import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchWorkforceFactory,
} from "../../actions";
import EditWorkforceFactoryPage from "../../pages/workforce-factory/EditWorkforceFactoryPage";
import AddWorkforceFactoryPage from "../../pages/workforce-factory/AddWorkforceFactoryPage";
import { MODULE_NAME } from "../../constants";

class WorkforceFactoryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      workforceFactoryUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.workforceFactoryUuid) {
      this.setState((state, props) => ({ workforceFactoryUuid: props.workforceFactoryUuid }));
    }
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedWorkforcefactory !== this.props.fetchedWorkforcefactory
      && !!this.props.fetchedWorkforcefactory
      && !!this.props.workforceFactory) {
      this.setState((state, props) => ({
        workforceFactory: { ...props.workforceFactory },
        workforceFactoryUuid: props.workforceFactory.id,
        lockNew: false,
      }));
    } else if (prevState.workforceFactoryUuid !== this.state.workforceFactoryUuid) {
      const filters = [`id: "${this.state.workforceFactoryUuid}"`];
      this.props.fetchWorkforceFactory(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.workforceFactory?.id) {
        this.props.fetchWorkforceFactory(
          this.props.modulesManager,
          [`id: "${this.state.workforceFactoryUuid}"`],
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
      fetchedWorkforcefactory,
      errorTicket,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      workforceFactoryUuid,
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

    console.log({ workforceFactoryUuid });

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedWorkforcefactory || !workforceFactoryUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={workforceFactoryUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Workforce Factory"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(workforceFactoryUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={workforceFactoryUuid ? [EditWorkforceFactoryPage] : [AddWorkforceFactoryPage]}
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
  fetchedWorkforcefactory: state.workforce.fetchedWorkforcefactory,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkforceFactory,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  WorkforceFactoryForm,
));
