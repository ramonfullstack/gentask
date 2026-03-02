"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { X } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";

type AppShellLayoutProps = {
  userEmail: string | null;
  projectName: string | null;
  children: ReactNode;
};

export function AppShellLayout({ userEmail, projectName, children }: AppShellLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border/70 bg-card/60 p-4 md:block">
        <Link href={"/app" as Route} className="mb-6 block font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-tight text-primary">
          GenTask
        </Link>
        <SidebarNav />
      </aside>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-foreground/25" onClick={() => setIsMobileSidebarOpen(false)} aria-label="Fechar menu" />
          <aside className="relative h-full w-72 border-r border-border/70 bg-card p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Link href={"/app" as Route} className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold tracking-tight text-primary">
                GenTask
              </Link>
              <Button variant="outline" size="icon" onClick={() => setIsMobileSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setIsMobileSidebarOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <Topbar userEmail={userEmail} projectName={projectName} onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
