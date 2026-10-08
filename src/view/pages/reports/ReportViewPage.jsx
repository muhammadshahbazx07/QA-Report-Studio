import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Download, Globe2, Send } from "lucide-react";
import {
  getReport,
  updateReport,
} from "../../../core/Services/firestoreService";
import { downloadReportPdf } from "../../../core/Utils/pdf";
import Button from "../../components/Button";
import ReportPaper from "../../components/ReportPaper";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/Toast";

export default function ReportViewPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const paperRef = useRef(null);
  const load = () => getReport(reportId).then(setReport);
  useEffect(() => {
    load();
  }, [reportId]);
  if (!report)
    return <div className="text-sm text-slate-500">Loading report...</div>;
  const publicUrl = `${window.location.origin}/r/${reportId}`;
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
    <>
      <PageHeader
        eyebrow={report.published ? "Published Report" : "Draft Report"}
        title={`${report.templateName} — ${report.reportDate}`}
        description={
          report.published
            ? "Public URL is active. PDF contains only the final report."
            : "Draft is admin-only until published."
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate(`/projects/${report.projectId}`)}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            {report.published && (
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(publicUrl);
                  show("Public URL copied");
                }}
              >
                <Copy size={16} />
                Copy URL
              </Button>
            )}
            {!report.published && (
              <Button
                onClick={async () => {
                  await updateReport(reportId, { published: true });
                  show("Report published");
                  await load();
                }}
              >
                <Send size={16} />
                Publish
              </Button>
            )}
            <Button onClick={download} disabled={busy}>
              <Download size={16} />
              {busy ? "Generating..." : "Download PDF"}
            </Button>
          </>
        }
      />
      {report.published && (
        <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Globe2 size={16} />
          <span className="min-w-0 truncate">{publicUrl}</span>
        </div>
      )}
      <div className="overflow-x-auto pb-10">
        <ReportPaper report={report} paperRef={paperRef} />
      </div>
    </>
  );
}
