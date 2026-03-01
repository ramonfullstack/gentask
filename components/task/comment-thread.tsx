"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FormEvent, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { useCreateComment, useTaskComments } from "@/hooks/use-task-comments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function CommentThread({ taskId }: { taskId: string }) {
  const [content, setContent] = useState("");
  const { data, isLoading } = useTaskComments(taskId);
  const createComment = useCreateComment(taskId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createComment.mutateAsync(content);
    setContent("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Escreva um comentário..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            minLength={1}
            required
          />

          <Button type="submit" size="sm" disabled={createComment.isPending || !content.trim()}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            Publicar
          </Button>
        </form>

        {isLoading ? <p className="text-sm text-muted-foreground">Carregando comentários...</p> : null}

        <div className="space-y-3">
          {data?.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
              <p className="text-xs text-muted-foreground">
                {comment.author_name ?? "Usuário"} • {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
              <p className="mt-2 text-sm">{comment.content}</p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
