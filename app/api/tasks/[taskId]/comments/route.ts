import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createCommentSchema } from "@/lib/validations/task";

const createCommentWithAttachmentSchema = createCommentSchema.extend({
  attachment: z
    .object({
      fileName: z.string().min(1),
      filePath: z.string().min(1),
      fileSize: z.number().int().nonnegative(),
      mimeType: z.string().min(1)
    })
    .optional()
});

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("task_comments")
    .select("id,content,created_at,author:profiles!task_comments_author_id_fkey(full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const authorNameFromRelation = (author: { full_name: string | null } | { full_name: string | null }[] | null) => {
    if (!author) return null;
    if (Array.isArray(author)) return author[0]?.full_name ?? null;
    return author.full_name;
  };

  const formatted = (data ?? []).map((item) => ({
    id: item.id,
    content: item.content,
    created_at: item.created_at,
    author_name: authorNameFromRelation(item.author)
  }));

  return NextResponse.json(formatted);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createClient();

  const json = await request.json();
  const parsed = createCommentWithAttachmentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ issues: parsed.error.flatten() }, { status: 400 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, workspace_id")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
  }

  const { data: comment, error } = await supabase
    .from("task_comments")
    .insert({
      workspace_id: task.workspace_id,
      task_id: taskId,
      author_id: user.id,
      content: parsed.data.content
    })
    .select("id, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (parsed.data.attachment) {
    await supabase.from("task_attachments").insert({
      workspace_id: task.workspace_id,
      task_id: taskId,
      uploader_id: user.id,
      file_name: parsed.data.attachment.fileName,
      file_path: parsed.data.attachment.filePath,
      file_size: parsed.data.attachment.fileSize,
      mime_type: parsed.data.attachment.mimeType
    });
  }

  await supabase.from("task_activity").insert({
    workspace_id: task.workspace_id,
    task_id: taskId,
    actor_id: user.id,
    event_type: parsed.data.attachment ? "attachment.added" : "comment.added",
    old_value: null,
    new_value: parsed.data
  });

  return NextResponse.json(comment, { status: 201 });
}
