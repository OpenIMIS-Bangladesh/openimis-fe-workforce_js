import { decodeId } from "@openimis/fe-core";
import { WORKFORCE_STATUS } from "../constants";
import { safeDecodeId } from "./utils";

export const forwardToAssociation = async ({
  selectedApplicationIds,
  formData,
  loggedInUserId,
  updateApplication,
  createApplicationMovement,
  dispatch,
  setServerResponse,
}) => {
  try {
    for (const encodedId of selectedApplicationIds) {
      const decodedId = safeDecodeId(encodedId?.id);

      const updateApplicationData = {
        id: decodedId,
        status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
        associationType: formData?.association,
      };

      const createApplicationMovementData = {
        applicationId: decodedId,
        status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
        note: "অ্যাসোসিয়েশনের কাছে প্রেরণ",
        action: "forward_to_association",
        applicationFromId: loggedInUserId,
        applicationToId: 93, // hardcoded target
        toRoleId: 31, // hardcoded role
      };

      // If dispatch is provided (like in a Redux component)
      if (dispatch) {
        await dispatch(
          updateApplication(updateApplicationData, "update workforce application")
        );
        await dispatch(
          createApplicationMovement(
            createApplicationMovementData,
            "create workforce movement"
          )
        );
      } else {
        // Otherwise just call directly
        await updateApplication(updateApplicationData, "update workforce application");
        await createApplicationMovement(createApplicationMovementData, "create workforce movement");
      }
    }

    setServerResponse?.({
      status: "SUCCESS",
      message: "সাবমিশন সফল হয়েছে!",
    });
  } catch (error) {
    console.error("Forward to association failed:", error);
    setServerResponse?.({
      status: "ERROR",
      message: "সাবমিশন ব্যর্থ হয়েছে!",
    });
  }
};

export const revertApplications = async ({
  applications,
  selectedRevertUser,
  editorContent,
  userId,
  updateApplication,
  createApplicationMovement,
  dispatch,
  setServerResponse,
  setSubmitting,
}) => {
  if (!selectedRevertUser) {
    setServerResponse?.({
      status: "ERROR",
      message: "একজন ব্যবহারকারী নির্বাচন করুন!",
    });
    return;
  }

  // Normalize single object -> array
  const appArray = Array.isArray(applications) ? applications : [applications];

  try {
    setSubmitting?.(true);

    for (const app of appArray) {
      const decodedAppId = decodeId(app?.id);
      const decodedRevertUserId = decodeId(selectedRevertUser);

      const updateApplicationData = {
        id: decodedAppId,
        status: WORKFORCE_STATUS.REVERT,
      };

      const createApplicationMovementData = {
        applicationId: decodedAppId,
        status: WORKFORCE_STATUS.REVERT,
        note: "আবেদন ফেরত পাঠানো হয়েছে",
        revertNote: editorContent,
        isReverted: true,
        applicationFromId: userId,
        applicationToId: decodedRevertUserId,
      };

      await dispatch(
        updateApplication(updateApplicationData, "update workforce application")
      );

      await dispatch(
        createApplicationMovement(
          createApplicationMovementData,
          "create workforce movement"
        )
      );
    }

    setServerResponse?.({
      status: "SUCCESS",
      message: "সাবমিশন সফল হয়েছে!",
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("Revert applications failed:", error);
    setServerResponse?.({
      status: "ERROR",
      message: "সাবমিশন ব্যর্থ হয়েছে!",
    });
  } finally {
    setSubmitting?.(false);
  }
};