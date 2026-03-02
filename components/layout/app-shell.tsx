import type { ReactNode } from "react";
import { getWorkspaceContext } from "@/lib/projects/context";
import { AppShellLayout } from "@/components/layout/app-shell-layout";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const context = await getWorkspaceContext();

  return <AppShellLayout userEmail={context.userEmail} projectName={context.currentProject?.name ?? null}>{children}</AppShellLayout>;
}
