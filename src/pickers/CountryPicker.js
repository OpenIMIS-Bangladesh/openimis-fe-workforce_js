import React, { useEffect, useState } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@material-ui/core";
import countries from "i18n-iso-countries";

// Register desired locales (Bengali and English)
import enLocale from "i18n-iso-countries/langs/en.json";
import bnLocale from "i18n-iso-countries/langs/bn.json";

countries.registerLocale(enLocale);
countries.registerLocale(bnLocale);

const CountryPicker = ({
  label = "Country",
  value,
  onChange,
  required = false,
  fullWidth = true,
  readOnly = false,
  language = "en", // Dynamically switch language
}) => {
  const [countryList, setCountryList] = useState([]);

  useEffect(() => {
    try {
      const countryNames = countries.getNames(language, { select: "official" });
      const formattedList = Object.entries(countryNames).map(([code, name]) => ({
        value: code,
        label: name,
      }));
      setCountryList(formattedList);
    } catch (error) {
      console.error(`Unsupported language code: ${language}`, error);
    }
  }, [language]);

  return (
    <FormControl fullWidth={fullWidth} required={required}>
      <InputLabel id="country-picker-label">{label}</InputLabel>
      <Select
        labelId="country-picker-label"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
      >
        {countryList.map((country) => (
          <MenuItem key={country.value} value={country.value}>
            {country.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountryPicker;
