import React, { useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Button,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextInput,
  PublishedComponent,
  FormattedMessage,
  useTranslations,
  useModulesManager,
} from "@openimis/fe-core";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: "3px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
}));

const EmployeeDependentForm = ({
  formData,
  handleChange,
  addDependent,
  removeDependent,
}) => {
  const classes = useStyles();
  // const [dependents, setDependents] = useState([{}]);
  const [expanded, setExpanded] = useState(true);
  const modulesManager = useModulesManager();

  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );



  return (
    <Box mt={1}>
            <Box mb={4} textAlign="center" fontWeight="bold">
              <FormattedMessage id="workforce.application.header.dependent" module="workforce" />
            </Box>
              <Grid container className={classes.item} spacing={2}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.nid"
                    value={formData?.dependents?.nid || ""}
                    onChange={(v) => handleChange("nid", v,"dependent")}
                    type={"number"}
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.birthdate"}
                    value={formData?.dependents?.birthDate || ""}
                    onChange={(v) =>
                      handleChange("birthDate", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <EmployeeLifeStatusPicker
                    value={formData?.dependents?.lifeStatus || ""}
                    label={<FormattedMessage id="workforce.employee.lifeStatus" module="workforce"/>}
                    required
                    onChange={(v) =>
                      handleChange("lifeStatus", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label={"workforce.employee.deathdate"}
                    value={formData?.dependents?.deathDate || ""}
                    readOnly={formData?.dependents?.lifeStatus === "Deceased" ? false : true}
                    onChange={(v) =>
                      handleChange("deathDate", v,"dependent")
                    }
                  />
                </Grid>

              
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.name.bn"
                    value={formData?.dependents?.nameBn || ""}
                    onChange={(v) =>
                      handleChange("nameBn", v,"dependent")
                    }
                    required
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.name.en"
                    value={formData?.dependents?.nameEn || ""}
                    onChange={(v) =>
                      handleChange("nameEn", v,"dependent")
                    }
                    required
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.en"
                    value={formData?.dependents?.fatherNameEn || ""}
                    onChange={(v) =>
                      handleChange("fatherNameEn", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.fathers_name.bn"
                    value={formData?.dependents?.fatherNameBn || ""}
                    onChange={(v) =>
                      handleChange("fatherNameBn", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.en"
                    value={formData?.dependents?.motherNameEn || ""}
                    onChange={(v) =>
                      handleChange("motherNameEn", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.mothers_name.bn"
                    value={formData?.dependents?.motherNameBn || ""}
                    onChange={(v) =>
                      handleChange("motherNameBn", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <EmployeeGenderPicker
                    value={formData?.dependents?.gender || ""}
                    label={<FormattedMessage id="workforce.employee.gender" module="workforce"/>}
                    onChange={(v) => handleChange("gender", v,"dependent")}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.phone"
                    value={formData?.dependents?.phoneNumber || ""}
                    onChange={(v) =>
                      handleChange("phoneNumber", v,"dependent")
                    }
                    type={"number"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.email"
                    value={formData?.dependents?.email || ""}
                    onChange={(v) => handleChange("email", v,"dependent")}
                    type={"email"}
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.occupation"
                    value={formData?.dependents?.occupation || ""}
                    onChange={(v) =>
                      handleChange("occupation", v,"dependent")
                    }
                    type={"email"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.birth_certificate_no"
                    value={formData?.dependents?.birthCertificateNo || ""}
                    onChange={(v) =>
                      handleChange("birthCertificateNo", v,"dependent")
                    }
                    type={"number"}
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.marital_status"
                    value={formData?.dependents?.maritalStatus || ""}
                    onChange={(v) =>
                      handleChange("maritalStatus", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>

                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.present_address"
                    value={formData?.dependents?.presentAddress || ""}
                    onChange={(v) =>
                      handleChange("presentAddress", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="workforce.employee.permanent_address"
                    value={formData?.dependents?.permanentAddress || ""}
                    onChange={(v) =>
                      handleChange("permanentAddress", v,"dependent")
                    }
                    readOnly={false}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>{formatMessage("workforce.employee.present_location")}</p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={formData?.dependents?.presentLocation || null}
                    onChange={(presentLocation) =>
                      handleChange("presentLocation",presentLocation,"dependent")
                    }
                    readOnly={false}
                    required
                    split={true}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <p>
                    {formatMessage("workforce.employee.permanent_location")}
                  </p>
                  <PublishedComponent
                    pubRef="location.DetailedLocation"
                    withNull={true}
                    value={formData?.dependents?.permanentLocation || null}
                    onChange={(permanentLocation) =>
                      handleChange("permanentLocation",permanentLocation,"dependent")
                    }
                    readOnly={false}
                    required
                    split={true}
                  />
                </Grid>

                {/* <Grid item xs={11} className={classes.item} /> */}
                <Divider style={{ margin: "16px 0" }} />
                {/* <Grid item xs={12} className={classes.buttonContainer}>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor:
                        formData?.dependents.length === 1 ? "#B0B0B0" : "#d32f2f",
                      color: "white",
                    }}
                    onClick={() => removeDependent(index)}
                    disabled={formData?.dependents.length === 1}
                  >
                    <FormattedMessage module="workforce" id="workforce.application.steps.skip"/>
                  </Button>
                </Grid> */}
              </Grid>
      {/* <Button
        variant="contained"
        color="primary"
        onClick={addDependent}
        disabled={!isFirstDependentValid}
      >
        <FormattedMessage module="workforce" id="workforce.application.steps.dependentAdd"/>
      </Button> */}
    </Box>
  );
};

export default EmployeeDependentForm;
