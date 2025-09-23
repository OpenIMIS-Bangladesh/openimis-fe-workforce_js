import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Paper,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  MenuItem,
} from "@material-ui/core";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
  PublishedComponent
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import DistrictOfficePicker from "../../../pickers/DistrictOfficePicker";
import EmployeePicker from "../../../pickers/EmployeePicker";
import { useSelector, useDispatch } from "react-redux";
import {
  createApplicationSummary,
  updateApplication,
  fetchApplication,
  fetchApplicationPackage,
  fetchApplicationSummaryByClientMutationId,
  createApplicationMovement
} from "../../../actions";
import { WORKFORCE_STATUS } from "../../../constants";
import ForwardAdminPanel from "./ForwardAdminPanel";
import ForwardApplicationModal from "./ForwardApplicationModal";
import { formatApplicationSummaryGQL } from "../../../utils/format_gql";
import { getUserTypeFromRights } from "../../../utils/utils";
import { MODULE_NAME, WORKFORCE_USER_TYPE } from "../../../constants";

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700,
    maxHeight: "90vh",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    overflowY: "auto",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    minWidth: 0,
    padding: theme.spacing(0.5, 1),
    fontSize: "1.2rem",
  },
  sectionPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(2),
  },
  responseMessage: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
}));

const ForwardApplicationSummaryModal = ({
  open,
  onClose,
  selectedApplication,
  selectedApplicationIds,
  onSubmitForward,
  userRights
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  let applicationSummaryId =""
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [officeType, setOfficeType] = useState("");
  const [formData, setFormData] = useState(null);
  const data = useSelector((state) => state.workforce[`application`] ?? []);
  const userType = getUserTypeFromRights(userRights);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  console.log("SECTIONADMINEE",loggedInUserId)
  // const applicationSummaryId = useSelector((state) => state.workforce?.fetchedApplicationSummeryIdByClientMutationId);
  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSubmitting(false);
      setServerResponse(null);
      setFormData(null);
    }
    if (selectedApplication) {
      return dispatch(
        fetchApplication(modulesManager, [
          `id: "${decodeId(selectedApplication?.id)}"`,
        ])
      );
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      comment: editorContent,
      destinationOffice: formData,
    };
  };

  const handleForward = async () => {
    if (!formData?.year || !formData?.month) {
    setServerResponse({
      status: "ERROR",
      message: "সকল আবশ্যিক ফিল্ড পূরণ করুন।",
    });
    return;
  }
    const createApplicationSummaryData = {
      status:
      userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
      ? WORKFORCE_STATUS.MEETING_CREATED
      : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
      ? WORKFORCE_STATUS.MEETING_CREATED
      : WORKFORCE_STATUS.FORWARD_TO_EIS_ADVISOR,
      name: formData?.meetingName,
      meetingDate: formData?.meetingDate,
      year: formData?.year,
      month: formData?.month,
      organizationType: userType === "section_admin" ? "cf" : userType === "blwf_section_admin" ? "blwf": "eis",      
      sectionType: userType === "section_admin" ? "section_one" : userType === "section_admin_two" ? "section_two": null,
      applicationData: JSON.stringify(selectedApplicationIds),
    };

  const applicationSummeryMutation = formatMutation(
    "createWorkforceApplicationSummary",
    formatApplicationSummaryGQL(createApplicationSummaryData),
    "create workforce application summary"
  )
  const applicationSummeryClientMutationId = applicationSummeryMutation.clientMutationId;
  await dispatch(
    createApplicationSummary(
      applicationSummeryMutation,
      "create workforce application summary"
    )
  );

  await dispatch(fetchApplicationSummaryByClientMutationId(modulesManager,applicationSummeryClientMutationId))
        .then((response)=>{
          applicationSummaryId= response?.payload?.data?.workforceApplicationSummary?.edges?.[0]?.node?.id
          console.log({applicationSummaryId})
        })
  console.log(decodeId(applicationSummaryId))
  if (!applicationSummaryId) {
    setServerResponse({ status: "ERROR", message: "সারাংশ তৈরি ব্যর্থ হয়েছে!" });
    return;
  }
  for (const encodedId of selectedApplicationIds) {
     const updateApplicationData = {
       id: decodeId(encodedId?.id),
      ...(userType === "section_admin"
      ? { cfApplicationSummaryId: decodeId(applicationSummaryId) }
      : userType === "blwf_section_admin"
      ? { blwfApplicationSummaryId: decodeId(applicationSummaryId) }
      : {eisApplicationSummaryId: decodeId(applicationSummaryId)}),       
      status:
      userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
      ? WORKFORCE_STATUS.MEETING_CREATED
      : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
      ? WORKFORCE_STATUS.MEETING_CREATED
      : WORKFORCE_STATUS.FORWARD_TO_EIS_ADVISOR,
     };
    const createApplicationMovementData = {
        applicationId: decodeId(encodedId?.id),
        status:
        userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
        ? WORKFORCE_STATUS.MEETING_CREATED
        : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
        ? WORKFORCE_STATUS.MEETING_CREATED
        : WORKFORCE_STATUS.FORWARD_TO_EIS_ADVISOR,
        note: "আবেদন কমিটির কাছে প্রেরণ হয়েছে",
        action: "forward_to_comiitee",
        applicationFromId: loggedInUserId,
        applicationToId: userType === WORKFORCE_USER_TYPE.CHECKER ? 69 : 196,
        toRoleId: userType === WORKFORCE_USER_TYPE.CHECKER ? 23 : 48,
      };
   
   await dispatch(
     updateApplication(updateApplicationData, "update workforce application")
   );
   await dispatch(
     createApplicationMovement(createApplicationMovementData, "update workforce movement")
   );
  }

  setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
};

const handleSave = async () => {
  if (!formData?.year || !formData?.month) {
    setServerResponse({
      status: "ERROR",
      message: "সকল আবশ্যিক ফিল্ড পূরণ করুন।",
    });
    return;
  }
  const createApplicationSummarySheetData = {
    status:
    userType === WORKFORCE_USER_TYPE.SECTION_ADMIN
      ? WORKFORCE_STATUS.MEETING_CREATED
      : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
      ? WORKFORCE_STATUS.MEETING_CREATED
      : WORKFORCE_STATUS.FORWARD_TO_EIS_ADVISOR,
    name: formData?.meetingName,
    meetingDate: formData?.meetingDate,
    year: Number(formData?.year),
    month: formData?.month,
    organizationType: userType === "section_admin" ? "cf" : userType === "blwf_section_admin" ? "blwf": "eis",      
    sectionType: userType === "section_admin" ? "section_one" : userType === "section_admin_two" ? "section_two": null,
    applicationData: JSON.stringify(selectedApplicationIds),
  };
  const applicationSummeryMutation = formatMutation(
    "createWorkforceApplicationSummary",
    formatApplicationSummaryGQL(createApplicationSummarySheetData),
    "create workforce application summary"
  )
  const applicationSummeryClientMutationId = applicationSummeryMutation.clientMutationId;
  await dispatch(
    createApplicationSummary(
      applicationSummeryMutation,
      "create workforce application summary sheet"
    )
  );

   await dispatch(fetchApplicationSummaryByClientMutationId(modulesManager,applicationSummeryClientMutationId))
        .then((response)=>{
          applicationSummaryId= response?.payload?.data?.workforceApplicationSummary?.edges?.[0]?.node?.id
          console.log({applicationSummaryId})
        })

    if (!applicationSummaryId) {
    setServerResponse({ status: "ERROR", message: "সারাংশ তৈরি ব্যর্থ হয়েছে!" });
    return;
  }
  for (const encodedId of selectedApplicationIds) {
     const updateApplicationData = {
       id: decodeId(encodedId?.id),
        ...(userType === "section_admin"
      ? { cfApplicationSummaryId: decodeId(applicationSummaryId) }
      : userType === "blwf_section_admin"
      ? { blwfApplicationSummaryId: decodeId(applicationSummaryId) }
      : {eisApplicationSummaryId: decodeId(applicationSummaryId)}),      
       status: WORKFORCE_STATUS.MEETING_CREATED,
     };
   
   await dispatch(
     updateApplication(updateApplicationData, "update workforce application")
   );
  }

  setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
};


useEffect(() => {
  if (serverResponse?.status === "SUCCESS") {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [serverResponse]);

  return (
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer} onSubmit={handleSubmit}>
        {/* Close button */}
        <Button onClick={onClose} className={classes.closeButton}>
          ✕
        </Button>

        {/* Title */}
        <Typography
          variant="h5"
          gutterBottom
          style={{ fontWeight: "bold", marginTop: 3, textAlign: "center" }}
        >
          <FormattedMessage module="workforce" id="workforce.employee.application.forwardToSelectionOffice" />       
        </Typography>

        <Typography
          variant="body1"
          color="textSecondary"
          gutterBottom
          style={{ fontWeight: 600, marginTop: 3, textAlign: "center" }}
        >
          {/* {selectedApplication
            ? `${
                selectedApplication.workforceEmployee?.firstNameBn ||
                "আবেদনকারী"
              } এর আবেদন ফরওয়ার্ড করতে চান?`
            : "একটি আবেদন বেছে নিন।"} */}
        </Typography>

        {/* Response message */}
        {serverResponse?.status && (
          <Typography
            className={classes.responseMessage}
            style={{
              color: serverResponse.status === "SUCCESS" ? "green" : "red",
            }}
          >
            {serverResponse.status === "SUCCESS" ? "✅" : "⚠️"}{" "}
            {serverResponse.message}
          </Typography>
        )}

        <Divider style={{ marginBottom: 24 }} />

        {/* Form Fields */}
        <Paper className={classes.sectionPaper} elevation={1}>
          <Grid container spacing={3} style={{ marginTop: 3 }}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                style={{
                  fontWeight: "bold",
                  marginTop: 3,
                  textAlign: "center",
                }}
              >
                <FormattedMessage
                  module="workforce"
                  id="workforce.employee.application.provideMeetingInfo"
                />
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="বছর"
                variant="outlined"
                value={formData?.year || ""}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                required
              >
                {[...Array(21)].map((_, index) => {
                  const year = 2020 + index;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            {/* Month Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="মাস"
                variant="outlined"
                value={formData?.month || ""}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
                required
              >
                {[
                  "জানুয়ারি",
                  "ফেব্রুয়ারি",
                  "মার্চ",
                  "এপ্রিল",
                  "মে",
                  "জুন",
                  "জুলাই",
                  "আগস্ট",
                  "সেপ্টেম্বর",
                  "অক্টোবর",
                  "নভেম্বর",
                  "ডিসেম্বর",
                ].map((month, index) => (
                  <MenuItem key={index} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Meeting Name Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="মিটিং এর নাম"
                variant="outlined"
                value={formData?.meetingName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, meetingName: e.target.value })
                }
              />
            </Grid>
            {/* Meeting Date Field */}
           <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="workforce.DatePicker"
              label="মিটিং এর তারিখ"
              value={formData?.meetingDate || ""}
              onChange={(v) => setFormData({ ...formData, meetingDate: v })}
              readOnly={false}
            />
          </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <div className={classes.buttonGroup}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            <FormattedMessage module="workforce" id="core.LanguageQuickPicker.dialog.cancel" />
          </Button>

          <Button
            variant="outlined"
            color="default"
            onClick={handleSave} // You must define this function
            disabled={submitting}
          >
            <FormattedMessage module="workforce" id="workforce.save" />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            onClick={handleForward}
          >
            <FormattedMessage module="workforce" id="workforce.employee.application.forwardTo" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardApplicationSummaryModal;
