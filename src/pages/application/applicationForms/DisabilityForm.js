import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography, Checkbox,Grid,FormControlLabel  } from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage, useTranslations } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../../pickers/FileUploader";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
import EmployeeDetailsForm2 from "../EmployeeDetailsForm2";
import EmployeeLocationForm from "../EmployeeLocationForm";
import EmployeeAccidentInfoForm from "../EmployeeAccidentInfoForm";
import {
  createApplication,
  createWorkforceDocument,
  createWorkforceEmployee,
  fetchApplicationId,
  fetchWorkforceEmployee,
  updateApplication,
  updateWorkforceEmployee,
  createApplicationMovement,
} from "../../../actions";
import EmployeeAccountInfoForm from "../EmployeeAccountInfoForm";
import { formatApplicationeGQL } from "../../../utils/format_gql";
import { WORKFORCE_STATUS } from "../../../constants";
import ApplicationReasonForDisability from "../FormsComponents/Disability/ApplicationReasonForDisability";
import NidVerification from "../../../components/application-forms/NidVerification";
import PreviewDetails from "../../../components/application-forms/PreviewDetails";
import { isAtLeast18YearsOld, safeApplicationId, validateRequiredFields } from "../../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../../constants";
import { getUserType, getUserTypeFromRights } from "../../../utils/utils";
import { ApplicationFormSubmitted } from "../../../components/shared/ApplicationFormSubmitted";
import ApplicationViewPage from "../../../components/application-forms/ApplicationViewPage";

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



const DisabilityForm = ({ organizationType, selectedApplicationType, applicationForSelf, parsedApplicationData }) => {
  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("workforce");
  const stepRef = useRef(null);
  const [errors, setErrors] = useState({});
  const applicationId = useSelector((state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? []);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [disableConfirmSubmit, setDisableConfirmSubmit] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deathType, setDeathType] = useState("");
  const [nidOrBcn, setNidOrBcn] = useState({
    nid: formData?.workforceEmployee?.nid || "",
    birthCertificateNo: formData?.workforceEmployee?.birthCertificateNo,
  });
  const reduxState = useSelector((state) => state);
  const uploadFile = useSelector((state) => state.workforce.uploadFile);
  const user_type = getUserType();

  const [formData, setFormData] = useState({
    workforceEmployee: {
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
    deathType: "",
    company: null,
    factory: null,
    isSubmitted: "no",
    organizationType: "",
    applicationType: "",
    dependents: {},
    employeeBankInfo: [{}],
    employeeAccidentInfo: {},
    metadata: {},
    id: "",
  });

  // Fetch employee data based on username
  const fetchEmployeeWithUser = () => {
    if (reduxState.workforce.selectedEmployee) {
      dispatch(fetchWorkforceEmployee(modulesManager, [`id: "${decodeId(reduxState.workforce.selectedEmployee.id)}"`]));
    } else {
      dispatch(fetchWorkforceEmployee(modulesManager, [`relatedUser_LoginName_Iexact: "${reduxState.core.user.username}"`]));
    }
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
        company: employeeData.company || formData?.workforceEmployee?.company?.id || null,
        factory: employeeData.factory || formData?.workforceEmployee?.factory?.id || parsedApplicationData?.employeeFactory || null,
        applicationForSelf: applicationForSelf,
        organizationType: parsedApplicationData?.organizationType || organizationType,
        applicationType: parsedApplicationData?.applicationType || selectedApplicationType,
        grantAmount: parsedApplicationData?.grantAmount || parsedApplicationData?.employeeAccidentInfo.grantAmount,
        dependents: parsedApplicationData?.employeeDependentInfo || employeeData?.dependents || [{}],
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || [{}],
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
        metadata: parsedApplicationData?.metadata || employeeData?.metadata || {},
      });
    }
  }, [employeeData?.id, parsedApplicationData]); // Trigger this useEffect when `employeeData` changes.

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
    const newErrors = validateRequiredFields(stepRef, formatMessage);
    setErrors(newErrors);
    console.log({newErrors})
    if (Object.keys(newErrors).length === 0) {
      const nextStep = activeStep + 1;
      if(organizationType ==="eis" && eisSteps.length -1 ===activeStep) setShowPreview(true)
      if(((nextStep === 1 && organizationType === "eis") ||  (nextStep === 2 && organizationType !== "eis")) && !isAtLeast18YearsOld(formData?.workforceEmployee?.birthDate)){
        let fakeErrors = {...newErrors,rdmp:"core.error.workerAge"}
        setErrors(fakeErrors)
        console.log({fakeErrors})
      }else{
        setActiveStep(nextStep);
        if ((nextStep === 1 && organizationType === "eis") || nextStep === 2 || (nextStep === 3 && organizationType !== "eis")) {
          const workforceEmployeeData = {
            nameEn: formData?.workforceEmployee?.nameEn,
            nameBn: formData?.workforceEmployee?.nameBn,
            lastNameEn: "",
            phoneNumber: formData?.workforceEmployee?.phoneNumber,
            email: formData?.workforceEmployee?.email,
            gender: formData?.workforceEmployee?.gender?.name,
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
          await dispatch(updateWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
        } else if (nextStep === 4) {
          console.log("Create application formData:", formData);
          const updateApplicationData = {
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: formData?.workforceEmployee?.id || parsedApplicationData?.workforceEmployee?.id,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
            organizationType: formData.organizationType,
            applicationType: formData.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeDesignationInfo: JSON.stringify(formData.employeeDesignationInfo),
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
            metadata: JSON.stringify(formData.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
          };
          console.log({ updateApplicationData });
          dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
        } else if ((nextStep === 1 && organizationType !== "eis") || (nextStep === 3 && organizationType === "eis")) {
          const createApplicationData = {
            workforceEmployeeId: formData?.workforceEmployee?.id || parsedApplicationData?.workforceEmployee?.id,
            organizationType: formData.organizationType,
            applicationType: formData.applicationType,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            metadata: JSON.stringify(formData.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
          };
          if (!parsedApplicationData) {
            const applicationMutation = formatMutation("createWorkforceApplication", formatApplicationeGQL(createApplicationData), `Created application`);
            const applicationClientMutationId = applicationMutation.clientMutationId;
            console.log("applicationClientMutationId", applicationClientMutationId);
            await dispatch(createApplication(applicationMutation, `Created workforce application `));
  
            await dispatch(fetchApplicationId(modulesManager, applicationClientMutationId));
          } else {
            const updateApplicationData = {
              id: parsedApplicationData?.id,
              ...createApplicationData,
            };
            console.log("i am from update", updateApplicationData);
            dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
          }
        } else {
          const updateApplicationData = {
            // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
            organizationType: organizationType || parsedApplicationData?.organizationType,
            applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
            metadata: JSON.stringify(formData.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
          };
          dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
        }
      }
    }
    // setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleSubmit = async () => {
    console.log({ tazwer: formData });
    uploadFile.map((file, index) => {
      dispatch(createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(applicationId) }, `Created workforce document `));
    });
    const submittedBy =
      user_type === WORKFORCE_USER_TYPE.APPLICANT ? "applicant" : user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? "factory_admin" : "UNKNOWN";
    const updateApplicationData = {
      // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
      id: safeApplicationId(applicationId, parsedApplicationData),
      workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
      company: formData?.workforceEmployee?.company?.id,
      factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
      organizationType: organizationType || parsedApplicationData?.organizationType,
      applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
      grantAmount: formData?.employeeAccidentInfo.grantAmount,

      employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
      employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
      employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
      metadata: JSON.stringify(formData.metadata),
      status: WORKFORCE_STATUS.NEW,
      applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
      submittedBy,
    };

    const createApplicationMovementData = {
      applicationId: safeApplicationId(applicationId, parsedApplicationData),
      status: WORKFORCE_STATUS.NEW,
      note: "একটি নতুন আবেদন করা হয়েছে",
      applicationFromId: reduxState.core?.user?.i_user?.id,
      applicationToId: 165,
      toRoleId: 25,
    };
    console.log("hello i am from submit", createApplicationMovementData);
    await dispatch(createApplicationMovement(createApplicationMovementData, `create workforce movement`));
    await dispatch(updateApplication(updateApplicationData, `update workforce application `));
  };

  const handleArrayFieldChange = (fieldKey, index, key, value) => {
    setFormData((prev) => {
      const items = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [{}];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, [fieldKey]: items };
    });
  };

  const addArrayFieldItem = (fieldKey, defaultItem = {}) => {
    setFormData((prev) => {
      const items = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [{}];
      const updated = [...items, defaultItem];
      setExpanded?.(updated.length - 1); // optional chaining
      return { ...prev, [fieldKey]: updated };
    });
  };

  const removeArrayFieldItem = (fieldKey, index) => {
    setFormData((prev) => {
      const items = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [];
      const updated = items.filter((_, i) => i !== index);
      return { ...prev, [fieldKey]: updated };
    });
  };

  if (showPreview) {
    return (
      <div>
        <ApplicationViewPage application={formData} language={"fr"} />
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
    return <ApplicationFormSubmitted />;
  }

  const steps = [
  "workforce.application.steps.aidReason",
  "workforce.application.steps.employeeDetails",
  "workforce.application.steps.location",
  "workforce.application.steps.account.info",
  "workforce.application.disabilityInfo",
  // "workforce.application.steps.upload.documents",
];
  const eisSteps = [
  // "workforce.application.steps.aidReason",
  "workforce.application.steps.employeeDetails",
  "workforce.application.steps.location",
  "workforce.application.steps.account.info",
  // "workforce.application.disabilityInfo",
  // "workforce.application.steps.upload.documents",
];

  console.log({ formData });

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={0}>
        <Stepper activeStep={activeStep} alternativeLabel style={{ padding: "0px" }}>
          {formData?.organizationType ==="eis" ?(
          eisSteps?.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <FormattedMessage module="workforce" id={label} />
                </StepLabel>
              </Step>
            ))
          ):(
            steps?.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <FormattedMessage module="workforce" id={label} />
                </StepLabel>
              </Step>
            ))
          )}
        </Stepper>

        <Box mt={0} ref={stepRef}>
          {(() => {
            // Determine the current step label for clarity
            const currentStepLabel = steps[activeStep];

            // 1️⃣ Skip Disability Reason if organizationType === "eis"
            if (formData?.organizationType === "eis") {
              switch (activeStep) {
                case 0:
                  return (
                    <EmployeeDetailsForm
                      handleChange={(key, value) => handleChange(key, value, "workforceEmployee")}
                      formData={formData}
                      setNidOrBcn={setNidOrBcn}
                      nidOrBcn={nidOrBcn}
                      errors={errors}
                    />
                  );
                case 1:
                  return <EmployeeLocationForm handleChange={(key, value) => handleChange(key, value, "workforceEmployee")} formData={formData} />;
                case 2:
                  return (
                    <EmployeeAccountInfoForm
                      accounts={formData.employeeBankInfo}
                      formdata={formData}
                      handleChange={(index, key, value) => handleArrayFieldChange("employeeBankInfo", index, key, value)}
                      addItem={() =>
                        addArrayFieldItem("employeeBankInfo", {
                          accountHolderName: "",
                          bankName: "",
                          accountNumber: "",
                          branchName: "",
                        })
                      }
                      removeItem={(index) => removeArrayFieldItem("employeeBankInfo", index)}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      errors={errors}
                    />
                  );
                default:
                  return null;
              }
            }

            // 2️⃣ Normal flow (non-EIS)
            switch (activeStep) {
              case 0:
                return (
                  <ApplicationReasonForDisability
                    modulesManager={modulesManager}
                    setDeathType={setDeathType}
                    handleChange={(key, value) => handleChange(key, value, "metadata")}
                    deathType={deathType}
                    errors={errors}
                    formData={formData}
                  />
                );
              case 1:
                return (
                  <EmployeeDetailsForm
                    handleChange={(key, value) => handleChange(key, value, "workforceEmployee")}
                    formData={formData}
                    setNidOrBcn={setNidOrBcn}
                    nidOrBcn={nidOrBcn}
                    errors={errors}
                  />
                );
              case 2:
                return <EmployeeLocationForm handleChange={(key, value) => handleChange(key, value, "workforceEmployee")} formData={formData} />;
              case 3:
                return (
                  <EmployeeAccountInfoForm
                    accounts={formData.employeeBankInfo}
                    formdata={formData}
                    handleChange={(index, key, value) => handleArrayFieldChange("employeeBankInfo", index, key, value)}
                    addItem={() =>
                      addArrayFieldItem("employeeBankInfo", {
                        accountHolderName: "",
                        bankName: "",
                        accountNumber: "",
                        branchName: "",
                      })
                    }
                    removeItem={(index) => removeArrayFieldItem("employeeBankInfo", index)}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    errors={errors}
                  />
                );
              case 4:
                return (
                  <EmployeeAccidentInfoForm
                    handleChange={(key, value) => handleChange(key, value, "employeeAccidentInfo")}
                    formData={formData}
                    setFormData={setFormData}
                    applicationType={"disabilityAssistance"}
                    errors={errors}
                  />
                );
              default:
                return null;
            }
          })()}
        </Box>

        <Box>
          {((formData?.organizationType !=="eis" && activeStep === steps.length-1)||(formData?.organizationType ==="eis" && activeStep === eisSteps.length-1))  &&(
            <Box>
              <FormControlLabel
                    control={<Checkbox checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} style={{color:"blue"}} />}
                    label={<Typography variant="body2">{<FormattedMessage id="workforce.application.acknowledgement.text" module="workforce" />}</Typography>}
                  />
            </Box>
          )}
        <div className={classes.buttonContainer}>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="outlined">
              <FormattedMessage module="workforce" id="workforce.back" />
            </Button>
          )}
          {((formData?.organizationType !=="eis" && activeStep < steps.length - 1)||(formData?.organizationType ==="eis" && activeStep < eisSteps.length - 1) ) ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              <FormattedMessage module="workforce" id="workforce.save.next" />
            </Button>
          ) : (
            <>
            {formData?.organizationType === "eis"? (
                  <Button variant="contained" color="primary" disabled={!acknowledged} onClick={() => {organizationType ==="eis"? handleNext() :setShowPreview(true)}}>
                    <FormattedMessage module="workforce" id="workforce.submit" />
                  </Button>
                  
            ):(
              <Button variant="contained" color="primary" disabled={!acknowledged} onClick={() => setShowPreview(true)}>
                    <FormattedMessage module="workforce" id="workforce.submit" />
                  </Button>
            )}
            </>
          )}
        </div>
        </Box>
      </Paper>
    </div>
  );
};

export default DisabilityForm;
