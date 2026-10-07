import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  demoCompanies,
  demoEvents,
  demoInsights,
  demoMembers,
  demoOpportunities,
  demoPartners,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import {
  companySelect,
  eventSelect,
  mapCompany,
  mapEvent,
  mapInsight,
  mapMember,
  mapOpportunity,
  mapPartner,
  memberSelect,
  opportunitySelect,
} from "@/lib/dal/map";
import { createPublicClient } from "@/lib/supabase/public";
import type { Row } from "@/lib/dal/rows";

async function read(table: string, select: string, filters: Record<string, string | boolean>) {
  const supabase = createPublicClient();
  let query = supabase.from(table).select(select);
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message || "Could not read the collective catalogue.");
  return (data ?? []) as unknown as Row[];
}

export async function getPublicCompanies() {
  "use cache";
  cacheLife("minutes");
  cacheTag("companies");
  if (!isSupabaseConfigured()) return demoCompanies;
  const rows = await read("companies", companySelect, {
    status: "approved",
    visibility: "public",
  });
  return rows.map((row) => mapCompany(row)).sort((a, b) => Number(b.featured) - Number(a.featured));
}

export async function getPublicCompany(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("companies");
  if (!isSupabaseConfigured()) return demoCompanies.find((item) => item.slug === slug) ?? null;
  const rows = await read("companies", companySelect, { slug, status: "approved", visibility: "public" });
  const row = rows[0];
  return row ? mapCompany(row) : null;
}

export async function getPublicMembers() {
  "use cache";
  cacheLife("minutes");
  cacheTag("profiles");
  if (!isSupabaseConfigured()) {
    return demoMembers.filter((member) => member.isPublic && member.membershipStatus === "approved");
  }
  const rows = await read("profiles", memberSelect, {
    membership_status: "approved",
    is_public: true,
  });
  return rows.map((row) => mapMember(row));
}

export async function getFeaturedMembers() {
  const members = await getPublicMembers();
  const featured = members.filter((member) => member.featured);
  return (featured.length ? featured : members).slice(0, 5);
}

export async function getPublicMember(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("profiles");
  if (!isSupabaseConfigured()) {
    return (
      demoMembers.find(
        (member) => member.slug === slug && member.isPublic && member.membershipStatus === "approved",
      ) ?? null
    );
  }
  const rows = await read("profiles", memberSelect, {
    slug,
    membership_status: "approved",
    is_public: true,
  });
  const row = rows[0];
  return row ? mapMember(row) : null;
}

export async function getPublicOpportunities() {
  "use cache";
  cacheLife("minutes");
  cacheTag("opportunities");
  if (!isSupabaseConfigured()) {
    return demoOpportunities.filter((item) => item.visibility === "public" && item.status === "approved");
  }
  const rows = await read("opportunities", opportunitySelect, {
    status: "approved",
    visibility: "public",
  });
  return rows.map((row) => mapOpportunity(row));
}

export async function getPublicOpportunity(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("opportunities");
  if (!isSupabaseConfigured()) {
    return (
      demoOpportunities.find(
        (item) => item.slug === slug && item.visibility === "public" && item.status === "approved",
      ) ?? null
    );
  }
  const rows = await read("opportunities", opportunitySelect, {
    slug,
    status: "approved",
    visibility: "public",
  });
  const row = rows[0];
  return row ? mapOpportunity(row) : null;
}

export async function getPublicEvents() {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");
  if (!isSupabaseConfigured()) {
    return demoEvents.filter((event) => event.visibility === "public" && event.status === "published");
  }
  const rows = await read("events", eventSelect, { status: "published", visibility: "public" });
  return rows.map((row) => mapEvent(row)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getPublicEvent(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");
  if (!isSupabaseConfigured()) {
    return (
      demoEvents.find(
        (event) => event.slug === slug && event.visibility === "public" && event.status === "published",
      ) ?? null
    );
  }
  const rows = await read("events", eventSelect, { slug, status: "published", visibility: "public" });
  const row = rows[0];
  return row ? mapEvent(row) : null;
}

export async function getPublicPartners() {
  "use cache";
  cacheLife("minutes");
  cacheTag("partners");
  if (!isSupabaseConfigured()) return demoPartners;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, description, website, tier, is_featured, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message || "Could not read partners.");
  return ((data ?? []) as unknown as Row[]).map((row) => mapPartner(row));
}

export async function getPublicInsights() {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  if (!isSupabaseConfigured()) return demoInsights.filter((post) => post.visibility === "public");
  const rows = await read("posts", "id, slug, title, excerpt, body, published_at, is_featured, visibility, status", {
    status: "published",
    visibility: "public",
  });
  return rows.map((row) => mapInsight(row));
}

export async function getPublicInsight(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  if (!isSupabaseConfigured()) {
    return demoInsights.find((post) => post.slug === slug && post.visibility === "public") ?? null;
  }
  const rows = await read(
    "posts",
    "id, slug, title, excerpt, body, published_at, is_featured, visibility, status",
    { slug, status: "published", visibility: "public" },
  );
  const row = rows[0];
  return row ? mapInsight(row) : null;
}
