"use client";

import { FormEvent, useMemo, useState } from "react";
import { MoveVertical, Plus, Trash2 } from "lucide-react";
import { type KanbanTask, type WorkflowStage } from "@/hooks/use-project-kanban";
import { useCreateStage, useDeleteStage, useReorderStages, useUpdateStage } from "@/hooks/use-stage-mutations";
import { moveStageId } from "@/lib/stages/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type StageManagementProps = {
  projectId: string;
  stages: WorkflowStage[];
  tasks: KanbanTask[];
  canManageStages: boolean;
};

type StageRowProps = {
  projectId: string;
  stage: WorkflowStage;
  otherStages: WorkflowStage[];
  taskCount: number;
};

function StageRow({ projectId, stage, otherStages, taskCount }: StageRowProps) {
  const updateStage = useUpdateStage(projectId, stage.id);
  const deleteStage = useDeleteStage(projectId, stage.id);

  const [name, setName] = useState(stage.name);
  const [color, setColor] = useState(stage.color);
  const [isFinal, setIsFinal] = useState(stage.is_final);
  const [isActive, setIsActive] = useState(stage.is_active);
  const [destinationStageId, setDestinationStageId] = useState("");

  const save = async () => {
    await updateStage.mutateAsync({
      name,
      color,
      isFinal,
      isActive
    });
  };

  const remove = async () => {
    const confirmed = window.confirm(`Excluir etapa \"${stage.name}\"?`);
    if (!confirmed) {
      return;
    }

    if (taskCount > 0 && !destinationStageId) {
      window.alert("Selecione uma etapa de destino para migrar as tarefas antes de excluir.");
      return;
    }

    await deleteStage.mutateAsync({
      destinationStageId: destinationStageId || undefined
    });
  };

  return (
    <div className="grid gap-3 rounded-lg border border-border/70 p-3 md:grid-cols-[1.3fr_140px_120px_120px_auto]">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Nome</p>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Cor</p>
        <Input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 p-1" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Ativa
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isFinal} onChange={(event) => setIsFinal(event.target.checked)} />
        Final
      </label>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={save} disabled={updateStage.isPending}>
          Salvar
        </Button>
        <Button size="sm" variant="destructive" onClick={remove} disabled={deleteStage.isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {taskCount > 0 ? (
        <div className="md:col-span-5">
          <p className="mb-1 text-xs text-muted-foreground">Etapa possui {taskCount} tarefa(s). Selecione destino para excluir:</p>
          <select
            value={destinationStageId}
            onChange={(event) => setDestinationStageId(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="">Selecione etapa de destino</option>
            {otherStages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}

export function StageManagement({ projectId, stages, tasks, canManageStages }: StageManagementProps) {
  const createStage = useCreateStage(projectId);
  const reorderStages = useReorderStages(projectId);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#64748b");
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);

  const orderedStages = useMemo(() => [...stages].sort((a, b) => a.position - b.position), [stages]);
  const taskCountByStage = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((task) => {
      map.set(task.stage_id, (map.get(task.stage_id) ?? 0) + 1);
    });
    return map;
  }, [tasks]);

  if (!canManageStages) {
    return null;
  }

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createStage.mutateAsync({ name, color });
    setName("");
    setColor("#64748b");
  };

  const onDropStage = async (targetStageId: string) => {
    if (!draggedStageId || draggedStageId === targetStageId) {
      return;
    }

    const reorderedIds = moveStageId(
      orderedStages.map((stage) => stage.id),
      draggedStageId,
      targetStageId
    );

    await reorderStages.mutateAsync({ stageIds: reorderedIds });
    setDraggedStageId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Etapas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onCreate} className="grid gap-3 rounded-lg border border-border/70 p-3 md:grid-cols-[1fr_140px_auto]">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nova etapa (ex: Em homologação)"
            minLength={2}
            required
          />
          <Input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 p-1" />
          <Button type="submit" disabled={createStage.isPending || !name.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Criar etapa
          </Button>
        </form>

        <div className="space-y-3">
          {orderedStages.map((stage) => (
            <div
              key={stage.id}
              draggable
              onDragStart={() => setDraggedStageId(stage.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => void onDropStage(stage.id)}
              className="space-y-2"
            >
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MoveVertical className="h-3 w-3" />
                Arraste para reordenar
              </p>

              <StageRow
                projectId={projectId}
                stage={stage}
                otherStages={orderedStages.filter((item) => item.id !== stage.id)}
                taskCount={taskCountByStage.get(stage.id) ?? 0}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
