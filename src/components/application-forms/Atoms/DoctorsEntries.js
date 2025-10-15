import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, Paper, Typography, FormControlLabel, Radio, RadioGroup, Divider, Card, CardContent, Box, Button } from "@material-ui/core";
import { withModulesManager, withHistory, historyPush, coreConfirm, journalize, FormattedMessage, decodeId, TextInput } from "@openimis/fe-core";
import { updateApplication } from "../../../actions";

const DoctorsEntries = ({ application }) => {
  const dispatch = useDispatch();
  const [proposedAmount, setProposedAmount] = useState(application?.grantAmount || "");
  const [doctorDiagnosis, setDoctorDiagnosis] = useState("");
  const [doctorsActions, setDoctorsActions] = useState("");
  const handleSelectCheckbox = (event)=>{
    setDoctorsActions(event.target.value)
  }
  const handleUpdateGrantAmount = (amount) => {
    const updateApplicationData = {
      id: application?.id,
      doctorsRecommendedDonation: amount,
      doctorDiagnosis: doctorDiagnosis,
      doctorsFlag:doctorsActions
    };
    console.log({ grantAmount: updateApplicationData });
    dispatch(updateApplication(updateApplicationData, "update workforce application"));
  };
  return (
    <Grid container spacing={2} style={{ marginTop: "10px" }}>
      <Grid item xs={12}>
        <TextInput label={"workforce.application.proposedAmount.byDoctor"} value={proposedAmount || ""} onChange={(e) => setProposedAmount(e)} />
      </Grid>
      <Grid item xs={12}>
        <TextInput label={"workforce.application.diagnosis.byDoctor"} value={doctorDiagnosis || ""} onChange={(e) => setDoctorDiagnosis(e)} />
      </Grid>
      <Grid item xs={12}>
        <RadioGroup value={doctorsActions} onChange={handleSelectCheckbox}>
          <FormControlLabel value="discussion_required" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.doctor.discussionRequired" module="workforce" />} />
          <FormControlLabel value="reject_request" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.doctor.rejectRequest" module="workforce" />} />
          <FormControlLabel value="recommend" control={<Radio color="primary" />} label={<FormattedMessage id="workforce.doctor.recommend" module="workforce" />} />
        </RadioGroup>
      </Grid>
      <Grid item xs={3}>
        <Button variant="contained" color="primary" onClick={() => handleUpdateGrantAmount(proposedAmount)}>
          {<FormattedMessage id="workforce.submit" module="workforce" />}
        </Button>
      </Grid>
    </Grid>
  );
};

export default DoctorsEntries;
