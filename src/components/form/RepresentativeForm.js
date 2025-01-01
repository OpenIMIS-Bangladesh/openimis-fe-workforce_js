import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
// import { Save } from "@mui/icons-material";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextInput,
  PublishedComponent,
  FormattedMessage,
} from "@openimis/fe-core";

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
}));

const RepresentativeForm = ({
  stateEdited,
  isSaved,
  updateAttribute,
//   classes,
  save,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.tableTitle}>
              <Grid item xs={12} className={classes.tableTitle}>
                <Typography>
                  <FormattedMessage
                    module="MODULE_NAME"
                    id="Workforce Representative info"
                    values={{ label: "" }}
                  />
                </Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.item}>
              {/* Name (English) */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.name.en"
                  value={stateEdited.repName || ""}
                  onChange={(v) => updateAttribute("repName", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* Name (Bangla) */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.name.bn"
                  value={stateEdited.repName || ""}
                  onChange={(v) => updateAttribute("repName", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* Position */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.position"
                  value={stateEdited.repPosition || ""}
                  onChange={(v) => updateAttribute("repPosition", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.phone"
                  value={stateEdited.repPhone || ""}
                  onChange={(v) => updateAttribute("repPhone", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.email"
                  value={stateEdited.repEmail || ""}
                  onChange={(v) => updateAttribute("repEmail", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* NID */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.nid"
                  value={stateEdited.repNid || ""}
                  onChange={(v) => updateAttribute("repNid", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* Passport */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.passport"
                  value={stateEdited.repPassport || ""}
                  onChange={(v) => updateAttribute("repPassport", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* Birth Date */}
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

              {/* Detailed Location */}
              <Grid item xs={12}>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  split={true}
                  readOnly={false}
                  filterLabels={false}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.representative.address"
                  value={stateEdited.repAddress || ""}
                  onChange={(v) => updateAttribute("repAddress", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              {/* Save Button */}
              {/* <Grid item xs={11} />
            <Grid item xs={1}>
              <IconButton
                variant="contained"
                component="label"
                color="primary"
                onClick={save}
                disabled={
                  !stateEdited.repName ||
                  !stateEdited.repPhone ||
                  !stateEdited.repAddress ||
                  isSaved
                }
              >
                <Save />
              </IconButton>
            </Grid> */}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default RepresentativeForm;
