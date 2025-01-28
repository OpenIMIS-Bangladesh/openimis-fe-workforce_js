import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  Form, journalize, ProgressOrError, withModulesManager, formatMessage,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import {
  fetchUnitDesignation,
} from "../../actions";
import { MODULE_NAME } from "../../constants";
import AddUnitDesignationPage from "../../pages/organization-unit-designation/AddUnitDesignationPage";
import EditUnitDesignationPage from "../../pages/organization-unit-designation/EditUnitDesignationPage";

class UnitDesignationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      unitDesignationUuid: null,
    };
  }

  componentDidMount() {
    if (this.props.unitDesignationUuid) {
      this.setState((state, props) => ({ unitDesignationUuid: props.unitDesignationUuid }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedUnitDesignation !== this.props.fetchedUnitDesignation
      && !!this.props.fetchedUnitDesignation
      && !!this.props.unitDesignation) {
      this.setState((state, props) => ({
        unitDesignation: { ...props.unitDesignation },
        unitDesignationUuid: props.unitDesignation.id,
        lockNew: false,
      }));
    } else if (prevState.unitDesignationUuid !== this.state.unitDesignationUuid) {
      const filters = [`id: "${this.state.unitDesignationUuid}"`];
      this.props.fetchUnitDesignation(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.unitDesignation?.id) {
        this.props.fetchUnitDesignation(
          this.props.modulesManager,
          [`id: "${this.state.unitDesignationUuid}"`],
        );
      }
    }
  }

  render() {
    const {
      fetchingUnitDesignations,
      fetchedUnitDesignation,
      errorUnitDesignations,
      save, back,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      unitDesignationUuid,
      ticket,
    } = this.state;

    const readOnly = false;

    return (
      <>
        <ProgressOrError progress={fetchingUnitDesignations} error={errorUnitDesignations} />
        {(!!fetchedUnitDesignation || !unitDesignationUuid) && (
          <Form
            module={MODULE_NAME}
            edited_id={unitDesignationUuid}
            edited={ticket}
            reset={reset}
            update={update}
            title="workforce"
            // titleParams={{ label: ticketLabel(this.state.ticket) }}
            titleParams={{ label: "Label" }}
            back={back}
            save={save ? this._save : null}
            canSave={this.canSave}
            reload={(unitDesignationUuid || readOnly) && this.reload}
            readOnly={readOnly}
            overview={overview}
            Panels={unitDesignationUuid ? [EditUnitDesignationPage] : [AddUnitDesignationPage]}
            onEditedChanged={this.onEditedChanged}
            // actions={actions}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingUnitDesignations: state.workforce.fetchingUnitDesignations,
  errorUnitDesignations: state.workforce.errorUnitDesignations,
  fetchedUnitDesignation: state.workforce.fetchedUnitDesignation,
  unitDesignation: state.workforce.unitDesignation,
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  grievanceConfig: state.workforce.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchUnitDesignation,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  UnitDesignationForm,
));
