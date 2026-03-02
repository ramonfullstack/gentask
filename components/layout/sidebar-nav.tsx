"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListChecks, Settings2, SlidersHorizontal } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  onNavigate?: () => void;
};

type NavItem = {
  label: string;
  href: "/app" | "/app/kanban" | "/app/tasks" | "/app/settings/workflow" | "/app/settings/project";
  icon: ComponentType<{ className?: string }>;
  matcher: RegExp;
};

const overviewItems: NavItem[] = [
  {
    label: "Visão Geral",
    href: "/app",
    icon: LayoutGrid,
    matcher: /^\/app$/
  }
];

const workItems: NavItem[] = [
  {
    label: "Kanban",
    href: "/app/kanban",
    icon: SlidersHorizontal,
    matcher: /^\/app\/kanban/
  },
  {
    label: "Tarefas",
    href: "/app/tasks",
    icon: ListChecks,
    matcher: /^\/app\/tasks/
  }
];

const settingsItems: NavItem[] = [
  {
    label: "Workflow",
    href: "/app/settings/workflow",
    icon: Settings2,
    matcher: /^\/app\/settings\/workflow/
  },
  {
    label: "Projeto",
    href: "/app/settings/project",
    icon: Settings2,
    matcher: /^\/app\/settings\/project/
  }
];

function NavSection({ title, items, pathname, onNavigate }: { title: string; items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <section className="space-y-1.5">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = item.matcher.test(pathname);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href as Route}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
                onClick={onNavigate}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <NavSection title="Visão" items={overviewItems} pathname={pathname} onNavigate={onNavigate} />
      <NavSection title="Trabalho" items={workItems} pathname={pathname} onNavigate={onNavigate} />
      <NavSection title="Configurações" items={settingsItems} pathname={pathname} onNavigate={onNavigate} />
    </div>
  );
}
