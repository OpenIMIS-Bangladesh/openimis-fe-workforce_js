import React, { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  FormattedMessage,
  useModulesManager,
  TextInput,
  useDebounceCb
} from "@openimis/fe-core";
import { useDispatch,useSelector } from "react-redux";
import { fetchFactoriesPick } from "../../../../actions";
import EmployeeDetailsForm2 from "../../EmployeeDetailsForm2";

const useStyles = makeStyles((theme) => ({
  title: { fontWeight: "bold" },
  section: { marginTop: theme.spacing(3) },
}));

const WorkerExtraInfo = ({ handleChange, formData, errors }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  const classes = useStyles();
  const dispatch = useDispatch();

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFactoryPopup, setShowFactoryPopup] = useState(false);
  const [factoryPopupMessage, setFactoryPopupMessage] = useState("");
  const locale = useSelector(
        (state) => state.core?.user?.i_user?.language || "en"
      );

  const searchFactoryByName = useDebounceCb(async (value) => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const filters = [`searchName: "${value.trim().replace(/"/g, '\\"')}"`, `status: "active"`];

    try {
      const response = await dispatch(fetchFactoriesPick(modulesManager, filters));
      const edges = response?.payload?.data?.workforceEmployerFactories?.edges || [];
      setSuggestions(edges.map(edge => edge.node || edge));
    } catch (error) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 400);

  const handleSelection = (event, value, reason) => {
    if (reason === "select-option" && value && typeof value === "object") {
      const name =locale ==="en"? value.nameEn : value.nameBn || "";
      handleChange("instituteName", name);
      locale === "en"?
      setFactoryPopupMessage(
        `Your factory ${name} is 100% export oriented company. You can apply from `
      ):setFactoryPopupMessage(
        `আপনাদের কারখানা ${name} একটি শতভাগ রপ্তানিমুখী প্রতিষ্ঠান। আবেদন করতে হলে ভিজিট করুন `
      )
      setShowFactoryPopup(true);
    } else {
      handleChange("instituteName", value || "");
    }
  };

  const handleCloseModal = () => {
    setShowFactoryPopup(false);
  };

  return (
    <>
      <Typography mb={4} style={{ textAlign: "center", fontWeight: "bold", fontSize: "small", margin: "15px" }}>
        <FormattedMessage id="workforce.application.steps.worker.extraInfo" module="workforce" />
      </Typography>
      <FormControl component="fieldset">
        <Typography variant="body1" className={`${classes.title} ${classes.section}`}>
          {formatMessage("workforce.applicant.workInfo.title")}
        </Typography>
        <RadioGroup 
          value={formData?.institutionInfo?.workerType} 
          onChange={(e) => handleChange("workerType", e.target.value)}
        >
          <FormControlLabel value="formal" control={<Radio color="primary" />} label={formatMessage("workforce.applicant.workInfo.formal")} />
          <FormControlLabel value="informal" control={<Radio color="primary" />} label={formatMessage("workforce.applicant.workInfo.informal")} />
        </RadioGroup>

        {formData?.institutionInfo?.workerType === "formal" && (
          <Grid container spacing={2} className={classes.section}>
            <Grid item xs={6}>
              <Autocomplete
                freeSolo
                options={suggestions}
                getOptionLabel={(option) => (typeof option === "string" ? option : (locale ==="en"?option.nameEn : option.nameBn))}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === "input") {
                    handleChange("instituteName", newInputValue);
                    searchFactoryByName(newInputValue);
                  }
                }}
                onChange={handleSelection}
                loading={loading}
                value={formData?.institutionInfo?.instituteName || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={formatMessage("workforce.applicant.workInfo.formal.institution_name")}
                    variant="standard"
                    required
                    error={!!errors.instituteName}
                    helperText={errors.instituteName}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextInput
                id="instituteAddress"
                label={formatMessage("workforce.applicant.workInfo.formal.institution_address")}
                value={formData?.institutionInfo?.instituteAddress || ""}
                required
                onChange={(e) => handleChange("instituteAddress", e)}
                error={!!errors.instituteAddress}
                helperText={errors.instituteAddress}
              />
            </Grid>
          </Grid>
        )}

        {formData?.institutionInfo?.workerType === "informal" && (
          <Grid container spacing={2} className={classes.section}>
            <Grid item xs={6}>
              <TextInput
                id="aboutWork"
                label={formatMessage("workforce.applicant.workInfo.informal.current_occupation")}
                value={formData?.institutionInfo?.aboutWork || ""}
                required
                onChange={(e) => handleChange("aboutWork", e)}
                error={!!errors.aboutWork}
                helperText={errors.aboutWork}
              />
            </Grid>
            <Grid item xs={6}>
              <TextInput
                id="workingPlace"
                label={formatMessage("workforce.applicant.workInfo.informal.workplace")}
                value={formData?.institutionInfo?.workingPlace || ""}
                required
                onChange={(e) => handleChange("workingPlace", e)}
                error={!!errors.workingPlace}
                helperText={errors.workingPlace}
              />
            </Grid>
          </Grid>
        )}
        <EmployeeDetailsForm2 
          errors={errors} 
          handleChange={() => {}} 
          formData={formData} 
          selectedApplicationType={formData?.applicationType} 
          formStepNo={"institutionInfo"} 
        />
      </FormControl>

      <Dialog open={showFactoryPopup} onClose={handleCloseModal}>
        <DialogTitle>Information</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {factoryPopupMessage} {<a href={"https://labourwelfare.gov.bd/"} target="_blank" rel="noopener noreferrer">cf.com</a>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkerExtraInfo;