import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import {
  Form, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchWorkforceCompany,
  fetchWorkforceCompanyWithFactoriesAndOffices,
} from "../../actions";
import EditWorkforceCompanyPage from "../../pages/workforce-company/EditWorkforceCompanyPage";
import AddWorkforceCompanyPage from "../../pages/workforce-company/AddWorkforceCompanyPage";
import { MODULE_NAME } from "../../constants";
import ViewWorkforceCompanyPage from "../../pages/workforce-company/ViewWorkforceCompanyPage";

class WorkforceCompanyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      workforceCompanyUuid: null,
      ticket: this._newTicket(),
    };
  }

  componentDidMount() {
    if (this.props.workforceCompanyUuid) {
      this.setState((state, props) => ({ workforceCompanyUuid: props.workforceCompanyUuid }));
    }
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedWorkforceCompany !== this.props.fetchedWorkforceCompany
      && !!this.props.fetchedWorkforceCompany
      && !!this.props.workforceCompany) {
      this.setState((state, props) => ({
        workforceCompany: { ...props.workforceCompany },
        workforceCompanyUuid: props.workforceCompany.id,
        lockNew: false,
      }));
    } else if (prevState.workforceCompanyUuid !== this.state.workforceCompanyUuid) {
      const filters = [`id: "${this.state.workforceCompanyUuid}"`];
      if (this.props.workforceCompanyUuid && !this.props.isApproveEdit) {
        this.props.fetchWorkforceCompanyWithFactoriesAndOffices(
          this.props.modulesManager,
          filters,
        );
      } else {
        this.props.fetchWorkforceCompany(
          this.props.modulesManager,
          filters,
        );
      }
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.workforceCompany?.id) {
        if (this.props.workforceCompanyUuid && !this.props.isApproveEdit) {
          this.props.fetchWorkforceCompanyWithFactoriesAndOffices(
            this.props.modulesManager,
            [`id: "${this.state.workforceCompanyUuid}"`],
          );
        } else {
          this.props.fetchWorkforceCompany(
            this.props.modulesManager,
            [`id: "${this.state.workforceCompanyUuid}"`],
          );
        }
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
      fetchedWorkforceCompany,
      errorTicket,
      save, back, isApproveEdit,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      workforceCompanyUuid,
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

    console.log("Hello", workforceCompanyUuid && !isApproveEdit);

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedWorkforceCompany || !workforceCompanyUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={workforceCompanyUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="Workforce Company"
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(workforceCompanyUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={(workforceCompanyUuid && !isApproveEdit) ? [ViewWorkforceCompanyPage] : (workforceCompanyUuid && isApproveEdit) ? [EditWorkforceCompanyPage] : [AddWorkforceCompanyPage]}
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
  fetchedWorkforceCompany: state.workforce.fetchedWorkforceCompany,
  ticket: state.workforce.ticket,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkforceCompany,
  fetchWorkforceCompanyWithFactoriesAndOffices,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  WorkforceCompanyForm,
));
