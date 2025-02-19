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
} from "@openimis/fe-core";
import {
  createRepresentative,
  createUnitDesignation,
  createWorkforceOrganization,
  fetchRepresentativeByClientMutationId,
} from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import WorkforceForm from "../../components/form/WorkforceForm";
import { formatRepresentativeGQL } from "../../utils/format_gql";
import OrganizationUnitPicker from "../../pickers/OrganizationUnitPicker";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddUnitDesignationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { submittingMutation, mutation, dispatch } = this.props;
    if (!submittingMutation && prevProps.submittingMutation !== submittingMutation) {
      dispatch(journalize(mutation));
    }
  }

  save = async () => {
    const { stateEdited } = this.state;
    const { grievanceConfig, dispatch } = this.props;

    const unitDesignationData = {
      nameBn: stateEdited.titleBn,
      nameEn: stateEdited.title,
      organization: stateEdited.organization,
      unit: stateEdited.unit,
      designationLevel: stateEdited.level,
      designationSequence: stateEdited.sequence,
    };
    console.log({ unitDesignationData });

    await dispatch(
      createUnitDesignation(
        unitDesignationData,
        `Created unit designation ${unitDesignationData.nameEn}`,
      ),
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

    // const isSaveDisabled = !(
    //   stateEdited.title &&
    //   stateEdited.address &&
    //   stateEdited.phone &&
    //   stateEdited.email &&
    //   stateEdited.website &&
    //   stateEdited.parent &&
    //   stateEdited.location
    // );

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
                      id="Unit Designations"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.name.en"
                    value={stateEdited.title || ""}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.name.bn"
                    value={stateEdited.titleBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="workforceOrganization.OrganizationPicker"
                    value={stateEdited.organization || null}
                    label={<FormattedMessage module="workforce" id="workforce.organization.picker" />}
                    onChange={(option) => this.updateAttribute("organization", option)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                <OrganizationUnitPicker
                    value={stateEdited.parent || null}
                    onChange={(option) => this.updateAttribute("unit", option)}
                    readOnly={isSaved}
                    label={<FormattedMessage module="workforce" id="workforce.organization.unit.picker" />}
                  />
                </Grid>
                

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.level"
                    value={stateEdited.level || ""}
                    onChange={(v) => this.updateAttribute("level", v)}
                    required
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.sequence"
                    value={stateEdited.sequence || ""}
                    onChange={(v) => this.updateAttribute("sequence", v)}
                    required
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                {/* <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    required
                    type={"email"}
                    readOnly={isSaved}

                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.website"
                    value={stateEdited.website || ""}
                    onChange={(v) => this.updateAttribute("website", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={12} className={classes.item}>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.location || null}
                    onChange={(location) => this.updateAttribute("location", location)}
                    readOnly={isSaved}
                    required
                    split={true}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.address"
                    value={stateEdited.address || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid> */}

                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={this.save}
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
  representativeId: state.workforce.fetchedRepresentativeByClientMutationId,
  grievanceConfig: state.workforce.grievanceConfig,
});

export default connect(mapStateToProps)(withStyles(styles)(AddUnitDesignationPage));
