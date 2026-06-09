import React, { useEffect, useState } from "react";
import axiosInstance from "@/API/axiosInstance";
import { Panel, StatusBadge } from "@/components/ui-kit";
import {
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const getFileServerUrl = () => {
  if (axiosInstance.defaults.baseURL) {
    const url = new URL(axiosInstance.defaults.baseURL);
    return url.origin;
  }
  return window.location.origin;
};

export default function AdminKyc() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [paginate, setPaginate] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [forceVerifyModal, setForceVerifyModal] = useState(false);
  const [forceVerifyDocId, setForceVerifyDocId] = useState(null);
  const [verificationWarnings, setVerificationWarnings] = useState([]);

  useEffect(() => {
    loadReviewQueue(page);
  }, [page]);

  const loadReviewQueue = async (currentPage = 1) => {
    try {
      setLoading(true);

      const res = await axiosInstance.post("/kyc/review-queue", {
        page: currentPage,
        limit: 10,
      });

      const queueData = res?.data?.data || {};
      const docs = queueData?.docs || res?.data?.docs || [];
      const paginateData = queueData?.paginate || res?.data?.paginate || {};

      setDocuments(Array.isArray(docs) ? docs : []);
      setPaginate({
        page: paginateData?.page || currentPage,
        limit: paginateData?.limit || 10,
        totalPages: paginateData?.totalPages || 1,
        totalRecords: paginateData?.totalRecords || 0,
        hasNextPage: paginateData?.hasNextPage || false,
        hasPrevPage: paginateData?.hasPrevPage || false,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load KYC queue");
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentDetails = async (documentId) => {
    try {
      setViewLoading(true);
      const res = await axiosInstance.get(`/kyc/review-queue/${documentId}`);
      setSelectedDoc(res?.data?.data || res?.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load document");
    } finally {
      setViewLoading(false);
    }
  };

  const verifyDocument = async (documentId) => {
    try {
      const res = await axiosInstance.patch(`/kyc/documents/${documentId}/verify`);

      const data = res?.data?.data || res?.data || {};

      if (data.requiresConfirmation && data.warnings && data.warnings.length > 0) {
        setForceVerifyDocId(documentId);
        setVerificationWarnings(data.warnings);
        setForceVerifyModal(true);
        return;
      }

      toast.success("Document verified");
      setSelectedDoc(null);
      loadReviewQueue(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    }
  };

  const forceVerifyDocument = async () => {
    try {
      await axiosInstance.patch(`/kyc/documents/${forceVerifyDocId}/verify`, { forceVerify: true });

      toast.success("Document force verified");
      setForceVerifyModal(false);
      setVerificationWarnings([]);
      setSelectedDoc(null);
      loadReviewQueue(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Force verification failed");
    }
  };

  const rejectDocument = async () => {
    try {
      if (!rejectReason.trim()) {
        toast.error("Please enter rejection reason");
        return;
      }

      await axiosInstance.patch(`/kyc/documents/${selectedDoc._id}/reject`, {
        rejectionReason: rejectReason,
      });

      toast.success("Document rejected");
      setRejectReason("");
      setRejectModal(false);
      setSelectedDoc(null);
      loadReviewQueue(page);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Rejection failed");
    }
  };

  const formatDocumentType = (type = "") =>
    type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <>
      <Panel className="overflow-hidden p-0 border border-border rounded-xl shadow-sm bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground tracking-tight">
                  Business Name
                </th>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground tracking-tight">
                  Document Type
                </th>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground tracking-tight">
                  Version
                </th>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground tracking-tight">
                  Created At
                </th>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground tracking-tight">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right font-semibold text-muted-foreground tracking-tight">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs font-medium">Fetching queue items...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <FileText className="w-8 h-8 opacity-40 mb-1" />
                      <p className="font-medium text-base">No KYC Documents Found</p>
                      <p className="text-xs max-w-xs opacity-70">
                        There are currently no items pending or queued for security verification
                        parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc._id}
                    className="hover:bg-muted/30 transition-colors duration-150 ease-in-out group"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {doc?.businessId?.businessName || "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDocumentType(doc.documentType)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border">
                        v{doc.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => loadDocumentDetails(doc._id)}
                        className="inline-flex h-8 w-8 rounded-lg border border-input items-center justify-center hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title="View Document"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3.5 bg-muted/20">
          <div className="text-xs font-medium text-muted-foreground">
            Total Records:{" "}
            <span className="text-foreground font-semibold">{paginate.totalRecords}</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-muted-foreground">
              Page <span className="text-foreground font-semibold">{paginate?.page}</span> of{" "}
              <span className="text-foreground font-semibold">{paginate?.totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-input bg-background text-foreground shadow-sm hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
                disabled={!paginate?.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                disabled={!paginate?.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-input bg-background text-foreground shadow-sm hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </Panel>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <DocumentPreviewModal
          selectedDoc={selectedDoc}
          viewLoading={viewLoading}
          onClose={() => setSelectedDoc(null)}
          onAccept={() => verifyDocument(selectedDoc._id)}
          onReject={() => setRejectModal(true)}
          formatDocumentType={formatDocumentType}
        />
      )}

      {/* Force Verify Modal */}
      {forceVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl p-6 w-full max-w-2xl shadow-xl border border-border max-h-[85vh] overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-3.5 mb-5 pb-4 border-b border-border/80">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground tracking-tight">
                    Data Mismatch Warnings
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The automated criteria detected critical variations between structural user
                    telemetry variables and OCR strings.
                  </p>
                </div>
              </div>

              {/* Warnings List */}
              <div className="space-y-3 mb-6">
                {verificationWarnings.map((warning, idx) => {
                  const formatValue = (val) => {
                    if (!val) return "—";
                    if (typeof val === "object") {
                      if (Array.isArray(val)) return val.join(", ");
                      return Object.values(val).filter(Boolean).join(", ");
                    }
                    return String(val);
                  };

                  return (
                    <div
                      key={idx}
                      className="border border-destructive/20 bg-destructive/5 rounded-xl p-4 transition-all"
                    >
                      <p className="font-semibold text-xs uppercase tracking-wider text-destructive mb-3">
                        {warning.field
                          .replace(/([A-Z])/g, " $1")
                          .replace(/_/g, " ")
                          .trim()
                          .replace(/^./, (s) => s.toUpperCase())}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-background/60 p-2.5 rounded-lg border border-border/40">
                          <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            Document Value
                          </span>
                          <span className="font-semibold text-foreground break-words">
                            {formatValue(warning.existingValue)}
                          </span>
                        </div>
                        <div className="bg-background/60 p-2.5 rounded-lg border border-border/40">
                          <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            Provided Value
                          </span>
                          <span className="font-semibold text-foreground break-words">
                            {formatValue(warning.submittedValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 justify-end pt-4 border-t border-border">
              <button
                onClick={() => {
                  setForceVerifyModal(false);
                  setVerificationWarnings([]);
                  setForceVerifyDocId(null);
                }}
                className="h-9 px-4 border border-input rounded-lg hover:bg-accent text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={forceVerifyDocument}
                className="h-9 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm"
              >
                Force Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <RejectModal
          onClose={() => setRejectModal(false)}
          onSubmit={rejectDocument}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
        />
      )}
    </>
  );
}

function DocumentPreviewModal({
  selectedDoc,
  viewLoading,
  onClose,
  onAccept,
  onReject,
  formatDocumentType,
}) {
  const ocrData = selectedDoc?.ocrExtractedData || {};
  const metaData = selectedDoc?.metaData || {};
  const fileUrl = selectedDoc?.fileUrl;

  const resolveFileUrl = (rawPath) => {
    if (!rawPath) return null;
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) return rawPath;
    const normalised = rawPath.replace(/\\/g, "/");
    const origin = getFileServerUrl();
    const uploadMatch = normalised.match(/(uploads\/.+)$/);
    const uploadPath = uploadMatch ? uploadMatch[1] : normalised;
    return `${origin}/${uploadPath}`;
  };

  const displayFileUrl = resolveFileUrl(fileUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border p-4 bg-muted/30 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight">
              {formatDocumentType(selectedDoc.documentType)}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Business:{" "}
              <span className="text-foreground font-medium">
                {selectedDoc?.businessId?.businessName}
              </span>{" "}
              | Uploaded by:{" "}
              <span className="text-foreground font-medium">
                {selectedDoc?.uploadedBy?.firstName} {selectedDoc?.uploadedBy?.lastName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-muted/5">
          {viewLoading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">
                Loading structural document configuration...
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 p-6">
              {/* PDF Viewer Section */}
              <div className="lg:col-span-2 flex flex-col justify-between">
                <div className="border border-border rounded-xl overflow-hidden bg-muted/30 h-[520px] flex items-center justify-center relative shadow-inner">
                  {displayFileUrl ? (
                    <iframe
                      src={displayFileUrl}
                      className="w-full h-full border-0"
                      title="Document Preview"
                      onError={(e) => console.error("iframe load error:", e)}
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center text-muted-foreground/60">
                      <FileText size={44} className="mx-auto mb-2.5 opacity-40" />
                      <p className="text-sm font-medium">No system preview asset accessible</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 border border-border/80 rounded-xl bg-background grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p className="truncate">
                    <span className="font-semibold text-foreground/80">File name:</span>{" "}
                    {selectedDoc?.fileName}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground/80">Capacity size:</span>{" "}
                    {(selectedDoc?.fileSize / 1024).toFixed(2)} KB
                  </p>
                  {displayFileUrl && (
                    <p className="text-[11px] font-mono break-all text-muted-foreground/70 col-span-1 sm:col-span-2 mt-1 pt-1.5 border-t border-border/40">
                      <span className="font-semibold text-foreground/70 font-sans">
                        Resolved path URI:
                      </span>{" "}
                      {displayFileUrl}
                    </p>
                  )}
                </div>
              </div>

              {/* Data Comparison Section */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                <div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Telemetry Key Verification
                  </h3>

                  {Object.keys(ocrData).length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(ocrData).map(([key, ocrValue]) => {
                        const metaValue = metaData[key];

                        const formatValue = (val) => {
                          if (!val) return "—";
                          if (typeof val === "object") {
                            if (Array.isArray(val)) return val.join(", ");
                            return Object.values(val).filter(Boolean).join(", ");
                          }
                          return String(val);
                        };

                        const ocrDisplay = formatValue(ocrValue);
                        const metaDisplay = formatValue(metaValue);
                        const hasMismatch = ocrValue && metaValue && ocrDisplay !== metaDisplay;

                        return (
                          <div
                            key={key}
                            className={`border rounded-xl p-3.5 shadow-sm transition-all ${
                              hasMismatch
                                ? "bg-red-50/40 border-red-200/80"
                                : "bg-emerald-50/20 border-emerald-200/60"
                            }`}
                          >
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>

                            <div className="mt-2.5 space-y-2 text-xs">
                              <div className="flex items-start justify-between gap-2 bg-background/50 p-1.5 rounded border border-border/40">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                                  OCR
                                </span>
                                <span className="font-medium text-foreground text-right break-all max-w-[70%]">
                                  {ocrDisplay}
                                </span>
                              </div>
                              <div className="flex items-start justify-between gap-2 bg-background/50 p-1.5 rounded border border-border/40">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                                  Provided
                                </span>
                                <span className="font-medium text-foreground text-right break-all max-w-[70%]">
                                  {metaDisplay}
                                </span>
                              </div>
                            </div>

                            {hasMismatch && (
                              <div className="mt-2 flex items-center gap-1.5 text-red-700">
                                <AlertCircle size={13} className="shrink-0" />
                                <span className="text-[11px] font-medium">
                                  Structural mismatch identified
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {Object.keys(ocrData).length === 0 && (
                    <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-xl">
                      No matching automated strings read.
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                <div className="border-t border-border pt-4 space-y-2 bg-muted/20 p-3 rounded-xl border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-muted-foreground">Queue State Status:</span>
                    <span className="font-semibold text-foreground">{selectedDoc.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-muted-foreground">
                      Active Lifecycle index:
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedDoc.isActive ? "True Active" : "False Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {selectedDoc?.status === "PENDING" && !viewLoading && (
          <div className="border-t border-border p-4 bg-muted/40 flex gap-2.5 justify-end">
            <button
              onClick={onReject}
              className="inline-flex items-center gap-1.5 px-4 h-9 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium transition-colors shadow-sm"
            >
              <X size={15} />
              Reject
            </button>
            <button
              onClick={onAccept}
              className="inline-flex items-center gap-1.5 px-4 h-9 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm"
            >
              <Check size={15} />
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RejectModal({ onClose, onSubmit, rejectReason, setRejectReason }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl p-5 w-full max-w-md shadow-xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-base text-foreground tracking-tight">Reject Document</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Please provide a specific logging parameter explanation justifying rejection criteria.
        </p>

        <textarea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter detailed reason description here..."
          className="w-full border border-input rounded-lg p-3 mt-4 text-sm bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none"
        />

        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-9 border border-input rounded-lg hover:bg-accent text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 h-9 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium transition-colors shadow-sm"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
