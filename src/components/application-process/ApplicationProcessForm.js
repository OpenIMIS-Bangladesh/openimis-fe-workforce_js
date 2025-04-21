import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form,
  journalize,
  ProgressOrError,
  withModulesManager,
  formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { fetchApplication } from "../../actions";
import { MODULE_NAME } from "../../constants";
import AddApplicationPage from "../../pages/application-process/AddApplicationPage";
import ViewApplicationPage from "../../pages/application-process/ViewApplicationPage";
import VerifyApplicationPage from "../../pages/application-process/VerifyApplicationPage";
import TabsForm from "./TabsForm";


class ApplicationProcessForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      applicationUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.applicationUuid) {
      this.setState((state, props) => ({
        applicationUuid: props.applicationUuid,
      }));
    }
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedApplication !== this.props.fetchedApplication &&
      !!this.props.fetchedApplication &&
      !!this.props.organizationEmployee
    ) {
      this.setState((state, props) => ({
        organizationEmployee: { ...props.organizationEmployee },
        applicationUuid: props.organizationEmployee.id,
        lockNew: false,
      }));
    } else if (prevState.applicationUuid !== this.state.applicationUuid) {
      const filters = [`id: "${this.state.applicationUuid}"`];
      if (this.props.applicationUuid && !this.props.isVerify){
        this.props.fetchApplication(this.props.modulesManager, filters);
      }else{
        this.props.fetchApplication(this.props.modulesManager, filters);
      }
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.organizationEmployee?.id) {
        if (this.props.applicationUuid && !this.props.isVerify){
          this.props.fetchApplication(this.props.modulesManager, [
            `id: "${this.state.applicationUuid}"`,
          ]);
        }else{
          this.props.fetchApplication(this.props.modulesManager, [
            `id: "${this.state.applicationUuid}"`,
          ]);
        }
      }
    }
  }

  _newTicket() {
    return {};
  }

  reload = () => {};

  canSave = () => {};

  _save = (ticket) => {
    this.setState({ lockNew: !ticket.uuid }, () => this.props.save(ticket));
  };

  onEditedChanged = (ticket) => {
    this.setState({ ticket });
  };

  reopenTicket = () => {
    const { intl, ticket } = this.props;
    this.props.reopenTicket(
      ticket.id,
      formatMessage(intl, MODULE_NAME, "reopenTicket.mutation.label")
    );
  };

  render() {
    const {
      fetchingTicket,
      fetchedApplication,
      errorTicket,
      save,
      back,
      isVerify,
    } = this.props;

    const { lockNew, reset, update, overview, applicationUuid, ticket } =
      this.state;

    const readOnly = lockNew || !!ticket.validityTo || this.props.readOnly;
    const actions = [
      {
        doIt: this.reopenTicket,
        icon: <LockOpenIcon />,
        disabled: ticket.isHistory,
      },
    ];

    console.log("Hello", applicationUuid && !isVerify);

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedApplication || !applicationUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={applicationUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Workforce Application"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(applicationUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={
              (applicationUuid && !isVerify)
                ? [ViewApplicationPage]
                :(applicationUuid && isVerify)? [VerifyApplicationPage]: [AddApplicationPage][TabsForm]
            }
            onEditedChanged={this.onEditedChanged}
          />
        )}
      </>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  fetchingTicket: state.workforce.fetchingTicket,
  errorTicket: state.workforce.errorTicket,
  fetchedApplication: state.workforce.fetchedApplication,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplication,

      journalize,
    },
    dispatch
  );

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(ApplicationProcessForm)
);
