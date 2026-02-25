import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid, Paper, Typography, Divider, IconButton } from "@material-ui/core";
import { Save } from "@material-ui/icons";
import { TextInput, journalize, PublishedComponent, FormattedMessage, formatMutation, decodeId, encodeId } from "@openimis/fe-core";
import { createWorkforceEmployee, fetchFactoryEmployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME, WORKFORCE_STATUS } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import EmployeeGenderPicker from "../../pickers/EmployeeGenderPicker";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";
import AssociationPicker from "../../pickers/AssociationPicker";
import EmployeeLifeStatusPicker from "../../pickers/EmployeeLifeStatusPicker";
import EmployeeMaritalStatusPicker from "../../pickers/EmployeeMaritalStatusPicker";
import { safeDecodeId } from "../../utils/utils";

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

const AddWorkforceEmployeePage = withStyles(styles)(({ classes }) => {
  const dispatch = useDispatch();
  const submittingMutation = useSelector((state) => state.workforce.submittingMutation);
  const workforceEmployee = useSelector((state) => state.workforce.workforceEmployee);
  const mutation = useSelector((state) => state.workforce.mutation);
  const loggedInUserId = useSelector((state) => state.core?.user?.i_user?.id);

  const [stateEdited, setStateEdited] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [workforceFactoryId, setWorkforceFactoryId] = useState(null);

  // useEffect(() => {
  //   if (!submittingMutation && mutation) {
  //     dispatch(journalize(mutation));
  //   }
  // }, [submittingMutation, mutation, dispatch]);

  const toggleSecondaryCalendar = () => {
    const isSecondaryCalendarEnabled = true;
    dispatch({ type: "CORE_CALENDAR_TYPE_TOGGLE", payload: { isSecondaryCalendarEnabled } });
  };

  useEffect(() => {
    const { loggedInUserId: userId } = { loggedInUserId };
    // if (userId) {
    //   console.log({userId})
    //   const filters = [`relatedUser_Id: "${encodeId(modulesManager, "InteractiveUserGQLType", userId)}"`];
    //   fetchFactoryEmployee(modulesManager, filters).then((res)=>{
    //     const edges = res?.payload?.data?.workforceEmployerEmployees?.edges || [];
    //     const node = edges[0]?.node;
    //     const factoryId = node?.workforceFactory || null;
    //     setWorkforceFactoryId(factoryId)
    //   })

    // }
    // toggleSecondaryCalendar()
  }, []);

  const save = async () => {
    const workforceEmployeeData = {
      workforceFactoryId: safeDecodeId(stateEdited.factory?.id) || safeDecodeId(workforceEmployee?.workforceFactory?.id) || null,
      firstNameBn: stateEdited.firstNameBn || null,
      firstNameEn: stateEdited.firstNameEn || null,
      phoneNumber: stateEdited.phoneNumber || null,
      email: stateEdited.email || null,
      gender: stateEdited.gender?.id || null,
      birthDate: stateEdited.birthDate || null,
      permanentAddress: stateEdited.permanentAddress || null,
      presentAddress: stateEdited.presentAddress || null,
      monthlyEarning: stateEdited.monthlyEarning || null,
      fatherNameBn: stateEdited.fatherNameBn || null,
      fatherNameEn: stateEdited.fatherNameEn || null,
      motherNameBn: stateEdited.motherNameBn || null,
      motherNameEn: stateEdited.motherNameEn || null,
      spouseNameBn: stateEdited.spouseNameBn || null,
      spouseNameEn: stateEdited.spouseNameEn || null,
      nid: stateEdited.nid || null,
      roleId: 0,
    };

    console.log({ workforceEmployeeData });

    await dispatch(createWorkforceEmployee(workforceEmployeeData, `Created Workforce Employee ${stateEdited.title}`));

    setIsSaved(true);
    setTimeout(()=>{
      window.location.reload();
    }, 2000)
  };

  const updateAttribute = (key, value) => {
    setStateEdited((prevState) => ({
      ...prevState,
      [key]: value,
    }));
    setIsSaved(false);
  };

  const isSaveDisabled = false;
  return (
    <div className={classes.page}>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.tableTitle}>
              <Grid item xs={12} className={classes.tableTitle}>
                <Typography>
                  <FormattedMessage module={MODULE_NAME} id="Workforce Employee" values={{ label: EMPTY_STRING }} />
                </Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.item}>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.nid"
                  value={stateEdited.nid || ""}
                  onChange={(v) => updateAttribute("nid", v)}
                  type={"number"}
                  required
                  readOnly={isSaved}
                />
              </Grid>
              {/* <Grid item xs={6} className={classes.item}>
                <CompanyPicker
                  value={stateEdited?.company?.id}
                  label={
                    <FormattedMessage
                      id="workforce.employee.workforce_employer"
                      module="workforce"
                    />
                  }
                  required
                  onChange={(v) => updateAttribute("company", v)}
                  readOnly={isSaved}
                />
              </Grid> */}
              <Grid item xs={6} className={classes.item}>
                <FactoryPicker
                  value={stateEdited?.factory?.id || workforceEmployee?.workforceFactory?.id}
                  label={<FormattedMessage id="workforce.employee.workforce_factory" module="workforce" />}
                  required
                  companyId={stateEdited?.company?.id}
                  onChange={(v) => updateAttribute("factory", v)}
                  readOnly={workforceEmployee?.workforceFactory ?? isSaved}
                />
                {/* <AssociationPicker
                  value={stateEdited?.allAssociation?.id ||workforceEmployee?.allAssociation?.id}
                  label={<FormattedMessage id="workforce.employee.all_association" module="workforce" />}
                  required
                  companyId={stateEdited?.company?.id}
                  onChange={(v) => updateAttribute("allAssociation", v)}
                  readOnly={workforceEmployee?.allAssociation ?? isSaved}
                /> */}
              </Grid>
              {/* <Grid item xs={6} className={classes.item}>
                <EmployeeLifeStatusPicker
                  value={stateEdited.lifeStatus || ""}
                  label={<FormattedMessage id="workforce.employee.lifeStatus" module="workforce" />}
                  required
                  onChange={(v) => updateAttribute("lifeStatus", v)}
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label={"workforce.employee.deathdate"}
                  value={stateEdited.deathDate || ""}
                  readOnly={stateEdited.lifeStatus !== "Deceased"}
                  onChange={(v) => updateAttribute("deathDate", v)}
                  // readOnly={isSaved}
                />
              </Grid> */}


              {/* <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label={"workforce.employee.joindate"}
                  value={stateEdited.joinDate || ""}
                  onChange={(v) => updateAttribute("joinDate", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid> */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.first.name.en"
                  value={stateEdited.firstNameEn || ""}
                  onChange={(v) => updateAttribute("firstNameEn", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.first.name.bn"
                  value={stateEdited.firstNameBn || ""}
                  onChange={(v) => updateAttribute("firstNameBn", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <EmployeeGenderPicker
                  value={stateEdited?.gender?.id}
                  label={<FormattedMessage id="workforce.employee.gender" module="workforce" />}
                  onChange={(v) => updateAttribute("gender", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <PublishedComponent
                  pubRef="workforce.DatePicker"
                  label={"workforce.employee.birthdate"}
                  value={stateEdited.birthDate || ""}
                  onChange={(v) => updateAttribute("birthDate", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.monthly_earning"
                  value={stateEdited.monthlyEarning || ""}
                  onChange={(v) => updateAttribute("monthlyEarning", v)}
                  // required
                  readOnly={isSaved}
                />
              </Grid>
              {/* <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.last.name.en"
                  value={stateEdited.lastNameEn || ""}
                  onChange={(v) => updateAttribute("lastNameEn", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.last.name.bn"
                  value={stateEdited.lastNameBn || ""}
                  onChange={(v) => updateAttribute("lastNameBn", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.other.name"
                  value={stateEdited.otherName || ""}
                  onChange={(v) => updateAttribute("otherName", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.position"
                  value={stateEdited.position || ""}
                  onChange={(v) => updateAttribute("position", v)}
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={6} className={classes.item}>
               <TextInput
                 label="workforce.employee.employee_type"
                 value={stateEdited.employeeType || ""}
                 onChange={(v) => updateAttribute("employeeType", v)}
                 readOnly={isSaved}
               />
              </Grid> */}
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.fathers_name.en"
                  value={stateEdited.fatherNameEn || ""}
                  onChange={(v) => updateAttribute("fatherNameEn", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.fathers_name.bn"
                  value={stateEdited.fatherNameBn || ""}
                  onChange={(v) => updateAttribute("fatherNameBn", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.mothers_name.en"
                  value={stateEdited.motherNameEn || ""}
                  onChange={(v) => updateAttribute("motherNameEn", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.mothers_name.bn"
                  value={stateEdited.motherNameBn || ""}
                  onChange={(v) => updateAttribute("motherNameBn", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.spouse.name.en"
                  value={stateEdited.spouseNameEn || ""}
                  onChange={(v) => updateAttribute("spouseNameEn", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.spouse.name.bn"
                  value={stateEdited.spouseNameBn || ""}
                  onChange={(v) => updateAttribute("spouseNameBn", v)}
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.phone"
                  value={stateEdited.phoneNumber || ""}
                  onChange={(v) => updateAttribute("phoneNumber", v)}
                  type={"number"}
                  required
                  readOnly={isSaved}
                />
              </Grid>

              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.email"
                  value={stateEdited.email || ""}
                  onChange={(v) => updateAttribute("email", v)}
                  type={"email"}
                  readOnly={isSaved}
                />
              </Grid>
              {/* <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.citizenship"
                  value={stateEdited.citizenship || ""}
                  onChange={(v) => updateAttribute("citizenship", v)}
                  readOnly={isSaved}
                />
              </Grid>
              <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.privacyLaw"
                  value={stateEdited.privacyLaw || ""}
                  onChange={(v) => updateAttribute("privacyLaw", v)}
                  readOnly={isSaved}
                />
              </Grid> */}

              {/* <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.birth_certificate_no"
                  value={stateEdited.birthCertificateNo || ""}
                  onChange={(v) => updateAttribute("birthCertificateNo", v)}
                  type={"number"}
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.insurance_number"
                  value={stateEdited.insuranceNumber || ""}
                  onChange={(v) => updateAttribute("insuranceNumber", v)}
                  required
                  readOnly={isSaved}
                />
              </Grid> */}

              {/* <Grid item xs={6} className={classes.item}>
                <TextInput
                  label="workforce.employee.passport_no"
                  value={stateEdited.passportNo || ""}
                  onChange={(v) => updateAttribute("passportNo", v)}
                  type={"number"}
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={6} className={classes.item}>
                <EmployeeMaritalStatusPicker
                  value={stateEdited.maritalStatus || ""}
                  label={<FormattedMessage id="workforce.employee.marital_status" module="workforce" />}
                  required
                  onChange={(v) => updateAttribute("maritalStatus", v)}
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={12} className={classes.item}>
                <p>Present Location</p>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={stateEdited.presentLocation || null}
                  onChange={(presentLocation) => updateAttribute("presentLocation", presentLocation)}
                  readOnly={isSaved}
                  required
                  split={true}
                />
              </Grid> */}
              {/* <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.employee.present_address"
                  value={stateEdited.presentAddress || ""}
                  onChange={(v) => updateAttribute("presentAddress", v)}
                  readOnly={isSaved}
                />
              </Grid> */}
              {/* <Grid item xs={12} className={classes.item}>
                <p>Permanent Location</p>
                <PublishedComponent
                  pubRef="location.DetailedLocation"
                  withNull={true}
                  value={stateEdited.permanentLocation || null}
                  onChange={(permanentLocation) => updateAttribute("permanentLocation", permanentLocation)}
                  readOnly={isSaved}
                  required
                  split={true}
                />
              </Grid> */}
              {/* <Grid item xs={12} className={classes.item}>
                <TextInput
                  label="workforce.employee.permanent_address"
                  value={stateEdited.permanentAddress || ""}
                  onChange={(v) => updateAttribute("permanentAddress", v)}
                  readOnly={isSaved}
                />
              </Grid> */}

              <Grid item xs={11} className={classes.item} />
              <Grid item xs={1} className={classes.item}>
                <IconButton variant="contained" component="label" color="primary" onClick={() => save()} disabled={isSaveDisabled || isSaved}>
                  <Save />
                </IconButton>
              </Grid>
            </Grid>
            <Divider />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
});

export default AddWorkforceEmployeePage;
