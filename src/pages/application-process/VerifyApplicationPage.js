import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Card, CardContent,Box
} from "@material-ui/core";
import {
  TextInput,
  journalize,
  PublishedComponent,
  FormattedMessage,
} from "@openimis/fe-core";
import { updateOrganizationEmployee } from "../../actions";
import { EMPTY_STRING, MODULE_NAME } from "../../constants";
import { withTheme, withStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const styles = (theme) => ({
  // paper: theme.paper.paper,
  paper: {
    padding: theme.spacing(1),
    width: 700,
    margin:"0 auto"
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title:{
    fontSize:'medium',
    fontWeight:"bold"
  },
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
  overrideReadOnly: {
    "& .Mui-disabled": {
      color: `${theme.palette.text.primary} !important`, // Ensures text remains default color
    },
  },
});

class VerifyApplicationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: props.application.workforceEmployee || {},
      parseAccidentInfo:
        JSON.parse(props.application.employeeAccidentInfo) || {},
      parseBankInfo: JSON.parse(props.application.employeeBankInfo) || {},
      parseDependentInfo:
        JSON.parse(props.application.employeeDependentInfo) || {},
      isSaved: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.application !== this.props.application) {
      this.setState({ stateEdited: this.props.application });
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.dispatch(journalize(this.props.mutation));
    }
  }

  render() {
    const { classes } = this.props;
    const {
      stateEdited,
      isSaved,
      parseAccidentInfo,
      parseBankInfo,
      parseDependentInfo,
    } = this.state;
    const isSaveDisabled = false;

    const AccidentInfo = JSON.parse(parseAccidentInfo);
    const BankInfo = JSON.parse(parseBankInfo);
    const DependentInfo = JSON.parse(parseDependentInfo);
    const {
      firstNameEn, lastNameEn, firstNameBn, lastNameBn, otherName,
      phoneNumber, email, gender, nid, birthCertificateNo, passportNo,
      presentAddress, permanentAddress, presentLocation, permanentLocation,
      maritalStatus, citizenship, privacyLaw, insuranceNumber, birthDate,
      fatherNameBn, fatherNameEn, motherNameBn, motherNameEn,
      spouseNameBn, spouseNameEn, lifeStatus, deathDate,
      bankInfo, accidentInfo, dependents
    } = stateEdited;

    console.log({ stateEdited });

    return (
      <div className={classes.container}>
        <Box p={0} className={classes.paper}>
          <Grid container spacing={1}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" className={classes.title}><b>Personal Information</b></Typography>
                  <Divider style={{ margin: "5px 0" }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <b>Name (EN):</b> {firstNameEn} {lastNameEn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Name (BN):</b> {firstNameBn} {lastNameBn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Other Name:</b> {otherName}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Phone:</b> {phoneNumber}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Email:</b> {email || "N/A"}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Gender:</b> {gender}
                    </Grid>
                    <Grid item xs={6}>
                      <b>NID:</b> {nid}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Birth Certificate:</b> {birthCertificateNo}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Passport No:</b> {passportNo || "N/A"}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Birth Date:</b> {birthDate}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Life Status:</b> {lifeStatus}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Death Date:</b> {deathDate || "N/A"}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Family Info */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" className={classes.title}><b>Family Information</b></Typography>
                  <Divider style={{ margin: "5px 0" }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <b>Father (EN):</b> {fatherNameEn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Father (BN):</b> {fatherNameBn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Mother (EN):</b> {motherNameEn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Mother (BN):</b> {motherNameBn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Spouse (EN):</b> {spouseNameEn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Spouse (BN):</b> {spouseNameBn}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Marital Status:</b> {maritalStatus}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Location Info */}
            {/* <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" className={classes.title}>Location</Typography>
                  <Divider style={{ margin: "5px 0" }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <b>Present Address:</b> {presentAddress}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Permanent Address:</b> {permanentAddress}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Present Location:</b>{" "}
                      {this.renderLocation(presentLocation)}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Permanent Location:</b>{" "}
                      {this.renderLocation(permanentLocation)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid> */}

            {/* Official Info */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" className={classes.title}><b>Official Information</b></Typography>
                  <Divider style={{ margin: "5px 0" }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <b>Citizenship:</b> {citizenship}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Privacy Law:</b> {privacyLaw}
                    </Grid>
                    <Grid item xs={6}>
                      <b>Insurance No:</b> {insuranceNumber}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Bank Info */}
            {bankInfo && Object.keys(bankInfo).length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Bank Info</Typography>
                    <Divider style={{ margin: "5px 0" }} />
                    {Object.entries(bankInfo).map(([key, value]) => (
                      <Typography key={key}>
                        <b>{key}:</b> {value}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Accident Info */}
            {accidentInfo && Object.keys(accidentInfo).length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Accident Info</Typography>
                    <Divider style={{ margin: "5px 0" }} />
                    {Object.entries(accidentInfo).map(([key, value]) => (
                      <Typography key={key}>
                        <b>{key}:</b> {value}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Dependents */}
            {Array.isArray(dependents) && dependents.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6">Dependents</Typography>
                {dependents.map((dep, index) => (
                  <Card key={index} style={{ marginBottom: "16px" }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Dependent #{index + 1}
                      </Typography>
                      <Divider style={{ margin: "5px 0" }} />
                      {Object.keys(dep).length === 0 ? (
                        <Typography color="textSecondary">
                          No data provided.
                        </Typography>
                      ) : (
                        Object.entries(dep).map(([key, value]) => (
                          <Typography key={key}>
                            <b>{key}:</b> {value}
                          </Typography>
                        ))
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            )}
          </Grid>
        </Box>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  application: state.workforce.application,
});

export default connect(mapStateToProps)(
  withStyles(styles)(VerifyApplicationPage)
);
