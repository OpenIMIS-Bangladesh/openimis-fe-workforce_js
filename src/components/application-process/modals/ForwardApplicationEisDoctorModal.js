import React, { useState, useEffect } from "react";
import { Modal, Typography, Button, Grid, Divider, Paper, FormControl, Select, MenuItem, Checkbox, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useModulesManager, decodeId, PublishedComponent, formatMutation, FormattedMessage } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import {
  updateApplication,
  createApplicationMovement,
  fetchWorkforceUserRoleWiseUser,
  createApplicationSummary,
  fetchApplicationSummaryByClientMutationId,
  fetchApplicationPackage,
} from "../../../actions";
import { WORKFORCE_STATUS, WORKFORCE_USER_TYPE, STATUS_MAP_EN, STATUS_MAP_BN } from "../../../constants";
import { getUserTypeFromRights, isBlwfPath, isEisPath } from "../../../utils/utils";
import { formatApplicationSummaryGQL } from "../../../utils/format_gql";

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
  },
  sectionPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
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

const ForwardApplicationEisDoctorModal = ({ open, onClose, selectedApplicationIds, userRights }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  let applicationSummaryId = "";
  const modulesManager = useModulesManager();
  const userType = getUserTypeFromRights(userRights);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);
  const [meetingList, setMeetingList] = useState([]);
  const locale = useSelector((state) => state.core?.locale || "bn");
  const [formData, setFormData] = useState({});
  const [serverResponse, setServerResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const officers = useSelector((state) => state.workforce.roleWiseUsers || []);

  useEffect(() => {
    if (open) {
      setFormData({});
      let roleIds = [];
      if (userType === "eis_coordinator") roleIds = ["53"];
      else roleIds = ["33"];
      if (roleIds.length) {
        dispatch(
          fetchWorkforceUserRoleWiseUser(modulesManager, {
            roleIds,
            orderBy: "id",
          }),
        );
      }
    }
  }, [open, userType]);

  useEffect(() => {
    if (!open) return;

    dispatch(
      fetchApplicationPackage(modulesManager, [
        `organizationType: "${isEisPath() ? "eis" : !isEisPath() && !isBlwfPath() ? "cf" : "blwf"}"`,
        'orderBy: ["-meetingDate"]',
      ]),
    ).then((response) => {
      const meetings = response?.payload?.data?.workforceApplicationSummary?.edges || [];

      const formattedMeetings = meetings.map((item) => item.node);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const includeddStatuses = ["forward_to_doctor"];

      const filteredMeetings = formattedMeetings.filter((meeting) => {
        if (!meeting?.meetingDate) return false;

        // safely parse YYYY-MM-DD
        const [year, month, day] = meeting.meetingDate.split("-").map(Number);
        const meetingDate = new Date(year, month - 1, day);

        // difference in days
        const diffTime = meetingDate.getTime() - today.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        return diffDays >= 3 && includeddStatuses.includes(meeting.status);
      });

      setMeetingList(filteredMeetings);
    });
  }, [open]);

  const handleForward = async (e) => {
    const allowedTypes = isEisPath()
      ? ["disabilityAssistance"]
      : !isEisPath() && !isBlwfPath()
        ? ["medicalAssistance", "disabilityAssistance", "maternityGrant"]
        : ["medicalDonation", "maternityGrant"];

    const invalidApplication = selectedApplicationIds?.find((app) => !allowedTypes.includes(app?.applicationType));

    // const invalidApplication = selectedApplicationIds?.find((app) => app?.applicationType !== "disabilityAssistance");

    if (invalidApplication) {
      alert("আবেদনটি মিটিং এ পাঠানোর জন্য উপযুক্ত নয়, শুধুমাত্র স্থায়ী ও আংশিক অক্ষমতা জনিত আর্থিক সহায়তা আবেদন মিটিং এ পাঠানো যাবে।");
      window.location.href = "/home";
      return;
    }
    e.preventDefault();
    try {
      setSubmitting(true);

      if (!formData?.userIds?.length) {
        setServerResponse({ status: "ERROR", message: "ডক্টর নির্বাচন করুন!" });
        return;
      }
      if (!formData?.year || !formData?.month || !formData?.meetingDate) {
        setServerResponse({ status: "ERROR", message: "মিটিং এর তথ্য পূরণ করুন!" });
        return;
      }

      const ids = selectedApplicationIds.map((obj) => decodeId(obj.id));

      // ===== Create Meeting Summary =====
      const createApplicationSummaryData = {
        status: WORKFORCE_STATUS.FORWARD_TO_DOCTOR,
        name: formData?.meetingName,
        meetingDate: formData?.meetingDate,
        year: Number(formData?.year),
        month: formData?.month,
        organizationType: isEisPath() ? "eis" : !isEisPath() && !isBlwfPath() ? "cf" : "blwf",
        sectionType: "",
        applicationData: JSON.stringify(ids),
      };

      console.log("createApplicationSummaryData", createApplicationSummaryData);

      const applicationSummeryMutation = formatMutation(
        "createWorkforceApplicationSummary",
        formatApplicationSummaryGQL(createApplicationSummaryData),
        "create workforce application summary",
      );
      const applicationSummeryClientMutationId = applicationSummeryMutation.clientMutationId;
      await dispatch(createApplicationSummary(applicationSummeryMutation, "create workforce application summary"));
      await dispatch(fetchApplicationSummaryByClientMutationId(modulesManager, applicationSummeryClientMutationId)).then((response) => {
        applicationSummaryId = response?.payload?.data?.workforceApplicationSummary?.edges?.[0]?.node?.id;
        console.log({ applicationSummaryId });
      });
      // console.log(decodeId(applicationSummaryId))
      if (!applicationSummaryId) {
        setServerResponse({ status: "ERROR", message: "সারাংশ তৈরি ব্যর্থ হয়েছে!" });
        return;
      }

      // ===== Forward to Doctor =====
      for (const applicationId of ids) {
        await dispatch(
          updateApplication(
            {
              id: applicationId,
              status: WORKFORCE_STATUS.FORWARD_TO_DOCTOR,
              ...(isEisPath()
                ? {
                    eisApplicationSummaryId: decodeId(applicationSummaryId),
                  }
                : !isEisPath() && isBlwfPath()
                  ? {
                      blwfApplicationSummaryId: decodeId(applicationSummaryId),
                    }
                  : {
                      cfApplicationSummaryId: decodeId(applicationSummaryId),
                    }),
            },
            "update workforce application",
          ),
        );

        for (const userId of formData.userIds) {
          await dispatch(
            createApplicationMovement(
              {
                applicationId,
                applicationFromId: loggedInUserId,
                applicationToId: userId,
                status: WORKFORCE_STATUS.FORWARD_TO_DOCTOR,
                action: "forward_to_doctor",
                note: "ডক্টরের কাছে প্রেরণ",
              },
              "create workforce movement",
            ),
          );
        }
      }

      setServerResponse({
        status: "SUCCESS",
        message: "মিটিং তৈরি ও ডক্টরের কাছে পাঠানো হয়েছে!",
      });
    } catch (err) {
      console.error(err);
      setServerResponse({ status: "ERROR", message: "প্রক্রিয়া ব্যর্থ হয়েছে!" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddApplication = async (meetingId, meetingStatus) => {
    if (!selectedApplicationIds || selectedApplicationIds.length === 0) {
      setServerResponse({
        status: "ERROR",
        message: "দয়া করে অন্তত একটি আবেদন নির্বাচন করুন।",
      });
      return;
    }

    setSubmitting(true);

    try {
      for (const encodedId of selectedApplicationIds) {
        const updateData = {
          id: decodeId(encodedId.id),
          status: meetingStatus,
          // eisApplicationSummaryId: decodeId(meetingId),
          ...(isEisPath()
            ? {
                eisApplicationSummaryId: decodeId(meetingId),
              }
            : !isEisPath() && isBlwfPath()
              ? {
                  blwfApplicationSummaryId: decodeId(meetingId),
                }
              : {
                  cfApplicationSummaryId: decodeId(meetingId),
                }),
        };

        await dispatch(updateApplication(updateData, "Update application summary"));
      }

      setServerResponse({
        status: "SUCCESS",
        message: "আবেদন সফলভাবে মিটিং এর সাথে যুক্ত হয়েছে।",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(error);
      setServerResponse({
        status: "ERROR",
        message: "আবেদন মিটিং এর সাথে যুক্ত করতে ব্যর্থ হয়েছে।",
      });
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
      setTimeout(() => window.location.reload(), 1000);
    }
  }, [serverResponse]);

  return (
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer} onSubmit={handleForward}>
        <Button onClick={onClose} className={classes.closeButton}>
          ✕
        </Button>

        <Typography variant="h5" style={{ fontWeight: "bold", textAlign: "center" }}>
          কর্মবন্টন (মিটিং + ডক্টর)
        </Typography>

        {serverResponse?.status && (
          <Typography className={classes.responseMessage} style={{ color: serverResponse.status === "SUCCESS" ? "green" : "red" }}>
            {serverResponse.status === "SUCCESS" ? "✅" : "⚠️"} {serverResponse.message}
          </Typography>
        )}

        <Divider style={{ marginBottom: 24 }} />

        {/* show previous meeting list */}
        <Paper className={classes.sectionPaper} elevation={1}>
          <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: 16 }}>
            <FormattedMessage module="workforce" id="workforce.employee.application.preMeetingList" />
          </Typography>

          <Divider style={{ marginBottom: 16 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
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
                  {meetingList?.map((meeting, index) => (
                    <tr key={meeting.id} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: 10 }}>{meeting.name}</td>
                      <td style={{ padding: 10 }}>{meeting.year}</td>
                      <td style={{ padding: 10 }}>{meeting.month}</td>
                      <td style={{ padding: 10 }}>{meeting.meetingDate}</td>

                      <td style={{ padding: 10 }}>
                        <Typography
                          style={{
                            background: "#e3f2fd",
                            padding: "4px 10px",
                            borderRadius: 6,
                            display: "inline-block",
                            fontSize: 12,
                          }}
                        >
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

        {/* ===== Meeting Info ===== */}
        <Paper className={classes.sectionPaper}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold", textAlign: "center" }}>
                মিটিং এর তথ্য
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Select fullWidth value={formData.year || ""} onChange={(e) => setFormData({ ...formData, year: e.target.value })} displayEmpty>
                <MenuItem value="">বছর নির্বাচন করুন</MenuItem>
                {[...Array(21)].map((_, i) => {
                  const y = 2020 + i;
                  return (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  );
                })}
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Select fullWidth value={formData.month || ""} onChange={(e) => setFormData({ ...formData, month: e.target.value })} displayEmpty>
                <MenuItem value="">মাস নির্বাচন করুন</MenuItem>
                {["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"].map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="মিটিং এর নাম"
                variant="outlined"
                value={formData.meetingName || ""}
                onChange={(e) => setFormData({ ...formData, meetingName: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <PublishedComponent
                pubRef="workforce.DatePicker"
                label="মিটিং এর তারিখ"
                value={formData.meetingDate || ""}
                onChange={(v) => setFormData({ ...formData, meetingDate: v })}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* ===== Doctor Select ===== */}
        {/* ===== Doctor Select (OLD UI, SAME COLOR) ===== */}
        <Paper className={classes.sectionPaper} elevation={1}>
          <Grid container spacing={3} style={{ marginTop: 3 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              style={{
                fontWeight: "bold",
                marginTop: 3,
                textAlign: "center",
              }}
            >
              ডক্টর নির্বাচন করুন
            </Typography>

            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={formData?.userIds || []}
                  onChange={(e) => setFormData({ ...formData, userIds: e.target.value })}
                  renderValue={(selected) =>
                    officers
                      .filter((officer) => selected.includes(officer.userId))
                      .map((officer) => officer.otherNames)
                      .join(", ")
                  }
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: "#fff",
                        color: "#000",
                      },
                    },
                  }}
                >
                  {officers.map((officer) => (
                    <MenuItem key={officer.id} value={officer.userId}>
                      <Checkbox checked={formData?.userIds?.includes(officer.userId)} style={{ color: "#000" }} />
                      <Typography style={{ color: "#000" }}>{officer.otherNames}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <div className={classes.buttonGroup}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            বাতিল
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? "প্রসেসিং..." : "মিটিং তৈরি ও ফরওয়ার্ড"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ForwardApplicationEisDoctorModal;
