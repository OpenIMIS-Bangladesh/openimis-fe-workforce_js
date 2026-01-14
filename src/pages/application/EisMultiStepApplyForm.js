import React, { useEffect, useState } from "react";
import { useModulesManager, formatMutation, decodeId, FormattedMessage, useParams } from "@openimis/fe-core";
import { Paper, Button, IconButton, Typography, FormControl, FormControlLabel, Radio, RadioGroup, Snackbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MuiAlert from "@material-ui/lab/Alert";
import { useDispatch, useSelector } from "react-redux";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ApplicationTypeSelector from "./ApplicationTypeSelector";
import MedicalAssistanceForm from "./applicationForms/MedicalAssistanceForm";
import MaternalGrantForm from "./applicationForms/MaternalGrantForm";
import MedicalDonationForm from "./applicationForms/MedicalDonationForm";
import DisabilityForm from "./applicationForms/DisabilityForm";
import EducationGrantForm from "./applicationForms/EducationGrantForm";
import FinancialAssistanceForm from "./applicationForms/FinancialAssistanceForm";
import ScholarshipApplicationForm from "./applicationForms/ScholarshipApplicationForm";
import { getParsedApplication } from "../../utils/utils";
import DeadlyGrantForm from "./applicationForms/DeadlyGrantForm";
import { fetchApplicationsSummary } from "../../actions";
import ConfirmModal from "../../components/application-process/modals/ConfirmModal";
import CustomSnackbar from "../../components/shared/CustomSnackbar";
import EisApplicationTypeSelector from "./EisApplicationTypeSelector";

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
    minHeight: "fit-content", // Ensures a minimum height
  },
  paper: {
    padding: theme.spacing(1),
    width: "100%",
    minHeight: "fit-content", // Ensures a minimum height
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


const EisMultiStepApplyForm = ({workforceFactoryId}) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { application_uuid } = useParams();
  const dispatch = useDispatch();
  const [parsedApplicationData, setParsedApplicationData] = useState();
  const [showForm, setShowForm] = useState(false);
  const [applicationForSelf, setApplicationForSelf] = useState("");
  const [organizationType, setOrganizationType] = useState("eis" || parsedApplicationData?.organizationType);
  const [selectedApplicationType, setSelectedApplicationType] = useState(parsedApplicationData?.applicationType || "");
  const [isApplicationForSelfSelected, setIsApplicationForSelfSelected] = useState(true);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const reduxState = useSelector((state) => state);
  const userName = reduxState.core.user.username;

  useEffect(async () => {
    const fetchData = async () => {
      const filters = [`id: "${application_uuid}"`];
      const parsedData = await dispatch(getParsedApplication(modulesManager, filters));
      setParsedApplicationData(parsedData); // <- parsed data will now be set correctly
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!parsedApplicationData?.employeeDependentInfo) return;

    const isEmptyDependent = Object.keys(parsedApplicationData.employeeDependentInfo).length === 0;

    setApplicationForSelf(parsedApplicationData?.applicationFor==="dependent"?"no":parsedApplicationData?.applicationFor==="self"?"yes":"");
    setSelectedApplicationType(parsedApplicationData?.applicationType);
    setOrganizationType(parsedApplicationData?.organizationType);
  }, [parsedApplicationData]);

  const handleSelection = (applicationType) => {
    setSelectedApplicationType(applicationType);
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

  const handleNextButtonClicked = () => {
    if (selectedApplicationType === "financialAssistance") {
      dispatch(fetchApplicationsSummary(modulesManager, [`applicationType: "financialAssistance",workforceEmployee_Nid: "${userName}",status:"new",organizationType:"eis"`])).then((res) => {
        const data = res?.payload?.data?.workforceApplication?.edges;
        if (data && data.length > 0) {
          setOpenErrorModal(true);
          return;
        }
        setShowForm(true);
      });
    } else {
      setShowForm(true);
    }
  };

  console.log({ eis:parsedApplicationData });

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        <CustomSnackbar
          open={openErrorModal}
          onClose={() => setOpenErrorModal(false)}
          type="error"
          message={<FormattedMessage id="workforce.financialAssistance.error.message" module="workforce" />}
        />

        {!showForm ? (
          <>
            <EisApplicationTypeSelector
              workforceFactoryId={workforceFactoryId}
              modulesManager={modulesManager}
              onSelect={handleSelection}
              selectedApplicationType={selectedApplicationType}
              parsedApplicationData={parsedApplicationData}
            />
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleNextButtonClicked()}
                disabled={!selectedApplicationType } // Ensures both are selected
              >
                <FormattedMessage module="workforce" id="workforce.next" />
              </Button>
            </div>
          </>
        ) : selectedApplicationType === "disabilityAssistance" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <DisabilityForm
              workforceFactoryId={workforceFactoryId}
              modulesManager={modulesManager}
              organizationType={organizationType}
              selectedApplicationType={selectedApplicationType}
              parsedApplicationData={parsedApplicationData}
              applicationForSelf={applicationForSelf}
            />
          </>
        ) : selectedApplicationType === "financialAssistance" ? (
          <>
            <div className={classes.backButtonContainer}>
              <IconButton onClick={handleBack} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="body1" className={classes.backText}>
                {/* Back to Application Type */}
                <FormattedMessage module="workforce" id="workforce.back.application.type" />
              </Typography>
            </div>
            <FinancialAssistanceForm
              workforceFactoryId={workforceFactoryId}
              modulesManager={modulesManager}
              organizationType={organizationType}
              parsedApplicationData={parsedApplicationData}
              selectedApplicationType={selectedApplicationType}
              applicationForSelf={applicationForSelf}
            />
          </>
        ) : (
          <div>Please select an application type</div>
        )}
      </Paper>
    </div>
  );
};

export default EisMultiStepApplyForm;
