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
import { updateOrganizationEMployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { number } from "prop-types";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class EditOrganizationEmployeePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.organizationEmployee || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.organizationEmployee !== this.props.organizationEmployee) {
      this.setState({ stateEdited: this.props.organizationEmployee });
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
    const organizationEmployeeData = {
      nameBn: stateEdited?.titleBn || stateEdited.nameBn,
      nameEn: stateEdited?.title || stateEdited.nameEn,
      phoneNumber: stateEdited?.phone || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      gender: stateEdited?.gender || stateEdited.gender,
      birthdate: stateEdited?.birthdate || stateEdited.birthdate,
      birthCertificateNo: stateEdited?.birthCertificateNo || stateEdited.birthCertificateNo,
      firstJoiningDate: stateEdited?.firstJoiningDate || stateEdited.firstJoiningDate,
      passportNo: stateEdited?.passportNo || stateEdited.passportNo,
      address: stateEdited?.address || stateEdited.address,
      location: stateEdited?.location || stateEdited.location,
      id: stateEdited.id,
    };

    dispatch(
      updateOrganizationEMployee(
        organizationEmployeeData,
        `Update Organization Employee ${organizationEmployeeData.nameEn}`
      )
    );
    console.log({ organizationEmployeeData });

    this.setState({ isSaved: true });
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
                      id="Organizations Employee"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.name.en"
                    value={stateEdited.nameEn}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.name.bn"
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phone", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.gender"
                    value={stateEdited.gender || ""}
                    onChange={(v) => this.updateAttribute("gender", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.organization.employee.birthdate"}
                    value={stateEdited.birthDate || ""}
                    onChange={(v) => this.updateAttribute("birthDate", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.organization.employee.joining_date"}
                    value={stateEdited.firstJoiningDate || ""}
                    onChange={(v) =>
                      this.updateAttribute("firstJoiningDate", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.birth_certificate_no"
                    value={stateEdited.birthCertificateNo || ""}
                    onChange={(v) =>
                      this.updateAttribute("birthCertificateNo", v)
                    }
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.nid"
                    value={stateEdited.birthDate || ""}
                    onChange={(v) => this.updateAttribute("nid", v)}
                    type={"number"}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.passport_no"
                    value={stateEdited.passportNo || ""}
                    onChange={(v) => this.updateAttribute("passportNo", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="workforce.organization.employee.address"
                    value={stateEdited.address || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={stateEdited.location || null}
                    onChange={(location) =>
                      this.updateAttribute("location", location)
                    }
                    readOnly={isSaved}
                    required
                    split={true}
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
  organizationEmployee: state.workforce.organizationEmployee,
});

export default connect(mapStateToProps)(
  withStyles(styles)(EditOrganizationEmployeePage)
);
