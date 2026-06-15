import { Bell, Search, Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationDrawer } from "./notification-drawer";
import { useTheme } from "@/lib/ThemeContext";
import axiosInstance from "@/API/axiosInstance";
import { socket } from "@/utils/socket.io";
// import { toast } from "sonner";

const DEFAULT_MENU_DATA = [
  { title: "Dashboard", path: "/dashboard" },
  {
    title: "Settings",
    path: "/settings",
    subItems: [
      { title: "Summary", path: "/settings/summary" },
      { title: "Change Password", path: "/settings/change-password" },
    ],
  },
  {
    title: "Businesses",
    path: "/businesses",
    subItems: [
      { title: "All Businesses", path: "/businesses/all" },
      { title: "Deals", path: "/businesses/deals" },
    ],
  },
  { title: "Documents", path: "/documents" },
];

export function AppHeader({
  title,
  subtitle,
  menuData = DEFAULT_MENU_DATA,
}) {
  const [open, setOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { theme, toggleTheme } = useTheme();

  const searchRef = useRef(null);

  let navigate;

  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn(
      "AppHeader is not inside Router context. Using window.location fallback."
    );
  }

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.post("/notifications", {
        options: {
          page: 1,
          limit: 20,
        },
      });

      const notificationList = data?.docs || [];

      setNotifications(notificationList);

      setUnreadCount(
        notificationList.filter(
          (notification) => !notification.isRead
        ).length
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);

      setUnreadCount((prev) => prev + 1);

      console.log("New Notification:", notification);
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);


  const markNotificationAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
              ...notification,
              isRead: true,
            }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    const matches = [];

    menuData.forEach((menu) => {
      if (menu.title.toLowerCase().includes(query)) {
        matches.push({
          title: menu.title,
          path: menu.path,
          category: "Menu",
        });
      }

      if (menu.subItems) {
        menu.subItems.forEach((sub) => {
          if (sub.title.toLowerCase().includes(query)) {
            matches.push({
              title: sub.title,
              path: sub.path,
              category: menu.title,
            });
          }
        });
      }
    });

    setSearchResults(matches);
  }, [searchQuery, menuData]);

  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();

        document.getElementById("global-search")?.focus();

        setShowDropdown(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  const handleOpenNotifications = async () => {
    setOpen(true);

    if (unreadCount === 0) return;

    try {
      await axiosInstance.patch("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const handleResultClick = (path) => {
    setSearchQuery("");
    setShowDropdown(false);

    if (navigate) {
      navigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            ref={searchRef}
            className="relative hidden md:block"
          >
            <div className="flex w-80 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 text-muted-foreground" />

              <input
                id="global-search"
                type="text"
                value={searchQuery}
                placeholder="Search businesses, deals, documents..."
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />

              <kbd className="hidden items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:flex">
                ⌘K
              </kbd>
            </div>

            {showDropdown && searchQuery.trim() && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <button
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleResultClick(result.path);
                      }}
                      className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {result.title}
                      </span>

                      <span className="text-[10px] text-muted-foreground">
                        {result.category !== "Menu"
                          ? `${result.category} › `
                          : ""}
                        {result.path}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-muted hover:shadow-md active:scale-95"
          >
            {theme === "dark" ? (
              <Sun strokeWidth={1} size={18} />
            ) : (
              <Moon strokeWidth={1.25} size={18} />
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={handleOpenNotifications}
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
      />
    </>
  );
}