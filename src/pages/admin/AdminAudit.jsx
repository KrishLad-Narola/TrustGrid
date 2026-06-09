import { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/API/axiosInstance";
import { Panel } from "@/components/ui-kit";

// Explicitly set to display exactly 5 records per page view
const ITEMS_PER_PAGE = 5;

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/audit-logs", {
        page: 1,
        limit: 100,
      });

      console.log("--- DEBUGGING API RESPONSE ---");
      console.log("1. Raw response variable:", response);

      let logsArray = [];

      if (response?.data && Array.isArray(response.data)) {
        logsArray = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        logsArray = response.data.data;
      }

      console.log("2. Extracted Logs Array:", logsArray);
      setLogs(logsArray || []);
      setCurrentPage(1); // Reset back to page 1 on every fresh fetch
    } catch (error) {
      console.error("API Error context:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Client-Side Pagination: Extract exactly 5 items based on current page
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return logs.slice(startIndex, endIndex);
  }, [logs, currentPage]);

  // Compute total pages dynamically
  const totalPages = useMemo(() => {
    return Math.ceil(logs.length / ITEMS_PER_PAGE) || 1;
  }, [logs]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getActionBadgeStyles = (actionName) => {
    const normalized = actionName?.toLowerCase() || "";

    // 1. Explicit priority statuses requested by you
    if (normalized.includes("verified")) {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (normalized.includes("submitted")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    // 2. Rest of your existing keyword styling rules
    if (
      normalized.includes("accept") ||
      normalized.includes("approve") ||
      normalized.includes("success")
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (
      normalized.includes("create") ||
      normalized.includes("add") ||
      normalized.includes("post")
    ) {
      return "bg-green-50 text-green-700 border-green-100";
    }
    if (
      normalized.includes("update") ||
      normalized.includes("edit") ||
      normalized.includes("patch") ||
      normalized.includes("put")
    ) {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    if (
      normalized.includes("delete") ||
      normalized.includes("remove") ||
      normalized.includes("reject") ||
      normalized.includes("fail")
    ) {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }

    // Default fallback style
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  const startRecord = logs.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, logs.length);

  return (
    <Panel className="overflow-hidden p-0 border border-slate-200/80 shadow-sm bg-white rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-3.5">Action</th>
              <th className="px-6 py-3.5">Actor</th>
              <th className="px-6 py-3.5">Business Entity</th>
              <th className="px-6 py-3.5">Description</th>
              <th className="px-6 py-3.5">Timestamp</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-sm font-medium animate-pulse">Loading audit logs...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  <p className="text-sm">No log entries found.</p>
                </td>
              </tr>
            ) : (
              paginatedRows.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Action Type Badge Column */}
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold border tracking-wide uppercase ${getActionBadgeStyles(log.action)}`}
                    >
                      {log.action || "-"}
                    </span>
                  </td>

                  {/* Actor Field */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                      {log?.actorId?.email || "system_process"}
                    </span>
                  </td>

                  {/* Business Entity Details */}
                  <td className="px-6 py-4">
                    {log?.businessId ? (
                      <div className="max-w-[200px]">
                        <div
                          className="font-medium text-slate-900 truncate"
                          title={log?.businessId?.tradeName}
                        >
                          {log?.businessId?.tradeName || "N/A"}
                        </div>
                        <div
                          className="text-xs text-slate-400 font-mono truncate mt-0.5"
                          title={log?.businessId?.legalName}
                        >
                          {log?.businessId?.legalName || log?.businessId?._id}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Global</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-slate-600 max-w-[280px] break-words text-[13px] leading-relaxed">
                    {log?.description || "-"}
                  </td>

                  {/* Timestamp */}
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap font-medium">
                    {log?.createdAt
                      ? new Date(log.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      {!loading && logs.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{" "}
            <span className="font-semibold text-slate-800">{endRecord}</span> of{" "}
            <span className="font-semibold text-slate-800">{logs.length}</span> records
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevPage}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            >
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isSelected = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[32px] h-8 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={!hasNextPage}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}