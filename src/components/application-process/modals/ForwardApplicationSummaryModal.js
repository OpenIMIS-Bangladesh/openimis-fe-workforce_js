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
  Checkbox,
  Select,
} from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage, PublishedComponent } from "@openimis/fe-core";
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
  createApplicationMovement,
  fetchWorkforceCommittees,
  fetchWorkforceUserRoleWiseUser,
} from "../../../actions";
import { WORKFORCE_STATUS, STATUS_MAP_EN, STATUS_MAP_BN } from "../../../constants";
import ForwardAdminPanel from "./ForwardAdminPanel";
import ForwardApplicationModal from "./ForwardApplicationModal";
import { formatApplicationSummaryGQL } from "../../../utils/format_gql";
import { getUserTypeFromRights, isBlwfPath, isEisPath, safeDecodeId } from "../../../utils/utils";
import { MODULE_NAME, WORKFORCE_USER_TYPE } from "../../../constants";

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    position: "absolute",
    top: "5%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: 1400,
    height: "90vh",
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

const ForwardApplicationSummaryModal = ({ open, onClose, selectedApplication, selectedApplicationIds, onSubmitForward, userRights,roleIds }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  let applicationSummaryId = "";
  const modulesManager = useModulesManager();
  const [editorContent, setEditorContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [meetingList, setMeetingList] = useState([]);
  const locale = useSelector((state) => state.core?.locale || "bn");
  const [formData, setFormData] = useState({ roleIds: [], userIds: [], year: "", month: "", meetingName: "", meetingDate: null, committeeIds: "" });
  const data = useSelector((state) => state.workforce[`application`] ?? []);
  const userType = getUserTypeFromRights(userRights);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  const [committees, setCommittees] = useState([]);
  const officersRaw = useSelector((state) => state.workforce.roleWiseUsers);
  const officers = officersRaw || [];

  const ROLE_OPTIONS = committees.map((committee) => ({
    id: safeDecodeId(committee.assignedRole.id),
    committeeId: committee?.id,
    name: committee.nameEn || committee.nameBn || committee.id,
  }));

  useEffect(() => {
    if (!open) {
      setEditorContent("");
      setSubmitting(false);
      setServerResponse(null);
      setFormData({ roleIds: [], userIds: [], year: "", month: "", meetingName: "", meetingDate: null, committeeIds: "" });
    } else {
      let organizationType = isEisPath() ? "eis" : isBlwfPath() ? "blwf" : "cf";
      if (userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ||userType===WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
        dispatch(fetchWorkforceCommittees({ organizationType })).then((response) => {
            setCommittees(response?.payload?.data?.workforceCommittees || []);
        });
      }
    }
    if (selectedApplication) {
      return dispatch(fetchApplication(modulesManager, [`id: "${decodeId(selectedApplication?.id)}"`]));
    }
  }, [open, dispatch, modulesManager, selectedApplication, userType]);

  useEffect(() => {
    if ((userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType===WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO || userType===WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) && officersRaw && Array.isArray(officersRaw)) {
      setFormData((prevData) => ({
        ...prevData,
        userIds: officersRaw.map((o) => o.userId),
      }));
    }
  }, [officersRaw, userType]);

  useEffect(() => {
    if ((userType !== WORKFORCE_USER_TYPE.SECTION_ADMIN  && userType !== WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO && userType !== WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) || !formData?.roleIds || formData.roleIds.length === 0) return;
    dispatch(
      fetchWorkforceUserRoleWiseUser(modulesManager, {
        roleIds: formData.roleIds,
        orderBy: "id",
      }),
    );
  }, [formData.roleIds, dispatch, modulesManager, userType]);

  useEffect(() => {
    if (!open) return;

    dispatch(fetchApplicationPackage(modulesManager, [`organizationType: "eis"`, 'orderBy: ["-meetingDate"]'])).then((response) => {
      const meetings = response?.payload?.data?.workforceApplicationSummary?.edges || [];
      const formattedMeetings = meetings.map((item) => item.node);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const excludedStatuses = ["forward_to_doctor", "approved_by_committee"];

      const filteredMeetings = formattedMeetings.filter((meeting) => {
        if (!meeting?.meetingDate) return false;
        const [year, month, day] = meeting.meetingDate.split("-").map(Number);
        const meetingDate = new Date(year, month - 1, day);
        const diffTime = meetingDate.getTime() - today.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 3 && !excludedStatuses.includes(meeting.status);
      });

      setMeetingList(filteredMeetings);
    });
  }, [open, dispatch, modulesManager]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleForward = async () => {
    const invalidApplication = selectedApplicationIds?.find((app) => app?.applicationType === "disabilityAssistance" && app?.status !== "approved_by_doctor");

    if (invalidApplication) {
      alert("ডাক্তার দ্বারা সুপারিশকৃত ছাড়া স্থায়ী ও আংশিক অক্ষমতা জনিত আর্থিক সহায়তা আবেদন মিটিং এ পাঠানো যাবে না।");
      window.location.href = "/home";
      return;
    }
    if (!formData?.year || !formData?.month) {
      setServerResponse({ status: "ERROR", message: "সকল আবশ্যিক ফিল্ড পূরণ করুন।" });
      return;
    }

    let forwardStatus =
      userType === WORKFORCE_USER_TYPE.SECTION_ADMIN ||
      userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ||
      userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
        ? WORKFORCE_STATUS.MEETING_CREATED
        : WORKFORCE_STATUS.FORWARD_TO_EIS_ADVISOR;
    let forwardAction = "forward_to_comiitee";

    if (userType === WORKFORCE_USER_TYPE.SECTION_ADMIN ||userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ||userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
      if (!formData?.userIds || formData.userIds.length === 0) {
        setServerResponse({ status: "ERROR", message: "অফিসার নির্বাচন করুন!" });
        return;
      }
      const numericRoleIds = roleIds.map((id) => Number(id));
      if (numericRoleIds.includes(47)) {
        forwardStatus = WORKFORCE_STATUS.FORWARD_FOR_VERIFICATION;
        forwardAction = "forward_for_verification";
      } else if (numericRoleIds.includes(49)) {
        forwardStatus = WORKFORCE_STATUS.FORWARD_TO_COMIITEE;
        forwardAction = "forward_to_committee";
      } else {
        setServerResponse({ status: "ERROR", message: "সঠিক রোল আইডি পাওয়া যায়নি!" });
        return;
      }
    }

    setSubmitting(true);
    const ids = selectedApplicationIds.map((obj) => obj.id);
    const createApplicationSummaryData = {
      status: forwardStatus,
      name: formData?.meetingName,
      meetingDate: formData?.meetingDate,
      year: formData?.year,
      month: formData?.month,
      organizationType:
        userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO
          ? "cf"
          : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
            ? "blwf"
            : "eis",
      sectionType: userType === WORKFORCE_USER_TYPE.SECTION_ADMIN ? "section_one" : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ? "section_two" : null,
      applicationData: JSON.stringify(ids),
      userIds: JSON.stringify(formData.userIds),
    };

    const applicationSummeryMutation = formatMutation(
      "createWorkforceApplicationSummary",
      formatApplicationSummaryGQL(createApplicationSummaryData),
      "create workforce application summary",
    );
    const applicationSummeryClientMutationId = applicationSummeryMutation.clientMutationId;

    await dispatch(createApplicationSummary(applicationSummeryMutation, "create workforce application summary"));
    await dispatch(fetchApplicationSummaryByClientMutationId(modulesManager, applicationSummeryClientMutationId)).then((response) => {
      applicationSummaryId = response?.payload?.data?.workforceApplicationSummary?.edges?.[0]?.node?.id;
    });

    if (!applicationSummaryId) {
      setServerResponse({ status: "ERROR", message: "সারাংশ তৈরি ব্যর্থ হয়েছে!" });
      setSubmitting(false);
      return;
    }

    for (const encodedId of selectedApplicationIds) {
      const updateApplicationData = {
        id: decodeId(encodedId?.id),
        ...(userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO
          ? { cfApplicationSummaryId: decodeId(applicationSummaryId) }
          : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
            ? { blwfApplicationSummaryId: decodeId(applicationSummaryId) }
            : { eisApplicationSummaryId: decodeId(applicationSummaryId) }),
        status: forwardStatus,
        ...((userType === WORKFORCE_USER_TYPE.SECTION_ADMIN||userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO || userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) && {
          eisApprovalIds: JSON.stringify(formData.userIds),
          committeeId: safeDecodeId(formData?.committeeIds),
        }),
      };

      await dispatch(updateApplication(updateApplicationData, "update workforce application"));

      if (userType === WORKFORCE_USER_TYPE.SECTION_ADMIN||userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO || userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) {
        for (const userId of formData.userIds) {
          const createApplicationMovementData = {
            applicationId: decodeId(encodedId?.id),
            applicationFromId: loggedInUserId,
            applicationToId: userId,
            status: forwardStatus,
            action: forwardAction,
          };
          await dispatch(createApplicationMovement(createApplicationMovementData, "create workforce movement"));
        }
      } else {
        const createApplicationMovementData = {
          applicationId: decodeId(encodedId?.id),
          status: forwardStatus,
          note: "আবেদন কমিটির কাছে প্রেরণ হয়েছে",
          action: forwardAction,
          applicationFromId: loggedInUserId,
          applicationToId: userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ? 69 : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ? 198 : 196,
          toRoleId: userType === WORKFORCE_USER_TYPE.CHECKER ? 23 : 48,
        };
        await dispatch(createApplicationMovement(createApplicationMovementData, "update workforce movement"));
      }
    }

    setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  };

  const handleSave = async () => {
    if (!formData?.year || !formData?.month) {
      setServerResponse({ status: "ERROR", message: "সকল আবশ্যিক ফিল্ড পূরণ করুন।" });
      return;
    }
    setSubmitting(true);
    const ids = selectedApplicationIds.map((obj) => obj.id);
    const createApplicationSummarySheetData = {
      status:
        userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO || userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
          ? WORKFORCE_STATUS.MEETING_CREATED
          : WORKFORCE_STATUS.MEETING_CREATED,
      name: formData?.meetingName,
      meetingDate: formData?.meetingDate,
      year: Number(formData?.year),
      month: formData?.month,
      organizationType: userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ? "cf" : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN ? "blwf" : "eis",
      sectionType: userType === WORKFORCE_USER_TYPE.SECTION_ADMIN ? "section_one" : userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO ? "section_two" : null,
      applicationData: JSON.stringify(ids),
    };

    const applicationSummeryMutation = formatMutation(
      "createWorkforceApplicationSummary",
      formatApplicationSummaryGQL(createApplicationSummarySheetData),
      "create workforce application summary",
    );
    const applicationSummeryClientMutationId = applicationSummeryMutation.clientMutationId;

    await dispatch(createApplicationSummary(applicationSummeryMutation, "create workforce application summary sheet"));
    await dispatch(fetchApplicationSummaryByClientMutationId(modulesManager, applicationSummeryClientMutationId)).then((response) => {
      applicationSummaryId = response?.payload?.data?.workforceApplicationSummary?.edges?.[0]?.node?.id;
    });

    if (!applicationSummaryId) {
      setServerResponse({ status: "ERROR", message: "সারাংশ তৈরি ব্যর্থ হয়েছে!" });
      setSubmitting(false);
      return;
    }

    for (const encodedId of selectedApplicationIds) {
      const updateApplicationData = {
        id: decodeId(encodedId?.id),
        ...(userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO
          ? { cfApplicationSummaryId: decodeId(applicationSummaryId) }
          : userType === WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN
            ? { blwfApplicationSummaryId: decodeId(applicationSummaryId) }
            : { eisApplicationSummaryId: decodeId(applicationSummaryId) }),
        status: WORKFORCE_STATUS.MEETING_CREATED,
      };
      await dispatch(updateApplication(updateApplicationData, "update workforce application"));
    }

    setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  };

  const handleAddApplication = async (meetingId, meetingStatus) => {
    if (!selectedApplicationIds || selectedApplicationIds.length === 0) {
      setServerResponse({ status: "ERROR", message: "দয়া করে অন্তত একটি আবেদন নির্বাচন করুন।" });
      return;
    }
    setSubmitting(true);
    try {
      for (const encodedId of selectedApplicationIds) {
        const updateData = {
          id: decodeId(encodedId.id),
          eisApplicationSummaryId: decodeId(meetingId),
          status: meetingStatus,
        };
        await dispatch(updateApplication(updateData, "Update application summary"));
      }
      setServerResponse({ status: "SUCCESS", message: "আবেদন সফলভাবে মিটিং এর সাথে যুক্ত হয়েছে।" });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(error);
      setServerResponse({ status: "ERROR", message: "আবেদন মিটিং এর সাথে যুক্ত করতে ব্যর্থ হয়েছে।" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
    return statusMap[status] || status;
  };

  useEffect(() => {
    if (serverResponse?.status === "SUCCESS") {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [serverResponse]);

  console.log({ newwwwwwwww: formData });
  console.log({ roleIds: roleIds });

  return (
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer} onSubmit={handleSubmit}>
        <Button onClick={onClose} className={classes.closeButton}>
          ✕
        </Button>

        <Typography variant="h5" gutterBottom style={{ fontWeight: "bold", marginTop: 3, textAlign: "center" }}>
          <FormattedMessage module="workforce" id="workforce.employee.application.forwardToSelectionOffice" />
        </Typography>

        {serverResponse?.status && (
          <Typography className={classes.responseMessage} style={{ color: serverResponse.status === "SUCCESS" ? "green" : "red" }}>
            {serverResponse.status === "SUCCESS" ? "✅" : "⚠️"} {serverResponse.message}
          </Typography>
        )}

        <Divider style={{ marginBottom: 24 }} />

        <Paper className={classes.sectionPaper} elevation={1}>
          <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: 16 }}>
            <FormattedMessage module="workforce" id="workforce.employee.application.preMeetingList" />
          </Typography>
          <Divider style={{ marginBottom: 16 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: 10 }}>মিটিং নাম</th>
                    <th style={{ padding: 10 }}>বছর</th>
                    <th style={{ padding: 10 }}>মাস</th>
                    <th style={{ padding: 10 }}>মিটিং তারিখ</th>
                    <th style={{ padding: 10 }}>স্ট্যাটাস</th>
                    <th style={{ padding: 10 }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingList?.map((meeting) => (
                    <tr key={meeting.id} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: 10 }}>{meeting.name}</td>
                      <td style={{ padding: 10 }}>{meeting.year}</td>
                      <td style={{ padding: 10 }}>{meeting.month}</td>
                      <td style={{ padding: 10 }}>{meeting.meetingDate}</td>
                      <td style={{ padding: 10 }}>
                        <Typography style={{ background: "#e3f2fd", padding: "4px 10px", borderRadius: 6, display: "inline-block", fontSize: 12 }}>
                          {getStatusDisplay(meeting.status)}
                        </Typography>
                      </td>
                      <td style={{ padding: 10 }}>
                        <Button size="small" variant="contained" color="primary" onClick={() => handleAddApplication(meeting.id, meeting.status)}>
                          <FormattedMessage module="workforce" id="workforce.employee.application.addApplication" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Grid>
          </Grid>
        </Paper>

        <Paper className={classes.sectionPaper} elevation={1}>
          <Grid container spacing={3} style={{ marginTop: 3 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold", marginTop: 3, textAlign: "center" }}>
                <FormattedMessage module="workforce" id="workforce.employee.application.provideMeetingInfo" />
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="বছর"
                variant="outlined"
                required
                value={formData?.year || ""}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="মাস"
                variant="outlined"
                required
                value={formData?.month || ""}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              >
                {["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"].map(
                  (month, index) => (
                    <MenuItem key={index} value={month}>
                      {month}
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="মিটিং এর নাম"
                variant="outlined"
                value={formData?.meetingName || ""}
                onChange={(e) => setFormData({ ...formData, meetingName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} className={classes.item}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label="মিটিং এর তারিখ"
                readOnly={false}
                style={{ fontSize: "1.5rem" }}
                value={formData?.meetingDate || ""}
                onChange={(v) => setFormData({ ...formData, meetingDate: v })}
              />
            </Grid>
          </Grid>
        </Paper>

        {(userType === WORKFORCE_USER_TYPE.SECTION_ADMIN || userType === WORKFORCE_USER_TYPE.SECTION_ADMIN_TWO || userType=== WORKFORCE_USER_TYPE.BLWF_SECTION_ADMIN) && (
          <Paper className={classes.sectionPaper} elevation={1}>
            <Grid container spacing={3} style={{ marginTop: 3 }}>
              <Grid item xs={12} style={{ marginBottom: 16 }}>
                <FormControl fullWidth>
                  <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                    কমিটি নির্বাচন করুন
                  </Typography>
                  <Select
                    multiple
                    displayEmpty
                    value={formData?.roleIds || []}
                    onChange={(e) => {
                      const selectedRoleIds = e.target.value;
                      const selectedCommitteeIds = selectedRoleIds.map((roleId) => ROLE_OPTIONS.find((r) => r.id === roleId)?.committeeId)?.[0];
                      setFormData({ ...formData, roleIds: selectedRoleIds, committeeIds: selectedCommitteeIds, userIds: [] });
                    }}
                    renderValue={(selected) =>
                      ROLE_OPTIONS.filter((r) => selected.includes(r.id))
                        .map((r) => r.name)
                        .join(", ")
                    }
                    MenuProps={{ PaperProps: { style: { backgroundColor: "#fff", color: "#000" } } }}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <Checkbox checked={formData?.roleIds?.includes(role.id) || false} style={{ color: "#000" }} />
                        <Typography>{role.name}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: "bold" }}>
                  কমিটির মেম্বার নির্বাচন করুন
                </Typography>
                <FormControl fullWidth>
                  <Select
                    multiple
                    displayEmpty
                    value={formData?.userIds || []}
                    onChange={(e) => setFormData({ ...formData, userIds: e.target.value })}
                    renderValue={(selected) =>
                      officers
                        .filter((o) => selected.includes(o.userId))
                        .map((o) => o.otherNames)
                        .join(", ")
                    }
                    MenuProps={{ PaperProps: { style: { backgroundColor: "#fff", color: "#000" } } }}
                  >
                    {officers.map((officer) => (
                      <MenuItem key={officer.id} value={officer.userId}>
                        <Checkbox checked={formData?.userIds?.includes(officer.userId) || false} style={{ color: "#000" }} />
                        <Typography>{officer.otherNames}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        <div className={classes.buttonGroup}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            <FormattedMessage module="workforce" id="core.LanguageQuickPicker.dialog.cancel" />
          </Button>
          <Button variant="outlined" color="default" onClick={handleSave} disabled={submitting}>
            <FormattedMessage module="workforce" id="workforce.save" />
          </Button>
          <Button type="button" variant="contained" color="primary" disabled={submitting} onClick={handleForward}>
            <FormattedMessage module="workforce" id="workforce.employee.application.forwardTo" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardApplicationSummaryModal;
