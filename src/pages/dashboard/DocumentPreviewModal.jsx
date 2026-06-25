import React from "react";
import { createPortal } from "react-dom";
import { X, FileText, Database, BadgeCheck, AlertCircle, Clock } from "lucide-react";

// Converts camelCase / snake_case keys → "Human Readable Label"
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\s*/, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Formats values: null/undefined → "—", booleans, nested objects
function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    // Nested object: render each sub-key on its own line
    return (
      <div className="bg-gray-50 rounded-xl p-3 border text-gray-700 leading-6 space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <span className="text-gray-400 text-xs">{formatKey(k)}: </span>
            <span>{v ?? "—"}</span>
          </div>
        ))}
      </div>
    );
  }
  return String(value);
}

// Status badge colour — green for verified, yellow for pending, red for rejected
function statusStyle(status) {
  const s = (status || "").toUpperCase();
  if (s === "VERIFIED")
    return { wrap: "bg-green-50 border-green-100", icon: "text-green-600", text: "text-green-700" };
  if (s === "PENDING")
    return {
      wrap: "bg-yellow-50 border-yellow-100",
      icon: "text-yellow-500",
      text: "text-yellow-700",
    };
  return { wrap: "bg-red-50 border-red-100", icon: "text-red-500", text: "text-red-700" };
}

function StatusIcon({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "VERIFIED") return <BadgeCheck size={20} />;
  if (s === "PENDING") return <Clock size={20} />;
  return <AlertCircle size={20} />;
}

function DocumentPreviewModal({ open, onClose, data }) {
  if (!open || !data) return null;

  const meta = data.metaData || {};
  const metaEntries = Object.entries(meta);
  const isPdf = data.previewUrl && /\.pdf(\?.*)?$/i.test(data.previewUrl);
  const style = statusStyle(data.status);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between border-b px-7 py-5 bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Document Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              {formatKey(data.documentType || "Document")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-5 p-5 flex-1 overflow-hidden">
          {/* LEFT — file preview */}
          <div className="bg-gray-100 rounded-2xl border overflow-hidden flex items-center justify-center h-full">
            {isPdf ? (
              <iframe
                src={data.previewUrl}
                title="Document Preview"
                className="w-full h-full rounded-2xl"
              />
            ) : (
              <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
                <img
                  src={data.previewUrl}
                  alt="Document"
                  className="max-w-full h-auto mx-auto rounded-xl shadow-md object-contain"
                />
              </div>
            )}
          </div>

          {/* RIGHT — info sidebar */}
          <div className="bg-white border rounded-2xl h-full overflow-y-auto p-5 space-y-5">
            {/* Status badge */}
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${style.wrap}`}>
              <span className={style.icon}>
                <StatusIcon status={data.status} />
              </span>
              <span className={`font-semibold ${style.text}`}>{data.status || "—"}</span>
            </div>

            {/* File info — always fixed fields */}
            <div className="border rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
                <FileText size={18} />
                File Information
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                {[
                  ["File Name", data.fileName],
                  ["File Size", data.fileSize ? `${(data.fileSize / 1024).toFixed(2)} KB` : null],
                  ["Version", data.version],
                  [
                    "Uploaded At",
                    data.createdAt ? new Date(data.createdAt).toLocaleString() : null,
                  ],
                  [
                    "Verified At",
                    data.verifiedAt ? new Date(data.verifiedAt).toLocaleString() : null,
                  ],
                  ["Expires At", data.expiresAt ? new Date(data.expiresAt).toLocaleString() : null],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="font-medium break-all">{value ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata — fully dynamic from API response */}
            {metaEntries.length > 0 && (
              <div className="border rounded-2xl p-5">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <Database size={18} />
                  Extracted Metadata
                </h3>
                <div className="space-y-4 text-sm text-gray-700">
                  {metaEntries.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-400 text-xs mb-0.5">{formatKey(key)}</p>
                      <div className="font-medium">{formatValue(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default DocumentPreviewModal;
