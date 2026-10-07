import type { OpportunityType, Visibility } from "@/lib/labels";
import type {
  Achievement,
  CollectiveEvent,
  Company,
  Insight,
  Member,
  Metric,
  Opportunity,
  Partner,
  PersonRef,
  SocialLinks,
} from "@/lib/types";

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asRows(value: unknown): Row[] {
  if (Array.isArray(value)) return value as Row[];
  if (value && typeof value === "object") return [value as Row];
  return [];
}

function socials(value: unknown): SocialLinks {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  const read = (key: keyof SocialLinks) =>
    typeof record[key] === "string" ? (record[key] as string) : undefined;
  return {
    linkedin: read("linkedin"),
    x: read("x"),
    instagram: read("instagram"),
    website: read("website"),
  };
}

export function mapMetric(row: Row): Metric {
  return {
    id: text(row.id),
    label: text(row.label),
    value: text(row.value),
  };
}

export function mapAchievement(row: Row): Achievement {
  return {
    id: text(row.id),
    title: text(row.title),
    description: text(row.description),
    year: typeof row.year === "number" ? row.year : null,
  };
}

export function mapCompany(row: Row): Company {
  const people = asRows(row.company_members).flatMap((member): PersonRef[] => {
    const profile = asRows(member.profiles)[0];
    if (!profile) return [];
    return [
      {
        slug: text(profile.slug),
        name: text(profile.full_name),
        role: text(member.member_role),
        title: text(member.title),
        founder: Boolean(member.is_founder),
      },
    ];
  });

  const opportunities = asRows(row.opportunities)
    .filter((item) => item.status === "approved")
    .map((item) => ({
      slug: text(item.slug),
      title: text(item.title),
      type: text(item.opportunity_type, "other") as OpportunityType,
    }));

  return {
    id: text(row.id),
    slug: text(row.slug),
    name: text(row.name),
    logoUrl: text(row.logo_url) || null,
    description: text(row.description),
    industry: text(row.industry),
    stage: text(row.stage),
    services: list(row.services),
    website: text(row.website) || null,
    visibility: text(row.visibility, "members") as Visibility,
    status: text(row.status),
    featured: Boolean(row.is_featured),
    metrics: asRows(row.company_metrics)
      .map(mapMetric)
      .sort((a, b) => text(a.label).localeCompare(text(b.label))),
    achievements: asRows(row.achievements).map(mapAchievement),
    people,
    opportunities,
  };
}

export function mapMember(row: Row): Member {
  const companies = asRows(row.company_members).flatMap((member) => {
    const company = asRows(member.companies)[0];
    if (!company || company.status !== "approved") return [];
    return [
      {
        slug: text(company.slug),
        name: text(company.name),
        role: text(member.title) || text(member.member_role),
      },
    ];
  });

  return {
    id: text(row.id),
    slug: text(row.slug),
    fullName: text(row.full_name),
    title: text(row.title),
    bio: text(row.bio),
    photoUrl: text(row.photo_url) || null,
    city: text(row.city) || null,
    expertise: list(row.expertise),
    industries: list(row.industries),
    iHave: text(row.i_have),
    iNeed: text(row.i_need),
    socials: socials(row.social_links),
    featured: Boolean(row.is_featured),
    isPublic: Boolean(row.is_public),
    membershipStatus: text(row.membership_status),
    companies,
  };
}

export function mapOpportunity(row: Row): Opportunity {
  const company = asRows(row.companies)[0];
  return {
    id: text(row.id),
    slug: text(row.slug),
    title: text(row.title),
    summary: text(row.summary),
    description: text(row.description),
    type: text(row.opportunity_type, "other") as OpportunityType,
    visibility: text(row.visibility, "members") as Visibility,
    status: text(row.status),
    location: text(row.location) || null,
    deadline: text(row.deadline) || null,
    featured: Boolean(row.is_featured),
    company: company ? { slug: text(company.slug), name: text(company.name) } : null,
  };
}

export function mapEvent(row: Row): CollectiveEvent {
  const sponsors = asRows(row.event_sponsors).flatMap((item) => {
    const partner = asRows(item.partners)[0];
    if (!partner) return [];
    return [{ id: text(partner.id), name: text(partner.name) }];
  });

  return {
    id: text(row.id),
    slug: text(row.slug),
    series: text(row.series) || null,
    title: text(row.title),
    description: text(row.description),
    startsAt: text(row.starts_at),
    endsAt: text(row.ends_at) || null,
    location: text(row.location),
    capacity: typeof row.capacity === "number" ? row.capacity : 0,
    inviteOnly: Boolean(row.invite_only),
    requiresApproval: Boolean(row.requires_approval),
    visibility: text(row.visibility, "members") as Visibility,
    status: text(row.status),
    featured: Boolean(row.is_featured),
    sponsors,
  };
}

export function mapPartner(row: Row): Partner {
  return {
    id: text(row.id),
    name: text(row.name),
    description: text(row.description),
    website: text(row.website) || null,
    tier: text(row.tier),
    featured: Boolean(row.is_featured),
  };
}

export function mapInsight(row: Row): Insight {
  return {
    id: text(row.id),
    slug: text(row.slug),
    title: text(row.title),
    excerpt: text(row.excerpt),
    body: text(row.body),
    publishedAt: text(row.published_at) || null,
    featured: Boolean(row.is_featured),
    visibility: text(row.visibility, "public") as Visibility,
  };
}

export const companySelect = `
  id, slug, name, logo_url, description, industry, stage, services, website,
  visibility, status, is_featured,
  company_metrics (id, label, value, sort_order),
  achievements (id, title, description, year, sort_order),
  company_members (
    member_role, title, is_founder,
    profiles (slug, full_name, title)
  ),
  opportunities (slug, title, opportunity_type, status)
`;

export const memberSelect = `
  id, slug, full_name, title, bio, photo_url, city, expertise, industries,
  i_have, i_need, social_links, is_featured, is_public, membership_status,
  company_members (
    member_role, title,
    companies (slug, name, status, visibility)
  )
`;

export const opportunitySelect = `
  id, slug, title, summary, description, opportunity_type, visibility, status,
  location, deadline, is_featured,
  companies (slug, name)
`;

export const eventSelect = `
  id, slug, series, title, description, starts_at, ends_at, location, capacity,
  invite_only, requires_approval, visibility, status, is_featured,
  event_sponsors (partners (id, name))
`;
