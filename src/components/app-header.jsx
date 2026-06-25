import { Bell, Search, Moon, Sun, Menu } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NotificationDrawer } from "./notification-drawer";
import axiosInstance from "@/API/axiosInstance";
import { socket } from "@/utils/socket.io";
import { useTheme } from "@/lib/theme-context";

// FIX: Every single item directly points to an exact path defined in your AppRoutes
const DEFAULT_MENU_DATA = [
  { title: "Dashboard Home", path: "/dashboard", category: "Dashboard" },
  { title: "KYC Verification", path: "/dashboard/kyc", category: "Dashboard" },
  { title: "Trust Profile", path: "/dashboard/trust", category: "Dashboard" },
  { title: "Deals & Opportunities", path: "/dashboard/deals", category: "Dashboard" },
  { title: "Business Directory", path: "/dashboard/directory", category: "Dashboard" },
  { title: "Shared Documents", path: "/dashboard/shared", category: "Dashboard" },
  { title: "Audit Trail Logs", path: "/dashboard/audit", category: "Dashboard" },
  { title: "Dashboard Settings", path: "/dashboard/settings", category: "Dashboard" },
  { title: "My Profile", path: "/profile", category: "User" },
  { title: "Change Password", path: "/change-password", category: "Security" },

  // Admin Context Routes
  { title: "Admin Home", path: "/admin", category: "Admin" },
  { title: "Admin Businesses Management", path: "/admin/businesses", category: "Admin" },
  { title: "Admin KYC Review", path: "/admin/kyc", category: "Admin" },
  { title: "Admin Trust Management", path: "/admin/trust", category: "Admin" },
  { title: "Admin Disputes Resolution", path: "/admin/disputes", category: "Admin" },
  { title: "Admin System Audit", path: "/admin/audit", category: "Admin" },
  { title: "Admin Settings Panel", path: "/admin/settings", category: "Admin" },
];

export function AppHeader({ title, subtitle, menuData = DEFAULT_MENU_DATA, onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef(null);

  const calculateUnreadCount = useCallback((notifs) => {
    return notifs.filter((notification) => !notification.isRead).length;
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.post("/notifications", {
        options: { page: 1, limit: 20 },
      });
      const notificationList = data?.docs || [];
      setNotifications(notificationList);
      setUnreadCount(calculateUnreadCount(notificationList));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [calculateUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNewNotification);
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      const updatedNotifications = notifications.map((notification) =>
        notification._id === notificationId ? { ...notification, isRead: true } : notification,
      );
      setNotifications(updatedNotifications);
      setUnreadCount(calculateUnreadCount(updatedNotifications));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationsUpdate = useCallback(
    (updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(calculateUnreadCount(updatedNotifications));
    },
    [calculateUnreadCount],
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    const matches = menuData.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const categoryMatch = item.category?.toLowerCase().includes(query);
      const pathMatch = item.path.toLowerCase().includes(query);
      return titleMatch || categoryMatch || pathMatch;
    });

    setSearchResults(matches);
  }, [searchQuery, menuData]);

  // Shortcut hotkey listener (⌘K or Ctrl+K)
  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
        setShowDropdown(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // Handle closing drawer safely when clicking away
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Closes the panel cleanly when selecting a search result
  const handleResultClick = () => {
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm text-foreground active:scale-95 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div ref={searchRef} className="relative hidden md:block">
            <div className="flex w-80 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                id="global-search"
                type="text"
                value={searchQuery}
                placeholder="Search pages, actions, options..."
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
              />
              <kbd className="hidden items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:flex">
                ⌘K
              </kbd>
            </div>

            {/* Dropdown Box Area */}
            {showDropdown && searchQuery.trim() && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <Link
                      key={index}
                      to={result.path}
                      onClick={handleResultClick}
                      className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <span className="text-sm font-medium text-foreground">{result.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {result.category} › {result.path}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-muted hover:shadow-md active:scale-95 text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Panel Trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open notifications"
            className="relative flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-muted hover:shadow-md active:scale-95"
          >
            <Bell className="h-4 w-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <NotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationsUpdate={handleNotificationsUpdate}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </>
  );
}
