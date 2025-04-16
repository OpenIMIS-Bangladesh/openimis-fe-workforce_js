import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid, Card, CardContent, Typography, Button,
  TextField, Dialog, DialogContent, IconButton,Divider
} from "@material-ui/core";
import {
  TextInput,
  journalize,
  PublishedComponent,
  FormattedMessage,
} from "@openimis/fe-core";
import CloseIcon from '@material-ui/icons/Close';
import { updateOrganizationEmployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Document, Page } from 'react-pdf';
import clsx from "clsx";

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
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
  overrideReadOnly: {
    "& .Mui-disabled": {
      color: `${theme.palette.text.primary} !important`,
    },
  },
});

class VerifyApplicationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.application.workforceEmployee || {},
      parseAccidentInfo: JSON.parse(props.application.employeeAccidentInfo || "{}"),
      parseBankInfo: JSON.parse(props.application.employeeBankInfo || "{}"),
      parseDependentInfo: JSON.parse(props.application.employeeDependentInfo || "{}"),
      isSaved: false,
      preview: null,
      mockFiles: [
        { type: "image", src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Smart_NID_Card_%28Bangladesh%29.jpg" },
        { type: "pdf", src: "/assets/Fahim_tazwer_cv.pdf" },
      ],
      comment: "",
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

  handlePreviewOpen = (file) => {
    this.setState({ preview: file });
  };

  handlePreviewClose = () => {
    this.setState({ preview: null });
  };

  handleCommentChange = (event) => {
    this.setState({ comment: event.target.value });
  };

  handleVerify = () => {
    console.log("Verified with comment:", this.state.comment);
  };

  handleReject = () => {
    console.log("Rejected with comment:", this.state.comment);
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved, preview, mockFiles, comment } = this.state;

    console.log({stateEdited})
    return (
      <Grid container spacing={3}>
        {/* User Summary */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6"><b><FormattedMessage module="workforce" id="workforce.employee.details" /></b></Typography>
              <Divider />
              <Typography><b><FormattedMessage module="workforce" id="workforce.employee.first.name.en" /></b> : {stateEdited.firstNameBn}</Typography>
              <Typography><b><FormattedMessage module="workforce" id="workforce.employee.nid" /></b> : {stateEdited.nid}</Typography>
              <Typography><b><FormattedMessage module="workforce" id="workforce.employee.phone" /></b> : {stateEdited.phoneNumber}</Typography>
              <Typography><b><FormattedMessage module="workforce" id="workforce.employee.present_address" /></b> : {stateEdited.presentAddress}</Typography>
              <Typography><b><FormattedMessage module="workforce" id="workforce.employee.email" /></b> : {stateEdited.email}</Typography>
              <Typography><b><FormattedMessage module="workforce" id="workforce.employee.birth_certificate_no" /></b> : {stateEdited.email}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents Preview */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Documents</Typography>
              <Grid container spacing={2}>
                {mockFiles.map((file, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <div
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        padding: 8,
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                      onClick={() => this.handlePreviewOpen(file)}
                    >
                      {file.type === "image" ? (
                        <img
                          src={file.src}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: 100,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Typography variant="body2">📄 PDF Document</Typography>
                      )}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Comment + Actions */}
          <Grid container spacing={2} style={{ marginTop: 12 }} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                label="Comment"
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={2}
                value={comment}
                onChange={this.handleCommentChange}
              />
            </Grid>
            <Grid item xs={12} sm={4} style={{ display: "flex", gap: 8 }}>
              <Button variant="contained" color="primary" fullWidth onClick={this.handleVerify}>
                Verify
              </Button>
              <Button variant="outlined" color="error" fullWidth onClick={this.handleReject}>
                Reject
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Preview Modal */}
        <Dialog
          open={!!preview}
          onClose={this.handlePreviewClose}
          maxWidth="md"
          fullWidth
        >
          <DialogContent style={{ position: "relative" }}>
            <IconButton
              onClick={this.handlePreviewClose}
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>

            {preview && preview.type === "image" ? (
              <img src={preview.src} alt="Full Preview" style={{ width: "100%" }} />
            ) : preview && preview.type === "pdf" ? (
              <Document file={preview.src}>
                <Page pageNumber={1} />
              </Document>
            ) : null}
          </DialogContent>
        </Dialog>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  application: state.workforce.application,
});

export default connect(mapStateToProps)(
  withStyles(styles)(VerifyApplicationPage)
);
