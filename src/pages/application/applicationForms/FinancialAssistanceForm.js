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
import ApplicationReason from "../FormsComponents/FinancialAssistance/ApplicationReason";
import PreviewDetails from "../../../components/application-forms/PreviewDetails";
import NidVerification from "../../../components/application-forms/NidVerification";

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

// const steps = [
//   "Labour Details",
//   "Location",
//   "Accident Info",
//   "Upload Documents",
//   "Dependent",
//   "Account info",
// ];

const steps = [
  "workforce.application.steps.aidReason",
  "workforce.application.steps.employeeDetails",
  "workforce.application.steps.deathLabourDetails",
  "workforce.application.steps.location",
  "workforce.application.steps.upload.documents",
  "workforce.application.steps.account.info",
];

const FinancialAssistanceForm = ({
  modulesManager,
  organizationType,
  selectedApplicationType,
  selectedCompany,
  selectedFactory,
}) => {
  const employeeData = useSelector(
    (state) => state.workforce["workforceEmployee"] ?? []
  );

  console.log({ organizationType });
  console.log({ selectedApplicationType });
  const applicationId = useSelector(
    (state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? []
  );
  const classes = useStyles();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deathType, setDeathType] = useState("");
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
    deathType:deathType,
    company: null,
    factory: null,
    isSubmitted: "no",
    organizationType: "",
    applicationType: "",
    dependents: [{}],
    employeeBankInfo: {},
    employeeAccidentInfo: {},
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
        id: employeeData.id || "",
        workforceEmployee: {
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
          uploadedBirthCertificateFile:
            employeeData.uploadedBirthCertificateFile || [],
          permanentAddress: employeeData.permanentAddress || "",
          permanentLocation: employeeData.permanentLocation || "",
          presentLocation: employeeData.presentLocation || "",
          presentAddress: employeeData.presentAddress || "",
        },
        company: selectedCompany || employeeData.company || null,
        factory: selectedFactory || employeeData.factory || null,
        organizationType: organizationType,
        applicationType: selectedApplicationType,
        deathType:deathType,
        dependents: employeeData.dependents || [{}],
        employeeBankInfo: employeeData.employeeBankInfo || {},
        employeeAccidentInfo: employeeData.employeeAccidentInfo || {},
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
    if (activeStep === 0 || activeStep === 1) {
      const workforceEmployeeData = {
        nameEn:
          formData?.workforceEmployee?.nameEn ||
          formData?.workforceEmployee.nameEn,
        nameBn:
          formData?.workforceEmployee?.nameBn ||
          formData?.workforceEmployee.nameBn,
        lastNameEn: "",
        phoneNumber:
          formData?.workforceEmployee?.phoneNumber ||
          formData?.workforceEmployee.phoneNumber,
        email:
          formData?.workforceEmployee?.email ||
          formData?.workforceEmployee.email,
        gender:
          formData?.workforceEmployee?.gender?.id ||
          formData?.workforceEmployee.gender.id,
        birthDate:
          formData?.workforceEmployee?.birthDate ||
          formData?.workforceEmployee.birthDate,
        deathDate:
          formData?.workforceEmployee?.deathDate ||
          formData?.workforceEmployee.deathDate,
        lifeStatus:
          formData?.workforceEmployee?.lifeStatus ||
          formData?.workforceEmployee.lifeStatus,
        permanentAddress:
          formData?.workforceEmployee?.permanentAddress ||
          formData?.workforceEmployee.permanentAddress,
        presentAddress:
          formData?.workforceEmployee?.presentAddress ||
          formData?.workforceEmployee.presentAddress,
        position:
          formData?.workforceEmployee?.position ||
          formData?.workforceEmployee.position,
        monthlyEarning:
          formData?.workforceEmployee?.monthlyEarning ||
          formData?.workforceEmployee.monthlyEarning,
        insuranceNumber:
          formData?.workforceEmployee?.insuranceNumber ||
          formData?.workforceEmployee.insuranceNumber,
        fatherNameBn:
          formData?.workforceEmployee?.fatherNameBn ||
          formData?.workforceEmployee.fatherNameBn,
        fatherNameEn:
          formData?.workforceEmployee?.fatherNameEn ||
          formData?.workforceEmployee.fatherNameEn,
        motherNameBn:
          formData?.workforceEmployee?.motherNameBn ||
          formData?.workforceEmployee.motherNameBn,
        motherNameEn:
          formData?.workforceEmployee?.motherNameEn ||
          formData?.workforceEmployee.motherNameEn,
        spouseNameBn:
          formData?.workforceEmployee?.spouseNameBn ||
          formData?.workforceEmployee.spouseNameBn,
        spouseNameEn:
          formData?.workforceEmployee?.spouseNameEn ||
          formData?.workforceEmployee.spouseNameEn,
        citizenship:
          formData?.workforceEmployee?.citizenship ||
          formData?.workforceEmployee.citizenship,
        maritalStatus:
          formData?.workforceEmployee?.maritalStatus ||
          formData?.workforceEmployee.maritalStatus,
        presentLocation:
          formData?.workforceEmployee?.presentLocation ||
          formData?.workforceEmployee.presentLocation,
        permanentLocation:
          formData?.workforceEmployee?.permanentLocation ||
          formData?.workforceEmployee.permanentLocation,
        id: formData?.id,
      };
      console.log("Update Submitting formData:", formData);
      await dispatch(
        updateWorkforceEmployee(
          workforceEmployeeData,
          `Update Workforce Employee ${workforceEmployeeData.nameEn}`
        )
      );
      // dispatch(
      //   updateApplication(
      //     formData,
      //     `update workforce application ${formData.firstNameEn}`
      //   )
      // );
    } else if (activeStep === 2) {
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
        status: WORKFORCE_STATUS.PENDING,
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
        status: "ontest",
      };
      dispatch(
        updateApplication(
          updateApplicationData,
          `update workforce application ${formData.firstNameEn}`
        )
      );
    }
    setActiveStep((prevStep) => prevStep + 1);
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

  if (showPreview) {
      return (
        <div className={classes.container}>
          <Paper className={classes.paper} elevation={0}>
            <PreviewDetails formData={formData} />
            <div className={classes.buttonContainer}>
            <Button variant="outlined" color="error" onClick={()=>{setShowPreview(false)}}>
              <FormattedMessage module="workforce" id="workforce.back" />
            </Button>
            <Button variant="contained" color="primary" onClick={()=>{setShowPreview(false);setShowVerifyNid(true)}}>
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
    return (
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={0}>
          <Typography variant="h5" align="center" color="primary">
            <FormattedMessage
              module="workforce"
              id="workforce.success.message"
            />
          </Typography>
        </Paper>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={0}>
        <Stepper activeStep={activeStep} alternativeLabel>
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
            handleChange={handleChange}
            setDeathType={setDeathType}
            deathType={deathType}
          />
        ) : activeStep === 1 ? (
          <Box mt={0}>
            <EmployeeDependentForm
              dependents={formData.dependents}
              handleDependentChange={handleDependentChange}
              addDependent={addDependent}
              removeDependent={removeDependent}
            />
          </Box>
        ) : activeStep === 2 ? (
          <Box mt={0}>
            <EmployeeDetailsForm
              handleChange={(key, value) =>
                handleChange(key, value, "workforceEmployee")
              }
              formData={formData}
            />
            {/* <EmployeeAccidentInfoForm
              handleChange={(key, value) =>
                handleChange(key, value, "employeeAccidentInfo")
              }
              formData={formData}
            /> */}
          </Box>
        ) : activeStep === 3 ? (
          <Box mt={0}>
            <EmployeeLocationForm
              handleChange={(key,value)=>handleChange(key,value,"workforceEmployee")}
              formData={formData}
            />
          </Box>
        ) : activeStep === 4 ? (
          <Box mt={0}>
            <EmployeeDetailsForm2
              selectedApplicationType={selectedApplicationType}
              handleChange={handleChange}
              formData={formData}
            />
          </Box>
        ) : (
          <Box mt={0}>
            <EmployeeAccountInfoForm
              handleChange={(key, value) =>
                handleChange(key, value, "employeeBankInfo")
              }
              formData={formData.employeeBankInfo}
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
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              <FormattedMessage module="workforce" id="workforce.submit" />
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default FinancialAssistanceForm;
