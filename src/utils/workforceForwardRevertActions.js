import { decodeId,useHistory } from "@openimis/fe-core";
import { WORKFORCE_STATUS, WORKFORCE_USER_TYPE } from "../constants";
import { getUserTypeFromRights, isEisPath, safeDecodeId } from "./utils";
import { fetchApplicationFactoryAssociation, fetchUsersByRoleId, fetchWorkforceAssociationUserMaps, fetchWorkforceOtherCompensation, fetchWorkforceUserRoleWiseUser } from "../actions";
import { useState } from "react";

export const forwardToAssociation = async ({
  selectedApplicationIds,
  formData,
  loggedInUserId,
  updateApplication,
  createApplicationMovement,
  dispatch,
  setServerResponse,
  userRights,
  fetchWorkforceDocument,
  modulesManager
}) => {
  try {
    const userType = getUserTypeFromRights(userRights);
    const id =selectedApplicationIds[0]?.id
    let fetchOtherCompensation
    dispatch(fetchWorkforceOtherCompensation(modulesManager, [`workforceApplicationId:"${id}"`]))
            .then((res) => {
              fetchOtherCompensation = parseData(res?.payload?.data?.workforceOtherCompensationInfo);
              console.log({fetchOtherCompensation});
              // if (fetchOtherCompensation && fetchOtherCompensation.length > 0) {
              //   setFormData(fetchOtherCompensation);
              // } else {
              //   // If empty array or null, reset to initial entry
              //   setFormData([{ ...initialEntry }]);
              // }
            })
    for (const selectedItem of selectedApplicationIds) {

        const decodedId = safeDecodeId(selectedItem?.id);
        const res = await dispatch(
          fetchWorkforceDocument(modulesManager, [
            `workforceApplication_Id: "${decodedId}"`,
          ])
        );

        const workforceApplicationRes = await dispatch(
          fetchApplicationFactoryAssociation(decodedId)
        );

        const workforceApplication = workforceApplicationRes?.payload?.data?.workforceApplication?.edges[0]?.node;
        let associationType = workforceApplication?.employeeFactory?.allAssociation?.shortNameEn??"";
        let associationId = safeDecodeId(workforceApplication?.employeeFactory?.allAssociation?.id);
        console.log("associationType", associationType)
        const userToResp = await dispatch(fetchWorkforceAssociationUserMaps([`allAssociationId: "${associationId}"`]));
        const applicationToUser= safeDecodeId(userToResp?.payload?.data?.workforceAssociationUserMap?.edges[0]?.node?.user.id);
        console.log("applicationToUser", applicationToUser)

        const documents =
          res?.payload?.data?.workforceDocuments?.edges?.map((edge) => edge.node) ?? [];

        const allVerified = documents.every((doc) => {
        const status = doc.status?.toLowerCase();

        if (doc.holderType === "applicant") {
          return status === "verified";
        }

        if (doc.holderType === "factoryAdmin") {
          return status !== "verified";
        }
        return true;
      });

        if (!allVerified) {
          setServerResponse({
            status: "ERROR",
            message: "অনুগ্রহ করে সমস্ত নথি যাচাই করুন",
          });
          return;
        }
      const updateApplicationData = {
        id: decodedId,
        status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
        associationType: associationType,
        // associationType: formData?.association,
      };

      const createApplicationMovementData = {
        applicationId: decodedId,
        status: WORKFORCE_STATUS.FORWARD_TO_ASSOCIATION,
        note: "অ্যাসোসিয়েশনের কাছে প্রেরণ",
        action: "forward_to_association",
        applicationFromId: loggedInUserId,
        // applicationToId: formData?.association === "BGMEA"
        //           ? 93
        //           : formData?.association === "BKMEA"
        //           ? 276
        //           : formData?.association === "BEPZA"
        //           ? 219
        //           : formData?.association === "LFMEAB"
        //           ? 203
        //           : null,
        // applicationToId: associationType === "BGMEA"
        //                   ? 93
        //                   : associationType === "BKMEA"
        //                   ? 276
        //                   : associationType === "BEPZA"
        //                   ? 219
        //                   : associationType === "LFMEAB"
        //                   ? 203
        //                   : null,
        applicationToId: applicationToUser,
        toRoleId: 31,
      };

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
        // if(isEisPath())
        // {
        //   console.log("Workforce Employee Dependent Eligibility updated for application ID:", decodeId);
        //   await dispatch(updateWorkforceEmployeeDependentEligibility(decodeId));
        // }
      } else {
        // Otherwise just call directly
        await updateApplication(updateApplicationData, "update workforce application");
        await createApplicationMovement(createApplicationMovementData, "create workforce movement");
        // if(isEisPath())
        // {
        //   console.log("Workforce Employee Dependent Eligibility updated for application ID:", decodeId);
        //   await updateWorkforceEmployeeDependentEligibility(decodeId);
        // }
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

export const handleBulkSelectedByAssociationLogic = async ({
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
    !isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
      //   userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
  //   userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
  ) {
    confirmModalMessage = "workforce.application.forward.message.toSectionAdmin";
  } else if (
    isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
    // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
    // userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
  ) {
    confirmModalMessage = "workforce.application.forward.message.toEisCoordinator";
  }

  if (!selectedApplicationIds?.length) {
    setServerResponse({
      status: "ERROR",
      message: "Please select at least one application.",
    });
    return;
  }

  setConfirmModalMessage(confirmModalMessage);
  setConfirmModalOpen(true);

  setConfirmModalCallback(async (confirmed) => {
    if (!confirmed) {
      setConfirmModalOpen(false);
      return;
    }

    try {
      for (const selectedItem of selectedApplicationIds) {
        const decodedId = safeDecodeId(selectedItem?.id);

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

        console.log("documents porjnto aise");
        const applicationToResp= await fetchUsersByRoleId([isEisPath()? "46" : "32"]);
        const applicationToUser = safeDecodeId(applicationToResp?.payload?.data?.workforceUserRole[0]?.userId);

        const updateApplicationData = {
          id: decodedId,
          status:
            // userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            // userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
              !isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              ? WORKFORCE_STATUS.FORWARD_TO_CF_SECTION
              : 
              // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
              //   userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              ? WORKFORCE_STATUS.FORWARD_TO_EIS_COORDINATOR
              : null,
        };

        const createApplicationMovementData = {
          applicationId: decodedId,
          status:
            // userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            // userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
              !isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              ? WORKFORCE_STATUS.FORWARD_TO_CF_SECTION
              : 
              // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
              // userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              ? WORKFORCE_STATUS.FORWARD_TO_EIS_COORDINATOR
              : null,
          note: "আবেদন শাখায় প্রেরণ করা হয়েছে",
          action:
            // userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            // userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
              !isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              ? "forward_to_cf_section"
              : 
              // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
              // userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
                isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              ? "forward_to_eis_coordinator"
              : null,
          applicationFromId: loggedInUserId,
          applicationToId: applicationToUser,
            // userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            // userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
              // !isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              // ? 139
              // : 
                // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
                // userType === WORKFORCE_USER_TYPE.LFMEAB_ASSOCIATION
              //   isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              // ? 194
              // : null,
          toRoleId: isEisPath()? 46 : 32,
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
     setTimeout(() => {
        window.location.reload();
      }, 200);
      setConfirmModalOpen(false);
      setConfirmModalCallback(null);
    }
  });
};

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
  history
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
        const decodedId = safeDecodeId(selectedItem?.id);
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
              ? 187 : userType === WORKFORCE_USER_TYPE.EIS_OFFICER ? 194
              : null,
          toRoleId:
            userType === WORKFORCE_USER_TYPE.CHECKER
              ? 32 : userType === WORKFORCE_USER_TYPE.EIS_OFFICER ? 47
              : userType === WORKFORCE_USER_TYPE.BLWF_CHECKER ||
                userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
              ? 40
              : null,
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
      history.push("/home");
      setConfirmModalOpen(false);
      setConfirmModalCallback(null);
    }
  });
};

 export const handleApprovalByDoctor = async ({
  selectedApplicationIds,
  loggedInUserId,
  userRights,
  updateApplication,
  createApplicationMovement,
  setServerResponse,
  setConfirmModalOpen,
  setConfirmModalMessage,
  setConfirmModalCallback,
  modulesManager,
  history,
  editedGrantMoney
}) => {

  const userType = getUserTypeFromRights(userRights);

  let confirmModalMessage =
    "workforce.application.doctor.approve.message";

  if (!selectedApplicationIds?.length) {
    setServerResponse({
      status: "ERROR",
      message: "Please select at least one application.",
    });
    return;
  }

  setConfirmModalMessage(confirmModalMessage);
  setConfirmModalOpen(true);

  setConfirmModalCallback(async (confirmed) => {
    if (!confirmed) {
      setConfirmModalOpen(false);
      return;
    }

    try {
      for (const selectedItem of selectedApplicationIds) {

        const decodedId = safeDecodeId(selectedItem?.id);

        const updateApplicationData = {
          id: decodedId,
          status: WORKFORCE_STATUS.APPROVED_BY_DOCTOR,
          grantAmount: editedGrantMoney,
        };

        const createApplicationMovementData = {
          applicationId: decodedId,
          status: WORKFORCE_STATUS.APPROVED_BY_DOCTOR,
          note: "আবেদন ডাক্তার দ্বারা অনুমোদন করা হয়েছে",
          action: "approved_by_doctor",
          applicationFromId: loggedInUserId,

          applicationToId:
            userType === WORKFORCE_USER_TYPE.DOCTOR
              ? 139
              : userType === WORKFORCE_USER_TYPE.BLWF_DOCTOR
              ? 187
              : userType === WORKFORCE_USER_TYPE.EIS_DOCTOR
              ? 173
              : null,

          toRoleId:
            userType === WORKFORCE_USER_TYPE.DOCTOR
              ? 32
              : userType === WORKFORCE_USER_TYPE.BLWF_DOCTOR
              ? 40
              : userType === WORKFORCE_USER_TYPE.EIS_DOCTOR
              ? 42
              : null,
        };

        await updateApplication(
          updateApplicationData,
          "update workforce application"
        );

        await createApplicationMovement(
          createApplicationMovementData,
          "create workforce movement"
        );
      }

      setServerResponse({
        status: "SUCCESS",
        message: "আবেদনসমূহ সফলভাবে অনুমোদন করা হয়েছে!",
      });

    } catch (error) {
      console.error("Bulk doctor approval failed:", error);

      setServerResponse({
        status: "ERROR",
        message: "আবেদন অনুমোদন ব্যর্থ হয়েছে!",
      });
    } finally {
      history.push("/home");
      setConfirmModalOpen(false);
      setConfirmModalCallback(null);
    }
  });
};

export const handleApprovalByEisCommittee = async ({
  selectedApplicationIds,
  loggedInUserId,
  updateApplication,
  setServerResponse,
  setConfirmModalOpen,
  setConfirmModalMessage,
  setConfirmModalCallback,
  history,
}) => {

  let confirmModalMessage =
    "workforce.application.forward.message.toEisCoordinator";

  if (!selectedApplicationIds?.length) {
    setServerResponse({
      status: "ERROR",
      message: "Please select at least one application.",
    });
    return;
  }

  setConfirmModalMessage(confirmModalMessage);
  setConfirmModalOpen(true);

  setConfirmModalCallback(async (confirmed) => {
    if (!confirmed) {
      setConfirmModalOpen(false);
      return;
    }

    try {

      for (const selectedItem of selectedApplicationIds) {

        const decodedId = safeDecodeId(selectedItem?.id);

        const approvalUserIds = selectedItem?.eisApprovalIds
          ? safeParse(selectedItem?.eisApprovalIds)
          : [];

        let approvedUserIds = selectedItem?.eisApprovedByIds
          ? safeParse(selectedItem?.eisApprovedByIds)
          : [];

        if (approvedUserIds.includes(loggedInUserId)) {
          setServerResponse({
            status: "ERROR",
            message: "আপনি ইতিমধ্যে এই আবেদনটি অনুমোদন করেছেন!",
          });
          return;
        }

        approvedUserIds.push(loggedInUserId);

        const totalApprovers =
          approvalUserIds?.length > 0 ? approvalUserIds.length : 1;

        const totalApproved =
          approvedUserIds?.length > 0 ? approvedUserIds.length : 0;

        const majorityApproved =
          totalApprovers > 0
            ? totalApproved / totalApprovers > 0.5
            : true;

        const updateApplicationData = {
          id: decodedId,
          status: majorityApproved
            ? WORKFORCE_STATUS.APPROVED_BY_COMMITTEE
            : selectedItem?.status,
          eisApprovedByIds: JSON.stringify(approvedUserIds),
        };

        await updateApplication(
          updateApplicationData,
          "update workforce application"
        );
      }

      setServerResponse({
        status: "SUCCESS",
        message:
          "নির্বাচিত আবেদনগুলোর জন্য আপনার অনুমোদন গৃহীত হয়েছে। মেজরিটি পূর্ণ হলে আবেদন অনুমোদিত হবে।",
      });

    } catch (error) {
      console.error("Bulk committee approval failed:", error);

      setServerResponse({
        status: "ERROR",
        message: "আবেদন অনুমোদন ব্যর্থ হয়েছে!",
      });
    } finally {
      history.push("/home");
      setConfirmModalOpen(false);
      setConfirmModalCallback(null);
    }
  });
};