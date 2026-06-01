import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { NotificationDrawer } from "./notification-drawer";

export function AppHeader({ title, subtitle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
        
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>

          {subtitle && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 w-80">
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search businesses, deals, documents..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />

            <kbd className="hidden lg:flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:bg-muted hover:shadow-md active:scale-95"
          >
            <Bell className="h-4 w-4 text-foreground cursor-pointer" />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
              3
            </span>
          </button>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}