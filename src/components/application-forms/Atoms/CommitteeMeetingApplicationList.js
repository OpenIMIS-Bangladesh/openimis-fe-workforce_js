import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Button, Typography, Box } from '@material-ui/core';
import { parseData, useModulesManager,useHistory } from "@openimis/fe-core";
import { fetchApplicationsSummary } from '../../../actions';
import { WORKFORCE_STATUS } from '../../../constants';
import { safeDecodeId, safeParse } from '../../../utils/utils';

const CommitteeMeetingApplicationList = ({ application }) => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory()
  const [meetingApplicationList, setMeetingApplicationList] = useState([]);
  const loadedSummaryId = useRef(null);

  const summaryId = safeDecodeId(application?.eisApplicationSummary?.id);
  useEffect(() => {
    if (!summaryId || loadedSummaryId.current === summaryId) return undefined;

    loadedSummaryId.current = summaryId;
    let isCurrent = true;

    dispatch(
      fetchApplicationsSummary(modulesManager, [
        `eisApplicationSummaryId:"${summaryId}"`,
      ]),
    ).then((res) => {
      if (!isCurrent) return;

      const applicationList = parseData(res?.payload?.data?.workforceApplication) || [];
      setMeetingApplicationList(applicationList);
    });

    return () => {
      isCurrent = false;
    };
  }, [dispatch, modulesManager, summaryId]);

  return (
    <Box width="100%" bgcolor="background.paper" style={{ maxHeight: 400, overflow: 'auto' }}>
      <List disablePadding>
        {meetingApplicationList.map((app) => {
          const deceasedWorkerInfo = safeParse(app?.deceasedWorkerInfo)
          return (
          <ListItem key={app?.id} divider>
            <ListItemText
              primary={app?.applicationType === "financialAssistance" ? deceasedWorkerInfo?.nameEn : app?.workforceEmployee?.nameEn}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="textPrimary">
                    {app?.applicationType}
                  </Typography>
                  {` — ${WORKFORCE_STATUS[app?.status]}`}
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <Button size="small" variant="outlined" onClick={() => window.location.href= window.location.origin+`/workforce/applications/application/view/${safeDecodeId(app?.id)}`}>
                View
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        )})}
      </List>
    </Box>
  );
};

export default CommitteeMeetingApplicationList;