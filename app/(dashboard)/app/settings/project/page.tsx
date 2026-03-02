import { PageContainer } from "@/components/layout/page-container";
import { SectionCard } from "@/components/shared/section-card";
import { getWorkspaceContext } from "@/lib/projects/context";

type ProjectSettingsPageProps = {
  searchParams: Promise<{ project?: string }>;
};

export default async function ProjectSettingsPage({ searchParams }: ProjectSettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const context = await getWorkspaceContext(resolvedSearchParams.project);

  if (!context.currentProject) {
    return (
      <PageContainer title="Projeto" description="Configurações gerais do projeto.">
        <SectionCard title="Sem projeto" description="Não há projeto disponível no workspace atual.">
          <p className="text-sm text-muted-foreground">Crie um projeto para habilitar as configurações gerais.</p>
        </SectionCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Projeto" description="Informações base e contexto do projeto atualmente selecionado.">
      <SectionCard title="Dados do projeto" description="Visão geral de identificação do projeto.">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Nome</dt>
            <dd className="mt-1 font-medium">{context.currentProject.name}</dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">ID</dt>
            <dd className="mt-1 break-all text-muted-foreground">{context.currentProject.id}</dd>
          </div>

          <div className="md:col-span-2">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Descrição</dt>
            <dd className="mt-1 text-muted-foreground">{context.currentProject.description ?? "Sem descrição cadastrada."}</dd>
          </div>
        </dl>
      </SectionCard>
    </PageContainer>
  );
}
