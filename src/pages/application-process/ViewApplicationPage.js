import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Card,
  Button,
  Box,
} from "@material-ui/core";
import {
  TextInput,
  journalize,
  PublishedComponent,
  FormattedMessage,
} from "@openimis/fe-core";
import { updateOrganizationEmployee } from "../../actions";
import {
  EMPTY_STRING,
  MODULE_NAME,
  WORKFORCE_USER_TYPE,
} from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import PreviewDetails from "../../components/application-forms/PreviewDetails";
import { getUserType, getUserTypeFromRights } from "../../utils/utils";
import ForwardApplicationAdminModal from "../../components/application-process/ForwardApplicationAdminModal";

const styles = (theme) => ({
  // paper: theme.paper.paper,
  paper: {
    padding: theme.spacing(1),
    width: "100%",
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
      color: `${theme.palette.text.primary} !important`, // Ensures text remains default color
    },
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
});

class ViewApplicationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.application || {},
      workforceEmployee: props.application.workforceEmployee || {},
      parseAccidentInfo:
        JSON.parse(props.application.employeeAccidentInfo) || {},
      parseBankInfo: JSON.parse(props.application.employeeBankInfo) || {},
      parseDependentInfo:
        JSON.parse(props.application.employeeDependentInfo) || {},
      isSaved: false,
      isForwardModalOpen: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({ workforceEmployee: this.props.application });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  handleOpenForwardModal = () => {
    this.setState({ isForwardModalOpen: true });
  };

  handleCloseForwardModal = () => {
    this.setState({ isForwardModalOpen: false });
  };

  render() {
    const { classes, user_rights } = this.props;
    const {
      stateEdited,
      workforceEmployee,
      isSaved,
      parseAccidentInfo,
      parseBankInfo,
      parseDependentInfo,
    } = this.state;
    const isSaveDisabled = false;
    const AccidentInfo = parseAccidentInfo?.parseAccidentInfo;
    const BankInfo = JSON.parse(parseBankInfo);
    const DependentInfo = JSON.parse(parseDependentInfo);

    const user_type = getUserTypeFromRights(user_rights);

    const formData = {
      ...stateEdited,
      workforceEmployee: workforceEmployee,
      employeeAccidentInfo: AccidentInfo,
      employeeBankInfo: BankInfo,
      employeeDependentInfo: DependentInfo,
    };
    console.log({ stateEdited });
    console.log({ workforceEmployee });
    console.log({ AccidentInfo });
    console.log({ BankInfo });
    console.log({ DependentInfo });

    return (
      <div className={classes.container}>
        <Box p={0} className={classes.paper}>
          <PreviewDetails formData={formData} />
          {user_type === WORKFORCE_USER_TYPE.ADMIN && (
            <>
            <div className={classes.buttonContainer}>
              <Button
                variant="outlined"
                style={{ backgroundColor: "#D10000", color: "white" }}
              >
                <FormattedMessage
                  module="workforce"
                  id="workforce.application.reject"
                />
              </Button>
              <Button variant="contained" color="primary">
                <FormattedMessage
                  module="workforce"
                  id="workforce.application.approve"
                />
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={this.handleOpenForwardModal}
              >
                <FormattedMessage
                  module="workforce"
                  id="workforce.employee.application.forwardTo"
                />
              </Button>
            </div>
            <ForwardApplicationAdminModal
            open={this.state.isForwardModalOpen}
            onClose={this.handleCloseForwardModal}
            application={this.props.application}
          />
          </>
          )}
        </Box>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  application: state.workforce.application,
  user_rights: state.core?.user?.i_user?.rights || {},
});

export default connect(mapStateToProps)(
  withStyles(styles)(ViewApplicationPage)
);
