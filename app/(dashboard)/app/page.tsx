import Link from "next/link";
import type { Route } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionCard } from "@/components/shared/section-card";
import { getWorkspaceContext } from "@/lib/projects/context";

export default async function DashboardHomePage() {
  const context = await getWorkspaceContext();

  if (!context.currentProject) {
    return (
      <PageContainer title="Visão Geral" description="Nenhum projeto encontrado no workspace atual.">
        <SectionCard title="Sem projetos" description="Execute as migrations + seed no Supabase para criar o projeto inicial.">
          <p className="text-sm text-muted-foreground">Após criar um projeto, você poderá acessar Kanban, Tarefas e Configurações.</p>
        </SectionCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Visão Geral" description="Acesse rapidamente os principais módulos de trabalho do projeto.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href={"/app/kanban" as Route}>
          <SectionCard title="Kanban" description="Visual do fluxo e movimentação entre etapas.">
            <p className="text-sm text-muted-foreground">Abrir quadro dinâmico</p>
          </SectionCard>
        </Link>

        <Link href={"/app/tasks" as Route}>
          <SectionCard title="Tarefas" description="Lista com busca, filtros e acesso rápido aos detalhes.">
            <p className="text-sm text-muted-foreground">Abrir lista de tarefas</p>
          </SectionCard>
        </Link>

        <Link href={"/app/settings/workflow" as Route}>
          <SectionCard title="Workflow" description="Gerencie etapas, ordem e políticas do fluxo.">
            <p className="text-sm text-muted-foreground">Abrir configurações de workflow</p>
          </SectionCard>
        </Link>

        <Link href={"/app/settings/project" as Route}>
          <SectionCard title="Projeto" description="Informações e configurações gerais do projeto atual.">
            <p className="text-sm text-muted-foreground">Abrir configurações de projeto</p>
          </SectionCard>
        </Link>
      </div>
    </PageContainer>
  );
}
