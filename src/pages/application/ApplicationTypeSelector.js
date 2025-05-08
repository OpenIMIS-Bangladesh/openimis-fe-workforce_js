import React, { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
  Box
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslations, FormattedMessage } from "@openimis/fe-core";
import CompanyPicker from "../../pickers/CompanyPicker";
import FactoryPicker from "../../pickers/FactoryPicker";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 800,
  },
  paper: {
    padding: theme.spacing(2),
    width: "100%", // Ensures it doesn't overflow
    maxWidth: 650, // Restrict max width
    margin: "auto", // Centers the Paper component
  },
  section: {
    marginTop: theme.spacing(3),
  },
}));

const ApplicationTypeSelector = ({ modulesManager, onSelect,selectedCompany, setSelectedCompany,selectedFactory, setSelectedFactory }) => {
  const [selectedApplicationType, setSelectedApplicationType] = useState("");
  const [isExportOriented, setIsExportOriented] = useState("");
  

  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );

  const classes = useStyles();

  const handleApplicationTypeChange = (event) => {
    const value = event.target.value;
    setSelectedApplicationType(value);
    onSelect(value, isExportOriented); // Pass both selections
  };

  const handleExportOrientedChange = (event) => {
    const value = event.target.value;
    setIsExportOriented(value);
    onSelect(selectedApplicationType, value); // Pass both selections
  };

  const handleCompanyChange = (option) => {
    setSelectedCompany(option);
    setSelectedFactory(null); // Reset factory when company changes
  };

  const handleFactoryChange = (option) => {
    setSelectedFactory(option);
  };
  console.log({selectedFactory})

  return (
    <Paper className={classes.paper} elevation={0}>
      {/* Company Picker */}
      {/* <Box mt={3}>
      <CompanyPicker  
        value={selectedCompany?.id}
        label={
          <FormattedMessage
            id="workforce.employee.workforce_employer"
            module="workforce"
          />
        }
        required
        onChange={(v) => {
          handleCompanyChange(v)
        }}
        readOnly={false}
      />
      </Box> */}

      {/* Factory Picker */}
      {/* {selectedCompany && (
        <Box mt={3}>
        <FactoryPicker
        value={selectedFactory?.factory?.id}
        label={
          <FormattedMessage
            id="workforce.employee.workforce_factory"
            module="workforce"
          />
        }
        required
        companyId={selectedCompany?.id}
        onChange={(v) => {
          handleFactoryChange(v)
        }}
        readOnly={false}
      />
      </Box>
      )} */}
      <FormControl component="fieldset">
        {/* New Export-Oriented Company Question */}
        <Typography
          variant="h6"
          className={`${classes.title} ${classes.section}`}
        >
          {
            <FormattedMessage
              id="workforce.application.company.type"
              module="workforce"
            />
          }
        </Typography>
        <RadioGroup
          value={isExportOriented}
          onChange={handleExportOrientedChange}
        >
          <FormControlLabel
            value="yes"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                id="workforce.application.permission.yes"
                module="workforce"
              />
            }
          />
          <FormControlLabel
            value="no"
            control={<Radio color="primary" />}
            label={
              <FormattedMessage
                id="workforce.application.permission.no"
                module="workforce"
              />
            }
          />
        </RadioGroup>

        {/* Application Type Selection */}
        {isExportOriented === "yes" ? (
          <>
            <Typography variant="h6" className={classes.title}>
              {
                <FormattedMessage
                  id="workforce.application.type.title"
                  module="workforce"
                />
              }
            </Typography>
            <RadioGroup
              value={selectedApplicationType}
              onChange={handleApplicationTypeChange}
            >
              <FormControlLabel
                value="medicalAssistance"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.medical.assistance"
                    module="workforce"
                  />
                }
              />
              <FormControlLabel
                value="financialAssistance"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.financial.assistance"
                    module="workforce"
                  />
                }
              />
              <FormControlLabel
                value="disabilityAssistance"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.medical.disability"
                    module="workforce"
                  />
                }
              />
              <FormControlLabel
                value="scholarship"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.scholarship"
                    module="workforce"
                  />
                }
              />
            </RadioGroup>
          </>
        ) : isExportOriented === "no" ? (
          <>
            <Typography variant="h6" className={classes.title}>
              {
                <FormattedMessage
                  id="workforce.application.type.title"
                  module="workforce"
                />
              }
            </Typography>
            <RadioGroup
              value={selectedApplicationType}
              onChange={handleApplicationTypeChange}
            >
              <FormControlLabel
                value="medicalDonation"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.medical.donation"
                    module="workforce"
                  />
                }
              />
              <FormControlLabel
                value="educationGrant"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.education.grant"
                    module="workforce"
                  />
                }
              />
              <FormControlLabel
                value="deadlyGrant"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.deadly.grant"
                    module="workforce"
                  />
                }
              />
              <FormControlLabel
                value="maternalGrant"
                control={<Radio color="primary" />}
                label={
                  <FormattedMessage
                    id="workforce.application.type.maternal.grant"
                    module="workforce"
                  />
                }
              />
            </RadioGroup>
          </>
        ) : null}
      </FormControl>
    </Paper>
  );
};

export default ApplicationTypeSelector;
