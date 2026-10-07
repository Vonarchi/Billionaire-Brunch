import type { MetadataRoute } from "next";
import {
  getPublicCompanies,
  getPublicEvents,
  getPublicInsights,
  getPublicMembers,
  getPublicOpportunities,
} from "@/lib/dal/catalog";
import { siteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const [companies, members, opportunities, events, insights] = await Promise.all([
    getPublicCompanies(),
    getPublicMembers(),
    getPublicOpportunities(),
    getPublicEvents(),
    getPublicInsights(),
  ]);

  const staticRoutes = ["", "/about", "/portfolio", "/members", "/opportunities", "/events", "/partners", "/insights", "/connect"];

  return [
    ...staticRoutes.map((path) => ({ url: `${origin}${path}` })),
    ...companies.map((item) => ({ url: `${origin}/portfolio/${item.slug}` })),
    ...members.map((item) => ({ url: `${origin}/members/${item.slug}` })),
    ...opportunities.map((item) => ({ url: `${origin}/opportunities/${item.slug}` })),
    ...events.map((item) => ({ url: `${origin}/events/${item.slug}` })),
    ...insights.map((item) => ({ url: `${origin}/insights/${item.slug}` })),
  ];
}
