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

import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { formatUnitGQL } from "../../utils/format_gql";
import { createWorkforceUnit } from "../../actions";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddWorkforceOrganizationUnitPage extends Component {
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
    const { dispatch } = this.props;


    const unitData = {
      type: "unit",
      nameBn: stateEdited.titleBn,
      nameEn: stateEdited.title,
      phoneNumber: stateEdited.phone,
      email: stateEdited.email,
      level: stateEdited.level,
      parent: stateEdited.parent,
    };


    const unitMutation = await formatMutation("createWorkforceUnit", formatUnitGQL(unitData), `Created Unit ${unitData.nameEn}`);

    await dispatch(
      createWorkforceUnit(
        unitMutation,
        `Created Unit ${unitData.nameEn}`,
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
                      id="Organization Unit"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>

                <Grid item xs={12} className={classes.item}>
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
                  <TextInput
                    label="workforce.organization.unit.name.en"
                    value={stateEdited.title || ""}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.name.bn"
                    value={stateEdited.titleBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>


                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.phone"
                    value={stateEdited.phone || ""}
                    onChange={(v) => this.updateAttribute("phone", v)}
                    required
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    required
                    type={"email"}
                    readOnly={isSaved}

                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.level"
                    value={stateEdited.level || ""}
                    onChange={(v) => this.updateAttribute("level", v)}
                    required
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
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
});

export default connect(mapStateToProps)(withStyles(styles)(AddWorkforceOrganizationUnitPage));
