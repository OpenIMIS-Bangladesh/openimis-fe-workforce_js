import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Grid, FormControlLabel, Radio, RadioGroup, Button } from "@material-ui/core";
import { FormattedMessage, TextInput } from "@openimis/fe-core";
import { updateApplication } from "../../../actions";
import CustomSnackbar from "../../shared/CustomSnackbar";

const DoctorsEntries = ({ application }) => {
  const dispatch = useDispatch();

  const [proposedAmount, setProposedAmount] = useState(application?.grantAmount || "");
  const [doctorDiagnosis, setDoctorDiagnosis] = useState("");
  const [doctorComment, setDoctorComment] = useState("");
  const [doctorsActions, setDoctorsActions] = useState("");
  const [openSnackBar, setOpenSnackBar] = useState({openResponseBar: false,status: "workforce.success.message.doctor",type:"success"});

  const handleSelectCheckbox = (event) => {
    setDoctorsActions(event.target.value);
    // Reset fields when changing option
    setDoctorDiagnosis("");
    setDoctorComment("");
  };

  const handleUpdateGrantAmount = async () => {
    const updateApplicationData = {
      id: application?.id,
      doctorsRecommendedDonation: proposedAmount,
      doctorDiagnosis: doctorDiagnosis || null,
      doctorComment: doctorComment || null,
      doctorsFlag: doctorsActions,
    };
    try {
      console.log("Doctor Update Payload:", updateApplicationData);

      await dispatch(updateApplication(updateApplicationData, "update workforce application"));
      setOpenSnackBar({openResponseBar:true,status:"আপনার মতামত সফলভাবে সংরক্ষিত করা হয়েছে!",type:"success"})
    } catch (error) {
      setOpenSnackBar({openResponseBar:true,status:"আপনার মতামত সংরক্ষণ করা যায়নি।",type:"error"})
    }
  };

  return (
    <>
      <Grid container spacing={2} style={{ marginTop: "10px" }}>
        {/* Proposed Amount */}
        <Grid item xs={12}>
          <TextInput label="workforce.application.proposedAmount.byDoctor" value={proposedAmount || ""} onChange={(v) => setProposedAmount(v)} />
        </Grid>

        {/* Radio Group */}
        <Grid item xs={12}>
          <RadioGroup value={doctorsActions} onChange={handleSelectCheckbox}>
            <FormControlLabel
              value="recommend"
              control={<Radio color="primary" />}
              label={<FormattedMessage id="workforce.doctor.recommend" module="workforce" />}
            />
            <FormControlLabel
              value="discussion_required"
              control={<Radio color="primary" />}
              label={<FormattedMessage id="workforce.doctor.discussionRequired" module="workforce" />}
            />
            <FormControlLabel
              value="reject_request"
              control={<Radio color="primary" />}
              label={<FormattedMessage id="workforce.doctor.rejectRequest" module="workforce" />}
            />
          </RadioGroup>
        </Grid>

        {/* Conditional Fields */}
        {doctorsActions === "recommend" && (
          <Grid item xs={12}>
            <TextInput label="workforce.application.diagnosis.byDoctor" value={doctorDiagnosis} onChange={(v) => setDoctorDiagnosis(v)} />
          </Grid>
        )}

        {(doctorsActions === "discussion_required" || doctorsActions === "reject_request") && (
          <Grid item xs={12}>
            <TextInput label="workforce.application.reasons.addComment" value={doctorComment} onChange={(v) => setDoctorComment(v)} multiline rows={3} />
          </Grid>
        )}

        {/* Submit Button */}
        <Grid item xs={3}>
          <Button variant="contained" color="primary" onClick={handleUpdateGrantAmount} disabled={!doctorsActions || !proposedAmount}>
            <FormattedMessage id="workforce.submit" module="workforce" />
          </Button>
        </Grid>
      </Grid>
      <CustomSnackbar
        open={openSnackBar?.openResponseBar}
        onClose={() => setOpenSnackBar({...openSnackBar,openResponseBar:false})}
        type={openSnackBar?.type}
        message={<FormattedMessage id={openSnackBar?.status} module="workforce" />}
      />
    </>
  );
};

export default DoctorsEntries;
