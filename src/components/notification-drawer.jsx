import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  X,
  AlertTriangle,
  FileCheck2,
  Handshake,
  FileText,
  CheckCircle2,
  Bell,
  ShieldAlert,
  UserPlus
} from "lucide-react";
import axiosInstance from "../API/axiosInstance";

const getTypeStyles = (type = "") => {
  const upperType = type.toUpperCase();

  if (upperType.includes("KYC")) {
    if (upperType.includes("REJECTED")) return { icon: AlertTriangle, color: "text-red-600 bg-red-100 dark:bg-red-950/50" };
    if (upperType.includes("VERIFIED")) return { icon: FileCheck2, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50" };
    return { icon: FileText, color: "text-amber-600 bg-amber-100 dark:bg-amber-950/50" };
  }

  if (upperType.includes("DEAL")) {
    if (upperType.includes("CREATED")) return { icon: Handshake, color: "text-blue-600 bg-neutral-400/20" };
    if (upperType.includes("COMPLETED")) return { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50" };
    if (upperType.includes("REJECTED") || upperType.includes("CANCELLED")) return { icon: X, color: "text-slate-500 bg-slate-100" };
    return { icon: Handshake, color: "text-blue-600 bg-neutral-400/20" };
  }

  if (upperType.includes("DISPUTE")) {
    return { icon: ShieldAlert, color: "text-red-600 bg-red-100 dark:bg-red-950/50 animate-pulse" };
  }

  if (upperType.includes("MEMBER") || upperType.includes("ROLE")) {
    return { icon: UserPlus, color: "text-sky-600 bg-sky-100" };
  }

  return { icon: Bell, color: "text-slate-500 bg-slate-100" };
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

// --- LocalStorage Helpers ---
const STORAGE_KEY = "removed_notification_ids";

const getRemovedIds = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error reading localStorage", e);
    return [];
  }
};

const saveRemovedId = (id) => {
  if (!id) return;
  const currentIds = getRemovedIds();
  if (!currentIds.includes(id)) {
    const updated = [...currentIds, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};

export function NotificationDrawer({ open, onClose, apiUrl, accessToken }) {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => n.isRead === false || n.read === false).length;

  const fetchNotifications = async (pageToFetch = 1, append = false) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/notifications", {
        options: { page: pageToFetch, limit: 20 }
      });

      const data = response.data;
      const rawDocs = data?.docs || (Array.isArray(data) ? data : []);
      const removedIds = getRemovedIds();

      const filteredDocs = rawDocs
        .filter(n => {
          const id = n._id || n.id;
          return !removedIds.includes(id);
        })
        .map(n => ({
          ...n,
          isRead: typeof n.isRead === "boolean" ? n.isRead : (typeof n.read === "boolean" ? n.read : false)
        }));

      setNotifications(prev => append ? [...prev, ...filteredDocs] : filteredDocs);

      if (data?.paginate) {
        setPagination(data.paginate);
      }
    } catch (err) {
      console.error("Failed to fetch notifications from DB:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, false);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      saveRemovedId(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId && n.id !== notificationId));
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    notifications.forEach(n => {
      const id = n._id || n.id;
      saveRemovedId(id);
    });
    setNotifications([]);

    try {
      await axiosInstance.patch("/notifications/read-all");
    } catch (err) {
      console.error("Could not complete backend mark-all clear request:", err);
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (!accessToken || !apiUrl) return;

    const socket = io(apiUrl, { auth: { token: accessToken } });

    socket.on("notification:new", (newNotification) => {
      const targetId = newNotification._id || newNotification.id;
      const removedIds = getRemovedIds();

      if (removedIds.includes(targetId)) return;

      setNotifications(prev => {
        const exists = prev.some(n => n._id === targetId || n.id === targetId);
        if (exists) return prev;

        const initialReadStatus = typeof newNotification.isRead === 'boolean'
          ? newNotification.isRead
          : (typeof newNotification.read === 'boolean' ? newNotification.read : false);

        return [{ ...newNotification, isRead: initialReadStatus }, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, accessToken]);

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-white border-l border-slate-100 z-40 transition-all duration-300 shadow-2xl flex flex-col ${open ? "translate-x-0 opacity-100 visible" : "translate-x-full opacity-0 invisible"
          }`}
      >
        {/* Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
            {/* Count Badge - ONLY displays when unreadCount is strictly greater than 0 */}
            {unreadCount > 0 && (
              <span className="bg-black text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex justify-end cursor-pointer btn-ghost items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="size-8 rounded-full hover:bg-slate-100 flex items-center cursor-pointer justify-center text-slate-500 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Lists Display Box */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">
              No recent notifications to display.
            </div>
          ) : (
            notifications.map((n) => {
              const currentId = n._id || n.id;
              const { icon: DynamicIcon, color: iconStyleClasses } = getTypeStyles(n.type);

              return (
                <div
                  key={currentId}
                  onClick={() => !n.isRead && markAsRead(currentId)}
                  className={`p-4 flex gap-3 rounded-2xl transition-all duration-200 border relative group cursor-pointer ${n.isRead
                    ? "bg-white border-slate-100 opacity-70 shadow-sm"
                    : "bg-white border-[#F4E3B1] shadow-md shadow-amber-500/5 hover:scale-[1.01]"
                    }`}
                >
                  {/* Unread indicator dot */}
                  {!n.isRead && (
                    <span className="absolute top-4 left-4 flex h-2 w-2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}

                  {/* Icon Wrapper Asset Indicator */}
                  <div className={`size-11 rounded-2xl flex items-center justify-center transition-transform ${iconStyleClasses}`}>
                    <DynamicIcon className="size-5 stroke-[1.5]" />
                  </div>

                  {/* Message Layout Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm tracking-tight text-slate-800 ${!n.isRead ? "font-bold text-slate-900" : "font-medium"}`}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-slate-500 font-semibold flex-shrink-0 pt-0.5">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More Action Section */}
          {pagination?.hasNextPage && (
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full text-center py-2.5 text-xs text-blue-600 hover:text-blue-700 bg-white border border-slate-100 hover:border-amber-200 shadow-sm rounded-xl transition-all font-semibold mt-4"
            >
              {isLoading ? "Loading older updates..." : "View older notifications"}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}