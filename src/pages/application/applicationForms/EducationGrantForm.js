import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Box,
  Typography,
} from "@material-ui/core";
import {
  useModulesManager,
  formatMutation,
  decodeId,
  FormattedMessage,
} from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../../pickers/FileUploader";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
import EmployeeDetailsForm2 from "../EmployeeDetailsForm2";
import EmployeeLocationForm from "../EmployeeLocationForm";
import EmployeeDependentForm from "../EmployeeDependentForm";
import EmployeeAccidentInfoForm from "../EmployeeAccidentInfoForm";
import EmployeeChildrenDetailsForm from "../EmployeeChildrenDetailsForm";
import PreviousGrantInfoForm from "../PreviousGrantInfoForm";
import OtherInfoForm from "../OtherInfoForm";
import {
  createApplication,
  fetchApplicationId,
  fetchWorkforceEmployee,
  updateApplication,
  updateWorkforceEmployee,
} from "../../../actions";
import EmployeeAccountInfoForm from "../EmployeeAccountInfoForm";
import { formatApplicationeGQL } from "../../../utils/format_gql";
import { WORKFORCE_STATUS } from "../../../constants";
import PreviewDetails from "../../../components/application-forms/PreviewDetails";
import NidVerification from "../../../components/application-forms/NidVerification";
import { getParsedApplication } from "../../../utils/utils";
import { ApplicationFormSubmitted } from "../../../components/shared/ApplicationFormSubmitted";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(1),
    width: 700,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
  overrides: {
    MuiStepper: {
      root: {
        backgroundColor: "transparent", // override MuiStepper-root globally
        padding: "16px",
      },
    },
  },
}));

const EducationGrantForm = ({
  modulesManager,
  organizationType,
  selectedApplicationType,
  applicationForSelf,
  parsedApplicationData
}) => {
  const employeeData = useSelector(
    (state) => state.workforce["workforceEmployee"] ?? []
  );

  const applicationId = useSelector(
    (state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? []
  );
  const classes = useStyles();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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
    employeeChildrenInfo: {
      nameEn: "",
      nameBn: "",
      birthDate: "",
      educationInstituteName: "",
      studyingClass: "",
      result: "",
      nid: "",
    },
    previousGrantInfo: {
      dateofReceipt: "",
      grantAmount: "",
      reasonforReceipt: "",
    },
    otherInfo: "",
    company: null,
    factory: null,
    isSubmitted: "no",
    organizationType: "",
    applicationType: "",
    applicationForSelf: applicationForSelf,
    dependents: [{}],
    employeeBankInfo: {},
    id: "",
  });

  // Fetch employee data based on username
  const fetchEmployeeWithUser = () => {
    dispatch(
      fetchWorkforceEmployee(modulesManager, [
        `relatedUser_LoginName_Iexact: "${reduxState.core.user.username}"`,
      ])
    );
  };

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
          id: employeeData?.id || reduxState.core.user.id || "",
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
        applicationForSelf: applicationForSelf,
        organizationType: parsedApplicationData?.organizationType || organizationType,
        applicationType: parsedApplicationData?.applicationType || selectedApplicationType,
        dependents: parsedApplicationData?.employeeDependentInfo || employeeData.dependents || {},
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || {},
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
        employeeChildrenInfo: parsedApplicationData?.employeeChildrenInfo || employeeData.employeeChildrenInfo || {},
        previousGrantInfo: employeeData.previousGrantInfo || {},
        otherInfo: employeeData.otherInfo || {},
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
    if (nextStep === 1 || nextStep === 2) {
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
        id: formData?.workforceEmployee?.id || reduxState.core.user.id,
      };
      console.log("Update Submitting formData:", formData);
      await dispatch(
        updateWorkforceEmployee(
          workforceEmployeeData,
          `Update Workforce Employee ${workforceEmployeeData.nameEn}`
        )
      );

    } else if (nextStep === 3) {
      console.log("Create application formData:", formData);
      const createApplicationData = {
        workforceEmployeeId: formData.id,
        company: formData.company,
        factory: formData.factory,
        organizationType: formData.organizationType,
        applicationType: formData.applicationType,
        employeeDesignationInfo: JSON.stringify(
          formData.employeeDesignationInfo
        ),
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependents),
        employeeAccidentInfo: JSON.stringify(formData.employeeAccidentInfo),
        status: WORKFORCE_STATUS.NEW,
      };

      console.log({ createApplicationData });

      const applicationMutation = await formatMutation(
        "createWorkforceApplication",
        formatApplicationeGQL(createApplicationData),
        `Created application ${formData.nameEn}`
      );
      const applicationClientMutationId = applicationMutation.clientMutationId;
      console.log("applicationClientMutationId", applicationClientMutationId);
      await dispatch(
        createApplication(
          applicationMutation,
          `Created workforce application ${formData.firstNameEn}`
        )
      );

      await dispatch(
        fetchApplicationId(modulesManager, applicationClientMutationId)
      );
    } else {
      console.log("hello faltu")
      // const filters = [`id: "${applicationId[0].id}"`];
      // dispatch(getParsedApplication(modulesManager, filters))
      //   .then((parsedData) => {
      //     // Use the parsed data
      //     console.log("Parsed application:", parsedData);
      //   })
      //   .catch((error) => {
      //     // Handle error
      //     console.error("Failed to get parsed application:", error);
      //   });

      const updateApplicationData = {
        id: decodeId(applicationId[0].id),
        workforceEmployeeId: formData.id,
        company: formData.company,
        factory: formData.factory,
        organizationType: organizationType,
        applicationType: selectedApplicationType,
        employeeDesignationInfo: formData.employeeDesignationInfo,
        employeeBankInfo: formData.employeeBankInfo,
        employeeDependentInfo: formData.dependents,
        employeeAccidentInfo: formData.employeeAccidentInfo,
        status: WORKFORCE_STATUS.NEW,
      };
      dispatch(
        updateApplication(
          updateApplicationData,
          `update workforce application ${formData.firstNameEn}`
        )
      );
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
      dependents: [...prev.dependents, {}],
    }));
  };

  const removeDependent = (index) => {
    setFormData((prev) => {
      const updatedDependents = prev.dependents.filter((_, i) => i !== index);
      return { ...prev, dependents: updatedDependents };
    });
  };

  const handleSubmit = async () => {
    console.log({ tazwer: formData });
    // const updateApplicationData = {
    //   id: decodeId(applicationId[0].id),
    //   workforceEmployeeId: formData.id,
    //   company: formData.company,
    //   factory: formData.factory,
    //   organizationType: organizationType,
    //   applicationType: selectedApplicationType,
    //   employeeDesignationInfo: formData.employeeDesignationInfo,
    //   employeeBankInfo: formData.employeeBankInfo,
    //   employeeDependentInfo: formData.dependents,
    //   employeeAccidentInfo: formData.employeeAccidentInfo,
    //   isSubmitted: "yes",
    //   status: "ontest",
    // };
    // dispatch(
    //   updateApplication(
    //     updateApplicationData,
    //     `update workforce application ${formData.firstNameEn}`
    //   )
    // );
    setShowPreview(true);
    // setIsSubmitted(true);
  };

  const steps = [
    {
      label: "workforce.application.steps.employeeDetails",
      content: (
        <EmployeeDetailsForm
          handleChange={(key, value) =>
            handleChange(key, value, "workforceEmployee")
          }
          formData={formData}
        />
      ),
    },
    {
      label: "workforce.application.steps.location",
      content: (
        <EmployeeLocationForm
          handleChange={(key, value) =>
            handleChange(key, value, "workforceEmployee")
          }
          formData={formData}
        />
      ),
    },
    {
      label: "workforce.application.steps.childInfo",
      content: (
        <EmployeeChildrenDetailsForm
          handleChange={(key, value) =>
            handleChange(key, value, "employeeChildrenInfo")
          }
          formData={formData.employeeChildrenInfo}
        />
      ),
    },
    {
      label: "workforce.application.steps.account.info",
      content: (
        <EmployeeAccountInfoForm
          handleChange={(key, value) =>
            handleChange(key, value, "employeeBankInfo")
          }
          formData={formData.employeeBankInfo}
        />
      ),
    },
    {
      label: "workforce.application.steps.upload.documents",
      content: (
        <EmployeeDetailsForm2
          selectedApplicationType={selectedApplicationType}
          handleChange={handleChange}
          formData={formData}
        />
      ),
    },
    ...(applicationForSelf === "no"
      ? [
        {
          label: "workforce.application.steps.dependent",
          content: (
            <EmployeeDependentForm
              dependents={formData.dependents}
              handleDependentChange={handleDependentChange}
              addDependent={addDependent}
              removeDependent={removeDependent}
            />
          ),
        },
      ]
      : []),
    {
      label: "workforce.application.steps.previousGrantInfo",
      content: (
        <PreviousGrantInfoForm
          handleChange={(key, value) =>
            handleChange(key, value, "previousGrantInfo")
          }
          formData={formData.previousGrantInfo}
        />
      ),
    },
    {
      label: "workforce.application.steps.otherInfo",
      content: (
        <OtherInfoForm
          handleChange={(key, value) => handleChange(key, value, "otherInfo")}
          formData={formData.otherInfo}
        />
      ),
    },
  ];

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
          <NidVerification formData={formData} />
          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowVerifyNid(false);
                setIsSubmitted(true);
              }}
            >
              <FormattedMessage
                module="workforce"
                id="workforce.confirm.submit"
              />
            </Button>
          </div>
        </Paper>
      </div>
    );
  }

  if (isSubmitted) {
    return <ApplicationFormSubmitted />;
  }

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={0}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          style={{ padding: "0px" }}
        >
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>
                <FormattedMessage module="workforce" id={step.label} />
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={0}>{steps[activeStep].content}</Box>
        <div className={classes.buttonContainer}>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="outlined">
              <FormattedMessage module="workforce" id="workforce.back" />
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              <FormattedMessage module="workforce" id="workforce.save.next" />
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              <FormattedMessage module="workforce" id="workforce.submit" />
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default EducationGrantForm;
