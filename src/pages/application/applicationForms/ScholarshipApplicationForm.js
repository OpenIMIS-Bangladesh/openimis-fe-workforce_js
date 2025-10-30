import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography, Checkbox,Grid,FormControlLabel  } from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage, useTranslations } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
import EmployeeDetailsForm2 from "../EmployeeDetailsForm2";
import EmployeeLocationForm from "../EmployeeLocationForm";
import EmployeeDependentForm from "../EmployeeDependentForm";
import EmployeeChildrenDetailsForm from "../EmployeeChildrenDetailsForm";
import ScholarshipApplicationCheckbox from "../FormsComponents/ScholarshipApplicationForm/ScholarshipApplicationCheckbox";

import {
  createApplication,
  createEducationInfo,
  createWorkforceDocument,
  createWorkforceEmployee,
  fetchApplicationId,
  fetchInfoIdByClientMutationId,
  fetchWorkforceEmployee,
  updateApplication,
  updateWorkforceEmployee,
  createApplicationMovement,
} from "../../../actions";
import EmployeeAccountInfoForm from "../EmployeeAccountInfoForm";
import { formatApplicationeGQL } from "../../../utils/format_gql";
import { WORKFORCE_STATUS } from "../../../constants";
import NidVerification from "../../../components/application-forms/NidVerification";
import PreviewDetails from "../../../components/application-forms/PreviewDetails";
import { getInfoId, isAtLeast18YearsOld, safeApplicationId, validateRequiredFields } from "../../../utils/utils";
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

const ScholarshipApplicationForm = ({ organizationType, selectedApplicationType, applicationForSelf, parsedApplicationData }) => {
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
  const [selectedScholarshipOption, setSelectedScholarshipOption] = useState("");
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const reduxState = useSelector((state) => state);
  const [disableConfirmSubmit, setDisableConfirmSubmit] = useState(false);
  const [nidOrBcn, setNidOrBcn] = useState({
    nid: formData?.workforceEmployee?.nid || "",
    birthCertificateNo: formData?.workforceEmployee?.birthCertificateNo,
  });
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
    scholarshipProgram: "",
    company: null,
    factory: null,
    isSubmitted: "no",
    organizationType: "",
    applicationType: "",
    applicationForSelf: applicationForSelf,
    dependent: {},
    employeeBankInfo: [{}],
    employeeChildrenInfo: {},
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
        metadata: parsedApplicationData?.metadata || employeeData?.metadata || {},
        dependents: parsedApplicationData?.employeeDependentInfo || employeeData.dependents || {},
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || [{}],
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
        employeeChildrenInfo: parsedApplicationData?.employeeChildrenInfo || employeeData.employeeChildrenInfo || {},
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

    if (Object.keys(newErrors).length === 0) {
      const nextStep = activeStep + 1;
      if (nextStep === 1 && !isAtLeast18YearsOld(formData?.workforceEmployee?.birthDate)) {
        let fakeErrors = {...newErrors,rdmp:"core.error.workerAge"}
        setErrors(fakeErrors)
        console.log({fakeErrors})
      }else{
        setActiveStep(nextStep);
        if (nextStep === 1 || (nextStep === 2 && applicationForSelf === "no") || (nextStep === 3 && applicationForSelf === "yes")) {
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
          // if (workforceEmployeeData?.id) {
          // } else {
          //   await dispatch(createWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
          // }
        } else if (nextStep === 4) {
          const updateApplicationData = {
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: formData?.workforceEmployee?.id || parsedApplicationData?.workforceEmployee?.id,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
            organizationType: formData.organizationType,
            applicationType: formData.applicationType,
            employeeDesignationInfo: JSON.stringify(formData.employeeDesignationInfo),
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
            employeeDependentInfo: JSON.stringify(formData.dependent),
            employeeChildrenInfo: JSON.stringify(formData.employeeChildrenInfo),
            metadata: JSON.stringify(formData.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : "dependent",
          };
  
          console.log({ updateApplicationData });
  
          console.log("i am from first update", updateApplicationData);
          dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
        } else if ((nextStep === 2 && applicationForSelf === "yes") || (nextStep === 3 && applicationForSelf === "no")) {
          const createApplicationData = {
            workforceEmployeeId: formData?.workforceEmployee?.id || parsedApplicationData?.workforceEmployee?.id,
            organizationType: formData.organizationType,
            applicationType: formData.applicationType,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
            employeeDesignationInfo: JSON.stringify(formData.employeeDesignationInfo),
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
            employeeDependentInfo: JSON.stringify(formData.dependent),
            employeeChildrenInfo: JSON.stringify(formData.employeeChildrenInfo),
            metadata: JSON.stringify(formData.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : "dependent",
          };
          if (!parsedApplicationData) {
            const applicationMutation = await formatMutation(
              "createWorkforceApplication",
              formatApplicationeGQL(createApplicationData),
              `Created application ${formData.workforceEmployee.nameEn}`
            );
            const applicationClientMutationId = applicationMutation.clientMutationId;
            console.log("applicationClientMutationId", applicationClientMutationId);
            await dispatch(createApplication(applicationMutation, `Created workforce application ${formData.firstNameEn}`));
  
            // await dispatch(fetchApplicationId(modulesManager, applicationClientMutationId));
            const fetchRes = await dispatch(
              fetchInfoIdByClientMutationId(modulesManager, "workforceApplication", applicationClientMutationId, "WORKFORCE_APPLICATION_BY_CLIENT_MUTATION_ID")
            );
            let applicationgetId = getInfoId(fetchRes, "workforceApplication");
            console.log("hello there", applicationgetId);
            if (!applicationgetId && applicationId) {
              applicationgetId = applicationId;
            }
  
            const createEducation = {
              applicationId: applicationgetId,
              educationLevel: formData?.employeeChildrenInfo?.scholarshipFor,
              educationBoard: formData?.employeeChildrenInfo?.board,
              passingYear: formData?.employeeChildrenInfo?.passingYear,
              rollNumber: formData?.employeeChildrenInfo?.rollNo,
              admissionYear: formData?.employeeChildrenInfo?.admissionYear,
              IdNumber: formData?.employeeChildrenInfo?.idNo,
              registrationNumber: formData?.employeeChildrenInfo?.regNo,
              result: formData?.employeeChildrenInfo?.cgpa,
              institution: formData?.employeeChildrenInfo?.university,
              childBirthDate: formData?.employeeChildrenInfo?.birthDate,
              childNameEn: formData?.employeeChildrenInfo?.nameEn,
              childNameBn: formData?.employeeChildrenInfo?.nameBn,
              childNidNo: formData?.employeeChildrenInfo?.nid,
              childBirthCertificateNo: formData?.employeeChildrenInfo?.nid,
              studyClass: formData?.employeeChildrenInfo?.studyingClass,
            };
  
            await dispatch(createEducationInfo(createEducation, `Created workforce education Info`));
          } else {
            const updateApplicationData = { id: parsedApplicationData?.id, ...createApplicationData };
            console.log("i am from update", updateApplicationData);
            dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
          }
        } else {
          const updateApplicationData = {
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
            organizationType: organizationType || parsedApplicationData?.organizationType,
            applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
            employeeDependentInfo: JSON.stringify(formData.dependent) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
            employeeChildrenInfo: JSON.stringify(formData.employeeChildrenInfo) || JSON.stringify(parsedApplicationData?.employeeChildrenInfo),
            metadata: JSON.stringify(formData.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : "dependent",
          };
          dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
        }
      }
    }
    // setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

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

  const handleSubmit = () => {
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
      employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
      employeeDependentInfo: JSON.stringify(formData.dependent) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
      employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
      employeeChildrenInfo: JSON.stringify(formData.employeeChildrenInfo) || JSON.stringify(parsedApplicationData?.employeeChildrenInfo),
      metadata: JSON.stringify(formData.metadata),
      status: WORKFORCE_STATUS.NEW,
      applicationFor: applicationForSelf === "yes" ? "self" : "dependent",
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
    console.log("hello i am from submit", updateApplicationData);
    dispatch(updateApplication(updateApplicationData, `update workforce application `));
    dispatch(createApplicationMovement(createApplicationMovementData, `create workforce movement`));
    // setShowPreview(true);
    // setIsSubmitted(true);
  };

  console.log({ formData });

  const steps = [
    {
      label: "workforce.application.steps.employeeDetails",
      content: (
        <EmployeeDetailsForm
          handleChange={(key, value) => handleChange(key, value, "workforceEmployee")}
          formData={formData}
          setNidOrBcn={setNidOrBcn}
          nidOrBcn={nidOrBcn}
          errors={errors}
        />
      ),
    },
    ...(applicationForSelf === "yes"
      ? [
          {
            label: "workforce.application.steps.education.details",
            content: (
              <ScholarshipApplicationCheckbox
                handleChange={(key, value) => handleChange(key, value, "employeeChildrenInfo")}
                setSelectedScholarshipOption={setSelectedScholarshipOption}
                selectedScholarshipOption={selectedScholarshipOption}
                formData={formData}
                applicationForSelf={applicationForSelf}
                errors={errors}
              />
            ),
          },
        ]
      : []),
    {
      label: "workforce.application.steps.location",
      content: <EmployeeLocationForm handleChange={(key, value) => handleChange(key, value, "workforceEmployee")} formData={formData} />,
    },
    ...(applicationForSelf === "no"
      ? [
          {
            label: "workforce.application.steps.childInfo",
            content: (
              <ScholarshipApplicationCheckbox
                handleChange={(key, value) => handleChange(key, value, "employeeChildrenInfo")}
                setSelectedScholarshipOption={setSelectedScholarshipOption}
                selectedScholarshipOption={selectedScholarshipOption}
                formData={formData}
                applicationForSelf={applicationForSelf}
                errors={errors}
              />
            ),
          },
        ]
      : []),
    {
      label: "workforce.application.steps.account.info",
      content: (
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
      ),
    },
    // {
    //   label: "workforce.application.steps.upload.documents",
    //   content: (

    //       <EmployeeDetailsForm2
    //         handleChange={handleChange}
    //         formData={formData}
    //         selectedApplicationType={selectedApplicationType}

    //         formStepNo={"workforceDocument"}
    //       />
    //   ),
    // },
  ];

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
      // <div className={classes.container}>
      //   <Paper className={classes.paper} elevation={0}>
      //     <PreviewDetails formData={formData} language={reduxState.core?.user?.i_user?.language} />
      //     <div className={classes.buttonContainer}>
      //       <Button
      //         variant="outlined"
      //         color="error"
      //         onClick={() => {
      //           setShowPreview(false);
      //         }}
      //       >
      //         <FormattedMessage module="workforce" id="workforce.back" />
      //       </Button>
      //       <Button
      //         variant="contained"
      //         color="primary"
      //         onClick={() => {
      //           setShowPreview(false);
      //           setShowVerifyNid(true);
      //         }}
      //       >
      //         <FormattedMessage module="workforce" id="workforce.submit" />
      //       </Button>
      //     </div>
      //   </Paper>
      // </div>
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

  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={0}>
        <Stepper activeStep={activeStep} alternativeLabel style={{ padding: "0px" }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>
                <FormattedMessage module="workforce" id={step.label} />
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={0} ref={stepRef}>
          {steps[activeStep].content}
        </Box>

        {activeStep === steps.length - 1 && (
                    <Box>
                      <FormControlLabel
                        control={<Checkbox checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} style={{ color: "blue" }} />}
                        label={<Typography variant="body2">{<FormattedMessage id="workforce.application.acknowledgement.text" module="workforce" />}</Typography>}
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
                  <Button variant="contained" color="primary" disabled={!acknowledged} onClick={() => setShowPreview(true)}>
                    <FormattedMessage module="workforce" id="workforce.submit" />
                  </Button>
            
          )}
        </div>
      </Paper>
    </div>
  );
};

export default ScholarshipApplicationForm;
