import type { OpportunityType, Visibility } from "@/lib/labels";

export type SocialLinks = {
  linkedin?: string;
  x?: string;
  instagram?: string;
  website?: string;
};

export type Metric = {
  id: string;
  label: string;
  value: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  year: number | null;
};

export type CompanyRef = {
  slug: string;
  name: string;
  role?: string;
};

export type PersonRef = {
  slug: string;
  name: string;
  role: string;
  title: string;
  founder: boolean;
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  description: string;
  industry: string;
  stage: string;
  services: string[];
  website: string | null;
  visibility: Visibility;
  status: string;
  featured: boolean;
  metrics: Metric[];
  achievements: Achievement[];
  people: PersonRef[];
  opportunities: Array<{
    slug: string;
    title: string;
    type: OpportunityType;
  }>;
};

export type Member = {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  city: string | null;
  expertise: string[];
  industries: string[];
  iHave: string;
  iNeed: string;
  socials: SocialLinks;
  featured: boolean;
  isPublic: boolean;
  membershipStatus: string;
  companies: CompanyRef[];
};

export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  type: OpportunityType;
  visibility: Visibility;
  status: string;
  location: string | null;
  deadline: string | null;
  featured: boolean;
  company: { slug: string; name: string } | null;
};

export type CollectiveEvent = {
  id: string;
  slug: string;
  series: string | null;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  capacity: number;
  inviteOnly: boolean;
  requiresApproval: boolean;
  visibility: Visibility;
  status: string;
  featured: boolean;
  sponsors: Array<{ id: string; name: string }>;
};

export type Partner = {
  id: string;
  name: string;
  description: string;
  website: string | null;
  tier: string;
  featured: boolean;
};

export type Insight = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string | null;
  featured: boolean;
  visibility: Visibility;
};

export type ResourceItem = {
  id: string;
  title: string;
  summary: string;
  url: string | null;
  category: string;
};

export type PortalDocument = {
  id: string;
  title: string;
  description: string;
  visibility: Visibility;
  filePath: string;
  createdAt: string;
};

export type IntroductionItem = {
  id: string;
  subject: string;
  message: string;
  status: string;
  direction: "sent" | "received";
  counterpart: string;
  counterpartSlug: string;
  createdAt: string;
};

export type RegistrationItem = {
  id: string;
  status: string;
  guestName: string;
  guestEmail: string;
  guestCompany: string;
  guestTitle: string;
  referralSource: string;
  eventTitle: string;
  eventSlug: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  organization: string;
  interest: string;
  message: string;
  createdAt: string;
};

export type Viewer = {
  id: string;
  email: string;
  fullName: string;
  slug: string;
  role: "member" | "admin";
  membershipStatus: "pending" | "approved" | "rejected" | "suspended";
  preview: boolean;
};

export type ActionState = {
  error?: string;
  message?: string;
};
