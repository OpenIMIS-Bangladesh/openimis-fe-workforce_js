  import React, { Component, Fragment } from "react";
  import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
  import ForwardIcon from "@material-ui/icons/Forward";
  import UndoIcon from "@material-ui/icons/Undo";
  import CloseIcon from "@material-ui/icons/Close";
  import RestorePageIcon from '@material-ui/icons/RestorePage';
  import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
  import HistoryIcon from "@material-ui/icons/History";
  import {
  Tab as TabIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from "@material-ui/icons";
import {
  historyPush,
  decodeId,
  TextInput
} from "@openimis/fe-core";
import {
  IconButton,
  Tooltip,
  Checkbox,
} from "@material-ui/core";
  
  
  export const itemAdminFormatters = (isShowHistory,modulesManager,history,component) => {
    const formatters = [
      (application) =>
        application.workforceEmployee ? (
          <Checkbox
            checked={component.state.selectedApplicationIds.includes(application.id)}
            onChange={component.handleCheckboxChange(application.id)}
            color="primary"
          />
        ) : (
          ""
        ),
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      (application) => 200000,
      (application) => "Nafi",
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
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
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>
           <Tooltip title="History">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.actions",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
       <Tooltip title="Approve">
          <IconButton
            disabled={
              application?.isHistory || 
              application?.status === "approved_by_dg" ||
              application?.status === "forward_to_director"
            }
            onClick={() => component.handleApproval(application)}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>

       <Tooltip title="Reject">
          <span>
            <IconButton
              onClick={() => component.handleReject(application)}
              disabled={
                application?.isHistory || 
                application?.status === "approved_by_dg" ||
                application?.status === "forward_to_director"
              }
              color="error"
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    ));
    return formatters;
  };
  export const itemFormattersDirector = (isShowHistory,modulesManager,history,component) => {
    const formatters = [
      (application) =>
        application.workforceEmployee ? (
          <Checkbox
            checked={component.state.selectedApplicationIds.includes(application.id)}
            onChange={component.handleCheckboxChange(application.id)}
            color="primary"
          />
        ) : (
          ""
        ),
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      (application) => 200000,
      (application) => "Nafi",
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
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
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>
           <Tooltip title="History">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.actions",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Approve">
          <IconButton
            disabled={application?.isHistory || application?.status !== "forward_to_director"}
            onClick={() => component.handleApprovalByDirector(application)}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reject">
          <span>
            <IconButton
              onClick={() => component.handleReject(application)}
            disabled={application?.isHistory || application?.status !== "forward_to_director"}
              color="error"
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    ));
    return formatters;
  };

  export const itemFormattersApplicant = (isShowHistory,modulesManager,history,component) => {
    const formatters = [
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.applicationType,
      (application) => "Akij",
      (application) => application.dateCreated.split("T")[0],
      (application) => application.status,
      // (application) => "",
      isShowHistory() ? application?.version : null,
    ];

    formatters.push((application) => (
      <div className={component.props.classes.horizontalButtonContainer}>
        {!component.props.applicationStatus ? (
        <>
        <Tooltip title="View">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.view",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="History">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.actions",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.process.resend",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <RestorePageIcon />
          </IconButton>
        </Tooltip>
        </>
        ):(
        <Tooltip title="Resend">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.application",
                [decodeId(application.id)],
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
    return formatters;
  };
  export const itemFormattersChecker = (isShowHistory,modulesManager,history,component) => {
    const formatters = [
      (application) =>
        application.workforceEmployee ? (
          <Checkbox
            checked={component.state.selectedApplicationIds.includes(application.id)}
            onChange={component.handleCheckboxChange(application.id)}
            color="primary"
          />
        ) : (
          ""
        ),
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      (application) => <TextInput value={application?.grantMoney?.grantMoney}/> ,
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
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
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Verify">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip>
{/* 
        <Tooltip title="Forward">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => component.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {component.handleOpenRevertModal(application);component.setState({revertByChecker:true})}}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };
   export const itemFormattersAssociation = (isShowHistory,modulesManager,history,component) => {
    const formatters = [
      (application) =>
        application.workforceEmployee ? (
          <Checkbox
            checked={component.state.selectedApplicationIds.includes(application.id)}
            onChange={component.handleCheckboxChange(application.id)}
            color="primary"
          />
        ) : (
          ""
        ),
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      (application) => <TextInput value={application?.grantMoney?.grantMoney}/> ,
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
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
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Verify">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip>
 
        <Tooltip title="Forward">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => component.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {component.handleOpenRevertModal(application);component.setState({revertByChecker:true})}}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };
  export const itemFormattersFactoryAdmin = (isShowHistory,modulesManager,history,component) => {
    const formatters = [
      (application) =>
        application.workforceEmployee ? (
          <Checkbox
            checked={component.state.selectedApplicationIds.includes(application.id)}
            onChange={component.handleCheckboxChange(application.id)}
            color="primary"
          />
        ) : (
          ""
        ),
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      (application) => 200000,
      (application) => "Akij",
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
      isShowHistory() ? application?.version : null,
    ];

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
                [decodeId(application.id)],
                false
              );
            }}
          >
            <TabIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="যাচাই">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {
              historyPush(
                modulesManager,
                history,
                "workforce.route.applications.application.verify",
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="ফরওয়ার্ড">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => component.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="রিভার্ট">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => {component.handleOpenRevertModal(application);component.setState({revertByChecker:true})}}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };
  export const itemFormattersApprover = (isShowHistory,modulesManager,history,component) => {
    const formatters = [
        (application) =>
        application.workforceEmployee ? (
          <Checkbox
            checked={component.state.selectedApplicationIds.includes(application.id)}
            onChange={component.handleCheckboxChange(application.id)}
            color="primary"
          />
        ) : (
          ""
        ),
      (application) => application.workforceEmployee?.firstNameBn,
      (application) => application.workforceEmployee?.lastNameBn,
      (application) => application.applicationType,
      // (application) => application.organizationType,
      (application) => <TextInput value={application?.grantMoney?.grantMoney}/> ,
      // (application) => 200000,
      (application) => application.status,
      (application) => application.dateCreated.split("T")[0],
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
                [decodeId(application.id)],
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
                [decodeId(application.id)],
                false
              );
            }}
          >
            <VerifiedUserIcon />
          </IconButton>
        </Tooltip>

        {/* <Tooltip title="ফরওয়ার্ড">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => component.handleOpenForwardModal(application)}
          >
            <ForwardIcon />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="Revert">
          <IconButton
            disabled={application?.isHistory}
            onClick={() => component.handleOpenRevertModal(application)}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
         <Tooltip title="Selected">
          <IconButton
            disabled={application?.isHistory || application?.status !== "forward_to_comiitee"}
            onClick={() => component.handleSelected(application)}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>
      </div>
    ));
    return formatters;
  };