"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTask } from "@/hooks/use-task-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateTaskForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const createTask = useCreateTask(projectId);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await createTask.mutateAsync({
      title,
      description: description || null,
      dueDate: dueDate || null,
      labels: []
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-border/70 bg-card/70 p-4 md:grid-cols-[1fr_2fr_auto]">
      <Input placeholder="Título da tarefa" value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} required />
      <div className="grid gap-2 sm:grid-cols-2">
        <Textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-10"
        />
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      </div>
      <Button type="submit" disabled={createTask.isPending || !title.trim()}>
        Criar tarefa
      </Button>
    </form>
  );
}
