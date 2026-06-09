import { useState, useRef, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Check,
  ArrowLeft,
  ArrowRight,
  X,
  Loader2,
  FileText,
  ShieldCheck,
  ScanLine,
  AlertCircle,
  ChevronRight,
  File,
  Eye,
  LogOut,
  XCircle,
} from "lucide-react";
import axiosInstance from "@/API/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const DOCUMENT_OPTIONS = [
  {
    key: "GST_CERTIFICATE",
    label: "GST Certificate",
    description: "Certificate of GST registration from GSTN portal",
    icon: ShieldCheck,
    accent: "#2563EB",
  },
  {
    key: "PAN_CARD",
    label: "PAN Card",
    description: "Permanent Account Number card issued by Income Tax Dept.",
    icon: FileText,
    accent: "#7C3AED",
  },
  {
    key: "INCORPORATION_CERTIFICATE",
    label: "Incorporation Certificate",
    description: "Certificate of incorporation from Ministry of Corporate Affairs",
    icon: File,
    accent: "#0891B2",
  },
  {
    key: "BANK_PROOF",
    label: "Bank Proof",
    description: "Cancelled cheque or bank statement (last 3 months)",
    icon: ScanLine,
    accent: "#059669",
  },
];

const ACCEPTED = [".pdf", ".png", ".jpg", ".jpeg"];

function bytesToHuman(b) {
  if (!b && b !== 0) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

// Convert backslash server paths to a proper URL
function resolveFileUrl(rawPath) {
  if (!rawPath) return null;
  // Already a full URL
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) return rawPath;
  // Normalise Windows-style backslashes
  const normalised = rawPath.replace(/\\/g, "/");
  // Prepend base API origin if it's a relative server path
  const base = import.meta?.env?.VITE_API_BASE_URL || "";
  return `${base}/${normalised}`;
}

// ── Document Preview ──────────────────────────────────────────────────────────
function DocumentPreview({ file, previewUrl, serverUrl, onRemove, fileName }) {
  // console.log(fileName)
  // console.log(serverUrl)

  // const url = ` http://192.168.100.149:3000/uploads/${fileName}`;
  const url = previewUrl || (fileName ? `http://192.168.100.149:3000/uploads/${fileName}` : null);
  // console.log(url)
  if (!url) return null;

  // Determine type: prefer the File object, fall back to URL extension
  const isPdf = file ? file.type === "application/pdf" : url?.toLowerCase().endsWith(".pdf");

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Document Preview</span>
        </div>
        <div className="flex items-center gap-3">
          {file && (
            <span className="text-[11px] text-slate-400">
              {file.name} · {bytesToHuman(file.size)}
            </span>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 transition"
            >
              <X className="h-3 w-3" /> Replace
            </button>
          )}
        </div>
      </div>
      <div className="bg-slate-100 flex items-center justify-center" style={{ minHeight: 220 }}>
        {isPdf ? (
          <iframe
            src={url}
            title="PDF Preview"
            className="w-full"
            style={{ height: 340, border: "none" }}
          />
        ) : (
          <img
            src={url}
            alt="Document preview"
            className="max-h-72 max-w-full object-contain rounded"
            style={{ padding: 12 }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Rejection Banner ──────────────────────────────────────────────────────────
function RejectionBanner({ reason }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-5">
      <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-red-700 mb-0.5">Document Rejected</p>
        <p className="text-xs text-red-600 leading-relaxed">
          {reason || "This document was rejected. Please re-upload a clearer version."}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function KycSubmitPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const blobUrlsRef = useRef({}); // track blob URL so we can revoke it
  const { logout } = useAuth();
  // Per-document state stored as a map keyed by doc.key so switching docs
  // preserves each document's individual state.
  const [docStates, setDocStates] = useState({});
  // docStates[key] = {
  //   step: 0 | 1,
  //   temporaryUploadId: string | null,
  //   extractedData: object | null,
  //   selectedFile: File | null,
  //   previewUrl: string | null,   ← blob URL (freshly uploaded)
  //   serverFileUrl: string | null ← URL from API (already submitted)
  //   serverFileName: string | null
  //   serverFileSize: number | null
  // }

  const [docIndex, setDocIndex] = useState(0);
  const [completedDocs, setCompletedDocs] = useState([]); // keys of successfully submitted docs
  const [rejectedDocs, setRejectedDocs] = useState({}); // { key: rejectionReason }
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const currentDoc = DOCUMENT_OPTIONS[docIndex];
  const currentState = docStates[currentDoc?.key] ?? { step: 0 };
  const isRejected = !!rejectedDocs[currentDoc?.key];
  // console.log(currentState)
  // Derived helpers
  const docStep = currentState.step ?? 0;
  const extractedData = currentState.extractedData ?? null;
  const selectedFile = currentState.selectedFile ?? null;
  const previewUrl = blobUrlsRef.current[currentDoc?.key] ?? null;
  const serverFileUrl = currentState.serverFileUrl ?? null;
  const serverFileName = currentState.serverFileName ?? null;
  // const serverFileName = currentState.serverFileName ?? null;
  const serverFileSize = currentState.serverFileSize ?? null;
  const temporaryUploadId = currentState.temporaryUploadId ?? null;

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach(URL.revokeObjectURL);
    };
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/kyc");
        const docs = res?.data?.data?.documents || res?.data?.documents || [];

        const submitted = [];
        const rejected = {};
        const initialDocStates = {};

        docs.forEach((d) => {
          if (d.status === "REJECTED") {
            rejected[d.type] = d.rejectionReason || "Document was rejected.";
          } else if (d.isUploaded) {
            submitted.push(d.type);
          }

          // For any uploaded doc (submitted OR rejected that has a file),
          // pre-populate its state so the user can see what was uploaded.
          if (d.isUploaded && d.file?.url) {
            const metaData = d.metaData || d.ocrExtractedData || {};
            initialDocStates[d.type] = {
              // Already submitted (not rejected) → land on review step.
              // Rejected → land on upload step so user re-uploads.
              step: d.status === "REJECTED" ? 0 : 1,
              temporaryUploadId: null, // already finalised on server
              extractedData: metaData,
              selectedFile: null,
              previewUrl: null,
              serverFileUrl: resolveFileUrl(d.file.url),
              serverFileName: d.file.name || null,
              serverFileSize: d.file.size || null,
            };
          }
        });

        setCompletedDocs(submitted);
        setRejectedDocs(rejected);
        setDocStates(initialDocStates);

        // Navigate to the first incomplete/rejected doc
        const next = DOCUMENT_OPTIONS.findIndex((d) => !submitted.includes(d.key));
        setDocIndex(next !== -1 ? next : 0);
      } catch {
        toast.error("Failed to load KYC status");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateCurrentDocState = useCallback((key, patch) => {
    setDocStates((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { step: 0 }), ...patch },
    }));
  }, []);

  const formatLabel = (key) =>
    key
      .split(".")
      .map((k) =>
        k
          .replace(/([A-Z])/g, " $1")
          .replace(/_/g, " ")
          .trim()
          .replace(/^./, (s) => s.toUpperCase()),
      )
      .join(" › ");

  const flattenObject = (obj, prefix = "") => {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value))
        return flattenObject(value, fullKey);
      return [[fullKey, value]];
    });
  };

  const setNestedValue = (obj, path, value) => {
    const keys = path.split(".");
    const updated = { ...obj };
    let ref = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      ref[keys[i]] = { ...ref[keys[i]] };
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = value;
    return updated;
  };

  const resetDocToUpload = () => {
    // Revoke any blob URL for this doc
    if (blobUrlsRef.current[currentDoc.key]) {
      URL.revokeObjectURL(blobUrlsRef.current[currentDoc.key]);
      delete blobUrlsRef.current[currentDoc.key];
    }
    updateCurrentDocState(currentDoc.key, {
      step: 0,
      temporaryUploadId: null,
      extractedData: null,
      selectedFile: null,
      previewUrl: null,
      // Keep serverFileUrl so previous preview is still accessible if needed
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── File processing ───────────────────────────────────────────────────────
  const processFile = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum allowed size is 10 MB." });
      return;
    }
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Unsupported format", { description: "Upload a PDF, PNG, or JPG file." });
      return;
    }

    // Create blob preview URL
    if (blobUrlsRef.current[currentDoc.key])
      URL.revokeObjectURL(blobUrlsRef.current[currentDoc.key]);
    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current[currentDoc.key] = blobUrl;

    // Optimistically set the file & preview so UI updates immediately
    updateCurrentDocState(currentDoc.key, {
      selectedFile: file,
      // previewUrl: blobUrl,
    });

    try {
      setExtracting(true);
      const fd = new FormData();
      fd.append("document", file);
      fd.append("type", currentDoc.key);
      const res = await axiosInstance.post("/kyc/documents/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res?.data?.data || res?.data || {};
      updateCurrentDocState(currentDoc.key, {
        step: 1,
        temporaryUploadId: data.temporaryUploadId ?? null,
        extractedData: data.extractedData || {},
        selectedFile: file,
        // previewUrl: blobUrl,
      });
      toast.success("Extraction complete", { description: "Review the fields below." });
    } catch (err) {
      // Clear file state on failure
      URL.revokeObjectURL(blobUrl);
      objectUrlRef.current = null;
      updateCurrentDocState(currentDoc.key, {
        selectedFile: null,
        previewUrl: null,
      });
      toast.error(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Snapshot values from current state to avoid stale closure issues
    const snapIndex = docIndex;
    const snapDoc = DOCUMENT_OPTIONS[snapIndex];
    const snapState = docStates[snapDoc.key] ?? {};
    const snapIsLast = snapIndex === DOCUMENT_OPTIONS.length - 1;

    try {
      setSubmitting(true);

      // If temporaryUploadId is null it means this is a previously-submitted doc
      // being re-confirmed (e.g. after navigating away and back). Guard the call.
      if (!snapState.temporaryUploadId) {
        // Nothing new was uploaded – just move forward
        if (snapIsLast) {
          navigate("/kyc-complete");
        } else {
          setDocIndex(snapIndex + 1);
        }
        return;
      }

      await axiosInstance.post("/kyc/documents", {
        temporaryUploadId: snapState.temporaryUploadId,
        metaData: snapState.extractedData,
      });

      // Update completed list using functional updater to avoid stale closure
      setCompletedDocs((prev) => {
        if (prev.includes(snapDoc.key)) return prev;
        return [...prev, snapDoc.key];
      });

      // Clear rejection status on successful resubmit
      setRejectedDocs((prev) => {
        if (!prev[snapDoc.key]) return prev;
        const next = { ...prev };
        delete next[snapDoc.key];
        return next;
      });

      // Mark this doc as finalised in docStates (clear temporaryUploadId so
      // a back-navigation doesn't try to re-submit the same temp ID)
      setDocStates((prev) => ({
        ...prev,
        [snapDoc.key]: {
          ...(prev[snapDoc.key] ?? {}),
          step: 1,
          temporaryUploadId: null,
        },
      }));

      toast.success(`${snapDoc.label} submitted successfully`);

      if (snapIsLast) {
        navigate("/kyc-complete");
      } else {
        // Move to next doc — reset input ref
        if (fileInputRef.current) fileInputRef.current.value = "";
        setDocIndex(snapIndex + 1);
      }
    } catch (err) {
      // Toast already handled by axios interceptor
      console.error("Document submission failed:", err);

      return;
    } finally {
      setSubmitting(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
  };

  // ── Nav helpers ───────────────────────────────────────────────────────────
  const handleSidebarDocClick = (i) => {
    const doc = DOCUMENT_OPTIONS[i];
    const state = docStates[doc.key];
    // Revoke current blob URL if switching away
    if (i !== docIndex && blobUrlsRef.current[doc.key]) {
      // Don't revoke — keep it alive so returning to the doc still shows preview
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDocIndex(i);
  };
  // ── Derived values ────────────────────────────────────────────────────────
  const flatFields = extractedData ? flattenObject(extractedData) : [];
  const completedCount = completedDocs.length;
  const progressPct = (completedCount / DOCUMENT_OPTIONS.length) * 100;

  // console.log(flattenObject(extractedData))
  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading verification status…</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-5xl flex gap-6">
        {/* ── Sidebar ── */}
        <aside className="w-64 shrink-0">
          {/* Header + logout */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-blue-600 grid place-items-center">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-800">KYC Verification</span>
              </div>
              <p className="text-xs text-slate-400 pl-9">Business identity check</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="h-8 w-8 rounded-lg grid place-items-center text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Overall progress</span>
              <span className="text-xs font-semibold text-blue-600">
                {completedCount}/{DOCUMENT_OPTIONS.length}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {DOCUMENT_OPTIONS.length - completedCount} document
              {DOCUMENT_OPTIONS.length - completedCount !== 1 ? "s" : ""} remaining
            </p>
          </div>

          {/* Document nav */}
          <nav className="flex flex-col gap-1">
            {DOCUMENT_OPTIONS.map((doc, i) => {
              const isDone = completedDocs.includes(doc.key);
              const isRej = !!rejectedDocs[doc.key];
              const isCurrent = i === docIndex;
              const DocIcon = doc.icon;
              // Accessible if done, rejected, or at/before current index
              const isAccessible = isDone || isRej || i <= docIndex;

              return (
                <button
                  key={doc.key}
                  onClick={() => {
                    if (isAccessible) handleSidebarDocClick(i);
                  }}
                  disabled={!isAccessible}
                  className={`w-full text-left rounded-xl px-3 py-3 flex items-center gap-3 transition-all
                    ${
                      isCurrent
                        ? "bg-blue-50 border border-blue-200/80"
                        : "hover:bg-slate-50 border border-transparent"
                    }
                    ${!isAccessible ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div
                    className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 transition-all
                    ${isDone ? "bg-emerald-500" : isRej ? "bg-red-500" : isCurrent ? "bg-blue-600" : "bg-slate-100"}
                  `}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : isRej ? (
                      <XCircle className="h-4 w-4 text-white" />
                    ) : (
                      <DocIcon
                        className={`h-4 w-4 ${isCurrent ? "text-white" : "text-slate-400"}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate leading-snug
                      ${isCurrent ? "text-blue-700" : isDone ? "text-slate-600" : isRej ? "text-red-600" : "text-slate-500"}
                    `}
                    >
                      {doc.label}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 truncate
                      ${isDone ? "text-emerald-600" : isRej ? "text-red-500" : isCurrent ? "text-blue-500" : "text-slate-400"}
                    `}
                    >
                      {isDone
                        ? "Submitted"
                        : isRej
                          ? "Rejected"
                          : isCurrent
                            ? "In progress"
                            : "Pending"}
                    </p>
                  </div>
                  {isCurrent && !isDone && (
                    <ChevronRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Info callout */}
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200/70 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                All documents are encrypted and processed securely. Verification typically takes
                under 24 hours.
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-xl grid place-items-center shrink-0"
                    style={{ backgroundColor: `${currentDoc.accent}15` }}
                  >
                    {(() => {
                      const Icon = currentDoc.icon;
                      return <Icon className="h-5 w-5" style={{ color: currentDoc.accent }} />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg font-semibold text-slate-900">{currentDoc.label}</h1>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 tracking-wide uppercase">
                        {docIndex + 1} of {DOCUMENT_OPTIONS.length}
                      </span>
                      {isRejected && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 tracking-wide uppercase">
                          Rejected
                        </span>
                      )}
                      {completedDocs.includes(currentDoc.key) && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 tracking-wide uppercase">
                          Submitted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{currentDoc.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="h-8 w-8 rounded-lg grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-3 mt-5">
                {["Upload document", "Review & confirm"].map((label, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-semibold transition
                        ${
                          docStep === i
                            ? "bg-blue-600 text-white"
                            : docStep > i
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-400"
                        }
                      `}
                    >
                      {docStep > i ? <Check className="h-3 w-3" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs ${docStep === i ? "text-slate-800 font-medium" : "text-slate-400"}`}
                    >
                      {label}
                    </span>
                    {i < 1 && (
                      <div
                        className={`w-8 h-px mx-1 ${docStep > 0 ? "bg-emerald-300" : "bg-slate-200"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Card body */}
            <div className="px-8 py-6">
              {/* ── Step 0: Upload ── */}
              {docStep === 0 && !extracting && (
                <>
                  {isRejected && <RejectionBanner reason={rejectedDocs[currentDoc.key]} />}

                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept={ACCEPTED.join(",")}
                    onChange={handleFileChange}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`group relative rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-all
                      ${
                        dragOver
                          ? "border-blue-400 bg-blue-50/60"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/60"
                      }
                    `}
                  >
                    <div
                      className={`h-16 w-16 rounded-2xl grid place-items-center mb-5 transition-all
                      ${dragOver ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-50"}
                    `}
                    >
                      <UploadCloud
                        className={`h-7 w-7 transition-all
                        ${dragOver ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}
                      `}
                      />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">
                      {dragOver ? "Drop it here" : "Drop file or click to browse"}
                    </p>
                    <p className="text-sm text-slate-400">PDF, PNG, JPG — max 10 MB</p>
                    <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100 w-full justify-center">
                      {["PDF", "PNG", "JPG"].map((fmt) => (
                        <div key={fmt} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <FileText className="h-3.5 w-3.5" />
                          {fmt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Files are end-to-end encrypted. Never shared without your consent.
                  </div>
                </>
              )}

              {/* ── Extracting spinner ── */}
              {extracting && (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-blue-50 grid place-items-center">
                      <ScanLine className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white border-2 border-blue-200 grid place-items-center">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">
                    Processing document
                  </h3>
                  <p className="text-sm text-slate-400 text-center max-w-xs leading-relaxed">
                    Our OCR engine is extracting and verifying data from your document…
                  </p>
                  {selectedFile && (
                    <div className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {bytesToHuman(selectedFile.size)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 1: Review ── */}
              {docStep === 1 && !submitting && (
                <>
                  {/* Document preview — show blob URL (fresh upload) or server URL (returning user) */}
                  {(previewUrl || serverFileUrl) && (
                    <DocumentPreview
                      file={selectedFile}
                      fileName={serverFileName}
                      previewUrl={previewUrl}
                      serverUrl={serverFileUrl}
                      onRemove={
                        // Only allow replace if this is a fresh upload with a temporaryUploadId
                        temporaryUploadId ? resetDocToUpload : undefined
                      }
                    />
                  )}

                  {/* Returning user: show file info badge when we only have server info */}
                  {!previewUrl && !serverFileUrl && serverFileName && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500 grid place-items-center shrink-0">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-emerald-800 truncate">
                          {serverFileName}
                        </p>
                        <p className="text-[11px] text-emerald-600">
                          {bytesToHuman(serverFileSize)} · Previously uploaded
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Editable extracted fields */}
                  {flatFields.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-slate-800">
                          Extracted information
                        </h2>
                        <span className="text-[11px] text-slate-400">
                          {flatFields.length} fields detected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {flatFields.map(([path, value]) => (
                          <div key={path} className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-500 tracking-wide">
                              {formatLabel(path)}
                            </label>
                            <input
                              disabled={!temporaryUploadId}
                              type="text"
                              value={value ?? ""}
                              onChange={(e) =>
                                updateCurrentDocState(currentDoc.key, {
                                  extractedData: setNestedValue(
                                    extractedData,
                                    path,
                                    e.target.value,
                                  ),
                                })
                              }
                              className={`h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400`}
                              placeholder="—"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/70">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Please review all extracted fields carefully. Incorrect data may delay
                          verification.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 grid place-items-center mb-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Document uploaded</p>
                      <p className="text-xs text-slate-400">
                        No extracted fields to review for this document type.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── Submitting spinner ── */}
              {submitting && (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-blue-50 grid place-items-center mb-5">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">
                    Submitting {currentDoc.label}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Saving securely to your compliance profile…
                  </p>
                </div>
              )}
            </div>

            {/* Card footer */}
            {!extracting && !submitting && (
              <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                {/* Left: Back / Re-upload */}
                <button
                  onClick={docStep === 1 ? resetDocToUpload : () => navigate(-1)}
                  className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {docStep === 1 ? "Re-upload" : "Back"}
                </button>

                {/* Right: Select file / Submit */}
                {docStep === 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-200"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Select file
                  </button>
                )}

                {docStep === 1 && (
                  <button
                    onClick={handleSubmit}
                    className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-200"
                  >
                    {docIndex === DOCUMENT_OPTIONS.length - 1
                      ? "Submit & finish"
                      : "Submit & continue"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
