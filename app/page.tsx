import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
      <div className="max-w-2xl space-y-6 rounded-2xl border border-border/70 bg-card/70 p-10 backdrop-blur">
        <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          SaaS de gestão de tarefas
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-semibold tracking-tight sm:text-5xl">
          GenTask: detalhe de tarefas com activity feed em tempo real.
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Workspaces multi-tenant com Supabase Auth + RLS, timeline de eventos por tarefa, comentários, anexos e colaboração por papéis.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/signup">Criar conta</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
