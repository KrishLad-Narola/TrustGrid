import { AppHeader } from "./app-header";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ kind, children, header }) {
  return (
    <div className="min-h-screen flex-1 flex w-full bg-background text-foreground">
      <AppSidebar kind={kind} />

      <main className="flex-1 flex flex-col">
        {header && <AppHeader title={header.title} subtitle={header.subtitle} />}

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 overflow-y-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
