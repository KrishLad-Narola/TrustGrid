import React, { useEffect, useState } from "react";
import axiosInstance from "@/API/axiosInstance";
import { Panel, StatusBadge } from "@/components/ui-kit";
import { Check, X, ChevronDown, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminKyc() {
  const [expanded, setExpanded] = useState(null);
  const [reject, setReject] = useState(null);
  const [kycDocuments, setKycDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const loadReviewQueue = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/kyc/review-queue");

      console.log("KYC Response:", res?.data);

      setKycDocuments(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to load KYC queue:", error);
      toast.error("Failed to load KYC documents");
      setKycDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() => toast.success("Bulk approved documents")}
          className="btn-ghost text-sm cursor-pointer border-success/20 text-success"
        >
          <Check className="size-4" /> Approve all
        </button>

        <button
          type="button"
          onClick={() => toast.error("Bulk rejected documents")}
          className="btn-ghost text-sm border-destructive/20 text-destructive"
        >
          <X className="size-4" /> Reject all
        </button>
      </div>

      <Panel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
            <tr>
              <th className="px-5 py-3 font-medium">Business</th>
              <th className="px-5 py-3 font-medium">Document</th>
              <th className="px-5 py-3 font-medium">Uploaded</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : kycDocuments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  No KYC documents found
                </td>
              </tr>
            ) : (
              kycDocuments.map((d) => (
                <React.Fragment key={d._id}>
                  <tr className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.03]">
                    <td className="px-5 py-4 font-medium">
                      {d?.businessId?.legalName ||
                        d?.businessId?.tradeName ||
                        "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      {d.documentType}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={d.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            toast.success("Document approved")
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-success/15 text-success text-xs hover:bg-success/25"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setReject(d._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-danger/15 text-danger text-xs hover:bg-danger/25"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            setExpanded(
                              expanded === d._id ? null : d._id
                            )
                          }
                          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-900/[0.03]"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition ${
                              expanded === d._id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expanded === d._id && (
                    <tr className="bg-slate-900/[0.02]">
                      <td colSpan={5} className="px-5 py-5">
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="rounded-xl border border-border bg-muted/30 p-4 h-56 grid place-items-center">
                            <div className="text-center">
                              <FileText className="size-12 text-primary mx-auto mb-2 opacity-60" />

                              <div className="text-sm">
                                {d.documentType}
                              </div>

                              <div className="text-xs text-muted-foreground mt-1">
                                Document Preview
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">
                              Document Details
                            </div>

                            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                              <div className="flex justify-between border-b border-slate-900/[0.06] pb-2">
                                <span className="text-muted-foreground">
                                  Business
                                </span>

                                <span className="font-mono">
                                  {d?.businessId?.legalName ||
                                    d?.businessId?.tradeName ||
                                    "N/A"}
                                </span>
                              </div>

                              <div className="flex justify-between border-b border-slate-900/[0.06] pb-2">
                                <span className="text-muted-foreground">
                                  Document Type
                                </span>

                                <span className="font-mono">
                                  {d.documentType}
                                </span>
                              </div>

                              <div className="flex justify-between border-b border-slate-900/[0.06] pb-2">
                                <span className="text-muted-foreground">
                                  Status
                                </span>

                                <span className="font-mono">
                                  {d.status}
                                </span>
                              </div>

                              <div className="flex justify-between border-b border-slate-900/[0.06] pb-2">
                                <span className="text-muted-foreground">
                                  Version
                                </span>

                                <span className="font-mono">
                                  {d.version}
                                </span>
                              </div>

                              <div className="flex justify-between border-b border-slate-900/[0.06] pb-2">
                                <span className="text-muted-foreground">
                                  Active
                                </span>

                                <span className="font-mono">
                                  {d.isActive ? "Yes" : "No"}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Uploaded On
                                </span>

                                <span className="font-mono">
                                  {d.createdAt
                                    ? new Date(
                                        d.createdAt
                                      ).toLocaleString()
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </Panel>

      {reject && (
        <RejectModal onClose={() => setReject(null)} />
      )}
    </>
  );
}

function RejectModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md p-6"
      >
        <h3 className="font-display text-xl font-semibold">
          Reject document
        </h3>

        <p className="text-sm text-muted-foreground mt-1">
          Provide a reason — the business will be notified.
        </p>

        <div className="mt-4 space-y-3">
          <select className="w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08]">
            {[
              "Illegible scan",
              "Expired document",
              "Mismatched details",
              "Suspected forgery",
              "Other",
            ].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>

          <textarea
            rows={3}
            placeholder="Additional notes..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08]"
          />

          <button
            onClick={() => {
              toast.error("Document rejected");
              onClose();
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-medium"
          >
            Submit rejection
          </button>
        </div>
      </div>
    </div>
  );
}