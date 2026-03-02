import { PageContainer } from "@/components/layout/page-container";
import { SectionCard } from "@/components/shared/section-card";
import { TasksListPage } from "@/components/task/tasks-list-page";
import { getWorkspaceContext } from "@/lib/projects/context";

type TasksPageProps = {
  searchParams: Promise<{ project?: string }>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const context = await getWorkspaceContext(resolvedSearchParams.project);

  if (!context.currentProject) {
    return (
      <PageContainer title="Tarefas" description="Lista de tarefas com filtros e busca.">
        <SectionCard title="Sem projeto" description="Não há projeto disponível no workspace atual.">
          <p className="text-sm text-muted-foreground">Crie um projeto para gerenciar tarefas nesta tela.</p>
        </SectionCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Tarefas" description="Visão tabular para produtividade e acompanhamento rápido.">
      <TasksListPage projectId={context.currentProject.id} />
    </PageContainer>
  );
}
