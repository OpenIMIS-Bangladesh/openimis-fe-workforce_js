import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Modal, Button } from "@material-ui/core";
import PrintIcon from "@material-ui/icons/Print";
import { useReactToPrint } from "react-to-print";
import { DeathApplicationPrint } from "./DeathApplicationPrint";

const useStyles = makeStyles({
  "@global": {
    "@media all": {
      ".page-break": {
        display: "none",
      },
    },

    "@media print": {
      "html, body": {
        height: "initial !important",
        overflow: "initial !important",
        WebkitPrintColorAdjust: "exact",
      },

      ".page-break": {
        marginTop: "1rem",
        display: "block",
        pageBreakBefore: "auto",
      },
    },

    "@page": {
      size: "auto",
      margin: "20mm",
    },
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "scroll",
  },
  modalContent: {
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    padding: 16,
    width: "90%",
    maxWidth: "210mm",
    maxHeight: "90vh",
    overflowY: "auto",
  },
});

export const ApplicationPrintPreview = ({
  data,
  documents,
  logoLeftUrl,
  logoLeft,
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const printRef = useRef();

  // 1️⃣ Setup the printer hook
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  contentRef: printRef,
    documentTitle: "Death Application Form",
    // removeAfterPrint: false,
  });

  // 2️⃣ Safe print trigger with delay (important for MUI modal portal)
  const handleSafePrint = () => {
    if (!printRef.current) {
      // wait a moment for the modal DOM to render
      setTimeout(() => {
        if (printRef.current) handlePrint();
        else console.error("Still no content to print!");
      }, 300);
    } else {
      handlePrint();
    }
  };

  if (!data || !data.workforceEmployee)
    return <p>আবেদনের কোনো তথ্য পাওয়া যায়নি।</p>;

  return (
    <>



        <Paper className={classes.modalContent}>
          <div
            className="print-button-container"
            style={{ textAlign: "right", marginBottom: 16 }}
          >
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handleSafePrint}
            >
              Print
            </Button>
          </div>

          {/* Printable Area */}
          <div id="print-container" ref={printRef}>
            <DeathApplicationPrint
              data={data}
              documents={documents}
              logoLeft={logoLeft}
              logoLeftUrl={logoLeftUrl}
            />
          </div>
        </Paper>

    </>
  );
};
