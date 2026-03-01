"use client";

import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AttachmentUpload({ taskId, workspaceId }: { taskId: string; workspaceId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const uploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    const path = `${workspaceId}/${taskId}/${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage.from("task-attachments").upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (storageError) {
      setError(storageError.message);
      setIsUploading(false);
      return;
    }

    const response = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `Anexo enviado: ${file.name}`,
        attachment: {
          fileName: file.name,
          filePath: path,
          fileSize: file.size,
          mimeType: file.type
        }
      })
    });

    if (!response.ok) {
      setError("Falha ao registrar anexo");
    }

    setIsUploading(false);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void uploadFile(file);
          }
        }}
      />

      <Button variant="outline" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
        <Paperclip className="mr-2 h-4 w-4" />
        {isUploading ? "Enviando..." : "Adicionar anexo"}
      </Button>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
