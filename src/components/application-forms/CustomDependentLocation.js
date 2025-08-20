import React, { useEffect, useRef, useState } from "react";
import { Grid } from "@material-ui/core";
import { TextInput, FormattedMessage } from "@openimis/fe-core";
import PostOfficePicker from "../../pickers/PostOfficePicker";
import { getThirdStepId } from "../../utils/utils";

const CustomDependentLocation = ({ location, onChange, addressKey, data, readOnly, locationData }) => {
  const [locationType, setLocationType] = useState("rural");
  const [localData, setLocalData] = useState(data || {});
  const thirdStepId = getThirdStepId(locationData);
  const firstRender = useRef(true);
  // Update internal state when external data changes
  useEffect(() => {
    if (data) {
      try {
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;
        setLocalData(parsedData || {});
      } catch (error) {
        console.error("Invalid address JSON:", error);
        setLocalData({});
      }
    } else {
      setLocalData({});
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
      if (current.name?.includes("সিটি কর্পোরেশন")) {
        return true;
      } else if (current.name?.includes("পৌরসভা")) {
        return true;
      }
      current = current.parent;
    }
    return false;
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onChange?.(addressKey, JSON.stringify(localData));
  }, [localData]);

  const updateField = (key, value) => {
    const updatedData = {
      ...localData,
      [key]: value,
    };
    setLocalData(updatedData);
    // if (onChange) {
    //   onChange(addressKey, updatedData);
    // }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={4}>
        <PostOfficePicker
          value={localData.postOffice}
          label={<FormattedMessage id="workforce.select.postOffice" module="workforce" />}
          locationId={thirdStepId}
          onChange={(v) => updateField("postOffice", v)}
          required
          readOnly={readOnly}
        />
      </Grid>
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
              label="&bsp;"
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
              label="&bsp;"
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
