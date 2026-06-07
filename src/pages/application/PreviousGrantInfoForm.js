import React, { useEffect, useState } from "react";
import { Grid, Box, Paper, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useModulesManager,
  TextInput,
  FormattedMessage,
  PublishedComponent,
  parseData
} from "@openimis/fe-core";
import { useDispatch } from "react-redux";
import { fetchApplication } from "../../actions";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(2),
  },
  item: {
    marginTop: theme.spacing(1),
  }
}));

const PreviousGrantInfoForm = ({ handleChange, formData, setFormData, errors }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [previousApplicationData, setPreviousApplicationData] = useState([]);

  useEffect(() => {
    dispatch(fetchApplication(modulesManager, [`workforceEmployee_Nid: "${formData?.workforceEmployee?.nid}",application_Status:"approved_by_director"`]))
      .then((res) => {
        const response = parseData(res?.payload?.data?.workforceApplication);
        const firstItem = response?.[0];

        if (firstItem) {
          setPreviousApplicationData([firstItem]);
          const prefillData = firstItem.metadata || firstItem;
          
          setFormData((prev) => ({
            ...prev,
            metadata: {
              ...prev?.metadata,
              dateofReceipt: firstItem?.workforceApplicationMovements?.find(item => item?.status === "approved_by_director")?.dateCreated?.split("T")[0] || "",
              grantAmount: firstItem.grantAmount || "",
              // reasonforReceipt: prefillData.reasonforReceipt || "",
            },
          }));
        } else {
          setPreviousApplicationData([]);
        }
      });
  }, []);

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
                  pubRef="workforce.DatePicker"
                  label={"workforce.application.dateofReceipt"}
                  value={formData?.metadata?.dateofReceipt || ""}
                  onChange={(v) => handleChange("dateofReceipt", v)}
                  readOnly={false}
                />
              </Grid>
            
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  id="grantAmount"
                  label="workforce.application.grantAmount"
                  value={formData?.metadata?.grantAmount || ""}
                  onChange={(v) => handleChange("grantAmount", v)}
                  readOnly={false}
                  required
                  error={!!errors.grantAmount}
                  helperText={errors.grantAmount}
                />
              </Grid>
              <Grid item xs={12} className={classes.item}>
                <TextInput
                  id="reasonforReceipt"
                  label="workforce.application.reasonforReceipt"
                  value={formData?.metadata?.reasonforReceipt || ""}
                  onChange={(v) => handleChange("reasonforReceipt", v)}
                  readOnly={false}
                  error={!!errors.reasonforReceipt}
                  helperText={errors.reasonforReceipt}
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