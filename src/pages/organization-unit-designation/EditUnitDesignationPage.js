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
import { updateUnitDesignation, updateWorkforceOrganizationUnit } from "../../actions";

import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { number } from "prop-types";
import OrganizationUnitPicker from "../../pickers/OrganizationUnitPicker";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class EditUnitDesignationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.unitDesignation || {},
      isSaved: false,
    };

  }

  componentDidUpdate(prevProps) {
    if (prevProps.unitDesignation !== this.props.unitDesignation) {
      this.setState({ stateEdited: this.props.unitDesignation });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  updateAttribute = (key, value) => {
    this.setState((prevState) => ({
      stateEdited: {
        ...prevState.stateEdited,
        [key]: value,
      },
      isSaved: false,
    }));
  };

  save = () => {
    const { grievanceConfig, dispatch } = this.props;
    const { stateEdited } = this.state;
    const organizationUnitDesignationData = {
      organization: stateEdited?.organization,
      unit: stateEdited?.unit,
      nameBn: stateEdited?.titleBn || stateEdited?.nameBn,
      nameEn: stateEdited?.title || stateEdited?.nameEn,
      designationSequence: stateEdited?.designationSequence || stateEdited?.sequence,
      designationLevel: stateEdited?.designationLevel || stateEdited?.level,
      id: stateEdited.id,
    };

    dispatch(
      updateUnitDesignation(
        organizationUnitDesignationData,
        `Update Organization Unit Designaiton ${organizationUnitDesignationData.nameEn}`,
      ),
    );
    console.log({ organizationUnitDesignationData });

    this.setState({ isSaved: true });
  };


  render() {

    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;
    const isSaveDisabled = false;
    console.log({stateEdited})

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
                      id="Organization Unit"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>

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
                    value={stateEdited.unit || null}
                    onChange={(option) => this.updateAttribute("unit", option)}
                    readOnly={isSaved}
                    label={<FormattedMessage module="workforce" id="workforce.organization.unit.picker" />}
                  />
                </Grid>


                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.name.en"
                    value={stateEdited.nameEn}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.name.bn"
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.sequence"
                    value={stateEdited.designationSequence || ""}
                    onChange={(v) => this.updateAttribute("sequence", v)}
                    required
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.designation.level"
                    value={stateEdited.designationLevel || ""}
                    onChange={(v) => this.updateAttribute("level", v)}
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
  // submittingMutation: state.grievanceSocialProtection.submittingMutation,
  // mutation: state.grievanceSocialProtection.mutation,
  // grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
  unitDesignation: state.workforce.unitDesignation,
});

export default connect(mapStateToProps)(withStyles(styles)(EditUnitDesignationPage));