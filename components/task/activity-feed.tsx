"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTaskActivity } from "@/hooks/use-task-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

export function ActivityFeed({ taskId }: { taskId: string }) {
  const { data, isLoading, error } = useTaskActivity(taskId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Carregando atividade...</p> : null}
        {error ? <p className="text-sm text-destructive">Não foi possível carregar o histórico.</p> : null}

        {data?.map((item, index) => (
          <div key={item.id} className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {item.actor_name ?? "Usuário"} • <span className="text-muted-foreground">{item.event_type}</span>
              </p>

              {item.field_name ? (
                <p className="text-xs text-muted-foreground">
                  Campo: <span className="font-medium">{item.field_name}</span>
                </p>
              ) : null}

              <p className="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(new Date(item.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>

              <p className="text-xs">
                <span className="font-medium">Antes:</span> {toText(item.old_value)}
              </p>
              <p className="text-xs">
                <span className="font-medium">Depois:</span> {toText(item.new_value)}
              </p>
            </div>

            {index < (data.length - 1) ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
