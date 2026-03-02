"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteTask, useUpdateTask } from "@/hooks/use-task-mutations";
import { type TaskDetail } from "@/hooks/use-task-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TaskEditorProps = {
  task: TaskDetail;
};

export function TaskEditor({ task }: TaskEditorProps) {
  const router = useRouter();
  const updateTask = useUpdateTask(task.id, task.project.id);
  const deleteTask = useDeleteTask(task.id, task.project.id);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [stageId, setStageId] = useState(task.stage_id);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [labels, setLabels] = useState(task.labels.join(", "));

  const checklistText = useMemo(
    () => task.checklist.map((item) => `${item.done ? "[x]" : "[ ]"} ${item.label}`).join("\n"),
    [task.checklist]
  );
  const [checklistInput, setChecklistInput] = useState(checklistText);

  const save = async () => {
    const checklist = checklistInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({
        id: crypto.randomUUID(),
        label: line.replace(/^\[(x| )\]\s*/i, "").trim(),
        done: /^\[x\]/i.test(line)
      }))
      .filter((item) => item.label.length > 0);

    await updateTask.mutateAsync({
      title,
      description: description || null,
      stageId,
      priority,
      dueDate: dueDate || null,
      labels: labels
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      checklist
    });
  };

  const remove = async () => {
    const confirmed = window.confirm("Deseja excluir esta tarefa?");
    if (!confirmed) {
      return;
    }

    await deleteTask.mutateAsync();
    router.push(`/app/projects/${task.project.id}`);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} />
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      </div>

      <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" />

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={stageId}
          onChange={(event) => setStageId(event.target.value)}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          {task.available_stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskDetail["priority"])}
          className="h-10 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <Input
        value={labels}
        onChange={(event) => setLabels(event.target.value)}
        placeholder="Labels separadas por vírgula (ex: ux,bug,backend)"
      />

      <Textarea
        value={checklistInput}
        onChange={(event) => setChecklistInput(event.target.value)}
        placeholder="Checklist por linha. Use [x] ou [ ] no início"
        className="min-h-32"
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={updateTask.isPending}>
          Salvar alterações
        </Button>
        <Button onClick={remove} variant="destructive" disabled={deleteTask.isPending}>
          Excluir tarefa
        </Button>
      </div>
    </div>
  );
}
