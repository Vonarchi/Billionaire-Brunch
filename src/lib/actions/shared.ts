import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import type { ActionState } from "@/lib/types";

export function previewBlock(): ActionState | null {
  if (!isSupabaseConfigured()) {
    return {
      error: "This could not be saved.",
    };
  }
  return null;
}

export function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function honeypot(formData: FormData): ActionState | null {
  if (field(formData, "company_website")) {
    return { message: "Received." };
  }
  return null;
}
