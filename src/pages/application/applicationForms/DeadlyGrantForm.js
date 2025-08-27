import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography } from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage,useTranslations } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import FileUploader from "../../../pickers/FileUploader";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
import ApplicantDetailsForm from "../ApplicantDetailsForm";
import EmployeeDetailsForm2 from "../EmployeeDetailsForm2";
import EmployeeLocationForm from "../EmployeeLocationForm";
import EmployeeDependentForm from "../EmployeeDependentForm";
import EmployeeAccidentInfoForm from "../EmployeeAccidentInfoForm";
import {
  createApplication,
  createWorkforceDocument,
  createWorkforceEmployee,
  fetchApplicationId,
  fetchEmployeeDependent,
  fetchInfoIdByClientMutationId,
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
import { getInfoId, safeApplicationId, validateRequiredFields } from "../../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../../constants";
import { getUserType, getUserTypeFromRights } from "../../../utils/utils";
import { ApplicationFormSubmitted } from "../../../components/shared/ApplicationFormSubmitted";
import WorkerExtraInfo from "../FormsComponents/MedicalDonationForm/WorkerExtraInfo";

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
  "workforce.application.steps.deademployee.applicant.Details",
  "workforce.application.steps.deathLabourDetails",
  "workforce.application.steps.location",
  "workforce.application.steps.dead.worker.extraInfo",
  "workforce.application.steps.prosurders",
  "workforce.application.steps.account.info",
  "workforce.application.steps.upload.documents",
];

const DeadlyGrantForm = ({  organizationType, selectedApplicationType, parsedApplicationData,applicationForSelf }) => {
  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);
  const applicantData = useSelector((state) => state.workforce["workforceApplicant"] ?? []);
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
  const [isDependentSaved,setIsDependentSaved] = useState(false)
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
  const user_type = getUserType();

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
    workforceApplicant: {
      nameEn: "",
      nameBn: "",
      fatherNameEn: "",
      fatherNameBn: "",
      motherNameEn: "",
      motherNameBn: "",
      spouseNameEn: "",
      spouseNameBn: "",
      phoneNumber: "",
      birthDate: "",
      nid: "",
      birthCertificateNo: "",
      gender: "",
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
    dependents: [{}],
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
        workforceApplicant: {
          id: employeeData?.id || reduxState.core.user.id || "",
          organization: employeeData?.organization,
          nameEn: employeeData?.firstNameEn || "",
          nameBn: employeeData?.firstNameBn || "",
          fatherNameEn: employeeData?.fatherNameEn || "",
          fatherNameBn: employeeData?.fatherNameBn || "",
          motherNameEn: employeeData?.motherNameEn || "",
          motherNameBn: employeeData?.motherNameBn || "",
          spouseNameEn: employeeData?.spouseNameEn || "",
          spouseNameBn: employeeData?.spouseNameBn || "",
          phoneNumber: employeeData?.phoneNumber || "",
          nid: employeeData?.nid || "",
          birthCertificateNo: employeeData?.birthCertificateNo || "",
          permanentAddress: employeeData?.permanentAddress || "",
          permanentLocation: employeeData?.permanentLocation || "",
          presentLocation: employeeData?.presentLocation || "",
          presentAddress: employeeData?.presentAddress || "",
        },
        company: employeeData?.company || formData?.workforceEmployee?.company?.id || null,
        factory: employeeData?.factory || formData?.workforceEmployee?.factory?.id || null,
        organizationType: parsedApplicationData?.organizationType || organizationType,
        applicationType: parsedApplicationData?.applicationType || selectedApplicationType,
        grantAmount: parsedApplicationData?.grantAmount || parsedApplicationData?.employeeAccidentInfo.grantAmount,
        metadata: parsedApplicationData?.metadata || employeeData?.metadata || {},
        dependents: parsedApplicationData?.employeeDependentInfo || employeeData?.dependents || [{}],
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || [{}],
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
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

        id: formData?.workforceEmployee?.id || reduxState.core.user.id,
      };
      console.log("Update Submitting formData:", formData);
      await dispatch(updateWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
    } else if (nextStep === 1) {
      const createApplicationData = {
        workforceEmployeeId: employeeData?.id || reduxState.core.user.id || "",
        company: formData?.workforceEmployee?.company?.id,
        factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
        organizationType: formData.organizationType,
        applicationType: formData.applicationType,
        grantAmount: formData?.employeeAccidentInfo.grantAmount,
        employeeDesignationInfo: JSON.stringify(formData?.employeeDesignationInfo),
        employeeBankInfo: JSON.stringify(formData?.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData?.dependents),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
        metadata: JSON.stringify(formData?.metadata),
        status: WORKFORCE_STATUS.DRAFT,
        applicationFor: applicationForSelf ==="yes" ?"self":applicationForSelf ===""?"":"dependent",

      };

      console.log({ createApplicationData });
      if (!parsedApplicationData) {
        const applicationMutation = await formatMutation("createWorkforceApplication", formatApplicationeGQL(createApplicationData), `Created application `);
        const applicationClientMutationId = applicationMutation.clientMutationId;
        console.log("applicationClientMutationId", applicationClientMutationId);
        await dispatch(createApplication(applicationMutation, `Created workforce application `));

        // await dispatch(fetchApplicationId(modulesManager, applicationClientMutationId));
        const fetchRes = await dispatch(
          fetchInfoIdByClientMutationId(modulesManager, "workforceApplication", applicationClientMutationId, "WORKFORCE_APPLICATION_BY_CLIENT_MUTATION_ID")
        );
        let applicationgetId = getInfoId(fetchRes, "workforceApplication");
        console.log("hello there", applicationgetId);
        if (!applicationgetId && applicationId) {
          applicationgetId = applicationId;
        }

        // if (uploadFile) {
        // await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${applicationgetId}"`])).then((res) => {
        //   const dependentId = res?.payload?.data?.workforceEmployeeDependent?.edges[0]?.node?.id;
        //   console.log({ dependentId });
        //     dispatch(
        //       createWorkforceDocument(
        //         { ...uploadFile, workforceApplicationId: applicationgetId, workforceDependentId: decodeId(dependentId) },
        //         `Created workforce document`
        //       )
        //     );
        //   });
        // }
      } else {
        const updateApplicationData = { id: parsedApplicationData?.id, ...createApplicationData };
        console.log("i am from update", updateApplicationData);
        dispatch(updateApplication(updateApplicationData, `update workforce application `));
      }
    } else if (nextStep === 6) {
      const updateApplicationData = {
        // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
        id: safeApplicationId(applicationId, parsedApplicationData),
        workforceEmployeeId: employeeData?.id || reduxState.core.user.id,
        company: formData?.workforceEmployee?.company?.id,
        factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
        organizationType: organizationType || parsedApplicationData?.organizationType,
        applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
        grantAmount: formData?.employeeAccidentInfo.grantAmount,
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
        metadata: JSON.stringify(formData.metadata),
        status: WORKFORCE_STATUS.DRAFT,
        applicationFor: applicationForSelf ==="yes" ?"self":applicationForSelf ===""?"":"dependent",

      };
      dispatch(updateApplication(updateApplicationData, `update workforce application`))
      .then(res => setIsDependentSaved(true))
      if (uploadDependentFile) {
        await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${decodeId(applicationId[0]?.id)}"`])).then((res) => {
          const dependentId = res?.payload?.data?.workforceEmployeeDependent?.edges[0]?.node?.id;

          console.log({ dependentId });
          uploadDependentFile.map((file, index) => {
                          dispatch(createWorkforceDocument({ ...file, workforceApplicationId: decodeId(applicationId[0]?.id),workforceDependentId: decodeId(dependentId)  }, `Created workforce document `));
                        });
          // dispatch(
          //   createWorkforceDocument(
          //     { ...uploadFile, workforceApplicationId: decodeId(applicationId[0]?.id), workforceDependentId: decodeId(dependentId) },
          //     `Created workforce document`
          //   )
          // );
        });
      }
    } else {
      const updateApplicationData = {
        // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
        id: safeApplicationId(applicationId, parsedApplicationData),
        workforceEmployeeId: employeeData?.id || reduxState.core.user.id,
        company: formData?.workforceEmployee?.company?.id,
        factory: formData?.workforceEmployee?.factory?.id ? decodeId(formData?.workforceEmployee?.factory?.id) : null,
        organizationType: organizationType || parsedApplicationData?.organizationType,
        applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
        grantAmount: formData?.employeeAccidentInfo.grantAmount,
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
        employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
        metadata: JSON.stringify(formData.metadata),
        status: WORKFORCE_STATUS.DRAFT,
        applicationFor: applicationForSelf ==="yes" ?"self":applicationForSelf ===""?"":"dependent",

      };
      dispatch(updateApplication(updateApplicationData, `update workforce application`));
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

  const handleSubmit = () => {

     uploadFile.map((file,index)=>{
                      dispatch(createWorkforceDocument({...file,workforceApplicationId:safeApplicationId(applicationId)}, `Created workforce document `));
                    })
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
      employeeApplicantInfo: JSON.stringify(formData.workforceApplicant) || JSON.stringify(parsedApplicationData?.workforceApplicant),
      employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
      employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
      metadata: JSON.stringify(formData.metadata),
      status: WORKFORCE_STATUS.NEW,
        applicationFor: applicationForSelf ==="yes" ?"self":applicationForSelf ===""?"":"dependent",

      submittedBy,
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
          <PreviewDetails formData={formData} language={reduxState.core?.user?.i_user?.language} />
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
    return <ApplicationFormSubmitted />;
  }

  console.log({ tazwer: formData });
  console.log({ fahimTazwer: uploadFile });

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
        <Box mt={0} ref={stepRef}>
        {activeStep === 0 ? (
          <ApplicationReason
            modulesManager={modulesManager}
            handleChange={(key, value) => handleChange(key, value, "metadata")}
            formData={formData}
            setDeathType={setDeathType}
            deathType={deathType}
            errors={errors}
          />
        ) : activeStep === 1 ? (
          <Box mt={0}>
            <ApplicantDetailsForm
              handleChange={(key, value) => handleChange(key, value, "workforceApplicant")}
              formData={formData}
              setNidOrBcn={setNidOrBcn}
              nidOrBcn={nidOrBcn}
              errors={errors}
            />
          </Box>
        ) : activeStep === 2 ? (
          <Box mt={0}>
            <EmployeeDetailsForm
              handleChange={(key, value) => handleChange(key, value, "workforceEmployee")}
              formData={formData}
              setNidOrBcn={setNidOrBcn}
              nidOrBcn={nidOrBcn}
              errors={errors}
            />
          </Box>
        ) : activeStep === 3 ? (
          <Box mt={0}>
            <EmployeeLocationForm handleChange={(key, value) => handleChange(key, value, "workforceEmployee")} formData={formData} />
          </Box>
        ) : activeStep === 4 ? (
          <Box mt={0}>
            <WorkerExtraInfo handleChange={handleChange} formData={formData} errors={errors}/>
          </Box>
        ) :activeStep === 5 ? (
          <Box mt={0}>
            <EmployeeDependentForm
              applicationType={formData.applicationType}
              dependents={formData.dependents}
              handleChange={(index, key, value) => handleArrayFieldChange("dependents", index, key, value)}
              addItem={() => addArrayFieldItem("dependents", { fullName: "", relationship: "" })}
              removeItem={(index) => removeArrayFieldItem("dependents", index)}
              expanded={expanded}
              setExpanded={setExpanded}
              formdata={formData}
              errors={errors}
            />
          </Box>
        ) : activeStep === 6 ? (
          <Box mt={0}>
            {!isDependentSaved ? <b>loading ...</b>:(
            <EmployeeAccountInfoForm
              formdata={formData}
              accounts={formData.employeeBankInfo}
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
              applicationId={applicationId}
              errors={errors}
            />
            )}
          </Box>
        ) : (
          <Box mt={0}>
            <EmployeeDetailsForm2
              selectedApplicationType={selectedApplicationType}
              handleChange={handleChange}
              formData={formData}
              formStepNo={"workforceDocument"}
            />
          </Box>
        )}
        </Box>
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

export default DeadlyGrantForm;
