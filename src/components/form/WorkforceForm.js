import React from "react";
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
  PublishedComponent,
  FormattedMessage,
} from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import { EMPTY_STRING } from "../../constants";

// import TextInput from "./TextInput"; // Replace with your actual TextInput component
// import PublishedComponent from "./PublishedComponent"; // Replace with your actual PublishedComponent

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
}));

const WorkforceForm = ({
                         title,
                         stateEdited,
                         isSaved,
                         updateAttribute,
                         save,
                         fields,
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
                    module="workforce"
                    id={title}
                    values={{ label: EMPTY_STRING }}
                  />
                </Typography>
              </Grid>
            </Grid>
            <Divider />

            <Grid container spacing={2} className={classes.item}>
              {fields.map((field, index) => (
                <Grid item xs={field.type === "location" ? 12 : 6} key={index} className={classes.item}>
                  {field.type === "text" && (
                    <TextInput
                      label={field.label}
                      value={field.value || stateEdited[field.key] || ""}
                      onChange={(v) => updateAttribute(field.key, v)}
                      required={field.required}
                      readOnly={isSaved}
                      type={field.inputType || "text"}
                    />
                  )}
                  {field.type === "number" && (
                    <TextInput
                      label={field.label}
                      value={field.value || stateEdited[field.key] || ""}
                      onChange={(v) => updateAttribute(field.key, v)}
                      required={field.required}
                      readOnly={isSaved}
                      type={field.type || "text"}
                    />
                  )}
                  {field.type === "email" && (
                    <TextInput
                      label={field.label}
                      value={field.value || stateEdited[field.key] || ""}
                      onChange={(v) => updateAttribute(field.key, v)}
                      required={field.required}
                      readOnly={isSaved}
                      type={"email"}
                    />
                  )}

                  {field.type === "date" && (
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      label={field.label}
                      value={field.value || stateEdited[field.key] || ""}
                      onChange={(v) => updateAttribute(field.key, v)}
                      readOnly={isSaved}
                      required={field.required}
                    />
                  )}

                  {field.type === "location" && (
                    <PublishedComponent
                      pubRef="location.DetailedLocation"
                      withNull={true}
                      split={true}
                      value={field.value}
                      onChange={(location) =>
                        updateAttribute("repLocation", location)
                      }
                      readOnly={isSaved}
                      required
                      // readOnly={false}
                      filterLabels={false}
                    />
                  )}
                  {field.type === "hidden" && (
                    <input
                      value={stateEdited[field.value] || ""}
                      onChange={(v) => updateAttribute(field.key, v)}
                      required={field.required}
                      readOnly={isSaved}
                      type={field.type || "hidden"}
                    />
                  )}
                </Grid>
              ))}

              {/* <Grid item xs={11} />
              <Grid item xs={1}>
                <IconButton
                  variant="contained"
                  component="label"
                  color="primary"
                  onClick={save}
                  disabled={
                    fields.some(
                      (field) => field.required && !stateEdited[field.key]
                    ) || isSaved
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

export default WorkforceForm;
