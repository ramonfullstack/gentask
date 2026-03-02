import { PageContainer } from "@/components/layout/page-container";
import { SectionCard } from "@/components/shared/section-card";
import { WorkflowSettingsPage } from "@/components/task/workflow-settings-page";
import { getWorkspaceContext } from "@/lib/projects/context";

type WorkflowSettingsRoutePageProps = {
  searchParams: Promise<{ project?: string }>;
};

export default async function WorkflowSettingsRoutePage({ searchParams }: WorkflowSettingsRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const context = await getWorkspaceContext(resolvedSearchParams.project);

  if (!context.currentProject) {
    return (
      <PageContainer title="Workflow" description="Gerencie etapas e ordem do fluxo.">
        <SectionCard title="Sem projeto" description="Não há projeto disponível no workspace atual.">
          <p className="text-sm text-muted-foreground">Crie um projeto para configurar workflow.</p>
        </SectionCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Workflow" description="Crie, edite, reordene e desative etapas do fluxo de tarefas.">
      <WorkflowSettingsPage projectId={context.currentProject.id} />
    </PageContainer>
  );
}
