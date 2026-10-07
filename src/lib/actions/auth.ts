"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { field, previewBlock } from "@/lib/actions/shared";
import { safeInternalPath } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const credentials = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = previewBlock();
  if (blocked) return blocked;

  const parsed = credentials.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  redirect(safeInternalPath(formData.get("next")));
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = previewBlock();
  if (blocked) return blocked;

  const name = field(formData, "full_name");
  const parsed = credentials.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (name.length < 2) return { error: "Enter your name." };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: name },
    },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/portal");

  return {
    message:
      "Account requested. Confirm your email if asked, then sign in. Membership stays pending until an administrator approves it.",
  };
}

export async function signOut() {
  if (!previewBlock()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
