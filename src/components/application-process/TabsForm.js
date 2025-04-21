import React, {useEffect, useState, useRef} from "react";
import { Tab, Tabs, Paper } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/styles";
import { useTranslations, combine } from "@openimis/fe-core";
import AccidentalTabForm from "./AccidentalTabForm";
import AllTabForm from "./AllTabForm";
import DeathTabForm from "./DeathTabForm";
import DisabilityTabForm from "./DisabilityTabForm";
// import {useLimitDefaultsQuery} from "../../hooks";
// import {LIMIT_TYPES, PRICE_ORIGINS} from "../../constants";

const CurrentTab = (props) => {
  const { tab } = props;

  switch (tab) {
    case "all":
      return <AllTabForm {...props} />;
    case "accidental":
      return <AccidentalTabForm {...props} />;
    case "death":
      return <DeathTabForm {...props} />;
    case "disability":
      return <DisabilityTabForm {...props} />;
  }
  return null;
};

const TabsForm = (props) => {
  const { classes, ...otherProps } = props;
  const [activeTab, setActiveTab] = useState("all");
  const handleChange = (_, value) => setActiveTab(value);
  const { formatMessage } = useTranslations("product.TabsForm");
  const { isLoadingLimitDefaults, dataLimitDefaults} = useLimitDefaultsQuery({skip: true});
  const [isLoadedLimitDefaults, setLoadedLimitDefaults] = useState(false);
  const [limitType, setLimitType] = useState('C');
  const [coInsuranceDefaultValue, setCoInsuranceDefaultValue] = useState(100);
  const [fixedDefaultValue, setFixedDefaultValue] = useState(0);
  const [priceOrigin, setPriceOrigin] = useState('P')

  useEffect(() => {
    if (!isLoadingLimitDefaults && !isLoadedLimitDefaults) {
      setPriceOrigin(dataLimitDefaults.limitDefaults.priceOrigin?? 'P')
      setLimitType(dataLimitDefaults.limitDefaults.limitType?? 'C')
      setCoInsuranceDefaultValue(dataLimitDefaults.limitDefaults.defaultLimitCoInsuranceValue?? 100)
      setFixedDefaultValue(dataLimitDefaults.limitDefaults.defaultLimitFixedValue?? 0)
      setLoadedLimitDefaults(true)
    }
  }, [dataLimitDefaults, isLoadingLimitDefaults]);



  return isLoadedLimitDefaults && (
    <Paper className={classes.paper}>
      <Tabs className={classes.header} value={activeTab} indicatorColor="primary" onChange={handleChange}>
        <Tab value="all" label={formatMessage("all")}></Tab>
        <Tab value="accidental" label={formatMessage("accidental")}></Tab>
        <Tab value="death" label={formatMessage("death")}></Tab>
        <Tab value="disability" label={formatMessage("disability")}></Tab>
      </Tabs>
      <CurrentTab
        tab={activeTab}
        {...otherProps} />
    </Paper>
  );
};

const styles = (theme) => ({
  paper: theme.paper.paper,
  header: theme.paper.header,
});

const enhance = combine(withTheme, withStyles(styles));
export default enhance(TabsForm);
