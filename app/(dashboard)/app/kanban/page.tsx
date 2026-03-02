import { PageContainer } from "@/components/layout/page-container";
import { ProjectKanban } from "@/components/task/project-kanban";
import { SectionCard } from "@/components/shared/section-card";
import { getWorkspaceContext } from "@/lib/projects/context";

type KanbanPageProps = {
  searchParams: Promise<{ project?: string }>;
};

export default async function KanbanPage({ searchParams }: KanbanPageProps) {
  const resolvedSearchParams = await searchParams;
  const context = await getWorkspaceContext(resolvedSearchParams.project);

  if (!context.currentProject) {
    return (
      <PageContainer title="Kanban" description="Quadro de tarefas por etapas dinâmicas.">
        <SectionCard title="Sem projeto" description="Não há projeto disponível no workspace atual.">
          <p className="text-sm text-muted-foreground">Crie um projeto para visualizar o Kanban.</p>
        </SectionCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Kanban" description="Fluxo visual com drag-and-drop entre etapas." >
      <ProjectKanban projectId={context.currentProject.id} projectName={context.currentProject.name} showHeader={false} />
    </PageContainer>
  );
}
