import React, { Component } from "react";
import { withModulesManager,decodeId } from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EmployeeDesignationSearcher from "../../components/organization-employee-designation/EmployeeDesignationSearcher";
import EmployeeDesignaitonInfo from "../../components/organization-employee-designation/EmployeeDesignaitonInfo";
import AssignDesignation from "../../components/organization-employee-designation/AssignDesignation";
import {
  fetchEmployeeDesignations,
  fetchWorkforceEmployee,
  fetchWorkforceEmployeeDesignation,
  fetchWorkforceUnitsWithEmployeeDesignation,
} from "../../actions";
import WorkforceEmployeeDesignationSearcher from "../../components/workforce-employee-designation/WorkforceEmployeeDesignationSearcher";
import WorkforceEmployeeDesignaitonInfo from "../../components/workforce-employee-designation/WorkforceEmployeeDesignaitonInfo";
import AssignEmployeeDesignation from "../../components/workforce-employee-designation/AssignEmployeeDesignation";

class WorkforceEmployeeDesignationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
      isSaved: false,
    };
  }

  updateAttribute = (key, value) => {
    this.setState((prevState) => ({
      stateEdited: {
        ...prevState.stateEdited,
        [key]: value,
      },
      isSaved: false,
    }));
  };

  handleSearch = () => {
    const { email,nid } = this.state;
    const prms = [];
    if (email) {
      prms.push(`workforceEmployee_Email: "${email}"`);
    }
    if (nid) {
      prms.push(`nid: "${nid}"`);
      
    }

    this.props.fetchWorkforceEmployeeDesignation(this.props.modulesManager,prms);
  };

  handleEmailChange = (email) => {
    this.setState({ email });
  };
  handleNidChange = (nid) => {
    this.setState({ nid });
  };

  fetchWorkforceEmployeeDesignations = async (factory) => {
      if (!factory?.id) return;
      const prms = [];
      prms.push(`workforceFactoryId: "${factory.id}"`);
      console.log({prms})
      await this.props.fetchWorkforceEmployeeDesignation(this.props.modulesManager, prms);
    };

  handleReleaseDateChange = (date) => {
    this.setState({ releaseDate: date });
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.workforceEmployeeDesignation !== this.props.workforceEmployeeDesignation &&
      this.props.workforceEmployeeDesignation?.organization
    ) {
      this.fetchWorkforceEmployeeDesignations(this.props.workforceEmployeeDesignation.organization);
    }

    if (prevState.releaseDate !== this.state.releaseDate && this.state.selectedOrganization) {
      this.fetchWorkforceEmployeeDesignations(this.state.selectedOrganization);
    }
  }


  render() {
    const { workforceEmployeeDesignation, unitWiseDesignationData,workforceEmployee } = this.props;
    const { stateEdited, isSaved, email,nid,releaseDate,selectedOrganization } = this.state;

    const userData = {
      name: workforceEmployeeDesignation?.[0]?.workforceEmployee?.firstNameBn || "",
      email: workforceEmployeeDesignation?.[0]?.workforceEmployee?.email || "",
      phone: workforceEmployeeDesignation?.[0]?.workforceEmployee?.phoneNumber || "",
      nid: workforceEmployeeDesignation?.[0]?.workforceEmployee?.nid || "",
    };

    const tableData = workforceEmployeeDesignation?.designations || [];
    // console.clear()
    console.log({userData})
    console.log({workforceEmployeeDesignation})
    return (
      <div>
        <WorkforceEmployeeDesignationSearcher
          handleSearch={this.handleSearch}
          onEmailChange={this.handleEmailChange}
          onNidChange={this.handleNidChange}
        />
        <WorkforceEmployeeDesignaitonInfo
          workforceEmployeeDesignation={workforceEmployeeDesignation}
          userData={userData}
          tableData={tableData}
          fetchWorkforceEmployeeDesignations={this.fetchWorkforceEmployeeDesignations}
          onReleaseDateChange={this.handleReleaseDateChange} 
        />
        <AssignEmployeeDesignation
          userData={userData}
          stateEdited={stateEdited}
          updateAttribute={this.updateAttribute}
          tableData={tableData}
          handleSearch={this.handleSearch}
          unitWiseDesignations={unitWiseDesignationData}
          fetchWorkforceEmployeeDesignations={this.fetchWorkforceEmployeeDesignations}
          onValueChange = {this.handleValueChange}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  workforceEmployeeDesignation: state.workforce.workforceEmployeeDesignation,
  unitWiseDesignationData: state.workforce.unitWiseDesignationData,
  workforceEmployee:state.workforce.workforceEmployee
});

// const mapDispatchToProps = (dispatch) => ({
//   // fetchEmployeeDesignations: bindActionCreators(fetchEmployeeDesignations, dispatch),
// });

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchWorkforceEmployee,
      fetchWorkforceEmployeeDesignation,
      fetchWorkforceUnitsWithEmployeeDesignation,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withModulesManager(WorkforceEmployeeDesignationPage));
