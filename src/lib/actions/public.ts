"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { field, honeypot, previewBlock } from "@/lib/actions/shared";
import { getOptionalViewer } from "@/lib/dal/session";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const interestSchema = z.object({
  opportunityId: z.string().uuid(),
  message: z.string().min(2, "Add a short note.").max(2000),
  guestName: z.string().max(120).optional(),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestCompany: z.string().max(160).optional(),
});

export async function expressInterest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const spam = honeypot(formData);
  if (spam) return spam;
  const blocked = previewBlock();
  if (blocked) return { error: "This could not be sent." };

  const viewer = await getOptionalViewer();
  const parsed = interestSchema.safeParse({
    opportunityId: field(formData, "opportunity_id"),
    message: field(formData, "message"),
    guestName: field(formData, "guest_name"),
    guestEmail: field(formData, "guest_email"),
    guestCompany: field(formData, "guest_company"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!viewer?.id || viewer.preview) {
    if (!parsed.data.guestName || !parsed.data.guestEmail) {
      return { error: "Name and email are required." };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("opportunity_interest").insert({
    opportunity_id: parsed.data.opportunityId,
    profile_id: viewer && !viewer.preview ? viewer.id : null,
    guest_name: parsed.data.guestName || null,
    guest_email: parsed.data.guestEmail || null,
    guest_company: parsed.data.guestCompany || null,
    message: parsed.data.message,
  });
  if (error) return { error: error.message };
  return { message: "Interest received. The collective will follow up if there is a fit." };
}

export async function registerForEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const spam = honeypot(formData);
  if (spam) return spam;
  const blocked = previewBlock();
  if (blocked) return { error: "This request could not be sent." };

  const eventId = field(formData, "event_id");
  if (!z.string().uuid().safeParse(eventId).success) return { error: "Choose an event." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_guest_name: field(formData, "guest_name") || null,
    p_guest_email: field(formData, "guest_email") || null,
    p_guest_company: field(formData, "guest_company") || null,
    p_guest_title: field(formData, "guest_title") || null,
    p_referral_source: field(formData, "referral_source") || null,
  });
  if (error) return { error: error.message };

  const status = typeof data === "object" && data && "status" in data ? String(data.status) : "received";
  const note =
    status === "waitlisted"
      ? "The room is full. You are on the waitlist."
      : status === "pending"
        ? "Request received. Attendance is confirmed after approval."
        : "You are registered.";
  return { message: note };
}

export async function submitInquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const spam = honeypot(formData);
  if (spam) return spam;
  const blocked = previewBlock();
  if (blocked) return { error: "This note could not be sent." };

  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      organization: z.string().max(160),
      interest: z.string().min(2).max(80),
      message: z.string().min(2).max(4000),
    })
    .safeParse({
      name: field(formData, "name"),
      email: field(formData, "email"),
      organization: field(formData, "organization"),
      interest: field(formData, "interest"),
      message: field(formData, "message"),
    });
  if (!parsed.success) return { error: "Name, email, interest, and a message are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert(parsed.data);
  if (error) return { error: error.message };
  updateTag("inquiries");
  return { message: "Received. If there is a fit, the collective will reply." };
}
