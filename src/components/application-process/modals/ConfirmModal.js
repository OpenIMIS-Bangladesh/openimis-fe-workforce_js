import React from "react";
import { FormattedMessage,useTranslations,useModulesManager } from "@openimis/fe-core";
import {
  Modal,
  Box,
  Typography,
  Button,
} from "@material-ui/core";
import { isEisPath } from "../../../utils/utils";



const ConfirmModal = ({ open, message, onClose,loader }) => {
  const modulesManager = useModulesManager()
 const { formatMessage } = useTranslations("core.RegistrationPage", modulesManager);
  return (
    <Modal open={open} onClose={() => onClose(0)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          
          {<FormattedMessage id={`${message}`} module="workforce" /> || "Are you sure?"}
        </Typography>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-around" }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => onClose(0)} // cancel
          >
            {<FormattedMessage id="workforce.confirm.modal.cancel" module="workforce" /> || "Are you sure?"}
          </Button>
          <Button
            disabled={loader}
            variant="contained"
            color="primary"
            onClick={() => onClose(1)} // ok
          >
            {!loader?<FormattedMessage id={isEisPath()?"workforce.confirm.modal.ok":"workforce.confirm.modal.ok.notEis"} module="workforce" /> || "Are you sure?":"Loading ..."}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;