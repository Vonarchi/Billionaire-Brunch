"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { field, previewBlock } from "@/lib/actions/shared";
import { requireMember } from "@/lib/dal/session";
import { parseList, slugify } from "@/lib/format";
import { OPPORTUNITY_TYPES, VISIBILITIES } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

function configured(): ActionState | null {
  return previewBlock();
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  const viewer = await requireMember();
  const fullName = field(formData, "full_name");
  if (fullName.length < 2) return { error: "Enter your name." };

  const slug = slugify(field(formData, "slug") || fullName);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      slug,
      title: field(formData, "title"),
      bio: field(formData, "bio"),
      city: field(formData, "city") || null,
      photo_url: field(formData, "photo_url") || null,
      expertise: parseList(formData.get("expertise")),
      industries: parseList(formData.get("industries")),
      i_have: field(formData, "i_have"),
      i_need: field(formData, "i_need"),
      is_public: formData.get("is_public") === "on",
      social_links: {
        linkedin: field(formData, "linkedin") || undefined,
        x: field(formData, "x") || undefined,
        instagram: field(formData, "instagram") || undefined,
        website: field(formData, "website") || undefined,
      },
    })
    .eq("id", viewer.id);

  if (error) return { error: error.message };
  updateTag("profiles");
  return { message: "Profile updated." };
}

export async function createCompany(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  const viewer = await requireMember();
  const name = field(formData, "name");
  if (name.length < 2) return { error: "Enter a company name." };
  const slug = slugify(field(formData, "slug") || name);
  const visibility = field(formData, "visibility");
  if (!VISIBILITIES.some(([value]) => value === visibility)) return { error: "Choose a visibility." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name,
      slug,
      description: field(formData, "description"),
      industry: field(formData, "industry"),
      stage: field(formData, "stage"),
      services: parseList(formData.get("services")),
      website: field(formData, "website") || null,
      visibility,
      created_by: viewer.id,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const { error: memberError } = await supabase.from("company_members").insert({
    company_id: data.id,
    profile_id: viewer.id,
    member_role: "founder",
    title: field(formData, "title") || "Founder",
    is_founder: true,
  });
  if (memberError) return { error: memberError.message };

  updateTag("companies");
  redirect(`/portal/companies/${data.id}`);
}

export async function updateCompany(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  await requireMember();
  const id = field(formData, "company_id");
  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({
      name: field(formData, "name"),
      description: field(formData, "description"),
      industry: field(formData, "industry"),
      stage: field(formData, "stage"),
      services: parseList(formData.get("services")),
      website: field(formData, "website") || null,
      logo_url: field(formData, "logo_url") || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  updateTag("companies");
  return { message: "Company updated. Public listing still requires administrator approval." };
}

export async function addMetric(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  await requireMember();
  const label = field(formData, "label");
  const value = field(formData, "value");
  if (!label || !value) return { error: "Add a label and a value." };
  const supabase = await createClient();
  const { error } = await supabase.from("company_metrics").insert({
    company_id: field(formData, "company_id"),
    label,
    value,
  });
  if (error) return { error: error.message };
  updateTag("companies");
  return { message: "Metric added." };
}

export async function addAchievement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  await requireMember();
  const title = field(formData, "title");
  if (title.length < 2) return { error: "Name the achievement." };
  const year = Number(field(formData, "year"));
  const supabase = await createClient();
  const { error } = await supabase.from("achievements").insert({
    company_id: field(formData, "company_id"),
    title,
    description: field(formData, "description"),
    year: Number.isFinite(year) && year > 1900 ? year : null,
  });
  if (error) return { error: error.message };
  updateTag("companies");
  return { message: "Achievement added." };
}

export async function createOpportunity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  const viewer = await requireMember();
  const title = field(formData, "title");
  const type = field(formData, "opportunity_type");
  const visibility = field(formData, "visibility");
  if (title.length < 4) return { error: "Give the opportunity a title." };
  if (!OPPORTUNITY_TYPES.some(([value]) => value === type)) return { error: "Choose a type." };
  if (!VISIBILITIES.some(([value]) => value === visibility)) return { error: "Choose a visibility." };

  const companyId = field(formData, "company_id");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      title,
      slug: `${slugify(title)}-${Date.now().toString(36).slice(-4)}`,
      summary: field(formData, "summary"),
      description: field(formData, "description"),
      opportunity_type: type,
      visibility,
      company_id: companyId || null,
      location: field(formData, "location") || null,
      deadline: field(formData, "deadline") || null,
      created_by: viewer.id,
    })
    .select("slug")
    .single();
  if (error) return { error: error.message };
  updateTag("opportunities");
  redirect(`/portal/opportunities/${data.slug}`);
}

export async function requestIntroduction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  const viewer = await requireMember();
  const recipient = field(formData, "recipient_id");
  const subject = field(formData, "subject");
  const message = field(formData, "message");
  if (!z.string().uuid().safeParse(recipient).success) return { error: "Choose a member." };
  if (subject.length < 3 || message.length < 3) return { error: "Add a subject and context." };

  const supabase = await createClient();
  const { error } = await supabase.from("introductions").insert({
    requester_id: viewer.id,
    recipient_id: recipient,
    subject,
    message,
  });
  if (error) return { error: error.message };
  return { message: "Introduction requested." };
}

export async function setIntroductionStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  await requireMember();
  const status = field(formData, "status");
  if (!["accepted", "declined", "completed", "requested"].includes(status)) {
    return { error: "Unknown status." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("introductions").update({ status }).eq("id", field(formData, "id"));
  if (error) return { error: error.message };
  return { message: "Introduction updated." };
}

export async function createDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = configured();
  if (blocked) return blocked;
  const viewer = await requireMember();
  const title = field(formData, "title");
  const filePath = field(formData, "file_path");
  if (title.length < 2 || !filePath.startsWith(`${viewer.id}/`)) {
    return { error: "Upload a file before saving the record." };
  }
  const visibility = field(formData, "visibility") === "private" ? "private" : "members";
  const supabase = await createClient();
  const { error } = await supabase.from("documents").insert({
    title,
    description: field(formData, "description"),
    file_path: filePath,
    visibility,
    uploaded_by: viewer.id,
  });
  if (error) return { error: error.message };
  return { message: "Document added." };
}
