import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography, Checkbox, Grid, FormControlLabel } from "@material-ui/core";
import { useModulesManager, formatMutation, decodeId, FormattedMessage, useTranslations } from "@openimis/fe-core";
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
  fetchEmployeeDependent,
  fetchInfoIdByClientMutationId,
  fetchWorkforceEmployee,
  updateApplication,
  updateWorkforceEmployee,
  createApplicationMovement,
} from "../../../actions";
import EmployeeAccountInfoForm from "../EmployeeAccountInfoForm";
import { formatApplicationeGQL } from "../../../utils/format_gql";
import { WORKFORCE_STATUS } from "../../../constants";
import ApplicationReason from "../FormsComponents/FinancialAssistance/ApplicationReason";
import PreviewDetails from "../../../components/application-forms/PreviewDetails";
import NidVerification from "../../../components/application-forms/NidVerification";
import {
  getInfoId,
  getRelationForApi,
  isAtLeast18YearsOld,
  isNotFutureDate,
  safeApplicationId,
  safeDecodeId,
  validateRequiredFields,
} from "../../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../../constants";
import { getUserType, getUserTypeFromRights } from "../../../utils/utils";
import { ApplicationFormSubmitted } from "../../../components/shared/ApplicationFormSubmitted";
import ApplicationViewPage from "../../../components/application-forms/ApplicationViewPage";
import EmployeeDeathAccountInfoForm from "../EmployeeDeathAccountInfoForm";
import CustomSnackbar from "../../../components/shared/CustomSnackbar";

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
  "workforce.application.steps.prosurders",
  "workforce.application.steps.account.info",
  // "workforce.application.steps.upload.documents",
];

const FinancialAssistanceForm = ({
  workforceFactoryId,
  organizationType,
  selectedApplicationType,
  parsedApplicationData,
  applicationForSelf,
  selectedFactory,
}) => {
  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);
  const applicantData = useSelector((state) => state.workforce["workforceApplicant"] ?? []);
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("workforce");
  const stepRef = useRef(null);

  const [alertMessage, setAlertMessage] = useState(false);
  const [dependentErr, setDependentErr] = useState(false);
  const [errors, setErrors] = useState({});
  const [acknowledged, setAcknowledged] = useState(false);
  let applicationId = useSelector((state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? null);
  // const dependentId = useSelector((state) => state.workforce["workforceDependent"] ?? []);
  const uploadFile = useSelector((state) => state.workforce.uploadFile);
  const uploadDependentFile = useSelector((state) => state.workforce.uploadDependentFile);
  const uploadBankFile = useSelector((state) => state.workforce.uploadBankFile);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(0);
  const [isDependentSaved, setIsDependentSaved] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deathType, setDeathType] = useState("");
  const [disableConfirmSubmit, setDisableConfirmSubmit] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
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
    factory: selectedFactory || null,
    workforceFactoryId: workforceFactoryId || "",
    isSubmitted: "no",
    organizationType: "" || organizationType,
    applicationType: "",
    dependents: [{}],
    employeeBankInfo: [{}],
    employeeAccidentInfo: {},
    deceasedWorkerInfo: {},
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
          nameEn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.nameEn : employeeData?.firstNameEn || "",
          nameBn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.nameBn : employeeData?.firstNameBn || "",

          fatherNameEn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.fatherNameEn : employeeData?.fatherNameEn || "",
          fatherNameBn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.fatherNameBn : employeeData?.fatherNameBn || "",
          motherNameEn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.motherNameEn : employeeData?.motherNameEn || "",
          motherNameBn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.motherNameBn : employeeData?.motherNameBn || "",
          spouseNameEn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.spouseNameEn : employeeData?.spouseNameEn || "",
          spouseNameBn: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.spouseNameBn : employeeData?.spouseNameBn || "",
          phoneNumber: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.phoneNumber : employeeData?.phoneNumber || "",
          relationWithApplicant: parsedApplicationData?.applicantInfo?.relationWithApplicant,
          birthDate: parsedApplicationData?.applicantInfo?.birthDate,
          gender: parsedApplicationData?.applicantInfo?.gender,
          citizenship: parsedApplicationData?.applicantInfo?.citizenship,

          nid: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.nid : employeeData?.nid || "",
          birthCertificateNo: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.birthCertificateNo : employeeData?.birthCertificateNo || "",

          permanentAddress: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.permanentAddress : employeeData?.permanentAddress || "",
          permanentLocation: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.permanentLocation : employeeData?.permanentLocation || "",
          presentLocation: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.presentLocation : employeeData?.presentLocation || "",
          presentAddress: parsedApplicationData?.id ? parsedApplicationData?.applicantInfo?.presentAddress : employeeData?.presentAddress || "",
        },
        workforceEmployee: {
          nameEn: parsedApplicationData?.deceasedWorkerInfo?.nameEn || "",
          nameBn: parsedApplicationData?.deceasedWorkerInfo?.nameBn || "",

          fatherNameEn: parsedApplicationData?.deceasedWorkerInfo?.fatherNameEn || "",
          fatherNameBn: parsedApplicationData?.deceasedWorkerInfo?.fatherNameBn || "",
          motherNameEn: parsedApplicationData?.deceasedWorkerInfo?.motherNameEn || "",
          motherNameBn: parsedApplicationData?.deceasedWorkerInfo?.motherNameBn || "",
          spouseNameEn: parsedApplicationData?.deceasedWorkerInfo?.spouseNameEn || "",
          spouseNameBn: parsedApplicationData?.deceasedWorkerInfo?.spouseNameBn || "",
          phoneNumber: parsedApplicationData?.deceasedWorkerInfo?.phoneNumber || "",
          birthDate: parsedApplicationData?.deceasedWorkerInfo?.birthDate,
          gender: parsedApplicationData?.deceasedWorkerInfo?.gender,
          citizenship: parsedApplicationData?.deceasedWorkerInfo?.citizenship,
          citizenship: parsedApplicationData?.deceasedWorkerInfo?.citizenship,
          maritalStatus: parsedApplicationData?.deceasedWorkerInfo?.maritalStatus,
          nid: parsedApplicationData?.deceasedWorkerInfo?.nid,

          nid: parsedApplicationData?.deceasedWorkerInfo?.nid || "",
          birthCertificateNo: parsedApplicationData?.deceasedWorkerInfo?.birthCertificateNo || "",

          permanentAddress: parsedApplicationData?.deceasedWorkerInfo?.permanentAddress || "",
          permanentLocation: parsedApplicationData?.deceasedWorkerInfo?.permanentLocation || "",
          presentLocation: parsedApplicationData?.deceasedWorkerInfo?.presentLocation || "",
          presentAddress: parsedApplicationData?.deceasedWorkerInfo?.presentAddress || "",
          factory: formData?.factory,
        },
        company: employeeData?.company || formData?.workforceEmployee?.company?.id || null,
        factory:
          formData?.factory ||
          formData?.employeeFactory?.id ||
          employeeData.factory ||
          formData?.workforceEmployee?.factory?.id ||
          parsedApplicationData?.employeeFactory ||
          workforceFactoryId ||
          selectedFactory ||
          null,
        applicationForSelf: applicationForSelf,
        workforceFactoryId: workforceFactoryId || "",
        organizationType: parsedApplicationData?.organizationType || organizationType,
        applicationType: parsedApplicationData?.applicationType || selectedApplicationType,
        grantAmount: parsedApplicationData?.grantAmount || parsedApplicationData?.employeeAccidentInfo.grantAmount,
        dependents: parsedApplicationData?.employeeDependentInfo || [{}],
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || [{}],
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
        metadata: parsedApplicationData?.metadata || employeeData?.metadata || {},
        applicantInfo: parsedApplicationData?.applicantInfo || employeeData?.metadata || {},
        deceasedWorkerInfo: parsedApplicationData?.deceasedWorkerInfo || {},
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
    const newErrors = validateRequiredFields(stepRef, formatMessage, formData);
    const allAssociationDate = new Date("2022-06-21");
    const deathDate = new Date(formData?.metadata?.deathDate);
    setErrors(newErrors);
    console.log(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShowErrorSnackbar(true);
    } else {
      setShowErrorSnackbar(false);
    }
    if (Object.keys(newErrors).length === 0) {
      const nextStep = activeStep + 1;
      if (nextStep === 3 && !isAtLeast18YearsOld(formData?.workforceEmployee?.birthDate)) {
        let fakeErrors = { ...newErrors, rdmp: "core.error.workerAge" };
        setErrors(fakeErrors);
      } else {
        if (nextStep === 5 && formData?.organizationType === "eis") {
          const workerBirthDate = formData?.workforceEmployee?.birthDate || formData?.deceasedWorkerInfo?.birthDate;
          const currentDependents = formData?.dependents || [];
          const validDependents = currentDependents.filter((dep) => getRelationForApi(dep, workerBirthDate));
          if (validDependents.length !== currentDependents.length) {
            // setFormData({
            //   ...formData,
            //   dependents: validDependents,
            // });
            setDependentErr(true);
            return; 
          }
        }

        if (formData?.organizationType === "eis" && allAssociationDate > deathDate) {
          setAlertMessage(true);
          return;
        }
        setActiveStep(nextStep);
        if (nextStep === 3 || nextStep === 4) {
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
          // await dispatch(updateWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
          const updateApplicationData = {
            // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: employeeData?.id || reduxState.core.user.id,
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id
                ? decodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id)
                : null,
            organizationType: organizationType || parsedApplicationData?.organizationType,
            applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
            // employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
            employeeDependentInfo:
              JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
              JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
            metadata: JSON.stringify(formData.metadata),
            deceasedWorkerInfo: JSON.stringify(formData.workforceEmployee)
              .replace(/\\/g, "")
              .replace(/"{/g, "{")
              .replace(/}"/g, "}")
              .replace(/\\\\\\/g, "\\\\"),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
          };
          dispatch(updateApplication(updateApplicationData, `update workforce application`));
        } else if (nextStep === 1) {
          const createApplicationData = {
            workforceEmployeeId: employeeData?.id || reduxState.core.user.id || "",
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
                ? decodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
                : null,
            organizationType: formData.organizationType,
            applicationType: formData.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeDesignationInfo: JSON.stringify(formData?.employeeDesignationInfo),
            employeeBankInfo: JSON.stringify(formData?.employeeBankInfo),
            employeeDependentInfo:
              JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
              JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
            metadata: JSON.stringify(formData?.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
          };

          if (!parsedApplicationData) {
            const applicationMutation = await formatMutation(
              "createWorkforceApplication",
              formatApplicationeGQL(createApplicationData),
              `Created application `,
            );
            const applicationClientMutationId = applicationMutation.clientMutationId;
            await dispatch(createApplication(applicationMutation, `Created workforce application `)).then((res) => {
              // await dispatch(fetchApplicationId(modulesManager, applicationClientMutationId));
              const fetchRes = dispatch(
                fetchInfoIdByClientMutationId(
                  modulesManager,
                  "workforceApplication",
                  applicationClientMutationId,
                  "WORKFORCE_APPLICATION_BY_CLIENT_MUTATION_ID",
                ),
              );
              let applicationgetId = getInfoId(fetchRes, "workforceApplication");
              if (!applicationgetId && applicationId) {
                applicationgetId = applicationId;
              } else {
                applicationId = applicationgetId;
              }
            });
          } else {
            const updateApplicationData = { id: parsedApplicationData?.id, ...createApplicationData };
            dispatch(updateApplication(updateApplicationData, `update workforce application `));
          }
        } else if (nextStep === 5) {
          const updateApplicationData = {
            // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: employeeData?.id || reduxState.core.user.id,
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
                ? decodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
                : null,
            organizationType: organizationType || parsedApplicationData?.organizationType,
            applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
            employeeApplicantInfo:
              JSON.stringify(formData.workforceApplicant).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
              JSON.stringify(parsedApplicationData?.workforceApplicant).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            employeeDependentInfo:
              JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
              JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            deceasedWorkerInfo: JSON.stringify(formData.workforceEmployee)
              .replace(/\\/g, "")
              .replace(/"{/g, "{")
              .replace(/}"/g, "}")
              .replace(/\\\\\\/g, "\\\\"),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
            metadata: JSON.stringify(formData.metadata),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
          };
          console.log(uploadDependentFile);
          if (uploadDependentFile) {
            await uploadDependentFile.map((file) => {
              const appId = applicationId || formData?.id;
              return dispatch(
                createWorkforceDocument(
                  { ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) },
                  `Created workforce document`,
                ),
              );
            });
          }
          await dispatch(updateApplication(updateApplicationData, `update workforce application`)).then((res) => setIsDependentSaved(true));
          if (parsedApplicationData?.id) {
            await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${parsedApplicationData?.id}"`]));
          } else {
            await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${safeApplicationId(applicationId)}"`]));
          }
        } else {
          const updateApplicationData = {
            // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: employeeData?.id || reduxState.core.user.id,
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
                ? decodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
                : null,
            organizationType: organizationType || parsedApplicationData?.organizationType,
            applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
            // employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
            employeeApplicantInfo:
              JSON.stringify(formData.workforceApplicant).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
              JSON.stringify(parsedApplicationData?.workforceApplicant).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            employeeDependentInfo:
              JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
              JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
            metadata: JSON.stringify(formData.metadata),
            deceasedWorkerInfo: JSON.stringify(formData.deceasedWorkerInfo)
              .replace(/\\/g, "")
              .replace(/"{/g, "{")
              .replace(/}"/g, "}")
              .replace(/\\\\\\/g, "\\\\"),
            // deceasedWorkerInfo: JSON.stringify(formData.workforceEmployee),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
          };
          if (uploadBankFile) {
            await uploadBankFile.map((file) => {
              const appId = applicationId || formData?.id;
              return dispatch(
                createWorkforceDocument(
                  { ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) },
                  `Created workforce document`,
                ),
              );
            });
          }
          dispatch(updateApplication(updateApplicationData, `update workforce application`));
        }
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
    if (uploadBankFile) {
      await uploadBankFile.map((file) => {
        return dispatch(
          createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) }, `Created workforce document`),
        );
      });
    }
    uploadFile.map((file, index) => {
      // const createDocumentData = { ...file, workforceApplicationId: safeApplicationId(applicationId,parsedApplicationData) }
      // console.log({createDocumentData})
      return dispatch(
        createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) }, `Created workforce document `),
      );
    });

    const submittedBy =
      user_type === WORKFORCE_USER_TYPE.APPLICANT ? "applicant" : user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? "factory_admin" : "UNKNOWN";
    const updateApplicationData = {
      // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
      id: safeApplicationId(applicationId, parsedApplicationData),
      workforceEmployeeId: safeDecodeId(formData?.workforceEmployee.id) || safeDecodeId(parsedApplicationData?.workforceEmployee?.id),
      company: formData?.workforceEmployee?.company?.id,
      factory:
        formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
          ? decodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
          : null,
      organizationType: organizationType || parsedApplicationData?.organizationType,
      applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
      grantAmount: formData?.employeeAccidentInfo.grantAmount,
      employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
      employeeApplicantInfo:
        JSON.stringify(formData.workforceApplicant).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
        JSON.stringify(parsedApplicationData?.workforceApplicant).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
      // employeeDependentInfo: JSON.stringify(formData.dependents) || JSON.stringify(parsedApplicationData?.employeeDependentInfo),
      employeeDependentInfo:
        JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
        JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
      employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
      metadata: JSON.stringify(formData.metadata),
      deceasedWorkerInfo: JSON.stringify(formData.workforceEmployee)
        .replace(/\\/g, "")
        .replace(/"{/g, "{")
        .replace(/}"/g, "}")
        .replace(/\\\\\\/g, "\\\\"),
      status: WORKFORCE_STATUS.NEW,
      applicationFor: applicationForSelf === "yes" ? "self" : applicationForSelf === "" ? "" : "dependent",
      submittedBy,
    };
    // const createApplicationMovementData = {
    //   applicationId: safeApplicationId(applicationId, parsedApplicationData),
    //   status: WORKFORCE_STATUS.NEW,
    //   note: "একটি নতুন আবেদন করা হয়েছে",
    //   applicationFromId: reduxState.core?.user?.i_user?.id,
    //   applicationToId: 165,
    //   toRoleId: 25,
    // };

    dispatch(updateApplication(updateApplicationData, `update workforce application `));

    // dispatch(createApplicationMovement(createApplicationMovementData, `create workforce movement`));
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

  console.log({ tazwer: formData });
  console.log({ fahimTazwer: uploadBankFile });

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
          {
            activeStep === 0 ? (
              <ApplicationReason
                modulesManager={modulesManager}
                handleChange={(key, value) => handleChange(key, value, "metadata")}
                formData={formData}
                setDeathType={setDeathType}
                deathType={deathType}
                errors={errors}
              />
            ) : activeStep === 1 ? (
              <ApplicantDetailsForm
                handleChange={(key, value) => handleChange(key, value, "workforceApplicant")}
                formData={formData}
                setNidOrBcn={setNidOrBcn}
                nidOrBcn={nidOrBcn}
                errors={errors}
              />
            ) : activeStep === 2 ? (
              <EmployeeDetailsForm
                handleChange={(key, value) => handleChange(key, value, "workforceEmployee")}
                formData={formData}
                setNidOrBcn={setNidOrBcn}
                nidOrBcn={nidOrBcn}
                errors={errors}
              />
            ) : activeStep === 3 ? (
              <EmployeeLocationForm handleChange={(key, value) => handleChange(key, value, "workforceEmployee")} formData={formData} />
            ) : activeStep === 4 ? (
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
            ) : activeStep === 5 ? (
              <>
                {!isDependentSaved ? (
                  <b>loading ...</b>
                ) : (
                  <EmployeeDeathAccountInfoForm
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
              </>
            ) : null
            // <EmployeeDetailsForm2
            //   selectedApplicationType={selectedApplicationType}
            //   handleChange={handleChange}
            //   formData={formData}
            //   formStepNo={"workforceDocument"}
            // />
          }
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
      <CustomSnackbar
        open={alertMessage}
        onClose={() => setAlertMessage(false)}
        type="error"
        message={<FormattedMessage id="workforce.application.before.eis.startDate.error" module="workforce" />}
        duration={5000}
      />
      <CustomSnackbar
        open={showErrorSnackbar} // Use the new state
        onClose={() => setShowErrorSnackbar(false)} // Allow it to close
        type="error"
        message={<FormattedMessage id="core.error.generel" module="workforce" />}
        duration={4000}
      />
      <CustomSnackbar
        open={dependentErr}
        onClose={() => setDependentErr(false)}
        type="error"
        message={<FormattedMessage id={"core.error.inEligible.dependent"} />}
        duration={5000}
      />
    </div>
  );
};

export default FinancialAssistanceForm;
