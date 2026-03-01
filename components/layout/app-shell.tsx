import Link from "next/link";
import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export async function AppShell({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-card/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/app" className="text-lg font-semibold tracking-tight text-primary">
            GenTask
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user?.email}</span>
            <form action="/api/auth/logout" method="post">
              <Button type="submit" size="sm" variant="outline">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
