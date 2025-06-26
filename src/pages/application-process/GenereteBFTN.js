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
import { createApplicationSummary,updateApplication } from "../../actions";
import { useDispatch } from "react-redux";
import React, { Component,useState } from "react";
import {
  useModulesManager,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
const GenerateBFTN = ({ open, onClose, applications = [], userRights,status }) => {
  const getTotalAmount = () => {
    return applications.reduce((sum, item) => sum + (parseFloat(item.approvedAmount) || 0), 0).toFixed(2);
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

  setServerResponse({ status: "SUCCESS", message: "সাবমিশন সফল হয়েছে!" });
  };


  if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.APPROVER) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6">Selected Application Summary</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell>
                <TableCell>Application Type</TableCell>
                <TableCell align="right">Approved Amount</TableCell>
                <TableCell>Account No</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Branch</TableCell>
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
                    <TableCell align="right">20000</TableCell>
                    <TableCell>{bankInfo.accountNumber}</TableCell>
                    <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                    <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={2}><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="primary">
            Close
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary">
            Print Summary
          </Button>
          <Button onClick={() => handleForward()} variant="contained" color="primary">
            Forward To Director
            <ForwardIcon />
          </Button>
        </DialogActions>
      </Dialog>
    );
  } else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ADMIN) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6">Bank Payment Advice (BFTN)</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell>
                <TableCell>Application Type</TableCell>
                <TableCell align="right">Approved Amount</TableCell>
                <TableCell>Account No</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Branch</TableCell>
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
                    <TableCell align="right">20000</TableCell>
                    <TableCell>{bankInfo.accountNumber}</TableCell>
                    <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                    <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={2}><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="primary">
            Close
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary">
            Print Advice
          </Button>
        </DialogActions>
      </Dialog>
    );
  }else if (getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.DIRECTOR) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle disableTypography>
          <Typography variant="h6">Bank Payment Advice (BFTN)</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell>
                <TableCell>Application Type</TableCell>
                <TableCell align="right">Approved Amount</TableCell>
                <TableCell>Account No</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Branch</TableCell>
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
                    <TableCell align="right">20000</TableCell>
                    <TableCell>{bankInfo.accountNumber}</TableCell>
                    <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                    <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={2}><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>{getTotalAmount()}</strong></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="primary">
            Close
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary">
            Print Advice
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

export default GenerateBFTN;
