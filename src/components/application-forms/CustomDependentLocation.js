import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { TextInput } from "@openimis/fe-core";

const CustomDependentLocation = ({ location, onChange, addressKey, data, readOnly }) => {
  const [locationType, setLocationType] = useState("rural"); // Default
  const [localData, setLocalData] = useState(data || {});

  // Update internal state when external data changes
  useEffect(() => {
    if (data) { 
        setLocalData(JSON.parse(data) || {});
    }
  }, [data]);

  // Determine if location is city or rural
  useEffect(() => {
    const isCity = checkIfCity(location);
    setLocationType(isCity ? "city" : "rural");
  }, [location]);

  const checkIfCity = (location) => {
    let current = location;
    while (current) {
      if (current.name?.includes("সিটি কর্পোরেশন"|| "পৌরসভা")) {
        return true;
      }
      current = current.parent;
    }
    return false;
  };

  const updateField = (key, value) => {
    const updatedData = {
      ...localData,
      [key]: value,
    };
    setLocalData(updatedData);
    if (onChange) {
      onChange(addressKey, updatedData);
    }
  };

  return (
    <Grid container spacing={1}>
      {locationType === "city" && (
        <>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.city.road_no"
              value={localData.roadName || ""}
              onChange={(v) => updateField("roadName", v)}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.city.house_name"
              value={localData.houseName || ""}
              onChange={(v) => updateField("houseName", v)}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.city.apartment_number"
              value={localData.apartmentNumber || ""}
              onChange={(v) => updateField("apartmentNumber", v)}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
            //   label="workforce.employee.city.extra_info"
              value={localData.extraInfo || ""}
              onChange={(v) => updateField("extraInfo", v)}
              readOnly={readOnly}
            />
          </Grid>
        </>
      )}
      {locationType === "rural" && (
        <>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.rural.house_name"
              value={localData.houseName || ""}
              onChange={(v) => updateField("houseName", v)}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.rural.para_mahalla"
              value={localData.paraMahalla || ""}
              onChange={(v) => updateField("paraMahalla", v)}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.rural.village_road"
              value={localData.villageRoad || ""}
              onChange={(v) => updateField("villageRoad", v)}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
            //   label="workforce.employee.rural.extra_info"
              value={localData.extraInfo || ""}
              onChange={(v) => updateField("extraInfo", v)}
              readOnly={readOnly}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default CustomDependentLocation;
