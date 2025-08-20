  import React, { useEffect, useState, useRef } from "react";
  import { Grid } from "@material-ui/core";
  import { TextInput,FormattedMessage } from "@openimis/fe-core";
  import { getThirdStepId } from "../../utils/utils";
  import PostOfficePicker from "../../pickers/PostOfficePicker";

  const CustomDetailedLocation = ({ locationType = "city", onChange, addressKey, data = {}, readOnly, locationData }) => {
    const [localData, setLocalData] = useState({});
    const firstRender = useRef(true);
    const thirdStepId = getThirdStepId(locationData);
    console.log({ thirdStepId });
    // Parse and initialize from passed `data` once on mount or when `data` changes (external)
    useEffect(() => {
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          setLocalData(parsed || {});
        } catch (err) {
          console.error("Invalid JSON in data prop:", err);
          setLocalData({});
        }
      } else if (typeof data === "object" && data !== null) {
        setLocalData(data);
      } else {
        setLocalData({});
      }
    }, [data]);

    // Update parent only when localData changes by user input (not initial mount)
    useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      onChange?.(addressKey, JSON.stringify(localData));
    }, [localData]); // Only trigger on localData change

    const updateField = (key, value) => {
      setLocalData((prev) => ({
        ...prev,
        [key]: value,
      }));
    };
  console.log('localdata',localData)
    return (
      <Grid container spacing={1}>
        {locationType === "city" && (
          <>
            <Grid item xs={12} sm={4}>
              <PostOfficePicker
                value={localData.postOffice} 
                label={<FormattedMessage id="workforce.select.postOffice" module="workforce" />}
                locationId={thirdStepId}
                onChange={(v) => updateField( "postOffice", v)}
                required
                readOnly={readOnly}
              />
            </Grid>
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
            <Grid item xs={12} sm={4}>
              <TextInput value={localData.extraInfo || ""} label="&bsp;" onChange={(v) => updateField("extraInfo", v)} InputProps={{ margin: "dense" }} readOnly={readOnly} />
            </Grid>
          </>
        )}

        {locationType === "rural" && (
          <>
          <Grid item xs={12} sm={4}>
              <PostOfficePicker
                value={localData.postOffice || null} 
                label={<FormattedMessage id="workforce.select.postOffice" module="workforce" />}
                locationId={thirdStepId}
                onChange={(v) => updateField( "postOffice", v)}
                required
                readOnly={readOnly}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
                label="workforce.employee.rural.para_mahalla"
                value={localData.paraMahalla || ""}
                onChange={(v) => updateField("paraMahalla", v)}
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
              <TextInput value={localData.extraInfo || ""} label="&bsp;" onChange={(v) => updateField("extraInfo", v)} InputProps={{ margin: "dense" }} readOnly={readOnly} />
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  export default CustomDetailedLocation;
