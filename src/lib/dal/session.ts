import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { previewViewer } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/types";

export const getOptionalViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured()) return previewViewer;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug, full_name, role, membership_status")
    .eq("id", data.claims.sub)
    .maybeSingle();

  if (!profile) return null;

  const role = profile.role === "admin" ? "admin" : "member";
  const status = profile.membership_status;
  const membershipStatus =
    status === "approved" || status === "rejected" || status === "suspended" || status === "pending"
      ? status
      : "pending";

  return {
    id: profile.id,
    email: typeof data.claims.email === "string" ? data.claims.email : "",
    fullName: profile.full_name,
    slug: profile.slug,
    role,
    membershipStatus,
    preview: false,
  };
});

export async function requireViewer() {
  const viewer = await getOptionalViewer();
  if (!viewer) redirect("/auth/login");
  return viewer;
}

export async function requireMember() {
  const viewer = await requireViewer();
  if (viewer.preview) return viewer;
  if (viewer.membershipStatus !== "approved") redirect("/portal/pending");
  return viewer;
}

export async function requireAdmin() {
  const viewer = await requireMember();
  if (!viewer.preview && viewer.role !== "admin") redirect("/portal");
  return viewer;
}
