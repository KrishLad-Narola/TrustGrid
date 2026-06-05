import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/API/axiosInstance";
import { Card } from "@/components/ui-bits";
import {
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const typeStyles = {
  KYC: "bg-primary/15 text-primary",
  AUTH: "bg-warning/20 text-accent-foreground",
  USER: "bg-muted text-muted-foreground",
  BUSINESS: "bg-success/15 text-success",
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const extractResponseData = (response) => {
    console.log("FULL API RESPONSE =>", response);

    // Case 1: Axios normal response
    if (Array.isArray(response?.data?.data)) {
      return {
        data: response.data.data,
        paginate: response.data.paginate || {},
      };
    }

    // Case 2: Axios interceptor returns response.data
    if (Array.isArray(response?.data)) {
      return {
        data: response.data,
        paginate: response.paginate || {},
      };
    }

    // Case 3: Interceptor returns direct object
    if (Array.isArray(response)) {
      return {
        data: response,
        paginate: {},
      };
    }

    return {
      data: [],
      paginate: {},
    };
  };

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);

      const response = await axiosInstance.post("/audit-logs", {
        page,
        limit: ITEMS_PER_PAGE,
      });

      const result = extractResponseData(response);

      console.log("PARSED DATA =>", result);

      setLogs(result.data || []);

      setPagination({
        page: result.paginate?.page || page,
        limit: result.paginate?.limit || ITEMS_PER_PAGE,
        totalPages: result.paginate?.totalPages || 1,
        totalRecords:
          result.paginate?.totalRecords ||
          result.data?.length ||
          0,
        hasNextPage: result.paginate?.hasNextPage || false,
        hasPrevPage: result.paginate?.hasPrevPage || false,
      });
    } catch (error) {
      console.error("Audit Log Error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to load audit logs"
      );

      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, []);

  const types = useMemo(() => {
    const modules = logs
      .map((item) => item?.module)
      .filter(Boolean);

    return ["All", ...new Set(modules)];
  }, [logs]);

  const filteredRows = useMemo(() => {
    if (filter === "All") return logs;

    return logs.filter((item) => item?.module === filter);
  }, [logs, filter]);

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
          `${row?.actorId?.firstName || ""} ${row?.actorId?.lastName || ""
          }`,
          row?.businessId?.tradeName || "",
          row?.description || "",
          row?.createdAt || "",
        ]
          .map((value) => `"${value}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

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

    if (
      value.includes("create") ||
      value.includes("add") ||
      value.includes("approve")
    ) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (
      value.includes("update") ||
      value.includes("edit")
    ) {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }

    if (
      value.includes("delete") ||
      value.includes("reject")
    ) {
      return "bg-red-50 text-red-700 border border-red-200";
    }

    if (
      value.includes("view") ||
      value.includes("login")
    ) {
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

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          Audit Logs
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="btn-ghost cursor-pointer text-sm"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      <Card className="rounded-[24px] border border-slate-200 bg-white p-5">
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="h-11 bg-slate-50 border-b border-slate-200">
                <th className="px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Module
                </th>
                <th className="px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
                <th className="px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Actor
                </th>
                <th className="px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Business
                </th>
                <th className="px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </th>
                <th className="px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Document
                </th>
                <th className="px-5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-slate-500"
                  >
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-slate-500"
                  >
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredRows.map((log) => (
                  <tr
                    key={log._id}
                    className="h-[52px] border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    {/* Module */}
                    <td className="px-5 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold ${getModuleStyle(
                          log?.module
                        )}`}
                      >
                        {log?.module || "-"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold ${getActionStyle(
                          log?.action
                        )}`}
                      >
                        {log?.action || "-"}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="px-5 py-2">
                      <div className="leading-tight">
                        <div className="text-[13px] font-medium text-slate-800">
                          {`${log?.actorId?.firstName || ""} ${log?.actorId?.lastName || ""
                            }`.trim() || "-"}
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {log?.actorId?.email || "-"}
                        </div>
                      </div>
                    </td>

                    {/* Business */}
                    <td className="px-5 py-2">
                      <div className="leading-tight">
                        <div className="text-[13px] font-medium text-slate-800">
                          {log?.businessId?.tradeName || "-"}
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {log?.businessId?.legalName || "-"}
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-2">
                      <span
                        className={`text-[13px] font-medium ${getDescriptionStyle(
                          log?.module
                        )}`}
                      >
                        {log?.description || "-"}
                      </span>
                    </td>

                    {/* Document */}
                    <td className="px-5 py-2 text-[13px] text-slate-700">
                      {log?.metadata?.documentType || "-"}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-2 whitespace-nowrap text-[12px] text-slate-500">
                      {log?.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center  justify-between">
          <div className="text-sm text-slate-500">
            Showing {filteredRows.length} records
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => fetchAuditLogs(pagination.page - 1)}
                className="h-8 px-3 rounded-lg border text-sm disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchAuditLogs(i + 1)}
                    className={`h-8 min-w-[32px] cursor-pointer rounded-lg text-sm ${pagination.page === i + 1
                      ? "bg-blue-600 text-white"
                      : "border"
                      }`}
                  >
                    {i + 1}
                  </button>
                )
              )}

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => fetchAuditLogs(pagination.page + 1)}
                className="h-8 px-3 rounded-lg border text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}