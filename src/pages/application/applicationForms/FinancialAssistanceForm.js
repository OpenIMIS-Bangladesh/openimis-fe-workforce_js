import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography } from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../../pickers/FileUploader";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
import EmployeeDetailsForm2 from "../EmployeeDetailsForm2";
import EmployeeLocationForm from "../EmployeeLocationForm";
import EmployeeDependentForm from "../EmployeeDependentForm";
import EmployeeAccidentInfoForm from "../EmployeeAccidentInfoForm";
import {
  createApplication,
  createWorkforceEmployee,
  fetchApplicationId,
  fetchWorkforceEmployee,
  updateApplication,
  updateWorkforceEmployee,
} from "../../../actions";
import EmployeeAccountInfoForm from "../EmployeeAccountInfoForm";
import { formatApplicationeGQL } from "../../../utils/format_gql";
import { WORKFORCE_STATUS } from "../../../constants";
import ApplicationReason from "../FormsComponents/FinancialAssistance/ApplicationReason";
import PreviewDetails from "../../../components/application-forms/PreviewDetails";
import NidVerification from "../../../components/application-forms/NidVerification";
import { safeApplicationId } from "../../../utils/utils";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(2),
    width: 700,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
}));

const steps = [
  "workforce.application.steps.aidReason",
  "workforce.application.steps.employeeDetails",
  "workforce.application.steps.deathLabourDetails",
  "workforce.application.steps.location",
  "workforce.application.steps.account.info",
  "workforce.application.steps.upload.documents",
];

const FinancialAssistanceForm = ({ modulesManager, organizationType, selectedApplicationType, parsedApplicationData }) => {
  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);

  const applicationId = useSelector((state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? []);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deathType, setDeathType] = useState("");
  const [disableConfirmSubmit, setDisableConfirmSubmit] = useState(false);
  const [nidOrBcn, setNidOrBcn] = useState({
    nid: formData?.workforceEmployee?.nid || "",
    birthCertificateNo: formData?.workforceEmployee?.birthCertificateNo,
  });

  const reduxState = useSelector((state) => state);

  const [formData, setFormData] = useState({
    workforceEmployee: {
      nameEn: "",
      nameBn: "",
      lastNameEn: "",
      position: "",
      fatherNameEn: "",
      fatherNameBn: "",
      motherNameEn: "",
      motherNameBn: "",
      spouseNameEn: "",
      spouseNameBn: "",
      phoneNumber: "",
      email: "",
      birthDate: "",
      deathDate: "",
      joinDate: "",
      nid: "",
      birthCertificateNo: "",
      insuranceNumber: "",
      lifeStatus: "",
      gender: "",
      maritalStatus: "",
      monthlyEarning: "",
      uploadedNidFile: [],
      citizenship: "",
      uploadedBirthCertificateFile: [],
      permanentAddress: "",
      permanentLocation: "",
      presentLocation: "",
      presentAddress: "",
      organizationId: "",
    },
    deathType: deathType,
    company: null,
    factory: null,
    isSubmitted: "no",
    organizationType: "",
    applicationType: "",
    dependent: {},
    employeeBankInfo: {},
    employeeAccidentInfo: {},
    metadata: {},
    id: "",
  });

  // Fetch employee data based on username
  const fetchEmployeeWithUser = () => {
    dispatch(fetchWorkforceEmployee(modulesManager, [`relatedUser_LoginName_Iexact: "${reduxState.core.user.username}"`]));
  };

  useEffect(() => {
    if (applicationId && applicationId.length > 0 && applicationId[0]?.id) {
      setFormData((prev) => ({
        ...prev,
        applicationId: applicationId[0].id,
      }));
    }
  }, [applicationId]);

  useEffect(() => {
    if (reduxState.core.user.username) {
      fetchEmployeeWithUser();
    }
  }, [reduxState.core.user.username]);

  useEffect(() => {
    if (employeeData) {
      // When employeeData is fetched, set it into the form state
      setFormData({
        id: parsedApplicationData?.id || "",
        workforceEmployee: {
          id: employeeData?.id|| reduxState.core.user.id || "",
          organization: employeeData.organization,
          nameEn: employeeData.firstNameEn || "",
          nameBn: employeeData.firstNameBn || "",
          lastNameEn: " ",
          position: employeeData.position || "",
          fatherNameEn: employeeData.fatherNameEn || "",
          fatherNameBn: employeeData.fatherNameBn || "",
          motherNameEn: employeeData.motherNameEn || "",
          motherNameBn: employeeData.motherNameBn || "",
          spouseNameEn: employeeData.spouseNameEn || "",
          spouseNameBn: employeeData.spouseNameBn || "",
          phoneNumber: employeeData.phoneNumber || "",
          email: employeeData.email || "",
          citizenship: employeeData.citizenship || "",
          birthDate: employeeData.birthDate || "",
          deathDate: employeeData.deathDate || "",
          joinDate: employeeData.joinDate || "",
          nid: employeeData.nid || "",
          birthCertificateNo: employeeData.birthCertificateNo || "",
          insuranceNumber: employeeData.insuranceNumber || "",
          lifeStatus: employeeData.lifeStatus || "",
          gender: employeeData.gender || "",
          maritalStatus: employeeData.maritalStatus || "",
          monthlyEarning: employeeData.monthlyEarning || "",
          uploadedNidFile: employeeData.uploadedNidFile || [],
          uploadedBirthCertificateFile: employeeData.uploadedBirthCertificateFile || [],
          permanentAddress: employeeData.permanentAddress || "",
          permanentLocation: employeeData.permanentLocation || "",
          presentLocation: employeeData.presentLocation || "",
          presentAddress: employeeData.presentAddress || "",
        },
        company: employeeData.company || null,
        factory: employeeData.factory || null,
        organizationType: parsedApplicationData?.organizationType || organizationType,
        applicationType: parsedApplicationData?.applicationType || selectedApplicationType,
        grantAmount:parsedApplicationData?.grantAmount||parsedApplicationData?.employeeAccidentInfo.grantAmount,
        metadata: parsedApplicationData?.metadata || employeeData?.metadata || {},
        dependents: parsedApplicationData?.employeeDependentInfo || employeeData?.dependents || {},
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || {},
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
      });
    }
  }, [employeeData]); // Trigger this useEffect when `employeeData` changes.

  // Handle form input changes
  const handleChange = (key, value, parent = null) => {
    setFormData((prev) => {
      if (parent) {
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [key]: value,
          },
        };
      }

      return { ...prev, [key]: value };
    });
  };

  const handleNext = async () => {
    console.log({ formData });
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    if (nextStep === 3 || nextStep === 4) {
      const workforceEmployeeData = {
        nameEn: formData?.workforceEmployee?.nameEn,
        nameBn: formData?.workforceEmployee?.nameBn,
        lastNameEn: "",
        phoneNumber: formData?.workforceEmployee?.phoneNumber,
        email: formData?.workforceEmployee?.email,
        gender: formData?.workforceEmployee?.gender?.id,
        birthDate: formData?.workforceEmployee?.birthDate,
        deathDate: formData?.workforceEmployee?.deathDate,
        lifeStatus: formData?.workforceEmployee?.lifeStatus,
        permanentAddress: formData?.workforceEmployee?.permanentAddress,
        presentAddress: formData?.workforceEmployee?.presentAddress,
        position: formData?.workforceEmployee?.position,
        monthlyEarning: formData?.workforceEmployee?.monthlyEarning,
        insuranceNumber: " ",
        fatherNameBn: formData?.workforceEmployee?.fatherNameBn,
        fatherNameEn: formData?.workforceEmployee?.fatherNameEn,
        motherNameBn: formData?.workforceEmployee?.motherNameBn,
        motherNameEn: formData?.workforceEmployee?.motherNameEn,
        spouseNameBn: formData?.workforceEmployee?.spouseNameBn,
        spouseNameEn: formData?.workforceEmployee?.spouseNameEn,
        citizenship: formData?.workforceEmployee?.citizenship,
        maritalStatus: formData?.workforceEmployee?.maritalStatus,
        presentLocation: formData?.workforceEmployee?.presentLocation,
        permanentLocation: formData?.workforceEmployee?.permanentLocation,

        id: formData?.workforceEmployee?.id|| reduxState.core.user.id,
      };
      console.log("Update Submitting formData:", formData);
      await dispatch(updateWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
      // if (workforceEmployeeData?.id) {
      // } else {
      //   await dispatch(createWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
      // }
    } else if (nextStep === 2) {
      const createApplicationData = {
        workforceEmployeeId: formData?.workforceEmployee?.id || parsedApplicationData?.workforceEmployee?.id,
        company: formData.company,
        factory: formData.factory,
        organizationType: formData.organizationType,
        applicationType: formData.applicationType,
        grantAmount:formData?.employeeAccidentInfo.grantAmount,
        employeeDesignationInfo: JSON.stringify(formData.employeeDesignationInfo),
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependent),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
        metadata: JSON.stringify(formData.metadata),
        status: WORKFORCE_STATUS.DRAFT,
      };

      console.log({ createApplicationData });
      if (!parsedApplicationData) {
        const applicationMutation = await formatMutation(
          "createWorkforceApplication",
          formatApplicationeGQL(createApplicationData),
          `Created application ${formData.workforceEmployee.nameEn}`
        );
        const applicationClientMutationId = applicationMutation.clientMutationId;
        console.log("applicationClientMutationId", applicationClientMutationId);
        await dispatch(createApplication(applicationMutation, `Created workforce application ${formData.firstNameEn}`));

        await dispatch(fetchApplicationId(modulesManager, applicationClientMutationId));
      } else {
        const updateApplicationData = { id: parsedApplicationData?.id, ...createApplicationData };
        console.log("i am from update", updateApplicationData);
        dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
      }
    } else if (nextStep === 1) {
      const createApplicationData = {
        // workforceEmployeeId:decodeId(formData?.workforceEmployee?.id) || decodeId(parsedApplicationData?.workforceEmployee?.id),
        deathType: formData?.deathType,
      };
    } else {
      const updateApplicationData = {
        // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
        id: safeApplicationId(applicationId, parsedApplicationData),
        workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
        company: formData.company,
        factory: formData.factory,
        organizationType: organizationType || parsedApplicationData?.organizationType,
        applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
        grantAmount:formData?.employeeAccidentInfo.grantAmount,
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
        metadata: JSON.stringify(formData.metadata),
        status: WORKFORCE_STATUS.DRAFT,
      };
      dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
    }
  };

  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleDependentChange = (index, key, value) => {
    setFormData((prev) => {
      const updatedDependents = [...prev.dependents];
      updatedDependents[index] = { ...updatedDependents[index], [key]: value };
      return { ...prev, dependents: updatedDependents };
    });
  };

  const addDependent = () => {
    setFormData((prev) => ({
      ...prev,
      dependents: [...prev.dependent, {}],
    }));
  };

  const removeDependent = (index) => {
    setFormData((prev) => {
      const updatedDependents = prev.dependents.filter((_, i) => i !== index);
      return { ...prev, dependents: updatedDependents };
    });
  };

  const handleSubmit = () => {
    const updateApplicationData = {
      // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
      id: safeApplicationId(applicationId, parsedApplicationData),
      workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
      company: formData.company,
      factory: formData.factory,
      organizationType: organizationType || parsedApplicationData?.organizationType,
      applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
        grantAmount:formData?.employeeAccidentInfo.grantAmount,
      employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
      employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
      employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
      metadata: JSON.stringify(formData.metadata),
      status: WORKFORCE_STATUS.NEW,
    };
    console.log({ updateApplicationData });
    dispatch(updateApplication(updateApplicationData, `update workforce application`));

    // setShowPreview(true);
    // setIsSubmitted(true);
  };

  if (showPreview) {
    return (
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={0}>
          <PreviewDetails formData={formData} />
          <div className={classes.buttonContainer}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setShowPreview(false);
              }}
            >
              <FormattedMessage module="workforce" id="workforce.back" />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowPreview(false);
                setShowVerifyNid(true);
              }}
            >
              <FormattedMessage module="workforce" id="workforce.submit" />
            </Button>
          </div>
        </Paper>
      </div>
    );
  }

  if (showVerifyNid) {
    return (
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={0}>
          <NidVerification formData={formData} nidOrBcn={nidOrBcn} setDisableConfirmSubmit={setDisableConfirmSubmit} />
          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              // disabled={disableConfirmSubmit}
              onClick={() => {
                setShowVerifyNid(false);
                setIsSubmitted(true);
                handleSubmit();
              }}
            >
              <FormattedMessage module="workforce" id="workforce.confirm.submit" />
            </Button>
          </div>
        </Paper>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={0}>
          <Typography variant="h5" align="center" color="primary">
            <FormattedMessage module="workforce" id="workforce.success.message" />
          </Typography>
        </Paper>
      </div>
    );
  }

  console.log({ tazwer: formData });

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={0}>
        <Stepper activeStep={activeStep} alternativeLabel style={{ padding: "0px" }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <FormattedMessage module="workforce" id={label} />
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 ? (
          <ApplicationReason
            modulesManager={modulesManager}
            handleChange={(key, value) => handleChange(key, value, "metadata")}
            formData={formData}
            setDeathType={setDeathType}
            deathType={deathType}
          />
        ) : activeStep === 1 ? (
          <Box mt={0}>
            <EmployeeDependentForm dependents={formData} handleChange={handleChange} addDependent={addDependent} removeDependent={removeDependent} />
          </Box>
        ) : activeStep === 2 ? (
          <Box mt={0}>
            <EmployeeDetailsForm
              handleChange={(key, value) => handleChange(key, value, "workforceEmployee")}
              formData={formData}
              setNidOrBcn={setNidOrBcn}
              nidOrBcn={nidOrBcn}
            />
          </Box>
        ) : activeStep === 3 ? (
          <Box mt={0}>
            <EmployeeLocationForm handleChange={(key, value) => handleChange(key, value, "workforceEmployee")} formData={formData} />
          </Box>
        ) : activeStep === 4 ? (
          <Box mt={0}>
            <EmployeeAccountInfoForm handleChange={(key, value) => handleChange(key, value, "employeeBankInfo")} formData={formData} />
          </Box>
        ) : (
          <Box mt={0}>
            <EmployeeDetailsForm2
              selectedApplicationType={selectedApplicationType}
              handleChange={handleChange}
              formData={formData}
              applicationId={applicationId}
            />
          </Box>
        )}
        <div className={classes.buttonContainer}>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="outlined">
              <FormattedMessage module="workforce" id="workforce.back" />{" "}
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              <FormattedMessage module="workforce" id="workforce.save.next" />
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={() => setShowPreview(true)}>
              <FormattedMessage module="workforce" id="workforce.submit" />
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default FinancialAssistanceForm;
