import { useState, useRef, useEffect } from "react";
import {
  UploadCloud, Check, ArrowLeft, ArrowRight, X,
  Loader2, FileText, ShieldCheck, ScanLine, AlertCircle,
  ChevronRight, File,
} from "lucide-react";
import axiosInstance from "@/API/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export default function KycSubmitPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [docIndex, setDocIndex] = useState(0);
  const [docStep, setDocStep] = useState(0); // 0 = upload, 1 = review
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [temporaryUploadId, setTemporaryUploadId] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [completedDocs, setCompletedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const currentDoc = DOCUMENT_OPTIONS[docIndex];
  const isLastDoc = docIndex === DOCUMENT_OPTIONS.length - 1;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/kyc");
        const docs = res?.data?.data?.documents || res?.data?.documents || [];
        const submitted = docs.filter(d => d.isUploaded).map(d => d.type);
        setCompletedDocs(submitted);
        const next = DOCUMENT_OPTIONS.findIndex(d => !submitted.includes(d.key));
        setDocIndex(next !== -1 ? next : 0);
      } catch {
        toast.error("Failed to load KYC status");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatLabel = (key) =>
    key.split(".").map(k =>
      k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()
        .replace(/^./, s => s.toUpperCase())
    ).join(" › ");

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

  const resetDoc = () => {
    setTemporaryUploadId(null);
    setExtractedData(null);
    setSelectedFile(null);
    setDocStep(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    setSelectedFile(file);
    try {
      setExtracting(true);
      const fd = new FormData();
      fd.append("document", file);
      fd.append("type", currentDoc.key);
      const res = await axiosInstance.post("/kyc/documents/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res?.data?.data || res?.data || {};
      setTemporaryUploadId(data.temporaryUploadId);
      setExtractedData(data.extractedData || {});
      setDocStep(1);
      toast.success("Extraction complete", { description: "Review the fields below." });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Extraction failed");
      setSelectedFile(null);
    } finally {
      setExtracting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await axiosInstance.post("/kyc/documents", {
        temporaryUploadId,
        metaData: extractedData,
      });
      const updated = [...completedDocs, currentDoc.key];
      setCompletedDocs(updated);
      toast.success(`${currentDoc.label} submitted`);
      if (isLastDoc) {
        navigate("/kyc-complete");
      } else {
        resetDoc();
        setDocIndex(i => i + 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const flatFields = extractedData ? flattenObject(extractedData) : [];
  const completedCount = completedDocs.length;
  const progressPct = (completedCount / DOCUMENT_OPTIONS.length) * 100;

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

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-5xl flex gap-6">

        {/* ── Left sidebar navigator ── */}
        <aside className="w-64 shrink-0">
          {/* Brand header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-blue-600 grid place-items-center">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-800">KYC Verification</span>
            </div>
            <p className="text-xs text-slate-400 pl-9">Business identity check</p>
          </div>

          {/* Overall progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Overall progress</span>
              <span className="text-xs font-semibold text-blue-600">{completedCount}/{DOCUMENT_OPTIONS.length}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {DOCUMENT_OPTIONS.length - completedCount} document{DOCUMENT_OPTIONS.length - completedCount !== 1 ? "s" : ""} remaining
            </p>
          </div>

          {/* Document list */}
          <nav className="flex flex-col gap-1">
            {DOCUMENT_OPTIONS.map((doc, i) => {
              const isDone = completedDocs.includes(doc.key);
              const isCurrent = i === docIndex;
              const DocIcon = doc.icon;

              return (
                <button
                  key={doc.key}
                  onClick={() => { if (isDone || i <= docIndex) { resetDoc(); setDocIndex(i); } }}
                  disabled={!isDone && i > docIndex}
                  className={`w-full text-left rounded-xl px-3 py-3 flex items-center gap-3 transition-all
                    ${isCurrent ? "bg-blue-50 border border-blue-200/80" : "hover:bg-slate-50 border border-transparent"}
                    ${!isDone && i > docIndex ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 transition-all
                    ${isDone ? "bg-emerald-500" : isCurrent ? "bg-blue-600" : "bg-slate-100"}
                  `}>
                    {isDone
                      ? <Check className="h-4 w-4 text-white" />
                      : <DocIcon className={`h-4 w-4 ${isCurrent ? "text-white" : "text-slate-400"}`} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate leading-snug
                      ${isCurrent ? "text-blue-700" : isDone ? "text-slate-600" : "text-slate-500"}
                    `}>{doc.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate
                      ${isDone ? "text-emerald-600" : isCurrent ? "text-blue-500" : "text-slate-400"}
                    `}>
                      {isDone ? "Submitted" : isCurrent ? "In progress" : "Pending"}
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
                All documents are encrypted and processed securely. Verification typically takes under 24 hours.
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main content area ── */}
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
                    {(() => { const Icon = currentDoc.icon; return <Icon className="h-5 w-5" style={{ color: currentDoc.accent }} />; })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-semibold text-slate-900">{currentDoc.label}</h1>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 tracking-wide uppercase">
                        {docIndex + 1} of {DOCUMENT_OPTIONS.length}
                      </span>
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
                    <div className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-semibold transition
                      ${docStep === i ? "bg-blue-600 text-white"
                        : docStep > i ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"}
                    `}>
                      {docStep > i ? <Check className="h-3 w-3" /> : i + 1}
                    </div>
                    <span className={`text-xs ${docStep === i ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                      {label}
                    </span>
                    {i < 1 && <div className={`w-8 h-px mx-1 ${docStep > 0 ? "bg-emerald-300" : "bg-slate-200"}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Card body */}
            <div className="px-8 py-6">

              {/* ── Step 0: Upload ── */}
              {docStep === 0 && !extracting && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept={ACCEPTED.join(",")}
                    onChange={handleFileChange}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`group relative rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-all
                      ${dragOver
                        ? "border-blue-400 bg-blue-50/60"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/60"}
                    `}
                  >
                    <div className={`h-16 w-16 rounded-2xl grid place-items-center mb-5 transition-all
                      ${dragOver ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-50"}
                    `}>
                      <UploadCloud className={`h-7 w-7 transition-all ${dragOver ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"}`} />
                    </div>
                    <p className="text-base font-semibold text-slate-700 mb-1">
                      {dragOver ? "Drop it here" : "Drop file or click to browse"}
                    </p>
                    <p className="text-sm text-slate-400">PDF, PNG, JPG — max 10 MB</p>

                    <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-100 w-full justify-center">
                      {["PDF", "PNG", "JPG"].map(fmt => (
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

              {/* ── Extracting state ── */}
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
                  <h3 className="text-base font-semibold text-slate-800 mb-1">Processing document</h3>
                  <p className="text-sm text-slate-400 text-center max-w-xs leading-relaxed">
                    Our OCR engine is extracting and verifying data from your document…
                  </p>
                  {selectedFile && (
                    <div className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                      <span className="text-xs text-slate-400">{bytesToHuman(selectedFile.size)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 1: Review fields ── */}
              {docStep === 1 && extractedData && !submitting && (
                <>
                  {/* Uploaded file badge */}
                  {selectedFile && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500 grid place-items-center shrink-0">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-emerald-800 truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-emerald-600">{bytesToHuman(selectedFile.size)} · Upload successful</p>
                      </div>
                      <button
                        onClick={resetDoc}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition shrink-0"
                      >
                        Replace
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-800">Extracted information</h2>
                    <span className="text-[11px] text-slate-400">{flatFields.length} fields detected</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flatFields.map(([path, value]) => (
                      <div key={path} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500 tracking-wide">
                          {formatLabel(path)}
                        </label>
                        <input
                          type="text"
                          value={value ?? ""}
                          onChange={(e) =>
                            setExtractedData(prev => setNestedValue(prev, path, e.target.value))
                          }
                          className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-slate-300"
                          placeholder="—"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/70">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Please review all extracted fields carefully. Incorrect data may delay verification.
                    </p>
                  </div>
                </>
              )}

              {/* ── Submitting state ── */}
              {submitting && (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-blue-50 grid place-items-center mb-5">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">Submitting {currentDoc.label}</h3>
                  <p className="text-sm text-slate-400">Saving securely to your compliance profile…</p>
                </div>
              )}
            </div>

            {/* Card footer */}
            {!extracting && !submitting && (
              <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  onClick={docStep === 1 ? resetDoc : () => navigate(-1)}
                  className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {docStep === 1 ? "Re-upload" : "Back"}
                </button>

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
                    {isLastDoc ? "Submit & finish" : "Submit & continue"}
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