import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Grid, FormControlLabel, Radio, RadioGroup, Button } from "@material-ui/core";
import { FormattedMessage, TextInput } from "@openimis/fe-core";
import { updateApplication } from "../../../actions";
import CustomSnackbar from "../../shared/CustomSnackbar";
import EisFactoryAdminModal from "../EisFactoryAdminModal";
import { getUserType } from "../../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../../constants";

const isEmpty = (value) => {
  if (value == null) return true;
  // if (Array.isArray(value)) return value.length === 0;
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    return value.every((item) => item == null || (typeof item === "object" && Object.keys(item).length === 0));
  }
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

const DoctorsEntries = ({ application }) => {
  const dispatch = useDispatch();
 const user_type = getUserType();
  const [proposedAmount, setProposedAmount] = useState(application?.grantAmount || "");
  const [doctorDiagnosis, setDoctorDiagnosis] = useState("");
  const [doctorComment, setDoctorComment] = useState("");
  const [doctorsActions, setDoctorsActions] = useState("");
  const [openAccidentInfoModal, setOpenAccidentInfoModal] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState({ openResponseBar: false, status: "workforce.success.message.doctor", type: "success" });

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
      setOpenSnackBar({ openResponseBar: true, status: "আপনার মতামত সফলভাবে সংরক্ষিত করা হয়েছে!", type: "success" });
    } catch (error) {
      setOpenSnackBar({ openResponseBar: true, status: "আপনার মতামত সংরক্ষণ করা যায়নি।", type: "error" });
    }
  };

  const isNotEmpty = (value) => !isEmpty(value);

  return (
    <>
      <Grid container spacing={2} style={{ marginTop: "10px" }}>
        {/* Proposed Amount */}
        {(user_type != WORKFORCE_USER_TYPE.EIS_COORDINATOR||user_type != WORKFORCE_USER_TYPE.EIS_DOCTOR) &&(
        <Grid item xs={12}>
          <TextInput label="workforce.application.proposedAmount.byDoctor" value={proposedAmount || ""} onChange={(v) => setProposedAmount(v)} />
        </Grid>
        )}

        {/* Radio Group */}
        {application.organizationType != "eis" && (
          <>
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
          </>
        )}

        {/* Submit Button */}
         {user_type != WORKFORCE_USER_TYPE.EIS_COORDINATOR &&(

        <Grid item xs={3}>
          <Button variant="contained" color="primary" onClick={handleUpdateGrantAmount} disabled={!doctorsActions || !proposedAmount}>
            <FormattedMessage id="workforce.submit" module="workforce" />
          </Button>
        </Grid>
         )}

        {application?.organizationType === "eis" && (
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenAccidentInfoModal(true)}
              fullwidth
              // disabled={isNotEmpty(application?.doctorsEntry)}
            >
              {(user_type === WORKFORCE_USER_TYPE.EIS_COORDINATOR && application?.applicationType === "disabilityAssistance") ?<FormattedMessage id="workforce.eis.coordinator.accidentInfo.button.disability" module="workforce" /> :<FormattedMessage id="workforce.eis.factory.admin.accidentInfo.button" module="workforce" />}
            </Button>
          </Grid>
        )}
      </Grid>
      {openAccidentInfoModal && <EisFactoryAdminModal open={openAccidentInfoModal} onClose={() => setOpenAccidentInfoModal(false)} application={application} />}
      <CustomSnackbar
        open={openSnackBar?.openResponseBar}
        onClose={() => setOpenSnackBar({ ...openSnackBar, openResponseBar: false })}
        type={openSnackBar?.type}
        message={<FormattedMessage id={openSnackBar?.status} module="workforce" />}
      />
    </>
  );
};

export default DoctorsEntries;
