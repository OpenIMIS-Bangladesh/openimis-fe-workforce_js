import React from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  FormattedMessage,
  PublishedComponent,
} from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
}));

const PreviousGrantInfoForm = ({ handleChange, formData, setFormData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager,
  );

  const employeeData = useSelector(
    (state) => state.workforce[`workforceEmployee`] ?? []
  )

  return (
    <Box mt={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
             <Box mb={4} textAlign="center" fontWeight="bold">
               <FormattedMessage id="workforce.application.header.previousGrant" module="workforce" />
              </Box>
            <Grid container className={classes.item} spacing={2}>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  label={"workforce.application.dateofReceipt"}
                  value={formData.dateofReceipt || ""}
                  onChange={(v) => handleChange("dateofReceipt", v,"previousGrantInfo")}
                  readOnly={false}
                  
                />
              </Grid>
            
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.application.grantAmount"
                  value={formData.grantAmount || ""}
                  onChange={(v) => handleChange("grantAmount", v,"previousGrantInfo")}
                  readOnly={false}
                  
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.application.reasonforReceipt"
                  value={formData.reasonforReceipt || ""}
                  onChange={(v) => handleChange("reasonforReceipt", v,"previousGrantInfo")}
                  readOnly={false}
                  
                />
              </Grid>
            </Grid>
            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PreviousGrantInfoForm;
