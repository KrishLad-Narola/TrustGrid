import { useEffect, useState } from "react";
import axiosInstance from "@/API/axiosInstance";
import { Panel } from "@/components/ui-kit";

export default function AdminAudit() {
  const ITEMS_PER_PAGE = 10;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/audit-logs", {
        page,
        limit: ITEMS_PER_PAGE,
      });

      console.log("--- DEBUGGING API RESPONSE ---");
      console.log("1. Raw response variable:", response);

      // 1. Determine if the data array is at the top level or nested inside .data
      let logsArray = [];
      let paginateObject = null;

      if (response?.data && Array.isArray(response.data)) {
        // Case A: Interceptor stripped the outer layer, data is right here
        logsArray = response.data;
        paginateObject = response.paginate;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Case B: Standard Axios wrapper structure
        logsArray = response.data.data;
        paginateObject = response.data.paginate;
      } else if (response?.data && Array.isArray(response.data)) {
        // Case C: Direct root array assignment
        logsArray = response.data;
        paginateObject = response.paginate;
      }

      console.log("2. Extracted Logs Array:", logsArray);
      console.log("3. Extracted Paginate Object:", paginateObject);

      setLogs(logsArray || []);

      if (paginateObject) {
        setPagination({
          page: paginateObject.page || 1,
          limit: paginateObject.limit || ITEMS_PER_PAGE,
          totalPages: paginateObject.totalPages || 1,
          totalRecords: paginateObject.totalRecords || 0,
          hasNextPage: paginateObject.hasNextPage || false,
          hasPrevPage: paginateObject.hasPrevPage || false,
        });
      }
    } catch (error) {
      console.error("API Error context:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAuditLogs(1);
  }, []);

  const handlePageChange = (page) => {
    fetchAuditLogs(page);
  };

  const handlePrevious = () => {
    if (pagination.hasPrevPage) {
      fetchAuditLogs(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.hasNextPage) {
      fetchAuditLogs(pagination.page + 1);
    }
  };

  const startRecord =
    pagination.totalRecords === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;

  const endRecord = Math.min(
    pagination.page * pagination.limit,
    pagination.totalRecords
  );

  return (
  <Panel className="overflow-hidden p-0 border border-slate-200/80 shadow-sm bg-white rounded-xl">
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse text-left">
        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
          <tr>
            <th className="px-6 py-3.5">Module & Action</th>
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
                  {/* Optional: Add a spinner component here */}
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
            logs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-50/60 transition-colors group">
                {/* Module & Action Type */}
                <td className="px-6 py-4 vertical-top">
                  <div className="flex flex-col items-start gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200/60 capitalize">
                      {log.module || "System"}
                    </span>
                    <span className="text-xs text-slate-500 font-mono tracking-tight break-all">
                      {log.action || "-"}
                    </span>
                  </div>
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
                      <div className="font-medium text-slate-900 truncate" title={log?.businessId?.tradeName}>
                        {log?.businessId?.tradeName || "N/A"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate mt-0.5" title={log?.businessId?.legalName}>
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
    {!loading && pagination.totalRecords > 0 && (
      <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-white">
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{" "}
          <span className="font-semibold text-slate-800">{endRecord}</span> of{" "}
          <span className="font-semibold text-slate-800">{pagination.totalRecords}</span> records
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePrevious}
            disabled={!pagination.hasPrevPage}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Previous
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, index) => {
              const pageNum = index + 1;
              const isSelected = pagination.page === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`min-w-[32px] h-8 rounded-lg cursor-pointer text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-blue-600  text-white shadow-sm"
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
            disabled={!pagination.hasNextPage}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Next
          </button>
        </div>
      </div>
    )}      
  </Panel>
)
}