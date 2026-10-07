"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { createDocument } from "@/lib/actions/member";
import { createClient } from "@/lib/supabase/client";

export function DocumentForm({ configured, userId }: { configured: boolean; userId: string }) {
  const [path, setPath] = useState("");
  const [note, setNote] = useState("");

  async function onFile(file: File | undefined) {
    if (!file || !configured) return;
    setNote("Uploading…");
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${userId}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("documents").upload(filePath, file, { upsert: false });
    if (error) {
      setNote(error.message);
      setPath("");
      return;
    }
    setPath(filePath);
    setNote("File stored. Save the record to list it.");
  }

  return (
    <ActionForm action={createDocument} submitLabel="Save document">
      <label>
        Title
        <input name="title" required />
      </label>
      <label>
        Description
        <textarea name="description" />
      </label>
      <label>
        Visibility
        <select name="visibility" defaultValue="members">
          <option value="members">Members only</option>
          <option value="private">Private</option>
        </select>
      </label>
      <label>
        File
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => onFile(event.target.files?.[0])}
          disabled={!configured}
        />
      </label>
      <input type="hidden" name="file_path" value={path} />
      {note ? <p className="quiet">{note}</p> : null}
      {!configured ? <p className="quiet">Connect Supabase to upload files.</p> : null}
    </ActionForm>
  );
}
