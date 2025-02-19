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
  decodeId,
} from "@openimis/fe-core";
import { updateWorkforceCompany, updateRepresentative } from "../../actions";
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

class ViewWorkforceCompanyPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.workforceCompany || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.workforceCompany !== this.props.workforceCompany) {
      this.setState({ stateEdited: this.props.workforceCompany });
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
    const { dispatch } = this.props;
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

    const workforceCompanyData = {
      nameBn: stateEdited?.titleBn || stateEdited.nameBn,
      nameEn: stateEdited?.title || stateEdited.nameEn,
      phoneNumber: stateEdited?.phone || stateEdited.phoneNumber,
      email: stateEdited?.email || stateEdited.email,
      gender: stateEdited?.gender || stateEdited.gender,
      birthDate: stateEdited?.birthDate || stateEdited.birthDate,
      birthCertificateNo:
        stateEdited?.birthCertificateNo || stateEdited.birthCertificateNo,
      firstJoiningDate:
        stateEdited?.firstJoiningDate || stateEdited.firstJoiningDate,
      passportNo: stateEdited?.passportNo || stateEdited.passportNo,
      address: stateEdited?.address || stateEdited.address,
      location: stateEdited?.location || stateEdited.location,
      associationName:
        stateEdited?.associationName || stateEdited.associationName,
      associationMembershipNumber:
        stateEdited?.associationMembershipNumber ||
        stateEdited.associationMembershipNumber,
      establishmentName:
        stateEdited?.establishmentName || stateEdited.establishmentName,
      establishment_date:
        stateEdited?.establishment_date || stateEdited.establishment_date,
      workforceRepresentativeId: stateEdited.workforceRepresentative.id,
      id: stateEdited.id,
      employerId: stateEdited?.employerId,
      employerIdLima: stateEdited?.employerIdLima,
      licenceType: stateEdited?.licenceType,
      businessSector: stateEdited?.businessSector,
    };

    dispatch(
      updateRepresentative(
        representativeData,
        `Update Representative ${representativeData.nameEn}`
      )
    );
    dispatch(
      updateWorkforceCompany(
        workforceCompanyData,
        `Update Workforce Company ${workforceCompanyData.nameEn}`
      )
    );
    console.log({ workforceCompanyData });

    this.setState({ isSaved: true });
  };

  render() {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;
    const isSaveDisabled = false;

    // const path = this.props.history.location.pathname.includes("approve")

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
                      id="Organizations Company details"
                      values={{ label: EMPTY_STRING }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.employerId"
                    value={stateEdited.employerId || ""}
                    onChange={(v) => this.updateAttribute("employerId", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.employerIdLima"
                    value={stateEdited.employerIdLima || ""}
                    onChange={(v) => this.updateAttribute("employerIdLima", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.name.en"
                    value={stateEdited.nameEn || ""}
                    onChange={(v) => this.updateAttribute("nameEn", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.name.bn"
                    value={stateEdited.nameBn || ""}
                    onChange={(v) => this.updateAttribute("nameBn", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.phone"
                    value={stateEdited.phoneNumber || ""}
                    onChange={(v) => this.updateAttribute("phoneNumber", v)}
                    type={"number"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.email"
                    value={stateEdited.email || ""}
                    onChange={(v) => this.updateAttribute("email", v)}
                    type={"email"}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.website"
                    value={stateEdited.website || ""}
                    onChange={(v) => this.updateAttribute("website", v)}
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.licence_type"
                    value={stateEdited.licenceType || ""}
                    onChange={(v) => this.updateAttribute("licenceType", v)}
                    readOnly={isSaved}
                    required
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.licence_number"
                    value={stateEdited.licenceNumber || ""}
                    onChange={(v) => this.updateAttribute("licenceNumber", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.business_sector"
                    value={stateEdited.businessSector || ""}
                    onChange={(v) => this.updateAttribute("businessSector", v)}
                    readOnly={isSaved}
                    required
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.company.foundation_date"}
                    value={stateEdited.foundationDate || ""}
                    onChange={(v) => this.updateAttribute("foundationDate", v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.association_name"
                    value={stateEdited.associationName || ""}
                    onChange={(v) => this.updateAttribute("associationName", v)}
                    readOnly={isSaved}
                    required
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.association_membership_number"
                    value={stateEdited.associationMembershipNumber || ""}
                    onChange={(v) =>
                      this.updateAttribute("associationMembershipNumber", v)
                    }
                    readOnly={isSaved}
                    required
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.establishment_Name"
                    value={stateEdited.establishmentName || ""}
                    onChange={(v) =>
                      this.updateAttribute("establishmentName", v)
                    }
                    readOnly={isSaved}
                    required
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.company.establishment_date"}
                    value={stateEdited.establishmentDate || ""}
                    onChange={(v) =>
                      this.updateAttribute("establishmentDate", v)
                    }
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.company.address"
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

                <Paper className={classes.paper}>
                  {/* <Divider /> */}
                  <Grid item xs={12} className={classes.item}>
                    <Typography>
                      <b> Factories</b>
                    </Typography>
                  </Grid>
                  <Grid container className={classes.item}>
                    {stateEdited?.factories?.length === 0 ? (
                      <Grid item xs={12} className={classes.item}>
                        <Typography> No Factories available</Typography>
                      </Grid>
                    ) : (
                      stateEdited?.factories?.map((factory) => (
                        <>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Factory Name En"
                              value={factory.nameEn || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Factory Name Bn"
                              value={factory.nameBn || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Factory Address"
                              value={factory.address || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Factory phoneNumber"
                              value={factory.phoneNumber || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Factory email"
                              value={factory.email || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Factory website"
                              value={factory.website || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={12} className={classes.item}>
                            <PublishedComponent
                              pubRef="location.DetailedLocation"
                              withNull={true}
                              value={factory.location || null}
                              readOnly={isSaved}
                              required
                              split={true}
                            />
                          </Grid>
                        </>
                      ))
                    )}
                  </Grid>
                </Paper>

                <Paper className={classes.paper}>
                  {/* <Divider /> */}
                  <Grid item xs={12} className={classes.item}>
                    <Typography>
                      <b> Offices</b>
                    </Typography>
                  </Grid>
                  <Grid container className={classes.item}>
                    {stateEdited?.offices?.length === 0 ? (
                      <Grid item xs={12} className={classes.item}>
                        <Typography> No Offices available</Typography>
                      </Grid>
                    ) : (
                      stateEdited?.offices?.map((office) => (
                        <>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Office Name En"
                              value={office.nameEn || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Office Name Bn"
                              value={office.nameBn || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Office Address"
                              value={office.address || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Office phoneNumber"
                              value={office.phoneNumber || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Office email"
                              value={office.email || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                            <TextInput
                              label="Office website"
                              value={office.website || ""}
                              // onChange={(v) => this.updateAttribute("nameEn", v)}
                              // required
                              // readOnly={isSaved}
                            />
                          </Grid>
                          <Grid item xs={12} className={classes.item}>
                            <PublishedComponent
                              pubRef="location.DetailedLocation"
                              withNull={true}
                              value={office.location || null}
                              readOnly={isSaved}
                              required
                              split={true}
                            />
                          </Grid>
                        </>
                      ))
                    )}
                  </Grid>
                </Paper>

                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  {/* <IconButton
                      variant="contained"
                      component="label"
                      color="primary"
                      onClick={this.save}
                      disabled={isSaveDisabled || isSaved}
                    >
                      <Save />
                    </IconButton> */}
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
  workforceCompany: state.workforce.workforceCompany,
});

export default connect(mapStateToProps)(
  withStyles(styles)(ViewWorkforceCompanyPage)
);
