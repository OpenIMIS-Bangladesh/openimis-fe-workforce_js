import { decodeId, useHistory, parseData } from "@openimis/fe-core";
import { WORKFORCE_DOCUMENT_STATUS, WORKFORCE_STATUS, WORKFORCE_USER_TYPE } from "../constants";
import { getUserTypeFromRights, isEisPath, safeDecodeId, safeParse } from "./utils";
import {
  fetchApplication,
  fetchApplicationFactoryAssociation,
  fetchUsersByRoleId,
  fetchWorkforceAssociationUserMaps,
  fetchWorkforceOtherCompensation,
  fetchWorkforceUserRoleWiseUser,
  createApplicationMovement,
  updateApplicationSummary,
} from "../actions";
import {} from "../actions";
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
  modulesManager,
  roles,
}) => {
  try {
    const userType = getUserTypeFromRights(userRights);
    const id = selectedApplicationIds[0]?.id;

    // Await the fetch so data is ready before checks/loops
    const res = await dispatch(fetchApplication(modulesManager, [`id: "${safeDecodeId(id)}"`]));
    const fetchApplicationById = parseData(res?.payload?.data?.workforceApplication)?.[0];
    console.log({ fetchApplicationById });

    // Safe double-parse and check for empty accident info
    let hasAccidentInfo = false;
    if (fetchApplicationById?.employeeAccidentInfo) {
      try {
        const parsedOnce = JSON.parse(fetchApplicationById.employeeAccidentInfo);
        const parsedTwice = JSON.parse(parsedOnce);
        // Check if it's a non-empty object (handles {} or null-like after parse)
        hasAccidentInfo = parsedTwice && typeof parsedTwice === "object" && Object.keys(parsedTwice).length > 0;
      } catch (e) {
        console.warn("Failed to parse employeeAccidentInfo:", e);
        // Treat parse failure as empty/missing
        hasAccidentInfo = false;
      }
    }

    // The check you want: if eis and no accident info, error and return
    if (fetchApplicationById?.organizationType === "eis" && !hasAccidentInfo) {
      setServerResponse({
        status: "ERROR",
        message: "দুর্ঘটনার তথ্য ফর্মটি পূরণ করুন।",
      });
      return;
    }

    // Now proceed with the loop (documents, etc.)
    for (const selectedItem of selectedApplicationIds) {
      const decodedId = safeDecodeId(selectedItem?.id);
      const res = await dispatch(fetchWorkforceDocument(modulesManager, [`workforceApplication_Id: "${decodedId}"`]));

      const workforceApplicationRes = await dispatch(fetchApplicationFactoryAssociation(decodedId));

      const workforceApplication = workforceApplicationRes?.payload?.data?.workforceApplication?.edges[0]?.node;
      let associationType = workforceApplication?.employeeFactory?.allAssociation?.shortNameEn ?? "";
      let associationId = safeDecodeId(workforceApplication?.employeeFactory?.allAssociation?.id);
      console.log("associationType", associationType);
      const userToResp = await dispatch(fetchWorkforceAssociationUserMaps([`allAssociationId: "${associationId}"`]));
      const applicationToUser = safeDecodeId(userToResp?.payload?.data?.workforceAssociationUserMap?.edges[0]?.node?.user.id);
      console.log("applicationToUser", applicationToUser);

      const documents = res?.payload?.data?.workforceDocuments?.edges?.map((edge) => edge.node) ?? [];

      const allVerified = documents
        ?.filter((doc) => doc?.workforceDocumentType?.mandatoryForApplicant === true)
        ?.every((doc) => {
          const documentMapData = parseData(doc?.workforceDocumentMapDocumentId);
          console.log({ documentMapData }); // Keep for debugging
          const status = documentMapData?.find((mapdata) => {
            const decodedRoleId = safeDecodeId(mapdata?.verifiedByRole?.id);
            const roleMatch = decodedRoleId === roles[0]?.roleId;
            const statusMatch = mapdata?.status === WORKFORCE_DOCUMENT_STATUS.FACTORY_ADMIN_VERIFIED;
            console.log("Decoded verifiedByRole.id:", decodedRoleId);
            console.log("roles[0]?.id:", roles[0]?.roleId);
            console.log("Role match:", roleMatch);
            console.log("Status match:", statusMatch);
            console.log("Mapdata status:", mapdata?.status);
            return roleMatch && statusMatch;
          });
          console.log({ status }); // Keep for debugging

          if (doc.holderType === "applicant") {
            return !!status; // Only pass if status exists (verified)
          }
          if (doc.holderType === "factoryAdmin") {
            return true; // Always pass (as per current logic)
          }
          return true; // Pass for other types
        });

      // Document check (removed the bad extra condition)
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
        await dispatch(updateApplication(updateApplicationData, "update workforce application"));
        await dispatch(createApplicationMovement(createApplicationMovementData, "create workforce movement"));
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
  fetchUsersByRoleId,
  roles,
  setServerResponse,
  setConfirmModalOpen,
  setConfirmModalMessage,
  setConfirmModalCallback,
  modulesManager,
}) => {
  const userType = getUserTypeFromRights(userRights);
  let confirmModalMessage = "";

  if (
    !isEisPath() &&
    WORKFORCE_USER_TYPE.ASSOCIATION
    //   userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
    //   userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
  ) {
    confirmModalMessage = "workforce.application.forward.message.toSectionAdmin";
  } else if (
    isEisPath() &&
    WORKFORCE_USER_TYPE.ASSOCIATION
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
        console.log({ applicationFormActions: selectedItem });
        const decodedId = safeDecodeId(selectedItem?.id);

        const res = await fetchWorkforceDocument(modulesManager, [`workforceApplication_Id: "${decodedId}"`]);

        const documents = res?.payload?.data?.workforceDocuments?.edges?.map((edge) => edge.node) ?? [];

        const allVerified = documents
          ?.filter((doc) => doc?.workforceDocumentType?.mandatoryForApplicant === false && doc?.documentType === "Copy of online database of deceased workers")
          ?.every((doc) => {
            const documentMapData = parseData(doc?.workforceDocumentMapDocumentId);
            console.log({ documentMapData }); // Keep for debugging
            const status = documentMapData?.find((mapdata) => {
              const decodedRoleId = safeDecodeId(mapdata?.verifiedByRole?.id);
              const roleMatch = decodedRoleId === roles[0]?.roleId;
              const statusMatch = mapdata?.status === WORKFORCE_DOCUMENT_STATUS.ASSOCIATION_VERIFIED;
              console.log("Decoded verifiedByRole.id:", decodedRoleId);
              console.log("roles[0]?.id:", roles[0]?.roleId);
              console.log("Role match:", roleMatch);
              console.log("Status match:", statusMatch);
              console.log("Mapdata status:", mapdata?.status);
              return roleMatch && statusMatch;
            });
            console.log({ status }); // Keep for debugging

            // if (doc.holderType === "applicant") {
            //   return true; // Only pass if status exists (verified)
            // }
            // if (doc.holderType === "factoryAdmin") {
            //   return !!status; // Always pass (as per current logic)
            // }
            return !!status; // Pass for other types
          });

        console.log({ allVerified });

        if (!allVerified) {
          setServerResponse({
            status: "ERROR",
            message: "অনুগ্রহ করে সমস্ত নথি যাচাই করুন",
          });
          return;
        }

        console.log("documents porjnto aise");
        const applicationToResp = await fetchUsersByRoleId([
          isEisPath()
            ? "46"
            : selectedItem?.applicationType === "disabilityAssistance" || selectedItem?.applicationType === "financialAssistance"
              ? "35"
              : "32",
        ]);
        console.log({ applicationToResp });
        const applicationToUser = safeDecodeId(applicationToResp?.payload?.data?.workforceUserRole[0]?.userId);

        const updateApplicationData = {
          id: decodedId,
          status:
            // userType === WORKFORCE_USER_TYPE.BGMEA_ASSOCIATION ||
            // userType === WORKFORCE_USER_TYPE.BKMEA_ASSOCIATION
            !isEisPath() && WORKFORCE_USER_TYPE.ASSOCIATION
              ? WORKFORCE_STATUS.FORWARD_TO_CF_SECTION
              : // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
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
              : // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
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
              : // userType === WORKFORCE_USER_TYPE.BEPZA_ASSOCIATION ||
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
          toRoleId: isEisPath() ? 46 : 32,
        };

        await updateApplication(updateApplicationData, "update workforce application");
        await createApplicationMovement(createApplicationMovementData, "create workforce movement");
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
  roles,
  setServerResponse,
  setConfirmModalOpen,
  setConfirmModalMessage,
  setConfirmModalCallback,
  modulesManager,
  history,
  dispatch,
}) => {
  const userType = getUserTypeFromRights(userRights);
  let confirmModalMessage = "";
  let allEmpty = false;

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
    const id = selectedApplicationIds[0]?.id;
    console.log({ checkerId: id });
    const res = await dispatch(fetchWorkforceOtherCompensation(modulesManager, [`workforceApplicationId: "${safeDecodeId(id)}"`]));
    const fetchOtherCompensation = await parseData(res?.payload?.data?.workforceOtherCompensationInfo);
    allEmpty = fetchOtherCompensation?.every((item) => item.isEisBenefitAdjustmentEligible === "");
    console.log({ allEmpty });

    if (fetchOtherCompensation?.length === 0) {
      confirmModalMessage = "workforce.application.forward.message.withoutCompensation.toEisCoordinator";
    } else if (allEmpty) {
      confirmModalMessage = "workforce.application.forward.message.withoutCompensation.eisOfficer.toEisCoordinator";
    } else {
      confirmModalMessage = "workforce.application.forward.message.toEisCoordinator";
    }
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

  if (allEmpty) return;
  setConfirmModalCallback(async (confirmed) => {
    if (!confirmed) {
      setConfirmModalOpen(false);
      return;
    }

    try {
      for (const selectedItem of selectedApplicationIds) {
        const decodedId = safeDecodeId(selectedItem?.id);
        const res = await fetchWorkforceDocument(modulesManager, [`workforceApplication_Id: "${decodedId}"`]);

        const documents = res?.payload?.data?.workforceDocuments?.edges?.map((edge) => edge.node) ?? [];

        const allVerified = documents?.every((doc) => {
          const documentMapData = parseData(doc?.workforceDocumentMapDocumentId);
          console.log({ documentMapData }); // Keep for debugging
          const status = documentMapData?.find((mapdata) => {
            const decodedRoleId = safeDecodeId(mapdata?.verifiedByRole?.id);
            const roleMatch = decodedRoleId === roles[0]?.roleId;
            const statusMatch = isEisPath()
              ? mapdata?.status === WORKFORCE_DOCUMENT_STATUS.EIS_OFFICER_VERIFIED
              : userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
                ? mapdata?.status === WORKFORCE_DOCUMENT_STATUS.DOL_DIFE_VERIFIED
                : userType===WORKFORCE_USER_TYPE.BLWF_CHECKER?mapdata?.status ===WORKFORCE_DOCUMENT_STATUS.BLWF_SECTION_OFFICER_VERIFIED : mapdata?.status === WORKFORCE_DOCUMENT_STATUS.SECTION_OFFICER_VERIFIED;
            console.log("Decoded verifiedByRole.id:", decodedRoleId);
            console.log("roles[0]?.id:", roles[0]?.roleId);
            console.log("Role match:", roleMatch);
            console.log("Status match:", statusMatch);
            console.log("Mapdata status:", mapdata?.status);
            return roleMatch && statusMatch;
          });
          console.log({ status }); // Keep for debugging
          return !!status; // Pass for other types
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
          status: userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE ? WORKFORCE_STATUS.VERIFIED_BY_DOL_DIFE : WORKFORCE_STATUS.VERIFIED,
        };

        const createApplicationMovementData = {
          applicationId: decodedId,
          status: userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE ? WORKFORCE_STATUS.VERIFIED_BY_DOL_DIFE : WORKFORCE_STATUS.VERIFIED,
          note: "আবেদন যাচাইকৃত হয়েছে",
          action: "verified",
          applicationFromId: loggedInUserId,
          applicationToId:
            userType === WORKFORCE_USER_TYPE.CHECKER
              ? 139
              : userType === WORKFORCE_USER_TYPE.BLWF_CHECKER || userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
                ? 187
                : userType === WORKFORCE_USER_TYPE.EIS_OFFICER
                  ? 194
                  : null,
          toRoleId:
            userType === WORKFORCE_USER_TYPE.CHECKER
              ? 32
              : userType === WORKFORCE_USER_TYPE.EIS_OFFICER
                ? 47
                : userType === WORKFORCE_USER_TYPE.BLWF_CHECKER || userType === WORKFORCE_USER_TYPE.BLWF_DOL_DIFE
                  ? 40
                  : null,
        };

        await updateApplication(updateApplicationData, "update workforce application");
        await createApplicationMovement(createApplicationMovementData, "create workforce movement");
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
      // history.push("/home");
      setTimeout(() => {
        window.location.reload();
      }, 200);
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
  editedGrantMoney,
}) => {
  const userType = getUserTypeFromRights(userRights);

  let confirmModalMessage = "workforce.application.doctor.approve.message";

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

        await updateApplication(updateApplicationData, "update workforce application");

        await createApplicationMovement(createApplicationMovementData, "create workforce movement");
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
  userRights,
  modulesManager,
  fetchWorkforceDocument,
  updateApplication,
  createApplicationMovement,
  updateApplicationSummary,
  setServerResponse,
  setConfirmModalOpen,
  setConfirmModalMessage,
  setConfirmModalCallback,
  summaryId,
  eisApprovalIds,
  eisApprovedByIds,
  history,
}) => {
  let confirmModalMessage = "workforce.application.sign.message.toEisCoordinator";

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

        const approvalUserIds = eisApprovalIds ? safeParse(eisApprovalIds) : [];

        let approvedUserIds = eisApprovedByIds ? safeParse(eisApprovedByIds) : [];

        if (approvedUserIds.includes(loggedInUserId)) {
          setServerResponse({
            status: "ERROR",
            message: "আপনি ইতিমধ্যে এই আবেদনটি অনুমোদন করেছেন!",
          });
        } else {
          let majorityApproved = false;

          approvedUserIds.push(loggedInUserId);

          const totalApprovers = approvalUserIds?.length > 0 ? approvalUserIds.length : 1;

          const totalApproved = approvedUserIds?.length > 0 ? approvedUserIds.length : 0;

          console.log("totalApprovers", totalApprovers);
          console.log("totalApproved", totalApproved);

          majorityApproved = totalApprovers > 0 ? totalApproved / totalApprovers >= 0.5 : true;

          if (majorityApproved) {
            console.log("majority hoiche");
          } else {
            console.log("majority hoynai");
          }

          const updateApplicationData = {
            id: decodedId,
            status: majorityApproved ? WORKFORCE_STATUS.APPROVED_BY_COMMITTEE : WORKFORCE_STATUS.FORWARD_TO_COMIITEE,
            eisApprovedByIds: JSON.stringify(approvedUserIds),
          };

          const createApplicationMovementData = {
            applicationId: decodedId,
            status: WORKFORCE_STATUS.APPROVED_BY_COMMITTEE,
            note: "আবেদন কমিটি দ্বারা অনুমোদন করা হয়েছে",
            action: "approved_by_committee",
            applicationFromId: loggedInUserId,
            applicationToId: 173,
            toRoleId: 42,
          };
          // const updateApplicationSummaryData = {
          //   id: safeDecodeId(summaryId),
          //   status: WORKFORCE_STATUS.APPROVED_BY_COMMITTEE,
          // };

          await updateApplication(updateApplicationData, "update workforce application");
          //CODED THIS WHOLE AUTO SUMMARY FORWARD PROCESS IN BACKEND

          // const summaryApplicationRes = await dispatch(fetchApplication(modulesManager, [
          //     `eisApplicationSummaryId: "${safeDecodeId(summaryId)}"`,
          //     `statusIn: ["${WORKFORCE_STATUS.FORWARD_TO_COMIITEE}"]`
          //   ]))
          // ;

          // const summaryApplicationsLength = Number(
          //   summaryApplicationRes?.payload?.data?.workforceApplication?.totalCount ?? 0
          // );

          if (majorityApproved) {
            console.log("ekhane dhukse");
            await createApplicationMovement(createApplicationMovementData, "create workforce movement");
          }

          // if (majorityApproved && summaryApplicationsLength <= 1) {
          //   console.log("ekhaneo dhukse");
          //   await updateApplicationSummary(
          //     updateApplicationSummaryData,
          //     "update workforce application summary"
          //   );
          // }
        }
      }
      setServerResponse({
        status: "SUCCESS",
        message: "নির্বাচিত আবেদনগুলোর জন্য আপনার অনুমোদন গৃহীত হয়েছে। মেজরিটি পূর্ণ হলে আবেদন অনুমোদিত হবে।",
      });
    } catch (error) {
      console.error("Bulk committee approval failed:", error);

      setServerResponse({
        status: "ERROR",
        message: "আবেদন অনুমোদন ব্যর্থ হয়েছে!",
      });
    } finally {
      // history.push("/home");
      // window.location.reload();
      setTimeout(() => {
        window.location.reload();
      }, 500);
      setConfirmModalOpen(false);
      setConfirmModalCallback(null);
    }
  });
};
