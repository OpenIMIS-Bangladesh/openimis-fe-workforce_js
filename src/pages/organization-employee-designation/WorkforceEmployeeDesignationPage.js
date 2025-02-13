import React, { Component } from "react";
import { withModulesManager,decodeId } from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EmployeeDesignationSearcher from "../../components/organization-employee-designation/EmployeeDesignationSearcher";
import EmployeeDesignaitonInfo from "../../components/organization-employee-designation/EmployeeDesignaitonInfo";
import AssignDesignation from "../../components/organization-employee-designation/AssignDesignation";
import {
  fetchEmployeeDesignations,
  fetchWorkforceUnitsWithEmployeeDesignation,
} from "../../actions";

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
      prms.push(`email: "${email}"`);
    }
    if (nid) {
      prms.push(`nid: "${nid}"`);
      
    }

    this.props.fetchEmployeeDesignations(prms);
  };

  handleEmailChange = (email) => {
    this.setState({ email });
  };
  handleNidChange = (nid) => {
    this.setState({ nid });
  };

  fetchUnitWiseDesignations = async (v) => {
    const prms = [];
    prms.push(`organization_Id: "${decodeId(v?.id)}"`);
    prms.push(`orderBy:["unit_level", "unit_designations__designation_level"]`);
    await this.props.fetchWorkforceUnitsWithEmployeeDesignation(prms);

    this.setState({ selectedOrganization: v });
  };

  handleReleaseDateChange = (date) => {
    this.setState({ releaseDate: date });
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.employeeDesignationData !== this.props.employeeDesignationData &&
      this.props.employeeDesignationData?.organization
    ) {
      this.fetchUnitWiseDesignations(this.props.employeeDesignationData.organization);
    }

    if (prevState.releaseDate !== this.state.releaseDate && this.state.selectedOrganization) {
      this.fetchUnitWiseDesignations(this.state.selectedOrganization);
    }
  }


  render() {
    const { employeeDesignationData, unitWiseDesignationData } = this.props;
    const { stateEdited, isSaved, email,nid,releaseDate,selectedOrganization } = this.state;

    const userData = {
      name: employeeDesignationData?.nameBn || "",
      email: employeeDesignationData?.email || "",
      phone: employeeDesignationData?.phoneNumber || "",
      nid: employeeDesignationData?.nid || "",
    };

    const tableData = employeeDesignationData?.designations || [];

    return (
      <div>
        <EmployeeDesignationSearcher
          handleSearch={this.handleSearch}
          onEmailChange={this.handleEmailChange}
          onNidChange={this.handleNidChange}
        />
        <EmployeeDesignaitonInfo
          employeeDesignationData={employeeDesignationData}
          userData={userData}
          tableData={tableData}
          fetchUnitWiseDesignations={this.fetchUnitWiseDesignations}
          onReleaseDateChange={this.handleReleaseDateChange} 
        />
        <AssignDesignation
          userData={userData}
          stateEdited={stateEdited}
          updateAttribute={this.updateAttribute}
          tableData={tableData}
          handleSearch={this.handleSearch}
          unitWiseDesignations={unitWiseDesignationData}
          fetchUnitWiseDesignations={this.fetchUnitWiseDesignations}
          onValueChange = {this.handleValueChange}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  employeeDesignationData: state.workforce.employeeDesignationData,
  unitWiseDesignationData: state.workforce.unitWiseDesignationData,
});

// const mapDispatchToProps = (dispatch) => ({
//   // fetchEmployeeDesignations: bindActionCreators(fetchEmployeeDesignations, dispatch),
// });

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchEmployeeDesignations,
      fetchWorkforceUnitsWithEmployeeDesignation, // Add the function here
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withModulesManager(WorkforceEmployeeDesignationPage));
