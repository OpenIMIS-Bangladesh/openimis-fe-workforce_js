import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography } from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage,useTranslations } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../../pickers/FileUploader";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
import EmployeeDetailsForm2 from "../EmployeeDetailsForm2";
import EmployeeLocationForm from "../EmployeeLocationForm";
import EmployeeDependentForm from "../EmployeeDependentForm";
import MedicalDonationCheckbox from "../FormsComponents/MedicalDonationForm/MedicalDonationCheckbox";
import {
  createApplication,
  createWorkforceDocument,
  fetchApplicationId,
  fetchEmployeeDependent,
  fetchInfoIdByClientMutationId,
  fetchWorkforceEmployee,
  updateApplication,
  updateWorkforceEmployee,
  createApplicationMovement
} from "../../../actions";
import EmployeeAccountInfoForm from "../EmployeeAccountInfoForm";
import { formatApplicationeGQL } from "../../../utils/format_gql";
import NidVerification from "../../../components/application-forms/NidVerification";
import PreviewDetails from "../../../components/application-forms/PreviewDetails";
import { WORKFORCE_STATUS, WORKFORCE_USER_TYPE } from "../../../constants";
import { ApplicationFormSubmitted } from "../../../components/shared/ApplicationFormSubmitted";
import { getInfoId, getUserType, safeApplicationId, validateRequiredFields } from "../../../utils/utils";
import EmployeeAccidentInfoForm from "../EmployeeAccidentInfoForm";
import WorkerExtraInfo from "../FormsComponents/MedicalDonationForm/WorkerExtraInfo";
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

const MedicalDonationForm = ({  organizationType, selectedApplicationType, applicationForSelf, parsedApplicationData }) => {
  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);

  const modulesManager= useModulesManager()
    const { formatMessage } = useTranslations("workforce");
    const stepRef =useRef(null)
    const [errors,setErrors] = useState({})
  const applicationId = useSelector((state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? []);
    const uploadFile = useSelector((state) => state.workforce.uploadFile);
    const uploadDependentFile = useSelector((state) => state.workforce.uploadDependentFile);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedForm, setSelectedForm] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
    const [disableConfirmSubmit, setDisableConfirmSubmit] = useState(false);
  const user_type = getUserType();
  const reduxState = useSelector((state) => state);
  const [nidOrBcn, setNidOrBcn] = useState({
    nid: formData?.workforceEmployee?.nid || "",
    birthCertificateNo: formData?.workforceEmployee?.birthCertificateNo,
  });

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
    company: null,
    factory: null,
    isSubmitted: "no",
    organizationType: "",
    applicationType: "",
    applicationForSelf: applicationForSelf,
    dependents: [{}],
    employeeBankInfo: {
      bank: null,
      branch: null,
      accountHolderName: "",
      routingNumber: "",
      accountNumber: "",
    },
    employeeAccidentInfo: {},
    institutionInfo: {},
    id: "",
  });

  useEffect(() => {
    if (applicationId && applicationId.length > 0 && applicationId[0]?.id) {
      setFormData((prev) => ({
        ...prev,
        applicationId: applicationId[0].id,
      }));
    }
  }, [applicationId]);

  // Fetch employee data based on username
  const fetchEmployeeWithUser = () => {
    dispatch(fetchWorkforceEmployee(modulesManager, [`relatedUser_LoginName_Iexact: "${reduxState.core.user.username}"`]));
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
        company: employeeData.company || formData?.workforceEmployee?.company?.id || null,
        factory: employeeData.factory || formData?.workforceEmployee?.factory?.id ||parsedApplicationData?.employeeFactory ||null,
        applicationForSelf: applicationForSelf,
        organizationType: parsedApplicationData?.organizationType || organizationType,
        applicationType: parsedApplicationData?.applicationType || selectedApplicationType,
        grantAmount: parsedApplicationData?.grantAmount || parsedApplicationData?.employeeAccidentInfo.grantAmount,
        dependents: parsedApplicationData?.employeeDependentInfo || employeeData.dependents || [{}],
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || [{}],
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
        institutionInfo: parsedApplicationData?.institutionInfo || employeeData?.institutionInfo || {},
        metadata: parsedApplicationData?.metadata || employeeData?.metadata || {},
      });
    }
  }, [employeeData?.id, parsedApplicationData]);

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
    
        if (Object.keys(newErrors).length === 0 ){
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    if (nextStep === 2 || nextStep === 3) {
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
      // dispatch(
      //   updateApplication(
      //     formData,
      //     `update workforce application ${formData.firstNameEn}`
      //   )
      // );
    } else if (nextStep === 1) {
      console.log("Create application formData:", formData);
      const createApplicationData = {
        workforceEmployeeId: formData?.workforceEmployee?.id || parsedApplicationData?.workforceEmployee?.id,
        company: formData?.workforceEmployee?.company?.id,
        factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
        organizationType: formData.organizationType,
        applicationType: formData.applicationType,
        grantAmount: formData?.employeeAccidentInfo.grantAmount,
        employeeDesignationInfo: JSON.stringify(formData.employeeDesignationInfo),
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
        institutionInfo: JSON.stringify(formData?.institutionInfo),
        metadata: JSON.stringify(formData?.metadata),
        status: WORKFORCE_STATUS.DRAFT,
        applicationFor: applicationForSelf ==="yes" ?"self":"dependent",

      };
      console.log({ createApplicationData });
      if (!parsedApplicationData) {
        const applicationMutation = await formatMutation("createWorkforceApplication", formatApplicationeGQL(createApplicationData), `Created application `);
        const applicationClientMutationId = applicationMutation.clientMutationId;
        console.log("applicationClientMutationId", applicationClientMutationId);
        await dispatch(createApplication(applicationMutation, `Created workforce application `));

        const fetchRes = await dispatch(
          fetchInfoIdByClientMutationId(modulesManager, "workforceApplication", applicationClientMutationId, "WORKFORCE_APPLICATION_BY_CLIENT_MUTATION_ID")
        );
        let applicationgetId = getInfoId(fetchRes, "workforceApplication");
        console.log("hello there", applicationgetId);
        if (!applicationgetId && applicationId) {
          applicationgetId = applicationId;
        }

        if (applicationForSelf === "no" && uploadDependentFile) {
          await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${applicationgetId}"`])).then((res) => {
            const dependentId = res?.payload?.data?.workforceEmployeeDependent?.edges[0]?.node?.id;
            console.log({ dependentId });
            uploadDependentFile.map((file, index) => {
                            dispatch(createWorkforceDocument({ ...file, workforceApplicationId: applicationgetId,workforceDependentId: decodeId(dependentId)  }, `Created workforce document `));
                          });
              // dispatch(
              //   createWorkforceDocument(
              //     { ...uploadFile, workforceApplicationId: applicationgetId, workforceDependentId: decodeId(dependentId) },
              //     `Created workforce document`
              //   )
              // );
          });
        }
      } else {
        const updateApplicationData = { id: parsedApplicationData?.id, ...createApplicationData };
        console.log("i am from update", updateApplicationData);
        dispatch(updateApplication(updateApplicationData, `update workforce application `));
      }
    } else {
      const updateApplicationData = {
        id: safeApplicationId(applicationId, parsedApplicationData),
        workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
        company: formData?.workforceEmployee?.company?.id,
        factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
        organizationType: organizationType || parsedApplicationData?.organizationType,
        applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
        grantAmount: formData?.employeeAccidentInfo.grantAmount,
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") || JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
        institutionInfo: JSON.stringify(formData?.institutionInfo),
        metadata: JSON.stringify(formData?.metadata),
        status: WORKFORCE_STATUS.DRAFT,
        applicationFor: applicationForSelf ==="yes" ?"self":"dependent",
        
      };

      console.log("i am from accident info", updateApplicationData);
      dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
    }
  }
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

  const handleSubmit = async () => {
    console.log({ tazwer: formData });
        uploadFile.map((file,index)=>{
                  dispatch(createWorkforceDocument({...file,workforceApplicationId:safeApplicationId(applicationId)}, `Created workforce document `));
                })

        const submittedBy =
          user_type === WORKFORCE_USER_TYPE.APPLICANT ? "applicant" : user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? "factory_admin" : "UNKNOWN";
    
        const updateApplicationData = {
          id: safeApplicationId(applicationId, parsedApplicationData),
          workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
          company: formData?.workforceEmployee?.company?.id,
          factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
          organizationType: organizationType || parsedApplicationData?.organizationType,
          applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
          grantAmount: formData?.employeeAccidentInfo.grantAmount,
          employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
          employeeDependentInfo: JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") || JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
          employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
          institutionInfo: JSON.stringify(formData?.institutionInfo),
          metadata: JSON.stringify(formData?.metadata),
          status: WORKFORCE_STATUS.NEW,
          applicationFor: applicationForSelf ==="yes" ?"self":"dependent",
          submittedBy,
        };
       const createApplicationMovementData = {
             applicationId: safeApplicationId(applicationId,parsedApplicationData),
             status: WORKFORCE_STATUS.NEW,
             note: "একটি নতুন আবেদন করা হয়েছে",
             applicationFromId: parseInt(reduxState.core.user.id),
             applicationToId: 210,
             toRoleId: 51,
           };
      console.log("hello i am from submit", updateApplicationData);
      dispatch(updateApplication(updateApplicationData, `update workforce application `));
      dispatch(createApplicationMovement(createApplicationMovementData,`create workforce movement`));
    // setShowPreview(true);
    // setIsSubmitted(true);
  };

  const steps = [
    {
      label: "workforce.application.steps.select",
      content: <MedicalDonationCheckbox errors={errors} handleChange={(key, value) => handleChange(key, value, "metadata")} formData={formData} />,
    },
    {
      label: "workforce.application.steps.employeeDetails",
      content: (
        <EmployeeDetailsForm
          handleChange={(key, value) => handleChange(key, value, "workforceEmployee")}
          setNidOrBcn={setNidOrBcn}
          nidOrBcn={nidOrBcn}
          formData={formData}
          errors={errors}
        />
      ),
    },
    {
      label: "workforce.application.steps.location",
      content: <EmployeeLocationForm errors={errors} handleChange={(key, value) => handleChange(key, value, "workforceEmployee")} formData={formData} />,
    },
    {
      label: "workforce.application.steps.worker.extraInfo",
      content: <WorkerExtraInfo errors={errors} handleChange={(key,value)=>handleChange(key,value,"institutionInfo")} formData={formData} />,
    },
    ...(applicationForSelf === "no"
      ? [
          {
            label: "workforce.application.steps.dependent",
            content: (
              <EmployeeDependentForm
                applicationType={formData.applicationType}
                dependents={formData.dependents}
                handleChange={(index, key, value) => handleArrayFieldChange("dependents", index, key, value)}
                addItem={() => addArrayFieldItem("dependents", { fullName: "", relationship: "" })}
                removeItem={(index) => removeArrayFieldItem("dependents", index)}
                expanded={expanded}
                formdata={formData}
                setExpanded={setExpanded}
                errors={errors}
              />
            ),
          },
        ]
      : []),
    {
      label: "workforce.application.steps.treatment.info",
      content: (
        <EmployeeAccidentInfoForm
          handleChange={(key, value) => handleChange(key, value, "employeeAccidentInfo")}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      ),
    },
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
    {
      label: "workforce.application.steps.upload.documents",
      content: <EmployeeDetailsForm2 handleChange={handleChange} formData={formData} selectedApplicationType={selectedApplicationType}  formStepNo={"workforceDocument"}/>,
    },
  ];

  console.log({ tazwer: formData });

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
      // <div >
      //     <ApplicationViewPage application={formData} language={"fr"} />
      //   <Paper className={classes.paper} elevation={0}>
      //     <PreviewDetails formData={formData} />
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

        <Box mt={0} ref={stepRef}>{steps[activeStep].content}</Box>
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

export default MedicalDonationForm;
