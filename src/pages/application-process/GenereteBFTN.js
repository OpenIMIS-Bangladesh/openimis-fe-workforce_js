import React from 'react';
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
  Divider
} from '@material-ui/core';
import { MODULE_NAME, WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights, isEmptyObject } from "../../utils/utils";

const GenerateBFTN = ({ open, onClose, applications = [],userRights }) => {
  const getTotalAmount = () => {
    return applications.reduce((sum, item) => sum + (parseFloat(item.approvedAmount) || 0), 0).toFixed(2);
  };

  console.log("generete bftn",applications)
  
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
            {applications.map((row, index) => {
                const parseBankInfo = JSON.parse(row.employeeBankInfo)
                const bankInfo = JSON.parse(parseBankInfo)
                console.log(bankInfo)
             return   (
              <TableRow key={index}>
                <TableCell>{row.workforceEmployee?.firstNameBn}</TableCell>
                <TableCell>{row.applicationType}</TableCell>
                <TableCell align="right">20000</TableCell>
                <TableCell>{bankInfo.accountNumber}</TableCell>
                <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
              </TableRow>
            )})}
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
      </DialogActions>
    </Dialog>
  );
}else if(getUserTypeFromRights(userRights) === WORKFORCE_USER_TYPE.ADMIN) {
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
            {applications.map((row, index) => {
                const parseBankInfo = JSON.parse(row.employeeBankInfo)
                const bankInfo = JSON.parse(parseBankInfo)
                console.log(bankInfo)
             return   (
              <TableRow key={index}>
                <TableCell>{row.workforceEmployee?.firstNameBn}</TableCell>
                <TableCell>{row.applicationType}</TableCell>
                <TableCell align="right">20000</TableCell>
                <TableCell>{bankInfo.accountNumber}</TableCell>
                <TableCell>{bankInfo?.bank?.nameEn}</TableCell>
                <TableCell>{bankInfo?.branch?.nameEn}</TableCell>
              </TableRow>
            )})}
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
