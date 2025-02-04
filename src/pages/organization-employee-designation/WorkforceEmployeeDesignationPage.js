import React, { Component } from "react";
import { withModulesManager } from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EmployeeDesignationSearcher from "../../components/organization-employee-designation/EmployeeDesignationSearcher";
import EmployeeDesignaitonInfo from "../../components/organization-employee-designation/EmployeeDesignaitonInfo";
import AssignDesignation from "../../components/organization-employee-designation/AssignDesignation";
import { fetchEmployeeDesignations } from "../../actions";

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
    const { email } = this.state;
    const prms = [];
    if (email) {
      prms.push(`email: "${email}"`);
    }
    
   this.props.fetchEmployeeDesignations(prms);
  };

  handleEmailChange = (email) => {
    this.setState({ email });
  };

  render() {
    const { employeeDesignationData, unitWiseDesignationData } = this.props;
    const { stateEdited, isSaved,email } = this.state;

    const userData = {
      name: employeeDesignationData?.nameBn || "",
      email: employeeDesignationData?.email || "",
      phone: employeeDesignationData?.phoneNumber || "",
      nid: employeeDesignationData?.nid || "",
    };

    const tableData = employeeDesignationData?.designations || [];

    return (
      <div>
        <EmployeeDesignationSearcher handleSearch={this.handleSearch} onEmailChange={this.handleEmailChange}/>
        <EmployeeDesignaitonInfo employeeDesignationData={employeeDesignationData} userData={userData} tableData={tableData} />
        <AssignDesignation userData={userData} stateEdited={stateEdited} updateAttribute={this.updateAttribute} tableData={tableData} handleSearch={this.handleSearch}/>
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

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchEmployeeDesignations
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(withModulesManager(WorkforceEmployeeDesignationPage));
