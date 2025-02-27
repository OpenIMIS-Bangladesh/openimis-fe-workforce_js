import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
import { Save } from "@material-ui/icons";
import {
  TextInput,
  journalize,
  PublishedComponent,
  FormattedMessage,
  formatMutation,
  decodeId,
} from "@openimis/fe-core";
import { createAccidentInfo } from "../../../actions";
import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";


const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddAccidentInfoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { submittingMutation, mutation, dispatch } = this.props;
    if (
      !submittingMutation &&
      prevProps.submittingMutation !== submittingMutation
    ) {
      dispatch(journalize(mutation));
    }
  }

  save = async () => {
    const { stateEdited } = this.state;
    const { dispatch } = this.props;

    const accidentInfoData = {
      firstNameBn: stateEdited?.firstNameBn || stateEdited.firstNameBn,
      lastNameBn: stateEdited?.lastNameBn || stateEdited.lastNameBn,
      otherName: stateEdited?.otherName || stateEdited.otherName,
      firstNameEn: stateEdited?.firstNameEn || stateEdited.firstNameEn,
      workforceEmployee: stateEdited.workforceEmployee,
    };

    console.log({ accidentInfoData });

    await dispatch(
      createAccidentInfo(
        accidentInfoData,
        `Created Accident Info ${stateEdited.title}`
      )
    );

    this.setState({ isSaved: true });
  };

  updateAttribute = (key, value) => {
    this.setState((prevState) => ({
      stateEdited: {
        ...prevState.stateEdited,
        [key]: value,
      },
      isSaved: false,
    }));
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;
    const isSaveDisabled = false;

    return (
      <div className={classes.page}>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage
                      module={MODULE_NAME}
                      id="Workforce Employee"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
              

                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={() => this.save()}
                    disabled={isSaveDisabled || isSaved}
                  >
                    <Save />
                  </IconButton>
                </Grid>
              </Grid>
              <Divider />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
});

export default connect(mapStateToProps)(
  withStyles(styles)(AddAccidentInfoPage)
);
