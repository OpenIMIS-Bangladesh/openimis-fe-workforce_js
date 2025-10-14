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

export async function handleBulkSelectedByAssociationLogic({
  selectedApplicationIds,
  loggedInUserId,
  updateApplication,
  createApplicationMovement,
  setServerResponse,
  setConfirmModalOpen,
  setConfirmModalMessage,
  setConfirmModalCallback,
}) {
  if (!selectedApplicationIds || selectedApplicationIds.length === 0) {
    alert("Please select at least one application.");
    return;
  }

  setConfirmModalOpen(true);
  setConfirmModalMessage("workforce.application.forward.message.toSectionAdmin");

  setConfirmModalCallback(async (confirmed) => {
    if (confirmed) {
      try {
        await Promise.all(
          selectedApplicationIds.map(async (selectedItem) => {
            const decodedId = safeDecodeId(selectedItem?.id);
            const updateApplicationData = {
              id: decodedId,
              status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION,
            };
            const createApplicationMovementData = {
              applicationId: decodedId,
              status: WORKFORCE_STATUS.FORWARD_TO_CF_SECTION,
              note: "আবেদন সিএফ শাখায় প্রেরণ করা হয়েছে",
              action: "forward_to_cf_section",
              applicationFromId: loggedInUserId,
              applicationToId: 139,
              toRoleId: 32,
            };

            await updateApplication(
              updateApplicationData,
              "update workforce application"
            );
            await createApplicationMovement(
              createApplicationMovementData,
              "create workforce movement"
            );
          })
        );

        setServerResponse({
          status: "SUCCESS",
          message: "আবেদনসমূহ সফলভাবে নির্বাচন করা হয়েছে!",
        });
      } catch (error) {
        console.error("Bulk selection failed:", error);
        setServerResponse({
          status: "ERROR",
          message: "একাধিক আবেদন নির্বাচন ব্যর্থ হয়েছে!",
        });
      } finally {
        window.location.reload();
      }
    }

    // always close the modal
    setConfirmModalOpen(false);
    setConfirmModalCallback(null);
  });
}