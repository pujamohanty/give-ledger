"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, DollarSign, FileText, Zap } from "lucide-react";

export type DisbursementItem = {
  id: string;
  ngoName: string;
  projectTitle: string;
  milestoneName: string;
  requestedAmount: number;
  approvedAmount: number | null;
  status: string;
  txHash: string | null;
  createdAt: Date;
  narrative: string | null;
  evidenceFiles: { fileName: string; url: string }[];
  outputMarkers: { label: string; value: string; unit: string | null }[];
};

export default function DisbursementsClient({
  initialDisbursements,
}: {
  initialDisbursements: DisbursementItem[];
}) {
  const disbursements = initialDisbursements;
  const totalReleased = disbursements.reduce((s, d) => s + (d.approvedAmount ?? d.requestedAmount), 0);

  function timeLabel(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Disbursement Log</h1>
        <p className="text-gray-500 text-sm mt-1">
          All fund releases are automatic upon milestone completion. This is a read-only audit log.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">${totalReleased.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Released</p>
              <p className="text-xs text-gray-400">all time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{disbursements.length}</p>
              <p className="text-xs text-gray-500">Disbursements</p>
              <p className="text-xs text-gray-400">all time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">Auto</p>
              <p className="text-xs text-gray-500">Release Mode</p>
              <p className="text-xs text-gray-400">on milestone completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log */}
      {disbursements.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No disbursements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disbursements.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="font-semibold text-gray-900 text-sm">{d.ngoName}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500 truncate">{d.milestoneName}</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-6 mb-2">{d.projectTitle}</p>

                    {d.narrative && (
                      <div className="ml-6 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                        <p className="text-xs text-gray-600 line-clamp-2">{d.narrative}</p>
                      </div>
                    )}

                    {d.outputMarkers.length > 0 && (
                      <div className="ml-6 flex flex-wrap gap-1.5 mb-2">
                        {d.outputMarkers.map((m) => (
                          <span
                            key={m.label}
                            className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
                          >
                            {m.value} {m.unit ?? ""} {m.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {d.evidenceFiles.length > 0 && (
                      <div className="ml-6 flex flex-wrap gap-1.5 mb-2">
                        {d.evidenceFiles.map((file) => (
                          <span
                            key={file.fileName}
                            className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-500"
                          >
                            <FileText className="w-3 h-3" />
                            {file.fileName}
                          </span>
                        ))}
                      </div>
                    )}

                    {d.txHash && (
                      <a
                        href={`https://polygonscan.com/tx/${d.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-6 text-xs text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <span className="font-mono truncate max-w-xs">{d.txHash}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-emerald-700">
                      ${(d.approvedAmount ?? d.requestedAmount).toLocaleString()}
                    </p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Auto-released
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{timeLabel(d.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
