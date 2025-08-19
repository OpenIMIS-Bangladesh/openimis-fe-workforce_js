import React, { useState, useEffect } from "react";

import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    Grid,
} from "@material-ui/core";

import { enToBn, getParsedApplicationFromArray } from "../../utils/utils";
import { fetchApplicationsSummary } from "../../actions";
import { useModulesManager } from "@openimis/fe-core";
import { useDispatch, useSelector } from "react-redux";

const styles = (theme) => ({
    page: theme.page,
    lockedPage: theme.page.locked,
});



const BeneficiaryReport = (props) => {
    const [loading, setLoading] = useState(true);
    const modulesManager = useModulesManager()
    const dispatch = useDispatch();

    useEffect(async () => {
        await dispatch(fetchApplicationsSummary(modulesManager)).then(() => {
            setLoading(false);
        });
    }, []);

    const rawApplications = useSelector((state) => state.workforce.applications);
    const applications = getParsedApplicationFromArray(rawApplications);
    console.log("Applications in BeneficiaryReport:", applications);


    return (
        <div style={{ marginBottom: "100px" }}>
            <table cellPadding={"5px"} border={1} style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th colSpan={15} style={{ textAlign: "center" }}>
                            <Grid container spacing={2}>
                                <Grid item xs={2} lg={2} md={2}>

                                    {/* <img src={`workforce_assets/centralfund.png`} alt="Logo" style={{ width: "120px" }} /> */}
                                </Grid>
                                <Grid item xs={8} lg={8} md={8}>
                                    <div style={{ width: "100%", textAlign: "center" }}>
                                        <h3>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
                                        <p>শ্রম ও কর্মসংস্থান মন্ত্রণালয়</p>
                                        <p>কেন্দ্রীয় তহবিল</p>
                                        <p>২১ তলা, ভবন#৬, বাংলাদেশ সচিবালয়, ঢাকা-১০০০</p>
                                        <p>www.centralfund.gov.bd</p>
                                    </div>
                                </Grid>
                                <Grid item xs={2} lg={2} md={2}>
                                    {/* <img src={`workforce_assets/bdgov.png`} alt="Logo" style={{ width: "120px" }} /> */}
                                </Grid>
                            </Grid>
                        </th>
                    </tr>
                    <tr style={{ backgroundColor: "#E8EDEC" }}>
                        <th colSpan={15} style={{ textAlign: "center" }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} lg={12} md={12}>
                                    <div style={{ width: "100%", textAlign: "center" }}>
                                        <p style={{ textDecoration: "underline" }}>মৃত্যু ও দূর্ঘটনাজনিত আর্থিক সহায়তা তালিকা </p>
                                        <p style={{ textDecoration: "underline" }}>সুবিধাভোগী কল্যাণ হিসাব (নং ৪৪২৬৩৩৬০০১০৩৪)</p>
                                    </div>
                                </Grid>
                            </Grid>
                        </th>
                    </tr>
                    <tr style={{ backgroundColor: "#f6fffeff" }}>
                        <th colSpan={15}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} lg={12} md={12}>
                                    <div style={{ textAlign: "left" }}>
                                        <p>বোর্ড সভাঃ  </p>
                                        <p>আবেদনের সংখ্যাঃ </p>
                                        <p>নমিনী/ব্যাংক হিসাবের সংখ্যাঃ </p>
                                        <p>অর্থের পরিমাণঃ </p>
                                    </div>
                                </Grid>
                            </Grid>
                        </th>
                    </tr>
                    <tr>
                        <th>Sl.</th>
                        <th>Main List No.</th>
                        <th>Date</th>
                        <th>Ref. No.</th>
                        <th>Sender A/C No.</th>
                        <th>Receiver's Routing No.</th>
                        <th>Sender's Routing No.</th>
                        <th>Type (C/D)</th>
                        <th>Customer/ Nominee's Account Name</th>
                        <th>Customer/ Nominee's Account No.</th>
                        <th>Amount</th>
                        <th>Institute</th>
                        <th>Entry Description</th>
                        <th>Deceased Worker's Name</th>
                        <th>Factory Name</th>
                    </tr>
                </thead>
                <tbody>
                    {applications?.length > 0 ? (
                        applications.map((app, index) => (
                            <tr key={app.id}>
                                <td>{enToBn(index + 1)}</td>
                                <td>{app.trackingNumber}</td>
                                <td>{app.dateModified}</td>
                                <td></td>
                                <td>4426336001034</td>
                                <td>
                                    {
                                        app.employeeBankInfo.map((bank) => (
                                            <span></span>
                                        ))
                                    }
                                </td>
                                <td></td>
                                <td></td>
                                <td>{app.workforceEmployee.firstNameBn}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="15" style={{ textAlign: "center" }}>{loading === true ? (<span>লোড হচ্ছে...</span>) : (<span>তথ্য পাওয়া যায়নি।</span>)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default BeneficiaryReport