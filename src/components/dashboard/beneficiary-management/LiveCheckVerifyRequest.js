import { Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { FormattedMessage, useModulesManager, useHistory, parseData } from "@openimis/fe-core";
import { useSelector, useDispatch } from "react-redux";
import { fetchWorkforceDocument, fetchWorkforceLiveCheckRequest, updateTrainedWorkforceDocument, updateWorkforceDocument, updateWorkforceLiveCheckRequest } from "../../../actions";
import { safeDecodeId } from "../../../utils/utils";
import React, { useEffect, useState } from "react";

const LiveCheckVerifyRequest = () => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    dispatch(fetchWorkforceLiveCheckRequest(modulesManager, ["isApproved: false"]))
      .then((response) => {
        if (!active) return;

        const rows = parseData(response?.payload?.data?.workforceLiveCheckRequests) || [];
        setDocuments(rows);
      })
      .catch(() => {
        if (active) setError("Could not load verification requests.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, modulesManager, refreshKey]);

  const handleApprove = async (document) => {
    setApprovingId(document.id);
    setError("");

    try {
      const payload = {
        ...document,
        id:safeDecodeId(document?.id),
        isApproved:true,
      }
      await dispatch(updateWorkforceLiveCheckRequest(payload,"Approve live check verification request"))
      await dispatch(updateTrainedWorkforceDocument({id: safeDecodeId(document?.workforceDocument?.id)},"Approve live check verification request"));
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError("Could not approve this verification request.");
    } finally {
      setApprovingId(null);
    }
  };
  console.log({documents})

  return (
    <Box bgcolor="#fafafa" minHeight="100vh">
      <Box mb={2}>
        <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 4 }}>
          <FormattedMessage module="workforce" id="workforce.application.liveCheckVerifyRequest" />
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Review and approve submitted live check verification requests.
        </Typography>
      </Box>

      {error && (
        <Typography color="error" role="alert" gutterBottom>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} style={{ borderRadius: 12, border: "1px solid #e0e0e0" }}>
          <Table>
            <TableHead style={{ backgroundColor: "#f8fafd" }}>
              <TableRow>
                <TableCell style={{ fontWeight: 600 }}>Beneficiary Id</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Beneficiary Name En</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Beneficiary Name Bn</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Phone Number</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Attachment</TableCell>
                <TableCell align="center" style={{ fontWeight: 600 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id} hover>
                  <TableCell>
                    <TableCell>
                      <Typography variant="body2">{document.beneficiaryId || "—"}</Typography>
                    </TableCell>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{document.beneficiaryNameEn || "—"}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{document.beneficiaryNameBn || "—"}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{document.phoneNumber || "—"}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{document.reason || "—"}</Typography>
                  </TableCell>

                  <TableCell>
                    {document?.url || document?.path ? (
                      <Button
                        component="a"
                        size="small"
                        href={new URL(document?.url || document?.path, window.location.origin).toString()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View document
                      </Button>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not available
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Button variant="contained" color="primary" size="small" disabled={approvingId === document.id} onClick={() => handleApprove(document)}>
                      {approvingId === document.id ? "Approving..." : "Approve"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {documents.length === 0 && (
            <Box p={5} textAlign="center">
              <Typography color="textSecondary">No verification requests found.</Typography>
            </Box>
          )}
        </TableContainer>
      )}
    </Box>
  );
};

export default LiveCheckVerifyRequest;
