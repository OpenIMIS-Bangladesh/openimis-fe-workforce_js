import { decodeId } from "@openimis/fe-core";
import { WORKFORCE_STATUS, WORKFORCE_USER_TYPE } from "../constants";
import { getUserTypeFromRights, safeDecodeId } from "./utils";

export const forwardToAssociation = async ({
  selectedApplicationIds,
  formData,
  loggedInUserId,
  updateApplication,
  createApplicationMovement,
  dispatch,
  setServerResponse,
  userRights
}) => {
  try {
    const userType = getUserTypeFromRights(userRights);
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
        applicationToId: formData?.association === "BGMEA"
                          ? 93
                          : formData?.association === "BKMEA"
                          ? 193
                          : formData?.association === "BEPZA"
                          ? 219
                          : formData?.association === "LFMEAB"
                          ? 203
                          : null,
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
  userRights
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
        const userType = getUserTypeFromRights(userRights);
        await Promise.all(
          selectedApplicationIds.map(async (selectedItem) => {
            const decodedId = safeDecodeId(selectedItem?.id);
            const updateApplicationData = {
              id: decodedId,
              status:  userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
                ? WORKFORCE_STATUS.FORWARD_TO_CF_SECTION
                : userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                ? WORKFORCE_STATUS.FORWARD_TO_EIS_COORDINATOR
                : null,
            };
            const createApplicationMovementData = {
              applicationId: decodedId,
               status:  userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
                ? WORKFORCE_STATUS.FORWARD_TO_CF_SECTION
                : userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                ? WORKFORCE_STATUS.FORWARD_TO_EIS_COORDINATOR
                : null,       

              note: "আবেদন শাখায় প্রেরণ করা হয়েছে",
              action: userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
                          ? "forward_to_cf_section"
                          : userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                          ? "forward_to_eis_coordinator"
                          : null,
              applicationFromId: loggedInUserId,
              applicationToId: userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION || WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
                          ? 139
                          : userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION || userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                          ? 194
                          : null,
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

export const handleBulkSelectedByCheckerLogic = async ({
  selectedApplicationIds,
  loggedInUserId,
  userRights,
  fetchWorkforceDocument,
  updateApplication,
  createApplicationMovement,
  setServerResponse,
  setConfirmModalOpen,
  setConfirmModalMessage,
  setConfirmModalCallback,
  modulesManager,
}) => {
  const userType = getUserTypeFromRights(userRights);
  let confirmModalMessage = "";

  if (
    userType === WORKFORCE_USER_TYPE.CHECKER ||
    userType === WORKFORCE_USER_TYPE.CHECKER_TWO ||
    userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE ||
    userType === WORKFORCE_USER_TYPE.BLWF_CHECKER ||
    userType === WORKFORCE_USER_TYPE.SEC1_DEPUTI_ASST_DIRECTOR ||
    userType === WORKFORCE_USER_TYPE.SEC2_DEPUTI_ASST_DIRECTOR ||
    userType === WORKFORCE_USER_TYPE.BLWF_DEPUTI_ASST_DIRECTOR
  ) {
    confirmModalMessage = "workforce.application.forward.message.toSectionAdmin";
  } else if (userType === WORKFORCE_USER_TYPE.EIS_OFFICER) {
    confirmModalMessage = "workforce.application.forward.message.toEisCoordinator";
  }

  if (!selectedApplicationIds?.length) {
    setServerResponse({
      status: "ERROR",
      message: "Please select at least one application.",
    });
    return;
  }

  // 🧠 open modal confirmation
  setConfirmModalMessage(confirmModalMessage);
  setConfirmModalOpen(true);

  setConfirmModalCallback(async (confirmed) => {
    if (!confirmed) {
      setConfirmModalOpen(false);
      return;
    }
 
    try {
      for (const selectedItem of selectedApplicationIds) {
        const decodedId = decodeId(selectedItem?.id);
        const res = await fetchWorkforceDocument(modulesManager, [
          `workforceApplication_Id: "${decodedId}"`,
        ]);

        const documents =
          res?.payload?.data?.workforceDocuments?.edges?.map((edge) => edge.node) ?? [];

        const allVerified = documents.every(
          (doc) => doc.status?.toLowerCase() === "verified"
        );

        if (!allVerified) {
          setServerResponse({
            status: "ERROR",
            message: "অনুগ্রহ করে সমস্ত নথি যাচাই করুন",
          });
          return;
        }

        const updateApplicationData = {
          id: decodedId,
          status:
            userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
              ? WORKFORCE_STATUS.VERIFIED_BY_DOL_DIFE
              : WORKFORCE_STATUS.VERIFIED,
        };

        const createApplicationMovementData = {
          applicationId: decodedId,
          status:
            userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
              ? WORKFORCE_STATUS.VERIFIED_BY_DOL_DIFE
              : WORKFORCE_STATUS.VERIFIED,
          note: "আবেদন যাচাইকৃত হয়েছে",
          action: "verified",
          applicationFromId: loggedInUserId,
          applicationToId:
            userType === WORKFORCE_USER_TYPE.CHECKER
              ? 139
              : userType === WORKFORCE_USER_TYPE.BLWF_CHECKER ||
                userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
              ? 187
              : null,
          toRoleId:
            userType === WORKFORCE_USER_TYPE.CHECKER
              ? 32
              : userType === WORKFORCE_USER_TYPE.BLWF_CHECKER ||
                userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
              ? 40
              : 42,
        };

        await updateApplication(updateApplicationData, "update workforce application");
        await createApplicationMovement(
          createApplicationMovementData,
          "create workforce movement"
        );
      }

      setServerResponse({
        status: "SUCCESS",
        message: "সফলভাবে ফরওয়ার্ড করা হয়েছে!",
      });
    } catch (error) {
      console.error("Bulk selection failed:", error);
      setServerResponse({
        status: "ERROR",
        message: "ফরওয়ার্ড ব্যর্থ হয়েছে",
      });
    } finally {
      setConfirmModalOpen(false);
      setConfirmModalCallback(null);
    }
  });
};