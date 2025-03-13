import React, { useState } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../pickers/FileUploader";
import EmployeeDetailsForm from "./EmployeeDetailsForm";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";
import EmployeeLocationForm from "./EmployeeLocationForm";
import EmployeeDependentForm from "./EmployeeDependentForm";
import EmployeeAccidentInfoForm from "./EmployeeAccidentInfoForm";
import { createApplication } from "../../actions";

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
    justifyContent: "flex-end", // Align buttons to the right
    gap: theme.spacing(1), // Add spacing between buttons
  },
}));

const steps = ["Labour Details", "Upload Documents","Location","Dependent","Accident Info"];
// const steps = [
//   "শ্রমিকের বিবরণ",
//   "নথি আপলোড করুন",
//   "ঠিকানা",
//   "নির্ভরশীল",
//   "দুর্ঘটনার তথ্য",
// ];

const MultiStepApplyForm = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
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
    company: null,
    factory: null,
    lifeStatus: "",
    gender: "",
    maritalStatus: "",
    monthlyEarning: "",
    uploadedNidFile: [],
    uploadedBirthCertificateFile: [],
    permanentAddress: "",
    permanentLocation: null,
    presentLocation: null,
    presentAddress: "",
    injuryType: "",
    accidentDate: "",
    accidentTime: "",
    accidentType: "",
    dutyStatus: "",
    inOutsideFactory: "",
    reJoiningDate: "",
    dependents: [{}],
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  // Function to update dependents
  const handleDependentChange = (index, key, value) => {
    setFormData((prev) => {
      const updatedDependents = [...prev.dependents];
      updatedDependents[index] = { ...updatedDependents[index], [key]: value };
      return { ...prev, dependents: updatedDependents };
    });
  };

  // Function to add a new dependent
  const addDependent = () => {
    setFormData((prev) => ({
      ...prev,
      dependents: [...prev.dependents, {}],
    }));
  };

  // Function to remove a dependent
  const removeDependent = (index) => {
    setFormData((prev) => {
      const updatedDependents = prev.dependents.filter((_, i) => i !== index);
      return { ...prev, dependents: updatedDependents };
    });
  };

  const handleSubmit = () => {
    console.log("Submitting formData:", formData); // Log the formData when submit is clicked
    dispatch(
      createApplication(
        formData,
        `Created workforce application ${formData.firstNameEn}`
      )
    );
  };


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
            setFormData={setFormData}
          />
        ) : activeStep === 1 ? (
          <Box mt={3}>
            <EmployeeDetailsForm2
              handleChange={handleChange}
              formData={formData}
              setFormData={setFormData}
            />
          </Box>
        ) : activeStep === 2 ? (
          <Box mt={3}>
            <EmployeeLocationForm
              handleChange={handleChange}
              formData={formData}
              setFormData={setFormData}
            />
          </Box>
        ) : activeStep === 3 ? (
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
            <EmployeeAccidentInfoForm
              handleChange={handleChange}
              formData={formData}
              setFormData={setFormData}
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit} // Ensure the function is being called
            >
              Submit
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default MultiStepApplyForm;
