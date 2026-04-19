import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Stepper, Step, StepLabel, Paper, Box, Typography, Checkbox, Grid, FormControlLabel } from "@material-ui/core";
import { FormattedMessage, formatMutation, decodeId, useModulesManager, useTranslations } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import EmployeeDetailsForm from "../EmployeeDetailsForm";
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
import NidVerification from "../../../components/application-forms/NidVerification";
import { getInfoId, getParsedApplication, isAtLeast18YearsOld, safeApplicationId, safeDecodeId, validateMandatoryBankDocumentsForAccounts, validateMandatoryDocuments, validateMandatoryDocumentsForDependents, validateRequiredFields } from "../../../utils/utils";
import { WORKFORCE_USER_TYPE } from "../../../constants";
import { getUserType, getUserTypeFromRights } from "../../../utils/utils";
import { ApplicationFormSubmitted } from "../../../components/shared/ApplicationFormSubmitted";
import ApplicationViewPage from "../../../components/application-forms/ApplicationViewPage";
import CustomSnackbar from "../../../components/shared/CustomSnackbar";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    padding: theme.spacing(1),
    width: 700,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
  },
}));

const MedicalAssistanceForm = ({
  workforceFactoryId,
  organizationType,
  selectedApplicationType,
  applicationForSelf,
  selectedFactory,
  parsedApplicationData,
}) => {
  const employeeData = useSelector((state) => state.workforce["workforceEmployee"] ?? []);
  const documentType = useSelector((state) => state.workforce.documentType);
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("workforce");
  const stepRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [acknowledged, setAcknowledged] = useState(false);
  const applicationId = useSelector((state) => state.workforce["fetchedApplicationIdByClientMutationId"] ?? []);
  const uploadFile = useSelector((state) => state.workforce.uploadFile);
  const uploadBankFile = useSelector((state) => state.workforce.uploadBankFile);
  const uploadDependentFile = useSelector((state) => state.workforce.uploadDependentFile);
  const classes = useStyles();
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerifyNid, setShowVerifyNid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const reduxState = useSelector((state) => state);
  const [disableConfirmSubmit, setDisableConfirmSubmit] = useState(false);
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
    company: null,
    factory: selectedFactory || null,
    workforceFactoryId: workforceFactoryId || "",
    isSubmitted: "no",
    organizationType: "",
    applicationType: "",
    applicationForSelf: applicationForSelf,
    dependents: [{}],
    employeeBankInfo: [{}],
    employeeAccidentInfo: {},
    id: "",
  });

  const [nidOrBcn, setNidOrBcn] = useState({
    nid: formData?.workforceEmployee?.nid || "",
    birthCertificateNo: formData?.workforceEmployee?.birthCertificateNo,
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
    if (reduxState.workforce.selectedEmployee) {
      dispatch(fetchWorkforceEmployee(modulesManager, [`id: "${decodeId(reduxState.workforce.selectedEmployee.id)}"`]));
    } else {
      dispatch(fetchWorkforceEmployee(modulesManager, [`relatedUser_LoginName_Iexact: "${reduxState.core.user.username}"`]));
    }
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
        factory:
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
        dependents: parsedApplicationData?.employeeDependentInfo || employeeData.dependents || [{}],
        employeeBankInfo: parsedApplicationData?.employeeBankInfo || employeeData?.employeeBankInfo || [{}],
        employeeAccidentInfo: parsedApplicationData?.employeeAccidentInfo || employeeData?.employeeAccidentInfo || {},
        metadata: parsedApplicationData?.metadata || employeeData?.metadata || {},
        applicantInfo: parsedApplicationData?.applicantInfo || employeeData?.metadata || {},
      });
    }
  }, [employeeData?.id, parsedApplicationData,user_type]); // Trigger this useEffect when `employeeData` changes.

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
    console.log(activeStep);
    const newErrors = validateRequiredFields(stepRef, formatMessage, formData);
    delete newErrors.documents;

    const isBankStep = (formData?.applicationForSelf === "yes" && activeStep === 3) || (formData?.applicationForSelf === "yes" && activeStep === 4);
    const isDependentStep = formData?.applicationForSelf === "no" && activeStep === 2

    const files = isBankStep ? uploadBankFile : uploadFile;
    let documentValidation = { isValid: true, errors: null };
    const BANK_DOC = "applicants bank check copy";

    if (isDependentStep) {
      // Specialized validation for the Dependent Step
      documentValidation = validateMandatoryDocumentsForDependents(documentType, uploadDependentFile || [], formData.dependents || []);
    } else if (isBankStep) {
      // Filter only for Bank Documents
      const bankDocsConfig = (documentType || []).filter((doc) => doc.documentType === BANK_DOC);
      documentValidation = validateMandatoryBankDocumentsForAccounts(bankDocsConfig, uploadBankFile || [], formData.employeeBankInfo || []);
    } else {
      // Filter out Bank Documents for general info steps
      const generalDocsConfig = (documentType || []).filter((doc) => doc.documentType !== BANK_DOC);
      documentValidation = validateMandatoryDocuments(generalDocsConfig, uploadFile || []);
    }

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
    if (Object.keys(newErrors).length === 0) {
      const nextStep = activeStep + 1;
      if (nextStep === 1 && !isAtLeast18YearsOld(formData?.workforceEmployee?.birthDate)) {
        let fakeErrors = { ...newErrors, rdmp: "core.error.workerAge" };
        setErrors(fakeErrors);
        console.log({ fakeErrors });
        return false;
      } else {
        if (nextStep < steps.length) {
          setActiveStep(nextStep);
        }
        if (nextStep === 1 || nextStep === 2) {
          // const nidValue = formData?.workforceEmployee?.nid;
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
          console.log("Update Submitting formData:", workforceEmployeeData);
          await dispatch(updateWorkforceEmployee(workforceEmployeeData, `Update Workforce Employee ${workforceEmployeeData.nameEn}`));
        } else if (nextStep === 3) {
          const createApplicationData = {
            workforceEmployeeId: formData?.workforceEmployee?.id || parsedApplicationData?.workforceEmployee?.id,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.factory?.id ? safeDecodeId(formData?.factory?.id) : null,
            organizationType: formData.organizationType,
            applicationType: formData.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeDesignationInfo: JSON.stringify(formData.employeeDesignationInfo),
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo),
            employeeDependentInfo: JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : "dependent",
          };
          console.log({ createApplicationData });
          if (!parsedApplicationData) {
            const applicationMutation = await formatMutation(
              "createWorkforceApplication",
              formatApplicationeGQL(createApplicationData),
              `Created application `,
            );
            const applicationClientMutationId = applicationMutation.clientMutationId;
            console.log("applicationClientMutationId", applicationClientMutationId);
            await dispatch(createApplication(applicationMutation, `Created workforce application `));

            // await dispatch(fetchApplicationId(modulesManager, applicationClientMutationId));
            const fetchRes = await dispatch(
              fetchInfoIdByClientMutationId(modulesManager, "workforceApplication", applicationClientMutationId, "WORKFORCE_APPLICATION_BY_CLIENT_MUTATION_ID"),
            );
            let applicationgetId = getInfoId(fetchRes, "workforceApplication");
            console.log("hello there", applicationgetId);
            if (!applicationgetId && applicationId) {
              applicationgetId = applicationId;
            }
            if (uploadDependentFile) {
              await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${applicationgetId}"`])).then((res) => {
                const dependentId = res?.payload?.data?.workforceEmployeeDependent?.edges[0]?.node?.id;
                uploadDependentFile.map((file, index) => {
                  dispatch(
                    createWorkforceDocument(
                      { ...file, workforceApplicationId: applicationgetId, workforceDependentId: safeDecodeId(dependentId) },
                      `Created workforce document `,
                    ),
                  );
                });
              });
            }
            dispatch(updateApplication(createApplicationData, `update workforce application ${formData.firstNameEn}`));
          } else {
            const updateApplicationData = { id: parsedApplicationData?.id, ...createApplicationData };
            console.log("i am from update", updateApplicationData);
            if (uploadDependentFile) {
              await dispatch(fetchEmployeeDependent(modulesManager, [`workforceApplication_Id:"${parsedApplicationData?.id}"`])).then((res) => {
                const dependentId = res?.payload?.data?.workforceEmployeeDependent?.edges[0]?.node?.id;
                console.log({ dependentId });
                uploadDependentFile.map((file, index) => {
                  dispatch(
                    createWorkforceDocument(
                      { ...file, workforceApplicationId: parsedApplicationData?.id, workforceDependentId: safeDecodeId(dependentId) },
                      `Created workforce document `,
                    ),
                  );
                });
              });
            }
            dispatch(updateApplication(updateApplicationData, `update workforce application `));
          }
        } else {
          console.log(applicationId);
          const updateApplicationData = {
            id: safeApplicationId(applicationId, parsedApplicationData),
            workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
            company: formData?.workforceEmployee?.company?.id,
            factory: formData?.factory?.id ? safeDecodeId(formData?.factory?.id) : null,
            organizationType: organizationType || parsedApplicationData?.organizationType,
            applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
            grantAmount: formData?.employeeAccidentInfo.grantAmount,
            employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
            employeeDependentInfo:
              JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
              JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
            employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
            status: WORKFORCE_STATUS.DRAFT,
            applicationFor: applicationForSelf === "yes" ? "self" : "dependent",
          };

          console.log("i am from accident info", updateApplicationData);
          dispatch(updateApplication(updateApplicationData, `update workforce application ${formData.firstNameEn}`));
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
    console.log({ tazwer: formData });
    if (uploadBankFile) {
      await uploadBankFile.map((file) => {
        return dispatch(
          createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(applicationId, parsedApplicationData) }, `Created workforce document`),
        );
      });
    }

    uploadFile.map((file, index) => {
      dispatch(createWorkforceDocument({ ...file, workforceApplicationId: safeApplicationId(applicationId) }, `Created workforce document `));
    });

    const submittedBy =
      user_type === WORKFORCE_USER_TYPE.APPLICANT ? "applicant" : user_type === WORKFORCE_USER_TYPE.FACTORY_ADMIN ? "factory_admin" : "UNKNOWN";
    try {
      const updateApplicationData = {
        id: safeApplicationId(applicationId, parsedApplicationData),
        workforceEmployeeId: formData?.workforceEmployee.id || parsedApplicationData?.workforceEmployee?.id,
        company: formData?.workforceEmployee?.company?.id,
        factory: formData?.factory?.id ? safeDecodeId(formData?.factory?.id) : null,
        organizationType: organizationType || parsedApplicationData?.organizationType,
        applicationType: selectedApplicationType || parsedApplicationData?.applicationType,
        grantAmount: formData?.employeeAccidentInfo.grantAmount,
        employeeBankInfo: JSON.stringify(formData.employeeBankInfo) || JSON.stringify(parsedApplicationData?.employeeBankInfo),
        employeeDependentInfo:
          JSON.stringify(formData.dependents).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}") ||
          JSON.stringify(parsedApplicationData?.employeeDependentInfo).replace(/\\/g, "").replace(/"{/g, "{").replace(/}"/g, "}"),
        employeeAccidentInfo: JSON.stringify(formData?.employeeAccidentInfo) || JSON.stringify(parsedApplicationData?.employeeAccidentInfo),
        status: WORKFORCE_STATUS.NEW,
        applicationFor: applicationForSelf === "yes" ? "self" : "dependent",
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
      console.log("hello i am from submit", updateApplicationData);
      dispatch(updateApplication(updateApplicationData, `update workforce application `));
      // dispatch(createApplicationMovement(createApplicationMovementData, `create workforce movement`));
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  console.log({ murad: uploadFile });
  console.log({ uploadDependentFile: uploadDependentFile });

  const steps = [
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
    // {
    //   label: "workforce.application.steps.upload.documents",
    //   content: (
    //     <EmployeeDetailsForm2
    //       handleChange={handleChange}
    //       formData={formData}
    //       selectedApplicationType={selectedApplicationType}
    //       formStepNo={"workforceDocument"}
    //     />
    //   ),
    // },
  ];

  console.log({ tazwer: reduxState.core.user.id });
  console.log({ fahimTazwer: formData });

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
              <FormattedMessage module="workforce" id="workforce.back" />
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              <FormattedMessage module="workforce" id="workforce.save.next" />
            </Button>
          ) : (
            <Button variant="contained" color="primary" disabled={!acknowledged} onClick={async () => {
                const isSuccess = await handleNext();
                if (isSuccess) setShowPreview(true);
              }}>
              <FormattedMessage module="workforce" id="workforce.submit" />
            </Button>
          )}
        </div>
      </Paper>
      <CustomSnackbar
        open={showErrorSnackbar} // Use the new state
        onClose={() => setShowErrorSnackbar(false)} // Allow it to close
        type="error"
        message={<FormattedMessage id="core.error.generel" module="workforce" />}
        duration={4000}
      />
    </div>
  );
};

export default MedicalAssistanceForm;
