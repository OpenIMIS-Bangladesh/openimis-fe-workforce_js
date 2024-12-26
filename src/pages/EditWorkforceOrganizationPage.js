import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import { updateOrganization } from "../actions";
import { EMPTY_STRING, MODULE_NAME } from "../constants";
import { makeStyles } from "@material-ui/core/styles";
import WorkforceForm from "../components/WorkforceForm";

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
}));

const EditWorkforceOrganizationPage = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Redux state
  const submittingMutation = useSelector(
    (state) => state.grievanceSocialProtection.submittingMutation
  );
  const mutation = useSelector(
    (state) => state.grievanceSocialProtection.mutation
  );
  const grievanceConfig = useSelector(
    (state) => state.grievanceSocialProtection.grievanceConfig
  );

  // Local state
  const [stateEdited, setStateEdited] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (props.organization) {
      setStateEdited(props.organization);
    }
  }, [props.organization]);

  // Effects
  useEffect(() => {
    if (!submittingMutation) {
      dispatch(journalize(mutation));
    }
  }, [submittingMutation, mutation, dispatch]);

  // Handlers
  const save = useCallback(() => {
    const representativeData = {
      type: "organization",
      nameBn: stateEdited.repNameBn,
      nameEn: stateEdited.repName,
      location: stateEdited.repLocation,
      address: stateEdited.repAddress,
      phoneNumber: stateEdited.repPhone,
      email: stateEdited.repEmail,
      nid: stateEdited.nid,
      passportNo: stateEdited.passport,
      birthDate: stateEdited.birthDate,
      position: stateEdited.position,
    };

    console.log("Saving Representative Data:", representativeData);

    dispatch(
      updateOrganization(
        representativeData,
        grievanceConfig,
        `Updated Representative ${representativeData.nameEn}`
      )
    );

    setIsSaved(true);
  }, [stateEdited, grievanceConfig, dispatch]);

  const updateAttribute = useCallback((key, value) => {
    setStateEdited((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsSaved(false);
  }, []);

  const isSaveDisabled = !(
    stateEdited.title &&
    stateEdited.address &&
    stateEdited.phone &&
    stateEdited.email &&
    stateEdited.website &&
    stateEdited.parent &&
    stateEdited.location
  );

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
                    id="Organization"
                    values={{ label: EMPTY_STRING }}
                  />
                </Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.item}>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.organization.name.en"
                  value={stateEdited.title || ""}
                  onChange={(v) => updateAttribute("title", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.organization.name.bn"
                  value={stateEdited.titleBn || ""}
                  onChange={(v) => updateAttribute("titleBn", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="workforceOrganization.ParentPicker"
                  value={stateEdited.parent || null}
                  onChange={(option) => updateAttribute("parent", option)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.organization.phone"
                  value={stateEdited.phone || ""}
                  onChange={(v) => updateAttribute("phone", v)}
                  required
                  type={"number"}
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.organization.email"
                  value={stateEdited.email || ""}
                  onChange={(v) => updateAttribute("email", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.organization.website"
                  value={stateEdited.website || ""}
                  onChange={(v) => updateAttribute("website", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={12} className={classes.item}>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={stateEdited.location || null}
                  onChange={(location) => updateAttribute("location", location)}
                  readOnly={isSaved}
                  required
                  split={true}
                  filterLabels={false}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.organization.address"
                  value={stateEdited.address || ""}
                  onChange={(v) => updateAttribute("address", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={12} className={classes.item}>
                <WorkforceForm
                  title={
                    <FormattedMessage
                      id="workforce.representative.info"
                      defaultMessage="Workforce Representative Info"
                    />
                  }
                  stateEdited={stateEdited}
                  isSaved={isSaved}
                  updateAttribute={updateAttribute}
                  fields={[
                    {
                      key: "repName",
                      label: "workforce.representative.name.en",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "repNameBn",
                      label: "workforce.representative.name.bn",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "position",
                      label: "workforce.representative.position",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "repPhone",
                      label: "workforce.representative.phone",
                      type: "number",
                      required: true,
                    },
                    {
                      key: "repEmail",
                      label: "workforce.representative.email",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "nid",
                      label: "workforce.representative.nid",
                      type: "number",
                      required: true,
                    },
                    {
                      key: "passport",
                      label: "workforce.representative.passport",
                      type: "text",
                      required: false,
                    },
                    
                    {
                      key: "repLocation",
                      label: "workforce.representative.location",
                      type: "location",
                      required: true,
                    },
                    {
                      key: "repAddress",
                      label: "workforce.representative.address",
                      type: "text",
                      required: true,
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
                  onClick={save}
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
};

export default EditWorkforceOrganizationPage;
