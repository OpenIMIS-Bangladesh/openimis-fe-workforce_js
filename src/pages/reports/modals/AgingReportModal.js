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
  fetchApplicationTimeWiseMatrix
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




const AgingReportModal = ({ open, onClose, data, organizationType }) => {
  const [thisApplicationType, setThisApplicationType] = useState([]);
  const [thisOrganizationType, setThisOrganizationType] = useState('');
  const classes = useStyles();
  const dispatch = useDispatch();
  const [barData, setBarData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableSectionHeading, setTableSectionHeading] = useState('');

  useEffect(() => {
    async function fetchData() {
      setTableData([]);
      setThisOrganizationType(organizationType);
      try {
        let res= null;
        let applicationType = [];
        if (organizationType === 'cf') {
          if (data.appType === 'medical') applicationType = ['medicalAssistance'];
          else if (data.appType === 'death') applicationType = ['financialAssistance'];
          else if (data.appType === 'educational') applicationType = ['scholarship'];
          else if (data.appType === 'maternityGrant') applicationType = ['maternityGrant'];
          else if (data.appType === 'disabilityAssistance') applicationType = ['disabilityAssistance'];
        }
        else if (organizationType === 'blwf') {
          if (data.appType === 'medical') applicationType = ['medicalDonation'];
          else if (data.appType === 'death') applicationType = ['deadlyGrant'];
          else if (data.appType === 'educational') applicationType = ['educationGrant'];
          else if (data.appType === 'maternityGrant') applicationType = ['maternityGrant'];
        }
        else {
          if (data.appType === 'medical') applicationType = ['medicalAssistance', 'medicalDonation'];
          else if (data.appType === 'death') applicationType = ['financialAssistance', 'deadlyGrant'];
          else if (data.appType === 'educational') applicationType = ['scholarship', 'educationGrant'];
          else if (data.appType === 'maternityGrant') applicationType = ['maternityGrant'];
          else if (data.appType === 'disabilityAssistance') applicationType = ['disabilityAssistance'];
        }

        setThisApplicationType(applicationType);

        await dispatch(fetchApplicationTimeWiseMatrix(organizationType, applicationType, null)).then((response) => {
           res= response.payload?.data?.workforceApplicationTimewiseMatrix || [];
        });
        let dayWiseCount= res.dayWiseCount || {};
        setBarData([
          { days: "১ দিন", applications: dayWiseCount.day1, color: "#1ba000ff", dayCount:"1" },
          { days: "৩ দিন", applications: dayWiseCount.day3, color: "#87c067ff", dayCount:"3" },
          { days: "৭ দিন", applications: dayWiseCount.day7, color: "#cfbb00ff", dayCount:"7" },
          { days: "১০ দিন", applications: dayWiseCount.day10, color: "#c4811cff", dayCount:"10" },
          { days: "১৫ দিন", applications: dayWiseCount.day15, color: "#c20000ff", dayCount:"15" },
          { days: "১৫ এর অধিক দিন", applications: dayWiseCount.moreThan15, color: "#4e0000ff", dayCount:"15+" },
        ]);
      }
      catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [open]);



  // When user clicks a bar
  const handleBarClick = (dataItem) => {
    console.log("Bar clicked:", dataItem);
    let res= null;
    let roleWiseCount= [];
    dispatch(fetchApplicationTimeWiseMatrix(thisOrganizationType, thisApplicationType, dataItem.dayCount)).then((response) => {
        res= response.payload?.data?.workforceApplicationTimewiseMatrix || [];
        roleWiseCount= res.roleWiseCount || [];
        let buildData=[];
        roleWiseCount.forEach(item => {
          let tempitem= { user: item?.otherNames+' ('+item.roleName+')', applications: item?.applicationCount };
          buildData.push(tempitem);
        });
        setSelectedDay(dataItem.dayCount);
        setTableSectionHeading(`${dataItem.days} ধরে প্রক্রিয়াধীনরত আবেদনের অবস্থানসমূহ`);
        setTableData(buildData);
    });
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
                <Typography variant="h6" gutterBottom style={{fontWeight:'bold', textAlign:'center', marginBottom:10}}>
                  {tableSectionHeading}
                </Typography>
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
