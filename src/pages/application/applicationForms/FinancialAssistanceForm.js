import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography, Checkbox, Grid, FormControlLabel, Dialog, CircularProgress } from "@material-ui/core";
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
  validateMandatoryBankDocumentsForAccounts,
  validateMandatoryDocuments,
  validateMandatoryDocumentsForDependents,
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
  selectedEmployeeData,
  workforceFactoryId,
  organizationType,
  selectedApplicationType,
  parsedApplicationData,
  applicationForSelf,
  selectedFactory,
}) => {
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
  const documentType = useSelector((state) => state.workforce.documentType);
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
  const [stepLoadingState, setStepLoadingState] = useState({});
  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false);
  const [nidOrBcn, setNidOrBcn] = useState({
    nid: formData?.workforceEmployee?.nid || "",
    birthCertificateNo: formData?.workforceEmployee?.birthCertificateNo,
  });

  const reduxState = useSelector((state) => state);
  const loggedId = useSelector((state) => state.core?.user?.i_user?.id);
  console.log({ loggedId });
  console.log({ employeeData });
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

  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);
  const pickedEmployeeData = selectedEmployeeData;
  console.log({ fromFactoryAdminSelectedData: selectedEmployeeData });
  // const pickedEmployeeData =
  //   user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN && selectedEmployeeData
  //     ? selectedEmployeeData
  //     : useSelector((state) => state.workforce["workforceEmployee"] ?? []);

  // Fetch employee data based on username
  const fetchEmployeeWithUser = () => {
    if (reduxState.workforce.selectedEmployee) {
      dispatch(fetchWorkforceEmployee(modulesManager, [`id: "${safeDecodeId(reduxState.workforce.selectedEmployee.id)}"`]));
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
      dispatch(fetchWorkforceEmployee(modulesManager, [`relatedUser_LoginName_Iexact: "${reduxState.core.user.username}"`]));
    }
  }, [reduxState.core.user.username]);

  useEffect(() => {
    const isLoggedInApplicant = loggedId == safeDecodeId(employeeData?.relatedUser?.id);
    console.log({ isLoggedInApplicant });
    if (employeeData || parsedApplicationData) {
      // When employeeData is fetched, set it into the form state
      setFormData((prev) => ({
        ...prev,
        id: parsedApplicationData?.id || "",
        workforceApplicant:
          user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
            ? {
                ...prev.workforceApplicant, // Preserve the data the user has already typed!
                nameEn: prev.workforceApplicant?.nameEn || parsedApplicationData?.applicantInfo?.nameEn || "",
                nameBn: prev.workforceApplicant?.nameBn || parsedApplicationData?.applicantInfo?.nameBn || "",
                fatherNameEn: prev.workforceApplicant?.fatherNameEn || parsedApplicationData?.applicantInfo?.fatherNameEn || "",
                fatherNameBn: prev.workforceApplicant?.fatherNameBn || parsedApplicationData?.applicantInfo?.fatherNameBn || "",
                motherNameEn: prev.workforceApplicant?.motherNameEn || parsedApplicationData?.applicantInfo?.motherNameEn || "",
                motherNameBn: prev.workforceApplicant?.motherNameBn || parsedApplicationData?.applicantInfo?.motherNameBn || "",
                spouseNameEn: prev.workforceApplicant?.spouseNameEn || parsedApplicationData?.applicantInfo?.spouseNameEn || "",
                spouseNameBn: prev.workforceApplicant?.spouseNameBn || parsedApplicationData?.applicantInfo?.spouseNameBn || "",
                phoneNumber: prev.workforceApplicant?.phoneNumber || parsedApplicationData?.applicantInfo?.phoneNumber || "",
                citizenship: prev.workforceApplicant?.citizenship || parsedApplicationData?.applicantInfo?.citizenship || "",
                relationWithApplicant: prev.workforceApplicant?.relationWithApplicant || parsedApplicationData?.applicantInfo?.relationWithApplicant || "",
                birthDate: prev.workforceApplicant?.birthDate || parsedApplicationData?.applicantInfo?.birthDate || "",
                gender: prev.workforceApplicant?.gender || parsedApplicationData?.applicantInfo?.gender || "",
                nid: prev.workforceApplicant?.nid || parsedApplicationData?.applicantInfo?.nid || "",
                birthCertificateNo: prev.workforceApplicant?.birthCertificateNo || parsedApplicationData?.applicantInfo?.birthCertificateNo || "",
                permanentAddress: prev.workforceApplicant?.permanentAddress || parsedApplicationData?.applicantInfo?.permanentAddress || "",
                permanentLocation: prev.workforceApplicant?.permanentLocation || parsedApplicationData?.applicantInfo?.permanentLocation || "",
                presentLocation: prev.workforceApplicant?.presentLocation || parsedApplicationData?.applicantInfo?.presentLocation || "",
                presentAddress: prev.workforceApplicant?.presentAddress || parsedApplicationData?.applicantInfo?.presentAddress || "",
              }
            : {
                ...prev.workforceApplicant, // Preserve the data the user has already typed!
                nameEn: prev.workforceApplicant?.nameEn || parsedApplicationData?.applicantInfo?.nameEn || employeeData?.firstNameEn || "",
                nameBn: prev.workforceApplicant?.nameBn || parsedApplicationData?.applicantInfo?.nameBn || employeeData?.firstNameBn || "",
                fatherNameEn: prev.workforceApplicant?.fatherNameEn || parsedApplicationData?.applicantInfo?.fatherNameEn || employeeData?.fatherNameEn || "",
                fatherNameBn: prev.workforceApplicant?.fatherNameBn || parsedApplicationData?.applicantInfo?.fatherNameBn || employeeData?.fatherNameBn || "",
                motherNameEn: prev.workforceApplicant?.motherNameEn || parsedApplicationData?.applicantInfo?.motherNameEn || employeeData?.motherNameEn || "",
                motherNameBn: prev.workforceApplicant?.motherNameBn || parsedApplicationData?.applicantInfo?.motherNameBn || employeeData?.motherNameBn || "",
                spouseNameEn: prev.workforceApplicant?.spouseNameEn || parsedApplicationData?.applicantInfo?.spouseNameEn || employeeData?.spouseNameEn || "",
                spouseNameBn: prev.workforceApplicant?.spouseNameBn || parsedApplicationData?.applicantInfo?.spouseNameBn || employeeData?.spouseNameBn || "",
                phoneNumber: prev.workforceApplicant?.phoneNumber || parsedApplicationData?.applicantInfo?.phoneNumber || employeeData?.phoneNumber || "",
                citizenship: prev.workforceApplicant?.citizenship || parsedApplicationData?.applicantInfo?.citizenship || employeeData?.citizenship || "",
                relationWithApplicant: prev.workforceApplicant?.relationWithApplicant || parsedApplicationData?.applicantInfo?.relationWithApplicant || "",
                birthDate: prev.workforceApplicant?.birthDate || parsedApplicationData?.applicantInfo?.birthDate || employeeData?.birthDate || "",
                gender: prev.workforceApplicant?.gender || parsedApplicationData?.applicantInfo?.gender || employeeData?.gender || "",
                nid: prev.workforceApplicant?.nid || parsedApplicationData?.applicantInfo?.nid || employeeData?.nid || "",
                birthCertificateNo:
                  prev.workforceApplicant?.birthCertificateNo ||
                  parsedApplicationData?.applicantInfo?.birthCertificateNo ||
                  employeeData?.birthCertificateNo ||
                  "",
                permanentAddress:
                  prev.workforceApplicant?.permanentAddress || parsedApplicationData?.applicantInfo?.permanentAddress || employeeData?.permanentAddress || "",
                permanentLocation:
                  prev.workforceApplicant?.permanentLocation ||
                  parsedApplicationData?.applicantInfo?.permanentLocation ||
                  employeeData?.permanentLocation ||
                  "",
                presentLocation:
                  prev.workforceApplicant?.presentLocation || parsedApplicationData?.applicantInfo?.presentLocation || employeeData?.presentLocation || "",
                presentAddress:
                  prev.workforceApplicant?.presentAddress || parsedApplicationData?.applicantInfo?.presentAddress || employeeData?.presentAddress || "",
              },
        workforceEmployee: parsedApplicationData
          ? {
              // Replace with deceasedWorkerInfo data
              ...parsedApplicationData.deceasedWorkerInfo,
              // Retain the existing workforceEmployee id
              id: prev.workforceEmployee?.id,
            }
          : user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
            ? {
                ...prev.workforceEmployee,
                nameEn: prev.workforceEmployee?.nameEn || pickedEmployeeData?.firstNameEn || "",
                nameBn: prev.workforceEmployee?.nameBn || pickedEmployeeData?.firstNameBn || "",
                fatherNameEn: prev.workforceEmployee?.fatherNameEn || pickedEmployeeData?.fatherNameEn || "",
                fatherNameBn: prev.workforceEmployee?.fatherNameBn || pickedEmployeeData?.fatherNameBn || "",
                motherNameEn: prev.workforceEmployee?.motherNameEn || pickedEmployeeData?.motherNameEn || "",
                motherNameBn: prev.workforceEmployee?.motherNameBn || pickedEmployeeData?.motherNameBn || "",
                spouseNameEn: prev.workforceEmployee?.spouseNameEn || pickedEmployeeData?.spouseNameEn || "",
                spouseNameBn: prev.workforceEmployee?.spouseNameBn || pickedEmployeeData?.spouseNameBn || "",
                citizenship: prev.workforceEmployee?.citizenship || pickedEmployeeData?.citizenship || "",
                phoneNumber: prev.workforceEmployee?.phoneNumber || pickedEmployeeData?.phoneNumber || "",
                relationWithApplicant: prev.workforceEmployee?.relationWithApplicant || parsedApplicationData?.deceasedWorkerInfo?.relationWithApplicant || "",
                birthDate: prev.workforceEmployee?.birthDate || parsedApplicationData?.deceasedWorkerInfo?.birthDate || pickedEmployeeData?.birthDate || "",
                gender: prev.workforceEmployee?.gender || parsedApplicationData?.deceasedWorkerInfo?.gender || pickedEmployeeData?.gender || "",
                nid: prev.workforceEmployee?.nid || pickedEmployeeData?.nid || "",
                birthCertificateNo: prev.workforceEmployee?.birthCertificateNo || pickedEmployeeData?.birthCertificateNo || "",
                permanentAddress: prev.workforceEmployee?.permanentAddress || pickedEmployeeData?.permanentAddress || "",
                permanentLocation: prev.workforceEmployee?.permanentLocation || pickedEmployeeData?.permanentLocation || "",
                presentLocation: prev.workforceEmployee?.presentLocation || pickedEmployeeData?.presentLocation || "",
                presentAddress: prev.workforceEmployee?.presentAddress || pickedEmployeeData?.presentAddress || "",
              }
            : {
                ...prev.workforceEmployee,
                ...parsedApplicationData?.deceasedWorkerInfo,
                nameEn: prev.workforceEmployee?.nameEn || parsedApplicationData?.deceasedWorkerInfo?.nameEn || "",
                nameBn: prev.workforceEmployee?.nameBn || parsedApplicationData?.deceasedWorkerInfo?.nameBn || "",
                fatherNameEn: prev.workforceEmployee?.fatherNameEn || parsedApplicationData?.deceasedWorkerInfo?.fatherNameEn || "",
                fatherNameBn: prev.workforceEmployee?.fatherNameBn || parsedApplicationData?.deceasedWorkerInfo?.fatherNameBn || "",
                motherNameEn: prev.workforceEmployee?.motherNameEn || parsedApplicationData?.deceasedWorkerInfo?.motherNameEn || "",
                motherNameBn: prev.workforceEmployee?.motherNameBn || parsedApplicationData?.deceasedWorkerInfo?.motherNameBn || "",
                spouseNameEn: prev.workforceEmployee?.spouseNameEn || parsedApplicationData?.deceasedWorkerInfo?.spouseNameEn || "",
                spouseNameBn: prev.workforceEmployee?.spouseNameBn || parsedApplicationData?.deceasedWorkerInfo?.spouseNameBn || "",
                phoneNumber: prev.workforceEmployee?.phoneNumber || parsedApplicationData?.deceasedWorkerInfo?.phoneNumber || "",
                birthDate: prev.workforceEmployee?.birthDate || parsedApplicationData?.deceasedWorkerInfo?.birthDate || "",
                gender: prev.workforceEmployee?.gender || parsedApplicationData?.deceasedWorkerInfo?.gender || "",
                citizenship: prev.workforceEmployee?.citizenship || parsedApplicationData?.deceasedWorkerInfo?.citizenship || "",
                maritalStatus: prev.workforceEmployee?.maritalStatus || parsedApplicationData?.deceasedWorkerInfo?.maritalStatus || "",
                nid: prev.workforceEmployee?.nid || parsedApplicationData?.deceasedWorkerInfo?.nid || "",
                birthCertificateNo: prev.workforceEmployee?.birthCertificateNo || parsedApplicationData?.deceasedWorkerInfo?.birthCertificateNo || "",
                permanentAddress: prev.workforceEmployee?.permanentAddress || parsedApplicationData?.deceasedWorkerInfo?.permanentAddress || "",
                permanentLocation: prev.workforceEmployee?.permanentLocation || parsedApplicationData?.deceasedWorkerInfo?.permanentLocation || "",
                presentLocation: prev.workforceEmployee?.presentLocation || parsedApplicationData?.deceasedWorkerInfo?.presentLocation || "",
                presentAddress: prev.workforceEmployee?.presentAddress || parsedApplicationData?.deceasedWorkerInfo?.presentAddress || "",
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
        dependents:
          prev.dependents && Object.keys(prev.dependents[0] || {}).length > 0 && prev.dependents[0].fullName !== ""
            ? prev.dependents
            : parsedApplicationData?.employeeDependentInfo || [{}],
        employeeBankInfo:
          prev.employeeBankInfo && Object.keys(prev.employeeBankInfo[0] || {}).length > 0 && prev.employeeBankInfo[0].accountNumber !== ""
            ? prev.employeeBankInfo
            : parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || [{}],
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
        metadata: parsedApplicationData?.metadata || formData?.metadata || {},
        applicantInfo: parsedApplicationData?.applicantInfo || employeeData?.metadata || {},
        deceasedWorkerInfo:
          user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN
            ? {
                nameEn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.nameEn : employeeData?.firstNameEn || "",
                nameBn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.nameBn : employeeData?.firstNameBn || "",

                fatherNameEn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.fatherNameEn : employeeData?.fatherNameEn || "",
                fatherNameBn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.fatherNameBn : employeeData?.fatherNameBn || "",
                motherNameEn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.motherNameEn : employeeData?.motherNameEn || "",
                motherNameBn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.motherNameBn : employeeData?.motherNameBn || "",
                spouseNameEn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.spouseNameEn : employeeData?.spouseNameEn || "",
                spouseNameBn: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.spouseNameBn : employeeData?.spouseNameBn || "",
                citizenship: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.citizenship : employeeData?.citizenship || "",
                phoneNumber: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.phoneNumber : employeeData?.phoneNumber || "",
                relationWithApplicant: parsedApplicationData?.deceasedWorkerInfo?.relationWithApplicant,
                birthDate: parsedApplicationData?.deceasedWorkerInfo?.birthDate,
                gender: parsedApplicationData?.deceasedWorkerInfo?.gender,
                citizenship: parsedApplicationData?.deceasedWorkerInfo?.citizenship,
                position: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.position : formData?.workforceEmployee?.position,
                maritalStatus: prev.workforceEmployee?.maritalStatus || parsedApplicationData?.deceasedWorkerInfo?.maritalStatus || "",
                nid: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.nid : employeeData?.nid || "",
                birthCertificateNo: parsedApplicationData?.id
                  ? parsedApplicationData?.deceasedWorkerInfo?.birthCertificateNo
                  : employeeData?.birthCertificateNo || "",

                permanentAddress: parsedApplicationData?.id
                  ? parsedApplicationData?.deceasedWorkerInfo?.permanentAddress
                  : employeeData?.permanentAddress || "",
                permanentLocation: parsedApplicationData?.id
                  ? parsedApplicationData?.deceasedWorkerInfo?.permanentLocation
                  : employeeData?.permanentLocation || "",
                presentLocation: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.presentLocation : employeeData?.presentLocation || "",
                presentAddress: parsedApplicationData?.id ? parsedApplicationData?.deceasedWorkerInfo?.presentAddress : employeeData?.presentAddress || "",
              }
            : parsedApplicationData?.deceasedWorkerInfo || {},
      }));
    }
  }, [employeeData?.id, parsedApplicationData, user_type]);

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
    if (isNavigationBlocked) {
      return; // Prevent any navigation while data is loading
    }

    const newErrors = validateRequiredFields(stepRef, formatMessage, formData);
    delete newErrors.documents;
    const allAssociationDate = new Date("2022-06-21");
    const deathDate = new Date(formData?.metadata?.deathDate);
    const isBankStep = (organizationType === "eis" && activeStep === 5) || (organizationType !== "eis" && activeStep === 5);
    const isDependentStep = (organizationType === "eis" && activeStep === 4) || (organizationType !== "eis" && activeStep === 4);

    const IS_REASON_STEP = activeStep === 0;
    const IS_APPLICANT_STEP = activeStep === 1;
    const IS_EMPLOYEE_STEP = activeStep === 2;
    const IS_LOCATION_STEP = activeStep === 3;
    const IS_DEPENDENT_STEP = activeStep === 4;
    const IS_BANK_STEP = activeStep === 5;

    // 4. Document Validation Logic
    let documentValidation = { isValid: true, errors: null };
    const BANK_DOC_TYPE = "applicants bank check copy";

    if (IS_DEPENDENT_STEP) {
      // Specialized validation for the Dependent Step
      documentValidation = validateMandatoryDocumentsForDependents(documentType, uploadDependentFile || [], formData.dependents || []);
    } else if (IS_BANK_STEP) {
      // Filter only for Bank Documents
      const bankDocsConfig = (documentType || []).filter((doc) => doc.documentType === BANK_DOC_TYPE);
      documentValidation = validateMandatoryBankDocumentsForAccounts(bankDocsConfig, uploadBankFile || [], formData.employeeBankInfo || []);
    } else if (IS_EMPLOYEE_STEP || IS_APPLICANT_STEP) {
      // Filter out Bank Documents for general info steps
      const generalDocsConfig = (documentType || []).filter((doc) => doc.documentType !== BANK_DOC_TYPE);
      documentValidation = validateMandatoryDocuments(generalDocsConfig, uploadFile || []);
    }

    // 5. Assign Document Errors if the current step is a "document step"
    if (!documentValidation.isValid) {
      newErrors.documents = documentValidation.errors;
    }

    setErrors(newErrors);

    console.log({ newErrors });
    console.log({ documentValidation });
    if (Object.keys(newErrors).length > 0 && !newErrors?.documents) {
      setShowErrorSnackbar(true);
    } else {
      setShowErrorSnackbar(false);
    }
    if (Object.keys(newErrors).length === 0 || newErrors?.documents === null) {
      const nextStep = activeStep + 1;
      if (
        (nextStep === 3 && !isAtLeast18YearsOld(formData?.workforceEmployee?.birthDate)) ||
        (nextStep === 2 && !isAtLeast18YearsOld(formData?.workforceApplicant?.birthDate, 12))
      ) {
        let fakeErrors = nextStep === 2 ? { ...newErrors, rdmp: "core.error.applicantAge" } : { ...newErrors, rdmp: "core.error.workerAge" };
        setErrors(fakeErrors);
        return false;
      } else {
        if (nextStep === 5 && formData?.organizationType === "eis") {
          const workerBirthDate = formData?.workforceEmployee?.birthDate || formData?.deceasedWorkerInfo?.birthDate;
          const currentDependents = formData?.dependents || [];
          const validDependents = currentDependents.filter((dep) => getRelationForApi(dep, workerBirthDate));
          if (validDependents.length !== currentDependents.length) {
            setDependentErr(true);
            return false;
          }
        }

        if (formData?.organizationType === "eis" && allAssociationDate > deathDate) {
          setAlertMessage(true);
          return false;
        }

        // ===== LOADING BLOCK: Prevent moving to bank step until dependent data is ready =====
        if (nextStep === 5) {
          setIsNavigationBlocked(true);
          setStepLoadingState((prev) => ({ ...prev, [nextStep]: true }));
        }

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

            id: safeDecodeId(formData?.workforceEmployee?.id) || safeDecodeId(reduxState.core.user.id),
          };
          // await dispatch(updateWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
          const updateApplicationData = {
            // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: safeDecodeId(employeeData?.id) || safeDecodeId(reduxState.core.user.id),
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id
                ? safeDecodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id)
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
            workforceEmployeeId: safeDecodeId(employeeData?.id) || safeDecodeId(formData?.workforceEmployee?.id) || safeDecodeId(reduxState.core.user.id),
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
                ? safeDecodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
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
            workforceEmployeeId: safeDecodeId(employeeData?.id) || safeDecodeId(reduxState.core.user.id),
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
                ? safeDecodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
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
          if (uploadDependentFile?.length) {
            await Promise.all(
              uploadDependentFile.map((file) =>
                dispatch(
                  createWorkforceDocument(
                    { ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) },
                    `Created workforce document`,
                  ),
                ),
              ),
            );
          }

          await dispatch(updateApplication(updateApplicationData, `update workforce application`)).then((res) => setIsDependentSaved(true));

          // ===== FETCH DEPENDENT DATA AND UNBLOCK NAVIGATION =====
          try {
            if (parsedApplicationData?.id) {
              await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${parsedApplicationData?.id}"`]));
            } else {
              await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${safeApplicationId(applicationId)}"`]));
            }
          } finally {
            // Move to next step and unblock navigation after data fetch completes
            setActiveStep(nextStep);
            setIsNavigationBlocked(false);
            setStepLoadingState((prev) => ({ ...prev, [nextStep]: false }));
          }
          return true;
        } else {
          const updateApplicationData = {
            // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: safeDecodeId(employeeData?.id) || safeDecodeId(reduxState.core.user.id),
            company: formData?.workforceEmployee?.company?.id,
            factory:
              formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
                ? safeDecodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
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
          // if (uploadBankFile) {
          //   await uploadBankFile.map((file) => {
          //     const appId = applicationId || formData?.id;
          //     return dispatch(
          //       createWorkforceDocument(
          //         { ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) },
          //         `Created workforce document`,
          //       ),
          //     );
          //   });
          // }
          dispatch(updateApplication(updateApplicationData, `update workforce application`));
        }

        // Set active step and unblock navigation (except for step 5 which handles it separately)
        if (nextStep !== 5) {
          setActiveStep(nextStep);
          setIsNavigationBlocked(false);
        }

        return true;
      }
    }
    return false;
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
      await Promise.all(
        uploadBankFile.map((file) => {
          return dispatch(
            createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) }, `Created workforce document`),
          );
        }),
      );
    }
    await Promise.all(
      uploadFile.map((file, index) => {
        // const createDocumentData = { ...file, workforceApplicationId: safeApplicationId(applicationId,parsedApplicationData) }
        // console.log({createDocumentData})
        return dispatch(
          createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) }, `Created workforce document `),
        );
      }),
    );

    const submittedBy =
      user_type === WORKFORCE_USER_TYPE.APPLICANT ? "applicant" : user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? "factory_admin" : "UNKNOWN";
    const updateApplicationData = {
      // id: decodeId(applicationId[0]?.id) || parsedApplicationData?.id,
      id: safeApplicationId(applicationId, parsedApplicationData),
      workforceEmployeeId:
        safeDecodeId(formData?.workforceEmployee.id) || safeDecodeId(parsedApplicationData?.workforceEmployee?.id) || safeDecodeId(employeeData?.id),
      company: formData?.workforceEmployee?.company?.id,
      factory:
        formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory
          ? safeDecodeId(formData?.workforceEmployee?.factory?.id || formData?.deceasedWorkerInfo?.factory?.id || formData?.factory?.id)
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
              onClick={async() => {
                // setIsSubmitted(true);
                await handleSubmit();
                setShowVerifyNid(false);
                setIsSubmitted(true)
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

  console.log({ fromFactoryAdmin: employeeData });
  console.log({ tazwer: formData });
  console.log({ uploadFile: uploadFile });
  console.log({ uploadBankFile: uploadBankFile });
  console.log({ uploadDependentFile: uploadDependentFile });
  console.log({ errors: errors });

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
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px" gap={2}>
                  <Typography variant="h6">
                    <FormattedMessage id="workforce.loading.bank.data" module="workforce" />
                  </Typography>
                </Box>
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
          ) : null}
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
            <Button
              variant="contained"
              color="primary"
              disabled={!acknowledged}
              onClick={async () => {
                const isSuccess = await handleNext();
                if (isSuccess) setShowPreview(true);
              }}
            >
              <FormattedMessage module="workforce" id="workforce.submit" />
            </Button>
          )}
        </div>
      </Paper>

      {/* Loading Modal */}
      <Dialog open={isNavigationBlocked} onClose={() => {}} disableBackdropClick disableEscapeKeyDown maxWidth="sm" fullWidth>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding={4} gap={2}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" align="center">
            <FormattedMessage id="workforce.processing.data" module="workforce" />
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary">
            <FormattedMessage id="workforce.please.wait" module="workforce" />
          </Typography>
        </Box>
      </Dialog>

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
