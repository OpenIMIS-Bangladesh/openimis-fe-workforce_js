import React from "react";
import { makeStyles } from "@material-ui/styles";
import OrganizationSearcher from "../components/OrganizationSearcher";

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

const WorkforceOrganizationsPage = () => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <OrganizationSearcher />
    </div>
  );
};

export default WorkforceOrganizationsPage;