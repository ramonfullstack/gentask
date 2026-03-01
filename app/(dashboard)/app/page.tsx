import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum workspace encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Crie um workspace via seed inicial ou painel SQL do Supabase.</p>
        </CardContent>
      </Card>
    );
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("workspace_id", membership.workspace_id)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-4">
      <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight">Projetos</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {projects?.map((project) => (
          <Link key={project.id} href={`/app/projects/${project.id}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/40">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
