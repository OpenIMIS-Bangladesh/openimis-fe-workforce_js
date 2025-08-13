import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Button,
  Divider,
} from '@material-ui/core';
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights } from "../../utils/utils";
import ForwardIcon from "@material-ui/icons/Forward";
import { WORKFORCE_STATUS } from "../../constants";
import { createApplicationSummary,updateApplication,updateApplicationSummary } from "../../actions";
import { useDispatch } from "react-redux";
import React, { Component,useState } from "react";
import {
  useModulesManager,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  dialogPaper: {
    '@media print': {
      boxShadow: 'none',
      border: 'none',
    },
  },
  dialogContent: {
    '@media print': {
      padding: 0,
    },
  },
}));

const GenerateBFTN = ({ open, onClose, applications = [], userRights,status,summary_Id }) => {
  const classes = useStyles();
  const getTotalAmount = () => {
  return applications
    .filter((item) => String(item.status) === String(status))
    .reduce((sum, item) => sum + (parseFloat(item.grantAmount) || 0), 0)
    .toFixed(2);
};


  const [serverResponse, setServerResponse] = useState(null);
  const dispatch = useDispatch();
  const handleForward = async () => {
  const filteredApplications = applications.filter(
    (item) => String(item.status) === String(status)
  );
  console.clear
  if (filteredApplications.length === 0) {
    setServerResponse({ status: "ERROR", message: "কোনো উপযুক্ত আবেদন পাওয়া যায়নি।" });
    return;
  }

  for (const item of filteredApplications) {
    console.log(item)

    const updateApplicationData = {
      id: decodeId(item.id), 
      status: WORKFORCE_STATUS.FORWARD_TO_DIRECTOR,
    };

    await dispatch(
      updateApplication(updateApplicationData, "update workforce application")
    );
  }
   const updateApplicationSummaryData = {
      id: summary_Id, 
      status: WORKFORCE_STATUS.FORWARD_TO_DIRECTOR,
    };

    await dispatch(
      updateApplicationSummary(updateApplicationSummaryData, "update workforce application summary")
    );

  setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  };


  if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6"><FormattedMessage module="workforce" id="workforce.application.modal.header" /></Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="workforce.table.applicantName" defaultMessage="আবেদনকারীর নাম" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.applicationType" defaultMessage="আবেদনের ধরণ" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="workforce.table.approvedAmount" defaultMessage="অনুমোদিত পরিমাণ" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.accountNo" defaultMessage="অ্যাকাউন্ট নম্বর" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.bankName" defaultMessage="ব্যাংকের নাম" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.branch" defaultMessage="শাখা" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.filter((item)=>item.status===status).map((row, index) => {
                const parseBankInfo = JSON.parse(row.employeeBankInfo)
                const bankInfo = JSON.parse(parseBankInfo)
                console.log(bankInfo)
                return (
                  <TableRow key={index}>
                    <TableCell>{row.workforceEmployee?.firstNameBn}</TableCell>
                    <TableCell>{row.applicationType}</TableCell>
                    <TableCell align="right">{row.grantAmount}</TableCell>
                    <TableCell>{bankInfo.accountNumber}</TableCell>
                    <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                    <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={2}><strong><FormattedMessage id="workforce.table.totalAmount" defaultMessage="মোট পরিমাণ" /></strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <Divider />
        <DialogActions className={classes.noPrint}>
          <Button onClick={onClose} variant="outlined" color="primary">
            <FormattedMessage id="workforce.table.close" defaultMessage="বন্ধ করুন" />
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary">
          <FormattedMessage id="workforce.table.printSUmmary" defaultMessage="মুদ্রণের সারাংশ" />
          </Button>
          <Button onClick={() => handleForward()} variant="contained" color="primary">
           <FormattedMessage id="workforce.table.forwardToDirector" defaultMessage="পরিচালকের কাছে ফরোয়ার্ড করুন" />
            <ForwardIcon />
          </Button>
        </DialogActions>
      </Dialog>
    );
  } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ADMIN || getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.SECTION_ADMIN) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6">  <FormattedMessage id="workforce.table.bftn"  /></Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
               <TableRow>
                <TableCell>
                  <FormattedMessage id="SL No"  />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="M: S: no"  />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="Date"  />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="Sender A/C No"  />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="Receiver's Routing Number "  />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="Sender's Routing Number "/>
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.applicantName"  />
                </TableCell>
                {/* <TableCell>
                  <FormattedMessage id="workforce.table.applicationType" defaultMessage="আবেদনের ধরণ" />
                </TableCell> */}
                <TableCell>
                  <FormattedMessage id="workforce.table.accountNo"  />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="Type(C/D)"  />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="workforce.table.approvedAmount"  />
                </TableCell>
                {/* <TableCell>
                  <FormattedMessage id="workforce.table.bankName" defaultMessage="ব্যাংকের নাম" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.branch" defaultMessage="শাখা" />
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.filter((item)=>item.status===status).map((row, index) => {
                const parseBankInfo = JSON.parse(row.employeeBankInfo)
                const bankInfo = JSON.parse(parseBankInfo)
                console.log(bankInfo)
                return (                   
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row?.dateCreated}</TableCell>
                    <TableCell>4426336001034</TableCell>
                    <TableCell>200275714</TableCell>
                    <TableCell>{row?.workforceEmployee?.routingNumber}</TableCell>
                    <TableCell>{row?.workforceEmployee?.firstNameBn}</TableCell>
                    <TableCell>{row?.workforceEmployee?.accountNumber}</TableCell>
                    {/* <TableCell>{row.applicationType}</TableCell> */}
                    <TableCell></TableCell>   
                    <TableCell align="right">{row.grantAmount}</TableCell>
                    {/* <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                    <TableCell>{bankInfo?.branch?.nameEn}</TableCell> */}
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={2}><strong><FormattedMessage id="workforce.table.totalAmount" defaultMessage="মোট পরিমাণ" /></strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <Divider />
        <DialogActions className={classes.noPrint}>
        <Button onClick={onClose} variant="outlined" color="primary">
             <FormattedMessage id="workforce.table.close" />
        </Button>
        <Button onClick={() => window.print()} variant="contained" color="primary">
            <FormattedMessage id="workforce.table.printAdvice" />
        </Button>
      </DialogActions>

      </Dialog>
    );
  }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DIRECTOR) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6"> <FormattedMessage id="workforce.table.bftn" /></Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
                 <TableRow>
                <TableCell>
                  <FormattedMessage id="workforce.table.applicantName" defaultMessage="আবেদনকারীর নাম" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.applicationType" defaultMessage="আবেদনের ধরণ" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="workforce.table.approvedAmount" defaultMessage="অনুমোদিত পরিমাণ" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.accountNo" defaultMessage="অ্যাকাউন্ট নম্বর" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.bankName" defaultMessage="ব্যাংকের নাম" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="workforce.table.branch" defaultMessage="শাখা" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.filter((item)=>item.status===status).map((row, index) => {
                const parseBankInfo = JSON.parse(row.employeeBankInfo)
                const bankInfo = JSON.parse(parseBankInfo)
                console.log(bankInfo)
                return (
                  <TableRow key={index}>
                    <TableCell>{row.workforceEmployee?.firstNameBn}</TableCell>
                    <TableCell>{row.applicationType}</TableCell>
                    <TableCell align="right">{row.grantAmount}</TableCell>
                    <TableCell>{bankInfo.accountNumber}</TableCell>
                    <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                    <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={2}><strong><FormattedMessage id="workforce.table.totalAmount" defaultMessage="মোট পরিমাণ" /></strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <Divider />
        <DialogActions className={classes.noPrint}>
          <Button onClick={onClose} variant="outlined" color="primary">
              <FormattedMessage id="workforce.table.close" defaultMessage="বন্ধ করুন" />
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary">
              <FormattedMessage id="workforce.table.printAdvice"  />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

export default GenerateBFTN;
