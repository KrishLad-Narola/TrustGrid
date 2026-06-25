import { useState } from "react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./AppSidebar";
import { X } from "lucide-react";

export function AppShell({ kind, children, header }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <AppSidebar kind={kind} />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-sidebar border-r border-sidebar-border animate-in slide-in-from-left duration-200">
            {/* Mobile Close Button inside Drawer */}
            <div className="absolute right-4 top-4 z-50">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Sidebar content */}
            <AppSidebar kind={kind} onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {header && (
          <AppHeader
            title={header.title}
            subtitle={header.subtitle}
            onMenuClick={() => setSidebarOpen(true)}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
