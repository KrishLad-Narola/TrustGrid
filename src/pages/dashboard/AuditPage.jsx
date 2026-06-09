import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/API/axiosInstance";
import { Card } from "@/components/ui-bits";
import { Download, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Configured to show exactly 5 records per page
const ITEMS_PER_PAGE = 5;

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const extractResponseData = (response) => {
    console.log("FULL API RESPONSE =>", response);

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // Fetching the logs from the backend
      const response = await axiosInstance.post("/audit-logs", {
        page: 1,
        limit: 100, // Fetch a larger pool so we can handle pagination safely on the client side
      });

      const data = extractResponseData(response);
      console.log("PARSED DATA =>", data);
      setLogs(data);
      setCurrentPage(1); // Reset to first page on a fresh fetch
    } catch (error) {
      console.error("Audit Log Error:", error);
      toast.error(error?.response?.data?.message || "Failed to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filter logs based on dropdown selection
  const filteredRows = useMemo(() => {
    if (filter === "All") return logs;
    return logs.filter((item) => item?.module === filter);
  }, [logs, filter]);

  // Client-side Pagination Logic: Slice the filtered array down to exactly 5 items
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage]);

  // Calculate total pages dynamically based on client-side filtered data length
  const totalPages = useMemo(() => {
    return Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;
  }, [filteredRows]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const exportCsv = () => {
    if (!filteredRows.length) {
      toast.error("No data available");
      return;
    }

    const csv = [
      "ID,Module,Action,Actor,Business,Description,Created At",
      ...filteredRows.map((row) =>
        [
          row._id,
          row.module,
          row.action,
          `${row?.actorId?.firstName || ""} ${row?.actorId?.lastName || ""}`,
          row?.businessId?.tradeName || "",
          row?.description || "",
          row?.createdAt || "",
        ]
          .map((value) => `"${value}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit-logs.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const getModuleStyle = (module) => {
    switch ((module || "").toUpperCase()) {
      case "KYC":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "BUSINESS":
        return "bg-violet-50 text-violet-700 border border-violet-200";
      case "DOCUMENT":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "AUTH":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "USER":
        return "bg-cyan-50 text-cyan-700 border border-cyan-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const getActionStyle = (action) => {
    const value = (action || "").toLowerCase();

    // Explicit condition checks for the requested deal statuses
    if (value.includes("completed")) {
      return "bg-green-50 text-green-700 border border-green-200";
    }
    if (value.includes("accepted")) {
      return "bg-teal-50 text-teal-700 border border-teal-200";
    }
    if (value.includes("dispute")) {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    }

    // Default conditions
    if (value.includes("create") || value.includes("add") || value.includes("approve")) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (value.includes("update") || value.includes("edit")) {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }
    if (value.includes("delete") || value.includes("reject")) {
      return "bg-red-50 text-red-700 border border-red-200";
    }
    if (value.includes("view") || value.includes("login")) {
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    }
    return "bg-slate-50 text-slate-700 border border-slate-200";
  };

  const getDescriptionStyle = (module) => {
    switch ((module || "").toUpperCase()) {
      case "KYC":
        return "text-blue-700";
      case "BUSINESS":
        return "text-violet-700";
      case "DOCUMENT":
        return "text-amber-700";
      case "AUTH":
        return "text-indigo-700";
      default:
        return "text-slate-600";
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages.map((p, index) => {
      if (p === "...") {
        return (
          <span key={`ellipsis-${index}`} className="px-2 text-slate-400 text-xs font-medium">
            &hellip;
          </span>
        );
      }

      const isActive = currentPage === p;
      return (
        <button
          key={`page-${p}`}
          type="button"
          onClick={() => setCurrentPage(p)}
          className={`h-8 min-w-[32px] px-1.5 font-semibold transition-all duration-150 cursor-pointer rounded-md text-xs inline-flex items-center justify-center ${
            isActive
              ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <>
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Calendar className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900">Audit Logs</h1>
            <p className="text-xs text-slate-500">Track and monitor internal system logs</p>
          </div>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-2 text-sm shadow-sm transition-all duration-150 hover:shadow active:scale-[0.98] cursor-pointer"
        >
          <Download className="size-4 text-slate-500" />
          Export CSV
        </button>
      </div>

      {/* Main Table Card wrapper */}
      <Card className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full table-auto border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 h-12">
                <th className="px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Module
                </th>
                <th className="px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Action
                </th>
                <th className="px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Actor
                </th>
                <th className="px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Business
                </th>
                <th className="px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Description
                </th>
                <th className="px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Document
                </th>
                <th className="px-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="h-[56px]">
                    {Array.from({ length: 7 }).map((_, cIdx) => (
                      <td key={cIdx} className="px-5 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="text-sm font-medium text-slate-900 mb-0.5">No audit logs found</p>
                    <p className="text-xs text-slate-400">
                      There are no matching items inside this collection.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((log) => (
                  <tr
                    key={log._id}
                    className="h-[56px] border-b border-slate-100 hover:bg-slate-50/60 transition-colors duration-150 group"
                  >
                    {/* Module */}
                    <td className="px-5  py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center  rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${getModuleStyle(log?.module)}`}
                      >
                        {log?.module || "-"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center  rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${getActionStyle(log?.action)}`}
                      >
                        {log?.action || "-"}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="px-5 py-2 max-w-[180px]">
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-[13px] font-semibold text-slate-800 truncate">
                          {`${log?.actorId?.firstName || ""} ${log?.actorId?.lastName || ""}`.trim() ||
                            "-"}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate mt-0.5">
                          {log?.actorId?.email || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Business */}
                    <td className="px-5 py-2 max-w-[180px]">
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-[13px] font-semibold text-slate-800 truncate">
                          {log?.businessId?.tradeName || "-"}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate mt-0.5">
                          {log?.businessId?.legalName || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-2 max-w-[220px]">
                      <span
                        className={`text-[13px] font-medium block truncate ${getDescriptionStyle(log?.module)}`}
                        title={log?.description}
                      >
                        {log?.description || "-"}
                      </span>
                    </td>

                    {/* Document */}
                    <td className="px-5 py-2 text-[13px] text-slate-600 font-medium whitespace-nowrap">
                      {log?.metadata?.documentType || "-"}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-2 whitespace-nowrap text-[12px] text-slate-500 font-medium">
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

        {/* Footer & Active Pagination Controls */}
        <div className="mt-4 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-medium text-slate-500">
            Showing <span className="font-semibold text-slate-700">{paginatedRows.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{filteredRows.length}</span> records
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!hasPrevPage}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:active:scale-100 cursor-pointer inline-flex items-center gap-1"
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </button>

              <div className="flex items-center gap-1">{renderPaginationButtons()}</div>

              <button
                type="button"
                disabled={!hasNextPage}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-600 transition-all duration-150 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:active:scale-100 cursor-pointer inline-flex items-center gap-1"
              >
                Next
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
