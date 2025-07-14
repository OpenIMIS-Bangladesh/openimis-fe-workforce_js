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
  FormattedMessage,
  journalize,
} from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import PreviewDetails from "../../components/application-forms/PreviewDetails";
import ForwardApplicationAdminModal from "../../components/application-process/modals/ForwardApplicationAdminModal";
import { WORKFORCE_USER_TYPE } from "../../constants";
import { getUserTypeFromRights } from "../../utils/utils";

const styles = (theme) => ({
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
  overrideReadOnly: {
    "& .Mui-disabled": {
      color: `${theme.palette.text.primary} !important`,
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
      workforceEmployee: props?.application?.workforceEmployee || {},
      isForwardModalOpen: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({
        workforceEmployee: this.props.application?.workforceEmployee || {},
        stateEdited: this.props.application || {},
      });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  // ✅ Safe JSON parser
  safeParse = (data) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.warn("Failed to parse JSON:", data);
        return {};
      }
    }
    return data || {};
  };

  handleOpenForwardModal = () => {
    this.setState({ isForwardModalOpen: true });
  };

  handleCloseForwardModal = () => {
    this.setState({ isForwardModalOpen: false });
  };

  render() {
    const { classes, user_rights, application } = this.props;
    const { stateEdited, workforceEmployee, isForwardModalOpen } = this.state;

    const user_type = getUserTypeFromRights(user_rights);

    const bankInfo = this.safeParse(stateEdited?.employeeBankInfo)
    const AccidentInfo = this.safeParse(stateEdited?.employeeAccidentInfo)
    const dependentInfo = this.safeParse(stateEdited?.employeeDependentInfo)
    const childrenInfo = this.safeParse(stateEdited?.employeeChildrenInfo)
    const metaInfo = this.safeParse(stateEdited?.employeeChildrenInfo)

    // ✅ Safely parse nested stringified objects
    const formData = {
      ...stateEdited,
      workforceEmployee: workforceEmployee,
      employeeAccidentInfo: this.safeParse(AccidentInfo),
      employeeBankInfo: this.safeParse(bankInfo),
      employeeDependentInfo: this.safeParse(dependentInfo),
      employeeChildrenInfo: this.safeParse(childrenInfo),
      metadata: this.safeParse(metaInfo),
    };

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
                {/* Optional Forward Button */}
                {/* <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.handleOpenForwardModal}
                >
                  <FormattedMessage
                    module="workforce"
                    id="workforce.employee.application.forwardTo"
                  />
                </Button> */}
              </div>

              <ForwardApplicationAdminModal
                open={isForwardModalOpen}
                onClose={this.handleCloseForwardModal}
                application={application}
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
