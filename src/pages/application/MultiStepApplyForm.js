import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography } from "@material-ui/core";
import FileUploader from "../../pickers/FileUploader";  
import EmployeeDetailsForm from "./EmployeeDetailsForm";
import EmployeeDetailsForm2 from "./EmployeeDetailsForm2";
import EmployeeLocationForm from "./EmployeeLocationForm";
import EmployeeDependentForm from "./EmployeeDependentForm";
import EmployeeAccidentInfoForm from "./EmployeeAccidentInfoForm";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // height: "100vh",
  },
  paper: {
    padding: theme.spacing(2),
    width: 700,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
}));

// const steps = ["Labour Details", "Upload Documents","Location","Dependent","Accident Info"];
const steps = ["শ্রমিকের বিবরণ", "নথি আপলোড করুন","ঠিকানা","নির্ভরশীল","দুর্ঘটনার তথ্য"];

const MultiStepApplyForm = () => {
  const classes = useStyles();
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
    uploadedNidFile: null,  // Store uploaded files
    uploadedBirthCertificateFile: null,
    permanentAddress:"",
    permanentLocation:null,
    presentAddress:"",
    presentLocation:null
  });
  
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  console.log({formData})

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
          <EmployeeDetailsForm handleChange={handleChange} formData={formData} setFormData={setFormData} />
        ) :activeStep === 1? (
          <Box mt={3}>
          
          <EmployeeDetailsForm2 handleChange={handleChange} formData={formData} setFormData={setFormData} />
          </Box>
        ):activeStep === 2?(
            <Box mt={3}>
             
            <EmployeeLocationForm handleChange={handleChange} formData={formData} setFormData={setFormData} />
            </Box>
          ):activeStep === 3?(
            <Box mt={3}>
            
            <EmployeeDependentForm handleChange={handleChange} formData={formData} setFormData={setFormData} />
            </Box>
          ):(
            <Box mt={3}>
            
            <EmployeeAccidentInfoForm handleChange={handleChange} formData={formData} setFormData={setFormData} />
            </Box>
          )}
        <div className={classes.buttonContainer}>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
             Save & Next
            </Button>
          ) : (
            <Button variant="contained" color="secondary">Submit</Button>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default MultiStepApplyForm;
