import React, { useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
// import { TextInput } from "@openimis/fe-core";
import { makeStyles } from "@material-ui/core/styles";
import {
  useTranslations,
  useModulesManager,
  TextInput,
  useHistory,
  FormattedMessage,
  PublishedComponent,
} from "@openimis/fe-core";
import { Save } from "@material-ui/icons";
import { EMPTY_STRING, MODULE_NAME } from "../../../../constants";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // height: "100vh",
  },
  paper: {
    padding: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
}));

const MedicalDonationCheckbox = ({formData, setFormData }) => {
  const classes = useStyles();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(
    "core.RegistrationPage",
    modulesManager
  );
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
    checkedF: true,
    checkedE: true,
    checkedF: true,   
  });
  
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (fieldKey, files) => {
    setUploadedFiles((prevFiles) => {
      // Check if fieldKey already exists
      const existingIndex = prevFiles.findIndex(
        (item) => item.fieldKey === fieldKey
      );

      if (existingIndex !== -1) {
        // Update existing entry
        const updatedFiles = [...prevFiles];
        updatedFiles[existingIndex] = { fieldKey, files };
        return updatedFiles;
      } else {
        // Add new entry
        return [...prevFiles, { fieldKey, files }];
      }
    });
  };
  console.log({ formData });
  return (
    <Box mt={1}>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedA"
              color="primary"
            />
          }
          label="(ক) দুর্ঘটনাজনিত কারণে দৈহিক ও মানসিকভাবে স্থায়ী অক্ষমতা (সর্বশেষ সময়সীমা বিগত ১০৫ দিনের মধ্যে হতে হবে);"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedB"
              color="primary"
            />
          }
          label="(খ) দুর্ঘটনাজনিত কারণে মৃত্যু (সর্বশেষ সময়সীমা বিগত ১০৫ দিনের মধ্যে হতে হবে);"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedF"
              color="primary"
            />
          }
          label="(গ) দুরারোগ্য চিকিৎসা;"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedE"
              color="primary"
            />
          }
          label="(ঘ) মৃতদেহ পরিবহন ও সৎকার;"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.checkedB}
              onChange={handleChange}
              name="checkedF"
              color="primary"
            />
          }
          label="(ঙ) অপ্রাতিষ্ঠানিক খাতে কর্মরত মহিলা শ্রমিকের মাতৃত্ব কল্যাণ;"
        />
      </FormGroup>
    </Box>
  );
};

export default MedicalDonationCheckbox;
