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
import {updateWorkforceOrganizationUnit} from "../../actions";

import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { formatUnitGQL } from "../../utils/format_gql";


const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class EditWorkforceOrganizationUnitPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.organizationUnit || {},
      isSaved: false,
    };

  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.organizationUnit !== this.props.organizationUnit) {
      this.setState({ stateEdited: this.props.organizationUnit });
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

  save = async () => {
     const { stateEdited } = this.state; 
     const organizationUnitData = {
       organization: stateEdited?.organization,
       nameBn: stateEdited?.titleBn || stateEdited.nameBn,
       nameEn: stateEdited?.title || stateEdited.nameEn,
       phoneNumber: stateEdited?.phone || stateEdited.phoneNumber,
       email: stateEdited?.email || stateEdited.email,
       level: stateEdited?.level || stateEdited.level,
       id:stateEdited.id
     };
 
     await dispatch(
      updateWorkforceOrganizationUnit(
         organizationUnitData,
         `Update Organization Unit ${organizationUnitData.nameEn}`
       )
     );
 
     this.setState({ isSaved: true });
   };
 

  render() {

    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;
    const isSaveDisabled = false
    console.log({ stateEdited });

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
                    value={stateEdited.nameEn}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.name.bn"
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.unit.phone"
                    value={stateEdited.phoneNumber || ""}
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

  organizationUnit: state.workforce.organizationUnits,

});

export default connect(mapStateToProps)(withStyles(styles)(EditWorkforceOrganizationUnitPage));
