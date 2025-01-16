import React, { Component } from "react";
import { withModulesManager } from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EmployeeDesignationSearcher
  from "../../components/organization-employee-designation/EmployeeDesignationSearcher";
import EmployeeDesignaitonInfo from "../../components/organization-employee-designation/EmployeeDesignaitonInfo";
import AssignDesignation from "../../components/organization-employee-designation/AssignDesignation";

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

  render() {
    const {
      employeeDesignationData,
    } = this.props;
    const { stateEdited, isSaved } = this.state;

    const userData = {
      name: employeeDesignationData?.nameBn || "",
      email: employeeDesignationData?.email || "",
      phone: employeeDesignationData?.phoneNumber || "",
      nid: employeeDesignationData?.nid || "",
    };

    const tableData = employeeDesignationData?.designations || [];
    console.log({tableData})

    console.log({stateEdited})

    return (

      <div>
        <EmployeeDesignationSearcher />
        <EmployeeDesignaitonInfo userData={userData} tableData={tableData} />
        <AssignDesignation userData={userData} stateEdited={stateEdited} updateAttribute={this.updateAttribute}/>
      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  employeeDesignationData: state.workforce.employeeDesignationData,
});

const mapDispatchToProps = (dispatch) => {

};

export default connect(mapStateToProps, mapDispatchToProps)(withModulesManager(WorkforceEmployeeDesignationPage));
