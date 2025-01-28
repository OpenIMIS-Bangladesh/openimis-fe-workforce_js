import React, { Component } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
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
} from "@openimis/fe-core";
import { createOrganization } from "../actions";
import { EMPTY_STRING, MODULE_NAME } from "../constants";
import ParentPicker from "../pickers/ParentPicker";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class AddWorkforceOrganizationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
      grievantType: null,
      benefitPlan: null,
      isSaved: false,
    };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevPops, prevState, snapshort) {
    if (prevPops.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
  }

  save = () => {
    this.props.createOrganization(
      this.state.stateEdited,
      this.props.grievanceConfig,
      `Created Ticket ${this.state.stateEdited.title}`
    );
    this.setState({ isSaved: true });
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
      isSaved: false, // Reset isSaved when form is modified
    }));
  };

  // eslint-disable-next-line class-methods-use-this
  extractFieldFromJsonExt = (stateEdited, field) => {
    if (stateEdited && stateEdited.reporter && stateEdited.reporter.jsonExt) {
      const jsonExt = JSON.parse(stateEdited.reporter.jsonExt || "{}");
      return jsonExt[field] || "";
    }
    return "";
  };

  updateTypeOfGrievant = (field, value) => {
    this.updateAttribute("reporter", null);
    this.updateAttribute("reporterType", value);
    this.setState((state) => ({
      grievantType: value,
    }));
  };

  updateBenefitPlan = (field, value) => {
    this.updateAttribute("reporter", null);
    this.setState((state) => ({
      benefitPlan: value,
    }));
  };

  onChangeLocation = (newLocationFilters) => {
    const { onChangeFilters } = this.props;
    const locationFilters = { ...this.state.locationFilters };
    newLocationFilters.forEach((filter) => {
      if (filter.value === null) {
        delete locationFilters[filter.id];
      } else {
        locationFilters[filter.id] = {
          value: filter.value,
          filter: filter.filter,
        };
      }
    });
    const selectedDistrict = this.filterDistrict(locationFilters);
    this.setState({ locationFilters, selectedDistrict });
    const parentLocation = getParentLocation(locationFilters);
    const filters = [
      {
        id: "parentLocation",
        filter: parentLocation && `${parentLocation.key}: ${parentLocation.id}`,
      },
    ];
    onChangeFilters(filters);
  };

  render() {
    const {
      classes,
      titleone = " Ticket.ComplainantInformation",
      titletwo = "Organization",
      titlethree = "Workforce Representative info",
      titleParams = { label: EMPTY_STRING },
      filters,
    } = this.props;

    const { stateEdited, grievantType, benefitPlan, isSaved } = this.state;

    return (
      <div className={classes.page}>
        <Grid container>
          {/* <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={8} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titleone} values={titleParams} />
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.item}>
                <Grid item xs={3} className={classes.item}>

                </Grid>
                {grievantType === "individual" && (
                  <>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="socialProtection.BenefitPlanPicker"
                        withNull
                        label="socialProtection.benefitPlan"
                        value={benefitPlan}
                        onChange={(v) => this.updateBenefitPlan("benefitPlan", v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="individual.IndividualPicker"
                        value={stateEdited.reporter}
                        label="Complainant"
                        onChange={(v) => this.updateAttribute("reporter", v)}
                        benefitPlan={benefitPlan}
                        readOnly={isSaved}
                      />
                    </Grid>
                  </>
                )}
                {grievantType === "beneficiary" && (
                  <>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="socialProtection.BenefitPlanPicker"
                        withNull
                        label="socialProtection.benefitPlan"
                        value={benefitPlan}
                        onChange={(v) => this.updateBenefitPlan("benefitPlan", v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                    {benefitPlan && (
                      <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                          pubRef="socialProtection.BeneficiaryPicker"
                          value={stateEdited.reporter}
                          label="Complainant"
                          onChange={(v) => this.updateAttribute("reporter", v)}
                          benefitPlan={benefitPlan}
                          readOnly={isSaved}
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                {grievantType === "individual" && (
                  <>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.name"
                        value={!!stateEdited
                        && !!stateEdited.reporter
                          // eslint-disable-next-line max-len
                          ? `${stateEdited.reporter.firstName} ${stateEdited.reporter.lastName} ${stateEdited.reporter.dob}`
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute("name", v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.phone"
                        value={!!stateEdited && !!stateEdited.reporter
                          ? this.extractFieldFromJsonExt(stateEdited, "phone")
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute("phone", v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.email"
                        value={!!stateEdited && !!stateEdited.reporter
                          ? this.extractFieldFromJsonExt(stateEdited, "email")
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute("email", v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                  </>
                )}
                {grievantType === "beneficiary" && (
                  <>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.name"
                        value={!!stateEdited
                        && !!stateEdited.reporter
                          // eslint-disable-next-line max-len
                          ? `${stateEdited.reporter.individual.firstName} ${stateEdited.reporter.individual.lastName} ${stateEdited.reporter.individual.dob}`
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute("name", v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.phone"
                        value={!!stateEdited && !!stateEdited.reporter
                          ? this.extractFieldFromJsonExt(stateEdited, "phone")
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute("phone", v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.email"
                        value={!!stateEdited && !!stateEdited.reporter
                          ? this.extractFieldFromJsonExt(stateEdited, "email")
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute("email", v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid> */}
        </Grid>

        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage
                      module={MODULE_NAME}
                      id={titletwo}
                      values={titleParams}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.name.en"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.name.bn"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.address"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.phone"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.email"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.organization.website"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute("title", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    // value={value?.currentVillage ?? null}
                    split={true}
                    readOnly={false}
                    // onChange={onChangeLocation}
                    filterLabels={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  {/* <ParentPicker /> */}
                  <PublishedComponent
                    pubRef="workforceOrganization.ParentPicker"
                    // value={stateEdited.flags}
                    // onChange={(v) => this.updateAttribute("flags", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>

                {/* <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.FlagPicker"
                    value={stateEdited.flags}
                    onChange={(v) => this.updateAttribute("flags", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid> */}

                {/* <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.dateOfIncident"
                    value={stateEdited.dateOfIncident}
                    required={false}
                    onChange={(v) => this.updateAttribute("dateOfIncident", v)}
                    readOnly={isSaved}
                  />
                </Grid> */}
                {/* <Grid container>
                  
                </Grid> */}
                {/* <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="location.DetailedLocationFilter"
                      withNull={true}
                      label='location'
                      // filters={filters}
                      onChangeFilters={this.onChangeLocation}
                      anchor="parentLocation"
                    />
                  </Grid> */}
                {/* <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.DropDownCategoryPicker"
                    value={stateEdited.category}
                    onChange={(v) => this.updateAttribute("category", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.FlagPicker"
                    value={stateEdited.flags}
                    onChange={(v) => this.updateAttribute("flags", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.ChannelPicker"
                    value={stateEdited.channel}
                    onChange={(v) => this.updateAttribute("channel", v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.TicketPriorityPicker"
                    value={stateEdited.priority}
                    onChange={(v) => this.updateAttribute("priority", v)}
                    required={false}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="admin.UserPicker"
                    value={stateEdited.attendingStaff}
                    module="core"
                    onChange={(v) => this.updateAttribute("attendingStaff", v)}
                    readOnly={isSaved}
                  />
                </Grid> */}
                {/* <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.ticketDescription"
                    value={stateEdited.description}
                    onChange={(v) => this.updateAttribute("description", v)}
                    required={false}
                    readOnly={isSaved}
                  />
                </Grid> */}
                {/* <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={this.save}
                    // eslint-disable-next-line max-len
                    disabled={
                      !stateEdited.channel ||
                      !stateEdited.flags ||
                      !stateEdited.channel ||
                      !stateEdited.title ||
                      isSaved
                    }
                  >
                    <Save />
                  </IconButton>
                </Grid> */}
              </Grid>
              <Divider />
              <Grid container>
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <Grid container className={classes.tableTitle}>
                      <Grid item xs={12} className={classes.tableTitle}>
                        <Typography>
                          <FormattedMessage
                            module={MODULE_NAME}
                            id={titlethree}
                            values={titleParams}
                          />
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                    <Grid container className={classes.item}>
                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.name.en"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          readOnly={isSaved}
                        />
                      </Grid>
                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.name.bn"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.position"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.phone"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.email"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.nid"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          type={"number"}
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.passport"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          readOnly={isSaved}
                        />
                      </Grid>
                      <Grid item xs={6} className={classes.item}>
                        <PublishedComponent
                          pubRef="core.DatePicker"
                          label="workforce.representative.birthDate"
                          value={stateEdited.dateOfIncident}
                          required={false}
                          onChange={(v) =>
                            this.updateAttribute("dateOfIncident", v)
                          }
                          readOnly={isSaved}
                        />
                      </Grid>

                      <Grid item xs={12} className={classes.item}>
                        <PublishedComponent
                          pubRef="location.DetailedLocation"
                          withNull={true}
                          // value={value?.currentVillage ?? null}
                          split={true}
                          readOnly={false}
                          // onChange={onChangeLocation}
                          filterLabels={false}
                        />
                      </Grid>

                      <Grid item xs={6} className={classes.item}>
                        <TextInput
                          label="workforce.representative.address"
                          value={stateEdited.title}
                          onChange={(v) => this.updateAttribute("title", v)}
                          required
                          readOnly={isSaved}
                        />
                      </Grid>

                      {/* <Grid item xs={6} className={classes.item}>
                  <ParentPicker />
                  <PublishedComponent
                    pubRef="workforceOrganization.ParentPicker"
                    // value={stateEdited.flags}
                    // onChange={(v) => this.updateAttribute("flags", v)}
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
                          // eslint-disable-next-line max-len
                          disabled={
                            !stateEdited.channel ||
                            !stateEdited.flags ||
                            !stateEdited.channel ||
                            !stateEdited.title ||
                            isSaved
                          }
                        >
                          <Save />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
  grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ createOrganization, journalize }, dispatch);

export default withTheme(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(AddWorkforceOrganizationPage)
  )
);



<Grid container>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Grid container className={classes.tableTitle}>
                    <Grid item xs={12} className={classes.tableTitle}>
                      <Typography>
                        <FormattedMessage
                          module={MODULE_NAME}
                          id="Workforce Representative info"
                          values={{ label: EMPTY_STRING }}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider />

                  <Grid container className={classes.item}>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.name.en"
                        value={stateEdited.repName || ""}
                        onChange={(v) => updateAttribute("repName", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.name.bn"
                        value={stateEdited.repName || ""}
                        onChange={(v) => updateAttribute("repName", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.position"
                        value={stateEdited.repName || ""}
                        onChange={(v) => updateAttribute("repName", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.phone"
                        value={stateEdited.repName || ""}
                        onChange={(v) => updateAttribute("repName", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.email"
                        value={stateEdited.repName || ""}
                        onChange={(v) => updateAttribute("repName", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.nid"
                        value={stateEdited.repName || ""}
                        onChange={(v) => updateAttribute("repName", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.passport"
                        value={stateEdited.repName || ""}
                        onChange={(v) => updateAttribute("repName", v)}
                        required
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={6} className={classes.item}>
                      <PublishedComponent
                        pubRef="core.DatePicker"
                        label="workforce.representative.birthDate"
                        value={stateEdited.dateOfIncident}
                        required={false}
                        onChange={(v) => updateAttribute("dateOfIncident", v)}
                        readOnly={isSaved}
                      />
                    </Grid>

                    <Grid item xs={12} className={classes.item}>
                      <PublishedComponent
                        pubRef="location.DetailedLocation"
                        withNull={true}
                        // value={value?.currentVillage ?? null}
                        split={true}
                        readOnly={false}
                        // onChange={onChangeLocation}
                        filterLabels={false}
                      />
                    </Grid>
                    <Grid item xs={6} className={classes.item}>
                      <TextInput
                        label="workforce.representative.address"
                        value={stateEdited.title}
                        onChange={(v) => updateAttribute("title", v)}
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
                        onClick={save}
                        disabled={
                          !stateEdited.title ||
                          !stateEdited.address ||
                          !stateEdited.phone ||
                          isSaved
                        }
                      >
                        <Save />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>


<RepresentativeForm
                  stateEdited={stateEdited}
                  isSaved={isSaved}
                  updateAttribute={updateAttribute}
                  // classes={classes}
                  // save={save}
                />


import React, { useState, useEffect, useRef } from 'react';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import PrintIcon from '@material-ui/icons/Print';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Button,
} from '@material-ui/core';
import {
  journalize,
  TextInput,
  PublishedComponent,
  FormattedMessage,
} from '@openimis/fe-core';
import _ from 'lodash';
import { Save } from '@material-ui/icons';
import { updateOrganization, fetchOrganization } from '../actions';
import { EMPTY_STRING, MODULE_NAME } from '../constants';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

const EditWorkforceOrganizationPage = (props) => {
  const {
    classes,
    titleone = ' Ticket.ComplainantInformation',
    titletwo = ' Ticket.DescriptionOfEvents',
    titlethree = ' Ticket.Resolution',
    titleParams = { label: EMPTY_STRING },
    grievanceConfig,
    readOnly: propsReadOnly,
  } = props;

  const [stateEdited, setStateEdited] = useState(props.ticket);
  const [comments, setComments] = useState(props.comments);
  const [reporter, setReporter] = useState({});

  const componentRef = useRef();

  useEffect(() => {
    if (props.edited_id) {
      setStateEdited(props.ticket);
      setReporter(
        props.ticket.reporter
          ? JSON.parse(JSON.parse(props.ticket.reporter || '{}'), '{}')
          : {}
      );
    }
  }, [props.edited_id, props.ticket]);

  useEffect(() => {
    if (props.submittingMutation && !props.submittingMutation) {
      props.journalize(props.mutation);
    }
  }, [props.submittingMutation, props.mutation]);

  const save = () => {
    props.updateOrganization(
      stateEdited,
      `updated ticket ${stateEdited.code}`
    );
  };

  const updateAttribute = (key, value) => {
    setStateEdited((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const extractFieldFromJsonExt = (reporter, field) => {
    return reporter?.jsonExt?.[field] || '';
  };

  const doesTicketChange = () => {
    return !_.isEqual(props.ticket, stateEdited);
  };

  return (
    <div className={classes.page}>
      <Grid container>
        <Grid item xs={12}>
          {stateEdited.reporter && (
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={8} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage
                      module={MODULE_NAME}
                      id={titleone}
                      values={titleParams}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.item}>
                {stateEdited.reporterTypeName === 'individual' && (
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="individual.IndividualPicker"
                      value={reporter}
                      onChange={(value) => updateAttribute('reporter', value)}
                      label="Complainant"
                      readOnly
                    />
                  </Grid>
                )}
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                {stateEdited.reporterTypeName === 'individual' && (
                  <>
                    <Grid item xs={4} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.name"
                        value={
                          reporter?.individual
                            ? `${reporter.individual.firstName} ${reporter.individual.lastName} ${reporter.individual.dob}`
                            : `${reporter?.firstName} ${reporter?.lastName} ${reporter?.dob}`
                        }
                        onChange={(value) => updateAttribute('name', value)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={4} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.phone"
                        value={extractFieldFromJsonExt(reporter, 'phone')}
                        onChange={(value) => updateAttribute('phone', value)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={4} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.email"
                        value={extractFieldFromJsonExt(reporter, 'email')}
                        onChange={(value) => updateAttribute('email', value)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                  </>
                )}
                {stateEdited.reporterTypeName === 'beneficiary' && (
                  <>
                    <Grid item xs={4} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.nationalId"
                        value={reporter?.jsonExt?.national_id || ''}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={4} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.email"
                        value={extractFieldFromJsonExt(reporter, 'email')}
                        onChange={(value) => updateAttribute('email', value)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.tableTitle} alignItems="center">
              <Grid item xs={8} className={classes.tableTitle}>
                <Typography>
                  <FormattedMessage
                    module={MODULE_NAME}
                    id={titletwo}
                    values={titleParams}
                  />
                </Typography>
              </Grid>
              <Grid item xs={4} style={{ textAlign: 'right' }}>
                <ReactToPrint content={() => componentRef.current}>
                  <PrintContextConsumer>
                    {({ handlePrint }) => (
                      <IconButton
                        variant="contained"
                        component="label"
                        onClick={handlePrint}
                      >
                        <PrintIcon />
                      </IconButton>
                    )}
                  </PrintContextConsumer>
                </ReactToPrint>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.item}>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="ticket.title"
                  value={stateEdited.title}
                  onChange={(value) => updateAttribute('title', value)}
                  required
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label="ticket.dateOfIncident"
                  value={stateEdited.dateOfIncident}
                  onChange={(value) => updateAttribute('dateOfIncident', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.DropDownCategoryPicker"
                  value={stateEdited.category}
                  onChange={(value) => updateAttribute('category', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.FlagPicker"
                  value={stateEdited.flags}
                  onChange={(value) => updateAttribute('flags', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.ChannelPicker"
                  value={stateEdited.channel}
                  onChange={(value) => updateAttribute('channel', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.TicketPriorityPicker"
                  value={stateEdited.priority}
                  onChange={(value) => updateAttribute('priority', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="admin.UserPicker"
                  value={stateEdited.attendingStaff}
                  onChange={(value) => updateAttribute('attendingStaff', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.TicketStatusPicker"
                  value={stateEdited.status}
                  onChange={(value) => updateAttribute('status', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="ticket.description"
                  value={stateEdited.description}
                  onChange={(value) => updateAttribute('description', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.tableTitle}>
              <Grid item xs={12} className={classes.tableTitle}>
                <Typography>
                  <FormattedMessage
                    module={MODULE_NAME}
                    id={titlethree}
                    values={titleParams}
                  />
                </Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.item}>
              <Grid item xs={4} className={classes.item}>
                <TextInput
                  label="ticket.resolution"
                  value={stateEdited.resolution}
                  onChange={(value) => updateAttribute('resolution', value)}
                  readOnly={propsReadOnly}
                />
              </Grid>
              <Grid item xs={11} className={classes.item} />
              <Grid item xs={1} className={classes.item}>
                <IconButton
                  variant="contained"
                  component="label"
                  color="primary"
                  onClick={save}
                  disabled={propsReadOnly || !doesTicketChange()}
                >
                  <Save />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <div style={{ display: 'none' }}>
        {/* <TicketPrintTemplate */}
        {/* ref={(el) => (componentRef.current = el)} */}
        {/* ticket={stateEdited} */}
        {/* reporter={reporter} */}
        {/* comments={comments} */}
        {/* /> */}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  submittingMutation: state.workforce.submittingMutation,
  mutation: state.workforce.mutation,
  fetchingTicket: state.workforce.fetchingTicket,
  errorTicket: state.workforce.errorTicket,
  fetchedTicket: state.workforce.fetchedTicket,
  ticket: state.workforce.ticket,
  grievanceConfig: state.workforce.grievanceConfig,
  comments: state.workforce.ticketComments,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchOrganization,
      updateOrganization,
      journalize,
    },
    dispatch
  );

export default withTheme(
  withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(EditWorkforceOrganizationPage)
  )
);
