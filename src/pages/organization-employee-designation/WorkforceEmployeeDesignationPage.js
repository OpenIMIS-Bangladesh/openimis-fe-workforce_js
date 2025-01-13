import React, { Component } from 'react'
import EmployeeDesignationSearcher from '../../components/organization-employee-designation/EmployeeDesignationSearcher'
import EmployeeDesignaitonInfo from '../../components/organization-employee-designation/EmployeeDesignaitonInfo'

export default class WorkforceEmployeeDesignationPage extends Component {
  
  render() {
    const userData = {
      name: "নকশন ইসলানা আগার",
      email: "azadhb@gmail.com",
      phone: "01718157611",
      userId: "1000000008034",
    };

    const tableData = [
      {
        division: "মন্ত্রণালয়",
        branch: "রক্ষণ শাখা",
        position: "উপসচিব",
        remarks: "",
      },
      {
        division: "মন্ত্রণালয়",
        branch: "অর্থ শাখা",
        position: "উপসচিব (অতিরিক্ত)",
        remarks: "",
      },
      {
        division: "মন্ত্রণালয়",
        branch: "আইন শাখা",
        position: "উপসচিব (অতিরিক্ত)",
        remarks: "",
      },
    ];
    return (
      <div>
        <EmployeeDesignationSearcher />
        <EmployeeDesignaitonInfo userData={userData} tableData={tableData}/>
      </div>
    )
  }
}
