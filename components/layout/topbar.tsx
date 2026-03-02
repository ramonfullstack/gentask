"use client";

import Link from "next/link";
import type { Route } from "next";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  userEmail: string | null;
  projectName: string | null;
  onOpenSidebar?: () => void;
};

export function Topbar({ userEmail, projectName, onOpenSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="md:hidden" onClick={onOpenSidebar} aria-label="Abrir menu lateral">
          <Menu className="h-4 w-4" />
        </Button>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Projeto atual</p>
          <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold leading-tight">{projectName ?? "Sem projeto"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm">
          <Link href={"/app/tasks" as Route}>
            <Plus className="mr-2 h-4 w-4" />
            Nova tarefa
          </Link>
        </Button>

        <span className="hidden text-sm text-muted-foreground lg:inline">{userEmail}</span>

        <form action="/api/auth/logout" method="post">
          <Button type="submit" size="sm" variant="outline">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
