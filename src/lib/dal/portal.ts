import "server-only";
import {
  demoCompanies,
  demoDocuments,
  demoEvents,
  demoInquiries,
  demoInsights,
  demoIntroductions,
  demoMembers,
  demoOpportunities,
  demoPartners,
  demoPendingMember,
  demoPendingRegistrations,
  demoResources,
} from "@/lib/demo-data";
import {
  companySelect,
  eventSelect,
  mapCompany,
  mapEvent,
  mapInsight,
  mapMember,
  mapOpportunity,
  memberSelect,
  opportunitySelect,
} from "@/lib/dal/map";
import type { Row } from "@/lib/dal/rows";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type {
  Inquiry,
  IntroductionItem,
  PortalDocument,
  RegistrationItem,
  ResourceItem,
  Viewer,
} from "@/lib/types";

async function db() {
  return createClient();
}

export async function getDirectory() {
  if (!isSupabaseConfigured()) {
    return demoMembers.filter((member) => member.membershipStatus === "approved");
  }
  const supabase = await db();
  const { data, error } = await supabase
    .from("profiles")
    .select(memberSelect)
    .eq("membership_status", "approved")
    .order("full_name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[]).map((row) => mapMember(row));
}

export async function getMemberForViewer(slug: string) {
  if (!isSupabaseConfigured()) return demoMembers.find((member) => member.slug === slug) ?? null;
  const supabase = await db();
  const { data, error } = await supabase.from("profiles").select(memberSelect).eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapMember(data as unknown as Row) : null;
}

export async function getCompaniesForViewer() {
  if (!isSupabaseConfigured()) return demoCompanies;
  const supabase = await db();
  const { data, error } = await supabase.from("companies").select(companySelect).order("name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[]).map((row) => mapCompany(row));
}

export async function getCompanyForViewer(slug: string) {
  if (!isSupabaseConfigured()) return demoCompanies.find((company) => company.slug === slug) ?? null;
  const supabase = await db();
  const { data, error } = await supabase.from("companies").select(companySelect).eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCompany(data as unknown as Row) : null;
}

export async function getCompanyById(id: string) {
  if (!isSupabaseConfigured()) return demoCompanies.find((company) => company.id === id) ?? null;
  const supabase = await db();
  const { data, error } = await supabase.from("companies").select(companySelect).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCompany(data as unknown as Row) : null;
}

export async function getOpportunitiesForViewer() {
  if (!isSupabaseConfigured()) return demoOpportunities.filter((item) => item.status === "approved");
  const supabase = await db();
  const { data, error } = await supabase
    .from("opportunities")
    .select(opportunitySelect)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[]).map((row) => mapOpportunity(row));
}

export async function getOpportunityForViewer(slug: string) {
  if (!isSupabaseConfigured()) return demoOpportunities.find((item) => item.slug === slug) ?? null;
  const supabase = await db();
  const { data, error } = await supabase
    .from("opportunities")
    .select(opportunitySelect)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOpportunity(data as unknown as Row) : null;
}

export async function getEventsForViewer() {
  if (!isSupabaseConfigured()) return demoEvents.filter((event) => event.status === "published");
  const supabase = await db();
  const { data, error } = await supabase
    .from("events")
    .select(eventSelect)
    .eq("status", "published")
    .order("starts_at");
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[]).map((row) => mapEvent(row));
}

export async function getEventForViewer(slug: string) {
  if (!isSupabaseConfigured()) return demoEvents.find((event) => event.slug === slug) ?? null;
  const supabase = await db();
  const { data, error } = await supabase.from("events").select(eventSelect).eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapEvent(data as unknown as Row) : null;
}

export async function getInsightsForViewer() {
  if (!isSupabaseConfigured()) return demoInsights;
  const supabase = await db();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, body, published_at, is_featured, visibility, status")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[]).map((row) => mapInsight(row));
}

export async function getInsightForViewer(slug: string) {
  if (!isSupabaseConfigured()) return demoInsights.find((post) => post.slug === slug) ?? null;
  const supabase = await db();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, body, published_at, is_featured, visibility, status")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapInsight(data as unknown as Row) : null;
}

export async function getResources() {
  if (!isSupabaseConfigured()) return demoResources;
  const supabase = await db();
  const { data, error } = await supabase
    .from("resources")
    .select("id, title, summary, url, category")
    .eq("status", "published")
    .order("category");
  if (error) throw new Error(error.message);
  return (data ?? []) as ResourceItem[];
}

export async function getDocuments() {
  if (!isSupabaseConfigured()) return demoDocuments;
  const supabase = await db();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, description, visibility, file_path, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[]).map(
    (row): PortalDocument => ({
      id: String(row.id),
      title: String(row.title),
      description: String(row.description ?? ""),
      visibility: (row.visibility as PortalDocument["visibility"]) ?? "members",
      filePath: String(row.file_path),
      createdAt: String(row.created_at),
    }),
  );
}

export async function getIntroductions(viewer: Viewer) {
  if (!isSupabaseConfigured()) return demoIntroductions;
  const supabase = await db();
  const { data, error } = await supabase
    .from("introductions")
    .select(
      "id, subject, message, status, created_at, requester_id, recipient_id, requester:profiles!introductions_requester_id_fkey(full_name, slug), recipient:profiles!introductions_recipient_id_fkey(full_name, slug)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Row[]).map((row): IntroductionItem => {
    const sent = row.requester_id === viewer.id;
    const counterpart = (sent ? row.recipient : row.requester) as Row | null;
    return {
      id: String(row.id),
      subject: String(row.subject),
      message: String(row.message ?? ""),
      status: String(row.status),
      direction: sent ? "sent" : "received",
      counterpart: String(counterpart?.full_name ?? "Member"),
      counterpartSlug: String(counterpart?.slug ?? ""),
      createdAt: String(row.created_at),
    };
  });
}

export async function getOwnProfile(viewer: Viewer) {
  if (!isSupabaseConfigured()) {
    return demoMembers[0];
  }
  return getMemberForViewer(viewer.slug);
}

export async function getAdminDesk() {
  if (!isSupabaseConfigured()) {
    return {
      members: [demoPendingMember, ...demoMembers],
      companies: demoCompanies.map((company) => ({
        id: company.id,
        slug: company.slug,
        name: company.name,
        status: company.status,
        visibility: company.visibility,
        is_featured: company.featured,
        industry: company.industry,
      })),
      opportunities: demoOpportunities.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        status: item.status,
        visibility: item.visibility,
        is_featured: item.featured,
        opportunity_type: item.type,
      })),
      events: demoEvents.map((event) => ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        series: event.series,
        status: event.status,
        visibility: event.visibility,
        starts_at: event.startsAt,
      })),
      registrations: demoPendingRegistrations,
      partners: demoPartners.map((partner) => ({
        id: partner.id,
        name: partner.name,
        tier: partner.tier,
        is_featured: partner.featured,
        is_active: true,
      })),
      posts: demoInsights.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        status: "published",
        visibility: post.visibility,
        is_featured: post.featured,
      })),
      inquiries: demoInquiries,
    };
  }

  const supabase = await db();
  const [members, companies, opportunities, events, registrations, partners, posts, inquiries] =
    await Promise.all([
      supabase.from("profiles").select(memberSelect).order("created_at", { ascending: false }),
      supabase.from("companies").select("id, slug, name, status, visibility, is_featured, industry").order("name"),
      supabase
        .from("opportunities")
        .select("id, slug, title, status, visibility, is_featured, opportunity_type")
        .order("created_at", { ascending: false }),
      supabase.from("events").select("id, slug, title, series, status, visibility, starts_at").order("starts_at"),
      supabase
        .from("event_registrations")
        .select("id, status, guest_name, guest_email, guest_company, guest_title, referral_source, events(title, slug)")
        .in("status", ["pending", "waitlisted"])
        .order("created_at", { ascending: false }),
      supabase.from("partners").select("id, name, tier, is_featured, is_active").order("sort_order"),
      supabase.from("posts").select("id, slug, title, status, visibility, is_featured").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("id, name, email, organization, interest, message, created_at").order("created_at", { ascending: false }),
    ]);

  const failed = [members, companies, opportunities, events, registrations, partners, posts, inquiries].find(
    (result) => result.error,
  );
  if (failed?.error) throw new Error(failed.error.message);

  return {
    members: ((members.data ?? []) as unknown as Row[]).map((row) => mapMember(row)),
    companies: (companies.data ?? []) as Array<{
      id: string;
      slug: string;
      name: string;
      status: string;
      visibility: string;
      is_featured: boolean;
      industry: string;
    }>,
    opportunities: (opportunities.data ?? []) as Array<{
      id: string;
      slug: string;
      title: string;
      status: string;
      visibility: string;
      is_featured: boolean;
      opportunity_type: string;
    }>,
    events: (events.data ?? []) as Array<{
      id: string;
      slug: string;
      title: string;
      series: string | null;
      status: string;
      visibility: string;
      starts_at: string;
    }>,
    registrations: ((registrations.data ?? []) as unknown as Row[]).map((row): RegistrationItem => {
      const event = (Array.isArray(row.events) ? row.events[0] : row.events) as Row | null;
      return {
        id: String(row.id),
        status: String(row.status),
        guestName: String(row.guest_name ?? ""),
        guestEmail: String(row.guest_email ?? ""),
        guestCompany: String(row.guest_company ?? ""),
        guestTitle: String(row.guest_title ?? ""),
        referralSource: String(row.referral_source ?? ""),
        eventTitle: String(event?.title ?? "Event"),
        eventSlug: String(event?.slug ?? ""),
      };
    }),
    partners: (partners.data ?? []) as Array<{
      id: string;
      name: string;
      tier: string;
      is_featured: boolean;
      is_active: boolean;
    }>,
    posts: (posts.data ?? []) as Array<{
      id: string;
      slug: string;
      title: string;
      status: string;
      visibility: string;
      is_featured: boolean;
    }>,
    inquiries: ((inquiries.data ?? []) as unknown as Row[]).map(
      (row): Inquiry => ({
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        organization: String(row.organization ?? ""),
        interest: String(row.interest ?? ""),
        message: String(row.message ?? ""),
        createdAt: String(row.created_at),
      }),
    ),
  };
}
