import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { TextInput } from "@openimis/fe-core";

const CustomDetailedLocation = ({ locationType ="city", onChange, addressKey, data = {},readOnly }) => {
  const [localData, setLocalData] = useState({});

  const updateField = (key, value) => {
    const updated = {
      ...localData,
      [key]: value,
    };
    setLocalData(updated);
    onChange(addressKey, JSON.stringify(updated)); 
  };
  console.log({localData})

  return (
    <Grid container spacing={1}>
      {locationType === "city" && (
        <>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.city.road_no"
              value={localData.roadName || ""}
              onChange={(v) => updateField("roadName", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.city.house_name"
              value={localData.houseName || ""}
              onChange={(v) => updateField("houseName", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.city.apartment_number"
              value={localData.apartmentNumber || ""}
              onChange={(v) => updateField("apartmentNumber", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
        </>
      )}

      {locationType === "rural" && (
        <>
          <Grid item xs={12} sm={6}>
            <TextInput
              label="workforce.employee.rural.address"
              value={localData.ruralAddress || ""}
              onChange={(v) => updateField("ruralAddress", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput
              label="workforce.employee.rural.house_name"
              value={localData.houseName || ""}
              onChange={(v) => updateField("houseName", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.rural.village_road"
              value={localData.villageRoad || ""}
              onChange={(v) => updateField("villageRoad", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.rural.para_mahalla"
              value={localData.paraMahalla || ""}
              onChange={(v) => updateField("paraMahalla", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextInput
              label="workforce.employee.rural.post_office"
              value={localData.postOffice || ""}
              onChange={(v) => updateField("postOffice", v)}
              InputProps={{ margin: "dense" }}
              readOnly={readOnly}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default CustomDetailedLocation;
