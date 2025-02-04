import React, { Component } from "react";
import { withModulesManager } from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EmployeeFactorySearcher
  from "../../components/workforce-employee-factory/EmployeeFactorySearcher";
import EmployeeFactoryInfo from "../../components/workforce-employee-factory/EmployeeFactoryInfo";
import AssignFactory from "../../components/workforce-employee-factory/AssignFactory";

class WorkforceEmployeeFactoryPage extends Component {
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
      employeeFactoryData,
    } = this.props;
    const { stateEdited, isSaved } = this.state;

    const userData = {
      name: employeeFactoryData?.nameBn || "",
      email: employeeFactoryData?.email || "",
      phone: employeeFactoryData?.phoneNumber || "",
      nid: employeeFactoryData?.nid || "",
    };

    const tableData = employeeFactoryData?.nid || [];
    console.log({tableData})

    console.log({employeeFactoryData})

    return (

      <div>
        <EmployeeFactorySearcher />
        <EmployeeFactoryInfo employeeFactoryData={employeeFactoryData} userData={userData} tableData={tableData} />
        <AssignFactory userData={userData} stateEdited={stateEdited} updateAttribute={this.updateAttribute} tableData={tableData}/>
      </div>

    );
  }  
}

const mapStateToProps = (state) => ({
  employeeFactoryData: state.workforce.employeeFactoryData,
});

const mapDispatchToProps = (dispatch) => {

};

export default connect(mapStateToProps, mapDispatchToProps)(withModulesManager(WorkforceEmployeeFactoryPage));
