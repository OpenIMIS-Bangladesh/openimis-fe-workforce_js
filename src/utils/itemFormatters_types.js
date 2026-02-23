import React, { Component, Fragment } from "react";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import ForwardIcon from "@material-ui/icons/Forward";
import UndoIcon from "@material-ui/icons/Undo";
import CloseIcon from "@material-ui/icons/Close";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import HistoryIcon from "@material-ui/icons/History";
import {
  Tab as TabIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from "@material-ui/icons";
import { historyPush, decodeId, TextInput } from "@openimis/fe-core";
import { IconButton, Tooltip, Checkbox } from "@material-ui/core";
import {
  STATUS_MAP_BN,
  STATUS_MAP_EN,
  WORKFORCE_USER_TYPE_MAP_EN,
  WORKFORCE_USER_TYPE_MAP_BN,
  ORGANIZATION_TYPE_NAME_EN,
  ORGANIZATION_TYPE_NAME_BN,
} from "../constants";
import { conditionalEnToBn, isEisPath } from "./utils";

// export const itemAdminFormatters = (
//   isShowHistory,
//   modulesManager,
//   history,
//   component,
//   locale = "en"
// ) => {
//   const formatters = [
//     (application) => application?.trackingNumber,
//     (application) =>
//       conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
//     (application) => application?.workforceEmployee?.firstNameBn,
//     (application) =>
//       locale === "en"
//         ? application?.employeeFactory?.nameEn
//         : application?.employeeFactory?.nameBn,
//     (application) =>
//       locale === "en"
//         ? application?.grantMoney?.applicationTypeNameEn
//         : application?.grantMoney?.applicationTypeNameBn,

//     (application) => (
//       <TextInput
//         value={application?.grantAmount}
//         onChange={(v) => component.setState({ editedGrantMoney: v })}
//       />
//     ),
//     (application) => {
//       const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
//       return statusMap[application?.status] || application?.status;
//     },
//     isShowHistory() ? application?.version : null,
//   ];

//   formatters.push((application) => (
//     <div className={component.props.classes.horizontalButtonContainer}>
//       <Tooltip title="View">
//         <IconButton
//           disabled={application?.isHistory}
//           onClick={() => {
//             historyPush(
//               modulesManager,
//               history,
//               "workforce.route.applications.application.process.view",
//               [decodeId(application?.id)],
//               false
//             );
//           }}
//         >
//           <TabIcon />
//         </IconButton>
//       </Tooltip>
//       {component.props.disableButtons!==1 && (
//         <>
//           <Tooltip title="Revert">
//           <IconButton
//             disabled={application?.isHistory}
//             onClick={() => component.handleOpenRevertModal(application)}
//           >
//             <UndoIcon />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Reject">
//           <span>
//             <IconButton
//               onClick={() => component.handleRejectByDG(application)}
//               disabled={
//                 application?.isHistory ||
//                 application?.status === "approved_by_dg" ||
//                 application?.status === "forward_to_director" ||
//                 application?.status === "rejected_by_dg"

//               }
//               color="error"
//             >
//               <CloseIcon />
//             </IconButton>
//           </span>
//         </Tooltip>
//         </>
//       )}
//     </div>
//   ));
//   return formatters;
// };
export const itemAdminFormatters = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    ...(isEisPath()?[]:[
      (application) => (
        <TextInput
          value={application?.grantAmount}
          onChange={(v) => component.setState({ editedGrantMoney: v })}
        />
      ),
    ]),

    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },

    isShowHistory() ? (application) => application?.version : null,
  ];

  // 1️⃣ View Button
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // 2️⃣ Revert Button (only when disableButtons !== 1)
  formatters.push((application) =>
    component.props.disableButtons !== 1 ? (
      <div className={component.props.classes.horizontalButtonContainer}>
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => component.handleOpenRevertModal(application)}
          >
            <UndoIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      </div>
    ) : null
  );

  // 3️⃣ Reject Button (only when disableButtons !== 1)
  formatters.push((application) =>
    component.props.disableButtons !== 1 ? (
      <div className={component.props.classes.horizontalButtonContainer}>
        <Tooltip title="Reject">
          <span>
            <IconButton
              onClick={() => component.handleRejectByDG(application)}
              disabled={
                application?.isHistory ||
                application?.status === "approved_by_dg" ||
                application?.status === "forward_to_director" ||
                application?.status === "rejected_by_dg"
              }
              color="error"
            >
              <CloseIcon style={{ color: "#750506" }} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    ) : null
  );

  return formatters;
};
export const itemFormattersDirector = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,

     ...(isEisPath()?[]:[
      (application) => (
        <TextInput
          value={application?.grantAmount}
          onChange={(v) => component.setState({ editedGrantMoney: v })}
        />
      ),
    ]),
    // (application) => application?.grantAmount,
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon />
        </IconButton>
      </Tooltip>
      {component.props.disableButtons !== 1 && (
        <>
          <Tooltip title="Revert">
            <IconButton
              disabled={application?.isHistory}
              onClick={() => component.handleOpenRevertModal(application)}
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <span>
              <IconButton
                onClick={() => component.handleReject(application)}
                disabled={
                  application?.isHistory ||
                  application?.status !== "forward_to_director"
                }
                color="error"
              >
                <CloseIcon />
              </IconButton>
            </span>
          </Tooltip>
        </>
      )}

    </div>
  ));
  return formatters;
};

export const itemFormattersApplicant = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application.trackingNumber,
    (application) =>
      conditionalEnToBn(application.dateCreated.split("T")[0], locale),
    (application) => application.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn ?? "N/A"
        : application?.employeeFactory?.nameBn ?? "প্রযোজ্য নয়",
    (application) => locale === "en" ? ORGANIZATION_TYPE_NAME_EN[application?.organizationType] : ORGANIZATION_TYPE_NAME_BN[application?.organizationType],
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {!component.props.applicationStatus ? (
        <>
          <Tooltip title={"View"}>
            <IconButton
              disabled={application?.isHistory}
              onClick={() => {
                historyPush(
                  modulesManager,
                  history,
                  "workforce.route.applications.application.process.view",
                  [decodeId(application?.id)],
                  false
                );
              }}
            >
              <TabIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              isEisPath() ?
                historyPush(
                  modulesManager,
                  history,
                  "workforce.route.application.eis",
                  [decodeId(application?.id)],
                  false
                )
                : historyPush(
                  modulesManager,
                  history,
                  "workforce.route.application",
                  [decodeId(application?.id)],
                  false
                );
            }}
          >
            <DoubleArrowIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>

  ));
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.revertedApplication && (
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <RestorePageIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ))
  return formatters;
};
export const itemFormattersChecker = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    // (application) => conditionalEnToBn(application?.grantAmount, locale),
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  // --- VIEW BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // --- VERIFY BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="Verify">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.verify",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <VerifiedUserIcon style={{ color: "green" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // --- REVERT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="Revert">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => component.handleOpenRevertModal(application)}
        >
          <UndoIcon style={{ color: "red" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));
  ///---RESEND BUTTON ---
    formatters.push((application) =>
    component.props.disableButtons !== 1 && component.props.revertedApplication ? (
      <div className={component.props.classes.horizontalButtonContainer}>
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <RestorePageIcon style={{ color: "#1976D2" }} />
          </IconButton>
        </Tooltip>
      </div>
    ) : null
  );

  return formatters;
};

export const itemFormattersCheckerTwo = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    (application) => conditionalEnToBn(application?.grantAmount, locale),
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>

      <Tooltip title="Verify">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.verify",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <VerifiedUserIcon style={{ color: "green" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));
  // --- REVERT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              component.handleOpenRevertModal(application);
              component.setState({ revertByChecker: true });
            }}
          >
            <UndoIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  // --- REJECT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <Tooltip title="Reject">
          <span>
            <IconButton onClick={() => component.handleReject(application)}>
              <CloseIcon style={{ color: "#750506" }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </div>
  ));
  return formatters;
};
export const itemFormattersDeputyAsstDirector = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    // (application) => conditionalEnToBn(application?.grantAmount, locale),
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="Verify">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.verify",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <VerifiedUserIcon style={{ color: "green" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));
  // --- REVERT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              component.handleOpenRevertModal(application);
              component.setState({ revertByChecker: true });
            }}
          >
            <UndoIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  // --- REJECT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <Tooltip title="Reject">
          <span>
            <IconButton onClick={() => component.handleReject(application)}>
              <CloseIcon style={{ color: "#750506" }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </div>
  ));
  return formatters;
};
export const itemFormattersS2DeputyAsstDirector = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    (application) => conditionalEnToBn(application?.grantAmount, locale),
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="Verify">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.verify",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <VerifiedUserIcon style={{ color: "green" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));
  return formatters;
};
export const itemFormattersSectionAdmin = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    (application) => application?.associationType,
    (application) => application?.workforceEmployee?.nid,
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  // --- VIEW BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // --- VERIFY BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && (
        <Tooltip title="Verify">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.verify",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon style={{ color: "green" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  // --- REVERT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              component.handleOpenRevertModal(application);
              component.setState({ revertByChecker: true });
            }}
          >
            <UndoIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  // --- REJECT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <Tooltip title="Reject">
          <span>
            <IconButton onClick={() => component.handleReject(application)}>
              <CloseIcon style={{ color: "#750506" }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </div>
  ));

  // --- RESEND BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.revertedApplication && (
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <RestorePageIcon style={{ color: "#1976D2" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  return formatters;
};

export const itemFormattersSectionTwoAdmin = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    // (application) => conditionalEnToBn(application?.grantAmount, locale),
    (application) => application?.workforceEmployee?.nid,
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  // --- VIEW BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() =>
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            )
          }
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // --- VERIFY BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="Verify">
        <IconButton
          disabled={application?.isHistory}
          onClick={() =>
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.verify",
              [decodeId(application?.id)],
              false
            )
          }
        >
          <VerifiedUserIcon style={{ color: "green" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // --- REVERT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {!component.props.revertedApplication && (
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              component.handleOpenRevertModal(application);
              component.setState({ revertByChecker: true });
            }}
          >
            <UndoIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  // --- REJECT BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {!component.props.revertedApplication && (
        <Tooltip title="Reject">
          <span>
            <IconButton onClick={() => component.handleReject(application)}>
              <CloseIcon style={{ color: "#750506" }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </div>
  ));

  // --- RESEND BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.revertedApplication && (
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() =>
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application?.id)],
                false
              )
            }
          >
            <RestorePageIcon style={{ color: "#1976D2" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  return formatters;
};

export const itemFormattersBlwfSectionAdmin = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    ...(isEisPath()?[]:[
      (application) => conditionalEnToBn(application?.grantAmount, locale),
    ]),
    (application) => application?.workforceEmployee?.nid,
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  // -----------------------
  // ICON #1: View
  // -----------------------
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // -----------------------
  // ICON #2: Verify
  // -----------------------
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && (
        <Tooltip title="Verify">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.verify",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon style={{ color: "green" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  // -----------------------
  // ICON #3: Revert
  // -----------------------
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 &&
        !component.props.revertedApplication && (
          <Tooltip title="Revert">
            <IconButton
              disabled={application?.isHistory}
              onClick={() => {
                component.handleOpenRevertModal(application);
                component.setState({ revertByChecker: true });
              }}
            >
              <UndoIcon style={{ color: "red" }} />
            </IconButton>
          </Tooltip>
        )}
    </div>
  ));

  // -----------------------
  // ICON #4: Reject
  // -----------------------
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 &&
        !component.props.revertedApplication && (
          <Tooltip title="Reject">
            <span>
              <IconButton
                onClick={() => component.handleReject(application)}
              >
                <CloseIcon style={{ color: "#750506" }} />
              </IconButton>
            </span>
          </Tooltip>
        )}
    </div>
  ));

  // -----------------------
  // ICON #5: Resend (for reverted applications)
  // -----------------------
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.revertedApplication && (
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <RestorePageIcon style={{ color: "#1976D2" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  return formatters;
};

export const itemFormattersDoctor = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application?.trackingNumber,
    (application) =>
      conditionalEnToBn(application?.dateCreated.split("T")[0], locale),
    (application) => application?.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
     ...(isEisPath()?[]:[
      (application) => (
        <TextInput
          value={application?.grantAmount}
          onChange={(v) => component.setState({ editedGrantMoney: v })}
        />
      ),
    ]),
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  // --- VIEW BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // --- VERIFY BUTTON ---
  if (component.props.disableButtons != 1) {
    formatters.push((application) => (
      <div className={component.props.classes.horizontalButtonContainer}>
        <Tooltip title="Verify">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.verify",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon style={{ color: "green" }} />
          </IconButton>
        </Tooltip>
      </div>
    ));
  }

  // --- APPROVE BUTTON ---
  if (component.props.disableButtons != 1) {
    formatters.push((application) => {
      if (application?.status === "approved_by_doctor") return null;

      return (
        <div className={component.props.classes.horizontalButtonContainer}>
          <Tooltip title="Approve">
            <IconButton
              disabled={application?.isHistory}
              onClick={() => component.handleApprovalByDoctor(application)}
            >
              <CheckIcon style={{ color: "#006273" }} />
            </IconButton>
          </Tooltip>
        </div>
      );
    });
  }


  // --- REVERT BUTTON ---
  if (component.props.disableButtons != 1) {
    formatters.push((application) => (
      <div className={component.props.classes.horizontalButtonContainer}>
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              component.handleOpenRevertModal(application);
              component.setState({ revertByChecker: true });
            }}
          >
            <UndoIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      </div>
    ));
  }

  // --- RESEND BUTTON ---
  if (component.props.disableButtons != 1) {
    formatters.push((application) => (
      <div className={component.props.classes.horizontalButtonContainer}>
        {component.props.revertedApplication && (
          <Tooltip title="Resend">
            <IconButton
              disabled={application?.isHistory}
              onClick={() => {
                historyPush(
                  modulesManager,
                  history,
                  "workforce.route.applications.application.process.resend",
                  [decodeId(application?.id)],
                  false
                );
              }}
            >
              <RestorePageIcon style={{ color: "#1976D2" }} />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ));
  }

  return formatters;
};

export const itemFormattersAssociation = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application.trackingNumber,
    (application) =>
      conditionalEnToBn(application.dateCreated.split("T")[0], locale),
    (application) => application.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  // --- VIEW BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // --- VERIFY & REVERT BUTTONS ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <>
          <Tooltip title="Verify">
            <IconButton
              disabled={application?.isHistory}
              onClick={() => {
                historyPush(
                  modulesManager,
                  history,
                  "workforce.route.applications.application.verify",
                  [decodeId(application?.id)],
                  false
                );
              }}
            >
              <VerifiedUserIcon style={{ color: "green" }} />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  ));
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && !component.props.revertedApplication && (
        <>
          <Tooltip title="Revert">
            <IconButton
              disabled={application?.isHistory}
              onClick={() => {
                component.handleOpenRevertModal(application);
                component.setState({ revertByChecker: true });
              }}
            >
              <UndoIcon style={{ color: "red" }} />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  ));

  // --- RESEND BUTTON ---
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      {component.props.disableButtons !== 1 && component.props.revertedApplication && (
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <RestorePageIcon style={{ color: "#1976D2" }} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  ));

  return formatters;
};

export const itemFormattersFactoryAdmin = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [
    (application) => application.trackingNumber,
    (application) =>
      conditionalEnToBn(application.dateCreated.split("T")[0], locale),
    (application) => application.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.employeeFactory?.nameEn
        : application?.employeeFactory?.nameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    (application) => {
      const userTypeMap =
        locale === "en"
          ? WORKFORCE_USER_TYPE_MAP_EN
          : WORKFORCE_USER_TYPE_MAP_BN;
      return userTypeMap[application?.submittedBy] || application?.submittedBy;
    },
    isShowHistory() ? application?.version : null,
  ];

  // View button
  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="ভিউ">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon style={{ color: "blue" }} />
        </IconButton>
      </Tooltip>
    </div>
  ));

  // Verify + Revert
  formatters.push((application) =>
    component.props.disableButtons !== 1 && !component.props.revertedApplication ? (
      <div className={component.props.classes.horizontalButtonContainer}>
        <Tooltip title="যাচাই">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.verify",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon style={{ color: "green" }} />
          </IconButton>
        </Tooltip>

      </div>
    ) : null
  );
  formatters.push((application) =>
    component.props.disableButtons !== 1 && !component.props.revertedApplication ? (
      <div className={component.props.classes.horizontalButtonContainer}>

        <Tooltip title="রিভার্ট">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              component.handleOpenRevertModal(application);
              component.setState({ revertByChecker: true });
            }}
          >
            <UndoIcon style={{ color: "red" }} />
          </IconButton>
        </Tooltip>
      </div>
    ) : null
  );

  // Resend
  formatters.push((application) =>
    component.props.disableButtons !== 1 && component.props.revertedApplication ? (
      <div className={component.props.classes.horizontalButtonContainer}>
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application?.id)],
                false
              );
            }}
          >
            <RestorePageIcon style={{ color: "#1976D2" }} />
          </IconButton>
        </Tooltip>
      </div>
    ) : null
  );

  return formatters;
};

export const itemFormattersApprover = (
  isShowHistory,
  modulesManager,
  history,
  component,
  locale = "en"
) => {
  const formatters = [

    (application) => application.trackingNumber,
    (application) =>
      conditionalEnToBn(application.dateCreated.split("T")[0], locale),
    (application) => application.workforceEmployee?.firstNameBn,
    (application) =>
      locale === "en"
        ? application?.grantMoney?.applicationTypeNameEn
        : application?.grantMoney?.applicationTypeNameBn,
    ...(isEisPath()?[]:[
      (application) => conditionalEnToBn(application?.grantAmount, locale),
    ]),
    (application) => application?.applicationReceiveDate
      ? conditionalEnToBn(application.applicationReceiveDate.split("T")[0], locale) : "N/A",
    (application) => application?.applicationForwardDate
      ? conditionalEnToBn(application.applicationForwardDate.split("T")[0], locale) : "N/A",
    (application) => {
      const statusMap = locale === "en" ? STATUS_MAP_EN : STATUS_MAP_BN;
      return statusMap[application?.status] || application?.status;
    },
    isShowHistory() ? application?.version : null,
  ];

  formatters.push((application) => (
    <div className={component.props.classes.horizontalButtonContainer}>
      <Tooltip title="View">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.process.view",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <TabIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Veify">
        <IconButton
          disabled={application?.isHistory}
          onClick={() => {
            historyPush(
              modulesManager,
              history,
              "workforce.route.applications.application.verify",
              [decodeId(application?.id)],
              false
            );
          }}
        >
          <VerifiedUserIcon />
        </IconButton>
      </Tooltip>
      {component.props.disableButtons !== 1 && (
        <>
          <Tooltip title="Revert">
            <IconButton
              disabled={application?.isHistory}
              onClick={() => {
                component.handleOpenRevertModal(application);
                component.setState({ revertByChecker: true });
              }}
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <span>
              <IconButton
                onClick={() => component.handleReject(application)}
              >
                <CloseIcon style={{ color: "#750506" }} />
              </IconButton>
            </span>
          </Tooltip>
          {component.props.revertedApplication && (
            <Tooltip title="Resend">
              <IconButton
                disabled={application?.isHistory}
                onClick={() => {
                  historyPush(
                    modulesManager,
                    history,
                    "workforce.route.applications.application.process.resend",
                    [decodeId(application?.id)],
                    false
                  );
                }}
              >
                <RestorePageIcon style={{ color: "#1976D2" }} />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </div>
  ));
  return formatters;
};
