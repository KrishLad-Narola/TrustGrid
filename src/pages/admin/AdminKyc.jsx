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
      const res = await axiosInstance.patch(
        `/kyc/documents/${documentId}/verify`
      );

      // Check if response contains warnings and requiresConfirmation
      const data = res?.data?.data || res?.data || {};

      if (
        data.requiresConfirmation &&
        data.warnings &&
        data.warnings.length > 0
      ) {
        // Show warning modal instead of approving directly
        setForceVerifyDocId(documentId);
        setVerificationWarnings(data.warnings);
        setForceVerifyModal(true);
        return;
      }

      // No warnings, approve directly
      toast.success("Document verified");
      setSelectedDoc(null);
      loadReviewQueue(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    }
  };

  const forceVerifyDocument = async () => {
    try {
      await axiosInstance.patch(
        `/kyc/documents/${forceVerifyDocId}/verify`,
        { forceVerify: true }
      );

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

      await axiosInstance.patch(
        `/kyc/documents/${selectedDoc._id}/reject`,
        { rejectionReason: rejectReason }
      );

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
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Business Name</th>
                <th className="px-4 py-3 text-left">Document Type</th>
                <th className="px-4 py-3 text-left">Version</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    No KYC Documents Found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc._id}
                    className="border-b hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-4">
                      {doc?.businessId?.businessName || "-"}
                    </td>
                    <td className="px-4 py-4">
                      {formatDocumentType(doc.documentType)}
                    </td>
                    <td className="px-4 py-4">v{doc.version}</td>
                    <td className="px-4 py-4">
                      {new Date(doc.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => loadDocumentDetails(doc._id)}
                        className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors"
                        title="View Document"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t p-4 bg-muted/10">
          <div className="text-sm text-muted-foreground">
            Total Records: {paginate.totalRecords}
          </div>

          <div className="flex items-center gap-4">
            <button
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!paginate?.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-medium">
              Page {paginate?.page} of {paginate?.totalPages}
            </span>

            <button
              disabled={!paginate?.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:cursor-not-allowed disabled:opacity-50"
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold">Data Mismatch Warnings</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The following fields have mismatches between the document and provided data:
                </p>
              </div>
            </div>

            {/* Warnings List */}
            <div className="space-y-3 mb-6">
              {verificationWarnings.map((warning, idx) => {
                // Helper to convert values to displayable strings
                const formatValue = (val) => {
                  if (!val) return "—";
                  if (typeof val === "object") {
                    // If it's an object, show it as comma-separated values
                    if (Array.isArray(val)) return val.join(", ");
                    return Object.values(val)
                      .filter(Boolean)
                      .join(", ");
                  }
                  return String(val);
                };

                return (
                  <div
                    key={idx}
                    className="border border-red-200 bg-red-50 rounded-lg p-4"
                  >
                    <p className="font-semibold text-sm text-red-900 mb-2">
                      {warning.field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/_/g, " ")
                        .trim()
                        .replace(/^./, (s) => s.toUpperCase())}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Document Value:{" "}
                        </span>
                        <span className="font-medium text-red-700 break-words">
                          {formatValue(warning.existingValue)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Provided Value:{" "}
                        </span>
                        <span className="font-medium text-red-700 break-words">
                          {formatValue(warning.submittedValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setForceVerifyModal(false);
                  setVerificationWarnings([]);
                  setForceVerifyDocId(null);
                }}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                back
              </button>
              <button
                onClick={forceVerifyDocument}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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

  // Build correct file URL with proper server origin
  const resolveFileUrl = (rawPath) => {
    if (!rawPath) return null;
    // Already a full URL
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://"))
      return rawPath;
    // Normalise Windows-style backslashes
    const normalised = rawPath.replace(/\\/g, "/");
    // Get file server origin (not API baseURL)
    const origin = getFileServerUrl();
    // Files are at /uploads/filename, extract just that part
    // If path is "public/uploads/file.pdf" → use "/uploads/file.pdf"
    // If path is "uploads/file.pdf" → use "/uploads/file.pdf"
    const uploadMatch = normalised.match(/(uploads\/.+)$/);
    const uploadPath = uploadMatch ? uploadMatch[1] : normalised;
    return `${origin}/${uploadPath}`;
  };

  const displayFileUrl = resolveFileUrl(fileUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b p-4 bg-muted/30 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {formatDocumentType(selectedDoc.documentType)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Business: {selectedDoc?.businessId?.businessName} | Uploaded by:{" "}
              {selectedDoc?.uploadedBy?.firstName}{" "}
              {selectedDoc?.uploadedBy?.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 p-6">
              {/* PDF Viewer Section */}
              <div className="lg:col-span-2">
                <div className="border rounded-lg overflow-hidden bg-muted/20 h-[500px] flex items-center justify-center relative">
                  {displayFileUrl ? (
                    <>
                      <iframe
                        src={displayFileUrl}
                        className="w-full h-full border-0"
                        title="Document Preview"
                        onError={(e) => {
                          console.error("iframe load error:", e);
                        }}
                        allowFullScreen
                      />
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <FileText size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No document available</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">File:</span> {selectedDoc?.fileName}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span>{" "}
                    {(selectedDoc?.fileSize / 1024).toFixed(2)} KB
                  </p>
                  {displayFileUrl && (
                    <p className="text-[11px] break-all text-slate-400 mt-2">
                      <span className="font-medium">URL:</span> {displayFileUrl}
                    </p>
                  )}
                </div>
              </div>

              {/* Data Comparison Section */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-foreground">
                    Data Verification
                  </h3>

                  {/* Check if there are any mismatches */}
                  {Object.keys(ocrData).length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(ocrData).map(([key, ocrValue]) => {
                        const metaValue = metaData[key];
                        
                        // Helper to convert values to displayable strings
                        const formatValue = (val) => {
                          if (!val) return "—";
                          if (typeof val === "object") {
                            // If it's an object, show it as JSON or comma-separated values
                            if (Array.isArray(val)) return val.join(", ");
                            return Object.values(val).filter(Boolean).join(", ");
                          }
                          return String(val);
                        };
                        
                        const ocrDisplay = formatValue(ocrValue);
                        const metaDisplay = formatValue(metaValue);
                        const hasMismatch =
                          ocrValue &&
                          metaValue &&
                          ocrDisplay !== metaDisplay;

                        return (
                          <div
                            key={key}
                            className={`border rounded-lg p-3 ${
                              hasMismatch ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                            }`}
                          >
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>

                            <div className="mt-2 space-y-1 text-xs">
                              <div>
                                <span className="text-muted-foreground">OCR: </span>
                                <span className="font-medium break-words">
                                  {ocrDisplay}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Provided:{" "}
                                </span>
                                <span className="font-medium break-words">
                                  {metaDisplay}
                                </span>
                              </div>
                            </div>

                            {hasMismatch && (
                              <div className="mt-2 flex items-center gap-1 text-red-700">
                                <AlertCircle size={12} />
                                <span className="text-xs font-medium">
                                  Mismatch detected
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {Object.keys(ocrData).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No OCR data extracted
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                <div className="border-t pt-3 mt-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">Status:</span>{" "}
                    {selectedDoc.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Active:</span>{" "}
                    {selectedDoc.isActive ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {selectedDoc?.status === "PENDING" && !viewLoading && (
          <div className="border-t p-4 bg-muted/20 flex gap-3 justify-end">
            <button
              onClick={onReject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <X size={16} />
              Reject
            </button>
            <button
              onClick={onAccept}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Check size={16} />
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RejectModal({
  onClose,
  onSubmit,
  rejectReason,
  setRejectReason,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl p-6 w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-lg">Reject Document</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Please provide a reason for rejecting this document.
        </p>

        <textarea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full border rounded-lg p-3 mt-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}