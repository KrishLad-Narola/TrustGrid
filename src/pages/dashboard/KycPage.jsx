import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Eye,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ScanLine,
  RefreshCw,
  CircleAlert,
  Check,
  CloudUpload,
  Info,
  FileWarning,
  CloudSync,
} from "lucide-react";

import { Card, StatusBadge } from "@/components/ui-kit";
import { toast } from "sonner";
import axiosInstance from "@/API/axiosInstance";
import DocumentPreviewModal from "./DocumentPreviewModal";

const tabs = ["All", "GST", "PAN", "INCORPORATION", "BANK"];

const tabsMapping = {
  GST: "GST_CERTIFICATE",
  PAN: "PAN_CARD",
  Incorporation: "INCORPORATION_CERTIFICATE",
  Bank: "BANK_PROOF",
};

const docTypeOptions = ["GST Certificate", "PAN Card", "Incorporation Certificate", "Bank Proof"];

const MAX_BYTES = 10 * 1024 * 1024;

const ACCEPTED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const ACCEPTED_EXT = [".pdf", ".png", ".jpg", ".jpeg"];

const validators = {
  "GST Certificate": {
    field: "GSTIN",
    regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    example: "27AAACH1234A1Z9",
  },
  "PAN Card": {
    field: "PAN",
    regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    example: "AAACH1234A",
  },
  "Incorporation Certificate": {
    field: "CIN",
    regex: /^[A-Z][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
    example: "U74999MH2018PLC312841",
  },
  "Bank Proof": {
    field: "IFSC",
    regex: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    example: "HDFC0001234",
  },
};

function bytesToHuman(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export default function KYCPage() {
  const [tab, setTab] = useState("All");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [docType, setDocType] = useState("GST Certificate");
  const [kycDocuments, setKycDocuments] = useState([]);

  const filtered =
    tab === "All"
      ? kycDocuments || []
      : kycDocuments?.filter((d) => d.documentType === tabsMapping[tab]) || [];

  const expiring =
    kycDocuments?.filter((d) => {
      if (!d || !d.expiresAt) return false;
      const days = (new Date(d.expiresAt).getTime() - Date.now()) / 86400000;
      return days < 60 && days > 0;
    }) || [];

  async function getKYCDocuments() {
    try {
      const response = await axiosInstance.get("/kyc/documents");
      setKycDocuments(response.data || []);
    } catch (error) {
      // Error handling can go here
    }
  }

  useEffect(() => {
    getKYCDocuments();
  }, []);

  const handleReuploadAction = (type) => {
    const matchedType = docTypeOptions.includes(type) ? type : "GST Certificate";
    setDocType(matchedType);
    setUploadOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="glass-card p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 cursor-pointer rounded-md text-xs font-medium transition ${
                  tab === t
                    ? "btn-primary text-white shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200 border border-transparent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {expiring.length > 0 && (
          <div className="glass-card p-3 flex items-center gap-2 border-warning/30 bg-warning/10">
            <AlertTriangle className="size-4 text-warning" />
            <span className="text-sm">
              {expiring.length} document{expiring.length > 1 ? "s" : ""} expiring within{" "}
              <span className="font-mono">60 days</span>. Re-upload soon.
            </span>
          </div>
        )}

        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Document</th>
                <th className="text-left px-4 py-3">Uploaded</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">File Size</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map((d, index) => (
                <DocRow key={d?._id || index} d={d} onReupload={handleReuploadAction} />
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {uploadOpen && (
        <UploadModal
          onClose={() => {
            setUploadOpen(false);
            getKYCDocuments();
          }}
          docType={docType}
          setDocType={setDocType}
        />
      )}
    </>
  );
}

function DocRow({ d, onReupload }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  if (!d) return null;

  const handleView = async () => {
    try {
      toast.info("Opening document preview...");

      const response = await axiosInstance.get(`/kyc/documents/${d._id}`);
      let filePath = response.data?.fileUrl;

      if (filePath) {
        filePath = filePath.replace(/\\/g, "/").replace(/^public\//, "");
        const fullUrl = `http://192.168.100.149:3000/${filePath}`;

        setPreviewData({ ...response.data, previewUrl: fullUrl });
        setPreviewOpen(true);
      } else {
        toast.error("File URL not found");
      }
    } catch (error) {
      toast.error("Failed to generate document preview link");
    }
  };

  const handleDownload = async (openInTab = false) => {
    try {
      const filePath = (d.fileUrl || "").replace(/\\/g, "/").replace(/^public\//, "");
      const url = `http://192.168.100.149:3000/${filePath}`;

      if (openInTab) {
        window.open(url, "_blank");
      } else {
        setDownloading(true);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response error");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = d.fileName || `kyc-doc-${d._id}`;
        document.body.appendChild(link);
        link.click();

        // Clean up memory and elements
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        toast.success("Download started");
      }
    } catch (error) {
      console.error(error);
      toast.error("File download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-muted/40">
        <td className="px-4 py-3 flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{d.fileName || "Document"}</div>
            <div className="text-[10px] text-muted-foreground">{d.documentType}</div>
          </div>
        </td>
        <td className="px-4 py-3 text-xs font-mono">{d.uploadedAt || "—"}</td>
        <td className="px-4 py-3 text-xs font-mono">{d.expiresAt || "—"}</td>
        <td className="px-4 py-3">
          <StatusBadge status={d.status} />
        </td>
        <td className="px-4 py-3 text-xs font-mono">{d.size ? bytesToHuman(d.size) : "—"}</td>
        <td className="px-4 py-3 flex justify-end gap-2">
          <button onClick={handleView} className="cursor-pointer">
            <Eye className="size-4" />
          </button>
          <button
            onClick={() => handleDownload()}
            disabled={downloading}
            className="cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
          </button>
          <button onClick={() => onReupload(d.documentType)} className="cursor-pointer">
            <CloudSync className="size-4" />
          </button>
        </td>
      </tr>

      {previewOpen &&
        createPortal(
          <DocumentPreviewModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            data={previewData}
          />,
          document.body,
        )}
    </>
  );
}

function UploadModal({ onClose, docType, setDocType }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [documentData, setDocumentData] = useState({});

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid =
      ACCEPTED_MIME.includes(file.type) ||
      ACCEPTED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      toast.error("Invalid file type");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error(`File too large (${bytesToHuman(MAX_BYTES)} max)`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", tabsMapping[docType] || "GST_CERTIFICATE");
      formData.append("document", selectedFile);

      const res = await axiosInstance.post("/kyc/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data?.data || res.data;

      setUploadedDoc(data || {});

      // extract metadata safely
      const meta = data?.metadata || data?.extractedData || {};

      setDocumentData(meta);

      toast.success("Document uploaded. Please verify details.");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await axiosInstance.post("/kyc/documents", {
        temporaryUploadId: uploadedDoc?.temporaryUploadId || uploadedDoc?.data?.temporaryUploadId,

        metaData: documentData,
      });

      toast.success("Document confirmed successfully");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setUploadedDoc(null);
    setDocumentData({});
    setSelectedFile(null);
  };

  const renderFormFields = () => {
    return Object.keys(documentData || {}).length > 0 ? (
      <div className="space-y-4">
        {Object.entries(documentData).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs text-muted-foreground mb-1">
              {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
            </label>

            <input
              value={value || ""}
              onChange={(e) =>
                setDocumentData((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
              className="w-full px-3  py-2 border rounded-lg bg-input"
            />
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">No metadata extracted from document.</p>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="glass-card w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Upload KYC Document</h3>

          <button onClick={onClose}>
            <X className="size-4 cursor-pointer" />
          </button>
        </div>

        {/* STEP 1: Upload */}
        {!uploadedDoc && (
          <>
            <div>
              <label className="text-xs text-muted-foreground">Document Type</label>

              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg cursor-pointer bg-input"
              >
                {docTypeOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select> 
            </div>

            <div className="border border-dashed p-6 text-center justify-center cursor-pointer rounded-lg">
              <CloudUpload className="mx-auto mb-2 size-6" />

              <input
                className="text-sm justify-center ml-25 cursor-pointer"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {selectedFile && <p className="text-xs mt-2">{selectedFile.name}</p>}
            </div>

            <div className="flex justify-end gap-2 ">
              <button onClick={onClose} className="btn-ghost cursor-pointer ">
                Cancel
              </button>

              <button onClick={handleUpload} disabled={loading} className="btn-primary cursor-pointer">
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: REVIEW + EDIT */}
        {uploadedDoc && (
          <>
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium">Verify Document Details</h4>

              {renderFormFields()}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={reset} className="btn-ghost">
                Reupload
              </button>

              <button onClick={handleConfirm} disabled={loading} className="btn-primary">
                {loading ? "Confirming..." : "Confirm Upload"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
