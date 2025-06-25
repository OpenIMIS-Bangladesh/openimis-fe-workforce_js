import React, { useEffect, useState } from "react";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
  useParams,
} from "@openimis/fe-core";
import {
  Paper,
  Button,
  IconButton,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ApplicationTypeSelector from "./ApplicationTypeSelector";
import MedicalAssistanceForm from "./applicationForms/MedicalAssistanceForm";
import MedicalDonationForm from "./applicationForms/MedicalDonationForm";
import DisabilityForm from "./applicationForms/DisabilityForm";
import EducationGrantForm from "./applicationForms/EducationGrantForm";
import FinancialAssistanceForm from "./applicationForms/FinancialAssistanceForm";
import ScholarshipApplicationForm from "./applicationForms/ScholarshipApplicationForm";
import { getParsedApplication } from "../../utils/utils";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  subPaper: {
    padding: theme.spacing(1),
    width: "100%", // Ensures it doesn't overflow
    maxWidth: 650, // Restrict max width
    margin: "auto", // Centers the Paper component
  },
  paper: {
    padding: theme.spacing(1),
    width: "100%",
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
  backButtonContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
  },
  backText: {
    marginLeft: theme.spacing(1),
    fontWeight: "bold",
  },
  title: {
    fontWeight: 800,
  },
  section: {
    marginTop: theme.spacing(1),
  },
}));

const MultiStepApplyForm = () => {
  const classes = useStyles();
  const modulesManager = useModulesManager()
  const { application_uuid } = useParams();
  const dispatch = useDispatch();
  const [parsedApplicationData, setParsedApplicationData] = useState();
  const [showForm, setShowForm] = useState(false);
  const [applicationForSelf, setApplicationForSelf] = useState("");
  const [organizationType, setOrganizationType] = useState("" || parsedApplicationData?.organizationType);
  const [selectedApplicationType, setSelectedApplicationType] = useState("" ||parsedApplicationData?.applicationType);
  const [isApplicationForSelfSelected, setIsApplicationForSelfSelected] = useState(true);

  useEffect(async () => {
    const fetchData = async () => {
      const filters = [`id: "${application_uuid}"`];
      const parsedData = await dispatch(
        getParsedApplication(modulesManager, filters)
      );
      setParsedApplicationData(parsedData); // <- parsed data will now be set correctly
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!parsedApplicationData?.employeeDependentInfo) return;
    const hasNoDependents =
      parsedApplicationData?.employeeDependentInfo.length === 0 ||
      parsedApplicationData?.employeeDependentInfo.every(
        (dep) => Object.keys(dep).length === 0
      );

    setApplicationForSelf(hasNoDependents ? "yes" : "no");
    setSelectedApplicationType(parsedApplicationData?.applicationType)
    setOrganizationType(parsedApplicationData?.organizationType)
  }, [parsedApplicationData]);

  const handleSelection = (applicationType, exportStatus) => {
    setSelectedApplicationType(applicationType);
    if (exportStatus === "yes") {
      setOrganizationType("Central Fund");
    } else if (exportStatus === "no") {
      setOrganizationType("BLWF");
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setApplicationForSelf("");
  };

  const handleApplicationFor = (event) => {
    const value = event.target.value;
    setApplicationForSelf(value);
    // setIsApplicationForSelfSelected(false)
    // onSelect(selectedApplicationType, value); // Pass both selections
  };

  console.log({ applicationForSelf });
  console.log({ parsedApplicationData });

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        {!showForm ? (
          <>
            <ApplicationTypeSelector
              modulesManager={modulesManager}
              onSelect={handleSelection}
              selectedApplicationType={selectedApplicationType}
              parsedApplicationData={parsedApplicationData}
            />
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowForm(true)}
                disabled={!selectedApplicationType || !organizationType} // Ensures both are selected
              >
                <FormattedMessage module="workforce" id="workforce.next" />
              </Button>
            </div>
          </>
        ) : selectedApplicationType === "medicalDonation" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage
                  module="workforce"
                  id="workforce.back.application.type"
                />
              </Typography>
            </div>
            {applicationForSelf === "" ? (
              <Paper className={classes.subPaper} elevation={0}>
                <FormControl component="fieldset">
                  {/* New Export-Oriented Company Question */}
                  <Typography
                    variant="h6"
                    className={`${classes.title} ${classes.section}`}
                  >
                    {
                      <FormattedMessage
                        id="workforce.application.for"
                        module="workforce"
                      />
                    }
                  </Typography>
                  <RadioGroup
                    value={applicationForSelf}
                    onChange={handleApplicationFor}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio color="primary" />}
                      label={
                        <FormattedMessage
                          id="workforce.application.for.type.self"
                          module="workforce"
                        />
                      }
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio color="primary" />}
                      label={
                        <FormattedMessage
                          id="workforce.application.for.type.dependent"
                          module="workforce"
                        />
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>
            ) : (
              <MedicalDonationForm
                modulesManager={modulesManager}
                organizationType={organizationType}
                selectedApplicationType={selectedApplicationType}
                applicationForSelf={applicationForSelf}
              />
            )}
          </>
        ) : selectedApplicationType === "medicalAssistance" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage
                  module="workforce"
                  id="workforce.back.application.type"
                />
              </Typography>
            </div>
            {applicationForSelf === "" || isApplicationForSelfSelected ? (
              <Paper className={classes.subPaper} elevation={0}>
                <FormControl component="fieldset">
                  <Typography variant="h6" className={`${classes.title} ${classes.section}`}>
                    {<FormattedMessage id="workforce.application.for" module="workforce"/>}
                  </Typography>
                  <RadioGroup value={applicationForSelf} onChange={handleApplicationFor}>
                    <FormControlLabel
                      value="yes"
                      control={<Radio color="primary" />}
                      label={<FormattedMessage id="workforce.application.for.type.self" module="workforce"/>}
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio color="primary" />}
                      label={<FormattedMessage id="workforce.application.for.type.dependent" module="workforce"/>}
                    />
                  </RadioGroup>
                </FormControl>
                <div className={classes.buttonContainer}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsApplicationForSelfSelected(false)}
                  >
                    <FormattedMessage module="workforce" id="workforce.next" />
                  </Button>
                </div>
              </Paper>
            ) : (
              <MedicalAssistanceForm
                modulesManager={modulesManager}
                organizationType={organizationType}
                parsedApplicationData={parsedApplicationData}
                selectedApplicationType={selectedApplicationType}
                applicationForSelf={applicationForSelf}
              />
            )}
          </>
        ) : selectedApplicationType === "disabilityAssistance" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage
                  module="workforce"
                  id="workforce.back.application.type"
                />
              </Typography>
            </div>
            <DisabilityForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
              applicationForSelf={applicationForSelf}
            />
          </>
        ) : selectedApplicationType === "educationGrant" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage
                  module="workforce"
                  id="workforce.back.application.type"
                />
              </Typography>
            </div>
            {applicationForSelf === "" ? (
              <Paper className={classes.subPaper} elevation={0}>
                <FormControl component="fieldset">
                  {/* New Export-Oriented Company Question */}
                  <Typography
                    variant="h6"
                    className={`${classes.title} ${classes.section}`}
                  >
                    {
                      <FormattedMessage
                        id="workforce.application.for"
                        module="workforce"
                      />
                    }
                  </Typography>
                  <RadioGroup
                    value={applicationForSelf}
                    onChange={handleApplicationFor}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio color="primary" />}
                      label={
                        <FormattedMessage
                          id="workforce.application.for.type.self"
                          module="workforce"
                        />
                      }
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio color="primary" />}
                      label={
                        <FormattedMessage
                          id="workforce.application.for.type.dependent"
                          module="workforce"
                        />
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>
            ) : (
              <EducationGrantForm
                modulesManager={modulesManager}
                organizationType={organizationType}
                selectedApplicationType={selectedApplicationType}
                applicationForSelf={applicationForSelf}
              />
            )}
          </>
        ) : selectedApplicationType === "financialAssistance" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage
                  module="workforce"
                  id="workforce.back.application.type"
                />
              </Typography>
            </div>
            <FinancialAssistanceForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) : selectedApplicationType === "scholarship" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage
                  module="workforce"
                  id="workforce.back.application.type"
                />
              </Typography>
            </div>
            {applicationForSelf === "" ? (
              <Paper className={classes.subPaper} elevation={0}>
                <FormControl component="fieldset">
                  {/* New Export-Oriented Company Question */}
                  <Typography
                    variant="h6"
                    className={`${classes.title} ${classes.section}`}
                  >
                    {
                      <FormattedMessage
                        id="workforce.application.for"
                        module="workforce"
                      />
                    }
                  </Typography>
                  <RadioGroup
                    value={applicationForSelf}
                    onChange={handleApplicationFor}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio color="primary" />}
                      label={
                        <FormattedMessage
                          id="workforce.application.for.type.self"
                          module="workforce"
                        />
                      }
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio color="primary" />}
                      label={
                        <FormattedMessage
                          id="workforce.application.for.type.dependent"
                          module="workforce"
                        />
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>
            ) : (
              <ScholarshipApplicationForm
                modulesManager={modulesManager}
                organizationType={organizationType}
                selectedApplicationType={selectedApplicationType}
                applicationForSelf={applicationForSelf}
              />
            )}
          </>
        ) : selectedApplicationType === "deadlyGrant" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage
                  module="workforce"
                  id="workforce.back.application.type"
                />
              </Typography>
            </div>
            <FinancialAssistanceForm
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
            />
          </>
        ) : (
          <div>Please select an application type</div>
        )}
      </Paper>
    </div>
  );
};

export default MultiStepApplyForm;
