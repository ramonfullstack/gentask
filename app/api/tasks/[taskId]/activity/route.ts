import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("task_activity")
    .select("id,event_type,field_name,old_value,new_value,created_at, actor:profiles!task_activity_actor_id_fkey(full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const actorNameFromRelation = (actor: { full_name: string | null } | { full_name: string | null }[] | null) => {
    if (!actor) return null;
    if (Array.isArray(actor)) return actor[0]?.full_name ?? null;
    return actor.full_name;
  };

  const formatted = (data ?? []).map((item) => ({
    id: item.id,
    event_type: item.event_type,
    field_name: item.field_name,
    old_value: item.old_value,
    new_value: item.new_value,
    created_at: item.created_at,
    actor_name: actorNameFromRelation(item.actor)
  }));

  return NextResponse.json(formatted);
}
