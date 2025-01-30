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
  decodeId
} from "@openimis/fe-core";
import { updateWorkforceFactory, updateRepresentative } from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import WorkforceForm from "../../components/form/WorkforceForm";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class EditWorkforceOfficePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.workforceFactory || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.workforceFactory !== this.props.workforceFactory) {
      this.setState({ stateEdited: this.props.workforceFactory });
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

    const representativeData = {
          type: "organization",
          nameBn:
            stateEdited?.repNameBn || stateEdited?.workforceRepresentative?.nameBn,
          nameEn:
            stateEdited?.repName || stateEdited?.workforceRepresentative?.nameEn,
          location:
            stateEdited?.repLocation ||
            stateEdited?.workforceRepresentative?.location,
          address:
            stateEdited?.repAddress ||
            stateEdited?.workforceRepresentative?.address,
          phoneNumber:
            stateEdited?.repPhone ||
            stateEdited?.workforceRepresentative?.phoneNumber,
          email:
            stateEdited?.repEmail || stateEdited?.workforceRepresentative?.email,
          nid: stateEdited?.nid || stateEdited?.workforceRepresentative?.nid,
          passportNo:
            stateEdited?.passport ||
            stateEdited?.workforceRepresentative?.passportNo,
          birthDate:
            stateEdited?.birthDate ||
            stateEdited?.workforceRepresentative?.birthDate,
          position:
            stateEdited?.position || stateEdited?.workforceRepresentative?.position,
          id: decodeId(stateEdited.workforceRepresentative.id),
        };

    const workforceFactoryData = {
      nameBn: stateEdited?.titleBn || stateEdited.nameBn,
      nameEn: stateEdited?.title || stateEdited.nameEn,
      phoneNumber: stateEdited?.phoneNumber || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      address: stateEdited?.address || stateEdited.address,
      website: stateEdited?.website || stateEdited.website,
      location: stateEdited?.location || stateEdited.location,
      workforceRepresentativeId: stateEdited.workforceRepresentative.id,
      id: stateEdited.id,
    };

    dispatch(
      updateRepresentative(
        representativeData,
        `Update Representative ${representativeData.nameEn}`
      )
    );

    dispatch(
      updateWorkforceFactory(
        workforceFactoryData,
        `Update Workforce Factory ${workforceFactoryData.nameEn}`
      )
    );
    console.log({ workforceFactoryData });

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
                      id="Workforce Factory"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.name.en"
                    value={stateEdited.nameEn || ""}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.name.bn"
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("titleBn", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phoneNumber", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.website"
                    value={stateEdited.website || ""}
                    onChange={(v) => this.updateAttribute("website", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.factory.address"
                    value={stateEdited.address || ""}
                    onChange={(v) => this.updateAttribute("address", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
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

                <Grid item xs={12} className={classes.item}>
                  <WorkforceForm
                    title="Workforce Representative Info"
                    stateEdited={stateEdited}
                    isSaved={isSaved}
                    updateAttribute={this.updateAttribute}
                    fields={[
                      {
                        key: "repName",
                        label: "workforce.representative.name.en",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.nameEn,
                      },
                      {
                        key: "repNameBn",
                        label: "workforce.representative.name.bn",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.nameBn,
                      },
                      {
                        key: "position",
                        label: "workforce.representative.position",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.position,
                      },
                      {
                        key: "repPhone",
                        label: "workforce.representative.phone",
                        type: "number",
                        required: true,
                        value: stateEdited.workforceRepresentative.phoneNumber,
                      },
                      {
                        key: "repEmail",
                        label: "workforce.representative.email",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.email,
                      },
                      {
                        key: "nid",
                        label: "workforce.representative.nid",
                        type: "number",
                        required: true,
                        value: stateEdited.workforceRepresentative.nid,
                      },
                      {
                        key: "birthDate",
                        label: "workforce.representative.birthDate",
                        type: "date",
                        required: false,
                        value: stateEdited.workforceRepresentative.birthDate,
                      },
                      {
                        key: "passport",
                        label: "workforce.representative.passport",
                        type: "text",
                        required: false,
                        value: stateEdited.workforceRepresentative.passportNo,
                      },
                      {
                        key: "repLocation",
                        label: "workforce.representative.location",
                        type: "location",
                        required: true,
                        value: stateEdited.workforceRepresentative.location,
                      },
                      {
                        key: "repAddress",
                        label: "workforce.representative.address",
                        type: "text",
                        required: true,
                        value: stateEdited.workforceRepresentative.address,
                      },
                    ]}
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
  workforceFactory: state.workforce.workforceFactory,
});

export default connect(mapStateToProps)(
  withStyles(styles)(EditWorkforceOfficePage)
);
