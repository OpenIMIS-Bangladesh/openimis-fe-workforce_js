import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Paper,
  Breadcrumbs,
  Radio,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { useSelector, useDispatch } from "react-redux";
import {
  useModulesManager,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import ReactQuill from "react-quill";
import {
  fetchApplication,
  updateApplication,
  createApplicationMovement,
  fetchApplicationWiseMovementList,
} from "../../../actions";
import { WORKFORCE_STATUS } from "../../../constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import colors from "react-multi-date-picker/plugins/colors";

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: '80%',
    maxHeight: "90vh",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    overflowY: "auto",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    minWidth: 0,
    padding: theme.spacing(0.5, 1),
    fontSize: "1.2rem",
  },
  sectionPaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(2),
  },
  responseMessage: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
}));





const AgingReportModal = ({ open, onClose, data }) => {
  const classes = useStyles();
  const barData = [
    { days: "১ দিন", applications: Math.floor(Math.random() * 100), color: "#1ba000ff" },
    { days: "৩ দিন", applications: Math.floor(Math.random() * 100), color: "#87c067ff" },
    { days: "৭ দিন", applications: Math.floor(Math.random() * 100), color: "#cfbb00ff" },
    { days: "১০ দিন", applications: Math.floor(Math.random() * 100), color: "#c4811cff" },
    { days: "১৫ দিন", applications: Math.floor(Math.random() * 100), color: "#c20000ff" },
  ];

  const [selectedDay, setSelectedDay] = useState(null);
  const [tableData, setTableData] = useState([]);

  // When user clicks a bar
  const handleBarClick = (dataItem) => {
    setSelectedDay(dataItem.days);

    const tableData = [
      { user: 'সাব-এসিস্টেন্ট অফিসার', applications: Math.floor(Math.random() * 10) },
      { user: 'সেকশন এডমিন ১', applications: Math.floor(Math.random() * 10) },
      { user: 'সেকশন এডমিন ২', applications: Math.floor(Math.random() * 10) },
      { user: 'ডাক্তার', applications: Math.floor(Math.random() * 10) },
      { user: 'যাচাই বাছাই কমিটি', applications: Math.floor(Math.random() * 10) },
      { user: 'পরিচালক', applications: Math.floor(Math.random() * 10) },
    ];

    setTableData(tableData);
  };



  return (
    
    <Modal open={open} onClose={onClose}>
      <form className={classes.modalContainer}>
        {/* Close button */}
        <Button onClick={onClose} className={classes.closeButton}>
          ✕
        </Button>

        {/* Title */}
        <Typography
          variant="h5"
          gutterBottom
          style={{ fontWeight: "bold", marginTop: 3, textAlign: "center" }}
        >
          {data?.type??''} আবেদনের প্রক্রিয়াধীনরত সময় ভিত্তিক প্রতিবেদন
        </Typography>

        <Divider style={{ marginBottom: 15 }} />

        {/* Applicant Info */}
        <Paper className={classes.sectionPaper} elevation={1}>
          {/* <Typography variant="subtitle1" gutterBottom>

          </Typography> */}

          <Grid container>
            <Grid item md={tableData.length>0?6:12} xs={tableData.length>0?6:12}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                  onClick={(e) => {
                    if (e && e.activeLabel) {
                      handleBarClick(e.activePayload[0].payload);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="days" type="category" />
                  <Tooltip />
                  <Bar dataKey="applications" radius={[0, 8, 8, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer"/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            {tableData.length > 0 && (
              <Grid item md={6} xs={6}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{fontWeight:'bold'}}>ব্যবহারকারী</TableCell>
                      <TableCell align="right" style={{fontWeight:'bold'}}>অপেক্ষমান আবেদনের সংখ্যা</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.user}</TableCell>
                        <TableCell align="right">{Number(row.applications).toLocaleString('bn')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            )}
            </Grid>
        </Paper>
      </form>
    </Modal>
  );
};

export default AgingReportModal;
