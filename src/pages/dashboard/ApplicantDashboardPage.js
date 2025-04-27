import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, useModulesManager, TextInput, useHistory,FormattedMessage } from "@openimis/fe-core";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputBase,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
} from "@material-ui/core";

import PersonIcon from "@material-ui/icons/Person";
import DescriptionIcon from "@material-ui/icons/Description";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import AssignmentIcon from "@material-ui/icons/Assignment";
import SettingsIcon from "@material-ui/icons/Settings";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  sidebar: {
    width: 340,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    height: "auto",
    position: "sticky",
    top: 0,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  select: {
    border: "1px solid #ccc",
    borderRadius: 4,
    padding: "4px 8px",
    minWidth: 80,
    marginRight: theme.spacing(2),
  },
  searchInput: {
    border: "1px solid #ccc",
    borderRadius: 4,
    padding: "4px 8px",
    width: 200,
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  tableHeadCell: {
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
    alignItems: "center",
  },
  tableHeader:{
    backgroundColor:"#B7D4D8"
  }
}));

const SidebarMenu = [
//   { text: "প্রোফাইল", icon: <PersonIcon /> },
  { text: <FormattedMessage module="workforce" id="workforce.application.filed" />, icon: <DescriptionIcon /> },
  { text: <FormattedMessage module="workforce" id="workforce.new.application" />    , icon: <AddCircleOutlineIcon /> },
  { text: <FormattedMessage module="workforce" id="workforce.application.status" />, icon: <AssignmentIcon /> },
//   { text: "সেটিংস", icon: <SettingsIcon /> },
  { text: <FormattedMessage module="workforce" id="workforce.help.complain" />, icon: <HelpOutlineIcon /> },
  { text: <FormattedMessage module="workforce" id="workforce.others" />, icon: <MoreHorizIcon /> },
];

const ApplicantDashboard = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper className={classes.sidebar}>
            <List>
              {SidebarMenu.map((item, index) => (
                <ListItem button key={index}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <div className={classes.content}>
            <Typography variant="h5" gutterBottom>
              <FormattedMessage module="workforce" id="workforce.application.filed" />
            </Typography>

            {/* Filters */}
            <Grid container spacing={2} alignItems="center">
            
              <Grid item>
                <InputBase
                  className={classes.searchInput}
                  placeholder="অনুসন্ধান করুন"
                />
              </Grid>
            </Grid>

            {/* Table */}
            <Card className={classes.tableContainer}>
              <CardContent>
                <Table>
                  <TableHead className={classes.tableHeader}>
                    <TableRow>
                      <TableCell className={classes.tableHeadCell}><FormattedMessage module="workforce" id="workforce.application.id"/></TableCell>
                      <TableCell className={classes.tableHeadCell}><FormattedMessage module="workforce" id="workforce.application.date"/></TableCell>
                      <TableCell className={classes.tableHeadCell}><FormattedMessage module="workforce" id="workforce.application.expected.date"/></TableCell>
                      <TableCell className={classes.tableHeadCell}><FormattedMessage module="workforce" id="workforce.application.status"/></TableCell>
                      <TableCell className={classes.tableHeadCell}><FormattedMessage module="workforce" id="workforce.application.steps.taken"/></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className={classes.noData}>
                        কোন এন্ট্রি খুঁজে পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className={classes.pagination}>
              <Button>পূর্ববর্তী</Button>
              <Button>পরবর্তী</Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default ApplicantDashboard;
