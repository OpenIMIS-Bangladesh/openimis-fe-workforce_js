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
import { useModulesManager, formatMutation, decodeId } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../../pickers/FileUploader";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
import EmployeeDetailsForm2 from "../EmployeeDetailsForm2";
import EmployeeLocationForm from "../EmployeeLocationForm";
import EmployeeDependentForm from "../EmployeeDependentForm";
import EmployeeAccidentInfoForm from "../EmployeeAccidentInfoForm";
import EmployeeChildrenDetailsForm from "../EmployeeChildrenDetailsForm";
import {
  createApplication,
  fetchApplicationId,
  fetchWorkforceEmployee,
  updateApplication,
  updateWorkforceEmployee,
} from "../../../actions";
import EmployeeAccountInfoForm from "../EmployeeAccountInfoForm";
import { formatApplicationeGQL } from "../../../utils/format_gql";

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
  "Labour Details",
  "Location",
  "Children Info",
  "Upload Documents",
  "Dependent",
  "Account info",
];

const MedicalAssistanceForm = ({ modulesManager,organizationType,selectedApplicationType }) => {
  const employeeData = useSelector(
    (state) => state.workforce["workforceEmployee"] ?? []
  );

  const applicationId = useSelector(
    (state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? []
  );
  const classes = useStyles();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedForm, setSelectedForm] = useState(null);
  const reduxState = useSelector((state) => state);

  const [formData, setFormData] = useState({
    firstNameEn: "",
    firstNameBn: "",
    lastNameEn: "",
    lastNameBn: "",
    otherName: "",
    position: "",
    fatherNameEn: "",
    fatherNameBn: "",
    motherNameEn: "",
    motherNameBn: "",
    spouseNameEn: "",
    spouseNameBn: "",
    phoneNumber: "",
    email: "",
    citizenship: "",
    birthDate: "",
    deathDate: "",
    joinDate: "",
    nid: "",
    birthCertificateNo: "",
    insuranceNumber: "",
    company: null,
    factory: null,
    lifeStatus: "",
    gender: "",
    maritalStatus: "",
    monthlyEarning: "",
    uploadedNidFile: [],
    uploadedBirthCertificateFile: [],
    permanentAddress: "",
    permanentLocation: "",
    presentLocation: "",
    presentAddress: "",
    organizationId:"",
    dependents: [{}],
    employeeBankInfo: {},
    employeeChildrenInfo: {},
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
        organization: employeeData.organization,
        id: employeeData.id || "",
        firstNameEn: employeeData.firstNameEn || "",
        firstNameBn: employeeData.firstNameBn || "",
        lastNameEn: employeeData.lastNameEn || "",
        lastNameBn: employeeData.lastNameBn || "",
        otherName: employeeData.otherName || "",
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
        company: employeeData.company || null,
        factory: employeeData.factory || null,
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
        dependents: employeeData.dependents || [{}],
        employeeBankInfo: employeeData.employeeBankInfo || {},
        employeeChildrenInfo: employeeData.employeeChildrenInfo || {},
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
        firstNameBn: formData?.firstNameBn || formData.firstNameBn,
        lastNameBn: formData?.lastNameBn || formData.lastNameBn,
        otherName: formData?.otherName || formData.otherName,
        firstNameEn: formData?.firstNameEn || formData.firstNameEn,
        lastNameEn: formData?.lastNameEn || formData.lastNameEn,
        phoneNumber: formData?.phoneNumber || formData.phoneNumber,
        email: formData?.email || formData.email,
        gender: formData?.gender?.id || formData.gender.id,
        birthDate: formData?.birthDate || formData.birthDate,
        deathDate: formData?.deathDate || formData.deathDate,
        lifeStatus: formData?.lifeStatus || formData.lifeStatus,
        permanentAddress:
          formData?.permanentAddress || formData.permanentAddress,
        presentAddress: formData?.presentAddress || formData.presentAddress,
        position: formData?.position || formData.position,
        monthlyEarning: formData?.monthlyEarning || formData.monthlyEarning,
        insuranceNumber: formData?.insuranceNumber || formData.insuranceNumber,
        fatherNameBn: formData?.fatherNameBn || formData.fatherNameBn,
        fatherNameEn: formData?.fatherNameEn || formData.fatherNameEn,
        motherNameBn: formData?.motherNameBn || formData.motherNameBn,
        motherNameEn: formData?.motherNameEn || formData.motherNameEn,
        spouseNameBn: formData?.spouseNameBn || formData.spouseNameBn,
        spouseNameEn: formData?.spouseNameEn || formData.spouseNameEn,
        citizenship: formData?.citizenship || formData.citizenship,
        maritalStatus: formData?.maritalStatus || formData.maritalStatus,
        presentLocation: formData?.presentLocation || formData.presentLocation,
        permanentLocation:
          formData?.permanentLocation || formData.permanentLocation,
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
        employeeDesignationInfo: JSON.stringify(formData.employeeDesignationInfo),
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependents),
        employeeChildrenInfo: JSON.stringify(formData.employeeChildrenInfo),
        status: "ontest",
      };

      const applicationMutation = await formatMutation(
        "createWorkforceApplication",
        formatApplicationeGQL(createApplicationData),
        `Created application ${formData.nameEn}`
      );
      const applicationClientMutationId = applicationMutation.clientMutationId;

      await dispatch(
        createApplication(
          createApplicationData,
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
        employeeDesignationInfo: formData.employeeDesignationInfo,
        employeeBankInfo: formData.employeeBankInfo,
        employeeDependentInfo: formData.dependents,
        employeeChildrenInfo: formData.employeeChildrenInfo,
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

  const handleSubmit = () => {
    console.log("Submitting formData:", formData);
    dispatch(
      createApplication(
        formData,
        `Created workforce application ${formData.firstNameEn}`
      )
    );
  };

  console.log({ applicationId });

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 ? (
          <EmployeeDetailsForm
            handleChange={handleChange}
            formData={formData}
          />
        ) : activeStep === 1 ? (
          <Box mt={3}>
            <EmployeeLocationForm
              handleChange={handleChange}
              formData={formData}
            />
          </Box>
        ) : activeStep === 2 ? (
          <Box mt={3}>
            <EmployeeChildrenDetailsForm
              handleChange={(key, value) =>
                handleChange(key, value, "employeeChildrenInfo")
              }
              formData={formData}
            />
          </Box>
          
        ) : activeStep === 3 ? (
          <Box mt={3}>
            <EmployeeDetailsForm2
              handleChange={handleChange}
              formData={formData}
            />
          </Box>
          
        ) : activeStep === 4 ? (
          <Box mt={3}>
            <EmployeeDependentForm
              dependents={formData.dependents}
              handleDependentChange={handleDependentChange}
              addDependent={addDependent}
              removeDependent={removeDependent}
            />
          </Box>
         
        ) : (
          <Box mt={3}>
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
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Save & Next
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default MedicalAssistanceForm;
