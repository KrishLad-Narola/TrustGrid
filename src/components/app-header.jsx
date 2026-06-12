import { Bell, Search, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationDrawer } from "./notification-drawer";
import { useTheme } from "@/lib/ThemeContext";

export function AppHeader({ title, subtitle }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { theme, toggleTheme } = useTheme();

  const handleSearchChange = () => {
    if (searchQuery.trim()) return;

    console.log("Searching...", searchQuery);
  };

  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h1>

          {subtitle && <p className="truncate text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 w-80">
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              id="global-search"
              type="text"
              placeholder="Search businesses, deals, documents..."
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchChange();
                }
              }}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />

            <kbd className="hidden lg:flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          {/* Theme Toggle */}

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-muted hover:shadow-md active:scale-95"
          >
            {theme === "dark" ? <Sun strokeWidth={1} size={18} /> : <Moon   strokeWidth={1.25} size={18} />}
          </button>
                                                                                                                                         
          {/* Notifications */}

          <button
            onClick={() => setOpen(true)}
            aria-label="Open notifications"
            className="relative flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-muted hover:shadow-md active:scale-95"
          >
            <Bell className="h-4 w-4 text-foreground" />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
              3
            </span>
          </button>
        </div>
      </header>

      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
