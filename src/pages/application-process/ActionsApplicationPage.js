import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AccordionDetails,
  TextField,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,Box,
  Avatar,
} from "@material-ui/core";
import { journalize, FormattedMessage } from "@openimis/fe-core";
import CloseIcon from "@material-ui/icons/Close";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Document, Page } from "react-pdf";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import PrintIcon from '@material-ui/icons/Print';
const styles = (theme) => ({
  paper: {
    padding: theme.spacing(1),
    width: 700,
    margin: "0 auto",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: "medium",
    fontWeight: "bold",
  },
  fullHeight: {
    height: "100%",
  },
  overrideReadOnly: {
    "& .Mui-disabled": {
      color: `${theme.palette.text.primary} !important`,
    },
  },
  rootGrid: {
    height: 'calc(100vh - 64px)', // Adjust if you have AppBar
    overflow: 'hidden',
  },
  leftGrid: {
    position: 'sticky',
    top: 0,
    height: '100%',
    overflowY: 'auto',
    paddingRight: 8,
  },
  rightGrid: {
    height: '100%',
    overflowY: 'auto',
    paddingLeft: 8,
  },
  cardSpacing: {
    marginBottom: theme.spacing(2),
  },
  
});

class ActionsApplicationPage extends Component {
  constructor(props) {
    super(props);
    const mockFiles = [
      {
        type: "image",
        src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Smart_NID_Card_%28Bangladesh%29.jpg",
        comment: "Clear image, all info visible.",
        status: "verified",
      },
    ];
    

    this.state = {
      applicationType: props?.application || {},
      stateEdited: props.application?.workforceEmployee || {},
      isSaved: false,
      preview: null,
      comment: "",
      mockFiles: mockFiles,
      fileStates:mockFiles,
      
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({ stateEdited: this.props.application });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  render() {
    const { classes } = this.props;
    const { stateEdited, preview, fileStates, comment, applicationType } =
      this.state;

    console.log({ stateEdited });

    return (
       <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f0f2f5"
    >
      <Box display="flex" alignItems="flex-start" maxWidth={900} p={2}>
      {/* Avatar */}
      <Box mr={2}>
        <Avatar style={{ width: 64, height: 64 }}>👤</Avatar>
      </Box>

      {/* Card Content */}
      <Card style={{ flex: 1, backgroundColor: '#f8f9fc', position: 'relative' }}>
        <CardContent>
          {/* Print Icon */}
          <Box position="absolute" top={8} right={8}>
            <IconButton size="small">
              <PrintIcon />
            </IconButton>
          </Box>

          {/* Title */}
          <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: 8 }}>
            (১) পদক্ষেপ: নতুন আবেদন প্রাপ্তি
          </Typography>

          <Divider style={{ marginBottom: 12 }} />

          {/* Complaint Text */}
          <Typography variant="body2" component="div" gutterBottom>
            আবেদনকারী কর্তৃক{' '}
            <Box component="span" color="teal" fontWeight="fontWeightMedium">
              মীর মোফাজ্জল হোসেন, ব্যবস্থাপনা পরিচালক, কেন্দ্রীয় তহবিল
            </Box>{' '}
            এর নিকট আবেদন দাখিল।
          </Typography>

          {/* Date */}
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            তারিখ: বুধবার, ১৫ মে ২০২৫ : ১২:৫৫ অপরাহ্ন
          </Typography>

          {/* Details */}
          <Typography variant="subtitle2" style={{ marginTop: 16, fontWeight: 'bold' }}>
            বিস্তারিত
          </Typography>
          <Typography variant="body2" style={{ marginTop: 4 }}>
            আবেদনকারী একটি নতুন আবেদন জমা দিয়েছেন
          </Typography>
        </CardContent>
      </Card>
    </Box>
    </Box>
    );
  }
}

const mapStateToProps = (state) => ({
  application: state.workforce.application,
});

export default connect(mapStateToProps)(
  withStyles(styles)(ActionsApplicationPage)
);
