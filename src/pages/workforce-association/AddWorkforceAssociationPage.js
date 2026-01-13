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
import { createWorkforceAssociation } from "../../actions";
import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddWorkforceAssociationPage extends Component {
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

  toggleSecondaryCalendar = () => {
    const isSecondaryCalendarEnabled = true;
    const { dispatch } = this.props;
    dispatch({
      type: "CORE_CALENDAR_TYPE_TOGGLE",
      payload: { isSecondaryCalendarEnabled },
    });
  };
  componentDidMount() {
    // this.toggleSecondaryCalendar()
  }

  save = async () => {
    const { stateEdited } = this.state;
    const { dispatch } = this.props;

    const workforceAssociationData = {
      nameBn: stateEdited?.nameBn || stateEdited.nameBn,
      nameEn: stateEdited?.nameEn || stateEdited.nameEn,
      shortNameBn: stateEdited?.shortNameBn || stateEdited.shortNameBn,
      shortNameEn: stateEdited?.shortNameEn || stateEdited.shortNameEn,
      phone: stateEdited?.phone || stateEdited.phone,
      email: stateEdited?.email || stateEdited.email,
      status: stateEdited?.status || stateEdited.status,
      webAddress: stateEdited?.webAddress || stateEdited.webAddress,
      startDate: stateEdited?.startDate || stateEdited.startDate,
      address: stateEdited?.address || stateEdited.address,
      minimumSalary: stateEdited?.minimumSalary || stateEdited.minimumSalary,
      workforceAssociation: stateEdited.workforceAssociation,
    };

    console.log({ workforceAssociationData });

    await dispatch(
      createWorkforceAssociation(
        workforceAssociationData,
        `Created Workforce Association ${stateEdited.title}`
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
                      id="Workforce Association"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.name.en"
                    value={stateEdited.nameEn || ""}
                    onChange={(v) => this.updateAttribute("nameEn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.name.bn"
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("nameBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="workforce.association.address"
                    value={stateEdited.presentAddress || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.webAddress"
                    value={stateEdited.webAddress || ""}
                    onChange={(v) => this.updateAttribute("webAddress", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforce.DatePicker"
                    label={"workforce.association.startDate"}
                    value={stateEdited.startDate || ""}
                    onChange={(v) =>
                      this.updateAttribute("startDate", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.phone"
                    value={stateEdited.phone || ""}
                    onChange={(v) => this.updateAttribute("phone", v)}
                    type={"number"}
                    readOnly={isSaved}
                    required
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.status"
                    value={stateEdited.status || ""}
                    onChange={(v) => this.updateAttribute("status", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.shortName.en"
                    value={stateEdited.shortNameEn || ""}
                    onChange={(v) => this.updateAttribute("shortNameEn", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.shortName.bn"
                    value={stateEdited.lastNameBn || ""}
                    onChange={(v) => this.updateAttribute("shortNameBn", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.association.minimumSalary"
                    value={stateEdited.minimumSalary || ""}
                    onChange={(v) => this.updateAttribute("minimumSalary", v)}
                    required
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

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
  withStyles(styles)(AddWorkforceAssociationPage)
);
