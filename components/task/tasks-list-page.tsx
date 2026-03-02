"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { useProjectKanban } from "@/hooks/use-project-kanban";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type TasksListPageProps = {
  projectId: string;
};

type SortMode = "updated_desc" | "priority_desc" | "due_asc";

const priorityOrder: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

export function TasksListPage({ projectId }: TasksListPageProps) {
  const { data, isLoading, error } = useProjectKanban(projectId);
  const [search, setSearch] = useState("");
  const [stageIdFilter, setStageIdFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("updated_desc");

  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();

    (data?.tasks ?? []).forEach((task) => {
      if (task.assignee?.id) {
        map.set(task.assignee.id, task.assignee.full_name ?? "Sem nome");
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data?.tasks]);

  const filteredTasks = useMemo(() => {
    const rows = (data?.tasks ?? []).filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || (task.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageIdFilter === "all" || task.stage_id === stageIdFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === "all" || task.assignee_id === assigneeFilter;

      return matchesSearch && matchesStage && matchesPriority && matchesAssignee;
    });

    rows.sort((a, b) => {
      if (sortMode === "updated_desc") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }

      if (sortMode === "priority_desc") {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      const aDue = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });

    return rows;
  }, [assigneeFilter, data?.tasks, priorityFilter, search, sortMode, stageIdFilter]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando tarefas...</p>;
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Não foi possível carregar tarefas.
      </div>
    );
  }

  if (data.tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada neste projeto.</p>;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-border/70 bg-card/70 p-4 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título/descrição" />
        </label>

        <select
          value={stageIdFilter}
          onChange={(event) => setStageIdFilter(event.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">Todas etapas</option>
          {data.stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">Todas prioridades</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(event) => setAssigneeFilter(event.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="all">Todos responsáveis</option>
          {assigneeOptions.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name}
            </option>
          ))}
        </select>

        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="updated_desc">Mais recentes</option>
          <option value="priority_desc">Prioridade</option>
          <option value="due_asc">Prazo</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/70 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Tarefa</th>
              <th className="px-4 py-3">Etapa</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => {
              const stage = data.stages.find((item) => item.id === task.stage_id);

              return (
                <tr key={task.id} className="border-t border-border/70">
                  <td className="px-4 py-3">
                    <Link href={`/app/tasks/${task.id}`} className="font-medium hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" style={{ borderColor: stage?.color }}>
                      {stage?.name ?? "Sem etapa"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{task.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{task.assignee?.full_name ?? "Não definido"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "Sem data"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTasks.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted-foreground">Nenhuma tarefa encontrada com os filtros atuais.</p>
        ) : null}
      </div>
    </section>
  );
}
