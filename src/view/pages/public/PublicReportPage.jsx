import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";
import { getReport } from "../../../core/Services/firestoreService";
import { downloadReportPdf } from "../../../core/Utils/pdf";
import Button from "../../components/Button";
import LoadingScreen from "../../components/LoadingScreen";
import ReportPaper from "../../components/ReportPaper";

export default function PublicReportPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const paperRef = useRef(null);
  useEffect(() => {
    getReport(reportId)
      .then((r) => {
        if (!r?.published) setError("This report is not available publicly.");
        else setReport(r);
      })
      .catch(() => setError("Report not found or not public."));
  }, [reportId]);
  if (error)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white p-7 text-center shadow">
          <h1 className="font-bold">Report unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  if (!report) return <LoadingScreen />;
  const download = async () => {
    setBusy(true);
    try {
      await downloadReportPdf(
        paperRef.current,
        `${report.projectName}-${report.templateName}-${report.reportDate}.pdf`.replace(
          /\s+/g,
          "-",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10">
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end px-3 sm:px-0">
        <Button onClick={download} disabled={busy}>
          <Download size={16} />
          {busy ? "Generating..." : "Download PDF"}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <ReportPaper report={report} paperRef={paperRef} />
      </div>
    </div>
  );
}
