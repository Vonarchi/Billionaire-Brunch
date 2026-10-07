"use server";

import { updateTag } from "next/cache";
import { field, previewBlock } from "@/lib/actions/shared";
import { requireAdmin } from "@/lib/dal/session";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

async function adminClient(): Promise<
  { ok: false; error: ActionState } | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
> {
  const blocked = previewBlock();
  if (blocked) return { ok: false, error: blocked };
  await requireAdmin();
  return { ok: true, supabase: await createClient() };
}

async function patch(
  table: string,
  id: string,
  values: Record<string, string | boolean | null>,
  tag: string,
): Promise<ActionState> {
  const gate = await adminClient();
  if (!gate.ok) return gate.error;
  const { error } = await gate.supabase.from(table).update(values).eq("id", id);
  if (error) return { error: error.message };
  updateTag(tag);
  return { message: "Saved." };
}

export async function setMemberStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const status = field(formData, "status");
  if (!["approved", "rejected", "suspended", "pending"].includes(status)) return { error: "Unknown status." };
  return patch("profiles", field(formData, "id"), { membership_status: status }, "profiles");
}

export async function setFeatured(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const table = field(formData, "table");
  const tag =
    table === "profiles" ? "profiles" : table === "companies" ? "companies" : table === "opportunities" ? "opportunities" : table === "posts" ? "posts" : "events";
  if (!["profiles", "companies", "opportunities", "posts", "events", "partners"].includes(table)) {
    return { error: "Unknown record." };
  }
  return patch(table, field(formData, "id"), { is_featured: formData.get("featured") === "true" }, tag);
}

export async function setRecordState(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const table = field(formData, "table");
  const allowed = ["companies", "opportunities", "events", "posts", "partners"];
  if (!allowed.includes(table)) return { error: "Unknown record." };
  const values: Record<string, string | boolean | null> = {};
  const status = field(formData, "status");
  const visibility = field(formData, "visibility");
  if (status) values.status = status;
  if (visibility) values.visibility = visibility;
  if (table === "partners" && field(formData, "is_active")) {
    values.is_active = formData.get("is_active") === "true";
  }
  const tag = table === "posts" ? "posts" : table;
  return patch(table, field(formData, "id"), values, tag);
}

export async function setRegistrationStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const status = field(formData, "status");
  if (!["approved", "waitlisted", "declined", "cancelled"].includes(status)) return { error: "Unknown status." };
  return patch("event_registrations", field(formData, "id"), { status }, "events");
}

export async function createEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await adminClient();
  if (!gate.ok) return gate.error;
  const title = field(formData, "title");
  const starts = field(formData, "starts_at");
  const capacity = Number(field(formData, "capacity"));
  if (title.length < 3 || !starts || !Number.isFinite(capacity) || capacity < 1) {
    return { error: "Title, date, and capacity are required." };
  }
  const { error } = await gate.supabase.from("events").insert({
    title,
    slug: slugify(title),
    series: field(formData, "series") || null,
    description: field(formData, "description"),
    starts_at: new Date(starts).toISOString(),
    location: field(formData, "location"),
    capacity,
    invite_only: formData.get("invite_only") === "on",
    requires_approval: formData.get("requires_approval") === "on",
    visibility: field(formData, "visibility") || "members",
    status: "published",
    is_featured: field(formData, "series").toLowerCase().includes("capital table"),
  });
  if (error) return { error: error.message };
  updateTag("events");
  return { message: "Event published." };
}

export async function createPartner(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await adminClient();
  if (!gate.ok) return gate.error;
  const name = field(formData, "name");
  if (name.length < 2) return { error: "Name the partner." };
  const { error } = await gate.supabase.from("partners").insert({
    name,
    description: field(formData, "description"),
    website: field(formData, "website") || null,
    tier: field(formData, "tier") || "Strategic",
    is_featured: formData.get("is_featured") === "on",
  });
  if (error) return { error: error.message };
  updateTag("partners");
  return { message: "Partner added." };
}

export async function publishPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await adminClient();
  if (!gate.ok) return gate.error;
  const title = field(formData, "title");
  if (title.length < 3) return { error: "Add a title." };
  const { error } = await gate.supabase.from("posts").insert({
    title,
    slug: slugify(title),
    excerpt: field(formData, "excerpt"),
    body: field(formData, "body"),
    visibility: field(formData, "visibility") || "public",
    status: "published",
    published_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  updateTag("posts");
  return { message: "Insight published." };
}

export async function createResource(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await adminClient();
  if (!gate.ok) return gate.error;
  const title = field(formData, "title");
  if (title.length < 2) return { error: "Name the resource." };
  const { error } = await gate.supabase.from("resources").insert({
    title,
    summary: field(formData, "summary"),
    url: field(formData, "url") || null,
    category: field(formData, "category") || "General",
    visibility: "members",
    status: "published",
  });
  if (error) return { error: error.message };
  return { message: "Resource published." };
}

export async function assignSponsor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await adminClient();
  if (!gate.ok) return gate.error;
  const { error } = await gate.supabase.from("event_sponsors").insert({
    event_id: field(formData, "event_id"),
    partner_id: field(formData, "partner_id"),
  });
  if (error) return { error: error.message };
  updateTag("events");
  return { message: "Sponsor assigned." };
}
